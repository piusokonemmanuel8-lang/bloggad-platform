const pool = require('../config/db');
const {
  ensureWriterWallet,
  money,
} = require('./writerReaderFinanceService');

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function nonNegativeInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function cleanText(value, maxLength = 255) {
  const text = String(value || '').trim();
  return text ? text.slice(0, maxLength) : null;
}

function money2(value) {
  return money(value, 2);
}

function parsePlanFeatures(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch (error) {
    return {};
  }
}

function planFeatureEnabled(plan, key) {
  const features = parsePlanFeatures(plan?.features_json);
  const value = features?.[key];

  if (value === true || value === 1) return true;
  return String(value || '').trim().toLowerCase() === 'true';
}

function sanitizeField(row) {
  return {
    id: row.id,
    post_id: row.post_id,
    field_key: row.field_key,
    field_type: row.field_type,
    field_value: row.field_value,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function sanitizeCta(row) {
  return {
    id: row.id,
    post_id: row.post_id,
    button_key: row.button_key,
    button_label: row.button_label,
    button_url: row.button_url,
    button_style: row.button_style,
    open_in_new_tab: !!row.open_in_new_tab,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getPostFields(postId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      post_id,
      field_key,
      field_type,
      field_value,
      sort_order,
      created_at,
      updated_at
    FROM post_template_fields
    WHERE post_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [postId]
  );

  return rows.map(sanitizeField);
}

async function getPostCtas(postId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      post_id,
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

  return rows.map(sanitizeCta);
}

let postAccessTimingColumnsPromise = null;

async function getPostAccessTimingColumns(connection = pool) {
  if (!postAccessTimingColumnsPromise) {
    postAccessTimingColumnsPromise = (async () => {
      try {
        const [rows] = await connection.query(
          [
            'SELECT COLUMN_NAME',
            'FROM information_schema.COLUMNS',
            'WHERE TABLE_SCHEMA = DATABASE()',
            "  AND TABLE_NAME = 'post_access_settings'",
            "  AND COLUMN_NAME IN ('estimated_read_seconds', 'free_preview_seconds')",
          ].join('\n')
        );

        const names = new Set(
          rows.map((row) => String(row.COLUMN_NAME || row.column_name || ''))
        );

        return {
          estimatedReadSeconds: names.has('estimated_read_seconds'),
          freePreviewSeconds: names.has('free_preview_seconds'),
        };
      } catch (error) {
        return { estimatedReadSeconds: false, freePreviewSeconds: false };
      }
    })();
  }

  return postAccessTimingColumnsPromise;
}

async function getPostAccessSetting(postId, connection = pool) {
  const timingColumns = await getPostAccessTimingColumns(connection);
  const estimatedSelect = timingColumns.estimatedReadSeconds
    ? 'estimated_read_seconds'
    : 'NULL AS estimated_read_seconds';
  const freePreviewSelect = timingColumns.freePreviewSeconds
    ? 'free_preview_seconds'
    : 'NULL AS free_preview_seconds';

  const [rows] = await connection.query(
    [
      'SELECT',
      '  id,',
      '  post_id,',
      '  access_type,',
      '  preview_percent,',
      '  ' + estimatedSelect + ',',
      '  ' + freePreviewSelect + ',',
      '  created_by_user_id,',
      '  created_at,',
      '  updated_at',
      'FROM post_access_settings',
      'WHERE post_id = ?',
      'LIMIT 1',
    ].join('\n'),
    [postId]
  );

  const row = rows[0];

  if (!row) {
    return {
      id: null,
      post_id: Number(postId),
      access_type: 'free',
      preview_percent: 100,
      estimated_read_seconds: null,
      free_preview_seconds: null,
      created_by_user_id: null,
      created_at: null,
      updated_at: null,
    };
  }

  return {
    id: row.id,
    post_id: row.post_id,
    access_type: row.access_type === 'premium' ? 'premium' : 'free',
    preview_percent:
      row.access_type === 'premium'
        ? Math.max(0, Math.min(95, Number(row.preview_percent || 0)))
        : 100,
    estimated_read_seconds:
      row.estimated_read_seconds === null
        ? null
        : Math.max(0, Number(row.estimated_read_seconds || 0)),
    free_preview_seconds:
      row.free_preview_seconds === null
        ? null
        : Math.max(0, Number(row.free_preview_seconds || 0)),
    created_by_user_id: row.created_by_user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getOwnedWriterPost(postId, writerUserId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      user_id,
      website_id,
      title,
      slug,
      status
    FROM product_posts
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [postId, writerUserId]
  );

  return rows[0] || null;
}

async function getPublishedPost(postId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      user_id,
      website_id,
      title,
      slug,
      status
    FROM product_posts
    WHERE id = ?
      AND status = 'published'
    LIMIT 1
    `,
    [postId]
  );

  return rows[0] || null;
}

async function getCurrentPaidWriterSubscription(writerUserId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      s.id AS subscription_id,
      s.plan_id,
      s.status,
      s.amount_paid,
      s.start_date,
      s.end_date,
      p.name AS plan_name,
      p.price AS plan_price,
      p.billing_cycle,
      p.product_limit,
      p.post_limit,
      p.website_limit,
      p.slider_limit,
      p.menu_limit,
      p.premium_templates_only,
      p.allow_external_links,
      p.website_templates_mode,
      p.blog_templates_mode,
      p.features_json
    FROM affiliate_subscriptions s
    INNER JOIN subscription_plans p
      ON p.id = s.plan_id
    WHERE s.user_id = ?
      AND s.status = 'active'
      AND p.status = 'active'
      AND p.price > 0
      AND s.amount_paid > 0
      AND (s.start_date IS NULL OR s.start_date <= NOW())
      AND (s.end_date IS NULL OR s.end_date > NOW())
    ORDER BY s.id DESC
    LIMIT 1
    `,
    [writerUserId]
  );

  return rows[0] || null;
}

async function getWriterFollowerCount(writerUserId, connection = pool) {
  const [[row]] = await connection.query(
    `
    SELECT COUNT(*) AS follower_count
    FROM writer_follows
    WHERE writer_user_id = ?
    `,
    [writerUserId]
  );

  return Number(row?.follower_count || 0);
}

async function getWriterMembershipPolicy(connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      enabled,
      minimum_followers,
      platform_fee_percent,
      minimum_monthly_price_usd,
      maximum_monthly_price_usd,
      updated_by_user_id,
      created_at,
      updated_at
    FROM writer_membership_settings
    ORDER BY id ASC
    LIMIT 1
    `
  );

  const row = rows[0];

  if (!row) {
    return {
      configured: false,
      id: null,
      enabled: 0,
      minimum_followers: null,
      platform_fee_percent: null,
      minimum_monthly_price_usd: null,
      maximum_monthly_price_usd: null,
      updated_by_user_id: null,
      created_at: null,
      updated_at: null,
    };
  }

  return {
    configured: true,
    id: row.id,
    enabled: Number(row.enabled || 0),
    minimum_followers: Number(row.minimum_followers || 0),
    platform_fee_percent: money2(row.platform_fee_percent),
    minimum_monthly_price_usd: money2(row.minimum_monthly_price_usd),
    maximum_monthly_price_usd:
      row.maximum_monthly_price_usd === null
        ? null
        : money2(row.maximum_monthly_price_usd),
    updated_by_user_id: row.updated_by_user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getWriterMembershipOfferRecord(writerUserId, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      writer_user_id,
      monthly_price_usd,
      currency_code,
      status,
      created_at,
      updated_at
    FROM writer_membership_offers
    WHERE writer_user_id = ?
    LIMIT 1
    `,
    [writerUserId]
  );

  const row = rows[0];

  if (!row) return null;

  return {
    id: row.id,
    writer_user_id: row.writer_user_id,
    monthly_price_usd: money2(row.monthly_price_usd),
    currency_code: row.currency_code,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getWriterMembershipEligibility(writerUserId, connection = pool) {
  const paid_writer_plan = await getCurrentPaidWriterSubscription(
    writerUserId,
    connection
  );
  const follower_count = await getWriterFollowerCount(writerUserId, connection);
  const policy = await getWriterMembershipPolicy(connection);
  const plan_allows_membership =
    !!paid_writer_plan &&
    planFeatureEnabled(paid_writer_plan, 'can_offer_paid_membership');

  const eligible =
    plan_allows_membership &&
    !!policy.configured &&
    Number(policy.enabled || 0) === 1 &&
    policy.minimum_followers !== null &&
    follower_count >= Number(policy.minimum_followers || 0);

  let reason = null;

  if (!paid_writer_plan) {
    reason = 'An active paid Writer plan is required.';
  } else if (!plan_allows_membership) {
    reason = 'Your current Writer plan does not include Direct Paid Membership.';
  } else if (!policy.configured) {
    reason = 'Direct Writer memberships are not configured yet.';
  } else if (Number(policy.enabled || 0) !== 1) {
    reason = 'Direct Writer memberships are disabled.';
  } else if (follower_count < Number(policy.minimum_followers || 0)) {
    reason =
      'You need at least ' +
      Number(policy.minimum_followers || 0) +
      ' followers to activate direct memberships.';
  }

  return {
    eligible,
    reason,
    follower_count,
    plan_allows_membership,
    paid_writer_plan,
    policy,
  };
}

function buildPreviewFields(fields, previewPercent) {
  const safePercent = Math.max(0, Math.min(95, Number(previewPercent || 0)));
  if (safePercent <= 0) return [];

  const textTypes = new Set([
    'text',
    'textarea',
    'paragraph',
    'heading',
    'quote',
    'rich_text',
  ]);

  const textFields = (Array.isArray(fields) ? fields : []).filter((field) => {
    const type = String(field?.field_type || '').trim().toLowerCase();
    const value = String(field?.field_value || '');
    return textTypes.has(type) && value.length > 0;
  });

  const totalChars = textFields.reduce(
    (total, field) => total + String(field.field_value || '').length,
    0
  );

  if (totalChars <= 0) return [];

  let remaining = Math.max(1, Math.floor((totalChars * safePercent) / 100));
  const preview = [];

  for (const field of textFields) {
    if (remaining <= 0) break;

    const value = String(field.field_value || '');

    if (value.length <= remaining) {
      preview.push({ ...field, preview_truncated: false });
      remaining -= value.length;
      continue;
    }

    preview.push({
      ...field,
      field_value: value.slice(0, remaining),
      preview_truncated: true,
    });
    remaining = 0;
  }

  return preview;
}

const READ_WORDS_PER_MINUTE = 200;
const READABLE_FIELD_TYPES = new Set([
  'text',
  'textarea',
  'paragraph',
  'heading',
  'quote',
  'rich_text',
]);

function parseReadableValue(value) {
  const raw = String(value || '');

  if (!raw.trim().startsWith('{')) {
    return { text: raw, rich: false, parsed: null };
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      parsed?.type === 'bloggad_rich_text_v1' &&
      typeof parsed?.text === 'string' &&
      Array.isArray(parsed?.links)
    ) {
      return { text: parsed.text, rich: true, parsed };
    }
  } catch (error) {
    // Plain text fallback.
  }

  return { text: raw, rich: false, parsed: null };
}

function getReadableFieldText(field) {
  const type = String(field?.field_type || '').trim().toLowerCase();
  if (!READABLE_FIELD_TYPES.has(type)) return '';
  return parseReadableValue(field?.field_value || '').text;
}

function estimateReadSeconds(fields) {
  const words = (Array.isArray(fields) ? fields : [])
    .map(getReadableFieldText)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;

  if (!words) return 0;
  return Math.max(1, Math.ceil((words * 60) / READ_WORDS_PER_MINUTE));
}

function resolveAccessTiming(access, fields) {
  const estimatedFromFields = estimateReadSeconds(fields);
  const storedEstimated = Number(access?.estimated_read_seconds || 0);
  const estimated = storedEstimated > 0 ? storedEstimated : estimatedFromFields;

  if (String(access?.access_type || 'free') !== 'premium') {
    return {
      estimated_read_seconds: estimated,
      free_preview_seconds: estimated,
    };
  }

  if (estimated <= 1) {
    return {
      estimated_read_seconds: estimated,
      free_preview_seconds: 0,
    };
  }

  const storedFree = Number(access?.free_preview_seconds || 0);
  let freePreview = storedFree > 0 ? storedFree : 0;

  if (!freePreview) {
    const legacyPercent = Math.max(
      0,
      Math.min(95, Number(access?.preview_percent || 0))
    );

    if (legacyPercent > 0) {
      freePreview = Math.max(
        1,
        Math.floor((estimated * legacyPercent) / 100)
      );
    }
  }

  freePreview = Math.max(1, Math.min(estimated - 1, freePreview || 1));

  return {
    estimated_read_seconds: estimated,
    free_preview_seconds: freePreview,
  };
}

function truncateReadableFieldValue(value, maxChars) {
  const parsed = parseReadableValue(value);
  const limit = Math.max(0, Number(maxChars || 0));

  if (!parsed.rich) {
    return String(value || '').slice(0, limit);
  }

  const text = parsed.text.slice(0, limit);
  const links = (parsed.parsed?.links || [])
    .map((link) => ({
      ...link,
      start: Number(link?.start),
      end: Math.min(Number(link?.end), text.length),
    }))
    .filter(
      (link) =>
        Number.isInteger(link.start) &&
        Number.isInteger(link.end) &&
        link.start >= 0 &&
        link.end > link.start &&
        link.start < text.length
    );

  return JSON.stringify({
    ...parsed.parsed,
    text,
    links,
  });
}

function buildPreviewFieldsByTime(fields, freePreviewSeconds, estimatedReadSeconds) {
  const estimated = Math.max(0, Number(estimatedReadSeconds || 0));
  const freePreview = Math.max(0, Number(freePreviewSeconds || 0));

  if (estimated <= 0 || freePreview <= 0) return [];

  const readable = (Array.isArray(fields) ? fields : [])
    .map((field) => ({
      field,
      text: getReadableFieldText(field),
    }))
    .filter((item) => item.text.length > 0);

  const totalChars = readable.reduce((total, item) => total + item.text.length, 0);
  if (totalChars <= 0) return [];

  const ratio = Math.max(0, Math.min(0.999999, freePreview / estimated));
  let remaining = Math.max(1, Math.floor(totalChars * ratio));
  const preview = [];

  for (const item of readable) {
    if (remaining <= 0) break;

    if (item.text.length <= remaining) {
      preview.push({ ...item.field, preview_truncated: false });
      remaining -= item.text.length;
      continue;
    }

    preview.push({
      ...item.field,
      field_value: truncateReadableFieldValue(item.field.field_value, remaining),
      preview_truncated: true,
    });
    remaining = 0;
  }

  return preview;
}

async function buildPublicPostAccessPayload({
  post,
  fields,
  ctaButtons,
  connection = pool,
}) {
  if (!post?.id) {
    throw fail('Valid post is required.', 500);
  }

  const access = await getPostAccessSetting(post.id, connection);
  const timing = resolveAccessTiming(access, fields);

  if (access.access_type !== 'premium') {
    return {
      post,
      template_fields: fields,
      cta_buttons: ctaButtons,
      access: {
        access_type: 'free',
        locked: false,
        preview_percent: 100,
        estimated_read_seconds: timing.estimated_read_seconds,
        free_preview_seconds: timing.free_preview_seconds,
        full_content_included: true,
      },
    };
  }

  const safePost = {
    ...post,
    product: post.product
      ? {
          ...post.product,
          affiliate_buy_url: null,
        }
      : null,
  };

  return {
    post: safePost,
    template_fields: buildPreviewFieldsByTime(
      fields,
      timing.free_preview_seconds,
      timing.estimated_read_seconds
    ),
    cta_buttons: [],
    access: {
      access_type: 'premium',
      locked: true,
      preview_percent: access.preview_percent,
      estimated_read_seconds: timing.estimated_read_seconds,
      free_preview_seconds: timing.free_preview_seconds,
      full_content_included: false,
      unlock_methods: ['reader_subscription', 'writer_membership'],
    },
  };
}

async function getReaderEntitlement(
  readerUserId,
  writerUserId,
  connection = pool
) {
  const [platformRows] = await connection.query(
    `
    SELECT
      rs.id,
      rs.plan_id,
      rs.starts_at,
      rs.ends_at,
      rsp.name AS plan_name,
      rsp.tier AS plan_tier
    FROM reader_subscriptions rs
    INNER JOIN reader_subscription_plans rsp
      ON rsp.id = rs.plan_id
     AND rsp.status = 'active'
    WHERE rs.reader_user_id = ?
      AND rs.status = 'active'
      AND rs.starts_at <= NOW()
      AND rs.ends_at > NOW()
    ORDER BY rs.ends_at DESC, rs.id DESC
    LIMIT 1
    `,
    [readerUserId]
  );

  const [membershipRows] = await connection.query(
    `
    SELECT
      wm.id,
      wm.writer_user_id,
      wm.starts_at,
      wm.ends_at
    FROM writer_memberships wm
    WHERE wm.reader_user_id = ?
      AND wm.writer_user_id = ?
      AND wm.status = 'active'
      AND wm.starts_at <= NOW()
      AND wm.ends_at > NOW()
    ORDER BY wm.ends_at DESC, wm.id DESC
    LIMIT 1
    `,
    [readerUserId, writerUserId]
  );

  const platformSubscription = platformRows[0] || null;
  const writerMembership = membershipRows[0] || null;

  return {
    entitled: !!platformSubscription || !!writerMembership,
    source: platformSubscription
      ? 'reader_subscription'
      : writerMembership
      ? 'writer_membership'
      : null,
    platform_subscription: platformSubscription,
    writer_membership: writerMembership,
  };
}

async function getReaderPostAccess(readerUserId, postId, connection = pool) {
  const post = await getPublishedPost(postId, connection);

  if (!post) {
    throw fail('Published post not found.', 404);
  }

  const access = await getPostAccessSetting(post.id, connection);
  const fields = await getPostFields(post.id, connection);
  const ctaButtons = await getPostCtas(post.id, connection);
  const timing = resolveAccessTiming(access, fields);

  if (access.access_type !== 'premium') {
    return {
      entitled: true,
      entitlement_source: 'free',
      post_id: post.id,
      writer_user_id: post.user_id,
      access: {
        ...access,
        ...timing,
        locked: false,
        full_content_included: true,
      },
      template_fields: fields,
      cta_buttons: ctaButtons,
    };
  }

  const entitlement = await getReaderEntitlement(
    readerUserId,
    post.user_id,
    connection
  );

  if (!entitlement.entitled) {
    return {
      entitled: false,
      entitlement_source: null,
      post_id: post.id,
      writer_user_id: post.user_id,
      access: {
        ...access,
        ...timing,
        locked: true,
        full_content_included: false,
      },
      template_fields: buildPreviewFieldsByTime(
        fields,
        timing.free_preview_seconds,
        timing.estimated_read_seconds
      ),
      cta_buttons: [],
    };
  }

  return {
    entitled: true,
    entitlement_source: entitlement.source,
    post_id: post.id,
    writer_user_id: post.user_id,
    access: {
      ...access,
      ...timing,
      locked: false,
      full_content_included: true,
    },
    template_fields: fields,
    cta_buttons: ctaButtons,
  };
}

async function setWriterPostAccess({
  writerUserId,
  postId,
  accessType,
  freePreviewSeconds,
}) {
  const normalizedAccess =
    String(accessType || '').trim().toLowerCase() === 'premium'
      ? 'premium'
      : String(accessType || '').trim().toLowerCase() === 'free'
      ? 'free'
      : null;

  if (!normalizedAccess) {
    throw fail('Access type must be free or premium.');
  }

  const post = await getOwnedWriterPost(postId, writerUserId);

  if (!post) {
    throw fail('Writer post not found.', 404);
  }

  const fields = await getPostFields(post.id);
  const estimatedReadSeconds = estimateReadSeconds(fields);
  let normalizedPreview = 100;
  let normalizedFreePreview = estimatedReadSeconds;

  if (normalizedAccess === 'premium') {
    const paidPlan = await getCurrentPaidWriterSubscription(writerUserId);

    if (!paidPlan) {
      throw fail('An active paid Writer plan is required for premium posts.', 403);
    }

    if (estimatedReadSeconds <= 1) {
      throw fail(
        'Add readable post content before enabling Premium Post and Free Read.'
      );
    }

    const parsedFreePreview = positiveInt(freePreviewSeconds);

    if (
      parsedFreePreview === null ||
      parsedFreePreview >= estimatedReadSeconds
    ) {
      throw fail(
        'Free Read time must be greater than zero and lower than the estimated read time.'
      );
    }

    normalizedFreePreview = parsedFreePreview;
    normalizedPreview = Math.max(
      1,
      Math.min(
        95,
        Math.round((normalizedFreePreview / estimatedReadSeconds) * 100)
      )
    );
  }

  const timingColumns = await getPostAccessTimingColumns(pool);
  const insertColumns = ['post_id', 'access_type', 'preview_percent'];
  const placeholders = ['?', '?', '?'];
  const values = [post.id, normalizedAccess, normalizedPreview];
  const updates = [
    'access_type = VALUES(access_type)',
    'preview_percent = VALUES(preview_percent)',
  ];

  if (timingColumns.estimatedReadSeconds) {
    insertColumns.push('estimated_read_seconds');
    placeholders.push('?');
    values.push(estimatedReadSeconds);
    updates.push('estimated_read_seconds = VALUES(estimated_read_seconds)');
  }

  if (timingColumns.freePreviewSeconds) {
    insertColumns.push('free_preview_seconds');
    placeholders.push('?');
    values.push(normalizedFreePreview);
    updates.push('free_preview_seconds = VALUES(free_preview_seconds)');
  }

  insertColumns.push('created_by_user_id', 'created_at', 'updated_at');
  placeholders.push('?', 'NOW()', 'NOW()');
  values.push(writerUserId);
  updates.push('created_by_user_id = VALUES(created_by_user_id)');
  updates.push('updated_at = NOW()');

  await pool.query(
    [
      'INSERT INTO post_access_settings (',
      insertColumns.join(', '),
      ') VALUES (',
      placeholders.join(', '),
      ') ON DUPLICATE KEY UPDATE ',
      updates.join(', '),
    ].join(''),
    values
  );
  return getPostAccessSetting(post.id);
}

async function saveWriterMembershipOffer({
  writerUserId,
  monthlyPriceUsd,
  status,
}) {
  const eligibility = await getWriterMembershipEligibility(writerUserId);

  if (!eligibility.eligible) {
    throw fail(eligibility.reason || 'Writer is not eligible for direct memberships.', 403);
  }

  const price = money2(monthlyPriceUsd);

  if (price <= 0) {
    throw fail('Monthly membership price must be greater than zero.');
  }

  const minimum = money2(eligibility.policy.minimum_monthly_price_usd || 0);
  const maximum =
    eligibility.policy.maximum_monthly_price_usd === null
      ? null
      : money2(eligibility.policy.maximum_monthly_price_usd);

  if (price < minimum) {
    throw fail(`Monthly membership price must be at least $${minimum.toFixed(2)}.`);
  }

  if (maximum !== null && price > maximum) {
    throw fail(`Monthly membership price cannot exceed $${maximum.toFixed(2)}.`);
  }

  const normalizedStatus =
    String(status || 'inactive').trim().toLowerCase() === 'active'
      ? 'active'
      : 'inactive';

  await pool.query(
    `
    INSERT INTO writer_membership_offers (
      writer_user_id,
      monthly_price_usd,
      currency_code,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, 'USD', ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      monthly_price_usd = VALUES(monthly_price_usd),
      currency_code = 'USD',
      status = VALUES(status),
      updated_at = NOW()
    `,
    [writerUserId, price, normalizedStatus]
  );

  return {
    offer: await getWriterMembershipOfferRecord(writerUserId),
    eligibility: await getWriterMembershipEligibility(writerUserId),
  };
}

async function getPublicWriterMembershipOffer(writerUserId) {
  const offer = await getWriterMembershipOfferRecord(writerUserId);

  if (!offer || offer.status !== 'active') {
    return {
      available: false,
      writer_user_id: writerUserId,
      offer: null,
    };
  }

  const eligibility = await getWriterMembershipEligibility(writerUserId);

  if (!eligibility.eligible) {
    return {
      available: false,
      writer_user_id: writerUserId,
      offer: null,
    };
  }

  return {
    available: true,
    writer_user_id: writerUserId,
    offer,
  };
}

async function getReaderSubscriptionState(readerUserId) {
  const [rows] = await pool.query(
    `
    SELECT
      rs.id,
      rs.reader_user_id,
      rs.plan_id,
      rs.amount_paid_usd,
      rs.currency_code,
      rs.status,
      rs.starts_at,
      rs.ends_at,
      rs.provider_name,
      rs.provider_reference,
      rs.created_at,
      rs.updated_at,
      rsp.name AS plan_name,
      rsp.tier AS plan_tier,
      rsp.price_usd AS plan_price_usd,
      rsp.billing_cycle,
      CASE
        WHEN rs.status = 'active'
         AND rs.starts_at <= NOW()
         AND rs.ends_at > NOW()
        THEN 1
        ELSE 0
      END AS is_current
    FROM reader_subscriptions rs
    INNER JOIN reader_subscription_plans rsp
      ON rsp.id = rs.plan_id
    WHERE rs.reader_user_id = ?
    ORDER BY rs.id DESC
    LIMIT 50
    `,
    [readerUserId]
  );

  const active = rows.find((row) => Number(row.is_current || 0) === 1) || null;

  return {
    active_subscription: active,
    subscriptions: rows,
  };
}

async function getReaderWriterMemberships(readerUserId) {
  const [rows] = await pool.query(
    `
    SELECT
      wm.id,
      wm.reader_user_id,
      wm.writer_user_id,
      wm.offer_id,
      wm.amount_paid_usd,
      wm.gross_amount_usd,
      wm.platform_fee_percent,
      wm.platform_fee_usd,
      wm.writer_net_usd,
      wm.currency_code,
      wm.status,
      wm.starts_at,
      wm.ends_at,
      wm.provider_name,
      wm.provider_reference,
      wm.created_at,
      wm.updated_at,
      wmo.monthly_price_usd
    FROM writer_memberships wm
    LEFT JOIN writer_membership_offers wmo
      ON wmo.id = wm.offer_id
    WHERE wm.reader_user_id = ?
    ORDER BY wm.id DESC
    LIMIT 100
    `,
    [readerUserId]
  );

  return rows;
}

async function getWriterMembers(writerUserId) {
  const [rows] = await pool.query(
    `
    SELECT
      wm.id,
      wm.reader_user_id,
      wm.writer_user_id,
      wm.amount_paid_usd,
      wm.gross_amount_usd,
      wm.platform_fee_percent,
      wm.platform_fee_usd,
      wm.writer_net_usd,
      wm.currency_code,
      wm.status,
      wm.starts_at,
      wm.ends_at,
      wm.created_at,
      wm.updated_at
    FROM writer_memberships wm
    WHERE wm.writer_user_id = ?
    ORDER BY wm.id DESC
    LIMIT 500
    `,
    [writerUserId]
  );

  return rows;
}

async function activateReaderPlatformSubscription({
  readerUserId,
  planId,
  amountPaidUsd,
  providerName,
  providerReference,
  approvedByUserId,
}) {
  const readerId = positiveInt(readerUserId);
  const selectedPlanId = positiveInt(planId);
  const reference = cleanText(providerReference, 150);
  const provider = cleanText(providerName, 100) || 'manual_verified';

  if (!readerId || !selectedPlanId || !reference) {
    throw fail('Reader, plan, and unique payment reference are required.');
  }

  const paidAmount = money2(amountPaidUsd);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[reader]] = await connection.query(
      `
      SELECT id, role, status
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [readerId]
    );

    if (!reader || reader.status !== 'active' || reader.role !== 'customer') {
      throw fail('Active Reader account not found.', 404);
    }

    const [[plan]] = await connection.query(
      `
      SELECT id, name, tier, price_usd, billing_cycle, status
      FROM reader_subscription_plans
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [selectedPlanId]
    );

    if (!plan || plan.status !== 'active') {
      throw fail('Reader subscription plan not found or inactive.', 404);
    }

    const requiredAmount = money2(plan.price_usd);

    if (paidAmount < requiredAmount) {
      throw fail(
        `Verified payment is below the required $${requiredAmount.toFixed(2)}.`
      );
    }

    const [[duplicate]] = await connection.query(
      `
      SELECT id
      FROM reader_subscriptions
      WHERE provider_reference = ?
      LIMIT 1
      FOR UPDATE
      `,
      [reference]
    );

    if (duplicate) {
      throw fail('This payment reference has already been used.', 409);
    }

    const endExpression =
      plan.billing_cycle === 'yearly'
        ? 'DATE_ADD(NOW(), INTERVAL 1 YEAR)'
        : 'DATE_ADD(NOW(), INTERVAL 1 MONTH)';

    const [result] = await connection.query(
      `
      INSERT INTO reader_subscriptions (
        reader_user_id,
        plan_id,
        amount_paid_usd,
        currency_code,
        status,
        starts_at,
        ends_at,
        provider_name,
        provider_reference,
        approved_by_user_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, 'USD', 'active', NOW(), ${endExpression}, ?, ?, ?, NOW(), NOW())
      `,
      [
        readerId,
        selectedPlanId,
        paidAmount,
        provider,
        reference,
        approvedByUserId || null,
      ]
    );

    await connection.commit();

    return {
      subscription_id: result.insertId,
      reader_user_id: readerId,
      plan_id: selectedPlanId,
      plan_tier: plan.tier || null,
      amount_paid_usd: paidAmount,
      required_amount_usd: requiredAmount,
      currency_code: 'USD',
      provider_name: provider,
      provider_reference: reference,
    };
  } catch (error) {
    await connection.rollback();

    if (error?.code === 'ER_DUP_ENTRY') {
      throw fail('This payment reference has already been used.', 409);
    }

    throw error;
  } finally {
    connection.release();
  }
}

async function activateWriterMembership({
  readerUserId,
  writerUserId,
  amountPaidUsd,
  providerName,
  providerReference,
  approvedByUserId,
}) {
  const readerId = positiveInt(readerUserId);
  const writerId = positiveInt(writerUserId);
  const reference = cleanText(providerReference, 150);
  const provider = cleanText(providerName, 100) || 'manual_verified';

  if (!readerId || !writerId || !reference) {
    throw fail('Reader, Writer, and unique payment reference are required.');
  }

  if (readerId === writerId) {
    throw fail('A Writer cannot subscribe to their own direct membership.');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[reader]] = await connection.query(
      `
      SELECT id, role, status
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [readerId]
    );

    const [[writer]] = await connection.query(
      `
      SELECT id, role, status
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [writerId]
    );

    if (!reader || reader.status !== 'active' || reader.role !== 'customer') {
      throw fail('Active Reader account not found.', 404);
    }

    if (!writer || writer.status !== 'active' || writer.role !== 'affiliate') {
      throw fail('Active Writer account not found.', 404);
    }

    const eligibility = await getWriterMembershipEligibility(writerId, connection);

    if (!eligibility.eligible) {
      throw fail(
        eligibility.reason || 'Writer is not eligible for direct memberships.',
        403
      );
    }

    const [[offer]] = await connection.query(
      `
      SELECT
        id,
        writer_user_id,
        monthly_price_usd,
        status
      FROM writer_membership_offers
      WHERE writer_user_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [writerId]
    );

    if (!offer || offer.status !== 'active') {
      throw fail('Writer membership offer is not active.', 404);
    }

    const requiredAmount = money2(offer.monthly_price_usd);
    const paidAmount = money2(amountPaidUsd);

    if (paidAmount < requiredAmount) {
      throw fail(
        `Verified payment is below the required $${requiredAmount.toFixed(2)}.`
      );
    }

    const [[duplicate]] = await connection.query(
      `
      SELECT id
      FROM writer_memberships
      WHERE provider_reference = ?
      LIMIT 1
      FOR UPDATE
      `,
      [reference]
    );

    if (duplicate) {
      throw fail('This payment reference has already been used.', 409);
    }

    const feePercent = money2(eligibility.policy.platform_fee_percent);
    const platformFeeUsd = money2(requiredAmount * (feePercent / 100));
    const writerNetUsd = money2(Math.max(0, requiredAmount - platformFeeUsd));

    const [membershipResult] = await connection.query(
      `
      INSERT INTO writer_memberships (
        reader_user_id,
        writer_user_id,
        offer_id,
        amount_paid_usd,
        gross_amount_usd,
        platform_fee_percent,
        platform_fee_usd,
        writer_net_usd,
        currency_code,
        status,
        starts_at,
        ends_at,
        provider_name,
        provider_reference,
        approved_by_user_id,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), ?, ?, ?, NOW(), NOW())
      `,
      [
        readerId,
        writerId,
        offer.id,
        paidAmount,
        requiredAmount,
        feePercent,
        platformFeeUsd,
        writerNetUsd,
        provider,
        reference,
        approvedByUserId || null,
      ]
    );

    const wallet = await ensureWriterWallet(writerId, connection, true);

    if (!wallet) {
      throw fail('Unable to load Writer wallet.', 500);
    }

    const availableAfter = money2(
      Number(wallet.available_balance || 0) + writerNetUsd
    );
    const totalEarnedAfter = money2(
      Number(wallet.total_earned || 0) + writerNetUsd
    );

    await connection.query(
      `
      UPDATE blogpulse_wallets
      SET
        available_balance = ?,
        total_earned = ?,
        last_credit_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [availableAfter, totalEarnedAfter, wallet.id]
    );

    await connection.query(
      `
      INSERT INTO blogpulse_wallet_transactions (
        user_id,
        wallet_id,
        type,
        reference_type,
        reference_id,
        amount,
        status,
        description,
        created_at
      )
      VALUES (?, ?, 'credit', 'writer_membership', ?, ?, 'approved', ?, NOW())
      `,
      [
        writerId,
        wallet.id,
        membershipResult.insertId,
        writerNetUsd,
        'Direct Writer membership payment credited.',
      ]
    );

    await connection.query(
      `
      INSERT INTO user_notifications (
        recipient_user_id,
        actor_user_id,
        notification_type,
        post_id,
        comment_id,
        title,
        message,
        is_read,
        created_at
      )
      VALUES (?, ?, 'writer_membership_started', NULL, NULL, 'New Writer membership', 'A Reader joined your direct Writer membership.', 0, NOW())
      `,
      [writerId, readerId]
    );

    await connection.commit();

    return {
      membership_id: membershipResult.insertId,
      reader_user_id: readerId,
      writer_user_id: writerId,
      amount_paid_usd: paidAmount,
      gross_amount_usd: requiredAmount,
      platform_fee_percent: feePercent,
      platform_fee_usd: platformFeeUsd,
      writer_net_usd: writerNetUsd,
      currency_code: 'USD',
      writer_available_balance: availableAfter,
      provider_name: provider,
      provider_reference: reference,
    };
  } catch (error) {
    await connection.rollback();

    if (error?.code === 'ER_DUP_ENTRY') {
      throw fail('This payment reference has already been used.', 409);
    }

    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  fail,
  positiveInt,
  money2,
  planFeatureEnabled,
  getPostFields,
  getPostCtas,
  getPostAccessSetting,
  getCurrentPaidWriterSubscription,
  getWriterMembershipPolicy,
  getWriterMembershipEligibility,
  getWriterMembershipOfferRecord,
  buildPreviewFields,
  estimateReadSeconds,
  buildPreviewFieldsByTime,
  buildPublicPostAccessPayload,
  getReaderEntitlement,
  getReaderPostAccess,
  setWriterPostAccess,
  saveWriterMembershipOffer,
  getPublicWriterMembershipOffer,
  getReaderSubscriptionState,
  getReaderWriterMemberships,
  getWriterMembers,
  activateReaderPlatformSubscription,
  activateWriterMembership,
};
