const pool = require('../../config/db');

let monetizationTableReady = false;

async function ensureAffiliateMonetizationTable() {
  if (monetizationTableReady) return;

  await pool.query(`
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
      UNIQUE KEY uniq_affiliate_monetization_user (user_id),
      CONSTRAINT fk_affiliate_monetization_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
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

  monetizationTableReady = true;
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

function toBooleanNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value ? 1 : 0;

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return 1;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return 0;

  return fallback;
}

function sanitizeMode(value) {
  return value === 'platform' ? 'platform' : 'individual';
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

function normalizeSettings(row = {}) {
  const monetizationMode = sanitizeMode(row.monetization_mode);

  return {
    monetization_mode: monetizationMode,

    provider_name: monetizationMode === 'individual' ? row.provider_name || '' : '',
    provider_type: monetizationMode === 'individual'
      ? sanitizeProviderType(row.provider_type)
      : 'adsense',
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

    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
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
        review_status
      )
      VALUES (?, 'individual', 1, 0, 1, 1, 1, 1, 0, 'draft')
      ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
    `,
    [userId]
  );

  return getExistingSettings(userId);
}

function validateSubmission(row) {
  const mode = sanitizeMode(row?.monetization_mode);

  if (mode === 'individual') {
    if (!cleanText(row?.provider_name, 255)) {
      return 'Provider name is required before submission.';
    }

    if (!cleanText(row?.head_code) && !cleanText(row?.notes) && !cleanText(row?.publisher_id, 255)) {
      return 'Add your monetization details before submission.';
    }
  }

  return null;
}

async function getAffiliateMonetizationSettings(req, res) {
  try {
    await ensureAffiliateMonetizationTable();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    let settings = await getExistingSettings(userId);

    if (!settings) {
      settings = await createDefaultSettings(userId);
    }

    return res.status(200).json({
      ok: true,
      message: 'Affiliate monetization settings fetched successfully.',
      settings: normalizeSettings(settings),
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
    await ensureAffiliateMonetizationTable();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    const existing = await getExistingSettings(userId);
    const monetizationMode = sanitizeMode(req.body?.monetization_mode);

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
          review_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ]
    );

    const saved = await getExistingSettings(userId);

    return res.status(200).json({
      ok: true,
      message: 'Affiliate monetization settings saved successfully.',
      settings: normalizeSettings(saved),
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
    await ensureAffiliateMonetizationTable();

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    let settings = await getExistingSettings(userId);

    if (!settings) {
      settings = await createDefaultSettings(userId);
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

    return res.status(200).json({
      ok: true,
      message: 'Your monetization setup has been submitted for review.',
      settings: normalizeSettings(submitted),
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