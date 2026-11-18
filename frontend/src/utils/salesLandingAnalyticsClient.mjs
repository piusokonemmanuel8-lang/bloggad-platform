// BLOGGAD_V58_FIRST_PARTY_ANALYTICS_CLIENT
// Pure helpers. No automatic tracking or outbound requests.

const allowedTypes = new Set([
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

function shortText(value, length) {
  return typeof value === 'string'
    ? value.trim().slice(0, length)
    : '';
}

export function detectTrafficSource(urlValue, referrerValue = '') {
  const url = new URL(urlValue);
  const utm = url.searchParams;

  const source = shortText(utm.get('utm_source'), 120).toLowerCase();
  const medium = shortText(utm.get('utm_medium'), 120).toLowerCase();
  const campaign = shortText(utm.get('utm_campaign'), 190);

  let referrerHost = '';

  try {
    const ref = new URL(referrerValue);
    if (ref.protocol === 'https:' || ref.protocol === 'http:') {
      referrerHost = ref.hostname.toLowerCase().slice(0, 190);
    }
  } catch (_) {}

  const signal = source || referrerHost;

  let category = 'direct';

  if (url.searchParams.has('gclid') || /google/.test(signal)) {
    category = 'google';
  } else if (/facebook|fb\.com|fbclid/.test(signal) || url.searchParams.has('fbclid')) {
    category = 'facebook';
  } else if (/instagram|instagr\.am/.test(signal)) {
    category = 'instagram';
  } else if (/whatsapp|wa\.me|wa\.link/.test(signal)) {
    category = 'whatsapp';
  } else if (/youtube|youtu\.be/.test(signal)) {
    category = 'youtube';
  } else if (source || medium || referrerHost) {
    category = 'referral';
  }

  return {
    source_category: category,
    referrer_host: referrerHost,
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign
  };
}

export function createEvent(input, makeUuid) {
  if (!input || !allowedTypes.has(input.event_type)) {
    throw new Error('UNSUPPORTED_EVENT');
  }

  if (typeof makeUuid !== 'function') {
    throw new Error('UUID_GENERATOR_REQUIRED');
  }

  const delta = input.seconds_delta ?? 0;

  if (!Number.isInteger(delta) || delta < 0 || delta > 30) {
    throw new Error('INVALID_SECONDS');
  }

  if (
    !['engagement_tick', 'video_watch_tick'].includes(input.event_type) &&
    delta !== 0
  ) {
    throw new Error('NON_TIME_EVENT_HAS_SECONDS');
  }

  const identifiers = [
    input.session_key,
    input.visitor_key,
    makeUuid()
  ];

  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!identifiers.every(id => typeof id === 'string' && uuid.test(id))) {
    throw new Error('INVALID_EVENT_IDENTIFIERS');
  }

  return {
    session_key: identifiers[0],
    visitor_key: identifiers[1],
    event_key: identifiers[2],
    event_type: input.event_type,
    seconds_delta: delta,
    video_position_seconds: input.video_position_seconds ?? null,
    video_progress_percent: input.video_progress_percent ?? null,
    section_id: shortText(input.section_id, 100),
    source_category: input.source_category || 'direct',
    referrer_host: shortText(input.referrer_host, 190),
    utm_source: shortText(input.utm_source, 120),
    utm_medium: shortText(input.utm_medium, 120),
    utm_campaign: shortText(input.utm_campaign, 190)
  };
}

export function countActiveSeconds({ previousMs, currentMs, visible, focused }) {
  if (!visible || !focused) return 0;

  if (
    !Number.isFinite(previousMs) ||
    !Number.isFinite(currentMs) ||
    currentMs < previousMs
  ) {
    return 0;
  }

  const elapsed = Math.floor((currentMs - previousMs) / 1000);

  if (elapsed > 30) return 0;

  return Math.min(15, Math.max(0, elapsed));
}

export function videoProgressMilestones(previous, current) {
  if (
    !Number.isFinite(previous) ||
    !Number.isFinite(current) ||
    current <= previous
  ) {
    return [];
  }

  return [25, 50, 75, 100].filter(
    value => previous < value && current >= value
  );
}