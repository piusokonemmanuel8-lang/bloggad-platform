import { useEffect, useMemo, useRef, useState } from 'react';
import { createLandingAnalyticsLifecycle } from '../../utils/salesLandingAnalyticsLifecycle.mjs';
import { createYoutubeWatchEngine } from '../../utils/salesLandingYoutubeWatch.mjs';
import { createYoutubeIframeBridge } from '../../utils/salesLandingYoutubeBridge.mjs';

// Disabled until the analytics database and endpoint are verified.
const SALES_ANALYTICS_ENABLED = true;

// Shared YouTube API loader. It does not run while tracking is disabled.
let salesYoutubeApiPromise = null;

function loadSalesYoutubeApi() {
  if (window.YT?.Player && window.YT?.PlayerState) {
    return Promise.resolve(window.YT);
  }

  if (salesYoutubeApiPromise) return salesYoutubeApiPromise;

  salesYoutubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      try {
        if (typeof previousReady === 'function') previousReady();
      } catch {
        // An unrelated callback must not prevent player initialization.
      }

      if (window.YT?.Player && window.YT?.PlayerState) {
        resolve(window.YT);
      } else {
        reject(new Error('YOUTUBE_IFRAME_API_UNAVAILABLE'));
      }
    };

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        salesYoutubeApiPromise = null;
        reject(new Error('YOUTUBE_IFRAME_API_LOAD_FAILED'));
      };
      document.head.appendChild(script);
    }
  });

  return salesYoutubeApiPromise;
}
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import './PublicSalesLandingPage.css';

