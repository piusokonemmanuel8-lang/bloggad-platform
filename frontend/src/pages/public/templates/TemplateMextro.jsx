import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Monitor,
  Tablet,
  Watch,
  Speaker,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  Star,
  Share2,
  CheckCircle2,
  X,
} from 'lucide-react';

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

function resolveReviewUrl(product, fallbackWebsiteSlug = '') {
  return (
    product?.review_url ||
    product?.review_site_url ||
    product?.external_review_url ||
    resolveReadMoreUrl(product, fallbackWebsiteSlug)
  );
}

function resolveMenuUrl(item, websiteSlug) {
  return item?.resolved_url || item?.custom_url || `/${websiteSlug || ''}`;
}

function getMextroConfig(settings) {
  const raw = settings?.template_settings_json?.mextro || settings?.mextro || {};

  return {
    top_strip: {
      enabled: raw?.top_strip?.enabled !== false,
      message: raw?.top_strip?.message || 'FREE SHIPPING ON ORDERS $50+',
    },
    header: {
      search_placeholder: raw?.header?.search_placeholder || 'Search for products',
      categories_button_label: raw?.header?.categories_button_label || 'All Departments',
      account_label: raw?.header?.account_label || 'Account',
      cart_label: raw?.header?.cart_label || 'Cart',
      track_order_label: raw?.header?.track_order_label || 'Track Order',
      logo_text: raw?.header?.logo_text || 'Bloggad',
      logo_image_url: raw?.header?.logo_image_url || '',
      support_label: raw?.header?.support_label || '+1 212-334-0212',
    },
    theme_mode: {
      enabled: raw?.theme_mode?.enabled !== false,
      default_mode: raw?.theme_mode?.default_mode || 'light',
      light_label: raw?.theme_mode?.light_label || 'Light',
      dark_label: raw?.theme_mode?.dark_label || 'Dark',
    },
    hero_slider: {
      enabled: raw?.hero_slider?.enabled !== false,
      slides:
        Array.isArray(raw?.hero_slider?.slides) && raw.hero_slider.slides.length
          ? raw.hero_slider.slides.slice(0, 5)
          : [
              {
                id: 'mextro-slide-1',
                eyebrow: 'CATCH BIG DEALS',
                title: 'Home Speakers',
                subtitle: 'Enjoy room-filling sound with premium electronics and weekly offers.',
                button_label: 'Shop Now',
                image_url: '',
                badge: 'Starting at $99',
                accent: '#fed700',
                text_color: '#111111',
              },
              {
                id: 'mextro-slide-2',
                eyebrow: 'BEST SELLER',
                title: 'Smart Gadgets',
                subtitle: 'Upgrade your home, office and lifestyle with sharper electronics.',
                button_label: 'Shop Now',
                image_url: '',
                badge: 'Hot Offer',
                accent: '#fed700',
                text_color: '#111111',
              },
              {
                id: 'mextro-slide-3',
                eyebrow: 'NEW ARRIVAL',
                title: 'Laptops & Accessories',
                subtitle: 'Discover practical devices and accessories with strong value.',
                button_label: 'Shop Now',
                image_url: '',
                badge: 'Daily Deal',
                accent: '#fed700',
                text_color: '#111111',
              },
            ],
    },
    hero_side_banner: {
      enabled: raw?.hero_side_banner?.enabled !== false,
      eyebrow: raw?.hero_side_banner?.eyebrow || 'Weekend Discount',
      title: raw?.hero_side_banner?.title || 'Gaming Accessories',
      subtitle:
        raw?.hero_side_banner?.subtitle ||
        'Save more on selected products and add-ons this week.',
      button_label: raw?.hero_side_banner?.button_label || 'Shop Now',
      image_url: raw?.hero_side_banner?.image_url || '',
      bg: raw?.hero_side_banner?.bg || '#f5f1e9',
    },
    category_icons: {
      enabled: raw?.category_icons?.enabled !== false,
      title: raw?.category_icons?.title || 'Top Categories',
      limit: Number(raw?.category_icons?.limit) > 0 ? Number(raw.category_icons.limit) : 8,
    },
    promo_banners: {
      enabled: raw?.promo_banners?.enabled !== false,
      items:
        Array.isArray(raw?.promo_banners?.items) && raw.promo_banners.items.length
          ? raw.promo_banners.items.slice(0, 3)
          : [
              {
                title: 'Catch Big Deals',
                subtitle: 'On cameras and photography',
                button_label: 'Shop Now',
                image_url: '',
                bg: '#f7f7f7',
              },
              {
                title: 'Tablets & iPads',
                subtitle: 'Latest performance picks',
                button_label: 'Shop Now',
                image_url: '',
                bg: '#f5f5f5',
              },
              {
                title: 'Smart Speakers',
                subtitle: 'Premium audio offers',
                button_label: 'Shop Now',
                image_url: '',
                bg: '#f8f8f8',
              },
            ],
    },
    featured_products: {
      enabled: raw?.featured_products?.enabled !== false,
      title: raw?.featured_products?.title || 'Handpicked Items For You',
      limit: Number(raw?.featured_products?.limit) > 0 ? Number(raw.featured_products.limit) : 8,
      products_per_row:
        Number(raw?.featured_products?.products_per_row) > 0
          ? Number(raw.featured_products.products_per_row)
          : 4,
    },
    dark_promos: {
      enabled: raw?.dark_promos?.enabled !== false,
      left_title: raw?.dark_promos?.left_title || 'Cameras, Audio & Tech',
      left_subtitle:
        raw?.dark_promos?.left_subtitle || 'Strong weekly savings on selected gadgets.',
      left_button_label: raw?.dark_promos?.left_button_label || 'Shop Now',
      left_image_url: raw?.dark_promos?.left_image_url || '',
      right_title: raw?.dark_promos?.right_title || 'Laptops & Accessories',
      right_subtitle:
        raw?.dark_promos?.right_subtitle || 'Premium products with standout performance.',
      right_button_label: raw?.dark_promos?.right_button_label || 'Shop Now',
      right_image_url: raw?.dark_promos?.right_image_url || '',
    },
    brand_row: {
      enabled: raw?.brand_row?.enabled !== false,
      titles:
        Array.isArray(raw?.brand_row?.titles) && raw.brand_row.titles.length
          ? raw.brand_row.titles.slice(0, 6)
          : ['TECHCOM', 'GADIX', 'NEXSO', 'DIGIT', 'ELECTRA', 'MAXON'],
    },
    news: {
      enabled: raw?.news?.enabled !== false,
      title: raw?.news?.title || 'Recent Posts',
      limit: Number(raw?.news?.limit) > 0 ? Number(raw.news.limit) : 3,
    },
    footer: {
      enabled: raw?.footer?.enabled !== false,
      about_text:
        raw?.footer?.about_text ||
        'Mextro is the Electro-style storefront inside Bloggad with fixed structure and editable content only.',
      phone: raw?.footer?.phone || '+1 212-334-0212',
      email: raw?.footer?.email || 'support@bloggad.com',
      address: raw?.footer?.address || '27 Division St, New York, NY 10002, USA',
      copyright: raw?.footer?.copyright || '© 2026 Bloggad. All rights reserved.',
    },
  };
}

