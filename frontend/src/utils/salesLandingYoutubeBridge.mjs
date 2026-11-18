// BLOGGAD_V61_YOUTUBE_IFRAME_BRIDGE
// The application supplies the loaded YouTube API and a mount element.
// No API script is loaded and no external request is made here.

export function createYoutubeIframeBridge({
  YT,
  mount,
  engine,
  scheduler = {
    every: (fn, ms) => setInterval(fn, ms),
    cancel: (id) => clearInterval(id)
  },
  sampleIntervalMs = 10000
}) {
  if (
    !YT ||
    typeof YT.Player !== 'function' ||
    !YT.PlayerState ||
    !mount ||
    !engine ||
    typeof engine.play !== 'function' ||
    typeof engine.sample !== 'function' ||
    typeof engine.pause !== 'function' ||
    typeof engine.complete !== 'function' ||
    typeof engine.stop !== 'function' ||
    typeof scheduler.every !== 'function' ||
    typeof scheduler.cancel !== 'function' ||
    !Number.isInteger(sampleIntervalMs) ||
    sampleIntervalMs < 1000
  ) {
    throw new Error('INVALID_YOUTUBE_BRIDGE_CONFIG');
  }

  let player = null;
  let timer = null;
  let destroyed = false;
  let sampling = false;
  let operation = Promise.resolve();

  function position() {
    if (!player || typeof player.getCurrentTime !== 'function') return 0;
    const value = Number(player.getCurrentTime());
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function duration() {
    if (!player || typeof player.getDuration !== 'function') return 0;
    const value = Number(player.getDuration());
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  async function sample() {
    if (destroyed || sampling || !player) return 0;
    sampling = true;
    try {
      return await engine.sample(position(), duration());
    } finally {
      sampling = false;
    }
  }

  function cancelSampling() {
    if (timer !== null) {
      scheduler.cancel(timer);
      timer = null;
    }
  }

  async function transition(state) {
    if (destroyed || !player) return false;

    if (state === YT.PlayerState.PLAYING) {
      await engine.play(position(), duration());
      if (timer === null) {
        timer = scheduler.every(() => {
          void sample().catch(() => {});
        }, sampleIntervalMs);
      }
      return true;
    }

    if (
      state === YT.PlayerState.PAUSED ||
      state === YT.PlayerState.BUFFERING
    ) {
      cancelSampling();
      await engine.pause(position(), duration());
      return true;
    }

    if (state === YT.PlayerState.ENDED) {
      cancelSampling();
      await engine.complete(position(), duration());
      return true;
    }

    return false;
  }

  function start() {
    if (destroyed || player) return false;

    player = new YT.Player(mount, {
      events: {
        onStateChange(event) {
          operation = operation
            .catch(() => {})
            .then(() => transition(event.data));
        }
      }
    });

    return true;
  }

  async function idle() {
    await operation;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelSampling();
    engine.stop();
    if (player && typeof player.destroy === 'function') {
      player.destroy();
    }
    player = null;
  }

  function state() {
    return Object.freeze({
      started: Boolean(player),
      destroyed,
      sampling_active: timer !== null
    });
  }

  return Object.freeze({
    start,
    transition,
    sample,
    idle,
    destroy,
    state
  });
}