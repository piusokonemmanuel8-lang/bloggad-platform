import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Heart,
  User,
  Sun,
  Moon,
  ArrowRight,
  Star,
  X,
  CheckCircle2,
  Share2,
  Smartphone,
  Headphones,
  Monitor,
  Watch,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
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

function getTemplateConfig(settings) {
  const raw = settings?.template_settings_json?.xxam || settings?.xxam || {};

  return {
    announcement_bar: {
      enabled: raw?.announcement_bar?.enabled === true,
      message: raw?.announcement_bar?.message || '',
    },
    header: {
      logo_text: raw?.header?.logo_text || 'Bloggad',
      logo_image_url: raw?.header?.logo_image_url || '',
      nav_links:
        Array.isArray(raw?.header?.nav_links) && raw.header.nav_links.length
          ? raw.header.nav_links.slice(0, 8)
          : ['Elements', 'Shop', 'Track Order', 'Blog', 'About us', 'Contacts'],
      show_search_icon: raw?.header?.show_search_icon !== false,
      show_compare_icon: raw?.header?.show_compare_icon !== false,
      show_wishlist_icon: raw?.header?.show_wishlist_icon !== false,
      show_account_icon: raw?.header?.show_account_icon !== false,
      sign_in_label: raw?.header?.sign_in_label || 'Sign In',
    },
    theme_mode: {
      enabled: raw?.theme_mode?.enabled !== false,
      default_mode: raw?.theme_mode?.default_mode || 'light',
      light_label: raw?.theme_mode?.light_label || 'Light',
      dark_label: raw?.theme_mode?.dark_label || 'Dark',
    },
    hero: {
      enabled: raw?.hero?.enabled !== false,
      eyebrow: raw?.hero?.eyebrow || 'THE NEXT GENERATION',
      title: raw?.hero?.title || 'Innovation That Drives You',
      subtitle:
        raw?.hero?.subtitle ||
        'Discover modern electronics, premium accessories, and minimal design built to stand out.',
      button_label: raw?.hero?.button_label || 'Buy Now - $320',
      image_url: raw?.hero?.image_url || '',
      background_color: raw?.hero?.background_color || '#f3f3f5',
      floating_black_badge: raw?.hero?.floating_black_badge || '140+\nWebsites',
      floating_green_badge: raw?.hero?.floating_green_badge || 'Buy Now',
    },
    category_cards: {
      enabled: raw?.category_cards?.enabled !== false,
      title: raw?.category_cards?.title || 'Shop by Category',
      limit: Number(raw?.category_cards?.limit) > 0 ? Number(raw.category_cards.limit) : 4,
    },
    featured_products: {
      enabled: raw?.featured_products?.enabled !== false,
      title: raw?.featured_products?.title || 'Featured Products',
      limit: Number(raw?.featured_products?.limit) > 0 ? Number(raw.featured_products.limit) : 8,
      products_per_row:
        Number(raw?.featured_products?.products_per_row) > 0
          ? Number(raw.featured_products.products_per_row)
          : 4,
      show_quick_view: raw?.featured_products?.show_quick_view !== false,
    },
    promo_banners: {
      enabled: raw?.promo_banners?.enabled !== false,
      items:
        Array.isArray(raw?.promo_banners?.items) && raw.promo_banners.items.length
          ? raw.promo_banners.items.slice(0, 2)
          : [
              {
                title: 'Minimal Audio',
                subtitle: 'Clean design with premium sound',
                button_label: 'Shop Now',
                image_url: '',
                bg: '#f3f3f5',
              },
              {
                title: 'Smart Accessories',
                subtitle: 'Modern electronics for daily use',
                button_label: 'Explore',
                image_url: '',
                bg: '#f5f6fb',
              },
            ],
    },
    testimonials: {
      enabled: raw?.testimonials?.enabled !== false,
      title: raw?.testimonials?.title || 'What Customers Say',
      item_one_name: raw?.testimonials?.item_one_name || 'Daniel M.',
      item_one_quote:
        raw?.testimonials?.item_one_quote ||
        'Clean, premium and exactly the kind of minimal electronics layout I wanted.',
      item_two_name: raw?.testimonials?.item_two_name || 'Sarah K.',
      item_two_quote:
        raw?.testimonials?.item_two_quote ||
        'The product cards look modern and the shopping flow feels polished.',
      item_three_name: raw?.testimonials?.item_three_name || 'James T.',
      item_three_quote:
        raw?.testimonials?.item_three_quote ||
        'Strong premium feel without clutter. Very sharp storefront presentation.',
    },
    news: {
      enabled: raw?.news?.enabled !== false,
      title: raw?.news?.title || 'Latest Articles',
      limit: Number(raw?.news?.limit) > 0 ? Number(raw.news.limit) : 3,
    },
    services_strip: {
      enabled: raw?.services_strip?.enabled !== false,
      item_one_title: raw?.services_strip?.item_one_title || 'Free Shipping',
      item_one_subtitle: raw?.services_strip?.item_one_subtitle || 'For all orders over $99',
      item_two_title: raw?.services_strip?.item_two_title || '30 Days Return',
      item_two_subtitle: raw?.services_strip?.item_two_subtitle || 'Money back guarantee',
      item_three_title: raw?.services_strip?.item_three_title || 'Secure Payment',
      item_three_subtitle:
        raw?.services_strip?.item_three_subtitle || '100% protected checkout',
      item_four_title: raw?.services_strip?.item_four_title || '24/7 Support',
      item_four_subtitle: raw?.services_strip?.item_four_subtitle || 'Dedicated live support',
    },
    footer: {
      enabled: raw?.footer?.enabled !== false,
      about_text:
        raw?.footer?.about_text ||
        'Xxam is the XStore-inspired minimal electronics storefront inside Bloggad with a fixed structure and editable content.',
      phone: raw?.footer?.phone || '+1 212-334-0212',
      email: raw?.footer?.email || 'support@bloggad.com',
      address: raw?.footer?.address || '27 Division St, New York, NY 10002, USA',
      copyright: raw?.footer?.copyright || '© 2026 Bloggad. All rights reserved.',
    },
  };
}

