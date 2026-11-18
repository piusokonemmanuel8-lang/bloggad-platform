'use strict';

// BLOGGAD_V51_SALES_LANDING_ANALYTICS
// Validation only. Public ingestion is not mounted by V51.

const EVENT_TYPES = Object.freeze([
  'page_view',
  'engagement_tick',
  'video_start',
  'video_play',
  'video_pause',
  'video_seek',
  'video_watch_tick',
  'video_progress_25',
  'video_progress_50',
  'video_progress_75',
  'video_complete',
  'checkout_click',
  'whatsapp_click',
  'external_cta_click'
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function boundedText(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function boundedInteger(value, min, max) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

function validateLandingAnalyticsEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('INVALID_ANALYTICS_EVENT');
  }

  const type = boundedText(input.event_type, 40);

  if (!EVENT_TYPES.includes(type)) {
    throw new Error('UNSUPPORTED_ANALYTICS_EVENT');
  }

  const sessionKey = boundedText(input.session_key, 36);
  const visitorKey = boundedText(input.visitor_key, 36);
  const eventKey = boundedText(input.event_key, 36);

  if (![sessionKey, visitorKey, eventKey].every(
    (value) => UUID_PATTERN.test(value)
  )) {
    throw new Error('INVALID_ANALYTICS_IDENTIFIERS');
  }

  const seconds = boundedInteger(input.seconds_delta, 0, 30);

  if (seconds === null) {
    throw new Error('INVALID_ANALYTICS_SECONDS');
  }

  if (
    !['engagement_tick', 'video_watch_tick'].includes(type) &&
    seconds !== 0
  ) {
    throw new Error('SECONDS_NOT_ALLOWED_FOR_EVENT');
  }

  const position = input.video_position_seconds == null
    ? null
    : boundedInteger(input.video_position_seconds, 0, 86400);

  if (
    input.video_position_seconds != null &&
    position === null
  ) {
    throw new Error('INVALID_VIDEO_POSITION');
  }

  const percent = input.video_progress_percent == null
    ? null
    : boundedInteger(input.video_progress_percent, 0, 100);

  if (
    input.video_progress_percent != null &&
    percent === null
  ) {
    throw new Error('INVALID_VIDEO_PERCENT');
  }

  return Object.freeze({
    session_key: sessionKey,
    visitor_key: visitorKey,
    event_key: eventKey,
    event_type: type,
    seconds_delta: seconds,
    video_position_seconds: position,
    video_progress_percent: percent,
    section_id: boundedText(input.section_id, 100),
    source_category: boundedText(input.source_category, 32) || 'direct',
    referrer_host: boundedText(input.referrer_host, 190),
    utm_source: boundedText(input.utm_source, 120),
    utm_medium: boundedText(input.utm_medium, 120),
    utm_campaign: boundedText(input.utm_campaign, 190)
  });
}

module.exports = {
  EVENT_TYPES,
  validateLandingAnalyticsEvent
};