const pool = require('../config/db');

function cleanText(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeEmail(value) {
  const email = cleanText(value, 320).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return email;
}

async function loadPublicWebinar(writerPageSlug, webinarSlug, connection = pool) {
  const pageSlug = cleanText(writerPageSlug, 255);
  const slug = cleanText(webinarSlug, 255);

  if (!pageSlug || !slug) return null;

  const [[row]] = await connection.query(
    `
    SELECT
      w.*,
      wp.name AS writer_page_name,
      wp.slug AS writer_page_slug,
      ws.id AS session_id,
      ws.session_key,
      ws.session_type,
      ws.status AS session_status,
      ws.scheduled_start_at AS session_scheduled_start_at
    FROM webinars w
    INNER JOIN writer_pages wp
      ON wp.id = w.writer_page_id
      AND wp.status = 'active'
    LEFT JOIN webinar_sessions ws
      ON ws.id = (
        SELECT ws2.id
        FROM webinar_sessions ws2
        WHERE ws2.webinar_id = w.id
          AND ws2.status IN ('scheduled','open')
        ORDER BY ws2.id DESC
        LIMIT 1
      )
    WHERE wp.slug = ?
      AND w.slug = ?
      AND w.published_at IS NOT NULL
      AND w.visibility IN ('public','unlisted')
      AND w.status IN ('ready','scheduled','live','ended')
    LIMIT 1
    `,
    [pageSlug, slug]
  );

  if (!row) return null;

  return {
    ...row,
    ticket_price_usd: Number(row.ticket_price_usd || 0).toFixed(2),
    registration_open:
      Number(row.allow_registration || 0) === 1 &&
      ['ready', 'scheduled', 'live'].includes(String(row.status)),
  };
}

async function loadRegistrationByToken(token, connection = pool) {
  const cleanToken = cleanText(token, 64);

  if (!cleanToken) return null;

  const [[row]] = await connection.query(
    `
    SELECT
      wr.*,
      w.slug AS webinar_slug,
      w.title AS webinar_title,
      w.registration_mode,
      w.ticket_price_usd,
      w.ticket_currency_code,
      w.published_at,
      w.status AS webinar_status,
      wp.slug AS writer_page_slug,
      wp.name AS writer_page_name
    FROM webinar_registrations wr
    INNER JOIN webinars w
      ON w.id = wr.webinar_id
    INNER JOIN writer_pages wp
      ON wp.id = w.writer_page_id
    WHERE wr.registration_token = ?
    LIMIT 1
    `,
    [cleanToken]
  );

  return row || null;
}

function sanitizeRegistration(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    webinar_id: Number(row.webinar_id),
    session_id: row.session_id ? Number(row.session_id) : null,
    attendee_name: row.attendee_name,
    attendee_email: row.attendee_email,
    registration_token: row.registration_token,
    status: row.status,
    payment_status: row.payment_status,
    confirmed_at: row.confirmed_at || null,
    registered_at: row.registered_at,
  };
}

module.exports = {
  cleanText,
  normalizeEmail,
  loadPublicWebinar,
  loadRegistrationByToken,
  sanitizeRegistration,
};
