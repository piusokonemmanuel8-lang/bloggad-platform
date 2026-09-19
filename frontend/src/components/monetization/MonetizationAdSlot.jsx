import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../api/axios';

function getSlotLabel(slotKey = '') {
  const labels = {
    storefront_top: 'Storefront Top Ad',
    storefront_sidebar: 'Storefront Sidebar Ad',
    storefront_bottom: 'Storefront Bottom Ad',
    post_top: 'Post Top Ad',
    post_middle: 'Post Middle Ad',
    post_bottom: 'Post Bottom Ad',
    post_sidebar: 'Post Sidebar Ad',
  };

  return labels[slotKey] || 'Ad Slot';
}

function getSlotEnabled(slotKey, settings = {}) {
  const map = {
    storefront_top: Number(settings?.storefront_top_enabled || 0) === 1,
    storefront_sidebar: Number(settings?.storefront_sidebar_enabled || 0) === 1,
    storefront_bottom: Number(settings?.storefront_bottom_enabled || 0) === 1,
    post_top: Number(settings?.post_top_enabled || 0) === 1,
    post_middle: Number(settings?.post_middle_enabled || 0) === 1,
    post_bottom: Number(settings?.post_bottom_enabled || 0) === 1,
    post_sidebar: Number(settings?.post_sidebar_enabled || 0) === 1,
  };

  return !!map[slotKey];
}

function getCanRender({
  slotKey,
  monetizationSettings,
  placementMode = 'storefront',
  reviewRequired = false,
  hasInternalAd = false,
}) {
  if (!slotKey) return false;
  if (!monetizationSettings) return false;

  const mode = monetizationSettings?.monetization_mode === 'platform' ? 'platform' : 'individual';
  const reviewStatus = monetizationSettings?.review_status || 'draft';

  if (!getSlotEnabled(slotKey, monetizationSettings)) return false;

  if (placementMode === 'storefront' && slotKey.startsWith('post_')) return false;
  if (placementMode === 'post' && slotKey.startsWith('storefront_')) return false;

  if (reviewRequired && reviewStatus !== 'approved') return false;

  if (mode === 'individual') {
    const hasCode = String(monetizationSettings?.head_code || '').trim();
    if (!hasCode && !hasInternalAd) return false;
  }

  return true;
}

function renderIndividualAdCode(code = '') {
  return { __html: code };
}

function getWebsiteId(monetizationSettings = {}) {
  return (
    Number(monetizationSettings?.website_id || 0) ||
    Number(monetizationSettings?.site_id || 0) ||
    Number(monetizationSettings?.affiliate_website_id || 0) ||
    Number(monetizationSettings?.id || 0) ||
    null
  );
}

function getAffiliateUserId(monetizationSettings = {}) {
  return (
    Number(monetizationSettings?.affiliate_user_id || 0) ||
    Number(monetizationSettings?.user_id || 0) ||
    null
  );
}

function buildNativeShellStyle(darkMode) {
  return {
    minHeight: 120,
    padding: 16,
    background: darkMode ? '#111418' : '#ffffff',
  };
}

function trackImpression({
  ad,
  websiteId,
  affiliateUserId,
  postId,
  productId,
}) {
  if (!ad?.campaign_id || !ad?.placement_key) return;

  api.post('/api/public/ads/impression', {
    campaign_id: ad.campaign_id,
    creative_id: ad.creative_id || null,
    placement_id: ad.placement_id || null,
    placement_key: ad.placement_key,
    website_id: websiteId || null,
    affiliate_user_id: affiliateUserId || null,
    post_id: postId || null,
    product_id: productId || null,
    page_url:
      typeof window !== 'undefined' ? window.location.href : '',
    referrer_url:
      typeof document !== 'undefined' ? document.referrer : '',
  }).catch(() => {});
}

