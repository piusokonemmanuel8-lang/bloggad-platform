// BLOGGAD_PRO_POST_ANALYTICS_V1
const crypto = require('crypto');
const pool = require('../config/db');

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cleanKey(value, fieldName) {
  const key = String(value || '').trim();

  if (!key || key.length > 64 || !/^[A-Za-z0-9_-]+$/.test(key)) {
    throw httpError(`Invalid ${fieldName}.`);
  }

  return key;
}

function cleanText(value, maxLength) {
  const text = String(value || '').trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

function cleanInteger(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function resolveCountryCode(req) {
  const candidates = [
    req.get('cf-ipcountry'),
    req.get('x-country-code'),
    req.get('x-vercel-ip-country'),
    req.get('cloudfront-viewer-country'),
    req.get('x-appengine-country'),
  ];

  for (const candidate of candidates) {
    const code = String(candidate || '').trim().toUpperCase();

    if (/^[A-Z]{2}$/.test(code) && !['XX', 'T1'].includes(code)) {
      return code;
    }
  }

  return 'ZZ';
}

function resolveDeviceType(userAgent) {
  const ua = String(userAgent || '').toLowerCase();

  if (!ua) return 'unknown';
  if (/(bot|crawler|spider|slurp|headless)/i.test(ua)) return 'bot';
  if (/(ipad|tablet|kindle|silk)|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/(mobile|iphone|ipod|android|blackberry|iemobile|opera mini)/i.test(ua)) {
    return 'mobile';
  }

  return 'desktop';
}

function normalizeHttpUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 2048) {
    throw httpError('Invalid link URL.');
  }

  let parsed;

  try {
    parsed = new URL(raw);
  } catch (error) {
    throw httpError('Invalid link URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw httpError('Unsupported link URL.');
  }

  return parsed.toString().slice(0, 2048);
}

async function getPublishedPost(postId) {
  const [[post]] = await pool.query(
    `
    SELECT id, website_id
    FROM product_posts
    WHERE id = ?
      AND status = 'published'
    LIMIT 1
    `,
    [postId]
  );

  if (!post) {
    throw httpError('Published post not found.', 404);
  }

  return post;
}

async function upsertPostEngagement({ postId, body = {}, req }) {
  const safePostId = Number(postId);

  if (!Number.isInteger(safePostId) || safePostId <= 0) {
    throw httpError('Invalid post id.');
  }

  const post = await getPublishedPost(safePostId);
  const visitorKey = cleanKey(body.visitor_key, 'visitor key');
  const sessionKey = cleanKey(body.session_key, 'session key');
  const engagedSeconds = cleanInteger(body.engaged_seconds, 0, 86400);
  const maxScrollPercent = cleanInteger(body.max_scroll_percent, 0, 100);
  const estimatedReadSeconds = cleanInteger(body.estimated_read_seconds, 0, 21600);
  const completed = maxScrollPercent >= 95 || body.completed === true ? 1 : 0;
  const userAgent = cleanText(req.get('user-agent'), 4000);
  const referrer =
    cleanText(body.referrer, 1000) ||
    cleanText(req.get('referer'), 1000);
  const countryCode = resolveCountryCode(req);
  const deviceType = resolveDeviceType(userAgent);

  await pool.query(
    `
    INSERT INTO analytics_post_engagements
    (
      post_id,
      website_id,
      visitor_key,
      session_key,
      country_code,
      device_type,
      referrer,
      user_agent,
      engaged_seconds,
      max_scroll_percent,
      estimated_read_seconds,
      completed,
      first_seen_at,
      last_activity_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      country_code = VALUES(country_code),
      device_type = VALUES(device_type),
      referrer = COALESCE(VALUES(referrer), referrer),
      user_agent = COALESCE(VALUES(user_agent), user_agent),
      engaged_seconds = GREATEST(engaged_seconds, VALUES(engaged_seconds)),
      max_scroll_percent = GREATEST(max_scroll_percent, VALUES(max_scroll_percent)),
      estimated_read_seconds = GREATEST(estimated_read_seconds, VALUES(estimated_read_seconds)),
      completed = GREATEST(completed, VALUES(completed)),
      last_activity_at = NOW(),
      updated_at = NOW()
    `,
    [
      safePostId,
      post.website_id || null,
      visitorKey,
      sessionKey,
      countryCode,
      deviceType,
      referrer,
      userAgent,
      engagedSeconds,
      maxScrollPercent,
      estimatedReadSeconds,
      completed,
    ]
  );

  return {
    post_id: safePostId,
    website_id: post.website_id || null,
    visitor_key: visitorKey,
    session_key: sessionKey,
  };
}

async function recordPostLinkClick({ postId, body = {}, req }) {
  const safePostId = Number(postId);

  if (!Number.isInteger(safePostId) || safePostId <= 0) {
    throw httpError('Invalid post id.');
  }

  const post = await getPublishedPost(safePostId);
  const visitorKey = cleanKey(body.visitor_key, 'visitor key');
  const sessionKey = cleanKey(body.session_key, 'session key');
  const linkUrl = normalizeHttpUrl(body.link_url);
  const linkText = cleanText(body.link_text, 500);
  const linkPosition = body.link_position
    ? cleanInteger(body.link_position, 1, 100000)
    : null;
  const referrer =
    cleanText(body.referrer, 1000) ||
    cleanText(req.get('referer'), 1000);
  const userAgent = cleanText(req.get('user-agent'), 4000);
  const countryCode = resolveCountryCode(req);
  const deviceType = resolveDeviceType(userAgent);
  const linkHash = crypto.createHash('sha256').update(linkUrl).digest('hex');

  await pool.query(
    `
    INSERT INTO analytics_post_link_clicks
    (
      post_id,
      website_id,
      visitor_key,
      session_key,
      link_hash,
      link_url,
      link_text,
      link_position,
      country_code,
      device_type,
      referrer,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      safePostId,
      post.website_id || null,
      visitorKey,
      sessionKey,
      linkHash,
      linkUrl,
      linkText,
      linkPosition,
      countryCode,
      deviceType,
      referrer,
    ]
  );

  return {
    post_id: safePostId,
    link_hash: linkHash,
  };
}

module.exports = {
  upsertPostEngagement,
  recordPostLinkClick,
};
