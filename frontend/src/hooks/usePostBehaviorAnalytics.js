// BLOGGAD_PRO_POST_ANALYTICS_V1
import { useEffect } from 'react';
import api from '../api/axios';

const VISITOR_STORAGE_KEY = 'bloggad_analytics_visitor_v1';

function makeKey(prefix) {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${uuid}`.slice(0, 64);
}

function getVisitorKey() {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);

    if (existing && /^[A-Za-z0-9_-]{1,64}$/.test(existing)) {
      return existing;
    }

    const created = makeKey('v');
    window.localStorage.setItem(VISITOR_STORAGE_KEY, created);
    return created;
  } catch (error) {
    return makeKey('v');
  }
}

function estimateReadSeconds(root) {
  const text = String(root?.innerText || '').trim();
  if (!text) return 0;

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((words / 225) * 60));
}

function getScrollTarget(root) {
  if (!root) return null;
  if (root.scrollHeight > 20) return root;

  return (
    root.querySelector('article') ||
    root.querySelector('main') ||
    root.querySelector('section') ||
    root
  );
}

function calculateScrollPercent(root) {
  const target = getScrollTarget(root);
  if (!target) return 0;

  const rect = target.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;
  const height = Math.max(1, target.scrollHeight || rect.height || 1);
  const viewedBottom = window.scrollY + window.innerHeight;
  const progress = ((viewedBottom - absoluteTop) / height) * 100;

  return Math.max(0, Math.min(100, Math.round(progress)));
}

function shouldIgnoreAnchor(anchor) {
  if (!anchor) return true;

  return !!anchor.closest(
    'header, nav, footer, [data-analytics-ignore], .sponsored-premium-section'
  );
}

export default function usePostBehaviorAnalytics({
  postId,
  contentSelector = '[data-bloggad-post-content]',
}) {
  useEffect(() => {
    const safePostId = Number(postId);
    if (!Number.isInteger(safePostId) || safePostId <= 0) return undefined;

    const root = document.querySelector(contentSelector);
    if (!root) return undefined;

    const visitorKey = getVisitorKey();
    const sessionKey = makeKey('s');
    const originalReferrer = document.referrer || '';
    const estimatedReadSeconds = estimateReadSeconds(root);

    let engagedSeconds = 0;
    let maxScrollPercent = calculateScrollPercent(root);
    let lastInteractionAt = Date.now();
    let stopped = false;

    const touch = () => {
      lastInteractionAt = Date.now();
    };

    const updateScroll = () => {
      maxScrollPercent = Math.max(
        maxScrollPercent,
        calculateScrollPercent(root)
      );
      touch();
    };

    const payload = () => ({
      visitor_key: visitorKey,
      session_key: sessionKey,
      engaged_seconds: engagedSeconds,
      max_scroll_percent: maxScrollPercent,
      estimated_read_seconds: estimatedReadSeconds,
      completed: maxScrollPercent >= 95,
      referrer: originalReferrer,
    });

    const sendEngagement = () => {
      if (stopped) return;

      api
        .post(
          `/api/public/posts/analytics/${safePostId}/engagement`,
          payload()
        )
        .catch(() => null);
    };

    const sendFinalEngagement = () => {
      const url = `/api/public/posts/analytics/${safePostId}/engagement`;
      const data = JSON.stringify(payload());

      if (navigator.sendBeacon) {
        try {
          const blob = new Blob([data], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
          return;
        } catch (error) {}
      }

      try {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true,
          credentials: 'include',
        }).catch(() => null);
      } catch (error) {}
    };

    const handleClick = (event) => {
      const anchor = event.target?.closest?.('a[href]');
      if (!anchor || !root.contains(anchor) || shouldIgnoreAnchor(anchor)) {
        return;
      }

      const linkUrl = String(anchor.href || '').trim();
      if (!/^https?:\/\//i.test(linkUrl)) return;

      const links = Array.from(root.querySelectorAll('a[href]')).filter(
        (item) => !shouldIgnoreAnchor(item)
      );
      const position = Math.max(1, links.indexOf(anchor) + 1);

      api
        .post(`/api/public/posts/analytics/${safePostId}/link-click`, {
          visitor_key: visitorKey,
          session_key: sessionKey,
          link_url: linkUrl,
          link_text: String(anchor.textContent || '').trim().slice(0, 500),
          link_position: position,
          referrer: originalReferrer,
        })
        .catch(() => null);

      touch();
    };

    const secondTimer = window.setInterval(() => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastInteractionAt <= 120000
      ) {
        engagedSeconds += 1;
      }
    }, 1000);

    const heartbeatTimer = window.setInterval(sendEngagement, 30000);
    const initialTimer = window.setTimeout(sendEngagement, 1200);

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('pointerdown', touch, { passive: true });
    window.addEventListener('keydown', touch);
    document.addEventListener('click', handleClick, true);

    const visibilityHandler = () => {
      if (document.visibilityState === 'hidden') {
        updateScroll();
        sendEngagement();
      } else {
        touch();
      }
    };

    const pageHideHandler = () => {
      updateScroll();
      sendFinalEngagement();
    };

    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('pagehide', pageHideHandler);

    return () => {
      updateScroll();
      sendFinalEngagement();
      stopped = true;

      window.clearInterval(secondTimer);
      window.clearInterval(heartbeatTimer);
      window.clearTimeout(initialTimer);

      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('pagehide', pageHideHandler);
    };
  }, [postId, contentSelector]);
}
