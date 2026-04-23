const pool = require('../../config/db');

const SETTINGS_TABLE = 'blogpulse_settings';

const BASE_DEFAULT_SETTINGS = {
  is_enabled: 0,
  premium_only: 1,
  default_rate_per_view: 0.0001,
  minimum_view_seconds: 15,
  minimum_scroll_percent: 10,
  ip_repeat_window_hours: 24,
  fingerprint_repeat_window_hours: 24,
  daily_ip_view_cap: 5,
  withdrawal_threshold: 10,
  count_only_if_ad_loaded: 0,
  block_vpn_proxy_traffic: 0,
  block_suspicious_user_agents: 1,
};

const OPTIONAL_DEFAULT_SETTINGS = {
  allow_individual_monetization: 1,
  individual_requires_admin_approval: 1,
  individual_premium_only: 1,
  allow_custom_html_ad_code: 0,
  allow_network_js_code: 1,
};

function normalizeBoolean(value, fallback = 0) {
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

function normalizeDecimal(value, fallback, min = 0, max = null, precision = 8) {
  if (value === undefined || value === null || value === '') return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  let finalValue = parsed;
  if (finalValue < min) finalValue = min;
  if (max !== null && finalValue > max) finalValue = max;

  return Number(finalValue.toFixed(precision));
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

function sanitizeReviewStatus(value) {
  if (value === 'approved' || value === 'rejected' || value === 'pending' || value === 'draft') {
    return value;
  }
  return 'pending';
}

async function getExistingColumns(connection, tableName) {
  const [rows] = await connection.query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
    `,
    [tableName]
  );

  return new Set(rows.map((row) => row.COLUMN_NAME));
}

async function ensureColumn(connection, tableName, columnName, alterSql) {
  const [rows] = await connection.query(
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
    await connection.query(alterSql);
  }
}

async function ensureAffiliateMonetizationReviewColumns(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS affiliate_monetization_settings (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      monetization_mode ENUM('individual', 'platform') NOT NULL DEFAULT 'individual',
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
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_affiliate_monetization_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await ensureColumn(
    connection,
    'affiliate_monetization_settings',
    'review_status',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN review_status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft' AFTER post_sidebar_enabled"
  );

  await ensureColumn(
    connection,
    'affiliate_monetization_settings',
    'submitted_at',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN submitted_at TIMESTAMP NULL DEFAULT NULL AFTER review_status"
  );

  await ensureColumn(
    connection,
    'affiliate_monetization_settings',
    'reviewed_at',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN reviewed_at TIMESTAMP NULL DEFAULT NULL AFTER submitted_at"
  );

  await ensureColumn(
    connection,
    'affiliate_monetization_settings',
    'admin_review_note',
    "ALTER TABLE affiliate_monetization_settings ADD COLUMN admin_review_note TEXT DEFAULT NULL AFTER reviewed_at"
  );
}

async function ensureSettingsRow(connection, availableColumns) {
  const [existingRows] = await connection.query(
    `SELECT id FROM \`${SETTINGS_TABLE}\` ORDER BY id ASC LIMIT 1`
  );

  if (existingRows.length > 0) {
    return existingRows[0].id;
  }

  const mergedDefaults = {
    ...BASE_DEFAULT_SETTINGS,
    ...OPTIONAL_DEFAULT_SETTINGS,
  };

  const insertableEntries = Object.entries(mergedDefaults).filter(([key]) =>
    availableColumns.has(key)
  );

  if (insertableEntries.length === 0) {
    const [result] = await connection.query(
      `INSERT INTO \`${SETTINGS_TABLE}\` () VALUES ()`
    );
    return result.insertId;
  }

  const columns = insertableEntries.map(([key]) => `\`${key}\``).join(', ');
  const placeholders = insertableEntries.map(() => '?').join(', ');
  const values = insertableEntries.map(([, value]) => value);

  const [result] = await connection.query(
    `INSERT INTO \`${SETTINGS_TABLE}\` (${columns}) VALUES (${placeholders})`,
    values
  );

  return result.insertId;
}

function buildSelectableFields(availableColumns) {
  const fields = ['id'];

  [
    ...Object.keys(BASE_DEFAULT_SETTINGS),
    ...Object.keys(OPTIONAL_DEFAULT_SETTINGS),
    'created_at',
    'updated_at',
  ].forEach((field) => {
    if (availableColumns.has(field)) fields.push(field);
  });

  return fields;
}

function buildResponsePayload(row = {}, availableColumns = new Set()) {
  const payload = {};

  Object.keys(BASE_DEFAULT_SETTINGS).forEach((key) => {
    if (availableColumns.has(key)) {
      payload[key] = row[key];
    }
  });

  Object.keys(OPTIONAL_DEFAULT_SETTINGS).forEach((key) => {
    if (availableColumns.has(key)) {
      payload[key] = row[key];
    }
  });

  if (availableColumns.has('created_at')) payload.created_at = row.created_at || null;
  if (availableColumns.has('updated_at')) payload.updated_at = row.updated_at || null;

  return payload;
}

function buildEligibilityPolicy() {
  return {
    program_name: 'BlogPulse Earnings',
    platform_modes: [
      {
        key: 'platform',
        label: 'Platform Monetization',
        description:
          'Bloggad platform ads run on eligible premium blogs and valid traffic can earn BlogPulse credits.',
      },
      {
        key: 'individual',
        label: 'Individual Monetization',
        description:
          'Affiliate uses their own approved ad code on their own storefront and post pages only.',
      },
    ],
    minimum_requirements: [
      'Active paid subscription is required. Free plans are not eligible.',
      'Storefront/blog must be active and not suspended.',
      'Content must be original and policy-safe.',
      'Required pages should exist: About, Contact, Privacy Policy, and Terms.',
      'Traffic must pass duplicate-IP and anti-bot checks.',
      'Admin approval is required before monetization goes live.',
    ],
    notes: [
      'Platform monetization pays through BlogPulse wallet rules.',
      'Individual monetization uses the affiliate’s own ad code and does not credit BlogPulse per-view earnings.',
    ],
  };
}

async function getSettingsRow(connection) {
  const availableColumns = await getExistingColumns(connection, SETTINGS_TABLE);
  const settingsId = await ensureSettingsRow(connection, availableColumns);

  const fields = buildSelectableFields(availableColumns).join(', ');
  const [rows] = await connection.query(
    `SELECT ${fields} FROM \`${SETTINGS_TABLE}\` WHERE id = ? LIMIT 1`,
    [settingsId]
  );

  return {
    row: rows[0] || { id: settingsId },
    availableColumns,
  };
}

async function getAdminBlogPulseSettings(req, res) {
  try {
    const { row, availableColumns } = await getSettingsRow(pool);

    return res.status(200).json({
      ok: true,
      message: 'BlogPulse settings fetched successfully.',
      settings: buildResponsePayload(row, availableColumns),
      policy: buildEligibilityPolicy(),
    });
  } catch (error) {
    console.error('getAdminBlogPulseSettings error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch BlogPulse settings.',
      error: error.message,
    });
  }
}

