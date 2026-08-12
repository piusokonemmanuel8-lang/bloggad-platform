import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './BloggadGlobalLoader.css';

const ROUTE_MINIMUM_MS = 420;
const NETWORK_DELAY_MS = 140;
const VISIBLE_MINIMUM_MS = 280;

export default function BloggadGlobalLoader() {
  const location = useLocation();
  const [routeBusy, setRouteBusy] = useState(true);
  const [networkPending, setNetworkPending] = useState(0);
  const [visible, setVisible] = useState(true);
  const visibleSinceRef = useRef(Date.now());
  const networkDelayRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    setRouteBusy(true);

    const timer = window.setTimeout(() => {
      setRouteBusy(false);
    }, ROUTE_MINIMUM_MS);

    return () => window.clearTimeout(timer);
  }, [location.key, location.pathname, location.search]);

  useEffect(() => {
    function handleLoading(event) {
      const pending = Math.max(0, Number(event?.detail?.pending || 0));
      setNetworkPending(pending);
    }

    window.addEventListener('bloggad:global-loading', handleLoading);

    return () => {
      window.removeEventListener('bloggad:global-loading', handleLoading);
    };
  }, []);

  useEffect(() => {
    const routeNeedsLoader = routeBusy;
    const networkNeedsLoader = networkPending > 0;

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (routeNeedsLoader) {
      if (networkDelayRef.current) {
        window.clearTimeout(networkDelayRef.current);
        networkDelayRef.current = null;
      }

      if (!visible) {
        visibleSinceRef.current = Date.now();
        setVisible(true);
      }

      return undefined;
    }

    if (networkNeedsLoader) {
      if (visible) return undefined;

      if (!networkDelayRef.current) {
        networkDelayRef.current = window.setTimeout(() => {
          networkDelayRef.current = null;
          visibleSinceRef.current = Date.now();
          setVisible(true);
        }, NETWORK_DELAY_MS);
      }

      return undefined;
    }

    if (networkDelayRef.current) {
      window.clearTimeout(networkDelayRef.current);
      networkDelayRef.current = null;
    }

    if (!visible) return undefined;

    const elapsed = Date.now() - visibleSinceRef.current;
    const remaining = Math.max(0, VISIBLE_MINIMUM_MS - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setVisible(false);
    }, remaining);

    return undefined;
  }, [routeBusy, networkPending, visible]);

  useEffect(() => {
    return () => {
      if (networkDelayRef.current) window.clearTimeout(networkDelayRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <div
      className={`bloggad-global-loader${visible ? ' is-visible' : ''}`}
      aria-hidden={!visible}
      aria-live="polite"
    >
      <div className="bloggad-global-loader-card" role="status" aria-label="Loading Bloggad">
        <div className="bloggad-global-loader-mark" aria-hidden="true">
          <span className="bloggad-loader-orbit orbit-one" />
          <span className="bloggad-loader-orbit orbit-two" />
          <span className="bloggad-loader-core">B</span>
        </div>

        <div className="bloggad-global-loader-copy">
          <strong>Bloggad</strong>
          <span>Loading your next page</span>
        </div>

        <div className="bloggad-global-loader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}