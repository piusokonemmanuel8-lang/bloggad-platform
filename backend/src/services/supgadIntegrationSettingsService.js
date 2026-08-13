const pool = require('../config/db');
const {
  encryptCredential,
  decryptCredential,
} = require('./paymentCredentialService');

const KEYS = {
  ssoSecret: 'supgad_integration_sso_secret_encrypted',
  syncKey: 'supgad_integration_sync_key_encrypted',
  apiBaseUrl: 'supgad_integration_api_base_url',
};

function cleanText(value, maxLength) {
  return String(value ?? '')
    .trim()
    .slice(0, maxLength);
}

function normalizeBaseUrl(value) {
  const raw = cleanText(value, 500);

  if (!raw) return '';

  let parsed;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('Supgad API Base URL must be a valid http or https URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Supgad API Base URL must use http or https.');
  }

  return parsed.origin;
}

async function readSetting(key, connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT setting_value
    FROM admin_settings
    WHERE setting_key = ?
    LIMIT 1
    `,
    [key]
  );

  return rows[0]?.setting_value === null ||
    rows[0]?.setting_value === undefined
    ? ''
    : String(rows[0].setting_value);
}

async function writeSetting(key, value, connection = pool) {
  await connection.query(
    `
    INSERT INTO admin_settings (setting_key, setting_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value)
    `,
    [key, value]
  );
}

async function configuredSecret(key, connection = pool) {
  const stored = await readSetting(key, connection);
  return Boolean(stored);
}

async function getAdminSupgadIntegrationSettings() {
  const [ssoConfigured, syncConfigured, apiBaseUrl] = await Promise.all([
    configuredSecret(KEYS.ssoSecret),
    configuredSecret(KEYS.syncKey),
    readSetting(KEYS.apiBaseUrl),
  ]);

  return {
    sso_secret_configured:
      ssoConfigured ||
      Boolean(String(process.env.BLOGGAD_SSO_SECRET || '').trim()),
    sso_secret_source: ssoConfigured ? 'admin' : 'env',
    sync_key_configured:
      syncConfigured ||
      Boolean(String(process.env.BLOGGAD_SUPGAD_SYNC_KEY || '').trim()),
    sync_key_source: syncConfigured ? 'admin' : 'env',
    api_base_url: apiBaseUrl,
    encryption_ready:
      String(process.env.BLOGGAD_PAYMENT_CREDENTIALS_KEY || '').trim().length >=
      32,
  };
}

async function saveAdminSupgadIntegrationSettings(input = {}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const ssoSecret = cleanText(input.sso_secret, 8192);
    const syncKey = cleanText(input.sync_key, 8192);
    const apiBaseUrl =
      input.api_base_url === undefined
        ? null
        : normalizeBaseUrl(input.api_base_url);

    if (ssoSecret) {
      await writeSetting(
        KEYS.ssoSecret,
        encryptCredential(ssoSecret),
        connection
      );
    }

    if (syncKey) {
      await writeSetting(
        KEYS.syncKey,
        encryptCredential(syncKey),
        connection
      );
    }

    if (apiBaseUrl !== null) {
      await writeSetting(KEYS.apiBaseUrl, apiBaseUrl, connection);
    }

    await connection.commit();

    return await getAdminSupgadIntegrationSettings();
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    throw error;
  } finally {
    connection.release();
  }
}

async function getSupgadSsoSecret() {
  const stored = await readSetting(KEYS.ssoSecret);

  if (stored) {
    return decryptCredential(stored);
  }

  return String(process.env.BLOGGAD_SSO_SECRET || '').trim();
}

async function getSupgadSyncKey() {
  const stored = await readSetting(KEYS.syncKey);

  if (stored) {
    return decryptCredential(stored);
  }

  return String(process.env.BLOGGAD_SUPGAD_SYNC_KEY || '').trim();
}

async function getSupgadApiBaseUrl() {
  const stored = await readSetting(KEYS.apiBaseUrl);
  return stored ? normalizeBaseUrl(stored) : '';
}

module.exports = {
  getAdminSupgadIntegrationSettings,
  saveAdminSupgadIntegrationSettings,
  getSupgadSsoSecret,
  getSupgadSyncKey,
  getSupgadApiBaseUrl,
};