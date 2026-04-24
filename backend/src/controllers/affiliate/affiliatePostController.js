const slugify = require('slugify');
const pool = require('../../config/db');
const {
  assertAndLogSupgadUrl,
  getLatestUserPlanLinkPermission,
} = require('../../services/linkValidationService');

const QUALITY_START_WORD_THRESHOLD = 100;
const FIELD_PASS_SCORE = 60;
const OVERALL_PASS_SCORE = 75;
const HIGH_SIMILARITY_LIMIT = 85;

const GENERIC_PHRASES = [
  'in today\'s world',
  'in today\'s fast-paced world',
  'it is important to note',
  'when it comes to',
  'one of the best',
  'game changer',
  'unlock the power',
  'whether you are',
  'this product is designed to',
  'take your journey to the next level',
  'helps support your overall wellness',
  'can help improve your lifestyle',
  'it should be noted that',
  'there are many reasons why',
  'without further ado',
];

function sanitizePost(row) {
  if (!row) return null;

  return {
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    website_id: row.website_id,
    category_id: row.category_id,
    template_id: row.template_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    featured_image: row.featured_image,
    media_id: row.media_id,
    status: row.status,
    review_status: row.review_status || 'not_checked',
    quality_score: Number(row.quality_score || 0),
    risk_score: Number(row.risk_score || 0),
    similarity_score: Number(row.similarity_score || 0),
    similarity_source_post_id: row.similarity_source_post_id || null,
    total_words: Number(row.total_words || 0),
    quality_checks_started: !!row.quality_checks_started,
    last_quality_checked_at: row.last_quality_checked_at,
    quality_blocked_reason: row.quality_blocked_reason,
    admin_review_notes: row.admin_review_notes,
    writer_revision_required: !!row.writer_revision_required,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    product_title: row.product_title,
    product_slug: row.product_slug,
    website_name: row.website_name,
    website_slug: row.website_slug,
    category_name: row.category_name,
    category_slug: row.category_slug,
    template_name: row.template_name,
    template_slug: row.template_slug,
  };
}

function makeSlug(value) {
  return slugify(String(value || '').trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeFieldValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value.trim();
  return JSON.stringify(value);
}

function isLikelyLinkField(field = {}) {
  const fieldType = String(field.field_type || field.type || '').trim().toLowerCase();
  const fieldKey = normalizeNullable(field.field_key || field.key) || 'field';
  const normalizedKey = fieldKey.toLowerCase();

  if (fieldType === 'url') return true;

  return (
    normalizedKey === 'url' ||
    normalizedKey === 'link_url' ||
    normalizedKey === 'destination_url' ||
    normalizedKey.endsWith('_url') ||
    normalizedKey.endsWith('_link_url') ||
    normalizedKey.endsWith('_destination_url')
  );
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(value) {
  const text = normalizeText(value);
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

function tokenize(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token.length > 1);
}

function buildNgrams(tokens, size = 3) {
  const grams = [];
  for (let index = 0; index <= tokens.length - size; index += 1) {
    grams.push(tokens.slice(index, index + size).join(' '));
  }
  return grams;
}

function getRepetitionHits(value) {
  const tokens = tokenize(value);
  if (tokens.length < 6) return 0;
  const grams = buildNgrams(tokens, 3);
  const counts = new Map();

  grams.forEach((gram) => {
    counts.set(gram, (counts.get(gram) || 0) + 1);
  });

  let hits = 0;
  counts.forEach((count) => {
    if (count > 1) hits += count - 1;
  });

  return hits;
}

function getGenericPhraseHits(value) {
  const text = normalizeText(value).toLowerCase();
  return GENERIC_PHRASES.reduce((total, phrase) => {
    return total + (text.includes(phrase) ? 1 : 0);
  }, 0);
}

function getSpecificityHits(value, productTitle = '') {
  const text = normalizeText(value);
  if (!text) return 0;

  const lower = text.toLowerCase();
  const productTokens = tokenize(productTitle);
  let hits = 0;

  if (/\d/.test(text)) hits += 1;
  if (/%|\$|₦|£|€/.test(text)) hits += 1;
  if (/:/.test(text)) hits += 1;
  if (/\bfor example\b|\bsuch as\b|\bfor instance\b|\bespecially\b/i.test(text)) hits += 1;
  if (/[A-Z][a-z]+/.test(text.replace(/^[A-Z]/, ''))) hits += 1;

  productTokens.forEach((token) => {
    if (token.length > 2 && lower.includes(token)) hits += 1;
  });

  return hits;
}

function getJaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));

  if (!setA.size || !setB.size) return 0;

  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) intersection += 1;
  });

  const union = new Set([...setA, ...setB]).size;
  if (!union) return 0;

  return (intersection / union) * 100;
}

function getFieldTypeWeight(fieldKey = '', fieldType = '') {
  const key = String(fieldKey || '').toLowerCase();
  const type = String(fieldType || '').toLowerCase();

  if (type === 'image') return 'media';
  if (key.includes('title') || key.includes('question')) return 'title';
  if (key.includes('intro') || key.includes('paragraph') || key.includes('learn_more')) return 'long_text';
  if (key.includes('faq') && key.includes('answer')) return 'answer';
  if (key.includes('benefit') || key.includes('difference') || key.includes('guarantee')) return 'support';
  return 'text';
}

function buildWarningMessage({
  similarityScore,
  repetitionHits,
  genericPhraseHits,
  specificityHits,
  fieldLabel,
}) {
  const name = fieldLabel || 'This section';

  if (similarityScore >= HIGH_SIMILARITY_LIMIT) {
    return {
      code: 'similar_previous_post',
      message: `${name} is too similar to one of your previous posts`,
      suggestion: 'Rewrite this section with a fresh angle and more original details',
    };
  }

  if (genericPhraseHits > 0) {
    return {
      code: 'too_generic',
      message: `${name} appears too generic`,
      suggestion: 'Add more specific details, product context, or a real example',
    };
  }

  if (repetitionHits > 1) {
    return {
      code: 'too_repetitive',
      message: `${name} repeats too many phrase patterns`,
      suggestion: 'Vary your sentence structure and remove repeated wording',
    };
  }

  if (specificityHits < 1) {
    return {
      code: 'low_specificity',
      message: `${name} needs more original detail`,
      suggestion: 'Add a concrete example, exact detail, or product-specific point',
    };
  }

  return {
    code: null,
    message: '',
    suggestion: '',
  };
}

