import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Heart,
  Menu,
  Monitor,
  Mouse,
  Cpu,
  Smartphone,
  Gamepad2,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  Search,
  Share2,
  Star,
  User,
  Scale,
  Globe,
  Headphones,
  X,
} from 'lucide-react';
import MonetizationAdSlot from '../../../components/monetization/MonetizationAdSlot';
import useAffiliateMonetizationSlots from '../../../hooks/useAffiliateMonetizationSlots';

function renderPrice(product, formatCurrency) {
  if (!product) return '-';

  if (product?.pricing_type === 'simple') {
    return product?.price !== null && product?.price !== undefined
      ? formatCurrency(product.price)
      : '-';
  }

  const min = product?.min_price ?? product?.price ?? 0;
  const max = product?.max_price ?? product?.price ?? 0;
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

function resolveMenuUrl(item, websiteSlug) {
  return item?.resolved_url || item?.custom_url || `/${websiteSlug || ''}`;
}

function resolveWebsiteSlug(product, fallbackWebsiteSlug = '') {
  return (
    product?.website_slug ||
    product?.website?.slug ||
    product?.affiliate?.website_slug ||
    product?.affiliate?.website?.slug ||
    fallbackWebsiteSlug
  );
}

function resolveReadMoreUrl(product, fallbackWebsiteSlug = '') {
  if (product?.read_more_url) return product.read_more_url;
  if (product?.review_url) return product.review_url;

  const websiteSlug = resolveWebsiteSlug(product, fallbackWebsiteSlug);
  if (websiteSlug && product?.slug) return `/${websiteSlug}/product/${product.slug}`;
  if (product?.slug) return `/product/${product.slug}`;
  return '#';
}

function resolveBuyNowUrl(product) {
  return product?.affiliate_buy_url || product?.website_url || '#';
}

function resolveVisitWebsiteUrl(product, fallbackWebsiteSlug = '') {
  if (product?.website_url) return product.website_url;
  const websiteSlug = resolveWebsiteSlug(product, fallbackWebsiteSlug);
  return websiteSlug ? `/${websiteSlug}` : '#';
}

function resolveReviewUrl(product, fallbackWebsiteSlug = '') {
  return (
    product?.review_url ||
    product?.review_site_url ||
    product?.external_review_url ||
    resolveReadMoreUrl(product, fallbackWebsiteSlug)
  );
}

function getTemplateConfig(settings, templateCodeKey = 'premium_brand') {
  const raw =
    settings?.template_settings_json?.[templateCodeKey] ||
    settings?.[templateCodeKey] ||
    {};

  return {
    top_header: {
      enabled: raw?.top_header?.enabled !== false,
      support_title: raw?.top_header?.support_title || '24 Support',
      support_text: raw?.top_header?.support_text || '+1 212-334-0212',
      shipping_title: raw?.top_header?.shipping_title || 'Worldwide',
      shipping_text: raw?.top_header?.shipping_text || 'Free Shipping',
      country_label: raw?.top_header?.country_label || 'USA',
      currency_label: raw?.top_header?.currency_label || 'USD',
    },
    hero_slider: {
      enabled: raw?.hero_slider?.enabled !== false,
      title: raw?.hero_slider?.title || 'Apple Shopping Event',
      subtitle: raw?.hero_slider?.subtitle || 'Shop great deals on MacBook, iPad, iPhone and more.',
      primary_button_label: raw?.hero_slider?.primary_button_label || 'Shop Now',
      image_url: raw?.hero_slider?.image_url || '',
    },
    promo_block_main: {
      enabled: raw?.promo_block_main?.enabled !== false,
      title: raw?.promo_block_main?.title || 'Aurora Headset',
      button_label: raw?.promo_block_main?.button_label || 'Buy Now',
      countdown_days: raw?.promo_block_main?.countdown_days || '255',
      countdown_hours: raw?.promo_block_main?.countdown_hours || '21',
      countdown_minutes: raw?.promo_block_main?.countdown_minutes || '11',
      countdown_seconds: raw?.promo_block_main?.countdown_seconds || '25',
      image_url: raw?.promo_block_main?.image_url || '',
    },
    promo_block_small_1: {
      enabled: raw?.promo_block_small_1?.enabled !== false,
      title: raw?.promo_block_small_1?.title || 'New Dual Sense',
      subtitle: raw?.promo_block_small_1?.subtitle || 'For PlayStation 5',
      button_label: raw?.promo_block_small_1?.button_label || 'View Details',
      image_url: raw?.promo_block_small_1?.image_url || '',
    },
    promo_block_small_2: {
      enabled: raw?.promo_block_small_2?.enabled !== false,
      title: raw?.promo_block_small_2?.title || 'Instant Cameras',
      subtitle: raw?.promo_block_small_2?.subtitle || 'Get photo paper as a gift',
      button_label: raw?.promo_block_small_2?.button_label || 'View Details',
      image_url: raw?.promo_block_small_2?.image_url || '',
    },
    sections: {
      popular_categories: raw?.sections?.popular_categories !== false,
      best_offers: raw?.sections?.best_offers !== false,
      big_promo_strip: raw?.sections?.big_promo_strip !== false,
      promo_band: raw?.sections?.promo_band !== false,
      articles: raw?.sections?.articles !== false,
    },
  };
}

function getSafeImage(customUrl, fallbackUrl) {
  return customUrl || fallbackUrl || '';
}

const railIcons = [Monitor, Mouse, Cpu, Smartphone, Gamepad2, MessageSquare, Camera, ImageIcon];

const categoryIconMap = {
  smartphones: Smartphone,
  supplement: Smartphone,
  fashion: Smartphone,
  'laptops, tablets & pcs': Monitor,
  laptops: Monitor,
  'pc components': Cpu,
  gaming: Gamepad2,
  appliances: Monitor,
  'tv & audio': Headphones,
  'home & outdoor': Globe,
  cameras: Camera,
};

function getCategoryIcon(name = '') {
  const key = String(name).trim().toLowerCase();
  return categoryIconMap[key] || Smartphone;
}

function HeaderIcon({ children, count, dark = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        width: 46,
        height: 46,
        borderRadius: '50%',
        border: dark ? 'none' : '1px solid #dde5f4',
        background: dark ? '#2463eb' : '#ffffff',
        color: dark ? '#ffffff' : '#1f2937',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {count !== undefined ? (
        <span
          style={{
            position: 'absolute',
            top: -5,
            right: -3,
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: '#ffffff',
            border: '1px solid #dbe6fb',
            color: '#2463eb',
            fontSize: 11,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}
        >
          {count}
        </span>
      ) : null}
      {children}
    </button>
  );
}

function StorefrontAdBlock({
  slotKey,
  monetizationSettings,
  websiteId,
  affiliateUserId,
}) {
  return (
    <MonetizationAdSlot
      slotKey={slotKey}
      monetizationSettings={monetizationSettings}
      placementMode="storefront"
      reviewRequired={true}
      darkMode={false}
      websiteId={websiteId}
      affiliateUserId={affiliateUserId}
    />
  );
}

function CustomerAuthPopup({
  open,
  onClose,
  websiteSlug = '',
  websiteId = '',
  affiliateId = '',
}) {
  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (websiteId) params.set('website_id', String(websiteId));
    if (websiteSlug) params.set('website_slug', String(websiteSlug));
    if (affiliateId) params.set('affiliate_id', String(affiliateId));

    const built = params.toString();
    return built ? `?${built}` : '';
  }, [websiteId, websiteSlug, affiliateId]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 500,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, calc(100% - 24px))',
          background: '#ffffff',
          borderRadius: 28,
          border: '1px solid #e5e7eb',
          boxShadow: '0 28px 90px rgba(15, 23, 42, 0.22)',
          zIndex: 501,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #eef2f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Customer Access
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#111827',
                letterSpacing: '-0.03em',
              }}
            >
              Sign in or create account
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              color: '#111827',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: 20,
            display: 'grid',
            gap: 14,
          }}
        >
          <div
            style={{
              borderRadius: 22,
              background: '#f8fafc',
              border: '1px solid #e5e7eb',
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: '#475569',
              }}
            >
              Continue as a customer for this storefront. Your store context will be carried automatically.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <Link
              to={`/customer/register${queryString}`}
              onClick={onClose}
              style={{
                minHeight: 54,
                borderRadius: 18,
                background: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              Register
            </Link>

            <Link
              to={`/customer/login${queryString}`}
              onClick={onClose}
              style={{
                minHeight: 54,
                borderRadius: 18,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#111827',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function LeftRail() {
  return (
    <div
      className="store-left-rail"
      style={{
        position: 'fixed',
        left: 0,
        top: 90,
        width: 68,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
      }}
    >
      <button
        type="button"
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: 'none',
          background: '#2463eb',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Menu size={20} />
      </button>

      {railIcons.map((Icon, index) => (
        <button
          key={index}
          type="button"
          style={{
            width: 34,
            height: 34,
            border: 'none',
            background: 'transparent',
            color: '#111827',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon size={21} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );
}

function MobileCategoryPanel({ open, onClose, categoryTree }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.42)',
        zIndex: 200,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 420,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          margin: '0 auto',
          padding: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: '#232323' }}>All Categories</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #e9e1db',
              background: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {categoryTree.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Link
                key={`${category.name}-${index}`}
                to={category.url || '#'}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#232323',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  border: '1px solid #eee7e1',
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <Icon size={18} />
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoriesButton({ categoryTree }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="store-mobile-categories"
        onClick={() => setOpen(true)}
        style={{
          display: 'none',
          alignItems: 'center',
          gap: 10,
          height: 48,
          borderRadius: 999,
          border: 'none',
          background: '#2463eb',
          color: '#fff',
          padding: '0 18px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <Menu size={18} />
        All Categories
      </button>

      <MobileCategoryPanel
        open={open}
        onClose={() => setOpen(false)}
        categoryTree={categoryTree}
      />
    </>
  );
}

function MainHeader({
  website,
  headerMenu,
  categoryTree,
  templateConfig,
  websiteSlug,
  onOpenCustomerAuth,
}) {
  return (
    <>
      <div
        className="store-header-main"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #edf2fa',
        }}
      >
        <div
          className="store-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: 26,
            minHeight: 90,
          }}
        >
          <Link
            to={`/${websiteSlug || ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2463eb, #5e8dff)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              B
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#2a2a2a',
              }}
            >
              {website?.website_name || 'Bloggad'}
            </span>
          </Link>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search for products"
              style={{
                width: '100%',
                height: 52,
                borderRadius: 999,
                border: '1px solid #d9e2ef',
                background: '#ffffff',
                padding: '0 66px 0 24px',
                fontSize: 16,
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                position: 'absolute',
                right: 4,
                top: 4,
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: 'none',
                background: '#2463eb',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Search size={20} />
            </button>
          </div>

          <div
            className="store-header-support"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MessageSquare size={30} color="#2b3440" />
              <div>
                <div style={{ fontWeight: 800, color: '#202124', fontSize: 16 }}>
                  {templateConfig.top_header.support_title}
                </div>
                <div style={{ color: '#2463eb', fontSize: 14 }}>
                  {templateConfig.top_header.support_text}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Globe size={30} color="#2b3440" />
              <div>
                <div style={{ fontWeight: 800, color: '#202124', fontSize: 16 }}>
                  {templateConfig.top_header.shipping_title}
                </div>
                <div style={{ color: '#2463eb', fontSize: 14 }}>
                  {templateConfig.top_header.shipping_text}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="store-header-nav"
        style={{
          background: '#dfeafb',
          borderBottom: '1px solid #d7e4f8',
        }}
      >
        <div
          className="store-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: 24,
            minHeight: 66,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              className="store-desktop-all-categories"
              style={{
                height: 46,
                borderRadius: 999,
                border: 'none',
                background: '#ffffff',
                color: '#202124',
                padding: '0 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: '#2463eb',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Menu size={18} />
              </span>
              All Categories
            </button>

            <CategoriesButton categoryTree={categoryTree} />
          </div>

          <div
            className="store-header-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 36,
              flexWrap: 'wrap',
            }}
          >
            {(headerMenu?.items || []).map((item) => (
              <Link
                key={item.id}
                to={resolveMenuUrl(item, websiteSlug)}
                style={{
                  textDecoration: 'none',
                  color: '#202124',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div
            className="store-header-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                color: '#202124',
                fontWeight: 600,
              }}
            >
              <span>{templateConfig.top_header.country_label}</span>
              <span>{templateConfig.top_header.currency_label}</span>
            </div>

            <HeaderIcon onClick={onOpenCustomerAuth}>
              <User size={20} />
            </HeaderIcon>
            <HeaderIcon count={0}>
              <Scale size={20} />
            </HeaderIcon>
            <HeaderIcon count={0}>
              <Heart size={20} />
            </HeaderIcon>
          </div>
        </div>
      </div>
    </>
  );
}

function HeroSection({ sliders, products, templateConfig }) {
  const slides = sliders || [];
  const [activeSlide, setActiveSlide] = useState(0);
  const heroProduct = products?.[0];
  const hotProduct = products?.[1];
  const blueProduct = products?.[2];
  const yellowProduct = products?.[3];

  useEffect(() => {
    if (!slides.length) return undefined;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeSlide] || {};

  return (
    <section
      className="store-hero-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.08fr 1fr',
        gap: 22,
        marginTop: 24,
      }}
    >
      {templateConfig.hero_slider.enabled ? (
        <div
          style={{
            background: current?.accent || '#5f1d73',
            borderRadius: 18,
            minHeight: 514,
            position: 'relative',
            overflow: 'hidden',
            padding: '42px 34px 26px',
            color: '#ffffff',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 34,
                lineHeight: 1.15,
                fontWeight: 900,
              }}
            >
              {templateConfig.hero_slider.title}
            </h2>

            <p
              style={{
                margin: '14px 0 0',
                fontSize: 16,
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              {templateConfig.hero_slider.subtitle}
            </p>

            <button
              type="button"
              style={{
                marginTop: 20,
                minWidth: 118,
                height: 46,
                borderRadius: 10,
                border: 'none',
                background: '#2463eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              {templateConfig.hero_slider.primary_button_label}
            </button>
          </div>

          <div
            style={{
              position: 'absolute',
              inset: '120px 20px 70px 20px',
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'center',
            }}
          >
            <img
              src={getSafeImage(
                templateConfig.hero_slider.image_url,
                current?.image || heroProduct?.product_image
              )}
              alt={templateConfig.hero_slider.title || 'Hero'}
              style={{
                width: '100%',
                maxWidth: 620,
                maxHeight: 310,
                objectFit: 'contain',
                borderRadius: 10,
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 18,
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                style={{
                  width: index === activeSlide ? 30 : 12,
                  height: 12,
                  borderRadius: 999,
                  border: 'none',
                  background: index === activeSlide ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateRows: '1fr auto',
          gap: 22,
        }}
      >
        {templateConfig.promo_block_main.enabled ? (
          <div
            style={{
              background: '#f8dde2',
              borderRadius: 18,
              minHeight: 308,
              position: 'relative',
              overflow: 'hidden',
              padding: '34px 34px 24px',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 260 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#ffffff',
                  marginBottom: 18,
                }}
              >
                {templateConfig.promo_block_main.title}
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                {[
                  templateConfig.promo_block_main.countdown_days,
                  templateConfig.promo_block_main.countdown_hours,
                  templateConfig.promo_block_main.countdown_minutes,
                  templateConfig.promo_block_main.countdown_seconds,
                ].map((val, index) => (
                  <div
                    key={index}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 12,
                      background: '#ffffff',
                      color: '#202124',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{val}</span>
                    <span style={{ fontWeight: 500 }}>
                      {index === 0 ? 'Days' : index === 1 ? 'Hr' : index === 2 ? 'Min' : 'Sc'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                style={{
                  minWidth: 108,
                  height: 46,
                  borderRadius: 10,
                  border: 'none',
                  background: '#2463eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                {templateConfig.promo_block_main.button_label}
              </button>
            </div>

            <img
              src={getSafeImage(
                templateConfig.promo_block_main.image_url,
                hotProduct?.product_image
              )}
              alt={templateConfig.promo_block_main.title}
              style={{
                position: 'absolute',
                right: 22,
                top: 16,
                width: '46%',
                maxHeight: 250,
                objectFit: 'contain',
              }}
            />
          </div>
        ) : (
          <div />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 22,
          }}
        >
          {templateConfig.promo_block_small_1.enabled ? (
            <div
              style={{
                background: '#35a6ef',
                borderRadius: 18,
                minHeight: 184,
                position: 'relative',
                overflow: 'hidden',
                padding: '28px 28px 24px',
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 8 }}>
                  {templateConfig.promo_block_small_1.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 18 }}>
                  {templateConfig.promo_block_small_1.subtitle}
                </div>
                <button
                  type="button"
                  style={{
                    minWidth: 112,
                    height: 42,
                    borderRadius: 10,
                    border: 'none',
                    background: '#ffffff',
                    color: '#202124',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  {templateConfig.promo_block_small_1.button_label}
                </button>
              </div>

              <img
                src={getSafeImage(
                  templateConfig.promo_block_small_1.image_url,
                  blueProduct?.product_image
                )}
                alt={templateConfig.promo_block_small_1.title}
                style={{
                  position: 'absolute',
                  right: 12,
                  bottom: 10,
                  width: '44%',
                  maxHeight: 130,
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            <div />
          )}

          {templateConfig.promo_block_small_2.enabled ? (
            <div
              style={{
                background: '#e8ba33',
                borderRadius: 18,
                minHeight: 184,
                position: 'relative',
                overflow: 'hidden',
                padding: '28px 28px 24px',
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', marginBottom: 8 }}>
                  {templateConfig.promo_block_small_2.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 18 }}>
                  {templateConfig.promo_block_small_2.subtitle}
                </div>
                <button
                  type="button"
                  style={{
                    minWidth: 112,
                    height: 42,
                    borderRadius: 10,
                    border: 'none',
                    background: '#ffffff',
                    color: '#202124',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                >
                  {templateConfig.promo_block_small_2.button_label}
                </button>
              </div>

              <img
                src={getSafeImage(
                  templateConfig.promo_block_small_2.image_url,
                  yellowProduct?.product_image
                )}
                alt={templateConfig.promo_block_small_2.title}
                style={{
                  position: 'absolute',
                  right: 10,
                  bottom: 10,
                  width: '42%',
                  maxHeight: 130,
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    </section>
  );
}

function PopularCategories({ categories, products, settings }) {
  const display = (categories || []).slice(0, settings.categoriesLimit);

  return (
    <section style={{ marginTop: 42 }}>
      <h2
        style={{
          margin: '0 0 28px',
          color: '#202124',
          fontSize: 34,
          lineHeight: 1.1,
          fontWeight: 900,
          letterSpacing: '-0.03em',
        }}
      >
        Popular Categories
      </h2>

      <div
        className="store-popular-categories-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${settings.categoriesPerRow}, minmax(0, 1fr))`,
          gap: 22,
        }}
      >
        {display.map((item, index) => (
          <Link
            key={item.id || index}
            to={item.url || '#'}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '18px 18px 14px',
                textAlign: 'center',
                minHeight: 256,
              }}
            >
              <div
                style={{
                  height: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <img
                  src={products[index % products.length]?.product_image}
                  alt={item.name}
                  style={{
                    width: '100%',
                    maxWidth: 140,
                    maxHeight: 130,
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div style={{ fontSize: 18, fontWeight: 800, color: '#202124', lineHeight: 1.3 }}>
                {item.name}
              </div>
              <div style={{ marginTop: 6, color: '#7b7b7b', fontSize: 14 }}>
                {item.total_products || 0} products
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductQuickViewModal({
  product,
  websiteSlug,
  isSaved,
  actionLoading,
  onClose,
  onToggleSave,
  onShare,
  onTrackedAction,
  formatCurrency,
}) {
  if (!product) return null;

  const reviewUrl = resolveReviewUrl(product, websiteSlug);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          zIndex: 300,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1080px, calc(100% - 24px))',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: 28,
          border: '1px solid rgba(226,232,240,0.95)',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.28)',
          zIndex: 301,
        }}
      >
        <style>{`
          .storefront-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .storefront-quick-view-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #eef2f7',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Product Quick View
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              color: '#111827',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="storefront-quick-view-grid">
          <div
            style={{
              padding: 22,
              background:
                'radial-gradient(circle at top left, rgba(37,99,235,0.08), transparent 28%), #f8fafc',
              borderRight: '1px solid #eef2f7',
            }}
          >
            <div
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 24,
                padding: 18,
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
              }}
            >
              <img
                src={product?.product_image || ''}
                alt={product?.title || 'Product'}
                style={{
                  width: '100%',
                  height: 'min(62vw, 520px)',
                  maxHeight: 520,
                  objectFit: 'cover',
                  borderRadius: 18,
                  background: '#f8fafc',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 30,
                  left: 30,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.96)',
                  border: '1px solid #dbeafe',
                  color: '#1d4ed8',
                  fontWeight: 800,
                  fontSize: 12,
                  boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
                }}
              >
                <CheckCircle2 size={14} />
                Verified
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 22,
              display: 'grid',
              gap: 16,
              alignContent: 'start',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {product?.category?.name || 'Category'}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: '#111827',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {product?.title || 'Product'}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={onToggleSave}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: isSaved ? '1px solid #fecdd3' : '1px solid #e5e7eb',
                    background: isSaved ? '#fff1f2' : '#ffffff',
                    color: isSaved ? '#e11d48' : '#111827',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Heart size={18} fill={isSaved ? '#e11d48' : 'none'} />
                </button>

                <button
                  type="button"
                  onClick={onShare}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#111827',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 2, color: '#f4b000', alignItems: 'center' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? '#f4b000' : 'none'} />
              ))}
              <span style={{ marginLeft: 10, color: '#64748b', fontWeight: 700 }}>Premium pick</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 700,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Website
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1.3,
                  }}
                >
                  {product?.affiliate?.website_name || websiteSlug || 'Website'}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 700,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Price
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#2463eb',
                    lineHeight: 1.1,
                  }}
                >
                  {renderPrice(product, formatCurrency)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 20,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 700,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Short Description
              </div>

              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: '#334155',
                }}
              >
                {product?.short_description || 'No description available.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTrackedAction('visit_website')}
              disabled={actionLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: 52,
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#111827',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {actionLoading ? 'Please wait...' : 'Visit Website'}
            </button>

            <a
              href={reviewUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                minHeight: 52,
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: '#111827',
                fontWeight: 800,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Review Site
            </a>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => onTrackedAction('buy_now')}
                disabled={actionLoading}
                style={{
                  minHeight: 52,
                  borderRadius: 12,
                  border: 'none',
                  background: '#2463eb',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                {actionLoading ? 'Please wait...' : product?.homepage_cta_label || 'Buy Now'}
              </button>

              <button
                type="button"
                onClick={() => onTrackedAction('read_more')}
                disabled={actionLoading}
                style={{
                  minHeight: 52,
                  borderRadius: 12,
                  border: 'none',
                  background: '#0b1736',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                {actionLoading ? 'Please wait...' : product?.storefront_cta_label || 'Read More'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OfferCard({
  product,
  websiteSlug,
  onQuickView,
  onImpression,
  settings,
  formatCurrency,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onImpression(product);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [product, onImpression]);

  return (
    <div
      ref={cardRef}
      style={{
        background: '#ffffff',
        borderRadius: 22,
        overflow: 'hidden',
        position: 'relative',
        minHeight: '100%',
        boxShadow: '0 1px 0 rgba(15,23,42,0.03)',
        border: '1px solid #eceef3',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 2,
          display: 'flex',
          gap: 8,
          flexDirection: 'column',
        }}
      >
        {product?.badge ? (
          <span
            style={{
              background:
                product.badge === 'HOT' ? '#ef4444' : product.badge === 'NEW' ? '#16a34a' : '#2563eb',
              color: '#fff',
              borderRadius: 999,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {product.badge}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => settings.allowProductQuickView && onQuickView(product)}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: settings.allowProductQuickView ? 'pointer' : 'default',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: settings.productImageRatio,
            background: '#f7f8fb',
            overflow: 'hidden',
          }}
        >
          <img
            src={product?.product_image}
            alt={product?.title || 'Product'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: settings.productImageFit,
              display: 'block',
            }}
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid #ddd6cf',
              background: '#ffffff',
              color: '#202124',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Heart size={18} />
          </button>
        </div>
      </button>

      <div style={{ padding: '18px 20px 22px' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#202124', lineHeight: 1.35 }}>
          {product?.title || 'Product'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginTop: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={15} fill="#f4b000" />
          ))}
        </div>

        <div style={{ fontSize: 16, color: '#4f46e5', fontWeight: 900, marginTop: 14 }}>
          {renderPrice(product, formatCurrency)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            style={{
              height: 54,
              borderRadius: 18,
              background: 'linear-gradient(90deg, #3b82f6, #6d28d9)',
              color: '#fff',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Buy Now
          </a>

          <Link
            to={resolveReadMoreUrl(product, websiteSlug)}
            style={{
              height: 54,
              borderRadius: 18,
              background: '#ffffff',
              border: '1px solid #ddd6cf',
              color: '#202124',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

function OffersSection({
  products,
  websiteSlug,
  onQuickView,
  onImpression,
  settings,
  formatCurrency,
  monetizationSettings,
  websiteId,
  affiliateUserId,
}) {
  const items = (products || []).slice(0, settings.offersLimit);

  return (
    <section style={{ marginTop: 56 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 22,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#202124',
            fontSize: 34,
            lineHeight: 1.1,
            fontWeight: 900,
            letterSpacing: '-0.03em',
          }}
        >
          The Best Offers
        </h2>

        <button
          type="button"
          style={{
            height: 46,
            borderRadius: 999,
            border: 'none',
            background: '#e8f0fe',
            color: '#2463eb',
            padding: '0 20px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          More Products
        </button>
      </div>

      <div
        className="store-offers-wrap"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 22,
          alignItems: 'start',
        }}
      >
        <div
          className="store-offer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${settings.offersPerRow}, minmax(0, 1fr))`,
            gap: 22,
          }}
        >
          {items.map((product, index) => (
            <OfferCard
              key={product.id || index}
              product={product}
              websiteSlug={websiteSlug}
              onQuickView={onQuickView}
              onImpression={onImpression}
              settings={settings}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        <div className="storefront-sidebar-slot">
          <StorefrontAdBlock
            slotKey="storefront_sidebar"
            monetizationSettings={monetizationSettings}
            websiteId={websiteId}
            affiliateUserId={affiliateUserId}
          />
        </div>
      </div>
    </section>
  );
}

function PromoBand({ products, formatCurrency }) {
  const left = products?.[0];
  const mid = products?.[1];
  const right = products?.[2];

  return (
    <section
      className="promo-band-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 1.25fr 1.25fr 1.1fr',
        gap: 22,
        marginTop: 44,
      }}
    >
      <div
        style={{
          minHeight: 170,
          borderRadius: 18,
          background: 'linear-gradient(90deg, #5c6cff, #a18dff)',
          position: 'relative',
          overflow: 'hidden',
          padding: 26,
        }}
      >
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Xiaomi M1 11</div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 18 }}>Discount up to 30%</div>
        <button
          type="button"
          style={{
            minWidth: 112,
            height: 42,
            borderRadius: 10,
            border: 'none',
            background: '#ffffff',
            color: '#202124',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          View Details
        </button>
        <img
          src={left?.product_image}
          alt="Promo"
          style={{
            position: 'absolute',
            right: 10,
            bottom: 0,
            width: 150,
            maxHeight: 150,
            objectFit: 'contain',
          }}
        />
      </div>

      <div
        style={{
          minHeight: 170,
          borderRadius: 18,
          background: 'linear-gradient(90deg, #ff5c76, #ff7a3a)',
          position: 'relative',
          overflow: 'hidden',
          padding: 26,
        }}
      >
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>HP Laser Jet</div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 18 }}>Personal printer</div>
        <button
          type="button"
          style={{
            minWidth: 112,
            height: 42,
            borderRadius: 10,
            border: 'none',
            background: '#ffffff',
            color: '#202124',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          View Details
        </button>
        <img
          src={mid?.product_image}
          alt="Promo"
          style={{
            position: 'absolute',
            right: 14,
            bottom: 0,
            width: 150,
            maxHeight: 150,
            objectFit: 'contain',
          }}
        />
      </div>

      <div
        style={{
          minHeight: 170,
          borderRadius: 18,
          background: 'linear-gradient(90deg, #ff3248, #ff0835)',
          position: 'relative',
          overflow: 'hidden',
          padding: 26,
        }}
      >
        <div style={{ color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>White Joy Cons</div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 18 }}>Long-awaited novelty</div>
        <button
          type="button"
          style={{
            minWidth: 112,
            height: 42,
            borderRadius: 10,
            border: 'none',
            background: '#ffffff',
            color: '#202124',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          View Details
        </button>
        <img
          src={right?.product_image}
          alt="Promo"
          style={{
            position: 'absolute',
            right: 14,
            bottom: 0,
            width: 150,
            maxHeight: 150,
            objectFit: 'contain',
          }}
        />
      </div>

      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: 170,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={products?.[3]?.product_image}
            alt="Laptop"
            style={{
              width: '100%',
              maxWidth: 190,
              maxHeight: 150,
              objectFit: 'contain',
            }}
          />
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, color: '#202124' }}>Acer ConceptD 7 Ezel</div>
        <div style={{ color: '#7b7b7b', marginTop: 4 }}>Business Laptop</div>

        <div style={{ display: 'flex', gap: 2, color: '#d1d5db', marginTop: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={15} />
          ))}
        </div>

        <div style={{ color: '#2463eb', fontWeight: 800, fontSize: 16, marginTop: 12 }}>In stock</div>
        <div style={{ color: '#2463eb', fontWeight: 900, fontSize: 18, marginTop: 10 }}>
          {renderPrice(products?.[3], formatCurrency)}
        </div>

        <button
          type="button"
          style={{
            marginTop: 16,
            height: 50,
            borderRadius: 10,
            border: 'none',
            background: '#2463eb',
            color: '#ffffff',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Buy Now
        </button>
      </div>
    </section>
  );
}

function BigPromoStrip({ products, formatCurrency }) {
  return (
    <section
      style={{
        marginTop: 54,
        background: 'linear-gradient(90deg, #f8d9db, #dfeaf9)',
        borderRadius: 18,
        minHeight: 520,
        overflow: 'hidden',
        padding: '34px 26px 26px',
        position: 'relative',
      }}
    >
      <div
        className="big-promo-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: 22,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            minHeight: 320,
          }}
        >
          <img
            src={products?.[0]?.product_image}
            alt="Apple Shopping Event"
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: 340,
              objectFit: 'contain',
            }}
          />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              color: '#202124',
              fontSize: 42,
              lineHeight: 1.12,
              fontWeight: 900,
              letterSpacing: '-0.04em',
            }}
          >
            Apple Shopping Event
          </h2>

          <p
            style={{
              margin: '16px 0 0',
              color: '#3f4a57',
              fontSize: 18,
              lineHeight: 1.5,
              maxWidth: 620,
            }}
          >
            Hurry and get discounts on all Apple devices up to 20%
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {['255', '21', '10', '18'].map((val, index) => (
              <div
                key={index}
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 14,
                  background: '#ffffff',
                  color: '#202124',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900 }}>{val}</div>
                <div style={{ color: '#6b7280', fontSize: 14 }}>
                  {index === 0 ? 'Days' : index === 1 ? 'Hr' : index === 2 ? 'Min' : 'Sc'}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            style={{
              marginTop: 20,
              minWidth: 172,
              height: 52,
              borderRadius: 10,
              border: 'none',
              background: '#2463eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Go Shopping
          </button>
        </div>
      </div>

      <div
        className="big-promo-mini-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: 22,
          marginTop: 26,
        }}
      >
        {(products || []).slice(0, 5).map((product, index) => (
          <div
            key={product.id || index}
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: 18,
              display: 'grid',
              gridTemplateColumns: '72px 1fr',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <img
              src={product.product_image}
              alt={product.title}
              style={{
                width: 72,
                height: 72,
                objectFit: 'contain',
              }}
            />
            <div>
              <div style={{ color: '#202124', fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                {product.title}
              </div>
              <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginBottom: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="#f4b000" />
                ))}
              </div>
              <div style={{ color: '#2463eb', fontWeight: 900 }}>
                {renderPrice(product, formatCurrency)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArticleSection({ articles, settings }) {
  return (
    <section style={{ marginTop: 58 }}>
      <h2
        style={{
          margin: '0 0 28px',
          color: '#202124',
          fontSize: 34,
          lineHeight: 1.1,
          fontWeight: 900,
          letterSpacing: '-0.03em',
        }}
      >
        Our Articles
      </h2>

      <div
        className="store-article-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${settings.articlePerRow}, minmax(0, 1fr))`,
          gap: 22,
        }}
      >
        {(articles || []).slice(0, settings.articleLimit).map((article, index) => (
          <div
            key={article.id || index}
            style={{
              background: '#ffffff',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={article.featured_image}
                alt={article.title}
                style={{
                  width: '100%',
                  height: 240,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  left: 16,
                  bottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#ffffff',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)',
                    color: '#202124',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  M
                </span>
                <span>{article.author_name || 'Mr. Mackay'}</span>
              </div>
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ color: '#8a8a8a', fontSize: 14 }}>
                {article.category?.name || 'Category'} / {article.published_at}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#202124',
                  fontSize: 20,
                  lineHeight: 1.35,
                  fontWeight: 900,
                  minHeight: 58,
                }}
              >
                {article.title}
              </div>

              <div
                style={{
                  marginTop: 14,
                  color: '#7b7b7b',
                  fontSize: 15,
                  lineHeight: 1.7,
                  minHeight: 78,
                }}
              >
                {article.excerpt}
              </div>

              <Link
                to={article.url || '#'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 16,
                  color: '#2463eb',
                  textDecoration: 'none',
                  fontWeight: 800,
                }}
              >
                Continue Reading
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TemplatePremiumBrand({
  website,
  websiteSlug,
  sliders,
  menus,
  categories,
  products,
  articles,
  categoryTree,
  settings,
  savedProducts,
  quickViewProduct,
  setQuickViewProduct,
  handleImpression,
  handleToggleSave,
  handleShare,
  handleTrackedPopupAction,
  actionLoading,
  formatCurrency,
  templateCodeKey = 'premium_brand',
}) {
  const headerMenu = menus.find((menu) => menu.location === 'header') || menus[0] || null;

  const templateConfig = useMemo(
    () => getTemplateConfig(settings, templateCodeKey),
    [settings, templateCodeKey]
  );

  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);

  const { settings: monetizationSettings } = useAffiliateMonetizationSlots({ enabled: true });

  const popupWebsiteId =
    website?.id ||
    settings?.website_id ||
    settings?.website?.id ||
    '';

  const popupAffiliateId =
    website?.user_id ||
    website?.affiliate_id ||
    settings?.affiliate_id ||
    settings?.user_id ||
    '';

  const resolvedWebsiteId =
    website?.id ||
    settings?.website_id ||
    settings?.website?.id ||
    monetizationSettings?.website_id ||
    '';

  const resolvedAffiliateUserId =
    website?.user_id ||
    website?.affiliate_id ||
    settings?.affiliate_id ||
    settings?.user_id ||
    monetizationSettings?.affiliate_user_id ||
    monetizationSettings?.user_id ||
    '';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <style>{`
        .store-container {
          width: min(1440px, calc(100% - 48px));
          margin: 0 auto;
        }

        .store-page-wrap {
          padding-left: 84px;
        }

        @media (max-width: 1200px) {
          .store-page-wrap {
            padding-left: 0;
          }

          .store-left-rail {
            display: none !important;
          }
        }

        @media (max-width: 1100px) {
          .store-hero-grid,
          .big-promo-grid,
          .store-offers-wrap {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .store-header-support,
          .store-header-links {
            display: none !important;
          }

          .store-header-main .store-container,
          .store-header-nav .store-container {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            padding-top: 16px;
            padding-bottom: 16px;
          }

          .store-mobile-categories {
            display: inline-flex !important;
          }

          .store-desktop-all-categories {
            display: none !important;
          }

          .storefront-sidebar-slot {
            order: -1;
          }
        }

        @media (max-width: 860px) {
          .store-popular-categories-grid,
          .store-offer-grid,
          .store-article-grid,
          .big-promo-mini-grid,
          .promo-band-grid {
            grid-template-columns: 1fr !important;
          }

          .store-header-actions {
            flex-wrap: wrap;
          }

          .store-container {
            width: calc(100% - 32px) !important;
          }
        }
      `}</style>

      <LeftRail />
      <MainHeader
        website={website}
        headerMenu={headerMenu}
        categoryTree={categoryTree}
        templateConfig={templateConfig}
        websiteSlug={websiteSlug}
        onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
      />

      <div className="store-container store-page-wrap" style={{ paddingTop: 22, paddingBottom: 64 }}>
        <div style={{ marginBottom: 24 }}>
          <StorefrontAdBlock
            slotKey="storefront_top"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>

        <HeroSection sliders={sliders} products={products} templateConfig={templateConfig} />

        {templateConfig.sections.popular_categories ? (
          <PopularCategories categories={categories} products={products} settings={settings} />
        ) : null}

        {templateConfig.sections.best_offers ? (
          <OffersSection
            products={products}
            websiteSlug={websiteSlug}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            settings={settings}
            formatCurrency={formatCurrency}
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        ) : null}

        {templateConfig.sections.big_promo_strip ? (
          <BigPromoStrip products={products} formatCurrency={formatCurrency} />
        ) : null}

        {templateConfig.sections.promo_band ? (
          <PromoBand products={products.slice(6, 10)} formatCurrency={formatCurrency} />
        ) : null}

        {templateConfig.sections.articles ? (
          <ArticleSection articles={articles} settings={settings} />
        ) : null}

        <div style={{ marginTop: 36 }}>
          <StorefrontAdBlock
            slotKey="storefront_bottom"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>
      </div>

      <CustomerAuthPopup
        open={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
        websiteSlug={websiteSlug}
        websiteId={popupWebsiteId}
        affiliateId={popupAffiliateId}
      />

      {settings.allowProductQuickView ? (
        <ProductQuickViewModal
          product={quickViewProduct}
          websiteSlug={websiteSlug}
          isSaved={!!savedProducts[quickViewProduct?.id]}
          actionLoading={actionLoading}
          onClose={() => setQuickViewProduct(null)}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
          onTrackedAction={handleTrackedPopupAction}
          formatCurrency={formatCurrency}
        />
      ) : null}
    </div>
  );
}