async function updateAdminBlogPulseSettings(req, res) {
  try {
    const { row, availableColumns } = await getSettingsRow(pool);

    const nextValues = {};
    const assignIfSupported = (field, value) => {
      if (availableColumns.has(field)) {
        nextValues[field] = value;
      }
    };

    assignIfSupported(
      'is_enabled',
      normalizeBoolean(req.body.is_enabled, row.is_enabled ?? BASE_DEFAULT_SETTINGS.is_enabled)
    );
    assignIfSupported(
      'premium_only',
      normalizeBoolean(req.body.premium_only, row.premium_only ?? BASE_DEFAULT_SETTINGS.premium_only)
    );
    assignIfSupported(
      'default_rate_per_view',
      normalizeDecimal(
        req.body.default_rate_per_view,
        row.default_rate_per_view ?? BASE_DEFAULT_SETTINGS.default_rate_per_view,
        0,
        null,
        8
      )
    );
    assignIfSupported(
      'minimum_view_seconds',
      normalizeInteger(
        req.body.minimum_view_seconds,
        row.minimum_view_seconds ?? BASE_DEFAULT_SETTINGS.minimum_view_seconds,
        0
      )
    );
    assignIfSupported(
      'minimum_scroll_percent',
      normalizeInteger(
        req.body.minimum_scroll_percent,
        row.minimum_scroll_percent ?? BASE_DEFAULT_SETTINGS.minimum_scroll_percent,
        0,
        100
      )
    );
    assignIfSupported(
      'ip_repeat_window_hours',
      normalizeInteger(
        req.body.ip_repeat_window_hours,
        row.ip_repeat_window_hours ?? BASE_DEFAULT_SETTINGS.ip_repeat_window_hours,
        1
      )
    );
    assignIfSupported(
      'fingerprint_repeat_window_hours',
      normalizeInteger(
        req.body.fingerprint_repeat_window_hours,
        row.fingerprint_repeat_window_hours ?? BASE_DEFAULT_SETTINGS.fingerprint_repeat_window_hours,
        1
      )
    );
    assignIfSupported(
      'daily_ip_view_cap',
      normalizeInteger(
        req.body.daily_ip_view_cap,
        row.daily_ip_view_cap ?? BASE_DEFAULT_SETTINGS.daily_ip_view_cap,
        1
      )
    );
    assignIfSupported(
      'withdrawal_threshold',
      normalizeDecimal(
        req.body.withdrawal_threshold,
        row.withdrawal_threshold ?? BASE_DEFAULT_SETTINGS.withdrawal_threshold,
        0,
        null,
        2
      )
    );
    assignIfSupported(
      'count_only_if_ad_loaded',
      normalizeBoolean(
        req.body.count_only_if_ad_loaded,
        row.count_only_if_ad_loaded ?? BASE_DEFAULT_SETTINGS.count_only_if_ad_loaded
      )
    );
    assignIfSupported(
      'block_vpn_proxy_traffic',
      normalizeBoolean(
        req.body.block_vpn_proxy_traffic,
        row.block_vpn_proxy_traffic ?? BASE_DEFAULT_SETTINGS.block_vpn_proxy_traffic
      )
    );
    assignIfSupported(
      'block_suspicious_user_agents',
      normalizeBoolean(
        req.body.block_suspicious_user_agents,
        row.block_suspicious_user_agents ?? BASE_DEFAULT_SETTINGS.block_suspicious_user_agents
      )
    );
    assignIfSupported(
      'allow_individual_monetization',
      normalizeBoolean(
        req.body.allow_individual_monetization,
        row.allow_individual_monetization ?? OPTIONAL_DEFAULT_SETTINGS.allow_individual_monetization
      )
    );
    assignIfSupported(
      'individual_requires_admin_approval',
      normalizeBoolean(
        req.body.individual_requires_admin_approval,
        row.individual_requires_admin_approval ??
          OPTIONAL_DEFAULT_SETTINGS.individual_requires_admin_approval
      )
    );
    assignIfSupported(
      'individual_premium_only',
      normalizeBoolean(
        req.body.individual_premium_only,
        row.individual_premium_only ?? OPTIONAL_DEFAULT_SETTINGS.individual_premium_only
      )
    );
    assignIfSupported(
      'allow_custom_html_ad_code',
      normalizeBoolean(
        req.body.allow_custom_html_ad_code,
        row.allow_custom_html_ad_code ?? OPTIONAL_DEFAULT_SETTINGS.allow_custom_html_ad_code
      )
    );
    assignIfSupported(
      'allow_network_js_code',
      normalizeBoolean(
        req.body.allow_network_js_code,
        row.allow_network_js_code ?? OPTIONAL_DEFAULT_SETTINGS.allow_network_js_code
      )
    );

    const updateEntries = Object.entries(nextValues);

    if (!updateEntries.length) {
      return res.status(400).json({
        ok: false,
        message: 'No valid BlogPulse settings fields were provided.',
      });
    }

    const setClause = updateEntries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const values = updateEntries.map(([, value]) => value);

    await pool.query(
      `UPDATE \`${SETTINGS_TABLE}\` SET ${setClause} WHERE id = ?`,
      [...values, row.id]
    );

    const refreshed = await getSettingsRow(pool);

    return res.status(200).json({
      ok: true,
      message: 'BlogPulse settings updated successfully.',
      settings: buildResponsePayload(refreshed.row, refreshed.availableColumns),
      policy: buildEligibilityPolicy(),
    });
  } catch (error) {
    console.error('updateAdminBlogPulseSettings error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update BlogPulse settings.',
      error: error.message,
    });
  }
}