function calculateFieldScores({
  field,
  fieldValue,
  productTitle,
  similarityScore,
  repetitionHits,
  genericPhraseHits,
  specificityHits,
  qualityChecksStarted,
}) {
  const fieldLabel = field.meta?.label || field.field_key || 'Field';
  const fieldTypeWeight = getFieldTypeWeight(field.field_key, field.field_type);
  const wordCount = countWords(fieldValue);

  if (String(field.field_type || '').toLowerCase() === 'image') {
    return {
      field_key: field.field_key,
      field_label: fieldLabel,
      section_name: field.meta?.section || null,
      field_type: field.field_type,
      word_count: 0,
      quality_score: 100,
      risk_score: 0,
      similarity_score: 0,
      passed: 1,
      checks_started: qualityChecksStarted ? 1 : 0,
      warning_code: null,
      warning_message: null,
      repetition_hits: 0,
      generic_phrase_hits: 0,
      specificity_hits: 0,
    };
  }

  if (!qualityChecksStarted) {
    return {
      field_key: field.field_key,
      field_label: fieldLabel,
      section_name: field.meta?.section || null,
      field_type: field.field_type,
      word_count: wordCount,
      quality_score: 0,
      risk_score: 0,
      similarity_score: 0,
      passed: 1,
      checks_started: 0,
      warning_code: null,
      warning_message: null,
      repetition_hits: 0,
      generic_phrase_hits: 0,
      specificity_hits: 0,
    };
  }

  let qualityScore = 100;
  let riskScore = 0;

  qualityScore -= similarityScore * 0.55;
  qualityScore -= repetitionHits * 6;
  qualityScore -= genericPhraseHits * 10;
  qualityScore += Math.min(specificityHits * 4, 20);

  riskScore += similarityScore * 0.7;
  riskScore += repetitionHits * 8;
  riskScore += genericPhraseHits * 12;
  riskScore -= Math.min(specificityHits * 3, 18);

  if (fieldTypeWeight === 'long_text' || fieldTypeWeight === 'answer') {
    if (wordCount < 25) qualityScore -= 12;
    if (specificityHits < 1) qualityScore -= 8;
  }

  if (fieldTypeWeight === 'title') {
    if (genericPhraseHits > 0) qualityScore -= 8;
  }

  if (normalizeText(fieldValue).toLowerCase().includes(normalizeText(productTitle).toLowerCase())) {
    qualityScore += 4;
  }

  qualityScore = Math.max(0, Math.min(100, Number(qualityScore.toFixed(2))));
  riskScore = Math.max(0, Math.min(100, Number(riskScore.toFixed(2))));

  const warning = buildWarningMessage({
    similarityScore,
    repetitionHits,
    genericPhraseHits,
    specificityHits,
    fieldLabel,
  });

  const passed = qualityScore >= FIELD_PASS_SCORE && similarityScore < HIGH_SIMILARITY_LIMIT;

  return {
    field_key: field.field_key,
    field_label: fieldLabel,
    section_name: field.meta?.section || null,
    field_type: field.field_type,
    word_count: wordCount,
    quality_score: qualityScore,
    risk_score: riskScore,
    similarity_score: Number(similarityScore.toFixed(2)),
    passed: passed ? 1 : 0,
    checks_started: 1,
    warning_code: warning.code,
    warning_message: warning.message || null,
    warning_suggestion: warning.suggestion || null,
    repetition_hits: repetitionHits,
    generic_phrase_hits: genericPhraseHits,
    specificity_hits: specificityHits,
  };
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
    SELECT id, user_id, website_name, slug, status
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getOwnedProduct(productId, userId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.website_id,
      p.category_id,
      p.title,
      p.slug,
      p.status
    FROM products p
    WHERE p.id = ?
      AND p.user_id = ?
    LIMIT 1
    `,
    [productId, userId]
  );

  return rows[0] || null;
}

async function getCategoryById(categoryId) {
  if (!categoryId) return null;

  const [rows] = await pool.query(
    `
    SELECT id, name, slug, status
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [categoryId]
  );

  return rows[0] || null;
}

