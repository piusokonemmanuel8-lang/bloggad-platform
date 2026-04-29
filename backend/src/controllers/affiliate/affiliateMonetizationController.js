const pool = require('../../config/db');

let monetizationTableReady = false;
let templateAdSettingsTableReady = false;
let eligibilitySettingsTableReady = false;

const ELIGIBILITY_TABLE = 'blogpulse_monetization_eligibility_settings';

const DEFAULT_ELIGIBILITY_SETTINGS = {
  paid_subscription_required: 1,
  active_storefront_required: 1,
  required_pages_count: 4,
  minimum_published_posts: 15,
  minimum_valid_page_views: 1000,
  content_quality_review_required: 1,

  local_ads_enabled: 1,
  affiliate_ads_enabled: 1,
  global_ads_enabled: 1,
  personal_ad_id_enabled: 1,

  publisher_max_revenue_percent: 60.0,
  status: 'active',
};

async function tableExists(tableName) {
  const [rows] = await pool.query(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    [tableName]
  );

  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await pool.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return rows.length > 0;
}

async function ensureColumn(tableName, columnName, alterSql) {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  if (!Number(rows?.[0]?.total || 0)) {
    await pool.query(alterSql);
  }
}

async function ensureAffiliateMonetizationTable() {
  if (monetizationTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS affiliate_monetization_settings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      monetization_mode ENUM('individual', 'platform') NOT NULL DEFAULT 'platform',

      provider_name VARCHAR(255) DEFAULT NULL,
      provider_type ENUM('adsense', 'generic', 'manual') DEFAULT NULL,
      publisher_id VARCHAR(255) DEFAULT NULL,
      head_code LONGTEXT DEFAULT NULL,
      notes TEXT DEFAULT NULL,

      storefront_top_enabled TINYINT(1) NOT NULL DEFAULT 1,
      storefront_sidebar_enabled TINYINT(1) NOT NULL DEFAULT 0,
      storefront_bottom_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_top_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_middle_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_bottom_enabled TINYINT(1) NOT NULL DEFAULT 1,
      post_sidebar_enabled TINYINT(1) NOT NULL DEFAULT 0,

      review_status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft',
      submitted_at TIMESTAMP NULL DEFAULT NULL,
      reviewed_at TIMESTAMP NULL DEFAULT NULL,
      admin_review_note TEXT DEFAULT NULL,

      content_quality_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      content_quality_note TEXT DEFAULT NULL,
      content_quality_reviewed_at TIMESTAMP NULL DEFAULT NULL,

      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),
      UNIQUE KEY uniq_affiliate_monetization_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await ensureColumn(
    'affiliate_monetization_settings',
    'review_status',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN review_status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft' AFTER post_sidebar_enabled"
  );

  await ensureColumn(
    'affiliate_monetization_settings',
    'submitted_at',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN submitted_at TIMESTAMP NULL DEFAULT NULL AFTER review_status"
  );

  await ensureColumn(
    'affiliate_monetization_settings',
    'reviewed_at',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN reviewed_at TIMESTAMP NULL DEFAULT NULL AFTER submitted_at"
  );

  await ensureColumn(
    'affiliate_monetization_settings',
    'admin_review_note',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN admin_review_note TEXT DEFAULT NULL AFTER reviewed_at"
  );

  await ensureColumn(
    'affiliate_monetization_settings',
    'content_quality_status',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN content_quality_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending' AFTER admin_review_note"
  );

  await ensureColumn(
    'affiliate_monetization_settings',
    'content_quality_note',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN content_quality_note TEXT DEFAULT NULL AFTER content_quality_status"
  );

  await ensureColumn(
    'affiliate_monetization_settings',
    'content_quality_reviewed_at',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN content_quality_reviewed_at TIMESTAMP NULL DEFAULT NULL AFTER content_quality_note"
  );

  monetizationTableReady = true;
}

