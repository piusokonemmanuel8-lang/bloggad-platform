// BLOGGAD_V59_VISITOR_EVENT_LIFECYCLE
// Inert unless an application explicitly creates and starts a tracker.
// Visitor IDs are session-scoped. No fingerprinting or persistent cookie.

import {
  createEvent,
  detectTrafficSource,
  countActiveSeconds
} from './salesLandingAnalyticsClient.mjs';

export function createLandingAnalyticsLifecycle(options) {
  const {
    pageId,
    locationUrl,
    referrer = '',
    makeUuid,
    send,
    now = () => Date.now()
  } = options || {};

  if (
    !Number.isSafeInteger(pageId) ||
    pageId <= 0 ||
    typeof makeUuid !== 'function' ||
    typeof send !== 'function' ||
    typeof now !== 'function'
  ) {
    throw new Error('INVALID_LIFECYCLE_CONFIG');
  }

  const attribution = detectTrafficSource(locationUrl, referrer);
  const sessionKey = makeUuid();
  const visitorKey = makeUuid();

  let started = false;
  let stopped = false;
  let lastSample = null;
  let lastEngagementEventMs = null;
  let activeSeconds = 0;
  let visible = true;
  let focused = true;

  const queue = [];

  function build(type, data = {}) {
    return createEvent({
      session_key: sessionKey,
      visitor_key: visitorKey,
      event_type: type,
      seconds_delta: data.seconds_delta ?? 0,
      video_position_seconds: data.video_position_seconds ?? null,
      video_progress_percent: data.video_progress_percent ?? null,
      section_id: data.section_id ?? '',
      ...attribution
    }, makeUuid);
  }

  async function deliver(event) {
    try {
      await send(pageId, event);
      return true;
    } catch (_) {
      // Keep the same event_key for a bounded retry.
      if (queue.length < 20) queue.push(event);
      return false;
    }
  }

  async function retryPending() {
    if (stopped && queue.length === 0) return 0;

    const pending = queue.splice(0, 20);
    let delivered = 0;

    for (const event of pending) {
      if (await deliver(event)) delivered++;
    }

    return delivered;
  }

  async function start() {
    if (started || stopped) return false;
    started = true;
    lastSample = now();
    lastEngagementEventMs = lastSample;
    await deliver(build('page_view'));
    return true;
  }

  function visibility(isVisible, isFocused) {
    visible = Boolean(isVisible);
    focused = Boolean(isFocused);
    lastSample = now();
  }

  async function sample() {
    if (!started || stopped || lastSample === null) return 0;

    const current = now();
    const delta = countActiveSeconds({
      previousMs: lastSample,
      currentMs: current,
      visible,
      focused
    });

    lastSample = current;
    activeSeconds += delta;

    if (
      activeSeconds >= 10 &&
      lastEngagementEventMs !== null &&
      current - lastEngagementEventMs >= 10000
    ) {
      const seconds = Math.min(30, activeSeconds);
      activeSeconds -= seconds;
      lastEngagementEventMs = current;
      await deliver(build('engagement_tick', { seconds_delta: seconds }));
      return seconds;
    }

    return 0;
  }

  async function event(type, data = {}) {
    if (!started || stopped) return false;

    // The backend independently validates all event fields.
    return deliver(build(type, data));
  }

  function stop() {
    stopped = true;
    activeSeconds = 0;
    lastSample = null;
  }

  function state() {
    return Object.freeze({
      started,
      stopped,
      queued: queue.length,
      active_seconds_pending: activeSeconds
    });
  }

  return Object.freeze({
    start,
    visibility,
    sample,
    event,
    retryPending,
    stop,
    state
  });
}