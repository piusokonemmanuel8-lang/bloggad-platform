'use strict';

// BLOGGAD_V55B_SERVER_EVENT_PACING
// Pure validation module. Not yet connected to database writes.

function deny(code) {
  throw new Error(code);
}

function validateEventPacing({ event, history, nowMs }) {
  if (!event || !Array.isArray(history) || !Number.isFinite(nowMs)) {
    deny('INVALID_PACING_INPUT');
  }

  const type = event.event_type;

  if (type !== 'engagement_tick' && type !== 'video_watch_tick') {
    return { accepted: true, seconds: 0 };
  }

  const delta = event.seconds_delta;

  if (!Number.isInteger(delta) || delta < 1 || delta > 30) {
    deny('INVALID_PACING_DELTA');
  }

  const relevant = type === 'engagement_tick'
    ? ['page_view', 'engagement_tick']
    : [
        'video_start',
        'video_play',
        'video_pause',
        'video_seek',
        'video_watch_tick',
        'video_complete'
      ];

  const latest = history.find(
    row => row && relevant.includes(row.event_type)
  );

  if (!latest) {
    deny('PACING_START_EVENT_REQUIRED');
  }

  const previousMs = new Date(latest.occurred_at).getTime();

  if (!Number.isFinite(previousMs) || previousMs > nowMs) {
    deny('INVALID_SERVER_EVENT_TIME');
  }

  const elapsed = (nowMs - previousMs) / 1000;

  if (elapsed > 45) {
    deny('STALE_EVENT_INTERVAL');
  }

  if (delta > elapsed + 2) {
    deny('EVENT_SECONDS_EXCEED_ELAPSED_TIME');
  }

  if (type === 'video_watch_tick') {
    const playing = [
      'video_start',
      'video_play',
      'video_watch_tick'
    ].includes(latest.event_type);

    if (!playing) {
      deny('VIDEO_NOT_PLAYING');
    }

    const position = event.video_position_seconds;

    if (!Number.isInteger(position) || position < 0) {
      deny('VIDEO_POSITION_REQUIRED');
    }

    if (latest.event_type === 'video_watch_tick') {
      const lastPosition = latest.video_position_seconds;

      if (
        Number.isInteger(lastPosition) &&
        Math.abs(position - lastPosition) > elapsed + 5
      ) {
        deny('VIDEO_POSITION_JUMP');
      }
    }
  }

  return { accepted: true, seconds: delta };
}

module.exports = { validateEventPacing };