function trackClick({
  ad,
  websiteId,
  affiliateUserId,
  postId,
  productId,
}) {
  if (!ad?.campaign_id || !ad?.placement_key) return;

  api.post('/api/public/ads/click', {
    campaign_id: ad.campaign_id,
    creative_id: ad.creative_id || null,
    placement_id: ad.placement_id || null,
    placement_key: ad.placement_key,
    website_id: websiteId || null,
    affiliate_user_id: affiliateUserId || null,
    post_id: postId || null,
    product_id: productId || null,
    page_url:
      typeof window !== 'undefined' ? window.location.href : '',
    referrer_url:
      typeof document !== 'undefined' ? document.referrer : '',
  }).catch(() => {});
}

function NativeAdCard({
  ad,
  darkMode = false,
  websiteId = null,
  affiliateUserId = null,
  postId = null,
  productId = null,
}) {
  const creative = ad?.creative || {};
  const isHtml = creative?.type === 'html' && creative?.html_code;
  const imageUrl = creative?.asset_url || creative?.thumbnail_url || null;
  const headline = creative?.headline || ad?.headline || ad?.campaign_name || 'Sponsored';
  const description = creative?.body_text || ad?.description_text || '';
  const buttonText = creative?.button_text || ad?.call_to_action || 'Learn More';
  const displayUrl = ad?.display_url || '';
  const destinationUrl = ad?.destination_url || '#';

  const trackedRef = useRef(false);

  useEffect(() => {
    if (!ad?.campaign_id || trackedRef.current) return;
    trackedRef.current = true;

    trackImpression({
      ad,
      websiteId,
      affiliateUserId,
      postId,
      productId,
    });
  }, [ad, websiteId, affiliateUserId, postId, productId]);

  const wrapperStyle = buildNativeShellStyle(darkMode);

  if (isHtml) {
    return (
      <div style={wrapperStyle}>
        <div
          dangerouslySetInnerHTML={{ __html: creative.html_code }}
          onClick={() =>
            trackClick({
              ad,
              websiteId,
              affiliateUserId,
              postId,
              productId,
            })
          }
        />
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <a
        href={destinationUrl}
        target="_blank"
        rel="noreferrer sponsored"
        onClick={() =>
          trackClick({
            ad,
            websiteId,
            affiliateUserId,
            postId,
            productId,
          })
        }
        style={{
          display: 'grid',
          gap: 14,
          textDecoration: 'none',
          color: darkMode ? '#f8fafc' : '#111827',
        }}
      >
        {imageUrl ? (
          <div
            style={{
              width: '100%',
              borderRadius: 16,
              overflow: 'hidden',
              border: `1px solid ${darkMode ? '#23282e' : '#e5e7eb'}`,
              background: darkMode ? '#181d22' : '#f9fafb',
            }}
          >
            <img
              src={imageUrl}
              alt={creative?.alt_text || headline}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: darkMode ? '#86efac' : '#047857',
            }}
          >
            Sponsored
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              color: darkMode ? '#f8fafc' : '#111827',
            }}
          >
            {headline}
          </div>

          {description ? (
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: darkMode ? '#cbd5e1' : '#4b5563',
              }}
            >
              {description}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 4,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: darkMode ? '#94a3b8' : '#6b7280',
                wordBreak: 'break-word',
              }}
            >
              {displayUrl}
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 40,
                padding: '0 16px',
                borderRadius: 999,
                background: darkMode ? '#f8fafc' : '#111827',
                color: darkMode ? '#111827' : '#ffffff',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {buttonText}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}


const supgadDiversityRequestChains = new Map();
const supgadDiversityShownTargetIds = new Map();

function getSupgadDiversityScope(placementKey) {
  const path =
    typeof window !== 'undefined'
      ? String(window.location?.pathname || '')
      : '';

  return `${path}|${String(placementKey || '')}`;
}

function getSupgadExcludedTargetIds(scope) {
  const shown = supgadDiversityShownTargetIds.get(scope);

  if (!(shown instanceof Set)) return [];

  return Array.from(shown)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(-50);
}

