import { useEffect } from 'react';
import api from '../api/axios';

function createPlaybackKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : ((r & 3) | 8)).toString(16);
  });
}

function videoKey(src) {
  const value = String(src || '').split('?')[0].split('#')[0];
  if (!value) return '';
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return 'html5:' + (hash >>> 0).toString(16).padStart(8, '0');
}

export default function usePostVideoWatchAnalytics({ postId }) {
  useEffect(() => {
    const id = Number(postId);
    if (!Number.isSafeInteger(id) || id <= 0) return undefined;

    const registered = new Map();
    let closed = false;

    function attach(video) {
      if (registered.has(video)) return;
      if (video.closest('[data-analytics-ignore]')) return;

      const state = {
        key: null,
        watched: 0,
        progress: 0,
        timer: null,
        lastSent: 0,
        finished: false
      };

      function payload() {
        const duration = Number.isFinite(video.duration) && video.duration > 0
          ? Math.min(86400, Math.floor(video.duration))
          : null;
        const source = video.currentSrc || video.src;
        const identity = videoKey(source);
        if (!identity || !state.key) return null;

        const position = Number.isFinite(video.currentTime)
          ? Math.max(0, video.currentTime)
          : 0;

        const percent = duration
          ? Math.min(100, Math.floor((position / duration) * 100))
          : 0;
        state.progress = Math.max(state.progress, percent);

        return {
          playback_key: state.key,
          post_id: id,
          video_key: identity,
          duration_seconds: duration,
          watched_seconds: state.watched,
          max_progress_percent: state.finished ? 100 : state.progress,
          completed: state.finished
        };
      }

      function send(force = false) {
        if (closed) return;
        const now = Date.now();
        if (!force && now - state.lastSent < 12000) return;
        const data = payload();
        if (!data) return;
        state.lastSent = now;
        api.post('/api/public/video-watch', data).catch(() => null);
      }

      function stopTimer() {
        if (state.timer != null) {
          window.clearInterval(state.timer);
          state.timer = null;
        }
      }

      function play() {
        if (state.finished || !state.key) {
          state.key = createPlaybackKey();
          state.watched = 0;
          state.progress = 0;
          state.finished = false;
        }
        stopTimer();
        send(true);
        state.timer = window.setInterval(() => {
          if (video.paused || video.ended || document.visibilityState !== 'visible') {
            return;
          }
          state.watched = Math.min(86400, state.watched + 1);
          send(false);
        }, 1000);
      }

      function pause() {
        stopTimer();
        send(true);
      }

      function ended() {
        stopTimer();
        if (!state.key) return;
        state.finished = true;
        send(true);
      }

      video.addEventListener('play', play);
      video.addEventListener('pause', pause);
      video.addEventListener('ended', ended);

      registered.set(video, () => {
        stopTimer();
        video.removeEventListener('play', play);
        video.removeEventListener('pause', pause);
        video.removeEventListener('ended', ended);
      });
    }

    function scan() {
      const root = document.querySelector('[data-bloggad-post-content]');
      if (!root) return;
      root.querySelectorAll('video').forEach(attach);
    }

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      closed = true;
      observer.disconnect();
      registered.forEach((cleanup) => cleanup());
      registered.clear();
    };
  }, [postId]);
}