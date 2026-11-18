// BLOGGAD_V60_YOUTUBE_WATCH_ENGINE
// Adapter for player state/position samples.
// No network requests, DOM access, timers, or automatic player changes.

export function createYoutubeWatchEngine({
  emit,
  now = () => Date.now()
}) {
  if (typeof emit !== 'function' || typeof now !== 'function') {
    throw new Error('INVALID_WATCH_ENGINE_CONFIG');
  }

  let playing = false;
  let started = false;
  let stopped = false;
  let duration = 0;
  let lastPosition = null;
  let lastTime = null;
  let pendingSeconds = 0;
  let totalWatchedSeconds = 0;
  const milestones = new Set();

  async function publish(type, data = {}) {
    if (stopped) return;
    await emit(type, data);
  }

  function positionValue(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0
      ? number
      : null;
  }

  function updateDuration(value) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0 && number <= 86400) {
      duration = number;
    }
  }

  async function flush() {
    const seconds = Math.floor(pendingSeconds);
    if (seconds < 1 || stopped) return 0;

    const sentSeconds = Math.min(seconds, 30);
    pendingSeconds -= sentSeconds;

    await publish('video_watch_tick', {
      seconds_delta: sentSeconds,
      video_position_seconds: Math.floor(lastPosition ?? 0),
      video_progress_percent: duration > 0
        ? Math.min(100, Math.floor(
            (Math.min(duration, totalWatchedSeconds) / duration) * 100
          ))
        : null
    });

    return sentSeconds;
  }

  async function sample(position, durationValue) {
    if (!playing || stopped) return 0;

    updateDuration(durationValue);

    const currentPosition = positionValue(position);
    const currentTime = now();

    if (currentPosition === null || !Number.isFinite(currentTime)) {
      return 0;
    }

    if (lastPosition === null || lastTime === null) {
      lastPosition = currentPosition;
      lastTime = currentTime;
      return 0;
    }

    const elapsed = (currentTime - lastTime) / 1000;
    const advanced = currentPosition - lastPosition;

    if (elapsed < 0 || elapsed > 30) {
      lastPosition = currentPosition;
      lastTime = currentTime;
      return 0;
    }

    if (advanced < -2 || advanced > elapsed + 3) {
      lastPosition = currentPosition;
      lastTime = currentTime;
      pendingSeconds = 0;
      await publish('video_seek', {
        video_position_seconds: Math.floor(currentPosition)
      });
      return 0;
    }

    lastPosition = currentPosition;
    lastTime = currentTime;

    const counted = Math.min(
      Math.max(0, advanced),
      Math.max(0, elapsed),
      15
    );

    pendingSeconds += counted;
    totalWatchedSeconds += counted;

    if (pendingSeconds >= 10) {
      await flush();
    }

    if (duration > 0) {
      const percentage = 100 * totalWatchedSeconds / duration;

      for (const threshold of [25, 50, 75]) {
        if (percentage >= threshold && !milestones.has(threshold)) {
          milestones.add(threshold);
          await publish('video_progress_' + threshold, {
            video_progress_percent: threshold,
            video_position_seconds: Math.floor(currentPosition)
          });
        }
      }
    }

    return counted;
  }

  async function play(position = 0, durationValue = 0) {
    if (stopped || playing) return false;

    updateDuration(durationValue);
    const currentPosition = positionValue(position);
    if (currentPosition === null) return false;

    if (!started) {
      started = true;
      await publish('video_start', {
        video_position_seconds: Math.floor(currentPosition)
      });
    }

    playing = true;
    lastPosition = currentPosition;
    lastTime = now();

    await publish('video_play', {
      video_position_seconds: Math.floor(currentPosition)
    });

    return true;
  }

  async function pause(position, durationValue) {
    if (!playing || stopped) return false;
    await sample(position, durationValue);
    await flush();

    playing = false;

    await publish('video_pause', {
      video_position_seconds: Math.floor(lastPosition ?? 0)
    });

    return true;
  }

  async function complete(position, durationValue) {
    if (!playing || stopped) return false;

    await sample(position, durationValue);
    await flush();

    playing = false;

    if (duration > 0 && totalWatchedSeconds >= duration * 0.95) {
      if (!milestones.has(100)) {
        milestones.add(100);
        await publish('video_complete', {
          video_progress_percent: 100,
          video_position_seconds: Math.floor(lastPosition ?? 0)
        });
      }
    }

    return true;
  }

  function stop() {
    stopped = true;
    playing = false;
    pendingSeconds = 0;
  }

  function state() {
    return Object.freeze({
      playing,
      started,
      stopped,
      duration,
      watched_seconds: Math.floor(totalWatchedSeconds),
      milestones: [...milestones]
    });
  }

  return Object.freeze({
    play,
    sample,
    pause,
    complete,
    stop,
    state
  });
}