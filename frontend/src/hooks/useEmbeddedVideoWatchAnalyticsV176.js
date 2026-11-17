import { useEffect } from 'react';
import api from '../api/axios';

const MAX_SECONDS = 86400;

function createKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (character) => {
      const value = Math.floor(Math.random() * 16);
      return (
        character === 'x' ? value : ((value & 3) | 8)
      ).toString(16);
    }
  );
}

function resolveProvider(source) {
  try {
    const url = new URL(source, window.location.href);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (
      host === 'youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const match = url.pathname.match(
        /^\/embed\/([A-Za-z0-9_-]{6,})/
      );

      if (!match) return null;

      return {
        type: 'youtube',
        key: 'youtube:' + match[1],
        origin: url.origin
      };
    }

    if (host === 'player.vimeo.com') {
      const match = url.pathname.match(/^\/video\/(\d+)/);

      if (!match) return null;

      return {
        type: 'vimeo',
        key: 'vimeo:' + match[1],
        origin: url.origin
      };
    }
  } catch (error) {
    return null;
  }

  return null;
}

function boundedSeconds(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(0, Math.min(MAX_SECONDS, number))
    : 0;
}

export default function useEmbeddedVideoWatchAnalyticsV176({
  postId
}) {
  useEffect(() => {
    const id = Number(postId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return undefined;
    }

    const frames = new Map();
    let closed = false;

    function send(state, force = false) {
      if (closed || !state.key || state.watched < 1 && !state.finished) {
        return;
      }

      const now = Date.now();

      if (!force && now - state.lastSent < 12000) {
        return;
      }

      state.lastSent = now;

      const duration = state.duration > 0
        ? Math.floor(state.duration)
        : null;

      api.post('/api/public/video-watch', {
        playback_key: state.key,
        post_id: id,
        video_key: state.provider.key,
        duration_seconds: duration,
        watched_seconds: Math.floor(state.watched),
        max_progress_percent: state.finished
          ? 100
          : Math.floor(state.progress),
        completed: state.finished
      }).catch(() => null);
    }

    function stop(state) {
      state.playing = false;

      if (state.timer !== null) {
        window.clearInterval(state.timer);
        state.timer = null;
      }
    }

    function start(state) {
      if (state.playing) return;

      if (!state.key || state.finished) {
        state.key = createKey();
        state.watched = 0;
        state.progress = 0;
        state.duration = 0;
        state.finished = false;
        state.lastSent = 0;
      }

      state.playing = true;

      if (state.timer !== null) {
        window.clearInterval(state.timer);
      }

      state.timer = window.setInterval(() => {
        if (!state.playing ||
            document.visibilityState !== 'visible') {
          return;
        }

        state.watched = Math.min(
          MAX_SECONDS,
          state.watched + 1
        );

        send(state);
      }, 1000);
    }

    function updateProgress(state, seconds, duration, percent) {
      const length = boundedSeconds(duration);
      const position = boundedSeconds(seconds);

      if (length > 0) {
        state.duration = length;
        state.progress = Math.max(
          state.progress,
          Math.min(100, position / length * 100)
        );
      }

      const percentage = Number(percent);

      if (Number.isFinite(percentage)) {
        const normalized = percentage <= 1
          ? percentage * 100
          : percentage;

        state.progress = Math.max(
          state.progress,
          Math.min(100, Math.max(0, normalized))
        );
      }
    }

    function handleEnded(state) {
      if (!state.key) return;

      stop(state);
      state.finished = true;
      state.progress = 100;
      send(state, true);
    }

    function message(event) {
      if (closed) return;

      for (const [frame, state] of frames) {
        if (event.source !== frame.contentWindow) {
          continue;
        }

        const origin = event.origin.toLowerCase();

        if (state.provider.type === 'youtube') {
          if (!/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(origin)) {
            return;
          }
        } else if (state.provider.type === 'vimeo') {
          if (origin !== 'https://player.vimeo.com') {
            return;
          }
        } else {
          return;
        }

        let data = event.data;

        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (error) {
            return;
          }
        }

        if (!data || typeof data !== 'object') {
          return;
        }

        if (state.provider.type === 'youtube') {
          const info = data.info;

          if (
            data.event === 'onStateChange' &&
            typeof info === 'number'
          ) {
            if (info === 1) start(state);
            if (info === 2 || info === 3) {
              stop(state);
              send(state, true);
            }
            if (info === 0) handleEnded(state);
          }

          if (data.event === 'infoDelivery' && info) {
            updateProgress(
              state,
              info.currentTime,
              info.duration,
              null
            );

            if (info.playerState === 1) start(state);

            if (
              info.playerState === 2 ||
              info.playerState === 3
            ) {
              stop(state);
              send(state, true);
            }

            if (info.playerState === 0) {
              handleEnded(state);
            }
          }
        }

        if (state.provider.type === 'vimeo') {
          if (data.event === 'play') start(state);

          if (
            data.event === 'pause' ||
            data.event === 'bufferstart'
          ) {
            stop(state);
            send(state, true);
          }

          if (data.event === 'timeupdate') {
            updateProgress(
              state,
              data.data?.seconds,
              data.data?.duration,
              data.data?.percent
            );
          }

          if (data.event === 'ended') {
            handleEnded(state);
          }
        }

        return;
      }
    }

    function command(frame, provider, payload) {
      try {
        frame.contentWindow?.postMessage(
          JSON.stringify(payload),
          provider.origin
        );
      } catch (error) {
        return;
      }
    }

    function subscribe(frame, state) {
      if (state.provider.type === 'youtube') {
        command(frame, state.provider, {
          event: 'listening',
          id: frame.id
        });

        command(frame, state.provider, {
          event: 'command',
          func: 'addEventListener',
          args: ['onStateChange']
        });
      }

      if (state.provider.type === 'vimeo') {
        for (const name of [
          'play',
          'pause',
          'timeupdate',
          'ended',
          'bufferstart'
        ]) {
          command(frame, state.provider, {
            method: 'addEventListener',
            value: name
          });
        }
      }
    }

    function attach(frame) {
      if (frames.has(frame)) return;

      if (frame.closest('[data-analytics-ignore]')) {
        return;
      }

      const provider = resolveProvider(frame.src);

      if (!provider) return;

      const state = {
        provider,
        key: null,
        watched: 0,
        progress: 0,
        duration: 0,
        playing: false,
        finished: false,
        lastSent: 0,
        timer: null,
        onLoad: null
      };

      frames.set(frame, state);

      const url = new URL(frame.src);

      if (provider.type === 'youtube') {
        url.searchParams.set('enablejsapi', '1');
        url.searchParams.set('origin', window.location.origin);
      }

      if (provider.type === 'vimeo') {
        url.searchParams.set('api', '1');
      }

      state.onLoad = () => subscribe(frame, state);
      frame.addEventListener('load', state.onLoad);

      if (url.href !== frame.src) {
        frame.src = url.href;
      } else {
        subscribe(frame, state);
      }
    }

    function scan() {
      const root = document.querySelector(
        '[data-bloggad-post-content]'
      );

      if (!root) return;

      root.querySelectorAll('iframe').forEach(attach);
    }

    window.addEventListener('message', message);

    const onHidden = () => {
      if (document.visibilityState !== 'visible') {
        for (const state of frames.values()) {
          if (state.playing) {
            stop(state);
            send(state, true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', onHidden);

    scan();

    const observer = new MutationObserver(scan);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      for (const [frame, state] of frames) {
        send(state, true);
        stop(state);

        if (state.onLoad) {
          frame.removeEventListener('load', state.onLoad);
        }
      }

      closed = true;
      observer.disconnect();

      window.removeEventListener('message', message);
      document.removeEventListener(
        'visibilitychange',
        onHidden
      );

      frames.clear();
    };
  }, [postId]);
}