function brandLogoStyle(isDark) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: isDark ? '#ffffff' : '#222222',
  };
}

function getCategoryIcon(name = '', index = 0) {
  const key = String(name).trim().toLowerCase();
  const map = {
    smartphones: Smartphone,
    phone: Smartphone,
    phones: Smartphone,
    laptops: Laptop,
    laptop: Laptop,
    tablets: Tablet,
    tablet: Tablet,
    camera: Camera,
    cameras: Camera,
    monitor: Monitor,
    monitors: Monitor,
    audio: Headphones,
    headphones: Headphones,
    watches: Watch,
    watch: Watch,
    speaker: Speaker,
    speakers: Speaker,
  };

  return (
    map[key] ||
    [Smartphone, Laptop, Tablet, Camera, Monitor, Headphones, Watch, Speaker][index % 8]
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
          zIndex: 700,
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
          zIndex: 701,
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
          background: '#ffffff',
          borderRadius: 28,
          border: '1px solid rgba(226,232,240,0.95)',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.28)',
          zIndex: 501,
        }}
      >
        <style>{`
          .mextro-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .mextro-quick-view-grid {
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

        <div className="mextro-quick-view-grid">
          <div
            style={{
              padding: 22,
              background:
                'radial-gradient(circle at top left, rgba(254,215,0,0.10), transparent 28%), #fafafa',
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
                  objectFit: 'contain',
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
                  border: '1px solid #f2e38b',
                  color: '#b08900',
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
                    color: '#6b7280',
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
              <span style={{ marginLeft: 10, color: '#6b7280', fontWeight: 700 }}>
                Featured pick
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
                  background: '#fffbea',
                  border: '1px solid #f6e7a9',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#6b7280',
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
                  {product?.affiliate?.website_name || 'Bloggad'}
                </div>
              </div>

              <div
                style={{
                  background: '#fffbea',
                  border: '1px solid #f6e7a9',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#6b7280',
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
                    color: '#111827',
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
                  color: '#6b7280',
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
                  color: '#4b5563',
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
                  background: '#fed700',
                  color: '#111111',
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
                  background: '#111111',
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

function ProductCard({
  product,
  websiteSlug,
  formatCurrency,
  darkMode,
  onQuickView,
}) {
  const openQuickView = () => onQuickView?.(product);

  return (
    <div
      style={{
        background: darkMode ? '#181818' : '#ffffff',
        border: `1px solid ${darkMode ? '#262626' : '#ececec'}`,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={openQuickView}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          background: darkMode ? '#121212' : '#fbfbfb',
          overflow: 'hidden',
        }}
      >
        <img
          src={product?.product_image}
          alt={product?.title || 'Product'}
          onClick={openQuickView}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            cursor: 'pointer',
          }}
        />

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: `1px solid ${darkMode ? '#2f2f2f' : '#e6e6e6'}`,
            background: darkMode ? '#161616' : '#ffffff',
            color: darkMode ? '#ffffff' : '#111111',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Heart size={16} />
        </button>
      </div>

      <div style={{ padding: 18, display: 'grid', gap: 10 }}>
        <div style={{ color: darkMode ? '#8d8d8d' : '#7b7b7b', fontSize: 13 }}>
          {product?.category?.name || 'Category'}
        </div>

        <div
          style={{
            color: darkMode ? '#f3f3f3' : '#222222',
            fontSize: 15,
            lineHeight: 1.45,
            fontWeight: 700,
            minHeight: 44,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b400' }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index}>★</span>
          ))}
        </div>

        <div
          style={{
            color: darkMode ? '#fed700' : '#111111',
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          {renderPrice(product, formatCurrency)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              minHeight: 42,
              background: '#fed700',
              color: '#111111',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 10px',
            }}
          >
            Buy Now
          </a>

          <Link
            to={resolveReadMoreUrl(product, websiteSlug)}
            onClick={(e) => e.stopPropagation()}
            style={{
              minHeight: 42,
              border: `1px solid ${darkMode ? '#353535' : '#e5e5e5'}`,
              color: darkMode ? '#ffffff' : '#111111',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 10px',
              fontWeight: 700,
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
  const date = article?.published_at || '2026-04-20';
  const [, month, day] = String(date).split('-');

  return (
    <div
      style={{
        background: darkMode ? '#161616' : '#ffffff',
        border: `1px solid ${darkMode ? '#272727' : '#ededed'}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={article?.featured_image}
          alt={article?.title || 'Article'}
          style={{ width: '100%', height: 250, objectFit: 'cover', display: 'block' }}
        />

        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 58,
            height: 64,
            background: '#fed700',
            color: '#111111',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 24 }}>{day || '20'}</span>
          <span style={{ fontSize: 12 }}>{month || '04'}</span>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ color: '#f59e0b', fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
          {article?.category?.name || 'News'}
        </div>

        <div
          style={{
            color: darkMode ? '#f3f3f3' : '#222222',
            fontSize: 22,
            lineHeight: 1.35,
            fontWeight: 800,
            minHeight: 88,
          }}
        >
          {article?.title}
        </div>

        <div
          style={{
            marginTop: 12,
            color: darkMode ? '#a9a9a9' : '#6f6f6f',
            fontSize: 15,
            lineHeight: 1.8,
            minHeight: 86,
          }}
        >
          {article?.excerpt}
        </div>

        <Link
          to={article?.url || '#'}
          style={{
            marginTop: 18,
            display: 'inline-flex',
            minHeight: 44,
            padding: '0 22px',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fed700',
            color: '#111111',
            textDecoration: 'none',
            fontWeight: 800,
          }}
        >
          READ MORE
        </Link>
      </div>
    </div>
  );
}