function getCategoryIcon(index) {
  return [Smartphone, Headphones, Monitor, Watch][index % 4];
}

function StorefrontAdBlock({
  slotKey,
  monetizationSettings,
  darkMode,
  websiteId,
  affiliateUserId,
}) {
  return (
    <div style={{ width: '100%' }}>
      <MonetizationAdSlot
        slotKey={slotKey}
        monetizationSettings={monetizationSettings}
        placementMode="storefront"
        reviewRequired={true}
        darkMode={darkMode}
        websiteId={websiteId}
        affiliateUserId={affiliateUserId}
      />
    </div>
  );
}

function CustomerAuthPopup({
  open,
  onClose,
  websiteSlug = '',
  websiteId = '',
  affiliateId = '',
  label = 'Sign in or create account',
  darkMode = false,
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
          background: 'rgba(15, 23, 42, 0.58)',
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
          background: darkMode ? '#111315' : '#ffffff',
          borderRadius: 28,
          border: `1px solid ${darkMode ? '#24272b' : '#e5e7eb'}`,
          boxShadow: '0 28px 90px rgba(15, 23, 42, 0.22)',
          zIndex: 501,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: `1px solid ${darkMode ? '#23262a' : '#eef2f7'}`,
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
                color: darkMode ? '#9ca3af' : '#64748b',
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
                color: darkMode ? '#f8fafc' : '#111827',
                letterSpacing: '-0.03em',
              }}
            >
              {label}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: `1px solid ${darkMode ? '#2a2e33' : '#e5e7eb'}`,
              background: darkMode ? '#171b1f' : '#ffffff',
              color: darkMode ? '#f8fafc' : '#111827',
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
              background: darkMode ? '#171b1f' : '#f8fafc',
              border: `1px solid ${darkMode ? '#262a2f' : '#e5e7eb'}`,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: darkMode ? '#cbd5e1' : '#475569',
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
                background: darkMode ? '#f8fafc' : '#2563eb',
                color: darkMode ? '#111827' : '#ffffff',
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
                border: `1px solid ${darkMode ? '#2a2e33' : '#d1d5db'}`,
                background: darkMode ? '#171b1f' : '#ffffff',
                color: darkMode ? '#f8fafc' : '#111827',
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