async function getAdminBlogPulsePolicy(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      message: 'BlogPulse policy fetched successfully.',
      policy: buildEligibilityPolicy(),
    });
  } catch (error) {
    console.error('getAdminBlogPulsePolicy error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch BlogPulse policy.',
      error: error.message,
    });
  }
}

async function getAdminMonetizationSubmissions(req, res) {
  try {
    await ensureAffiliateMonetizationReviewColumns(pool);

    const approvalStatus = cleanText(req.query.approval_status, 20) || 'all';
    const monetizationMode = cleanText(req.query.monetization_mode, 20) || 'all';
    const providerType = cleanText(req.query.provider_type, 20) || 'all';
    const websiteStatus = cleanText(req.query.website_status, 20) || 'all';
    const search = cleanText(req.query.search, 100);

    const conditions = [];
    const params = [];

    if (approvalStatus !== 'all') {
      conditions.push('ams.review_status = ?');
      params.push(approvalStatus);
    }

    if (monetizationMode !== 'all') {
      if (monetizationMode === 'none') {
        conditions.push('(ams.id IS NULL OR ams.monetization_mode IS NULL)');
      } else {
        conditions.push('ams.monetization_mode = ?');
        params.push(monetizationMode);
      }
    }

    if (providerType !== 'all') {
      conditions.push('ams.provider_type = ?');
      params.push(providerType);
    }

    if (websiteStatus !== 'all') {
      conditions.push('aw.status = ?');
      params.push(websiteStatus);
    }

    if (search) {
      conditions.push(`
        (
          u.name LIKE ?
          OR u.email LIKE ?
          OR aw.website_name LIKE ?
          OR aw.slug LIKE ?
          OR ams.provider_name LIKE ?
        )
      `);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `
        SELECT
          ams.id,
          ams.user_id,
          ams.monetization_mode,
          ams.provider_name,
          ams.provider_type,
          ams.publisher_id,
          ams.head_code,
          ams.notes,
          ams.storefront_top_enabled,
          ams.storefront_sidebar_enabled,
          ams.storefront_bottom_enabled,
          ams.post_top_enabled,
          ams.post_middle_enabled,
          ams.post_bottom_enabled,
          ams.post_sidebar_enabled,
          ams.review_status,
          ams.submitted_at,
          ams.reviewed_at,
          ams.admin_review_note,
          ams.created_at,
          ams.updated_at,
          u.name AS user_name,
          u.email AS user_email,
          u.status AS user_status,
          aw.id AS website_id,
          aw.website_name,
          aw.slug AS website_slug,
          aw.status AS website_status
        FROM affiliate_monetization_settings ams
        INNER JOIN users u
          ON u.id = ams.user_id
        LEFT JOIN affiliate_websites aw
          ON aw.user_id = ams.user_id
        ${whereClause}
        ORDER BY
          CASE ams.review_status
            WHEN 'pending' THEN 1
            WHEN 'rejected' THEN 2
            WHEN 'approved' THEN 3
            ELSE 4
          END,
          ams.submitted_at DESC,
          ams.updated_at DESC
      `,
      params
    );

    return res.status(200).json({
      ok: true,
      message: 'Monetization submissions fetched successfully.',
      submissions: rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        affiliate: {
          name: row.user_name,
          email: row.user_email,
          status: row.user_status,
        },
        website: row.website_id
          ? {
              id: row.website_id,
              website_name: row.website_name,
              slug: row.website_slug,
              status: row.website_status,
            }
          : null,
        monetization_mode: row.monetization_mode,
        provider_name: row.provider_name || '',
        provider_type: row.provider_type || '',
        publisher_id: row.publisher_id || '',
        head_code: row.head_code || '',
        notes: row.notes || '',
        placements: {
          storefront_top_enabled: Number(row.storefront_top_enabled || 0),
          storefront_sidebar_enabled: Number(row.storefront_sidebar_enabled || 0),
          storefront_bottom_enabled: Number(row.storefront_bottom_enabled || 0),
          post_top_enabled: Number(row.post_top_enabled || 0),
          post_middle_enabled: Number(row.post_middle_enabled || 0),
          post_bottom_enabled: Number(row.post_bottom_enabled || 0),
          post_sidebar_enabled: Number(row.post_sidebar_enabled || 0),
        },
        review_status: row.review_status || 'draft',
        submitted_at: row.submitted_at || null,
        reviewed_at: row.reviewed_at || null,
        admin_review_note: row.admin_review_note || '',
        created_at: row.created_at || null,
        updated_at: row.updated_at || null,
      })),
    });
  } catch (error) {
    console.error('getAdminMonetizationSubmissions error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch monetization submissions.',
      error: error.message,
    });
  }
}

