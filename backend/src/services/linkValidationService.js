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

async function getLatestUserPlanLinkPermission(userId) {
  if (!userId) {
    return {
      allow_external_links: false,
      plan_id: null,
      subscription_id: null,
    };
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.id AS subscription_id,
        s.plan_id,
        s.status AS subscription_status,
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

    const row = rows[0] || null;

    if (!row) {
      return {
        allow_external_links: false,
        plan_id: null,
        subscription_id: null,
      };
    }

    return {
      allow_external_links: !!row.allow_external_links,
      plan_id: row.plan_id || null,
      subscription_id: row.subscription_id || null,
      subscription_status: row.subscription_status || null,
    };
  } catch (error) {
    console.error('getLatestUserPlanLinkPermission error:', error.message);

    return {
      allow_external_links: false,
      plan_id: null,
      subscription_id: null,
    };
  }
}

async function getOutboundDomainRule(hostname) {
  const cleanHost = String(hostname || '').trim().toLowerCase().replace(/\.$/, '');

  if (!cleanHost) return null;

  const [rows] = await pool.query(
    `
    SELECT
      id,
      domain,
      rule_status,
      category,
      reason,
      applies_to_subdomains,
      is_active
    FROM outbound_domain_rules
    WHERE is_active = 1
      AND (
        domain = ?
        OR (applies_to_subdomains = 1 AND ? LIKE CONCAT('%.', domain))
      )
    ORDER BY
      CASE WHEN domain = ? THEN 0 ELSE 1 END ASC,
      LENGTH(domain) DESC,
      id DESC
    LIMIT 1
    `,
    [cleanHost, cleanHost, cleanHost]
  );

  return rows[0] || null;
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
  allowExternalLinks,
}) {
  const permission =
    allowExternalLinks === undefined
      ? await getLatestUserPlanLinkPermission(userId)
      : {
          allow_external_links: !!allowExternalLinks,
          plan_id: null,
          subscription_id: null,
        };

  const externalAllowed = true;
  const blockedDomains = String(process.env.BLOGGAD_BLOCKED_OUTBOUND_DOMAINS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  let result = validateSupgadUrl(value, {
    required,
    allowEmpty,
    fieldName,
    allowExternalLinks: externalAllowed,
    allowedDomains: [],
    blockedDomains,
  });

  if (result.ok && result.detected_host) {
    const domainRule = await getOutboundDomainRule(result.detected_host);

    if (domainRule?.rule_status === 'block') {
      result = {
        ...result,
        ok: false,
        message: domainRule.reason
          ? `Destination blocked by Bloggad: ${domainRule.reason}`
          : 'Destination blocked by Bloggad link policy',
        domain_rule: domainRule,
      };
    } else if (domainRule?.rule_status === 'review') {
      result = {
        ...result,
        ok: false,
        message: domainRule.reason
          ? `Destination requires review: ${domainRule.reason}`
          : 'Destination requires Bloggad review before it can be used',
        domain_rule: domainRule,
      };
    } else if (domainRule) {
      result = {
        ...result,
        domain_rule: domainRule,
      };
    }
  }

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

  return {
    ...result,
    allow_external_links: externalAllowed,
    plan_id: permission.plan_id || null,
    subscription_id: permission.subscription_id || null,
  };
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
  getOutboundDomainRule,
  getLatestUserPlanLinkPermission,
  validateAndLogSupgadUrl,
  assertAndLogSupgadUrl,
  validateMultipleSupgadUrls,
};