function ProductQuickViewModal({
  product,
  isSaved,
  actionLoading,
  onClose,
  onToggleSave,
  onShare,
  onTrackedAction,
  formatCurrency,
  darkMode,
}) {
  if (!product) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.62)',
          backdropFilter: 'blur(6px)',
          zIndex: 500,
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
          background: darkMode ? '#111315' : '#ffffff',
          borderRadius: 28,
          border: `1px solid ${darkMode ? '#24272b' : 'rgba(226,232,240,0.95)'}`,
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.28)',
          zIndex: 501,
        }}
      >
        <style>{`
          .xxam-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .xxam-quick-view-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background: darkMode ? 'rgba(17,19,21,0.94)' : 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${darkMode ? '#23262a' : '#eef2f7'}`,
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
              color: darkMode ? '#f8fafc' : '#111827',
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
              border: `1px solid ${darkMode ? '#2a2e33' : '#e5e7eb'}`,
              background: darkMode ? '#181b1f' : '#ffffff',
              color: darkMode ? '#f8fafc' : '#111827',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="xxam-quick-view-grid">
          <div
            style={{
              padding: 22,
              background: darkMode
                ? 'radial-gradient(circle at top left, rgba(255,255,255,0.04), transparent 28%), #15181b'
                : 'radial-gradient(circle at top left, rgba(15,23,42,0.04), transparent 28%), #f7f8fa',
              borderRight: `1px solid ${darkMode ? '#23262a' : '#eef2f7'}`,
            }}
          >
            <div
              style={{
                position: 'relative',
                background: darkMode ? '#101214' : '#ffffff',
                border: `1px solid ${darkMode ? '#25292d' : '#e5e7eb'}`,
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
                  objectFit: 'contain',
                  borderRadius: 18,
                  background: darkMode ? '#161a1e' : '#f8fafc',
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
                  background: darkMode ? 'rgba(24,27,31,0.96)' : 'rgba(255,255,255,0.96)',
                  border: `1px solid ${darkMode ? '#2a2f35' : '#e5e7eb'}`,
                  color: darkMode ? '#d1d5db' : '#111827',
                  fontWeight: 800,
                  fontSize: 12,
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
                    color: darkMode ? '#9ca3af' : '#6b7280',
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
                    color: darkMode ? '#f8fafc' : '#111827',
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
                    border: isSaved
                      ? '1px solid #fecdd3'
                      : `1px solid ${darkMode ? '#2a2e33' : '#e5e7eb'}`,
                    background: isSaved ? '#fff1f2' : darkMode ? '#171b1f' : '#ffffff',
                    color: isSaved ? '#e11d48' : darkMode ? '#f8fafc' : '#111827',
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
                    border: `1px solid ${darkMode ? '#2a2e33' : '#e5e7eb'}`,
                    background: darkMode ? '#171b1f' : '#ffffff',
                    color: darkMode ? '#f8fafc' : '#111827',
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
              <span
                style={{
                  marginLeft: 10,
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  fontWeight: 700,
                }}
              >
                Premium pick
              </span>
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
                  background: darkMode ? '#171b1f' : '#f9fafb',
                  border: `1px solid ${darkMode ? '#262a2f' : '#e5e7eb'}`,
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: darkMode ? '#9ca3af' : '#6b7280',
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
                    color: darkMode ? '#f8fafc' : '#111827',
                    lineHeight: 1.3,
                  }}
                >
                  {product?.affiliate?.website_name || 'Bloggad'}
                </div>
              </div>

              <div
                style={{
                  background: darkMode ? '#171b1f' : '#f9fafb',
                  border: `1px solid ${darkMode ? '#262a2f' : '#e5e7eb'}`,
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: darkMode ? '#9ca3af' : '#6b7280',
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
                    color: darkMode ? '#ffffff' : '#111827',
                    lineHeight: 1.1,
                  }}
                >
                  {renderPrice(product, formatCurrency)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: darkMode ? '#14181c' : '#ffffff',
                border: `1px solid ${darkMode ? '#262a2f' : '#e5e7eb'}`,
                borderRadius: 20,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: darkMode ? '#9ca3af' : '#6b7280',
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
                  color: darkMode ? '#cbd5e1' : '#4b5563',
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
                background: darkMode ? '#181b1f' : '#ffffff',
                border: `1px solid ${darkMode ? '#2a2e33' : '#d1d5db'}`,
                color: darkMode ? '#f8fafc' : '#111827',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {actionLoading ? 'Please wait...' : 'Visit Website'}
            </button>

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
                  background: darkMode ? '#ffffff' : '#111827',
                  color: darkMode ? '#111827' : '#ffffff',
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
                  border: `1px solid ${darkMode ? '#2a2e33' : '#111827'}`,
                  background: 'transparent',
                  color: darkMode ? '#f8fafc' : '#111827',
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

function ProductCard({
  product,
  websiteSlug,
  formatCurrency,
  darkMode,
  onQuickView,
  onImpression,
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

  const openQuickView = () => onQuickView(product);

  return (
    <div
      ref={cardRef}
      onClick={openQuickView}
      style={{
        background: darkMode ? '#111315' : '#ffffff',
        border: `1px solid ${darkMode ? '#23262a' : '#dfe3ea'}`,
        borderRadius: 26,
        overflow: 'hidden',
        minHeight: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: darkMode ? '0 10px 28px rgba(0,0,0,0.18)' : '0 10px 28px rgba(15,23,42,0.05)',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: darkMode ? '#181b1f' : '#f5f6f8',
          height: 430,
          overflow: 'hidden',
        }}
      >
        <img
          src={product?.product_image}
          alt={product?.title || 'Product'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {product?.badge ? (
          <span
            style={{
              position: 'absolute',
              top: 18,
              left: 18,
              minHeight: 34,
              padding: '0 14px',
              borderRadius: 999,
              background:
                product.badge === 'HOT'
                  ? '#ef4444'
                  : product.badge === 'NEW'
                  ? '#16a34a'
                  : '#0f172a',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {product.badge}
          </span>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: `1px solid ${darkMode ? '#2b3035' : '#d9dee7'}`,
            background: darkMode ? '#171a1e' : '#ffffff',
            color: darkMode ? '#f8fafc' : '#111827',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Heart size={17} />
        </button>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ color: darkMode ? '#9ca3af' : '#64748b', fontSize: 13, marginBottom: 10 }}>
          {product?.category?.name || 'Electronics'}
        </div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: darkMode ? '#f8fafc' : '#0f172a',
            lineHeight: 1.35,
            minHeight: 48,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginTop: 14 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={15} fill="#f4b000" />
          ))}
        </div>

        <div
          style={{
            fontSize: 19,
            color: darkMode ? '#ffffff' : '#0f172a',
            fontWeight: 900,
            marginTop: 14,
          }}
        >
          {renderPrice(product, formatCurrency)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 18,
          }}
        >
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            style={{
              minHeight: 50,
              borderRadius: 999,
              background: darkMode ? '#ffffff' : '#0f172a',
              color: darkMode ? '#111827' : '#ffffff',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 14px',
            }}
          >
            Buy Now
          </a>

          <Link
            to={resolveReadMoreUrl(product, websiteSlug)}
            onClick={(event) => event.stopPropagation()}
            style={{
              minHeight: 50,
              borderRadius: 999,
              background: 'transparent',
              border: `1px solid ${darkMode ? '#30353b' : '#d1d9e6'}`,
              color: darkMode ? '#f8fafc' : '#0f172a',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 14px',
            }}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

function BlogCard({ article, darkMode }) {
  return (
    <article
      style={{
        background: darkMode ? '#111315' : '#ffffff',
        border: `1px solid ${darkMode ? '#23262a' : '#eceef2'}`,
        borderRadius: 26,
        overflow: 'hidden',
      }}
    >
      <img
        src={article?.featured_image}
        alt={article?.title || 'Article'}
        style={{
          width: '100%',
          height: 240,
          objectFit: 'cover',
          display: 'block',
        }}
      />

      <div style={{ padding: 22 }}>
        <div style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: 13 }}>
          {article?.category?.name || 'Electronics'} • {article?.published_at || '2026-04-20'}
        </div>

        <div
          style={{
            marginTop: 12,
            color: darkMode ? '#f8fafc' : '#111827',
            fontSize: 22,
            lineHeight: 1.35,
            fontWeight: 900,
            minHeight: 60,
          }}
        >
          {article?.title || 'Article'}
        </div>

        <div
          style={{
            marginTop: 12,
            color: darkMode ? '#cbd5e1' : '#4b5563',
            fontSize: 15,
            lineHeight: 1.8,
            minHeight: 86,
          }}
        >
          {article?.excerpt || 'Minimal electronics insights and modern shopping inspiration.'}
        </div>

        <Link
          to={article?.url || '#'}
          style={{
            marginTop: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: darkMode ? '#f8fafc' : '#111827',
            textDecoration: 'none',
            fontWeight: 800,
          }}
        >
          Read More
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

export default function TemplateXxam({
  websiteSlug,
  categories,
  products,
  articles,
  settings,
  quickViewProduct,
  setQuickViewProduct,
  savedProducts,
  handleImpression,
  handleToggleSave,
  handleShare,
  handleTrackedPopupAction,
  actionLoading,
  formatCurrency,
}) {
  const config = useMemo(() => getTemplateConfig(settings), [settings]);
  const [darkMode, setDarkMode] = useState(config.theme_mode.default_mode === 'dark');
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);

  const {
    settings: monetizationSettings,
  } = useAffiliateMonetizationSlots({ enabled: true });

  useEffect(() => {
    setDarkMode(config.theme_mode.default_mode === 'dark');
  }, [config.theme_mode.default_mode]);

  const displayCategories = (categories || []).slice(0, config.category_cards.limit);
  const featuredProducts = (products || []).slice(0, config.featured_products.limit);
  const newsItems = (articles || []).slice(0, config.news.limit);

  const heroImage =
    config.hero.image_url ||
    products?.[0]?.product_image ||
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1600&q=80';

  const promoImages = [
    config.promo_banners.items?.[0]?.image_url || products?.[1]?.product_image || heroImage,
    config.promo_banners.items?.[1]?.image_url || products?.[2]?.product_image || heroImage,
  ];

  const colors = {
    bg: darkMode ? '#0d0f11' : '#ffffff',
    text: darkMode ? '#f8fafc' : '#111827',
    muted: darkMode ? '#9ca3af' : '#6b7280',
    border: darkMode ? '#23262a' : '#eceef2',
    header: darkMode ? '#0f1215' : '#ffffff',
    hero: darkMode ? '#171a1e' : config.hero.background_color,
  };

  const popupWebsiteId =
    settings?.website_id ||
    settings?.website?.id ||
    settings?.storefront?.website_id ||
    '';

  const popupAffiliateId =
    settings?.affiliate_id ||
    settings?.user_id ||
    settings?.website?.user_id ||
    settings?.storefront?.affiliate_id ||
    '';

  const resolvedWebsiteId =
    settings?.website_id ||
    settings?.website?.id ||
    settings?.storefront?.website_id ||
    monetizationSettings?.website_id ||
    '';

  const resolvedAffiliateUserId =
    settings?.affiliate_id ||
    settings?.user_id ||
    settings?.website?.user_id ||
    settings?.storefront?.affiliate_id ||
    monetizationSettings?.affiliate_user_id ||
    monetizationSettings?.user_id ||
    '';

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <style>{`
        .xxam-shell {
          width: min(1440px, calc(100% - 40px));
          margin: 0 auto;
        }

        .xxam-nav a:hover,
        .xxam-footer-links a:hover {
          opacity: 0.7;
        }

        @media (max-width: 1180px) {
          .xxam-header-row,
          .xxam-hero-grid,
          .xxam-promo-grid,
          .xxam-footer-grid {
            grid-template-columns: 1fr !important;
          }

          .xxam-header-center {
            justify-content: flex-start !important;
            overflow-x: auto;
            white-space: nowrap;
          }

          .xxam-featured-wrap {
            grid-template-columns: 1fr !important;
          }

          .xxam-storefront-sidebar {
            order: -1;
          }
        }

        @media (max-width: 900px) {
          .xxam-category-grid,
          .xxam-product-grid,
          .xxam-testimonial-grid,
          .xxam-blog-grid,
          .xxam-service-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .xxam-shell {
            width: calc(100% - 24px);
          }

          .xxam-category-grid,
          .xxam-product-grid,
          .xxam-testimonial-grid,
          .xxam-blog-grid,
          .xxam-service-grid {
            grid-template-columns: 1fr !important;
          }

          .xxam-header-right {
            flex-wrap: wrap;
            justify-content: flex-start !important;
          }

          .xxam-hero-card {
            padding: 26px 20px !important;
          }

          .xxam-hero-title {
            font-size: 34px !important;
          }
        }
      `}</style>

      {config.announcement_bar.enabled ? (
        <div
          style={{
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: darkMode ? '#13171a' : '#f8fafc',
            color: colors.text,
            borderBottom: `1px solid ${colors.border}`,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {config.announcement_bar.message}
        </div>
      ) : null}

      <header
        style={{
          background: colors.header,
          borderBottom: `1px solid ${colors.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="xxam-shell xxam-header-row"
          style={{
            minHeight: 94,
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0,1fr) auto',
            gap: 22,
            alignItems: 'center',
          }}
        >
          <Link
            to={`/${websiteSlug || ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              textDecoration: 'none',
              color: colors.text,
            }}
          >
            {config.header.logo_image_url ? (
              <img
                src={config.header.logo_image_url}
                alt={config.header.logo_text}
                style={{ height: 42, objectFit: 'contain' }}
              />
            ) : (
              <>
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: darkMode ? '#f8fafc' : '#111827',
                    color: darkMode ? '#111827' : '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 20,
                  }}
                >
                  B
                </span>
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {config.header.logo_text}
                </span>
              </>
            )}
          </Link>

          <nav
            className="xxam-header-center xxam-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 28,
            }}
          >
            {config.header.nav_links.map((item, index) => (
              <Link
                key={`${item}-${index}`}
                to="#"
                style={{
                  textDecoration: 'none',
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div
            className="xxam-header-right"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            {config.theme_mode.enabled ? (
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                style={{
                  minHeight: 44,
                  padding: '0 14px',
                  borderRadius: 999,
                  border: `1px solid ${colors.border}`,
                  background: darkMode ? '#171a1e' : '#ffffff',
                  color: colors.text,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                {darkMode ? config.theme_mode.dark_label : config.theme_mode.light_label}
              </button>
            ) : null}

            {config.header.show_search_icon ? (
              <button
                type="button"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `1px solid ${colors.border}`,
                  background: darkMode ? '#171a1e' : '#ffffff',
                  color: colors.text,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Search size={18} />
              </button>
            ) : null}

            {config.header.show_wishlist_icon ? (
              <button
                type="button"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `1px solid ${colors.border}`,
                  background: darkMode ? '#171a1e' : '#ffffff',
                  color: colors.text,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Heart size={18} />
              </button>
            ) : null}

            {config.header.show_account_icon ? (
              <button
                type="button"
                onClick={() => setCustomerAuthOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: colors.text,
                  fontWeight: 700,
                  paddingLeft: 6,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <User size={18} />
                <span>{config.header.sign_in_label}</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="xxam-shell" style={{ paddingTop: 30, paddingBottom: 70 }}>
        <div style={{ marginBottom: 24 }}>
          <StorefrontAdBlock
            slotKey="storefront_top"
            monetizationSettings={monetizationSettings}
            darkMode={darkMode}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>

        {config.hero.enabled ? (
          <section>
            <div
              className="xxam-hero-grid xxam-hero-card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 460px) minmax(0, 1fr)',
                gap: 18,
                alignItems: 'center',
                background: colors.hero,
                border: `1px solid ${colors.border}`,
                borderRadius: 34,
                padding: '34px 34px 30px',
                minHeight: 560,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: 34,
                    padding: '0 14px',
                    borderRadius: 999,
                    background: darkMode ? '#1f2328' : '#ffffff',
                    color: colors.text,
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {config.hero.eyebrow}
                </div>

                <div
                  className="xxam-hero-title"
                  style={{
                    marginTop: 20,
                    fontSize: 62,
                    lineHeight: 0.94,
                    fontWeight: 900,
                    letterSpacing: '-0.07em',
                    color: colors.text,
                    maxWidth: 420,
                  }}
                >
                  {config.hero.title}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    fontSize: 16,
                    lineHeight: 1.9,
                    color: colors.muted,
                    maxWidth: 430,
                  }}
                >
                  {config.hero.subtitle}
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: 26,
                    minHeight: 54,
                    padding: '0 24px',
                    borderRadius: 999,
                    border: 'none',
                    background: darkMode ? '#ffffff' : '#111827',
                    color: darkMode ? '#111827' : '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {config.hero.button_label}
                </button>
              </div>

              <div
                style={{
                  position: 'relative',
                  minHeight: 430,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={heroImage}
                  alt={config.hero.title}
                  style={{
                    width: '100%',
                    maxWidth: 760,
                    maxHeight: 480,
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    top: 26,
                    right: 20,
                    minWidth: 110,
                    minHeight: 110,
                    borderRadius: '50%',
                    background: '#111827',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    textAlign: 'center',
                    padding: 14,
                    fontWeight: 900,
                    lineHeight: 1.1,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 18px 40px rgba(15,23,42,0.18)',
                  }}
                >
                  {config.hero.floating_black_badge}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    left: 24,
                    bottom: 26,
                    minHeight: 54,
                    padding: '0 22px',
                    borderRadius: 999,
                    background: '#16a34a',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    boxShadow: '0 18px 40px rgba(22,163,74,0.24)',
                  }}
                >
                  {config.hero.floating_green_badge}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {config.category_cards.enabled ? (
          <section style={{ marginTop: 34 }}>
            <div
              style={{
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                }}
              >
                {config.category_cards.title}
              </h2>
            </div>

            <div
              className="xxam-category-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(config.category_cards.limit, 4)}, minmax(0,1fr))`,
                gap: 22,
              }}
            >
              {displayCategories.map((category, index) => {
                const Icon = getCategoryIcon(index);
                return (
                  <Link
                    key={category?.id || index}
                    to={category?.url || '#'}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div
                      style={{
                        background: darkMode ? '#111315' : '#ffffff',
                        border: `1px solid ${colors.border}`,
                        borderRadius: 28,
                        padding: '24px 22px',
                        minHeight: 210,
                        display: 'grid',
                        alignContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 20,
                          background: darkMode ? '#181b1f' : '#f5f6f8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={28} color={darkMode ? '#f8fafc' : '#111827'} />
                      </div>

                      <div>
                        <div
                          style={{
                            color: colors.text,
                            fontSize: 24,
                            lineHeight: 1.05,
                            fontWeight: 900,
                            letterSpacing: '-0.04em',
                          }}
                        >
                          {category?.name || 'Category'}
                        </div>

                        <div
                          style={{
                            marginTop: 10,
                            color: colors.muted,
                            fontSize: 14,
                            lineHeight: 1.7,
                          }}
                        >
                          {category?.total_products || 0} products
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {config.featured_products.enabled ? (
          <section style={{ marginTop: 44 }}>
            <div
              style={{
                marginBottom: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                }}
              >
                {config.featured_products.title}
              </h2>
            </div>

            <div
              className="xxam-featured-wrap"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 320px',
                gap: 22,
                alignItems: 'start',
              }}
            >
              <div
                className="xxam-product-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${config.featured_products.products_per_row}, minmax(0,1fr))`,
                  gap: 22,
                }}
              >
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product?.id || index}
                    product={product}
                    websiteSlug={websiteSlug}
                    formatCurrency={formatCurrency}
                    darkMode={darkMode}
                    onQuickView={setQuickViewProduct}
                    onImpression={handleImpression}
                  />
                ))}
              </div>

              <div className="xxam-storefront-sidebar" style={{ display: 'grid', gap: 18 }}>
                <StorefrontAdBlock
                  slotKey="storefront_sidebar"
                  monetizationSettings={monetizationSettings}
                  darkMode={darkMode}
                  websiteId={resolvedWebsiteId}
                  affiliateUserId={resolvedAffiliateUserId}
                />
              </div>
            </div>
          </section>
        ) : null}

        {config.promo_banners.enabled ? (
          <section
            className="xxam-promo-grid"
            style={{
              marginTop: 44,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 22,
            }}
          >
            {config.promo_banners.items.map((item, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  minHeight: 300,
                  overflow: 'hidden',
                  background: darkMode ? '#121519' : item.bg || '#f3f3f5',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 30,
                  padding: '28px 26px',
                }}
              >
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 260 }}>
                  <div
                    style={{
                      color: colors.text,
                      fontWeight: 900,
                      fontSize: 34,
                      lineHeight: 1.02,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      color: colors.muted,
                      fontSize: 15,
                      lineHeight: 1.8,
                    }}
                  >
                    {item.subtitle}
                  </div>

                  <button
                    type="button"
                    style={{
                      marginTop: 18,
                      minHeight: 48,
                      padding: '0 20px',
                      borderRadius: 999,
                      border: 'none',
                      background: darkMode ? '#ffffff' : '#111827',
                      color: darkMode ? '#111827' : '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {item.button_label}
                  </button>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16,
                    width: '48%',
                    height: '75%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={promoImages[index]}
                    alt={item.title}
                    style={{
                      width: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {config.testimonials.enabled ? (
          <section style={{ marginTop: 46 }}>
            <div
              style={{
                marginBottom: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                }}
              >
                {config.testimonials.title}
              </h2>
            </div>

            <div
              className="xxam-testimonial-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
                gap: 22,
              }}
            >
              {[
                {
                  name: config.testimonials.item_one_name,
                  quote: config.testimonials.item_one_quote,
                },
                {
                  name: config.testimonials.item_two_name,
                  quote: config.testimonials.item_two_quote,
                },
                {
                  name: config.testimonials.item_three_name,
                  quote: config.testimonials.item_three_quote,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: darkMode ? '#111315' : '#ffffff',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 28,
                    padding: '26px 22px',
                  }}
                >
                  <div style={{ display: 'flex', gap: 2, color: '#f4b000' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={15} fill="#f4b000" />
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      color: colors.text,
                      fontSize: 18,
                      lineHeight: 1.75,
                      fontWeight: 700,
                      minHeight: 120,
                    }}
                  >
                    “{item.quote}”
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      color: colors.muted,
                      fontWeight: 800,
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {config.news.enabled ? (
          <section style={{ marginTop: 46 }}>
            <div
              style={{
                marginBottom: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: 34,
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                }}
              >
                {config.news.title}
              </h2>
            </div>

            <div
              className="xxam-blog-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
                gap: 22,
              }}
            >
              {newsItems.map((article, index) => (
                <BlogCard key={article?.id || index} article={article} darkMode={darkMode} />
              ))}
            </div>
          </section>
        ) : null}

        <div style={{ marginTop: 36 }}>
          <StorefrontAdBlock
            slotKey="storefront_bottom"
            monetizationSettings={monetizationSettings}
            darkMode={darkMode}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>

        {config.services_strip.enabled ? (
          <section style={{ marginTop: 46 }}>
            <div
              className="xxam-service-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
                gap: 18,
              }}
            >
              {[
                {
                  icon: Truck,
                  title: config.services_strip.item_one_title,
                  subtitle: config.services_strip.item_one_subtitle,
                },
                {
                  icon: RotateCcw,
                  title: config.services_strip.item_two_title,
                  subtitle: config.services_strip.item_two_subtitle,
                },
                {
                  icon: ShieldCheck,
                  title: config.services_strip.item_three_title,
                  subtitle: config.services_strip.item_three_subtitle,
                },
                {
                  icon: CreditCard,
                  title: config.services_strip.item_four_title,
                  subtitle: config.services_strip.item_four_subtitle,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    style={{
                      background: darkMode ? '#111315' : '#ffffff',
                      border: `1px solid ${colors.border}`,
                      borderRadius: 24,
                      padding: '20px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 18,
                        background: darkMode ? '#181b1f' : '#f5f6f8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={darkMode ? '#f8fafc' : '#111827'} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 900,
                          color: colors.text,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: colors.muted,
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      {config.footer.enabled ? (
        <footer
          style={{
            background: darkMode ? '#0b0d0f' : '#f8fafc',
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div className="xxam-shell" style={{ paddingTop: 44, paddingBottom: 22 }}>
            <div
              className="xxam-footer-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
                gap: 24,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                    marginBottom: 14,
                    color: colors.text,
                  }}
                >
                  {config.header.logo_text}
                </div>

                <div
                  style={{
                    color: colors.muted,
                    lineHeight: 1.9,
                    maxWidth: 360,
                  }}
                >
                  {config.footer.about_text}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16, color: colors.text }}>
                  Quick Links
                </div>
                <div className="xxam-footer-links" style={{ display: 'grid', gap: 10 }}>
                  {config.header.nav_links.slice(0, 6).map((item, index) => (
                    <Link
                      key={`${item}-${index}`}
                      to="#"
                      style={{
                        color: colors.muted,
                        textDecoration: 'none',
                      }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16, color: colors.text }}>
                  Contact
                </div>
                <div style={{ display: 'grid', gap: 10, color: colors.muted }}>
                  <div>{config.footer.phone}</div>
                  <div>{config.footer.email}</div>
                  <div>{config.footer.address}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16, color: colors.text }}>
                  Newsletter
                </div>
                <div style={{ color: colors.muted, lineHeight: 1.8, marginBottom: 14 }}>
                  Get updates on new arrivals, articles and premium electronics offers.
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 10,
                  }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    style={{
                      minHeight: 50,
                      borderRadius: 999,
                      border: `1px solid ${colors.border}`,
                      background: darkMode ? '#111315' : '#ffffff',
                      color: colors.text,
                      padding: '0 16px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      minHeight: 50,
                      padding: '0 18px',
                      borderRadius: 999,
                      border: 'none',
                      background: darkMode ? '#ffffff' : '#111827',
                      color: darkMode ? '#111827' : '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 28,
                paddingTop: 18,
                borderTop: `1px solid ${colors.border}`,
                color: colors.muted,
                fontSize: 14,
              }}
            >
              {config.footer.copyright}
            </div>
          </div>
        </footer>
      ) : null}

      <CustomerAuthPopup
        open={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
        websiteSlug={websiteSlug}
        websiteId={popupWebsiteId}
        affiliateId={popupAffiliateId}
        label={config.header.sign_in_label === 'My Account' ? 'Login or create account' : 'Sign in or create account'}
        darkMode={darkMode}
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        isSaved={!!savedProducts?.[quickViewProduct?.id]}
        actionLoading={actionLoading}
        onClose={() => setQuickViewProduct(null)}
        onToggleSave={handleToggleSave}
        onShare={handleShare}
        onTrackedAction={handleTrackedPopupAction}
        formatCurrency={formatCurrency}
        darkMode={darkMode}
      />
    </div>
  );
}