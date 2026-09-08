const slugify = require('slugify');
const pool = require('../config/db');

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function cleanText(value, maxLength = 5000) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeWebinarType(value, fallback = 'prerecorded') {
  const normalized = cleanText(value, 30).toLowerCase();
  return ['prerecorded', 'evergreen', 'hybrid', 'live'].includes(normalized)
    ? normalized
    : fallback;
}

function normalizeVisibility(value, fallback = 'public') {
  const normalized = cleanText(value, 30).toLowerCase();
  return ['public', 'unlisted', 'private'].includes(normalized)
    ? normalized
    : fallback;
}

function normalizeTimezone(value, fallback = 'UTC') {
  const timezone = cleanText(value, 64);
  return timezone || fallback;
}

function isValidTimezone(value) {
  const timezone = normalizeTimezone(value);

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function parseScheduledDate(value) {
  const text = cleanText(value, 40);

  if (!text) return null;

  const parsed = new Date(text);

  return Number.isNaN(parsed.getTime()) ? false : parsed;
}

async function ensureOwnedWriterPage(writerPageId, userId, connection = pool) {
  const id = positiveInt(writerPageId);

  if (!id) return null;

  const [[writerPage]] = await connection.query(
    `
    SELECT id, user_id, name, slug, status
    FROM writer_pages
    WHERE id = ?
      AND user_id = ?
      AND status = 'active'
    LIMIT 1
    `,
    [id, userId]
  );

  return writerPage || null;
}

async function getOwnedWebinar(webinarId, userId, connection = pool) {
  const id = positiveInt(webinarId);

  if (!id) return null;

  const [[webinar]] = await connection.query(
    `
    SELECT
      w.*,
      wp.name AS writer_page_name,
      wp.slug AS writer_page_slug
    FROM webinars w
    INNER JOIN writer_pages wp
      ON wp.id = w.writer_page_id
    WHERE w.id = ?
      AND w.user_id = ?
    LIMIT 1
    `,
    [id, userId]
  );

  return webinar || null;
}

async function getLatestWebinarMedia(webinarId, connection = pool) {
  const id = positiveInt(webinarId);

  if (!id) return null;

  const [[media]] = await connection.query(
    `
    SELECT *
    FROM webinar_media_jobs
    WHERE webinar_id = ?
      AND status <> 'superseded'
    ORDER BY id DESC
    LIMIT 1
    `,
    [id]
  );

  return media || null;
}

async function getLatestWebinarSession(webinarId, connection = pool) {
  const id = positiveInt(webinarId);

  if (!id) return null;

  const [[session]] = await connection.query(
    `
    SELECT *
    FROM webinar_sessions
    WHERE webinar_id = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [id]
  );

  return session || null;
}

async function buildUniqueWebinarSlug(
  title,
  userId,
  connection = pool,
  excludeId = null
) {
  const base =
    slugify(cleanText(title, 255), {
      lower: true,
      strict: true,
      trim: true,
    }) || `webinar-${Date.now()}`;

  for (let suffix = 0; suffix < 1000; suffix += 1) {
    const candidate = suffix === 0 ? base : `${base}-${suffix + 1}`;
    const params = [userId, candidate];
    let excludeSql = '';

    if (positiveInt(excludeId)) {
      excludeSql = 'AND id <> ?';
      params.push(excludeId);
    }

    const [[existing]] = await connection.query(
      `
      SELECT id
      FROM webinars
      WHERE user_id = ?
        AND slug = ?
        ${excludeSql}
      LIMIT 1
      `,
      params
    );

    if (!existing) return candidate;
  }

  throw new Error('Unable to generate a unique webinar slug');
}

function buildPlaybackUrl(masterKey) {
  const baseUrl = String(process.env.WEBINAR_CLOUDFRONT_URL || '')
    .trim()
    .replace(/\/+$/g, '');

  const key = String(masterKey || '').replace(/^\/+/g, '');

  if (!baseUrl || !key) return null;

  return `${baseUrl}/${key}`;
}

module.exports = {
  positiveInt,
  cleanText,
  normalizeWebinarType,
  normalizeVisibility,
  normalizeTimezone,
  isValidTimezone,
  parseScheduledDate,
  ensureOwnedWriterPage,
  getOwnedWebinar,
  getLatestWebinarMedia,
  getLatestWebinarSession,
  buildUniqueWebinarSlug,
  buildPlaybackUrl,
};
