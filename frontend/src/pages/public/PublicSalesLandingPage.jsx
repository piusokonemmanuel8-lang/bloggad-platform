import { useEffect, useMemo, useState } from 'react';
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

  const handleCheckoutClick = (event) => {
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