async function getBlogTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT id, name, slug, status, is_premium
    FROM blog_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function getLatestSubscriptionPlanByUserId(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      s.id AS subscription_id,
      s.user_id,
      s.plan_id,
      s.status AS subscription_status,
      p.name AS plan_name,
      p.premium_templates_only,
      p.blog_templates_mode,
      p.allow_external_links
    FROM affiliate_subscriptions s
    INNER JOIN subscription_plans p
      ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function resolveUserLinkPermission(userId) {
  const latestPlan = await getLatestSubscriptionPlanByUserId(userId);

  if (latestPlan) {
    return {
      allow_external_links: !!latestPlan.allow_external_links,
      source: 'subscription_plan',
    };
  }

  const fallback = await getLatestUserPlanLinkPermission(userId);

  return {
    allow_external_links: !!fallback?.allow_external_links,
    source: 'link_validation_service',
  };
}

async function getAllowedBlogTemplateIdsByPlanId(planId) {
  if (!planId) return [];

  const [rows] = await pool.query(
    `
    SELECT blog_template_id
    FROM plan_allowed_blog_templates
    WHERE plan_id = ?
    ORDER BY id ASC
    `,
    [planId]
  );

  return rows
    .map((row) => Number(row.blog_template_id))
    .filter((value) => Number.isInteger(value) && value > 0);
}

async function canUserUseBlogTemplate({ userId, templateId }) {
  const template = await getBlogTemplateById(templateId);

  if (!template || template.status !== 'active') {
    return {
      ok: false,
      message: 'Selected template is invalid or inactive',
    };
  }

  const latestPlan = await getLatestSubscriptionPlanByUserId(userId);

  if (!latestPlan) {
    if (template.is_premium) {
      return {
        ok: false,
        message: 'Start a subscription plan before using this premium blog template',
      };
    }

    return {
      ok: true,
      template,
      plan: null,
    };
  }

  if (!latestPlan.premium_templates_only && template.is_premium) {
    return {
      ok: false,
      message: 'Your current plan does not allow premium blog templates',
    };
  }

  if (String(latestPlan.blog_templates_mode || 'unlimited').toLowerCase() === 'specific') {
    const allowedTemplateIds = await getAllowedBlogTemplateIdsByPlanId(latestPlan.plan_id);

    if (!allowedTemplateIds.includes(Number(templateId))) {
      return {
        ok: false,
        message: 'This blog template is not included in your current plan',
      };
    }
  }

  return {
    ok: true,
    template,
    plan: latestPlan,
  };
}

async function ensureUniquePostSlug(baseSlug, websiteId, currentPostId = null) {
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const params = [websiteId, candidate];
    let sql = `
      SELECT id
      FROM product_posts
      WHERE website_id = ?
        AND slug = ?
    `;

    if (currentPostId) {
      sql += ` AND id <> ?`;
      params.push(currentPostId);
    }

    sql += ` LIMIT 1`;

    const [rows] = await pool.query(sql, params);

    if (!rows.length) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function getOwnedPostById(postId, userId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.product_id,
      pp.user_id,
      pp.website_id,
      pp.category_id,
      pp.template_id,
      pp.title,
      pp.slug,
      pp.excerpt,
      pp.seo_title,
      pp.seo_description,
      pp.featured_image,
      pp.media_id,
      pp.status,
      pp.review_status,
      pp.quality_score,
      pp.risk_score,
      pp.similarity_score,
      pp.similarity_source_post_id,
      pp.total_words,
      pp.quality_checks_started,
      pp.last_quality_checked_at,
      pp.quality_blocked_reason,
      pp.admin_review_notes,
      pp.writer_revision_required,
      pp.published_at,
      pp.created_at,
      pp.updated_at,
      p.title AS product_title,
      p.slug AS product_slug,
      w.website_name,
      w.slug AS website_slug,
      c.name AS category_name,
      c.slug AS category_slug,
      bt.name AS template_name,
      bt.slug AS template_slug
    FROM product_posts pp
    INNER JOIN products p ON p.id = pp.product_id
    INNER JOIN affiliate_websites w ON w.id = pp.website_id
    LEFT JOIN categories c ON c.id = pp.category_id
    INNER JOIN blog_templates bt ON bt.id = pp.template_id
    WHERE pp.id = ?
      AND pp.user_id = ?
    LIMIT 1
    `,
    [postId, userId]
  );

  return rows[0] || null;
}

async function getTemplateFields(postId) {
  const [rows] = await pool.query(
    `
    SELECT id, field_key, field_type, field_value, sort_order, created_at, updated_at
    FROM post_template_fields
    WHERE post_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [postId]
  );

  return rows;
}

async function getPostCtaButtons(postId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      button_key,
      button_label,
      button_url,
      button_style,
      open_in_new_tab,
      sort_order,
      created_at,
      updated_at
    FROM post_cta_buttons
    WHERE post_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [postId]
  );

  return rows.map((row) => ({
    id: row.id,
    button_key: row.button_key,
    button_label: row.button_label,
    button_url: row.button_url,
    button_style: row.button_style,
    open_in_new_tab: !!row.open_in_new_tab,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function getQualityFieldScores(postId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        post_id,
        post_template_field_id,
        field_key,
        field_label,
        section_name,
        field_type,
        word_count,
        quality_score,
        risk_score,
        similarity_score,
        passed,
        checks_started,
        warning_code,
        warning_message,
        repetition_hits,
        generic_phrase_hits,
        specificity_hits,
        compared_post_id,
        compared_field_key,
        created_at,
        updated_at
      FROM post_quality_field_scores
      WHERE post_id = ?
      ORDER BY id ASC
      `,
      [postId]
    );

    return rows.map((row) => ({
      ...row,
      passed: !!row.passed,
      checks_started: !!row.checks_started,
      quality_score: Number(row.quality_score || 0),
      risk_score: Number(row.risk_score || 0),
      similarity_score: Number(row.similarity_score || 0),
    }));
  } catch (error) {
    return [];
  }
}

async function getQualityWarnings(postId) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        post_id,
        post_template_field_id,
        field_key,
        warning_type,
        severity,
        message,
        suggestion,
        compared_post_id,
        compared_field_key,
        similarity_score,
        is_active,
        created_at,
        updated_at
      FROM post_quality_warnings
      WHERE post_id = ?
        AND is_active = 1
      ORDER BY id ASC
      `,
      [postId]
    );

    return rows.map((row) => ({
      ...row,
      is_active: !!row.is_active,
      similarity_score: Number(row.similarity_score || 0),
    }));
  } catch (error) {
    return [];
  }
}

async function normalizeTemplateFieldsWithValidatedLinks({
  fields = [],
  userId,
  websiteId,
  postId = null,
  allowExternalLinks = false,
}) {
  const normalizedFields = [];

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index] || {};
    const nextField = { ...field };

    if (isLikelyLinkField(field)) {
      const fieldKey = normalizeNullable(field.field_key || field.key) || 'field';
      const rawValue = normalizeNullable(field.field_value ?? field.value);

      if (rawValue) {
        const result = await assertAndLogSupgadUrl({
          value: rawValue,
          fieldName: `Template field (${fieldKey})`,
          required: true,
          allowEmpty: false,
          userId,
          websiteId,
          sourceType: 'template_field',
          sourceId: postId,
          allowExternalLinks,
        });

        if (field.field_value !== undefined) {
          nextField.field_value = result.normalized_url || result.submitted_link;
        } else {
          nextField.value = result.normalized_url || result.submitted_link;
        }
      }
    }

    normalizedFields.push(nextField);
  }

  return normalizedFields;
}

