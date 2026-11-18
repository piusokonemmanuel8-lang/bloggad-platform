// BLOGGAD_V71_WRITER_ANALYTICS_READ_MODEL
// Read-only writer-scoped reporting. No payment verification claims.

'use strict';

function positiveId(value) {
  const text = String(value);
  if (!/^[1-9][0-9]*$/.test(text)) {
    throw new Error('INVALID_REPORT_ID');
  }
  const number = Number(text);
  if (!Number.isSafeInteger(number)) {
    throw new Error('INVALID_REPORT_ID');
  }
  return number;
}

function parseDay(text) {
  if (typeof text !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error('INVALID_REPORT_DATE');
  }
  const ms = Date.parse(text + 'T00:00:00.000Z');
  if (!Number.isFinite(ms)) throw new Error('INVALID_REPORT_DATE');
  if (new Date(ms).toISOString().slice(0, 10) !== text) {
    throw new Error('INVALID_REPORT_DATE');
  }
  return ms;
}

function reportRange(from, to) {
  const start = parseDay(from);
  const end = parseDay(to);
  if (end < start || end - start > 365 * 86400000) {
    throw new Error('INVALID_REPORT_RANGE');
  }
  return {
    from,
    to,
    start: from + ' 00:00:00',
    endExclusive: new Date(end + 86400000).toISOString().slice(0, 10) + ' 00:00:00'
  };
}

function nonNegative(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function count(value) {
  return Math.floor(nonNegative(value));
}

function numberOrZero(value) {
  return Math.round(nonNegative(value) * 100) / 100;
}

async function runQuery(db, sql, params) {
  const result = await db.query(sql, params);
  if (!Array.isArray(result) || !Array.isArray(result[0])) {
    throw new Error('INVALID_REPORT_DATABASE_RESPONSE');
  }
  return result[0];
}

async function getSalesLandingWriterReport({
  db,
  writerId,
  pageId,
  from,
  to
}) {
  if (!db || typeof db.query !== 'function') {
    throw new Error('REPORT_DB_REQUIRED');
  }

  const writer = positiveId(writerId);
  const page = positiveId(pageId);
  const range = reportRange(from, to);

  // This check must run before analytics data is queried.
  const ownerRows = await runQuery(db,
    'SELECT id FROM writer_sales_landing_pages ' +
    'WHERE id = ? AND writer_user_id = ? LIMIT 1',
    [page, writer]
  );

  if (ownerRows.length !== 1) {
    throw new Error('REPORT_PAGE_NOT_OWNED');
  }

  const sessionRows = await runQuery(db,
    'SELECT COUNT(*) AS visitor_sessions, ' +
    'COUNT(DISTINCT visitor_key) AS session_scoped_visitors, ' +
    'COALESCE(SUM(engaged_seconds), 0) AS active_seconds, ' +
    'COALESCE(SUM(watched_seconds), 0) AS watched_seconds ' +
    'FROM sales_landing_analytics_sessions ' +
    'WHERE landing_page_id = ? AND started_at >= ? AND started_at < ?',
    [page, range.start, range.endExclusive]
  );

  const eventRows = await runQuery(db,
    'SELECT ' +
    "SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views, " +
    "SUM(CASE WHEN event_type = 'checkout_click' THEN 1 ELSE 0 END) AS checkout_clicks, " +
    "SUM(CASE WHEN event_type = 'whatsapp_click' THEN 1 ELSE 0 END) AS whatsapp_clicks, " +
    "SUM(CASE WHEN event_type = 'external_cta_click' THEN 1 ELSE 0 END) AS external_cta_clicks, " +
    "COUNT(DISTINCT CASE WHEN event_type = 'video_start' THEN session_id END) AS video_starts, " +
    "COUNT(DISTINCT CASE WHEN event_type = 'video_progress_25' THEN session_id END) AS video_25, " +
    "COUNT(DISTINCT CASE WHEN event_type = 'video_progress_50' THEN session_id END) AS video_50, " +
    "COUNT(DISTINCT CASE WHEN event_type = 'video_progress_75' THEN session_id END) AS video_75, " +
    "COUNT(DISTINCT CASE WHEN event_type = 'video_complete' THEN session_id END) AS video_completions " +
    'FROM sales_landing_analytics_events ' +
    'WHERE landing_page_id = ? AND occurred_at >= ? AND occurred_at < ?',
    [page, range.start, range.endExclusive]
  );

  const sourceRows = await runQuery(db,
    'SELECT source_category, COUNT(*) AS visitor_sessions ' +
    'FROM sales_landing_analytics_sessions ' +
    'WHERE landing_page_id = ? AND started_at >= ? AND started_at < ? ' +
    'GROUP BY source_category ORDER BY visitor_sessions DESC, source_category ASC',
    [page, range.start, range.endExclusive]
  );

  const dailyRows = await runQuery(db,
    'SELECT DATE(started_at) AS day, COUNT(*) AS visitor_sessions, ' +
    'COALESCE(SUM(engaged_seconds), 0) AS active_seconds, ' +
    'COALESCE(SUM(watched_seconds), 0) AS watched_seconds ' +
    'FROM sales_landing_analytics_sessions ' +
    'WHERE landing_page_id = ? AND started_at >= ? AND started_at < ? ' +
    'GROUP BY DATE(started_at) ORDER BY day ASC',
    [page, range.start, range.endExclusive]
  );

  const sessions = sessionRows[0] || {};
  const events = eventRows[0] || {};

  const metrics = Object.freeze({
    page_views: count(events.page_views),
    visitor_sessions: count(sessions.visitor_sessions),
    session_scoped_visitors: count(sessions.session_scoped_visitors),
    active_seconds: count(sessions.active_seconds),
    video_watched_seconds: count(sessions.watched_seconds),
    checkout_clicks: count(events.checkout_clicks),
    whatsapp_clicks: count(events.whatsapp_clicks),
    external_cta_clicks: count(events.external_cta_clicks),
    video_starts: count(events.video_starts),
    video_25: count(events.video_25),
    video_50: count(events.video_50),
    video_75: count(events.video_75),
    video_completions: count(events.video_completions),
    checkout_click_rate_percent: count(events.page_views) > 0
      ? numberOrZero(100 * count(events.checkout_clicks) / count(events.page_views))
      : 0,
    verified_payments: null
  });

  return Object.freeze({
    page_id: page,
    range: { from: range.from, to: range.to },
    metrics,
    sources: sourceRows.map(row => ({
      source: String(row.source_category || 'other').slice(0, 32),
      visitor_sessions: count(row.visitor_sessions)
    })),
    daily: dailyRows.map(row => ({
      day: row.day instanceof Date
        ? row.day.toISOString().slice(0, 10)
        : String(row.day).slice(0, 10),
      visitor_sessions: count(row.visitor_sessions),
      active_seconds: count(row.active_seconds),
      video_watched_seconds: count(row.watched_seconds)
    })),
    definitions: {
      unique_visitors: 'Session-scoped: a new identifier is generated for each tracking session; these are not unique people',
      video_watched_seconds: 'Cumulative measured playback seconds, including repeat viewing; not proof of attention',
      video_milestones: 'Milestones use cumulative measured playback time divided by duration, not furthest video position',
      daily_activity: 'Sessions and accumulated seconds use session start date; event clicks use event occurrence date',
      checkout_click_ratio: 'Pay To Join clicks per 100 recorded page views; repeat clicks may make this exceed 100',
      verified_payments: 'Unavailable until server-verified payment reconciliation is connected'
    }
  });
}

module.exports = {
  getSalesLandingWriterReport,
  reportRange
};