function rememberSupgadCampaignTarget(scope, payload) {
  const targetId = Number(
    payload?.campaign_target_id ||
      payload?.ad?.campaign_target_id ||
      0
  );

  if (!Number.isInteger(targetId) || targetId <= 0) return;

  let shown = supgadDiversityShownTargetIds.get(scope);

  if (!(shown instanceof Set)) {
    shown = new Set();
    supgadDiversityShownTargetIds.set(scope, shown);
  }

  shown.add(targetId);

  if (shown.size > 50) {
    const values = Array.from(shown).slice(-50);
    supgadDiversityShownTargetIds.set(scope, new Set(values));
  }
}

function queueSupgadDiversityRequest(scope, requestFactory) {
  const previous =
    supgadDiversityRequestChains.get(scope) ||
    Promise.resolve();

  const current = previous
    .catch(() => {})
    .then(requestFactory);

  supgadDiversityRequestChains.set(
    scope,
    current.catch(() => {})
  );

  return current;
}

function getSupgadFeaturedSessionId() {
  if (typeof window === 'undefined') return '';

  try {
    const key = 'bloggad_supgad_featured_ads_session';
    let value = window.sessionStorage.getItem(key);

    if (!value) {
      value =
        globalThis.crypto?.randomUUID?.() ||
        `bg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(key, value);
    }

    return value;
  } catch {
    return '';
  }
}

function normalizeSupgadImage(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value !== 'object') return '';

  return String(
    value.asset_url ||
      value.image_url ||
      value.url ||
      value.src ||
      value.thumbnail_url ||
      ''
  ).trim();
}

function getSupgadCreative(ad = {}) {
  const creative =
    ad?.creative && typeof ad.creative === 'object'
      ? ad.creative
      : ad;

  const targetType = String(ad?.target_type || '').trim().toLowerCase();

  const contractImage = normalizeSupgadImage(ad?.image);
  const legacyImage = normalizeSupgadImage(
    creative?.asset_url ||
      creative?.image_url ||
      creative?.thumbnail_url ||
      ad?.image_url
  );

  const primaryImage =
    targetType === 'storefront'
      ? contractImage
      : contractImage || legacyImage;

  let images = [];

  if (targetType === 'storefront') {
    images = Array.isArray(ad?.images)
      ? ad.images.map(normalizeSupgadImage).filter(Boolean)
      : [];

    images = Array.from(new Set(images)).slice(0, 4);

    if (primaryImage && !images.includes(primaryImage)) {
      images = [primaryImage, ...images].slice(0, 4);
    }
  } else if (primaryImage) {
    images = [primaryImage];
  }

  const initialSlideIndex =
    primaryImage && images.includes(primaryImage)
      ? images.indexOf(primaryImage)
      : 0;

  return {
    targetType,
    images,
    initialSlideIndex,
    headline:
      ad?.title ||
      creative?.headline ||
      ad?.headline ||
      ad?.campaign_name ||
      'Sponsored',
    description:
      ad?.description ||
      creative?.body_text ||
      creative?.description ||
      ad?.description_text ||
      '',
    buttonText:
      creative?.button_text ||
      ad?.call_to_action ||
      ad?.cta_text ||
      'Learn More',
    displayUrl:
      ad?.display_url ||
      creative?.display_url ||
      '',
    altText:
      creative?.alt_text ||
      ad?.title ||
      creative?.headline ||
      ad?.headline ||
      'Sponsored advertisement',
    price: ad?.price ?? null,
    priceRangeMin: ad?.price_range_min ?? null,
    priceRangeMax: ad?.price_range_max ?? null,
    currency: String(ad?.currency || '').trim(),
    averageRating: ad?.average_rating ?? null,
    totalReviews: ad?.total_reviews ?? null,
  };
}

export function SupgadFeaturedAdPlacement({
  placementKey,
  postId = null,
  keywordContext = '',
  darkMode = false,
}) {
  const [delivery, setDelivery] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const rootRef = useRef(null);
  const qualifiedRef = useRef(false);
  const qualificationBusyRef = useRef(false);
  const clickBusyRef = useRef(false);
  const touchStartXRef = useRef(null);

  const creative = useMemo(
    () => getSupgadCreative(delivery?.ad || {}),
    [delivery]
  );

  const slides = creative.images || [];

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!placementKey) return;

      qualifiedRef.current = false;
      qualificationBusyRef.current = false;
      clickBusyRef.current = false;
      setMenuOpen(false);
      setDismissed(false);

      try {
        const diversityScope =
          getSupgadDiversityScope(placementKey);

        const data = await queueSupgadDiversityRequest(
          diversityScope,
          async () => {
            const response = await api.post(
              '/api/public/ads/supgad/request',
              {
                placement_key: placementKey,
                post_id: postId || null,
                keyword_context: keywordContext || null,
                session_id: getSupgadFeaturedSessionId() || null,
                exclude_campaign_target_ids:
                  getSupgadExcludedTargetIds(diversityScope),
              }
            );

            const payload = response?.data || null;

            if (
              payload?.ok &&
              payload?.ad &&
              payload?.delivery_token &&
              payload?.impression_token
            ) {
              rememberSupgadCampaignTarget(
                diversityScope,
                payload
              );
            }

            return payload;
          }
        );

        if (!ignore) {
          setDelivery(
            data?.ok &&
              data?.ad &&
              data?.delivery_token &&
              data?.impression_token
              ? data
              : null
          );
        }
      } catch {
        if (!ignore) setDelivery(null);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [placementKey, postId, keywordContext]);

  useEffect(() => {
    setSlideIndex(
      Number.isInteger(creative.initialSlideIndex)
        ? creative.initialSlideIndex
        : 0
    );
  }, [delivery?.delivery_token, creative.initialSlideIndex]);

  useEffect(() => {
    if (
      !delivery?.ad ||
      !delivery?.delivery_token ||
      !delivery?.impression_token ||
      !rootRef.current ||
      dismissed ||
      qualifiedRef.current
    ) {
      return;
    }

    let visibleSince = 0;
    let visibleRatio = 0;
    let timer = null;

    const clearTimer = () => {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        visibleRatio = Math.max(
          0,
          Math.min(1, Number(entry.intersectionRatio || 0))
        );

        if (entry.isIntersecting && visibleRatio >= 0.3) {
          if (!visibleSince) visibleSince = performance.now();

          if (
            !timer &&
            !qualifiedRef.current &&
            !qualificationBusyRef.current
          ) {
            timer = window.setTimeout(async () => {
              timer = null;

              const elapsed = visibleSince
                ? Math.max(
                    0,
                    Math.round(performance.now() - visibleSince)
                  )
                : 0;

              if (
                elapsed < 1000 ||
                visibleRatio < 0.3 ||
                qualifiedRef.current ||
                qualificationBusyRef.current
              ) {
                return;
              }

              qualificationBusyRef.current = true;

              try {
                const { data } = await api.post(
                  `/api/public/ads/supgad/impressions/${encodeURIComponent(
                    delivery.impression_token
                  )}/qualify`,
                  {
                    delivery_token: delivery.delivery_token,
                    impression_token: delivery.impression_token,
                    visible_percent: Math.round(visibleRatio * 100),
                    visible_milliseconds: elapsed,
                    session_id:
                      getSupgadFeaturedSessionId() || null,
                  }
                );

                if (data?.ok === true || data?.success === true) {
                  qualifiedRef.current = true;
                }
              } catch {
                qualifiedRef.current = false;
              } finally {
                qualificationBusyRef.current = false;
              }
            }, 1000);
          }
        } else {
          clearTimer();
          visibleSince = 0;
        }
      },
      {
        threshold: [0, 0.3, 0.5, 0.75, 1],
      }
    );

    observer.observe(rootRef.current);

    return () => {
      clearTimer();
      observer.disconnect();
    };
  }, [delivery, dismissed]);

  useEffect(() => {
    if (slides.length < 2 || dismissed) return undefined;

    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [delivery?.delivery_token, slides.length, dismissed]);

  if (!delivery?.ad) return null;

  async function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (clickBusyRef.current) return;

    clickBusyRef.current = true;

    try {
      const { data } = await api.post(
        '/api/public/ads/supgad/click',
        {
          delivery_token: delivery.delivery_token,
          impression_token: delivery.impression_token,
          session_id: getSupgadFeaturedSessionId() || null,
        }
      );

      const redirectUrl = String(data?.redirect_url || '').trim();

      if (/^https?:\/\//i.test(redirectUrl)) {
        window.location.assign(redirectUrl);
        return;
      }
    } catch {
    } finally {
      clickBusyRef.current = false;
    }
  }

  function previousSlide(event) {
    event.preventDefault();
    event.stopPropagation();

    if (slides.length < 2) return;

    setSlideIndex((current) =>
      current <= 0 ? slides.length - 1 : current - 1
    );
  }

  function nextSlide(event) {
    event.preventDefault();
    event.stopPropagation();

    if (slides.length < 2) return;

    setSlideIndex((current) => (current + 1) % slides.length);
  }

  function handleTouchStart(event) {
    touchStartXRef.current =
      event.touches?.[0]?.clientX ?? null;
  }

  function handleTouchEnd(event) {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches?.[0]?.clientX;

    touchStartXRef.current = null;

    if (
      slides.length < 2 ||
      !Number.isFinite(startX) ||
      !Number.isFinite(endX)
    ) {
      return;
    }

    const delta = endX - startX;

    if (Math.abs(delta) < 40) return;

    if (delta < 0) {
      setSlideIndex((current) => (current + 1) % slides.length);
    } else {
      setSlideIndex((current) =>
        current <= 0 ? slides.length - 1 : current - 1
      );
    }
  }

  const currentImage =
    slides[slideIndex] ||
    slides[0] ||
    '';

  const priceText = (() => {
    const currencyPrefix = creative.currency
      ? `${creative.currency} `
      : '';

    if (
      creative.price !== null &&
      creative.price !== undefined &&
      String(creative.price).trim() !== ''
    ) {
      return `${currencyPrefix}${creative.price}`;
    }

    if (
      creative.priceRangeMin !== null &&
      creative.priceRangeMin !== undefined &&
      creative.priceRangeMax !== null &&
      creative.priceRangeMax !== undefined
    ) {
      return `${currencyPrefix}${creative.priceRangeMin} - ${creative.priceRangeMax}`;
    }

    return '';
  })();

  const ratingText =
    creative.averageRating !== null &&
    creative.averageRating !== undefined
      ? `${creative.averageRating} rating${
          creative.totalReviews !== null &&
          creative.totalReviews !== undefined
            ? ` (${creative.totalReviews})`
            : ''
        }`
      : '';

  if (dismissed) {
    return (
      <aside
        ref={rootRef}
        aria-label="Ads by Supgad"
        style={{
          width: '100%',
          margin: '18px 0',
          borderRadius: 14,
          border: `1px solid ${darkMode ? '#2a2f35' : '#e5e7eb'}`,
          background: darkMode ? '#111418' : '#ffffff',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          color: darkMode ? '#cbd5e1' : '#4b5563',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <span>Ads by Supgad</span>
        <button
          type="button"
          onClick={() => setDismissed(false)}
          style={{
            border: 0,
            background: 'transparent',
            color: darkMode ? '#f8fafc' : '#111827',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          Show ad
        </button>
      </aside>
    );
  }

  return (
    <aside
      ref={rootRef}
      aria-label="Sponsored"
      style={{
        width: '100%',
        margin: '18px 0',
        borderRadius: 18,
        border: `1px solid ${darkMode ? '#2a2f35' : '#e5e7eb'}`,
        background: darkMode ? '#111418' : '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        color: darkMode ? '#f8fafc' : '#111827',
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .supgad-featured-carousel-arrow {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: 40,
          padding: '8px 10px 8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          borderBottom: `1px solid ${darkMode ? '#23282e' : '#eef2f7'}`,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 24,
            padding: '0 8px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.08em',
            background: darkMode ? '#20262d' : '#f3f4f6',
            color: darkMode ? '#f8fafc' : '#111827',
          }}
        >
          AD
        </span>

        <button
          type="button"
          aria-label="Advertisement options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          style={{
            width: 32,
            height: 32,
            border: 0,
            borderRadius: 999,
            background: 'transparent',
            color: darkMode ? '#cbd5e1' : '#4b5563',
            cursor: 'pointer',
            fontSize: 20,
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          ...
        </button>
      </div>

      {menuOpen ? (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 42,
            right: 10,
            zIndex: 5,
            minWidth: 160,
            padding: 6,
            borderRadius: 12,
            border: `1px solid ${darkMode ? '#30363d' : '#e5e7eb'}`,
            background: darkMode ? '#181d22' : '#ffffff',
            boxShadow: '0 12px 30px rgba(15,23,42,0.14)',
          }}
        >
          <div
            style={{
              padding: '9px 10px',
              fontSize: 12,
              fontWeight: 800,
              color: darkMode ? '#f8fafc' : '#111827',
            }}
          >
            Ads by Supgad
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              setDismissed(true);
            }}
            style={{
              width: '100%',
              border: 0,
              borderRadius: 8,
              padding: '9px 10px',
              background: 'transparent',
              color: darkMode ? '#cbd5e1' : '#4b5563',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Hide this ad
          </button>
        </div>
      ) : null}

      {currentImage ? (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: '100%',
            background: darkMode ? '#0b0d10' : '#f8fafc',
          }}
        >
          <button
            type="button"
            aria-label={`Open advertisement for ${creative.headline}`}
            onClick={handleClick}
            style={{
              display: 'block',
              width: '100%',
              border: 0,
              padding: 0,
              margin: 0,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <img
              src={currentImage}
              alt={creative.altText}
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                maxHeight: 360,
                objectFit: 'cover',
              }}
            />
          </button>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                className="supgad-featured-carousel-arrow"
                aria-label="Previous advertisement image"
                onClick={previousSlide}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.72)',
                  background: 'rgba(17,24,39,0.58)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                {'<'}
              </button>

              <button
                type="button"
                className="supgad-featured-carousel-arrow"
                aria-label="Next advertisement image"
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.72)',
                  background: 'rgba(17,24,39,0.58)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                {'>'}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {slides.length > 1 ? (
        <div
          aria-label="Advertisement images"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px 0',
          }}
        >
          {slides.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Show advertisement image ${index + 1}`}
              aria-current={slideIndex === index ? 'true' : undefined}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSlideIndex(index);
              }}
              style={{
                width: slideIndex === index ? 18 : 7,
                height: 7,
                border: 0,
                borderRadius: 999,
                padding: 0,
                background:
                  slideIndex === index
                    ? darkMode
                      ? '#f8fafc'
                      : '#111827'
                    : darkMode
                      ? '#64748b'
                      : '#cbd5e1',
                cursor: 'pointer',
                transition: 'width 160ms ease',
              }}
            />
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gap: 10,
          padding: 14,
        }}
      >
        <button
          type="button"
          onClick={handleClick}
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            background: 'transparent',
            color: darkMode ? '#f8fafc' : '#111827',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1.25,
          }}
        >
          {creative.headline}
        </button>

        {creative.description ? (
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: darkMode ? '#cbd5e1' : '#4b5563',
            }}
          >
            {creative.description}
          </div>
        ) : null}

        {priceText || ratingText ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              fontSize: 13,
              color: darkMode ? '#cbd5e1' : '#4b5563',
            }}
          >
            {priceText ? (
              <strong
                style={{
                  color: darkMode ? '#f8fafc' : '#111827',
                  fontSize: 16,
                }}
              >
                {priceText}
              </strong>
            ) : null}
            {ratingText ? <span>{ratingText}</span> : null}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {creative.displayUrl ? (
            <span
              style={{
                fontSize: 12,
                color: darkMode ? '#94a3b8' : '#6b7280',
                wordBreak: 'break-word',
              }}
            >
              {creative.displayUrl}
            </span>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: darkMode ? '#94a3b8' : '#6b7280',
              }}
            >
              Ads by Supgad
            </span>
          )}

          <button
            type="button"
            onClick={handleClick}
            style={{
              minHeight: 36,
              border: 0,
              borderRadius: 999,
              padding: '0 14px',
              background: darkMode ? '#f8fafc' : '#111827',
              color: darkMode ? '#111827' : '#ffffff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {creative.buttonText}
          </button>
        </div>
      </div>
    </aside>
  );
}
export default function MonetizationAdSlot({
  slotKey,
  monetizationSettings,
  reviewRequired = true,
  placementMode = 'storefront',
  darkMode = false,
  isPreview = false,
  websiteId: websiteIdProp = null,
  affiliateUserId: affiliateUserIdProp = null,
  postId = null,
  productId = null,
  externalFallback = null,
}) {
  const [internalAd, setInternalAd] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalResolved, setInternalResolved] = useState(false);

  const mode =
    monetizationSettings?.monetization_mode === 'platform' ? 'platform' : 'individual';

  const websiteId = websiteIdProp || getWebsiteId(monetizationSettings);
  const affiliateUserId = affiliateUserIdProp || getAffiliateUserId(monetizationSettings);
  const hasHeadCode = String(monetizationSettings?.head_code || '').trim();

  useEffect(() => {
    let ignore = false;

        async function loadInternalAd() {
      setInternalResolved(false);
      setInternalAd(null);

      if (!slotKey || !monetizationSettings) {
        if (!ignore) setInternalResolved(true);
        return;
      }

      if (!getSlotEnabled(slotKey, monetizationSettings)) {
        setInternalAd(null);
        if (!ignore) setInternalResolved(true);
        return;
      }

      if (reviewRequired && monetizationSettings?.review_status !== 'approved') {
        setInternalAd(null);
        if (!ignore) setInternalResolved(true);
        return;
      }

      setInternalLoading(true);

      try {
        const params = {
          slot_key: slotKey,
        };

        if (websiteId) params.website_id = websiteId;
        if (affiliateUserId) params.affiliate_user_id = affiliateUserId;
        if (postId) params.post_id = postId;
        if (productId) params.product_id = productId;

        const { data } = await api.get('/api/public/ads/serve', { params });

        if (!ignore) {
          setInternalAd(data?.ok ? data?.ad || null : null);
        }
      } catch (error) {
        if (!ignore) {
          setInternalAd(null);
        }
      } finally {
        if (!ignore) {
          setInternalLoading(false);
          setInternalResolved(true);
        }
      }
    }

    loadInternalAd();

    return () => {
      ignore = true;
    };
  }, [
    slotKey,
    monetizationSettings,
    reviewRequired,
    websiteId,
    affiliateUserId,
    postId,
    productId,
  ]);

  const canRender = useMemo(
    () =>
      getCanRender({
        slotKey,
        monetizationSettings,
        placementMode,
        reviewRequired,
        hasInternalAd: Boolean(internalAd),
      }),
    [slotKey, monetizationSettings, placementMode, reviewRequired, internalAd]
  );

    const canRenderExternalFallback = useMemo(() => {
    if (!externalFallback || !internalResolved || internalAd) return false;
    if (!slotKey || !monetizationSettings) return false;
    if (!getSlotEnabled(slotKey, monetizationSettings)) return false;

    if (placementMode === 'storefront' && slotKey.startsWith('post_')) {
      return false;
    }

    if (placementMode === 'post' && slotKey.startsWith('storefront_')) {
      return false;
    }

    return mode === 'platform';
  }, [
    externalFallback,
    internalResolved,
    internalAd,
    slotKey,
    monetizationSettings,
    placementMode,
    mode,
  ]);

  if (!canRender && !canRenderExternalFallback && !isPreview) {
    return null;
  }

  const shellStyle = {
    width: '100%',
    borderRadius: 20,
    border: `1px solid ${darkMode ? '#2a2f35' : '#dbe2ea'}`,
    background: darkMode ? '#111418' : '#ffffff',
    overflow: 'hidden',
    boxShadow: darkMode
      ? '0 10px 28px rgba(0,0,0,0.24)'
      : '0 10px 28px rgba(15,23,42,0.06)',
  };

  const topBarStyle = {
    padding: '10px 14px',
    borderBottom: `1px solid ${darkMode ? '#23282e' : '#eef2f7'}`,
    background: darkMode ? '#181d22' : '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 26,
    padding: '0 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    background: internalAd
      ? '#fff7ed'
      : mode === 'platform'
        ? '#eff6ff'
        : '#ecfdf3',
    color: internalAd
      ? '#c2410c'
      : mode === 'platform'
        ? '#1d4ed8'
        : '#027a48',
    border: `1px solid ${
      internalAd
        ? '#fed7aa'
        : mode === 'platform'
          ? '#bfdbfe'
          : '#abefc6'
    }`,
  };

  if (!canRender && isPreview) {
    return (
      <div style={shellStyle}>
        <div style={topBarStyle}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: darkMode ? '#f8fafc' : '#111827',
            }}
          >
            {getSlotLabel(slotKey)}
          </div>
          <div style={badgeStyle}>Preview</div>
        </div>

        <div
          style={{
            minHeight: 120,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: 14,
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          This ad slot is currently off or not yet approved.
        </div>
      </div>
    );
  }

  if (internalAd) {
    return (
      <div style={shellStyle}>
        <div style={topBarStyle}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: darkMode ? '#f8fafc' : '#111827',
            }}
          >
            {getSlotLabel(slotKey)}
          </div>
          <div style={badgeStyle}>Native Campaign</div>
        </div>

        <NativeAdCard
          ad={internalAd}
          darkMode={darkMode}
          websiteId={websiteId}
          affiliateUserId={affiliateUserId}
          postId={postId}
          productId={productId}
        />
      </div>
    );
  }

  if (mode === 'platform' && canRenderExternalFallback) {
    return externalFallback;
  }

  if (mode === 'platform') {
    return (
      <div style={shellStyle}>
        <div style={topBarStyle}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: darkMode ? '#f8fafc' : '#111827',
            }}
          >
            {getSlotLabel(slotKey)}
          </div>
          <div style={badgeStyle}>BlogPulse</div>
        </div>

        <div
          style={{
            minHeight: 120,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: darkMode
              ? 'linear-gradient(135deg, #101317 0%, #181d22 100%)'
              : 'linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)',
            color: darkMode ? '#f8fafc' : '#111827',
            textAlign: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: '-0.03em',
              }}
            >
              BlogPulse Ad Placement
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                lineHeight: 1.6,
                color: darkMode ? '#cbd5e1' : '#4b5563',
              }}
            >
              Platform-managed ad slot for approved monetization.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (internalLoading && !hasHeadCode) {
    return (
      <div style={shellStyle}>
        <div style={topBarStyle}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: darkMode ? '#f8fafc' : '#111827',
            }}
          >
            {getSlotLabel(slotKey)}
          </div>
          <div style={badgeStyle}>Loading</div>
        </div>

        <div
          style={{
            minHeight: 120,
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            color: darkMode ? '#9ca3af' : '#6b7280',
            fontSize: 14,
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          Loading ad...
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <div style={topBarStyle}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: darkMode ? '#f8fafc' : '#111827',
          }}
        >
          {getSlotLabel(slotKey)}
        </div>
        <div style={badgeStyle}>Individual</div>
      </div>

      <div
        style={{
          padding: 12,
          background: darkMode ? '#111418' : '#ffffff',
        }}
      >
        <div
          dangerouslySetInnerHTML={renderIndividualAdCode(monetizationSettings?.head_code || '')}
        />
      </div>
    </div>
  );
}
