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

function getSupgadCreative(ad = {}) {
  const creative =
    ad?.creative && typeof ad.creative === 'object'
      ? ad.creative
      : ad;

  return {
    imageUrl:
      creative?.asset_url ||
      creative?.image_url ||
      creative?.thumbnail_url ||
      ad?.image_url ||
      null,
    headline:
      creative?.headline ||
      ad?.headline ||
      ad?.campaign_name ||
      'Sponsored',
    description:
      creative?.body_text ||
      creative?.description ||
      ad?.description_text ||
      ad?.description ||
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
      creative?.headline ||
      ad?.headline ||
      'Sponsored advertisement',
  };
}

export function SupgadFeaturedAdPlacement({
  placementKey,
  postId = null,
  keywordContext = '',
  darkMode = false,
}) {
  const [delivery, setDelivery] = useState(null);
  const rootRef = useRef(null);
  const qualifiedRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!placementKey) return;

      try {
        const { data } = await api.post('/api/public/ads/supgad/request', {
          placement_key: placementKey,
          post_id: postId || null,
          keyword_context: keywordContext || null,
          session_id: getSupgadFeaturedSessionId() || null,
        });

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
    if (
      !delivery?.ad ||
      !delivery?.delivery_token ||
      !delivery?.impression_token ||
      !rootRef.current ||
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

          if (!timer && !qualifiedRef.current) {
            timer = window.setTimeout(async () => {
              const elapsed = visibleSince
                ? Math.max(
                    0,
                    Math.round(performance.now() - visibleSince)
                  )
                : 0;

              if (elapsed < 1000 || qualifiedRef.current) return;

              qualifiedRef.current = true;

              try {
                await api.post(
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
              } catch {}
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
  }, [delivery]);

  if (!delivery?.ad) return null;

  const creative = getSupgadCreative(delivery.ad);

  async function handleClick(event) {
    event.preventDefault();

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
      }
    } catch {}
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
      }}
    >
      <a
        href="#"
        onClick={handleClick}
        rel="sponsored"
        style={{
          display: 'grid',
          gap: 12,
          padding: 14,
          textDecoration: 'none',
          color: darkMode ? '#f8fafc' : '#111827',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: darkMode ? '#86efac' : '#047857',
          }}
        >
          Sponsored
        </span>

        {creative.imageUrl ? (
          <img
            src={creative.imageUrl}
            alt={creative.altText}
            loading="lazy"
            style={{
              display: 'block',
              width: '100%',
              maxHeight: 320,
              objectFit: 'cover',
              borderRadius: 14,
            }}
          />
        ) : null}

        <strong style={{ fontSize: 20, lineHeight: 1.25 }}>
          {creative.headline}
        </strong>

        {creative.description ? (
          <span
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: darkMode ? '#cbd5e1' : '#4b5563',
            }}
          >
            {creative.description}
          </span>
        ) : null}

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: darkMode ? '#94a3b8' : '#6b7280',
              wordBreak: 'break-word',
            }}
          >
            {creative.displayUrl}
          </span>

          <span
            style={{
              display: 'inline-flex',
              minHeight: 38,
              alignItems: 'center',
              padding: '0 14px',
              borderRadius: 999,
              background: darkMode ? '#f8fafc' : '#111827',
              color: darkMode ? '#111827' : '#ffffff',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {creative.buttonText}
          </span>
        </span>
      </a>
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