async function reviewAdminMonetizationSubmission(req, res) {
  try {
    await ensureAffiliateMonetizationReviewColumns(pool);

    const submissionId = Number(req.params.submissionId);
    const reviewStatus = sanitizeReviewStatus(req.body.review_status);
    const adminReviewNote = cleanText(req.body.admin_review_note);

    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid submission id.',
      });
    }

    if (!['approved', 'rejected'].includes(reviewStatus)) {
      return res.status(400).json({
        ok: false,
        message: 'Review status must be approved or rejected.',
      });
    }

    const [[existing]] = await pool.query(
      `
        SELECT id
        FROM affiliate_monetization_settings
        WHERE id = ?
        LIMIT 1
      `,
      [submissionId]
    );

    if (!existing) {
      return res.status(404).json({
        ok: false,
        message: 'Monetization submission not found.',
      });
    }

    await pool.query(
      `
        UPDATE affiliate_monetization_settings
        SET
          review_status = ?,
          reviewed_at = CURRENT_TIMESTAMP,
          admin_review_note = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [reviewStatus, adminReviewNote, submissionId]
    );

    const [[updated]] = await pool.query(
      `
        SELECT
          id,
          review_status,
          reviewed_at,
          admin_review_note
        FROM affiliate_monetization_settings
        WHERE id = ?
        LIMIT 1
      `,
      [submissionId]
    );

    return res.status(200).json({
      ok: true,
      message:
        reviewStatus === 'approved'
          ? 'Monetization submission approved successfully.'
          : 'Monetization submission rejected successfully.',
      submission: {
        id: updated.id,
        review_status: updated.review_status,
        reviewed_at: updated.reviewed_at,
        admin_review_note: updated.admin_review_note || '',
      },
    });
  } catch (error) {
    console.error('reviewAdminMonetizationSubmission error:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Failed to review monetization submission.',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminBlogPulseSettings,
  updateAdminBlogPulseSettings,
  getAdminBlogPulsePolicy,
  getAdminMonetizationSubmissions,
  reviewAdminMonetizationSubmission,
};