async function ensureAffiliateTemplateAdSettingsTable() {
  if (templateAdSettingsTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS affiliate_template_ad_settings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      affiliate_id BIGINT UNSIGNED NOT NULL,
      website_id BIGINT UNSIGNED NULL,

      post_template_ads_enabled TINYINT(1) NOT NULL DEFAULT 0,
      website_ads_enabled TINYINT(1) NOT NULL DEFAULT 0,
      product_ads_enabled TINYINT(1) NOT NULL DEFAULT 0,

      revenue_share_percent DECIMAL(5,2) NOT NULL DEFAULT 60.00,
      platform_share_percent DECIMAL(5,2) NOT NULL DEFAULT 40.00,

      status ENUM('active','disabled') NOT NULL DEFAULT 'active',

      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id),
      UNIQUE KEY uniq_affiliate_template_ad_settings (affiliate_id, website_id),
      KEY idx_affiliate_template_ad_settings_affiliate_id (affiliate_id),
      KEY idx_affiliate_template_ad_settings_website_id (website_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  templateAdSettingsTableReady = true;
}

async function ensureBlogPulseEligibilitySettingsTable() {
  if (eligibilitySettingsTableReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${ELIGIBILITY_TABLE} (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

      paid_subscription_required TINYINT(1) NOT NULL DEFAULT 1,
      active_storefront_required TINYINT(1) NOT NULL DEFAULT 1,
      required_pages_count INT NOT NULL DEFAULT 4,
      minimum_published_posts INT NOT NULL DEFAULT 15,
      minimum_valid_page_views INT NOT NULL DEFAULT 1000,
      content_quality_review_required TINYINT(1) NOT NULL DEFAULT 1,

      local_ads_enabled TINYINT(1) NOT NULL DEFAULT 1,
      affiliate_ads_enabled TINYINT(1) NOT NULL DEFAULT 1,
      global_ads_enabled TINYINT(1) NOT NULL DEFAULT 1,
      personal_ad_id_enabled TINYINT(1) NOT NULL DEFAULT 1,

      publisher_max_revenue_percent DECIMAL(5,2) NOT NULL DEFAULT 60.00,
      status ENUM('active','disabled') NOT NULL DEFAULT 'active',

      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [existingRows] = await pool.query(
    `SELECT id FROM ${ELIGIBILITY_TABLE} ORDER BY id ASC LIMIT 1`
  );

  if (!existingRows.length) {
    await pool.query(
      `
        INSERT INTO ${ELIGIBILITY_TABLE}
        (
          paid_subscription_required,
          active_storefront_required,
          required_pages_count,
          minimum_published_posts,
          minimum_valid_page_views,
          content_quality_review_required,
          local_ads_enabled,
          affiliate_ads_enabled,
          global_ads_enabled,
          personal_ad_id_enabled,
          publisher_max_revenue_percent,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        DEFAULT_ELIGIBILITY_SETTINGS.paid_subscription_required,
        DEFAULT_ELIGIBILITY_SETTINGS.active_storefront_required,
        DEFAULT_ELIGIBILITY_SETTINGS.required_pages_count,
        DEFAULT_ELIGIBILITY_SETTINGS.minimum_published_posts,
        DEFAULT_ELIGIBILITY_SETTINGS.minimum_valid_page_views,
        DEFAULT_ELIGIBILITY_SETTINGS.content_quality_review_required,
        DEFAULT_ELIGIBILITY_SETTINGS.local_ads_enabled,
        DEFAULT_ELIGIBILITY_SETTINGS.affiliate_ads_enabled,
        DEFAULT_ELIGIBILITY_SETTINGS.global_ads_enabled,
        DEFAULT_ELIGIBILITY_SETTINGS.personal_ad_id_enabled,
        DEFAULT_ELIGIBILITY_SETTINGS.publisher_max_revenue_percent,
        DEFAULT_ELIGIBILITY_SETTINGS.status,
      ]
    );
  }

  eligibilitySettingsTableReady = true;
}

async function ensureTables() {
  await ensureAffiliateMonetizationTable();
  await ensureAffiliateTemplateAdSettingsTable();
  await ensureBlogPulseEligibilitySettingsTable();
}

function toBooleanNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value ? 1 : 0;

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return 1;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return 0;

  return fallback;
}

function normalizeInteger(value, fallback, min = 0, max = null) {
  if (value === undefined || value === null || value === '') return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  let finalValue = Math.floor(parsed);
  if (finalValue < min) finalValue = min;
  if (max !== null && finalValue > max) finalValue = max;

  return finalValue;
}

function normalizeDecimal(value, fallback, min = 0, max = null, precision = 2) {
  if (value === undefined || value === null || value === '') return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  let finalValue = parsed;
  if (finalValue < min) finalValue = min;
  if (max !== null && finalValue > max) finalValue = max;

  return Number(finalValue.toFixed(precision));
}

function sanitizeMode(value) {
  return value === 'individual' ? 'individual' : 'platform';
}

function sanitizeProviderType(value) {
  if (value === 'adsense' || value === 'generic' || value === 'manual') {
    return value;
  }

  return 'adsense';
}

function cleanText(value, maxLength = null) {
  if (value === undefined || value === null) return null;

  const cleaned = String(value).trim();

  if (!cleaned) return null;

  if (maxLength && cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength);
  }

  return cleaned;
}

function normalizeTemplateAdSettings(row = {}) {
  return {
    post_template_ads_enabled: toBooleanNumber(row.post_template_ads_enabled, 0),
    website_ads_enabled: toBooleanNumber(row.website_ads_enabled, 0),
    product_ads_enabled: toBooleanNumber(row.product_ads_enabled, 0),
    revenue_share_percent: Number(row.revenue_share_percent || 60),
    platform_share_percent: Number(row.platform_share_percent || 40),
    status: row.status || 'active',
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

function normalizeEligibilitySettings(row = {}) {
  return {
    paid_subscription_required: toBooleanNumber(
      row.paid_subscription_required,
      DEFAULT_ELIGIBILITY_SETTINGS.paid_subscription_required
    ),
    active_storefront_required: toBooleanNumber(
      row.active_storefront_required,
      DEFAULT_ELIGIBILITY_SETTINGS.active_storefront_required
    ),
    required_pages_count: normalizeInteger(
      row.required_pages_count,
      DEFAULT_ELIGIBILITY_SETTINGS.required_pages_count,
      0
    ),
    minimum_published_posts: normalizeInteger(
      row.minimum_published_posts,
      DEFAULT_ELIGIBILITY_SETTINGS.minimum_published_posts,
      0
    ),
    minimum_valid_page_views: normalizeInteger(
      row.minimum_valid_page_views,
      DEFAULT_ELIGIBILITY_SETTINGS.minimum_valid_page_views,
      0
    ),
    content_quality_review_required: toBooleanNumber(
      row.content_quality_review_required,
      DEFAULT_ELIGIBILITY_SETTINGS.content_quality_review_required
    ),

    local_ads_enabled: toBooleanNumber(
      row.local_ads_enabled,
      DEFAULT_ELIGIBILITY_SETTINGS.local_ads_enabled
    ),
    affiliate_ads_enabled: toBooleanNumber(
      row.affiliate_ads_enabled,
      DEFAULT_ELIGIBILITY_SETTINGS.affiliate_ads_enabled
    ),
    global_ads_enabled: toBooleanNumber(
      row.global_ads_enabled,
      DEFAULT_ELIGIBILITY_SETTINGS.global_ads_enabled
    ),
    personal_ad_id_enabled: toBooleanNumber(
      row.personal_ad_id_enabled,
      DEFAULT_ELIGIBILITY_SETTINGS.personal_ad_id_enabled
    ),

    publisher_max_revenue_percent: normalizeDecimal(
      row.publisher_max_revenue_percent,
      DEFAULT_ELIGIBILITY_SETTINGS.publisher_max_revenue_percent,
      0,
      100,
      2
    ),
    status: row.status === 'disabled' ? 'disabled' : 'active',
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

function normalizeSettings(row = {}, templateAdSettings = {}, eligibilitySettings = {}) {
  const monetizationMode = sanitizeMode(row.monetization_mode);

  return {
    monetization_mode: monetizationMode,

    provider_name: monetizationMode === 'individual' ? row.provider_name || '' : '',
    provider_type:
      monetizationMode === 'individual' ? sanitizeProviderType(row.provider_type) : 'adsense',
    publisher_id: monetizationMode === 'individual' ? row.publisher_id || '' : '',
    head_code: monetizationMode === 'individual' ? row.head_code || '' : '',
    notes: monetizationMode === 'individual' ? row.notes || '' : '',

    storefront_top_enabled: toBooleanNumber(row.storefront_top_enabled, 1),
    storefront_sidebar_enabled: toBooleanNumber(row.storefront_sidebar_enabled, 0),
    storefront_bottom_enabled: toBooleanNumber(row.storefront_bottom_enabled, 1),
    post_top_enabled: toBooleanNumber(row.post_top_enabled, 1),
    post_middle_enabled: toBooleanNumber(row.post_middle_enabled, 1),
    post_bottom_enabled: toBooleanNumber(row.post_bottom_enabled, 1),
    post_sidebar_enabled: toBooleanNumber(row.post_sidebar_enabled, 0),

    review_status: row.review_status || 'draft',
    submitted_at: row.submitted_at || null,
    reviewed_at: row.reviewed_at || null,
    admin_review_note: row.admin_review_note || '',

    content_quality_status: row.content_quality_status || 'pending',
    content_quality_note: row.content_quality_note || '',
    content_quality_reviewed_at: row.content_quality_reviewed_at || null,

    template_ads: normalizeTemplateAdSettings(templateAdSettings),
    eligibility_settings: normalizeEligibilitySettings(eligibilitySettings),

    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
      SELECT id, user_id, website_name, slug, status
      FROM affiliate_websites
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getExistingSettings(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        user_id,
        monetization_mode,
        provider_name,
        provider_type,
        publisher_id,
        head_code,
        notes,
        storefront_top_enabled,
        storefront_sidebar_enabled,
        storefront_bottom_enabled,
        post_top_enabled,
        post_middle_enabled,
        post_bottom_enabled,
        post_sidebar_enabled,
        review_status,
        submitted_at,
        reviewed_at,
        admin_review_note,
        content_quality_status,
        content_quality_note,
        content_quality_reviewed_at,
        created_at,
        updated_at
      FROM affiliate_monetization_settings
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getExistingTemplateAdSettings(userId, websiteId = null) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM affiliate_template_ad_settings
      WHERE affiliate_id = ?
        AND (
          website_id = ?
          OR website_id IS NULL
        )
      ORDER BY
        CASE WHEN website_id = ? THEN 0 ELSE 1 END,
        id DESC
      LIMIT 1
    `,
    [userId, websiteId || null, websiteId || null]
  );

  return rows[0] || null;
}

async function getEligibilitySettings() {
  await ensureBlogPulseEligibilitySettingsTable();

  const [rows] = await pool.query(
    `
      SELECT *
      FROM ${ELIGIBILITY_TABLE}
      ORDER BY id ASC
      LIMIT 1
    `
  );

  return normalizeEligibilitySettings(rows[0] || DEFAULT_ELIGIBILITY_SETTINGS);
}

async function createDefaultSettings(userId) {
  await pool.query(
    `
      INSERT INTO affiliate_monetization_settings
      (
        user_id,
        monetization_mode,
        storefront_top_enabled,
        storefront_sidebar_enabled,
        storefront_bottom_enabled,
        post_top_enabled,
        post_middle_enabled,
        post_bottom_enabled,
        post_sidebar_enabled,
        review_status,
        content_quality_status
      )
      VALUES (?, 'platform', 1, 0, 1, 1, 1, 1, 0, 'draft', 'pending')
      ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
    `,
    [userId]
  );

  return getExistingSettings(userId);
}

async function createDefaultTemplateAdSettings(userId, websiteId = null, eligibilitySettings = {}) {
  const publisherPercent = Number(
    eligibilitySettings.publisher_max_revenue_percent ||
      DEFAULT_ELIGIBILITY_SETTINGS.publisher_max_revenue_percent
  );

  await pool.query(
    `
      INSERT INTO affiliate_template_ad_settings
      (
        affiliate_id,
        website_id,
        post_template_ads_enabled,
        website_ads_enabled,
        product_ads_enabled,
        revenue_share_percent,
        platform_share_percent,
        status
      )
      VALUES (?, ?, 0, 0, 0, ?, ?, 'active')
      ON DUPLICATE KEY UPDATE affiliate_id = VALUES(affiliate_id)
    `,
    [userId, websiteId || null, publisherPercent, Math.max(0, 100 - publisherPercent)]
  );

  return getExistingTemplateAdSettings(userId, websiteId);
}

async function getActiveSubscriptionProgress(userId, eligibilitySettings) {
  if (!eligibilitySettings.paid_subscription_required) {
    return { current: 1, required: 1 };
  }

  const possibleTables = ['affiliate_subscriptions', 'subscriptions', 'user_subscriptions'];

  for (const table of possibleTables) {
    if (!(await tableExists(table))) continue;

    const userColumn = (await columnExists(table, 'user_id'))
      ? 'user_id'
      : (await columnExists(table, 'affiliate_id'))
      ? 'affiliate_id'
      : null;

    if (!userColumn) continue;

    const hasStatus = await columnExists(table, 'status');

    const where = [`${userColumn} = ?`];
    const params = [userId];

    if (hasStatus) {
      where.push(`status IN ('active','paid','approved','running')`);
    }

    const [rows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM ${table}
        WHERE ${where.join(' AND ')}
      `,
      params
    );

    return {
      current: Number(rows?.[0]?.total || 0) > 0 ? 1 : 0,
      required: 1,
    };
  }

  return { current: 0, required: 1 };
}

async function getPublishedPostsProgress(userId, websiteId, eligibilitySettings) {
  const required = Number(eligibilitySettings.minimum_published_posts || 0);

  if (required <= 0) {
    return { current: 1, required: 1 };
  }

  if (!(await tableExists('product_posts'))) {
    return { current: 0, required };
  }

  const conditions = [];
  const params = [];

  if (await columnExists('product_posts', 'user_id')) {
    conditions.push('user_id = ?');
    params.push(userId);
  } else if (await columnExists('product_posts', 'affiliate_id')) {
    conditions.push('affiliate_id = ?');
    params.push(userId);
  } else if (websiteId && (await columnExists('product_posts', 'website_id'))) {
    conditions.push('website_id = ?');
    params.push(websiteId);
  }

  if (!conditions.length) {
    return { current: 0, required };
  }

  if (await columnExists('product_posts', 'status')) {
    conditions.push(`status IN ('published','active','approved')`);
  } else if (await columnExists('product_posts', 'post_status')) {
    conditions.push(`post_status IN ('published','active','approved')`);
  }

  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM product_posts
      WHERE ${conditions.join(' AND ')}
    `,
    params
  );

  return {
    current: Number(rows?.[0]?.total || 0),
    required,
  };
}

async function getStorefrontProgress(website, eligibilitySettings) {
  if (!eligibilitySettings.active_storefront_required) {
    return { current: 1, required: 1 };
  }

  const activeStatuses = ['active', 'approved', 'published', 'live'];

  return {
    current: website && activeStatuses.includes(String(website.status || '').toLowerCase()) ? 1 : 0,
    required: 1,
  };
}

async function getRequiredPagesProgress(userId, websiteId, eligibilitySettings) {
  const required = Number(eligibilitySettings.required_pages_count || 0);

  if (required <= 0) {
    return { current: 1, required: 1 };
  }

  const possibleTables = ['affiliate_pages', 'website_pages', 'affiliate_menus'];

  for (const table of possibleTables) {
    if (!(await tableExists(table))) continue;

    const conditions = [];
    const params = [];

    if (await columnExists(table, 'user_id')) {
      conditions.push('user_id = ?');
      params.push(userId);
    } else if (await columnExists(table, 'affiliate_id')) {
      conditions.push('affiliate_id = ?');
      params.push(userId);
    } else if (websiteId && (await columnExists(table, 'website_id'))) {
      conditions.push('website_id = ?');
      params.push(websiteId);
    }

    if (!conditions.length) continue;

    const [rows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM ${table}
        WHERE ${conditions.join(' AND ')}
      `,
      params
    );

    return {
      current: Number(rows?.[0]?.total || 0),
      required,
    };
  }

  return { current: 0, required };
}

async function getValidViewsProgress(userId, websiteId, eligibilitySettings) {
  const required = Number(eligibilitySettings.minimum_valid_page_views || 0);

  if (required <= 0) {
    return { current: 1, required: 1 };
  }

  const possibleTables = [
    'blogpulse_views',
    'affiliate_post_views',
    'affiliate_analytics_views',
    'public_page_views',
    'affiliate_ads_views',
  ];

  for (const table of possibleTables) {
    if (!(await tableExists(table))) continue;

    const conditions = [];
    const params = [];

    if (await columnExists(table, 'user_id')) {
      conditions.push('user_id = ?');
      params.push(userId);
    } else if (await columnExists(table, 'affiliate_id')) {
      conditions.push('affiliate_id = ?');
      params.push(userId);
    } else if (websiteId && (await columnExists(table, 'website_id'))) {
      conditions.push('website_id = ?');
      params.push(websiteId);
    }

    if (!conditions.length) continue;

    if (await columnExists(table, 'is_valid')) {
      conditions.push('is_valid = 1');
    }

    const [rows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM ${table}
        WHERE ${conditions.join(' AND ')}
      `,
      params
    );

    return {
      current: Number(rows?.[0]?.total || 0),
      required,
    };
  }

  return { current: 0, required };
}

function getContentQualityProgress(settings, eligibilitySettings) {
  if (!eligibilitySettings.content_quality_review_required) {
    return { current: 1, required: 1 };
  }

  return {
    current: settings?.content_quality_status === 'approved' ? 1 : 0,
    required: 1,
  };
}

function buildRequirement({
  key,
  title,
  description,
  current,
  required,
  unit,
}) {
  const safeCurrent = Number(current || 0);
  const safeRequired = Number(required || 0);
  const passed = safeRequired <= 0 || safeCurrent >= safeRequired;

  return {
    key,
    title,
    description,
    current: safeCurrent,
    required: safeRequired,
    unit,
    status: passed ? 'passed' : 'in_progress',
    remaining: Math.max(safeRequired - safeCurrent, 0),
    percent: safeRequired > 0 ? Math.min(100, Math.round((safeCurrent / safeRequired) * 100)) : 100,
  };
}

async function buildEligibilityProgress(userId, website, settings, eligibilitySettings) {
  const subscription = await getActiveSubscriptionProgress(userId, eligibilitySettings);
  const storefront = await getStorefrontProgress(website, eligibilitySettings);
  const pages = await getRequiredPagesProgress(userId, website?.id, eligibilitySettings);
  const posts = await getPublishedPostsProgress(userId, website?.id, eligibilitySettings);
  const views = await getValidViewsProgress(userId, website?.id, eligibilitySettings);
  const quality = getContentQualityProgress(settings, eligibilitySettings);

  const requirements = [
    buildRequirement({
      key: 'subscription',
      title: 'Active paid subscription',
      description: eligibilitySettings.paid_subscription_required
        ? 'Admin requires an active paid plan before BlogPulse earnings can be approved.'
        : 'Admin has disabled paid subscription as a requirement.',
      current: subscription.current,
      required: subscription.required,
      unit: 'check',
    }),
    buildRequirement({
      key: 'storefront',
      title: 'Active storefront',
      description: eligibilitySettings.active_storefront_required
        ? 'Your storefront must be active and ready to receive traffic.'
        : 'Admin has disabled active storefront as a requirement.',
      current: storefront.current,
      required: storefront.required,
      unit: 'check',
    }),
    buildRequirement({
      key: 'policy_pages',
      title: 'Required pages completed',
      description: 'Admin controls how many required pages must be available.',
      current: pages.current,
      required: pages.required,
      unit: 'pages',
    }),
    buildRequirement({
      key: 'published_posts',
      title: 'Published posts target',
      description: 'Admin controls the minimum number of published posts required.',
      current: posts.current,
      required: posts.required,
      unit: 'posts',
    }),
    buildRequirement({
      key: 'valid_views',
      title: 'Valid page views target',
      description: 'Admin controls the minimum valid traffic required before approval.',
      current: views.current,
      required: views.required,
      unit: 'views',
    }),
    buildRequirement({
      key: 'content_quality',
      title: 'Original content review',
      description: eligibilitySettings.content_quality_review_required
        ? 'Admin must approve your content quality before earnings become active.'
        : 'Admin has disabled manual content quality review.',
      current: quality.current,
      required: quality.required,
      unit: 'review',
    }),
  ];

  const total = requirements.length;
  const passed = requirements.filter((item) => item.status === 'passed').length;
  const percent = total ? Math.round((passed / total) * 100) : 0;

  return {
    requirements,
    summary: {
      total,
      passed,
      percent,
      is_eligible: passed === total,
    },
    ad_programs: {
      local_ads_enabled: eligibilitySettings.local_ads_enabled,
      affiliate_ads_enabled: eligibilitySettings.affiliate_ads_enabled,
      global_ads_enabled: eligibilitySettings.global_ads_enabled,
      personal_ad_id_enabled: eligibilitySettings.personal_ad_id_enabled,
    },
    publisher_revenue_message: `Earn up to ${eligibilitySettings.publisher_max_revenue_percent}% ad revenue from eligible sponsored placements.`,
    content_quality: {
      status: settings?.content_quality_status || 'pending',
      note: settings?.content_quality_note || '',
      reviewed_at: settings?.content_quality_reviewed_at || null,
    },
  };
}

function validateSubmission(row) {
  const mode = sanitizeMode(row?.monetization_mode);

  if (mode !== 'individual') {
    return null;
  }

  const hasIndividualAdData =
    cleanText(row?.provider_name, 255) ||
    cleanText(row?.head_code) ||
    cleanText(row?.notes) ||
    cleanText(row?.publisher_id, 255);

  if (!hasIndividualAdData) {
    return null;
  }

  if (!cleanText(row?.provider_name, 255)) {
    return 'Provider name is required before submitting individual monetization.';
  }

  if (!cleanText(row?.head_code) && !cleanText(row?.notes) && !cleanText(row?.publisher_id, 255)) {
    return 'Add your individual monetization details before submission.';
  }

  return null;
}

async function getAffiliateMonetizationSettings(req, res) {
  try {
    await ensureTables();

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    const website = await getAffiliateWebsite(userId);
    const eligibilitySettings = await getEligibilitySettings();

    let settings = await getExistingSettings(userId);
    let templateAdSettings = await getExistingTemplateAdSettings(userId, website?.id || null);

    if (!settings) {
      settings = await createDefaultSettings(userId);
    }

    if (!templateAdSettings) {
      templateAdSettings = await createDefaultTemplateAdSettings(
        userId,
        website?.id || null,
        eligibilitySettings
      );
    }

    const eligibilityProgress = await buildEligibilityProgress(
      userId,
      website,
      settings,
      eligibilitySettings
    );

    return res.status(200).json({
      ok: true,
      message: 'Affiliate monetization settings fetched successfully.',
      website,
      settings: normalizeSettings(settings, templateAdSettings, eligibilitySettings),
      eligibility_settings: eligibilitySettings,
      eligibility_progress: eligibilityProgress,
    });
  } catch (error) {
    console.error('getAffiliateMonetizationSettings error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch affiliate monetization settings.',
      error: error.message,
    });
  }
}

async function saveAffiliateMonetizationSettings(req, res) {
  try {
    await ensureTables();

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    const website = await getAffiliateWebsite(userId);
    const existing = await getExistingSettings(userId);
    const eligibilitySettings = await getEligibilitySettings();
    const monetizationMode = sanitizeMode(req.body?.monetization_mode || existing?.monetization_mode || 'platform');

    const payload = {
      monetization_mode: monetizationMode,

      provider_name:
        monetizationMode === 'individual'
          ? cleanText(req.body?.provider_name, 255)
          : null,

      provider_type:
        monetizationMode === 'individual'
          ? sanitizeProviderType(req.body?.provider_type)
          : null,

      publisher_id:
        monetizationMode === 'individual'
          ? cleanText(req.body?.publisher_id, 255)
          : null,

      head_code:
        monetizationMode === 'individual'
          ? cleanText(req.body?.head_code)
          : null,

      notes:
        monetizationMode === 'individual'
          ? cleanText(req.body?.notes)
          : null,

      storefront_top_enabled: toBooleanNumber(req.body?.storefront_top_enabled, 1),
      storefront_sidebar_enabled: toBooleanNumber(req.body?.storefront_sidebar_enabled, 0),
      storefront_bottom_enabled: toBooleanNumber(req.body?.storefront_bottom_enabled, 1),
      post_top_enabled: toBooleanNumber(req.body?.post_top_enabled, 1),
      post_middle_enabled: toBooleanNumber(req.body?.post_middle_enabled, 1),
      post_bottom_enabled: toBooleanNumber(req.body?.post_bottom_enabled, 1),
      post_sidebar_enabled: toBooleanNumber(req.body?.post_sidebar_enabled, 0),

      review_status: existing?.review_status || 'draft',
      content_quality_status: existing?.content_quality_status || 'pending',
    };

    const templateAdsPayload = {
      post_template_ads_enabled: toBooleanNumber(req.body?.template_ads?.post_template_ads_enabled, 0),
      website_ads_enabled: toBooleanNumber(req.body?.template_ads?.website_ads_enabled, 0),
      product_ads_enabled: toBooleanNumber(req.body?.template_ads?.product_ads_enabled, 0),
      status: toBooleanNumber(req.body?.template_ads?.ads_enabled, 1) ? 'active' : 'disabled',
    };

    await pool.query(
      `
        INSERT INTO affiliate_monetization_settings
        (
          user_id,
          monetization_mode,
          provider_name,
          provider_type,
          publisher_id,
          head_code,
          notes,
          storefront_top_enabled,
          storefront_sidebar_enabled,
          storefront_bottom_enabled,
          post_top_enabled,
          post_middle_enabled,
          post_bottom_enabled,
          post_sidebar_enabled,
          review_status,
          content_quality_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          monetization_mode = VALUES(monetization_mode),
          provider_name = VALUES(provider_name),
          provider_type = VALUES(provider_type),
          publisher_id = VALUES(publisher_id),
          head_code = VALUES(head_code),
          notes = VALUES(notes),
          storefront_top_enabled = VALUES(storefront_top_enabled),
          storefront_sidebar_enabled = VALUES(storefront_sidebar_enabled),
          storefront_bottom_enabled = VALUES(storefront_bottom_enabled),
          post_top_enabled = VALUES(post_top_enabled),
          post_middle_enabled = VALUES(post_middle_enabled),
          post_bottom_enabled = VALUES(post_bottom_enabled),
          post_sidebar_enabled = VALUES(post_sidebar_enabled),
          review_status = VALUES(review_status),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        userId,
        payload.monetization_mode,
        payload.provider_name,
        payload.provider_type,
        payload.publisher_id,
        payload.head_code,
        payload.notes,
        payload.storefront_top_enabled,
        payload.storefront_sidebar_enabled,
        payload.storefront_bottom_enabled,
        payload.post_top_enabled,
        payload.post_middle_enabled,
        payload.post_bottom_enabled,
        payload.post_sidebar_enabled,
        payload.review_status,
        payload.content_quality_status,
      ]
    );

    await pool.query(
      `
        INSERT INTO affiliate_template_ad_settings
        (
          affiliate_id,
          website_id,
          post_template_ads_enabled,
          website_ads_enabled,
          product_ads_enabled,
          revenue_share_percent,
          platform_share_percent,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          post_template_ads_enabled = VALUES(post_template_ads_enabled),
          website_ads_enabled = VALUES(website_ads_enabled),
          product_ads_enabled = VALUES(product_ads_enabled),
          revenue_share_percent = VALUES(revenue_share_percent),
          platform_share_percent = VALUES(platform_share_percent),
          status = VALUES(status),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        userId,
        website?.id || null,
        templateAdsPayload.post_template_ads_enabled,
        templateAdsPayload.website_ads_enabled,
        templateAdsPayload.product_ads_enabled,
        eligibilitySettings.publisher_max_revenue_percent,
        Math.max(0, 100 - Number(eligibilitySettings.publisher_max_revenue_percent || 0)),
        templateAdsPayload.status,
      ]
    );

    const saved = await getExistingSettings(userId);
    const savedTemplateAds = await getExistingTemplateAdSettings(userId, website?.id || null);

    const eligibilityProgress = await buildEligibilityProgress(
      userId,
      website,
      saved,
      eligibilitySettings
    );

    return res.status(200).json({
      ok: true,
      message: 'Affiliate monetization settings saved successfully.',
      website,
      settings: normalizeSettings(saved, savedTemplateAds, eligibilitySettings),
      eligibility_settings: eligibilitySettings,
      eligibility_progress: eligibilityProgress,
    });
  } catch (error) {
    console.error('saveAffiliateMonetizationSettings error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save affiliate monetization settings.',
      error: error.message,
    });
  }
}

async function submitAffiliateMonetizationForReview(req, res) {
  try {
    await ensureTables();

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    const website = await getAffiliateWebsite(userId);
    const eligibilitySettings = await getEligibilitySettings();

    let settings = await getExistingSettings(userId);

    if (!settings) {
      settings = await createDefaultSettings(userId);
    }

    const eligibilityProgress = await buildEligibilityProgress(
      userId,
      website,
      settings,
      eligibilitySettings
    );

    if (!eligibilityProgress.summary.is_eligible) {
      return res.status(400).json({
        ok: false,
        message: 'You have not met the current BlogPulse monetization eligibility requirements.',
        eligibility_settings: eligibilitySettings,
        eligibility_progress: eligibilityProgress,
      });
    }

    const validationError = validateSubmission(settings);

    if (validationError) {
      return res.status(400).json({
        ok: false,
        message: validationError,
      });
    }

    await pool.query(
      `
        UPDATE affiliate_monetization_settings
        SET
          review_status = 'pending',
          submitted_at = CURRENT_TIMESTAMP,
          reviewed_at = NULL,
          admin_review_note = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `,
      [userId]
    );

    const submitted = await getExistingSettings(userId);
    const templateAdSettings = await getExistingTemplateAdSettings(userId, website?.id || null);
    const updatedProgress = await buildEligibilityProgress(
      userId,
      website,
      submitted,
      eligibilitySettings
    );

    return res.status(200).json({
      ok: true,
      message: 'Your monetization setup has been submitted for review.',
      website,
      settings: normalizeSettings(submitted, templateAdSettings, eligibilitySettings),
      eligibility_settings: eligibilitySettings,
      eligibility_progress: updatedProgress,
    });
  } catch (error) {
    console.error('submitAffiliateMonetizationForReview error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to submit monetization setup for review.',
      error: error.message,
    });
  }
}

module.exports = {
  getAffiliateMonetizationSettings,
  saveAffiliateMonetizationSettings,
  submitAffiliateMonetizationForReview,
};