function readJson(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
}
function youtubeEmbed(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const match = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&playsinline=1&fs=0&disablekb=1` : '';
}

export default function PublicSalesLandingPage() {
  const { landingSlug } = useParams();
  const analyticsRef = useRef(null);
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/api/writer/sales-landing/public/${encodeURIComponent(landingSlug || '')}`, { skipGlobalLoader: true })
      .then(({ data }) => { if (active) setPage(data?.page || null); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || 'Landing page not found.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [landingSlug]);

  const content = useMemo(() => readJson(page?.content_json), [page]);
  const video = youtubeEmbed(content.video_url);
  const [trackingConsentPage, setTrackingConsentPage] = useState('');
  const [trackingDeclinedPage, setTrackingDeclinedPage] = useState('');

  const trackingGoogleId =
    typeof content.tracking?.google_ads_id === 'string' &&
    /^AW-[0-9]{6,15}$/.test(content.tracking.google_ads_id)
      ? content.tracking.google_ads_id
      : '';

  const trackingGoogleConversionLabel =
    trackingGoogleId &&
    typeof content.tracking?.google_conversion_label === 'string' &&
    /^[A-Za-z0-9_-]{1,100}$/.test(content.tracking.google_conversion_label)
      ? content.tracking.google_conversion_label
      : '';

  const trackingMetaId =
    typeof content.tracking?.meta_pixel_id === 'string' &&
    /^[0-9]{6,20}$/.test(content.tracking.meta_pixel_id)
      ? content.tracking.meta_pixel_id
      : '';

  const trackingConfigured = Boolean(trackingGoogleId || trackingMetaId);

  const trackingPageKey = page?.id && page?.slug
    ? String(page.id) + ':' + String(page.slug)
    : '';

  const trackingAllowed =
    Boolean(trackingPageKey) &&
    trackingConsentPage === trackingPageKey;

  useEffect(() => {
    if (!trackingAllowed || !trackingConfigured || !trackingPageKey) {
      return;
    }

    const pageUrl = window.location.href;

    if (trackingGoogleId) {
      if (!Array.isArray(window.dataLayer)) {
        window.dataLayer = [];
      }

      if (typeof window.gtag !== 'function') {
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
      }

      if (!document.querySelector('script[data-bloggad-google-tag]')) {
        const script = document.createElement('script');
        script.async = true;
        script.dataset.bloggadGoogleTag = 'true';
        script.src =
          'https://www.googletagmanager.com/gtag/js?id=' +
          encodeURIComponent(trackingGoogleId);
        document.head.appendChild(script);
      }

      window.gtag('js', new Date());
      window.gtag('config', trackingGoogleId, {
        send_page_view: true,
        page_location: pageUrl,
      });
    }

    if (trackingMetaId) {
      if (typeof window.fbq !== 'function') {
        const fbq = function () {
          if (fbq.callMethod) {
            fbq.callMethod.apply(fbq, arguments);
          } else {
            fbq.queue.push(arguments);
          }
        };

        fbq.queue = [];
        fbq.loaded = true;
        fbq.version = '2.0';
        window.fbq = fbq;
      }

      if (!document.querySelector('script[data-bloggad-meta-tag]')) {
        const script = document.createElement('script');
        script.async = true;
        script.dataset.bloggadMetaTag = 'true';
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      }

      window.fbq('init', trackingMetaId);
      window.fbq('trackSingle', trackingMetaId, 'PageView');
    }
  }, [
    trackingAllowed,
    trackingConfigured,
    trackingGoogleId,
    trackingMetaId,
    trackingPageKey,
  ]);

  useEffect(() => {
    const initialUrl = window.location.href;

    return () => {
      const currentUrl = window.location.href;

      if (currentUrl === initialUrl) {
        return;
      }

      const bloggadTagsExist = Boolean(
        document.querySelector(
          'script[data-bloggad-google-tag],script[data-bloggad-meta-tag]'
        )
      );

      if (bloggadTagsExist) {
        window.location.replace(currentUrl);
      }
    };
  }, [landingSlug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.seo_title || page.title || 'Sales Landing Page';
    const description = page.seo_description || content.subheadline || '';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [page, content.subheadline]);

  // First-party landing-page tracking is independent of ad pixels.
  // It remains disabled until the corresponding API is deployed.
  useEffect(() => {
    if (
      !SALES_ANALYTICS_ENABLED ||
      !page?.id ||
      page.slug !== landingSlug ||
      typeof window === 'undefined' ||
      !window.crypto?.randomUUID
    ) {
      return undefined;
    }

    const tracker = createLandingAnalyticsLifecycle({
      pageId: Number(page.id),
      locationUrl: window.location.href,
      referrer: document.referrer,
      makeUuid: () => window.crypto.randomUUID(),
      send: async (pageId, event) => {
        const response = await fetch(
          '/api/sales-landing-analytics/public/' +
            encodeURIComponent(pageId) + '/events',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'omit',
            keepalive: true,
            body: JSON.stringify(event)
          }
        );

        if (!response.ok) {
          throw new Error('ANALYTICS_EVENT_DELIVERY_FAILED');
        }
      }
    });

    analyticsRef.current = tracker;
    void tracker.start();

    const syncVisibility = () => {
      tracker.visibility(
        document.visibilityState === 'visible',
        document.hasFocus()
      );
    };

    document.addEventListener('visibilitychange', syncVisibility);
    window.addEventListener('focus', syncVisibility);
    window.addEventListener('blur', syncVisibility);

    syncVisibility();

    const interval = window.setInterval(() => {
      void tracker.sample();
      void tracker.retryPending();
    }, 10000);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', syncVisibility);
      window.removeEventListener('focus', syncVisibility);
      window.removeEventListener('blur', syncVisibility);
      tracker.stop();

      if (analyticsRef.current === tracker) {
        analyticsRef.current = null;
      }
    };
  }, [page?.id, page?.slug, landingSlug]);

  // Only enable after the analytics endpoint and database migration pass.
  // Existing video rendering is unchanged while the feature is disabled.
  useEffect(() => {
    if (
      !SALES_ANALYTICS_ENABLED ||
      !page?.id ||
      page.slug !== landingSlug ||
      !video ||
      typeof window === 'undefined'
    ) {
      return undefined;
    }

    const iframe = document.querySelector(
      '.public-sales-video iframe'
    );

    if (!iframe) return undefined;

    let cancelled = false;
    let bridge = null;

    try {
      const url = new URL(iframe.src);
      url.searchParams.set('enablejsapi', '1');
      url.searchParams.set('origin', window.location.origin);
      iframe.src = url.toString();
    } catch {
      return undefined;
    }

    void loadSalesYoutubeApi().then((YT) => {
      if (cancelled || !iframe.isConnected) return;

      const engine = createYoutubeWatchEngine({
        emit: async (type, data) => {
          if (!cancelled && analyticsRef.current) {
            await analyticsRef.current.event(type, data);
          }
        }
      });

      bridge = createYoutubeIframeBridge({
        YT,
        mount: iframe,
        engine
      });

      bridge.start();
    }).catch(() => {
      // The video remains usable if its analytics API is unavailable.
    });

    return () => {
      cancelled = true;
      if (bridge) bridge.destroy();
    };
  }, [page?.id, page?.slug, landingSlug, video]);

  const handleLandingButtonClick = (buttonUrl, sectionId) => {
    if (!analyticsRef.current) return;

    let eventType = 'external_cta_click';

    try {
      const url = new URL(buttonUrl);
      const host = url.hostname.toLowerCase();

      if (
        host === 'wa.me' ||
        host === 'wa.link' ||
        host === 'walink.com' ||
        host === 'api.whatsapp.com' ||
        host === 'web.whatsapp.com'
      ) {
        eventType = 'whatsapp_click';
      }
    } catch {
      return;
    }

    void analyticsRef.current.event(eventType, {
      section_id: String(sectionId || '').slice(0, 100)
    });
  };

  const handleCheckoutClick = (event) => {
    void analyticsRef.current?.event('checkout_click');
    if (
      !trackingAllowed ||
      !trackingConfigured ||
      !trackingPageKey ||
      !page ||
      page.slug !== landingSlug
    ) {
      return;
    }

    if (trackingGoogleId && typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        send_to: trackingGoogleId,
        page_location: window.location.href,
      });
    }

    if (trackingMetaId && typeof window.fbq === 'function') {
      window.fbq('trackSingle', trackingMetaId, 'InitiateCheckout');
    }

    if (
      trackingGoogleId &&
      trackingGoogleConversionLabel &&
      typeof window.gtag === 'function'
    ) {
      const link = event?.currentTarget;
      const normalClick = Boolean(
        event &&
        link?.href &&
        event.button === 0 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey &&
        !event.defaultPrevented &&
        (!link.target || link.target === '_self')
      );

      let completed = false;

      const continueToCheckout = () => {
        if (completed || !normalClick) return;
        completed = true;
        window.location.assign(link.href);
      };

      if (normalClick) {
        event.preventDefault();
        window.setTimeout(continueToCheckout, 1200);
      }

      try {
        window.gtag('event', 'conversion', {
          send_to:
            trackingGoogleId + '/' + trackingGoogleConversionLabel,
          event_callback: normalClick ? continueToCheckout : undefined,
          event_timeout: 1000,
        });
      } catch {
        continueToCheckout();
      }
    }
  };
  if (loading) return <main className="public-sales-landing state">Loading...</main>;
  if (error || !page) return <main className="public-sales-landing state"><h1>Page unavailable</h1><p>{error}</p></main>;

  return (
    <main className="public-sales-landing">
      {content.urgency_text ? <div className="public-sales-urgency">{content.urgency_text}</div> : null}
      <section className="public-sales-hero">
        <div className="public-sales-copy">
          {content.badge_text ? <div className="public-sales-badge">{content.badge_text}</div> : null}
          <h1>
            {content.headline || page.title}
            {content.highlight_text ? <span className="public-sales-highlight">{content.highlight_text}</span> : null}
          </h1>
          {content.subheadline ? <p className="public-sales-subheadline">{content.subheadline}</p> : null}
          {content.cta_text && content.cta_url ? (
            <a className="public-sales-cta" href={content.cta_url} onClick={handleCheckoutClick}>{content.cta_text}</a>
          ) : null}
        </div>
        {content.image_url ? <img className="public-sales-image" src={content.image_url} alt="" loading="lazy" decoding="async" /> : null}
      </section>
      {video ? (
        <section className="public-sales-video"><iframe src={video} title={page.title} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></section>
      ) : content.video_url ? (
        <section className="public-sales-video-link"><a href={content.video_url}>Watch video</a></section>
      ) : null}
      {content.body ? <section className="public-sales-body">{content.body.split('\n').map((line, index) => <p key={index}>{line}</p>)}</section> : null}
      {(Array.isArray(content.vxl_sections) ? content.vxl_sections : []).filter((section) => section?.enabled !== false).map((section, index) => (
        <section className={`vxl-dynamic-section vxl-section-${section.type || 'text'}`} key={section.id || index} style={{ color: section.text_color || '#ffffff', paddingTop: `${section.padding_top ?? 48}px`, paddingBottom: `${section.padding_bottom ?? 48}px`, paddingLeft: `${section.padding_left ?? 0}px`, paddingRight: `${section.padding_right ?? 0}px` }}>
          {section.type === 'button' ? (
            <div style={{ textAlign: 'center' }}>
              {section.title ? <h2>{section.title}</h2> : null}
              {section.text ? <p style={{ whiteSpace: 'pre-line' }}>{section.text}</p> : null}
              {section.button_text && (() => {
                try {
                  const url = new URL(section.button_url || '');
                  return url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.');
                } catch {
                  return false;
                }
              })() ? (
                <a
                  href={section.button_url}
                  onClick={() => handleLandingButtonClick(
                    section.button_url,
                    section.id || 'sales-landing-button'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    backgroundColor: /^#[0-9a-fA-F]{6}$/.test(section.button_color || '') ? section.button_color : '#25D366',
                    color: /^#[0-9a-fA-F]{6}$/.test(section.button_text_color || '') ? section.button_text_color : '#ffffff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    textAlign: 'center',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflowWrap: 'anywhere'
                  }}
                >
                  {section.button_text}
                </a>
              ) : null}
            </div>
          ) : section.type === 'testimonials' ? (
            <div className="vxl-testimonial-grid" style={{ '--review-columns': Math.min(4, Math.max(2, Number(section.review_columns) || 4)) }}>
              {(section.testimonials || []).map((review, reviewIndex) => (
                <article className="vxl-testimonial" key={reviewIndex}>
                  {review.photo_url ? <img src={review.photo_url} alt="" loading="lazy" decoding="async" /> : null}
                  {review.name ? <strong>{review.name}</strong> : null}
                  {review.review ? <p>{review.review}</p> : null}{review.video_url ? (youtubeEmbed(review.video_url) ? <div className="vxl-review-video"><iframe src={youtubeEmbed(review.video_url)} title={`${review.name || 'Reviewer'} video`} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <video className="vxl-review-video-file" src={review.video_url} controls playsInline preload="none" />) : null}
                </article>
              ))}
            </div>
          ) : section.type === 'footer' ? (
            <footer>{section.title ? <h2>{section.title}</h2> : null}<p>{section.footer_text}</p></footer>
          ) : (
            <div className={section.type === 'two-column' || section.type === 'text-image' ? 'vxl-columns' : ''}>
              <div>
                {section.title ? <h2>{section.title}</h2> : null}
                {section.text ? <p>{section.text}</p> : null}
                {section.image_url && section.type === 'image' ? <img src={section.image_url} alt="" loading="lazy" decoding="async" /> : null}
              </div>
              {(section.type === 'two-column' || section.type === 'text-image') && section.image_url ? <div><img src={section.image_url} alt="" loading="lazy" decoding="async" />{section.image_url_2 ? <img src={section.image_url_2} alt="" loading="lazy" decoding="async" /> : null}</div> : null}
            </div>
          )}
        </section>
      ))}
      {content.cta_text && content.cta_url ? (
        <section className="public-sales-bottom-cta"><a className="public-sales-cta" href={content.cta_url} onClick={handleCheckoutClick}>{content.cta_text}</a></section>
      ) : null}
          {trackingConfigured &&
      !trackingAllowed &&
      trackingDeclinedPage !== trackingPageKey ? (
        <section
          className="public-sales-tracking-consent"
          aria-label="Advertising privacy choices"
          style={{
            boxSizing: 'border-box',
            maxWidth: '680px',
            margin: '24px auto 8px',
            padding: '8px 12px',
            border: '1px solid #555',
            borderRadius: '6px',
            background: '#171717',
            color: '#ddd',
            fontSize: '11px',
            lineHeight: 1.45,
            textAlign: 'center',
          }}
        >
          <span style={{ marginRight: '10px' }}>
            Optional advertising measurement.
          </span>
          <button
            type="button"
            onClick={() => setTrackingConsentPage(trackingPageKey)}
            style={{
              padding: '4px 8px',
              margin: '3px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => setTrackingDeclinedPage(trackingPageKey)}
            style={{
              padding: '4px 8px',
              margin: '3px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Reject
          </button>
        </section>
      ) : null}
    </main>
  );
}