export default function TemplateMextro({
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
  handleToggleSave,
  handleShare,
  handleTrackedPopupAction,
  actionLoading,
  formatCurrency,
}) {
  const config = useMemo(() => getMextroConfig(settings), [settings]);
  const [darkMode, setDarkMode] = useState(config.theme_mode.default_mode === 'dark');
  const [activeSlide, setActiveSlide] = useState(0);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);

  useEffect(() => {
    setDarkMode(config.theme_mode.default_mode === 'dark');
  }, [config.theme_mode.default_mode]);

  const headerMenu = menus?.find((menu) => menu.location === 'header') || menus?.[0] || null;
  const displayCategories = (categoryTree || categories || []).slice(0, config.category_icons.limit);
  const featuredProducts = (products || []).slice(0, config.featured_products.limit);
  const newsItems = (articles || []).slice(0, config.news.limit);
  const slidesList =
    Array.isArray(config.hero_slider.slides) && config.hero_slider.slides.length
      ? config.hero_slider.slides
      : sliders || [];

  const currentSlide = slidesList[activeSlide] || slidesList[0] || {};
  const heroImageFallback = products?.[0]?.product_image || '';
  const sideBannerFallback = products?.[1]?.product_image || '';
  const promoFallbacks = [products?.[2]?.product_image, products?.[3]?.product_image, products?.[4]?.product_image];
  const darkPromoLeftFallback = products?.[5]?.product_image || '';
  const darkPromoRightFallback = products?.[6]?.product_image || '';

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

  useEffect(() => {
    if (!slidesList.length) return undefined;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slidesList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slidesList.length]);

  const colors = {
    bg: darkMode ? '#111111' : '#ffffff',
    text: darkMode ? '#f5f5f5' : '#222222',
    muted: darkMode ? '#aaaaaa' : '#6f6f6f',
    border: darkMode ? '#262626' : '#ececec',
    headerBg: darkMode ? '#0f0f0f' : '#ffffff',
    navDark: '#1f1f1f',
    accent: '#fed700',
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <style>{`
        .mextro-container{
          width:min(1400px, calc(100% - 40px));
          margin:0 auto;
        }

        .mextro-nav-links a:hover,
        .mextro-footer-links a:hover{
          color:#fed700 !important;
        }

        @media (max-width: 1180px){
          .mextro-header-main{
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            padding-top: 18px !important;
            padding-bottom: 18px !important;
          }

          .mextro-hero-grid,
          .mextro-dark-promo-grid,
          .mextro-footer-grid{
            grid-template-columns: 1fr !important;
          }

          .mextro-promo-banner-grid{
            grid-template-columns: repeat(2,minmax(0,1fr)) !important;
          }
        }

        @media (max-width: 900px){
          .mextro-nav-row{
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .mextro-nav-links{
            overflow-x:auto;
            white-space:nowrap;
            flex-wrap:nowrap !important;
            padding-bottom:4px;
          }

          .mextro-category-grid{
            grid-template-columns: repeat(4,minmax(0,1fr)) !important;
          }

          .mextro-products-grid{
            grid-template-columns: repeat(2,minmax(0,1fr)) !important;
          }

          .mextro-blog-grid,
          .mextro-promo-banner-grid{
            grid-template-columns: 1fr !important;
          }

          .mextro-footer-bottom{
            flex-direction:column !important;
            align-items:flex-start !important;
          }
        }

        @media (max-width: 640px){
          .mextro-container{
            width:calc(100% - 24px);
          }

          .mextro-category-grid{
            grid-template-columns: repeat(2,minmax(0,1fr)) !important;
          }

          .mextro-products-grid{
            grid-template-columns: 1fr !important;
          }

          .mextro-hero-main-card{
            padding: 24px 20px 90px !important;
            min-height: 420px !important;
          }

          .mextro-hero-title{
            font-size: 34px !important;
          }

          .mextro-main-search{
            grid-template-columns: 1fr !important;
          }

          .mextro-main-search .mextro-department-select{
            border-right: none !important;
            border-bottom: 1px solid #e9e9e9 !important;
          }
        }
      `}</style>

      {config.top_strip.enabled ? (
        <div
          style={{
            minHeight: 42,
            background: colors.navDark,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {config.top_strip.message}
        </div>
      ) : null}

      <header
        style={{
          background: colors.headerBg,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          className="mextro-container mextro-header-main"
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: 24,
            minHeight: 100,
          }}
        >
          <Link to={`/${websiteSlug || ''}`} style={brandLogoStyle(darkMode)}>
            {config.header.logo_image_url ? (
              <img
                src={config.header.logo_image_url}
                alt={config.header.logo_text}
                style={{ height: 40, objectFit: 'contain' }}
              />
            ) : (
              <>
                <span
                  style={{
                    width: 42,
                    height: 42,
                    background: colors.accent,
                    color: '#111111',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 22,
                  }}
                >
                  B
                </span>
                <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.05em' }}>
                  {config.header.logo_text || website?.website_name || 'Bloggad'}
                </span>
              </>
            )}
          </Link>

          <div
            className="mextro-main-search"
            style={{
              display: 'grid',
              gridTemplateColumns: '220px minmax(0,1fr) 58px',
              minHeight: 56,
              border: `2px solid ${colors.accent}`,
              background: darkMode ? '#161616' : '#ffffff',
            }}
          >
            <div
              className="mextro-department-select"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '0 16px',
                borderRight: `1px solid ${darkMode ? '#2c2c2c' : '#e9e9e9'}`,
                color: colors.text,
                fontWeight: 700,
              }}
            >
              <span>{config.header.categories_button_label}</span>
              <ChevronDown size={18} />
            </div>

            <input
              type="text"
              placeholder={config.header.search_placeholder}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: colors.text,
                padding: '0 18px',
                fontSize: 15,
              }}
            />

            <button
              type="button"
              style={{
                border: 'none',
                background: colors.accent,
                color: '#111111',
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            {config.theme_mode.enabled ? (
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                style={{
                  minHeight: 42,
                  padding: '0 14px',
                  border: `1px solid ${colors.border}`,
                  background: darkMode ? '#181818' : '#ffffff',
                  color: colors.text,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span>
                  {darkMode ? config.theme_mode.dark_label : config.theme_mode.light_label}
                </span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setCustomerAuthOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: colors.text,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <User size={18} />
              <span>{config.header.account_label}</span>
            </button>
          </div>
        </div>
      </header>

      <div style={{ background: colors.navDark }}>
        <div
          className="mextro-container mextro-nav-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '250px minmax(0,1fr) auto',
            alignItems: 'center',
            gap: 22,
            minHeight: 56,
          }}
        >
          <button
            type="button"
            onClick={() => setMobileCatsOpen((prev) => !prev)}
            style={{
              minHeight: 56,
              border: 'none',
              background: colors.accent,
              color: '#111111',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '0 18px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Menu size={18} />
              {config.header.categories_button_label}
            </span>
            <ChevronDown size={18} />
          </button>

          <nav
            className="mextro-nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 26,
              flexWrap: 'wrap',
            }}
          >
            {(headerMenu?.items || []).map((item) => (
              <Link
                key={item.id}
                to={resolveMenuUrl(item, websiteSlug)}
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14 }}>
            {config.header.track_order_label}
          </div>
        </div>
      </div>

      {mobileCatsOpen ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 300,
            padding: 16,
          }}
          onClick={() => setMobileCatsOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 380,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              padding: 18,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                color: colors.text,
                fontWeight: 900,
                fontSize: 20,
                marginBottom: 14,
              }}
            >
              {config.header.categories_button_label}
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {displayCategories.map((category, index) => (
                <Link
                  key={category.id || index}
                  to={category.url || '#'}
                  onClick={() => setMobileCatsOpen(false)}
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    textDecoration: 'none',
                    minHeight: 48,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    fontWeight: 700,
                  }}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <main className="mextro-container" style={{ paddingTop: 30, paddingBottom: 70 }}>
        <section
          className="mextro-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(290px, 360px)',
            gap: 24,
          }}
        >
          {config.hero_slider.enabled ? (
            <div
              className="mextro-hero-main-card"
              style={{
                position: 'relative',
                minHeight: 520,
                overflow: 'hidden',
                background: darkMode ? '#171717' : '#f8f8f8',
                border: `1px solid ${colors.border}`,
                padding: '42px 38px',
              }}
            >
              <div style={{ position: 'relative', zIndex: 2, maxWidth: 420 }}>
                <div
                  style={{
                    color: '#888888',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 14,
                  }}
                >
                  {currentSlide?.eyebrow}
                </div>

                <h1
                  className="mextro-hero-title"
                  style={{
                    margin: 0,
                    color: currentSlide?.text_color || colors.text,
                    fontSize: 54,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {currentSlide?.title}
                </h1>

                <p
                  style={{
                    margin: '18px 0 0',
                    color: darkMode ? '#bbbbbb' : '#666666',
                    fontSize: 17,
                    lineHeight: 1.8,
                    maxWidth: 430,
                  }}
                >
                  {currentSlide?.subtitle}
                </p>

                <button
                  type="button"
                  style={{
                    marginTop: 22,
                    minHeight: 46,
                    padding: '0 24px',
                    border: 'none',
                    background: colors.accent,
                    color: '#111111',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {currentSlide?.button_label || 'Shop Now'}
                </button>
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 20,
                  bottom: 28,
                  width: '48%',
                  height: '78%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={currentSlide?.image_url || currentSlide?.image || heroImageFallback}
                  alt={currentSlide?.title || 'Hero'}
                  style={{
                    width: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: 18,
                  left: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  zIndex: 2,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActiveSlide((prev) => (prev - 1 + slidesList.length) % slidesList.length)
                  }
                  style={{
                    width: 38,
                    height: 38,
                    border: `1px solid ${colors.border}`,
                    background: darkMode ? '#151515' : '#ffffff',
                    color: colors.text,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % slidesList.length)}
                  style={{
                    width: 38,
                    height: 38,
                    border: `1px solid ${colors.border}`,
                    background: darkMode ? '#151515' : '#ffffff',
                    color: colors.text,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : null}

          {config.hero_side_banner.enabled ? (
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: config.hero_side_banner.bg,
                border: `1px solid ${colors.border}`,
                minHeight: 520,
                padding: '34px 28px 28px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 34,
                  right: 18,
                  color: 'rgba(0,0,0,0.05)',
                  fontSize: 72,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: '-0.06em',
                }}
              >
                SALE
              </div>

              <div style={{ position: 'relative', zIndex: 2, maxWidth: 230 }}>
                <div
                  style={{
                    color: '#8a7f72',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  {config.hero_side_banner.eyebrow}
                </div>

                <div
                  style={{
                    color: '#222222',
                    fontSize: 36,
                    lineHeight: 1.02,
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {config.hero_side_banner.title}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    color: '#6d6258',
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  {config.hero_side_banner.subtitle}
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: 20,
                    minHeight: 44,
                    padding: '0 20px',
                    border: 'none',
                    background: '#222222',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {config.hero_side_banner.button_label}
                </button>
              </div>

              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  bottom: 18,
                  left: 12,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  height: '55%',
                }}
              >
                <img
                  src={config.hero_side_banner.image_url || sideBannerFallback}
                  alt={config.hero_side_banner.title}
                  style={{
                    width: '100%',
                    maxWidth: 260,
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
          ) : null}
        </section>

        <section style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
              gap: 0,
              border: `1px solid ${colors.border}`,
              background: darkMode ? '#141414' : '#ffffff',
            }}
          >
            {[
              { icon: Truck, title: 'Free Delivery', text: 'from $50' },
              { icon: RotateCcw, title: '99% Positive', text: 'Feedbacks' },
              { icon: ShieldCheck, title: '365 Days', text: 'for free return' },
              { icon: CreditCard, title: 'Payment', text: 'Secure System' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  style={{
                    minHeight: 86,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '18px 20px',
                    borderRight:
                      index !== 3 ? `1px solid ${colors.border}` : 'none',
                  }}
                >
                  <Icon size={26} color="#fed700" />
                  <div>
                    <div style={{ color: colors.text, fontWeight: 800, fontSize: 15 }}>
                      {item.title}
                    </div>
                    <div style={{ color: colors.muted, fontSize: 13 }}>{item.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {config.promo_banners.enabled ? (
          <section
            className="mextro-promo-banner-grid"
            style={{
              marginTop: 30,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
              gap: 24,
            }}
          >
            {config.promo_banners.items.map((item, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  minHeight: 190,
                  overflow: 'hidden',
                  background: item.bg || '#f7f7f7',
                  border: `1px solid ${colors.border}`,
                  padding: '24px 22px',
                }}
              >
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 200 }}>
                  <div
                    style={{
                      color: '#222222',
                      fontWeight: 900,
                      fontSize: 28,
                      lineHeight: 1.06,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      color: '#666666',
                      fontSize: 15,
                      lineHeight: 1.65,
                    }}
                  >
                    {item.subtitle}
                  </div>

                  <button
                    type="button"
                    style={{
                      marginTop: 18,
                      minHeight: 40,
                      padding: '0 18px',
                      border: 'none',
                      background: '#fed700',
                      color: '#111111',
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
                    right: 12,
                    bottom: 8,
                    width: '46%',
                    height: '76%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={item.image_url || promoFallbacks[index] || heroImageFallback}
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

        {config.category_icons.enabled ? (
          <section style={{ marginTop: 44 }}>
            <div
              className="mextro-category-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, minmax(0,1fr))',
                gap: 20,
              }}
            >
              {displayCategories.map((category, index) => {
                const Icon = getCategoryIcon(category?.name, index);
                return (
                  <Link
                    key={category.id || index}
                    to={category.url || '#'}
                    style={{
                      textDecoration: 'none',
                      color: colors.text,
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '14px 8px',
                      }}
                    >
                      <div
                        style={{
                          width: 88,
                          height: 88,
                          margin: '0 auto 14px',
                          borderRadius: '50%',
                          border: `1px solid ${colors.border}`,
                          background: darkMode ? '#171717' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={28} color="#fed700" />
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          lineHeight: 1.5,
                          fontWeight: 700,
                          color: colors.text,
                        }}
                      >
                        {category.name}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 24,
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                {['Featured', 'On Sale', 'Top Rated'].map((tab, index) => (
                  <button
                    key={index}
                    type="button"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: index === 0 ? colors.accent : colors.muted,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="mextro-products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${config.featured_products.products_per_row}, minmax(0,1fr))`,
                gap: 0,
                borderLeft: `1px solid ${colors.border}`,
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  style={{
                    borderRight: `1px solid ${colors.border}`,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <ProductCard
                    product={product}
                    websiteSlug={websiteSlug}
                    formatCurrency={formatCurrency}
                    darkMode={darkMode}
                    onQuickView={setQuickViewProduct}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {config.dark_promos.enabled ? (
          <section
            className="mextro-dark-promo-grid"
            style={{
              marginTop: 42,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
            }}
          >
            {[
              {
                title: config.dark_promos.left_title,
                subtitle: config.dark_promos.left_subtitle,
                button: config.dark_promos.left_button_label,
                image: config.dark_promos.left_image_url || darkPromoLeftFallback,
              },
              {
                title: config.dark_promos.right_title,
                subtitle: config.dark_promos.right_subtitle,
                button: config.dark_promos.right_button_label,
                image: config.dark_promos.right_image_url || darkPromoRightFallback,
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  minHeight: 250,
                  overflow: 'hidden',
                  background: '#191919',
                  border: '1px solid #2a2a2a',
                  padding: '30px 26px',
                }}
              >
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 260 }}>
                  <div
                    style={{
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: 34,
                      lineHeight: 1.04,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      color: '#b5b5b5',
                      fontSize: 15,
                      lineHeight: 1.75,
                    }}
                  >
                    {item.subtitle}
                  </div>

                  <button
                    type="button"
                    style={{
                      marginTop: 20,
                      minHeight: 42,
                      padding: '0 20px',
                      border: 'none',
                      background: '#fed700',
                      color: '#111111',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {item.button}
                  </button>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 8,
                    width: '42%',
                    height: '82%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={item.image}
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

        {config.brand_row.enabled ? (
          <section style={{ marginTop: 42 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0,1fr))',
                gap: 12,
                alignItems: 'center',
                borderTop: `1px solid ${colors.border}`,
                borderBottom: `1px solid ${colors.border}`,
                padding: '28px 0',
              }}
            >
              {config.brand_row.titles.map((brand, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: 'center',
                    color: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.38)',
                    fontWeight: 900,
                    fontSize: 30,
                    letterSpacing: '-0.05em',
                  }}
                >
                  {brand}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {config.news.enabled ? (
          <section style={{ marginTop: 48 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 24,
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

              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: colors.accent,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                View All Blogs
              </button>
            </div>

            <div
              className="mextro-blog-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
                gap: 24,
              }}
            >
              {newsItems.map((article, index) => (
                <BlogCard key={article.id || index} article={article} darkMode={darkMode} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {config.footer.enabled ? (
        <footer
          style={{
            background: darkMode ? '#0d0d0d' : '#111111',
            color: '#ffffff',
            marginTop: 12,
          }}
        >
          <div className="mextro-container" style={{ paddingTop: 54, paddingBottom: 18 }}>
            <div
              className="mextro-footer-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
                gap: 32,
              }}
            >
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.05em' }}>
                  {config.header.logo_text || 'Bloggad'}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    color: '#b9b9b9',
                    fontSize: 15,
                    lineHeight: 1.9,
                    maxWidth: 320,
                  }}
                >
                  {config.footer.about_text}
                </div>

                <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
                  <div style={{ color: '#fed700', fontWeight: 800 }}>{config.footer.phone}</div>
                  <div style={{ color: '#b9b9b9' }}>{config.footer.email}</div>
                  <div style={{ color: '#b9b9b9', lineHeight: 1.7 }}>{config.footer.address}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
                  Find It Fast
                </div>
                <div className="mextro-footer-links" style={{ display: 'grid', gap: 10 }}>
                  {[
                    'Laptops & Computers',
                    'Cameras & Photography',
                    'Smart Phones & Tablets',
                    'Video Games & Consoles',
                    'TV & Audio',
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to="#"
                      style={{
                        color: '#b9b9b9',
                        textDecoration: 'none',
                        fontSize: 14,
                      }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
                  Customer Care
                </div>
                <div className="mextro-footer-links" style={{ display: 'grid', gap: 10 }}>
                  {[
                    'My Account',
                    'Track your Order',
                    'Wishlist',
                    'Customer Service',
                    'Returns / Exchange',
                  ].map((item, index) => (
                    <Link
                      key={index}
                      to="#"
                      style={{
                        color: '#b9b9b9',
                        textDecoration: 'none',
                        fontSize: 14,
                      }}
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
                  Sign up to Newsletter
                </div>
                <div
                  style={{
                    color: '#b9b9b9',
                    fontSize: 14,
                    lineHeight: 1.8,
                    marginBottom: 14,
                  }}
                >
                  Get all the latest information on events, sales and offers.
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    minHeight: 46,
                    border: '1px solid #2a2a2a',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: '#181818',
                      color: '#ffffff',
                      padding: '0 14px',
                    }}
                  />
                  <button
                    type="button"
                    style={{
                      border: 'none',
                      background: '#fed700',
                      color: '#111111',
                      padding: '0 18px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Subscribe
                  </button>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>Download App</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div
                      style={{
                        minHeight: 42,
                        padding: '0 14px',
                        border: '1px solid #2a2a2a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      App Store
                    </div>
                    <div
                      style={{
                        minHeight: 42,
                        padding: '0 14px',
                        border: '1px solid #2a2a2a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Google Play
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mextro-footer-bottom"
              style={{
                marginTop: 34,
                paddingTop: 18,
                borderTop: '1px solid #222222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div style={{ color: '#b9b9b9', fontSize: 13 }}>{config.footer.copyright}</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['VISA', 'MASTERCARD', 'PAYPAL', 'STRIPE'].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      minHeight: 30,
                      padding: '0 12px',
                      background: '#181818',
                      border: '1px solid #2a2a2a',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
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
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        websiteSlug={websiteSlug}
        isSaved={!!savedProducts?.[quickViewProduct?.id]}
        actionLoading={actionLoading}
        onClose={() => setQuickViewProduct(null)}
        onToggleSave={handleToggleSave}
        onShare={handleShare}
        onTrackedAction={handleTrackedPopupAction}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}