const pool = require('../config/db');
const { validateSupgadUrl } = require('../utils/validateSupgadUrl');

async function logLinkValidation({
  userId = null,
  websiteId = null,
  sourceType,
  sourceId = null,
  submittedLink,
  detectedHost = null,
  isAllowed = false,
  failureReason = null,
}) {
  try {
    await pool.query(
      `
      INSERT INTO link_validation_logs
      (
        user_id,
        website_id,
        source_type,
        source_id,
        submitted_link,
        detected_host,
        is_allowed,
        failure_reason,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        userId,
        websiteId,
        sourceType,
        sourceId,
        submittedLink,
        detectedHost,
        isAllowed ? 1 : 0,
        failureReason,
      ]
    );
  } catch (error) {
    console.error('logLinkValidation error:', error.message);
  }
}

async function validateAndLogSupgadUrl({
  value,
  fieldName = 'URL',
  required = false,
  allowEmpty = true,
  userId = null,
  websiteId = null,
  sourceType,
  sourceId = null,
}) {
  const result = validateSupgadUrl(value, {
    required,
    allowEmpty,
    fieldName,
  });

  await logLinkValidation({
    userId,
    websiteId,
    sourceType,
    sourceId,
    submittedLink: result.submitted_link || '',
    detectedHost: result.detected_host || null,
    isAllowed: result.ok,
    failureReason: result.ok ? null : result.message,
  });

  return result;
}

async function assertAndLogSupgadUrl(options) {
  const result = await validateAndLogSupgadUrl(options);

  if (!result.ok) {
    const error = new Error(result.message);
    error.status = 400;
    error.validation = result;
    throw error;
  }

  return result;
}

async function validateMultipleSupgadUrls(items = []) {
  const results = [];

  for (const item of items) {
    const result = await validateAndLogSupgadUrl(item);
    results.push(result);
  }

  return results;
}

module.exports = {
  logLinkValidation,
  validateAndLogSupgadUrl,
  assertAndLogSupgadUrl,
  validateMultipleSupgadUrls,
};