async function replaceTemplateFields(postId, fields = []) {
  await pool.query(`DELETE FROM post_template_fields WHERE post_id = ?`, [postId]);

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const fieldKey = normalizeNullable(field.field_key || field.key);
    const fieldType = normalizeNullable(field.field_type || field.type) || 'text';
    const fieldValue = normalizeFieldValue(field.field_value ?? field.value);
    const sortOrder =
      Number.isInteger(Number(field.sort_order)) ? Number(field.sort_order) : index + 1;

    if (!fieldKey) continue;

    await pool.query(
      `
      INSERT INTO post_template_fields
      (post_id, field_key, field_type, field_value, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [postId, fieldKey, fieldType, fieldValue, sortOrder]
    );
  }
}

async function replacePostCtaButtons({
  postId,
  buttons = [],
  userId,
  websiteId,
  allowExternalLinks = false,
}) {
  await pool.query(`DELETE FROM post_cta_buttons WHERE post_id = ?`, [postId]);

  for (let index = 0; index < buttons.length; index += 1) {
    const button = buttons[index];
    const buttonKey = normalizeNullable(button.button_key || button.key) || `button_${index + 1}`;
    const buttonLabel = normalizeNullable(button.button_label || button.label);
    const buttonStyle = normalizeNullable(button.button_style || button.style);
    const buttonUrl = normalizeNullable(button.button_url || button.url);
    const openInNewTab = button.open_in_new_tab ? 1 : 0;
    const sortOrder =
      Number.isInteger(Number(button.sort_order)) ? Number(button.sort_order) : index + 1;

    if (!buttonLabel) continue;

    let validatedUrl = null;

    if (buttonUrl) {
      const result = await assertAndLogSupgadUrl({
        value: buttonUrl,
        fieldName: `CTA Button URL (${buttonLabel})`,
        required: true,
        allowEmpty: false,
        userId,
        websiteId,
        sourceType: 'cta_button',
        sourceId: postId,
        allowExternalLinks,
      });

      validatedUrl = result.normalized_url || result.submitted_link;
    }

    await pool.query(
      `
      INSERT INTO post_cta_buttons
      (
        post_id,
        button_key,
        button_label,
        button_url,
        button_style,
        open_in_new_tab,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [postId, buttonKey, buttonLabel, validatedUrl, buttonStyle, openInNewTab, sortOrder]
    );
  }
}

async function getPreviousPostFieldCandidates(userId, currentPostId, fieldKey) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id AS post_id,
      pp.title AS post_title,
      ptf.field_key,
      ptf.field_value
    FROM product_posts pp
    INNER JOIN post_template_fields ptf
      ON ptf.post_id = pp.id
    WHERE pp.user_id = ?
      AND pp.id <> ?
      AND ptf.field_key = ?
      AND ptf.field_value IS NOT NULL
      AND TRIM(ptf.field_value) <> ''
    ORDER BY pp.id DESC
    LIMIT 25
    `,
    [userId, currentPostId, fieldKey]
  );

  return rows;
}

async function getPreviousPostOverallCandidates(userId, currentPostId) {
  const [rows] = await pool.query(
    `
    SELECT
      pp.id,
      pp.title,
      GROUP_CONCAT(COALESCE(ptf.field_value, '') ORDER BY ptf.sort_order ASC SEPARATOR ' ') AS combined_text
    FROM product_posts pp
    LEFT JOIN post_template_fields ptf
      ON ptf.post_id = pp.id
    WHERE pp.user_id = ?
      AND pp.id <> ?
    GROUP BY pp.id, pp.title
    ORDER BY pp.id DESC
    LIMIT 25
    `,
    [userId, currentPostId]
  );

  return rows;
}

async function clearPostQualityArtifacts(postId) {
  await pool.query(`DELETE FROM post_quality_field_scores WHERE post_id = ?`, [postId]);
  await pool.query(`DELETE FROM post_quality_warnings WHERE post_id = ?`, [postId]);
  await pool.query(`DELETE FROM post_similarity_checks WHERE post_id = ?`, [postId]);
}

async function insertReviewLog({
  postId,
  reviewerUserId = null,
  actionType,
  fromStatus = null,
  toStatus = null,
  note = null,
}) {
  try {
    await pool.query(
      `
      INSERT INTO post_review_logs
      (post_id, reviewer_user_id, action_type, from_status, to_status, note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [postId, reviewerUserId, actionType, fromStatus, toStatus, note]
    );
  } catch (error) {
    // keep silent so content flow does not break
  }
}

