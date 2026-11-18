'use strict';

// BLOGGAD_V52_SALES_LANDING_ANALYTICS_RECORDER
// Database dependency is injected; importing this module does not connect.
// No public route is mounted by V52.

const {
  validateLandingAnalyticsEvent
} = require('./salesLandingAnalyticsService');
const {
  validateEventPacing
} = require('./salesLandingAnalyticsPacing');

const SOURCES = new Set([
  'direct', 'google', 'facebook', 'instagram',
  'whatsapp', 'youtube', 'referral', 'other'
]);

function normalizedSource(value) {
  return SOURCES.has(value) ? value : 'other';
}

function validPageId(value) {
  return Number.isSafeInteger(value) && value > 0;
}

async function recordLandingAnalyticsEvent({
  pageId,
  rawEvent,
  db
}) {
  if (!validPageId(pageId)) {
    throw new Error('INVALID_LANDING_PAGE_ID');
  }

  if (!db || typeof db.getConnection !== 'function') {
    throw new Error('DATABASE_CONNECTION_REQUIRED');
  }

  const event = validateLandingAnalyticsEvent(rawEvent);
  const connection = await db.getConnection();
  let began = false;

  try {
    await connection.beginTransaction();
    began = true;

    const [pages] = await connection.query(
      "SELECT id FROM writer_sales_landing_pages " +
      "WHERE id = ? AND status = 'published' LIMIT 1",
      [pageId]
    );

    if (!Array.isArray(pages) || pages.length !== 1) {
      throw new Error('LANDING_PAGE_NOT_PUBLISHED');
    }

    await connection.query(
      'INSERT INTO sales_landing_analytics_sessions ' +
      '(landing_page_id, session_key, visitor_key, ' +
      'source_category, referrer_host, utm_source, utm_medium, ' +
      'utm_campaign, started_at, last_activity_at) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) ' +
      'ON DUPLICATE KEY UPDATE last_activity_at = NOW()',
      [
        pageId,
        event.session_key,
        event.visitor_key,
        normalizedSource(event.source_category),
        event.referrer_host || null,
        event.utm_source || null,
        event.utm_medium || null,
        event.utm_campaign || null
      ]
    );

    const [sessions] = await connection.query(
      'SELECT id, visitor_key ' +
      'FROM sales_landing_analytics_sessions ' +
      'WHERE landing_page_id = ? AND session_key = ? LIMIT 1 FOR UPDATE',
      [pageId, event.session_key]
    );

    if (!Array.isArray(sessions) || sessions.length !== 1) {
      throw new Error('ANALYTICS_SESSION_NOT_FOUND');
    }

    if (sessions[0].visitor_key !== event.visitor_key) {
      throw new Error('ANALYTICS_SESSION_VISITOR_MISMATCH');
    }

    const sessionId = sessions[0].id;

    // Resolve retries before applying pacing checks.
    // A matching event key from another session is never accepted.
    const [existingEvents] = await connection.query(
      'SELECT landing_page_id, session_id ' +
      'FROM sales_landing_analytics_events ' +
      'WHERE event_key = ? LIMIT 1',
      [event.event_key]
    );

    if (existingEvents.length) {
      const existing = existingEvents[0];

      if (
        Number(existing.landing_page_id) !== pageId ||
        Number(existing.session_id) !== Number(sessionId)
      ) {
        throw new Error('ANALYTICS_EVENT_KEY_CONFLICT');
      }

      await connection.commit();
      began = false;

      return { accepted: true, duplicate: true };
    }

    if (
      event.event_type === 'engagement_tick' ||
      event.event_type === 'video_watch_tick'
    ) {
      const [clockRows] = await connection.query(
        'SELECT UNIX_TIMESTAMP(NOW(3)) * 1000 AS server_now_ms'
      );

      if (
        !clockRows.length ||
        !Number.isFinite(Number(clockRows[0].server_now_ms))
      ) {
        throw new Error('ANALYTICS_SERVER_CLOCK_UNAVAILABLE');
      }

      const [history] = await connection.query(
        'SELECT event_type, occurred_at, video_position_seconds ' +
        'FROM sales_landing_analytics_events ' +
        'WHERE session_id = ? AND landing_page_id = ? ' +
        'ORDER BY occurred_at DESC, id DESC LIMIT 25',
        [sessionId, pageId]
      );

      validateEventPacing({
        event,
        history,
        nowMs: Number(clockRows[0].server_now_ms)
      });
    }
    const [result] = await connection.query(
      'INSERT IGNORE INTO sales_landing_analytics_events ' +
      '(landing_page_id, session_id, event_key, event_type, ' +
      'seconds_delta, video_position_seconds, ' +
      'video_progress_percent, section_id, occurred_at) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        pageId,
        sessionId,
        event.event_key,
        event.event_type,
        event.seconds_delta,
        event.video_position_seconds,
        event.video_progress_percent,
        event.section_id || null
      ]
    );

    const inserted = Number(result && result.affectedRows) === 1;

    if (inserted && event.event_type === 'engagement_tick') {
      await connection.query(
        'UPDATE sales_landing_analytics_sessions ' +
        'SET engaged_seconds = engaged_seconds + ? ' +
        'WHERE id = ? AND landing_page_id = ?',
        [event.seconds_delta, sessionId, pageId]
      );
    }

    if (inserted && event.event_type === 'video_watch_tick') {
      await connection.query(
        'UPDATE sales_landing_analytics_sessions ' +
        'SET watched_seconds = watched_seconds + ? ' +
        'WHERE id = ? AND landing_page_id = ?',
        [event.seconds_delta, sessionId, pageId]
      );
    }

    await connection.commit();
    began = false;

    return {
      accepted: true,
      duplicate: !inserted
    };
  } catch (error) {
    if (began) {
      try {
        await connection.rollback();
      } catch (_) {
        // Preserve the original failure.
      }
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  recordLandingAnalyticsEvent
};