async function runPostQualityReview({
  postId,
  userId,
  productTitle,
}) {
  const fields = await getTemplateFields(postId);
  const textFields = fields.filter((field) => {
    const type = String(field.field_type || '').toLowerCase();
    return type === 'text' || type === 'textarea';
  });

  const totalWords = textFields.reduce((total, field) => {
    return total + countWords(field.field_value);
  }, 0);

  const qualityChecksStarted = totalWords >= QUALITY_START_WORD_THRESHOLD;

  await clearPostQualityArtifacts(postId);

  const overallCandidates = await getPreviousPostOverallCandidates(userId, postId);
  const combinedCurrentText = textFields.map((field) => field.field_value || '').join(' ');

  let bestOverallSimilarity = 0;
  let bestOverallSourcePostId = null;

  for (let index = 0; index < overallCandidates.length; index += 1) {
    const candidate = overallCandidates[index];
    const score = getJaccardSimilarity(combinedCurrentText, candidate.combined_text || '');

    if (score > bestOverallSimilarity) {
      bestOverallSimilarity = score;
      bestOverallSourcePostId = candidate.id;
    }
  }

  const fieldResults = [];
  const warningRows = [];
  const similarityRows = [];

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const fieldValue = field.field_value || '';

    let similarityScore = 0;
    let comparedPostId = null;
    let comparedFieldKey = null;

    if (qualityChecksStarted && ['text', 'textarea'].includes(String(field.field_type || '').toLowerCase())) {
      const previousFieldCandidates = await getPreviousPostFieldCandidates(userId, postId, field.field_key);

      previousFieldCandidates.forEach((candidate) => {
        const score = getJaccardSimilarity(fieldValue, candidate.field_value || '');

        if (score > similarityScore) {
          similarityScore = score;
          comparedPostId = candidate.post_id;
          comparedFieldKey = candidate.field_key;
        }
      });
    }

    const repetitionHits = getRepetitionHits(fieldValue);
    const genericPhraseHits = getGenericPhraseHits(fieldValue);
    const specificityHits = getSpecificityHits(fieldValue, productTitle);

    const scoreRow = calculateFieldScores({
      field,
      fieldValue,
      productTitle,
      similarityScore,
      repetitionHits,
      genericPhraseHits,
      specificityHits,
      qualityChecksStarted,
    });

    fieldResults.push({
      ...scoreRow,
      post_template_field_id: field.id || null,
      compared_post_id: comparedPostId,
      compared_field_key: comparedFieldKey,
    });

    if (qualityChecksStarted && comparedPostId && similarityScore > 0) {
      similarityRows.push({
        post_id: postId,
        compared_post_id: comparedPostId,
        same_user: 1,
        compared_scope: 'field',
        source_field_key: field.field_key,
        compared_field_key: comparedFieldKey,
        similarity_score: Number(similarityScore.toFixed(2)),
        matched_excerpt: normalizeText(fieldValue).slice(0, 500),
        message:
          similarityScore >= HIGH_SIMILARITY_LIMIT
            ? `${field.meta?.label || field.field_key} is too similar to a previous post`
            : `${field.meta?.label || field.field_key} shows similarity to a previous post`,
      });
    }

    if (scoreRow.warning_code) {
      warningRows.push({
        post_id: postId,
        post_template_field_id: field.id || null,
        field_key: field.field_key,
        warning_type: scoreRow.warning_code,
        severity:
          scoreRow.warning_code === 'similar_previous_post'
            ? 'high'
            : scoreRow.warning_code === 'too_generic'
            ? 'medium'
            : 'medium',
        message: scoreRow.warning_message,
        suggestion: scoreRow.warning_suggestion,
        compared_post_id: comparedPostId,
        compared_field_key: comparedFieldKey,
        similarity_score: Number(similarityScore.toFixed(2)),
      });
    }
  }

  if (qualityChecksStarted && bestOverallSourcePostId && bestOverallSimilarity > 0) {
    similarityRows.push({
      post_id: postId,
      compared_post_id: bestOverallSourcePostId,
      same_user: 1,
      compared_scope: 'overall',
      source_field_key: null,
      compared_field_key: null,
      similarity_score: Number(bestOverallSimilarity.toFixed(2)),
      matched_excerpt: normalizeText(combinedCurrentText).slice(0, 500),
      message:
        bestOverallSimilarity >= HIGH_SIMILARITY_LIMIT
          ? 'This post is too similar to one of your previous posts'
          : 'This post has overlap with one of your previous posts',
    });
  }

  for (let index = 0; index < fieldResults.length; index += 1) {
    const row = fieldResults[index];

    await pool.query(
      `
      INSERT INTO post_quality_field_scores
      (
        post_id,
        post_template_field_id,
        field_key,
        field_label,
        section_name,
        field_type,
        word_count,
        quality_score,
        risk_score,
        similarity_score,
        passed,
        checks_started,
        warning_code,
        warning_message,
        repetition_hits,
        generic_phrase_hits,
        specificity_hits,
        compared_post_id,
        compared_field_key,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        postId,
        row.post_template_field_id,
        row.field_key,
        row.field_label,
        row.section_name,
        row.field_type,
        row.word_count,
        row.quality_score,
        row.risk_score,
        row.similarity_score,
        row.passed,
        row.checks_started,
        row.warning_code,
        row.warning_message,
        row.repetition_hits,
        row.generic_phrase_hits,
        row.specificity_hits,
        row.compared_post_id,
        row.compared_field_key,
      ]
    );
  }

  for (let index = 0; index < warningRows.length; index += 1) {
    const row = warningRows[index];

    await pool.query(
      `
      INSERT INTO post_quality_warnings
      (
        post_id,
        post_template_field_id,
        field_key,
        warning_type,
        severity,
        message,
        suggestion,
        compared_post_id,
        compared_field_key,
        similarity_score,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `,
      [
        row.post_id,
        row.post_template_field_id,
        row.field_key,
        row.warning_type,
        row.severity,
        row.message,
        row.suggestion,
        row.compared_post_id,
        row.compared_field_key,
        row.similarity_score,
      ]
    );
  }

  for (let index = 0; index < similarityRows.length; index += 1) {
    const row = similarityRows[index];

    await pool.query(
      `
      INSERT INTO post_similarity_checks
      (
        post_id,
        compared_post_id,
        same_user,
        compared_scope,
        source_field_key,
        compared_field_key,
        similarity_score,
        matched_excerpt,
        message,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        row.post_id,
        row.compared_post_id,
        row.same_user,
        row.compared_scope,
        row.source_field_key,
        row.compared_field_key,
        row.similarity_score,
        row.matched_excerpt,
        row.message,
      ]
    );
  }

  const checkedFieldRows = fieldResults.filter((row) => row.checks_started);
  const averageQuality =
    checkedFieldRows.length > 0
      ? checkedFieldRows.reduce((sum, row) => sum + Number(row.quality_score || 0), 0) /
        checkedFieldRows.length
      : 0;

  const averageRisk =
    checkedFieldRows.length > 0
      ? checkedFieldRows.reduce((sum, row) => sum + Number(row.risk_score || 0), 0) /
        checkedFieldRows.length
      : 0;

  const failedFields = checkedFieldRows.filter((row) => !row.passed);
  const blocked = qualityChecksStarted
    ? averageQuality < OVERALL_PASS_SCORE ||
      bestOverallSimilarity >= HIGH_SIMILARITY_LIMIT ||
      failedFields.length > 0
    : false;

  let blockedReason = null;
  if (blocked) {
    if (bestOverallSimilarity >= HIGH_SIMILARITY_LIMIT) {
      blockedReason = 'This post is too similar to one of your previous posts';
    } else if (failedFields.length > 0) {
      blockedReason = failedFields[0].warning_message || 'Some sections need rewriting';
    } else {
      blockedReason = 'This post needs more work before publishing';
    }
  }

  const reviewStatus = !qualityChecksStarted
    ? 'draft'
    : blocked
    ? 'needs_revision'
    : 'approved';

  await pool.query(
    `
    UPDATE product_posts
    SET
      quality_score = ?,
      risk_score = ?,
      similarity_score = ?,
      similarity_source_post_id = ?,
      total_words = ?,
      quality_checks_started = ?,
      last_quality_checked_at = NOW(),
      quality_blocked_reason = ?,
      review_status = ?,
      writer_revision_required = ?
    WHERE id = ?
    `,
    [
      Number(averageQuality.toFixed(2)),
      Number(averageRisk.toFixed(2)),
      Number(bestOverallSimilarity.toFixed(2)),
      bestOverallSourcePostId,
      totalWords,
      qualityChecksStarted ? 1 : 0,
      blockedReason,
      reviewStatus,
      blocked ? 1 : 0,
      postId,
    ]
  );

  await insertReviewLog({
    postId,
    actionType: blocked ? 'submit_blocked' : 'auto_check',
    fromStatus: null,
    toStatus: reviewStatus,
    note: blockedReason,
  });

  return {
    checks_started: qualityChecksStarted,
    total_words: totalWords,
    quality_score: Number(averageQuality.toFixed(2)),
    risk_score: Number(averageRisk.toFixed(2)),
    similarity_score: Number(bestOverallSimilarity.toFixed(2)),
    similarity_source_post_id: bestOverallSourcePostId,
    review_status: reviewStatus,
    blocked,
    blocked_reason: blockedReason,
    failed_fields: failedFields.map((row) => ({
      field_key: row.field_key,
      field_label: row.field_label,
      warning_code: row.warning_code,
      warning_message: row.warning_message,
      quality_score: row.quality_score,
      similarity_score: row.similarity_score,
    })),
  };
}

async function enforcePublishGate({ postId, userId, productTitle }) {
  const quality = await runPostQualityReview({
    postId,
    userId,
    productTitle,
  });

  if (quality.blocked) {
    await pool.query(
      `
      UPDATE product_posts
      SET
        status = 'draft',
        published_at = NULL,
        updated_at = NOW()
      WHERE id = ?
      `,
      [postId]
    );

    return {
      ok: false,
      quality,
      message: quality.blocked_reason || 'Fix the highlighted sections before publishing',
    };
  }

  await pool.query(
    `
    UPDATE product_posts
    SET
      status = 'published',
      published_at = COALESCE(published_at, NOW()),
      updated_at = NOW()
    WHERE id = ?
    `,
    [postId]
  );

  return {
    ok: true,
    quality,
  };
}

async function buildFullPostResponse(postId, userId) {
  const post = await getOwnedPostById(postId, userId);

  if (!post) return null;

  const fields = await getTemplateFields(postId);
  const ctaButtons = await getPostCtaButtons(postId);
  const fieldScores = await getQualityFieldScores(postId);
  const qualityWarnings = await getQualityWarnings(postId);

  return {
    ...sanitizePost(post),
    template_fields: fields,
    cta_buttons: ctaButtons,
    quality_review: {
      review_status: post.review_status || 'not_checked',
      quality_score: Number(post.quality_score || 0),
      risk_score: Number(post.risk_score || 0),
      similarity_score: Number(post.similarity_score || 0),
      similarity_source_post_id: post.similarity_source_post_id || null,
      total_words: Number(post.total_words || 0),
      checks_started: !!post.quality_checks_started,
      blocked_reason: post.quality_blocked_reason || null,
      field_scores: fieldScores,
      warnings: qualityWarnings,
    },
  };
}

async function getMyPosts(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        pp.id,
        pp.product_id,
        pp.user_id,
        pp.website_id,
        pp.category_id,
        pp.template_id,
        pp.title,
        pp.slug,
        pp.excerpt,
        pp.seo_title,
        pp.seo_description,
        pp.featured_image,
        pp.media_id,
        pp.status,
        pp.review_status,
        pp.quality_score,
        pp.risk_score,
        pp.similarity_score,
        pp.similarity_source_post_id,
        pp.total_words,
        pp.quality_checks_started,
        pp.last_quality_checked_at,
        pp.quality_blocked_reason,
        pp.admin_review_notes,
        pp.writer_revision_required,
        pp.published_at,
        pp.created_at,
        pp.updated_at,
        p.title AS product_title,
        p.slug AS product_slug,
        w.website_name,
        w.slug AS website_slug,
        c.name AS category_name,
        c.slug AS category_slug,
        bt.name AS template_name,
        bt.slug AS template_slug
      FROM product_posts pp
      INNER JOIN products p ON p.id = pp.product_id
      INNER JOIN affiliate_websites w ON w.id = pp.website_id
      LEFT JOIN categories c ON c.id = pp.category_id
      INNER JOIN blog_templates bt ON bt.id = pp.template_id
      WHERE pp.user_id = ?
      ORDER BY pp.id DESC
      `,
      [userId]
    );

    return res.status(200).json({
      ok: true,
      posts: rows.map(sanitizePost),
    });
  } catch (error) {
    console.error('getMyPosts error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
}

async function getMyPostsByProductId(req, res) {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid product id',
      });
    }

    const product = await getOwnedProduct(productId, userId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        pp.id,
        pp.product_id,
        pp.user_id,
        pp.website_id,
        pp.category_id,
        pp.template_id,
        pp.title,
        pp.slug,
        pp.excerpt,
        pp.seo_title,
        pp.seo_description,
        pp.featured_image,
        pp.media_id,
        pp.status,
        pp.review_status,
        pp.quality_score,
        pp.risk_score,
        pp.similarity_score,
        pp.similarity_source_post_id,
        pp.total_words,
        pp.quality_checks_started,
        pp.last_quality_checked_at,
        pp.quality_blocked_reason,
        pp.admin_review_notes,
        pp.writer_revision_required,
        pp.published_at,
        pp.created_at,
        pp.updated_at,
        p.title AS product_title,
        p.slug AS product_slug,
        w.website_name,
        w.slug AS website_slug,
        c.name AS category_name,
        c.slug AS category_slug,
        bt.name AS template_name,
        bt.slug AS template_slug
      FROM product_posts pp
      INNER JOIN products p ON p.id = pp.product_id
      INNER JOIN affiliate_websites w ON w.id = pp.website_id
      LEFT JOIN categories c ON c.id = pp.category_id
      INNER JOIN blog_templates bt ON bt.id = pp.template_id
      WHERE pp.user_id = ?
        AND pp.product_id = ?
      ORDER BY pp.id DESC
      `,
      [userId, productId]
    );

    return res.status(200).json({
      ok: true,
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
      },
      posts: rows.map(sanitizePost),
    });
  } catch (error) {
    console.error('getMyPostsByProductId error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch product posts',
      error: error.message,
    });
  }
}

async function getMyPostById(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const post = await buildFullPostResponse(postId, userId);

    if (!post) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    const linkPermission = await resolveUserLinkPermission(userId);

    return res.status(200).json({
      ok: true,
      post,
      link_permissions: {
        allow_external_links: !!linkPermission.allow_external_links,
      },
    });
  } catch (error) {
    console.error('getMyPostById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch post',
      error: error.message,
    });
  }
}

async function createPost(req, res) {
  try {
    const userId = req.user.id;
    const website = await getAffiliateWebsite(userId);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before adding posts',
      });
    }

    const {
      product_id,
      category_id,
      template_id,
      title,
      slug,
      excerpt,
      seo_title,
      seo_description,
      featured_image,
      media_id,
      status,
      template_fields = [],
      cta_buttons = [],
    } = req.body;

    const productId = Number(product_id);
    const templateId = Number(template_id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid product id is required',
      });
    }

    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Valid template id is required',
      });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Post title is required',
      });
    }

    const product = await getOwnedProduct(productId, userId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: 'Product not found',
      });
    }

    const templateAccess = await canUserUseBlogTemplate({
      userId,
      templateId,
    });

    if (!templateAccess.ok) {
      return res.status(400).json({
        ok: false,
        message: templateAccess.message,
      });
    }

    const linkPermission = await resolveUserLinkPermission(userId);

    let cleanCategoryId = product.category_id || null;
    if (category_id !== undefined && category_id !== null && category_id !== '') {
      cleanCategoryId = Number(category_id);

      if (!Number.isInteger(cleanCategoryId) || cleanCategoryId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid category id',
        });
      }

      const category = await getCategoryById(cleanCategoryId);

      if (!category || category.status !== 'active') {
        return res.status(400).json({
          ok: false,
          message: 'Selected category is invalid or inactive',
        });
      }
    }

    const cleanTitle = String(title).trim();
    const desiredSlug = normalizeNullable(slug) || cleanTitle;
    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid post slug could not be generated',
      });
    }

    const uniqueSlug = await ensureUniquePostSlug(baseSlug, website.id);
    const requestedStatus = ['draft', 'published', 'inactive'].includes(status) ? status : 'draft';

    const normalizedTemplateFields = await normalizeTemplateFieldsWithValidatedLinks({
      fields: Array.isArray(template_fields) ? template_fields : [],
      userId,
      websiteId: website.id,
      postId: null,
      allowExternalLinks: !!linkPermission.allow_external_links,
    });

    const initialStatus = requestedStatus === 'published' ? 'draft' : requestedStatus;

    const [result] = await pool.query(
      `
      INSERT INTO product_posts
      (
        product_id,
        user_id,
        website_id,
        category_id,
        template_id,
        title,
        slug,
        excerpt,
        seo_title,
        seo_description,
        featured_image,
        media_id,
        status,
        review_status,
        published_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'not_checked', ?, NOW(), NOW())
      `,
      [
        productId,
        userId,
        website.id,
        cleanCategoryId,
        templateId,
        cleanTitle,
        uniqueSlug,
        normalizeNullable(excerpt),
        normalizeNullable(seo_title),
        normalizeNullable(seo_description),
        normalizeNullable(featured_image),
        media_id || null,
        initialStatus,
        initialStatus === 'published' ? new Date() : null,
      ]
    );

    const postId = result.insertId;

    await replaceTemplateFields(postId, normalizedTemplateFields);
    await replacePostCtaButtons({
      postId,
      buttons: Array.isArray(cta_buttons) ? cta_buttons : [],
      userId,
      websiteId: website.id,
      allowExternalLinks: !!linkPermission.allow_external_links,
    });

    let quality = null;

    if (requestedStatus === 'published') {
      const publishGate = await enforcePublishGate({
        postId,
        userId,
        productTitle: product.title,
      });

      quality = publishGate.quality;

      if (!publishGate.ok) {
        const fullPost = await buildFullPostResponse(postId, userId);

        return res.status(400).json({
          ok: false,
          message: `${publishGate.message}. Post was saved as draft.`,
          post: fullPost,
          quality_review: quality,
          link_permissions: {
            allow_external_links: !!linkPermission.allow_external_links,
          },
        });
      }
    } else {
      quality = await runPostQualityReview({
        postId,
        userId,
        productTitle: product.title,
      });
    }

    const fullPost = await buildFullPostResponse(postId, userId);

    return res.status(201).json({
      ok: true,
      message: requestedStatus === 'published' ? 'Post published successfully' : 'Post created successfully',
      post: fullPost,
      quality_review: quality,
      link_permissions: {
        allow_external_links: !!linkPermission.allow_external_links,
      },
    });
  } catch (error) {
    console.error('createPost error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to create post',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updatePost(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const existingPost = await getOwnedPostById(postId, userId);

    if (!existingPost) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    const {
      product_id,
      category_id,
      template_id,
      title,
      slug,
      excerpt,
      seo_title,
      seo_description,
      featured_image,
      media_id,
      status,
      template_fields,
      cta_buttons,
    } = req.body;

    let productId = existingPost.product_id;
    let productTitle = existingPost.product_title;

    if (product_id !== undefined) {
      productId = Number(product_id);

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid product id',
        });
      }

      const product = await getOwnedProduct(productId, userId);

      if (!product) {
        return res.status(404).json({
          ok: false,
          message: 'Product not found',
        });
      }

      productTitle = product.title;
    }

    let templateId = existingPost.template_id;
    if (template_id !== undefined) {
      templateId = Number(template_id);

      if (!Number.isInteger(templateId) || templateId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid template id',
        });
      }

      const templateAccess = await canUserUseBlogTemplate({
        userId,
        templateId,
      });

      if (!templateAccess.ok) {
        return res.status(400).json({
          ok: false,
          message: templateAccess.message,
        });
      }
    }

    const linkPermission = await resolveUserLinkPermission(userId);

    let cleanCategoryId = existingPost.category_id;
    if (category_id !== undefined) {
      if (category_id === null || category_id === '') {
        cleanCategoryId = null;
      } else {
        cleanCategoryId = Number(category_id);

        if (!Number.isInteger(cleanCategoryId) || cleanCategoryId <= 0) {
          return res.status(400).json({
            ok: false,
            message: 'Invalid category id',
          });
        }

        const category = await getCategoryById(cleanCategoryId);

        if (!category || category.status !== 'active') {
          return res.status(400).json({
            ok: false,
            message: 'Selected category is invalid or inactive',
          });
        }
      }
    }

    const cleanTitle = title !== undefined ? String(title).trim() : existingPost.title;

    if (!cleanTitle) {
      return res.status(400).json({
        ok: false,
        message: 'Post title is required',
      });
    }

    const desiredSlug = slug !== undefined ? normalizeNullable(slug) || cleanTitle : existingPost.slug;
    const baseSlug = makeSlug(desiredSlug);

    if (!baseSlug) {
      return res.status(400).json({
        ok: false,
        message: 'A valid post slug could not be generated',
      });
    }

    const uniqueSlug = await ensureUniquePostSlug(baseSlug, existingPost.website_id, existingPost.id);
    const requestedStatus = ['draft', 'published', 'inactive'].includes(status)
      ? status
      : existingPost.status;
    const safeStatus = requestedStatus === 'published' ? existingPost.status : requestedStatus;

    await pool.query(
      `
      UPDATE product_posts
      SET
        product_id = ?,
        category_id = ?,
        template_id = ?,
        title = ?,
        slug = ?,
        excerpt = ?,
        seo_title = ?,
        seo_description = ?,
        featured_image = ?,
        media_id = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        productId,
        cleanCategoryId,
        templateId,
        cleanTitle,
        uniqueSlug,
        excerpt !== undefined ? normalizeNullable(excerpt) : existingPost.excerpt,
        seo_title !== undefined ? normalizeNullable(seo_title) : existingPost.seo_title,
        seo_description !== undefined ? normalizeNullable(seo_description) : existingPost.seo_description,
        featured_image !== undefined ? normalizeNullable(featured_image) : existingPost.featured_image,
        media_id !== undefined ? media_id || null : existingPost.media_id,
        safeStatus,
        existingPost.id,
        userId,
      ]
    );

    if (Array.isArray(template_fields)) {
      const normalizedTemplateFields = await normalizeTemplateFieldsWithValidatedLinks({
        fields: template_fields,
        userId,
        websiteId: existingPost.website_id,
        postId: existingPost.id,
        allowExternalLinks: !!linkPermission.allow_external_links,
      });

      await replaceTemplateFields(existingPost.id, normalizedTemplateFields);
    }

    if (Array.isArray(cta_buttons)) {
      await replacePostCtaButtons({
        postId: existingPost.id,
        buttons: cta_buttons,
        userId,
        websiteId: existingPost.website_id,
        allowExternalLinks: !!linkPermission.allow_external_links,
      });
    }

    let quality = null;

    if (requestedStatus === 'published') {
      const publishGate = await enforcePublishGate({
        postId: existingPost.id,
        userId,
        productTitle,
      });

      quality = publishGate.quality;

      if (!publishGate.ok) {
        const fullPost = await buildFullPostResponse(existingPost.id, userId);

        return res.status(400).json({
          ok: false,
          message: `${publishGate.message}. Post remains in draft.`,
          post: fullPost,
          quality_review: quality,
          link_permissions: {
            allow_external_links: !!linkPermission.allow_external_links,
          },
        });
      }
    } else {
      quality = await runPostQualityReview({
        postId: existingPost.id,
        userId,
        productTitle,
      });
    }

    const fullPost = await buildFullPostResponse(existingPost.id, userId);

    return res.status(200).json({
      ok: true,
      message: requestedStatus === 'published' ? 'Post updated and published successfully' : 'Post updated successfully',
      post: fullPost,
      quality_review: quality,
      link_permissions: {
        allow_external_links: !!linkPermission.allow_external_links,
      },
    });
  } catch (error) {
    console.error('updatePost error:', error);

    return res.status(error.status || 500).json({
      ok: false,
      message: error.message || 'Failed to update post',
      error: error.status ? undefined : error.message,
    });
  }
}

async function updatePostStatus(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    if (!['draft', 'published', 'inactive'].includes(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post status',
      });
    }

    const existingPost = await getOwnedPostById(postId, userId);

    if (!existingPost) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    if (status === 'published') {
      const publishGate = await enforcePublishGate({
        postId,
        userId,
        productTitle: existingPost.product_title,
      });

      if (!publishGate.ok) {
        const fullPost = await buildFullPostResponse(postId, userId);

        return res.status(400).json({
          ok: false,
          message: publishGate.message,
          post: fullPost,
          quality_review: publishGate.quality,
        });
      }

      const fullPost = await buildFullPostResponse(postId, userId);

      return res.status(200).json({
        ok: true,
        message: 'Post status updated successfully',
        post: fullPost,
        quality_review: publishGate.quality,
      });
    }

    await pool.query(
      `
      UPDATE product_posts
      SET
        status = ?,
        published_at = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        status,
        status === 'draft' || status === 'inactive' ? null : existingPost.published_at || new Date(),
        postId,
        userId,
      ]
    );

    const quality = await runPostQualityReview({
      postId,
      userId,
      productTitle: existingPost.product_title,
    });

    const fullPost = await buildFullPostResponse(postId, userId);

    return res.status(200).json({
      ok: true,
      message: 'Post status updated successfully',
      post: fullPost,
      quality_review: quality,
    });
  } catch (error) {
    console.error('updatePostStatus error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update post status',
      error: error.message,
    });
  }
}

async function deletePost(req, res) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid post id',
      });
    }

    const existingPost = await getOwnedPostById(postId, userId);

    if (!existingPost) {
      return res.status(404).json({
        ok: false,
        message: 'Post not found',
      });
    }

    await pool.query(
      `
      DELETE FROM product_posts
      WHERE id = ?
        AND user_id = ?
      `,
      [postId, userId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('deletePost error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete post',
      error: error.message,
    });
  }
}

module.exports = {
  getMyPosts,
  getMyPostById,
  getMyPostsByProductId,
  createPost,
  updatePost,
  updatePostStatus,
  deletePost,
};