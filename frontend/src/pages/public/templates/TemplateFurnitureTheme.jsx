import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  Clock3,
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

function resolveMenuUrl(item, websiteSlug = '') {
  return item?.resolved_url || item?.custom_url || `/${websiteSlug}`;
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

function resolveReviewUrl(product, fallbackWebsiteSlug = '') {
  return (
    product?.review_url ||
    product?.review_site_url ||
    product?.external_review_url ||
    resolveReadMoreUrl(product, fallbackWebsiteSlug)
  );
}

function getSafeImage(customUrl, fallbackUrl) {
  return customUrl || fallbackUrl || '';
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

function fallbackFurnitureCategories(websiteSlug = '') {
  return [
    {
      id: 'fur-cat-1',
      name: 'Living Room',
      slug: 'living-room',
      total_products: 18,
      url: `/${websiteSlug}/category/living-room`,
      children: [
        { name: 'Sofas', slug: 'sofas' },
        { name: 'Coffee Tables', slug: 'coffee-tables' },
        { name: 'TV Stands', slug: 'tv-stands' },
      ],
    },
    {
      id: 'fur-cat-2',
      name: 'Bedroom',
      slug: 'bedroom',
      total_products: 14,
      url: `/${websiteSlug}/category/bedroom`,
      children: [
        { name: 'Beds', slug: 'beds' },
        { name: 'Wardrobes', slug: 'wardrobes' },
        { name: 'Nightstands', slug: 'nightstands' },
      ],
    },
    {
      id: 'fur-cat-3',
      name: 'Dining',
      slug: 'dining',
      total_products: 11,
      url: `/${websiteSlug}/category/dining`,
      children: [
        { name: 'Dining Sets', slug: 'dining-sets' },
        { name: 'Bar Stools', slug: 'bar-stools' },
        { name: 'Sideboards', slug: 'sideboards' },
      ],
    },
    {
      id: 'fur-cat-4',
      name: 'Office',
      slug: 'office',
      total_products: 9,
      url: `/${websiteSlug}/category/office`,
      children: [
        { name: 'Office Chairs', slug: 'office-chairs' },
        { name: 'Desks', slug: 'desks' },
        { name: 'Bookcases', slug: 'bookcases' },
      ],
    },
    {
      id: 'fur-cat-5',
      name: 'Lighting',
      slug: 'lighting',
      total_products: 8,
      url: `/${websiteSlug}/category/lighting`,
      children: [
        { name: 'Floor Lamps', slug: 'floor-lamps' },
        { name: 'Pendant Lights', slug: 'pendant-lights' },
        { name: 'Wall Lights', slug: 'wall-lights' },
      ],
    },
    {
      id: 'fur-cat-6',
      name: 'Outdoor',
      slug: 'outdoor',
      total_products: 7,
      url: `/${websiteSlug}/category/outdoor`,
      children: [
        { name: 'Garden Chairs', slug: 'garden-chairs' },
        { name: 'Outdoor Tables', slug: 'outdoor-tables' },
        { name: 'Umbrellas', slug: 'umbrellas' },
      ],
    },
  ];
}

function fallbackHeroSlides(products = []) {
  return [
    {
      id: 'furniture-slide-1',
      image:
        products?.[0]?.product_image ||
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
      title: 'Up To 30% Off',
      subtitle: "Let's Make Home Happy",
      button_label: 'Shop Now',
      badge: 'New Collection',
      accent: '#f3ece4',
      text_color: '#2a211b',
    },
    {
      id: 'furniture-slide-2',
      image:
        products?.[1]?.product_image ||
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80',
      title: 'Modern Living',
      subtitle: 'Elegant pieces for every room',
      button_label: 'Explore Now',
      badge: 'Best Seller',
      accent: '#eee4d8',
      text_color: '#2a211b',
    },
    {
      id: 'furniture-slide-3',
      image:
        products?.[2]?.product_image ||
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
      title: 'Comfort Collection',
      subtitle: 'Premium furniture at better prices',
      button_label: 'View Deals',
      badge: 'Trending',
      accent: '#e9ded0',
      text_color: '#2a211b',
    },
  ];
}

function getTemplateConfig(settings, products) {
  const raw =
    settings?.template_settings_json?.furniture_theme ||
    settings?.furniture_theme ||
    {};

  const slides =
    Array.isArray(raw?.hero_slider?.slides) && raw.hero_slider.slides.length
      ? raw.hero_slider.slides.slice(0, 5).map((slide, index) => ({
          id: slide?.id || `slide-${index + 1}`,
          image: slide?.image_url || slide?.image || '',
          title: slide?.title || '',
          subtitle: slide?.subtitle || '',
          button_label: slide?.button_label || 'Shop Now',
          badge: slide?.badge || 'Featured',
          accent: slide?.accent || '#f3ece4',
          text_color: slide?.text_color || '#2a211b',
        }))
      : fallbackHeroSlides(products);

  return {
    topbar: {
      enabled: raw?.topbar?.enabled !== false,
      left_text: raw?.topbar?.left_text || 'Welcome to Bloggad furniture store',
      center_text: raw?.topbar?.center_text || 'Free shipping on orders over $99',
      right_text: raw?.topbar?.right_text || 'Need help? Call +1 212-334-0212',
    },
    header: {
      search_placeholder: raw?.header?.search_placeholder || 'Search products...',
      phone_label: raw?.header?.phone_label || '+1 212-334-0212',
      note_label: raw?.header?.note_label || 'Support 24/7',
    },
    hero_slider: {
      enabled: raw?.hero_slider?.enabled !== false,
      slides,
    },
    new_arrivals: {
      enabled: raw?.new_arrivals?.enabled !== false,
      title: raw?.new_arrivals?.title || 'New Arrivals',
      tabs:
        Array.isArray(raw?.new_arrivals?.tabs) && raw.new_arrivals.tabs.length
          ? raw.new_arrivals.tabs.slice(0, 4)
          : ['All', 'Featured', 'Best Seller', 'Sale'],
      limit: Number(raw?.new_arrivals?.limit) > 0 ? Number(raw.new_arrivals.limit) : 8,
    },
    features_strip: {
      enabled: raw?.features_strip?.enabled !== false,
      item_one_title: raw?.features_strip?.item_one_title || 'Free Delivery',
      item_one_subtitle: raw?.features_strip?.item_one_subtitle || 'Orders over $120',
      item_two_title: raw?.features_strip?.item_two_title || 'Money Guarantee',
      item_two_subtitle: raw?.features_strip?.item_two_subtitle || '30 day back',
      item_three_title: raw?.features_strip?.item_three_title || 'Safe Payment',
      item_three_subtitle: raw?.features_strip?.item_three_subtitle || 'Secure checkout',
      item_four_title: raw?.features_strip?.item_four_title || 'Online Support',
      item_four_subtitle: raw?.features_strip?.item_four_subtitle || '24/7 assistance',
    },
    recently_added: {
      enabled: raw?.recently_added?.enabled !== false,
      title: raw?.recently_added?.title || 'Recently Added',
      limit: Number(raw?.recently_added?.limit) > 0 ? Number(raw.recently_added.limit) : 6,
    },
    top_categories: {
      enabled: raw?.top_categories?.enabled !== false,
      title: raw?.top_categories?.title || 'Top Categories This Week',
      limit: Number(raw?.top_categories?.limit) > 0 ? Number(raw.top_categories.limit) : 6,
    },
    popular_products: {
      enabled: raw?.popular_products?.enabled !== false,
      title: raw?.popular_products?.title || 'Popular Products',
      tabs:
        Array.isArray(raw?.popular_products?.tabs) && raw.popular_products.tabs.length
          ? raw.popular_products.tabs.slice(0, 4)
          : ['Featured', 'Top Rated', 'Best Seller', 'Latest'],
      limit: Number(raw?.popular_products?.limit) > 0 ? Number(raw.popular_products.limit) : 8,
    },
    news: {
      enabled: raw?.news?.enabled !== false,
      title: raw?.news?.title || 'Marketplace News',
      limit: Number(raw?.news?.limit) > 0 ? Number(raw.news.limit) : 3,
    },
    brand_row: {
      enabled: raw?.brand_row?.enabled !== false,
      titles:
        Array.isArray(raw?.brand_row?.titles) && raw.brand_row.titles.length
          ? raw.brand_row.titles.slice(0, 6)
          : ['FURNI', 'WOODO', 'NEST', 'LIVORA', 'MODEN', 'ROOMIX'],
    },
    newsletter: {
      enabled: raw?.newsletter?.enabled !== false,
      title: raw?.newsletter?.title || 'Join our newsletter',
      subtitle:
        raw?.newsletter?.subtitle ||
        'Subscribe to get furniture trends, offers, and new collection updates from Bloggad.',
      placeholder: raw?.newsletter?.placeholder || 'Enter your email address',
      button_label: raw?.newsletter?.button_label || 'Subscribe',
    },
    footer: {
      enabled: raw?.footer?.enabled !== false,
      about_text:
        raw?.footer?.about_text ||
        'Bloggad furniture storefront with editable content and fixed premium layout.',
      phone: raw?.footer?.phone || '+1 212-334-0212',
      email: raw?.footer?.email || 'support@bloggad.com',
      address: raw?.footer?.address || '27 Division St, New York, NY 10002, USA',
      copyright:
        raw?.footer?.copyright || `© ${new Date().getFullYear()} Bloggad. All rights reserved.`,
    },
  };
}

function HeaderTopBar({ config }) {
  if (!config?.enabled) return null;

  return (
    <div style={{ background: '#1d1713', color: '#f8efe5' }}>
      <div
        className="furniture-container"
        style={{
          minHeight: 38,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 16,
          alignItems: 'center',
          fontSize: 13,
        }}
      >
        <div>{config.left_text}</div>
        <div style={{ fontWeight: 700 }}>{config.center_text}</div>
        <div style={{ textAlign: 'right' }}>{config.right_text}</div>
      </div>
    </div>
  );
}

function MobileCategoryDrawer({ open, onClose, categoryTree }) {
  const [expanded, setExpanded] = useState({});

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'rgba(15, 23, 42, 0.55)',
      }}
    >
      <div
        style={{
          width: 'min(420px, calc(100% - 20px))',
          height: '100%',
          background: '#fff',
          padding: 18,
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900, color: '#221b16' }}>Browse Categories</div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid #eadfd3',
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

        <div style={{ display: 'grid', gap: 10 }}>
          {(categoryTree || []).map((category, index) => {
            const key = `${category?.slug || category?.name || 'cat'}-${index}`;
            const isOpen = !!expanded[key];

            return (
              <div
                key={key}
                style={{
                  border: '1px solid #efe4d8',
                  borderRadius: 18,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                  style={{
                    width: '100%',
                    border: 'none',
                    background: '#fff',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    cursor: 'pointer',
                    fontWeight: 800,
                    color: '#221b16',
                  }}
                >
                  <span>{category?.name || 'Category'}</span>
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </button>

                {isOpen ? (
                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                      padding: '0 16px 16px',
                      background: '#fcfaf7',
                    }}
                  >
                    {(category?.children || []).slice(0, 6).map((child, childIndex) => (
                      <Link
                        key={`${key}-${childIndex}`}
                        to={category?.url || '#'}
                        onClick={onClose}
                        style={{
                          color: '#75665a',
                          textDecoration: 'none',
                          fontSize: 14,
                        }}
                      >
                        {child?.name || child?.label || 'Sub category'}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MainHeader({ headerMenu, categoryTree, config, websiteSlug, onOpenCustomerAuth }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        style={{
          background: '#fffdfb',
          borderBottom: '1px solid #efe4d8',
        }}
      >
        <div className="furniture-container" style={{ paddingTop: 22, paddingBottom: 22 }}>
          <div
            className="furniture-header-main"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0, 1fr) auto',
              gap: 24,
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
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #6f4e37, #c79f71)',
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
                  fontSize: 30,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: '#221b16',
                }}
              >
                Bloggad
              </span>
            </Link>

            <div className="furniture-search-wrap" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={config?.search_placeholder || 'Search products...'}
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 999,
                  border: '1px solid #e7d8c9',
                  background: '#fff',
                  padding: '0 72px 0 22px',
                  fontSize: 15,
                  outline: 'none',
                }}
              />

              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: 5,
                  top: 5,
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#6f4e37',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Search size={18} />
              </button>
            </div>

            <div
              className="furniture-header-meta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: '#8c7b6e' }}>{config?.note_label}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#221b16' }}>
                  {config?.phone_label}
                </div>
              </div>

              <button
                type="button"
                className="furniture-mobile-menu"
                onClick={() => setDrawerOpen(true)}
                style={{
                  display: 'none',
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid #e7d8c9',
                  background: '#fff',
                  color: '#221b16',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          <div
            className="furniture-nav-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '280px minmax(0, 1fr) auto',
              alignItems: 'stretch',
              gap: 20,
              marginTop: 18,
            }}
          >
            <button
              type="button"
              className="furniture-all-categories-btn"
              onClick={() => setDrawerOpen(true)}
              style={{
                height: 58,
                borderRadius: 18,
                border: 'none',
                background: '#6f4e37',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 20px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Menu size={18} />
              Shop by Categories
            </button>

            <div
              className="furniture-header-links"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                flexWrap: 'wrap',
              }}
            >
              {(headerMenu?.items || []).slice(0, 8).map((item) => (
                <Link
                  key={item?.id || item?.label}
                  to={resolveMenuUrl(item, websiteSlug)}
                  style={{
                    textDecoration: 'none',
                    color: '#221b16',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {item?.label || 'Menu'}
                </Link>
              ))}
            </div>

            <div
              className="furniture-header-icons"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={onOpenCustomerAuth}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid #eadfd3',
                  background: '#fff',
                  color: '#221b16',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Mail size={18} />
              </button>

              <button
                type="button"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid #eadfd3',
                  background: '#fff',
                  color: '#221b16',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categoryTree={categoryTree}
      />
    </>
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

function CategorySidebar({ categoryTree }) {
  const [expanded, setExpanded] = useState({});

  return (
    <aside
      className="furniture-category-sidebar"
      style={{
        background: '#fff',
        border: '1px solid #efe4d8',
        borderRadius: 22,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          minHeight: 60,
          background: '#f7efe6',
          borderBottom: '1px solid #efe4d8',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          fontWeight: 900,
          color: '#221b16',
        }}
      >
        Browse by Category
      </div>

      <div>
        {(categoryTree || []).slice(0, 8).map((category, index) => {
          const key = `${category?.slug || category?.name || 'category'}-${index}`;
          const isOpen = !!expanded[key];

          return (
            <div
              key={key}
              style={{
                borderBottom:
                  index === Math.min((categoryTree || []).slice(0, 8).length - 1, 7)
                    ? 'none'
                    : '1px solid #f4eadf',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [key]: !prev[key],
                  }))
                }
                style={{
                  width: '100%',
                  border: 'none',
                  background: '#fff',
                  minHeight: 58,
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  cursor: 'pointer',
                  color: '#221b16',
                  fontWeight: 700,
                }}
              >
                <span>{category?.name || 'Category'}</span>
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
              </button>

              {isOpen ? (
                <div
                  style={{
                    display: 'grid',
                    gap: 8,
                    padding: '0 18px 16px',
                    background: '#fcfaf7',
                  }}
                >
                  {(category?.children || []).slice(0, 5).map((child, childIndex) => (
                    <Link
                      key={`${key}-child-${childIndex}`}
                      to={category?.url || '#'}
                      style={{
                        color: '#7b6a5e',
                        textDecoration: 'none',
                        fontSize: 14,
                      }}
                    >
                      {child?.name || child?.label || 'Sub category'}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function HeroSlider({ config }) {
  const slides = config?.slides || [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeIndex] || {};

  return (
    <div
      style={{
        minHeight: 520,
        borderRadius: 24,
        background: current?.accent || '#f3ece4',
        position: 'relative',
        overflow: 'hidden',
        padding: '34px 34px 26px',
      }}
    >
      <div
        className="furniture-hero-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 380px) minmax(0, 1fr)',
          gap: 20,
          alignItems: 'center',
          minHeight: 460,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 34,
              padding: '0 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.72)',
              color: current?.text_color || '#2a211b',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {current?.badge || 'Featured'}
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 'clamp(2.2rem, 4vw, 4rem)',
              lineHeight: 0.98,
              fontWeight: 900,
              letterSpacing: '-0.06em',
              color: current?.text_color || '#2a211b',
            }}
          >
            {current?.title || 'Up To 30% Off'}
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 'clamp(1.1rem, 2vw, 2rem)',
              lineHeight: 1.1,
              fontWeight: 700,
              color: '#5e5146',
            }}
          >
            {current?.subtitle || "Let's Make Home Happy"}
          </div>

          <button
            type="button"
            style={{
              marginTop: 24,
              minWidth: 154,
              height: 52,
              borderRadius: 14,
              border: 'none',
              background: '#6f4e37',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {current?.button_label || 'Shop Now'}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            minHeight: 340,
          }}
        >
          <img
            src={getSafeImage(current?.image, '')}
            alt={current?.title || 'Hero slide'}
            style={{
              width: '100%',
              maxWidth: 760,
              maxHeight: 390,
              objectFit: 'contain',
              borderRadius: 18,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{
                width: index === activeIndex ? 30 : 10,
                height: 10,
                borderRadius: 999,
                border: 'none',
                background: index === activeIndex ? '#6f4e37' : 'rgba(111,78,55,0.25)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: '1px solid rgba(111,78,55,0.18)',
              background: '#fff',
              color: '#6f4e37',
              cursor: 'pointer',
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: '1px solid rgba(111,78,55,0.18)',
              background: '#fff',
              color: '#6f4e37',
              cursor: 'pointer',
            }}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, actionLabel = 'View all' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 20,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)',
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: '#221b16',
        }}
      >
        {title}
      </h2>

      <button
        type="button"
        style={{
          minHeight: 42,
          borderRadius: 999,
          border: '1px solid #eadfd3',
          background: '#fff',
          color: '#6f4e37',
          padding: '0 16px',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {actionLabel}
      </button>
    </div>
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
          .furniture-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .furniture-quick-view-grid {
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

        <div className="furniture-quick-view-grid">
          <div
            style={{
              padding: 22,
              background:
                'radial-gradient(circle at top left, rgba(111,78,55,0.08), transparent 28%), #faf7f3',
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
                  border: '1px solid #eadfd3',
                  color: '#6f4e37',
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
                    color: '#8a786a',
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
              <span style={{ marginLeft: 10, color: '#8a786a', fontWeight: 700 }}>
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
                  background: '#faf7f3',
                  border: '1px solid #e8ddd2',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#8a786a',
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
                  background: '#faf7f3',
                  border: '1px solid #e8ddd2',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#8a786a',
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
                    color: '#6f4e37',
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
                border: '1px solid #e8ddd2',
                borderRadius: 20,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#8a786a',
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
                  background: '#6f4e37',
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
                  background: '#221b16',
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
  settings,
  onQuickView,
  onImpression,
  formatCurrency,
  compact = false,
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
        background: '#fff',
        border: '1px solid #efe4d8',
        borderRadius: compact ? 18 : 22,
        overflow: 'hidden',
        minHeight: '100%',
      }}
    >
      <button
        type="button"
        onClick={() => settings.allowProductQuickView && onQuickView(product)}
        style={{
          width: '100%',
          border: 'none',
          background: '#fff',
          padding: 0,
          textAlign: 'left',
          cursor: settings.allowProductQuickView ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: compact ? '4 / 3.5' : settings.productImageRatio,
            background: '#f7f0e8',
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

          {product?.badge ? (
            <span
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                minHeight: 28,
                padding: '0 12px',
                borderRadius: 999,
                background:
                  product.badge === 'HOT'
                    ? '#ef4444'
                    : product.badge === 'NEW'
                    ? '#16a34a'
                    : '#6f4e37',
                color: '#fff',
                fontSize: 11,
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
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #eadfd3',
              background: '#ffffff',
              color: '#221b16',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Heart size={16} />
          </button>
        </div>
      </button>

      <div style={{ padding: compact ? '16px 16px 18px' : '18px 18px 20px' }}>
        <div style={{ color: '#8a786a', fontSize: 13, marginBottom: 8 }}>
          {product?.category?.name || 'Furniture'}
        </div>

        <div
          style={{
            fontSize: compact ? 15 : 17,
            fontWeight: 800,
            color: '#221b16',
            lineHeight: 1.35,
            minHeight: compact ? 42 : 46,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginTop: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill="#f4b000" />
          ))}
        </div>

        <div
          style={{
            fontSize: compact ? 17 : 18,
            color: '#6f4e37',
            fontWeight: 900,
            marginTop: 12,
          }}
        >
          {renderPrice(product, formatCurrency)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : '1fr 1fr',
            gap: 10,
            marginTop: 16,
          }}
        >
          <a
            href={product?.affiliate_buy_url || product?.website_url || '#'}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              minHeight: 46,
              borderRadius: 14,
              background: '#6f4e37',
              color: '#fff',
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

          {!compact ? (
            <Link
              to={resolveReadMoreUrl(product, websiteSlug)}
              onClick={(e) => e.stopPropagation()}
              style={{
                minHeight: 46,
                borderRadius: 14,
                background: '#fff',
                border: '1px solid #eadfd3',
                color: '#221b16',
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
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProductTabsSection({
  title,
  tabs,
  products,
  limit,
  websiteSlug,
  settings,
  onQuickView,
  onImpression,
  formatCurrency,
  monetizationSettings,
  websiteId,
  affiliateUserId,
}) {
  const [activeTab, setActiveTab] = useState(tabs?.[0] || 'All');
  const displayProducts = useMemo(() => (products || []).slice(0, limit), [products, limit]);

  return (
    <section style={{ marginTop: 40 }}>
      <SectionTitle title={title} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        {(tabs || []).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              minHeight: 40,
              borderRadius: 999,
              padding: '0 16px',
              border: activeTab === tab ? 'none' : '1px solid #eadfd3',
              background: activeTab === tab ? '#6f4e37' : '#fff',
              color: activeTab === tab ? '#fff' : '#221b16',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="furniture-products-wrap"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <div
          className="furniture-products-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 20,
          }}
        >
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product?.id || `${activeTab}-${index}`}
              product={product}
              websiteSlug={websiteSlug}
              settings={settings}
              onQuickView={onQuickView}
              onImpression={onImpression}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        <div className="furniture-storefront-sidebar">
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

function FeaturesStrip({ config }) {
  const items = [
    {
      icon: Truck,
      title: config?.item_one_title,
      subtitle: config?.item_one_subtitle,
    },
    {
      icon: RefreshCcw,
      title: config?.item_two_title,
      subtitle: config?.item_two_subtitle,
    },
    {
      icon: ShieldCheck,
      title: config?.item_three_title,
      subtitle: config?.item_three_subtitle,
    },
    {
      icon: Clock3,
      title: config?.item_four_title,
      subtitle: config?.item_four_subtitle,
    },
  ];

  return (
    <section style={{ marginTop: 28 }}>
      <div
        className="furniture-features-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 18,
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              style={{
                background: '#fff',
                border: '1px solid #efe4d8',
                borderRadius: 20,
                padding: '20px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: '#f7efe6',
                  color: '#6f4e37',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </span>

              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: '#221b16',
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ marginTop: 4, color: '#8a786a', fontSize: 13, lineHeight: 1.5 }}>
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentlyAddedSection({
  title,
  products,
  limit,
  websiteSlug,
  settings,
  onQuickView,
  onImpression,
  formatCurrency,
}) {
  const items = (products || []).slice(0, limit);

  return (
    <section style={{ marginTop: 42 }}>
      <SectionTitle title={title} actionLabel="More Products" />

      <div
        className="furniture-recent-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {items.map((product, index) => (
          <ProductCard
            key={product?.id || index}
            product={product}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={onQuickView}
            onImpression={onImpression}
            formatCurrency={formatCurrency}
            compact
          />
        ))}
      </div>
    </section>
  );
}

function TopCategoriesSection({ title, categories, products, websiteSlug }) {
  const items =
    Array.isArray(categories) && categories.length
      ? categories.slice(0, 6)
      : fallbackFurnitureCategories(websiteSlug).slice(0, 6);

  return (
    <section style={{ marginTop: 44 }}>
      <SectionTitle title={title} actionLabel="Browse all" />

      <div
        className="furniture-categories-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 18,
        }}
      >
        {items.map((category, index) => (
          <Link
            key={category?.id || index}
            to={category?.url || '#'}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                background: '#fff',
                border: '1px solid #efe4d8',
                borderRadius: 22,
                padding: '18px 16px',
                minHeight: 220,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <img
                  src={
                    products?.[index % Math.max(products?.length || 1, 1)]?.product_image ||
                    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={category?.name || 'Category'}
                  style={{
                    width: '100%',
                    maxWidth: 120,
                    maxHeight: 110,
                    objectFit: 'contain',
                  }}
                />
              </div>

              <div
                style={{
                  color: '#221b16',
                  fontSize: 16,
                  fontWeight: 800,
                  lineHeight: 1.3,
                }}
              >
                {category?.name || 'Category'}
              </div>

              <div style={{ marginTop: 8, color: '#8a786a', fontSize: 13 }}>
                {category?.total_products || 0} products
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NewsSection({ title, articles, limit }) {
  const items = (articles || []).slice(0, limit);

  return (
    <section style={{ marginTop: 48 }}>
      <SectionTitle title={title} actionLabel="All News" />

      <div
        className="furniture-news-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {items.map((article, index) => (
          <article
            key={article?.id || index}
            style={{
              background: '#fff',
              border: '1px solid #efe4d8',
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <img
              src={
                article?.featured_image ||
                'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80'
              }
              alt={article?.title || 'Article'}
              style={{
                width: '100%',
                height: 240,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div style={{ padding: 20 }}>
              <div
                style={{
                  color: '#8a786a',
                  fontSize: 13,
                }}
              >
                {article?.category?.name || 'Furniture'} • {article?.published_at || '2026-04-20'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#221b16',
                  fontSize: 20,
                  lineHeight: 1.35,
                  fontWeight: 900,
                  minHeight: 54,
                }}
              >
                {article?.title || 'Furniture article'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#6e6156',
                  fontSize: 15,
                  lineHeight: 1.75,
                  minHeight: 82,
                }}
              >
                {article?.excerpt ||
                  'Read the latest furniture trends, room styling tips, and interior updates.'}
              </div>

              <Link
                to={article?.url || '#'}
                style={{
                  marginTop: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#6f4e37',
                  textDecoration: 'none',
                  fontWeight: 800,
                }}
              >
                Read More
                <ChevronRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BrandRow({ titles = [] }) {
  return (
    <section style={{ marginTop: 46 }}>
      <div
        className="furniture-brand-row"
        style={{
          background: '#fff',
          border: '1px solid #efe4d8',
          borderRadius: 24,
          padding: '22px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 14,
          alignItems: 'center',
        }}
      >
        {titles.map((title, index) => (
          <div
            key={`${title}-${index}`}
            style={{
              minHeight: 74,
              borderRadius: 18,
              background: '#fcfaf7',
              color: '#6f4e37',
              fontWeight: 900,
              letterSpacing: '0.12em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 12px',
            }}
          >
            {title}
          </div>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection({ config }) {
  return (
    <section style={{ marginTop: 48 }}>
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #2e241d, #6f4e37)',
          padding: '34px 26px',
          color: '#fff',
        }}
      >
        <div
          className="furniture-newsletter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 460px)',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 34,
                padding: '0 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <Mail size={14} />
              Newsletter
            </div>

            <h2
              style={{
                margin: '16px 0 0',
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: '-0.04em',
              }}
            >
              {config?.title}
            </h2>

            <p
              style={{
                margin: '14px 0 0',
                maxWidth: 620,
                color: 'rgba(255,255,255,0.84)',
                lineHeight: 1.8,
              }}
            >
              {config?.subtitle}
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 22,
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 12,
            }}
          >
            <input
              type="email"
              placeholder={config?.placeholder}
              style={{
                width: '100%',
                minHeight: 56,
                borderRadius: 16,
                border: 'none',
                background: '#fff',
                padding: '0 18px',
                fontSize: 15,
                outline: 'none',
              }}
            />

            <button
              type="button"
              style={{
                minWidth: 146,
                minHeight: 56,
                borderRadius: 16,
                border: 'none',
                background: '#f0c48b',
                color: '#221b16',
                fontWeight: 900,
                cursor: 'pointer',
                padding: '0 18px',
              }}
            >
              {config?.button_label}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection({ footerConfig, headerMenu, websiteSlug }) {
  return (
    <footer style={{ marginTop: 56, background: '#1d1713', color: '#f8efe6' }}>
      <div className="furniture-container" style={{ paddingTop: 46, paddingBottom: 24 }}>
        <div
          className="furniture-footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 1fr 1fr 1fr',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                marginBottom: 14,
              }}
            >
              Bloggad
            </div>

            <div style={{ color: 'rgba(248,239,230,0.76)', lineHeight: 1.8, maxWidth: 360 }}>
              {footerConfig?.about_text}
            </div>

            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} />
                <span>{footerConfig?.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} />
                <span>{footerConfig?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} />
                <span>{footerConfig?.address}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {(headerMenu?.items || []).slice(0, 6).map((item) => (
                <Link
                  key={item?.id || item?.label}
                  to={resolveMenuUrl(item, websiteSlug)}
                  style={{
                    color: 'rgba(248,239,230,0.76)',
                    textDecoration: 'none',
                  }}
                >
                  {item?.label || 'Menu'}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Store Locations</div>
            <div style={{ display: 'grid', gap: 10, color: 'rgba(248,239,230,0.76)' }}>
              <div>New York Flagship</div>
              <div>Chicago Showroom</div>
              <div>Los Angeles Design Hub</div>
              <div>Miami Delivery Center</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Payments & Trust</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {['Secure Checkout', 'Protected Payments', 'Fast Delivery', 'Return Guarantee'].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      minHeight: 48,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 14px',
                      color: 'rgba(248,239,230,0.82)',
                    }}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(248,239,230,0.68)',
            fontSize: 14,
          }}
        >
          {footerConfig?.copyright}
        </div>
      </div>
    </footer>
  );
}

export default function TemplateFurnitureTheme({
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
}) {
  const safeCategoryTree =
    Array.isArray(categoryTree) && categoryTree.length
      ? categoryTree
      : fallbackFurnitureCategories(websiteSlug);

  const headerMenu = menus.find((menu) => menu.location === 'header') || menus[0] || null;
  const templateConfig = useMemo(
    () => getTemplateConfig(settings, products),
    [settings, products]
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
        background: '#f8f3ed',
      }}
    >
      <style>{`
        .furniture-container {
          width: min(1440px, calc(100% - 40px));
          margin: 0 auto;
        }

        @media (max-width: 1200px) {
          .furniture-nav-row {
            grid-template-columns: 1fr !important;
          }

          .furniture-category-layout,
          .furniture-newsletter-grid,
          .furniture-footer-grid,
          .furniture-hero-inner,
          .furniture-products-wrap {
            grid-template-columns: 1fr !important;
          }

          .furniture-category-sidebar {
            display: none !important;
          }

          .furniture-brand-row,
          .furniture-products-grid,
          .furniture-categories-grid,
          .furniture-news-grid,
          .furniture-recent-grid,
          .furniture-features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .furniture-storefront-sidebar {
            order: -1;
          }
        }

        @media (max-width: 980px) {
          .furniture-header-main {
            grid-template-columns: 1fr !important;
          }

          .furniture-header-meta {
            justify-content: space-between !important;
          }

          .furniture-search-wrap {
            order: 3;
          }

          .furniture-header-links {
            display: none !important;
          }

          .furniture-mobile-menu {
            display: inline-flex !important;
          }

          .furniture-all-categories-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 760px) {
          .furniture-brand-row,
          .furniture-products-grid,
          .furniture-categories-grid,
          .furniture-news-grid,
          .furniture-recent-grid,
          .furniture-features-grid {
            grid-template-columns: 1fr !important;
          }

          .furniture-container {
            width: calc(100% - 24px) !important;
          }

          .furniture-newsletter-grid {
            grid-template-columns: 1fr !important;
          }

          .furniture-newsletter-grid > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <HeaderTopBar config={templateConfig.topbar} />
      <MainHeader
        headerMenu={headerMenu}
        categoryTree={safeCategoryTree}
        config={templateConfig.header}
        websiteSlug={websiteSlug}
        onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
      />

      <main className="furniture-container" style={{ paddingTop: 22, paddingBottom: 20 }}>
        <div style={{ marginBottom: 22 }}>
          <StorefrontAdBlock
            slotKey="storefront_top"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>

        <section
          className="furniture-category-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '280px minmax(0, 1fr)',
            gap: 20,
          }}
        >
          <CategorySidebar categoryTree={safeCategoryTree} />
          <HeroSlider config={templateConfig.hero_slider} sliders={sliders} />
        </section>

        {templateConfig.new_arrivals.enabled ? (
          <ProductTabsSection
            title={templateConfig.new_arrivals.title}
            tabs={templateConfig.new_arrivals.tabs}
            products={products}
            limit={templateConfig.new_arrivals.limit}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        ) : null}

        {templateConfig.features_strip.enabled ? (
          <FeaturesStrip config={templateConfig.features_strip} />
        ) : null}

        {templateConfig.recently_added.enabled ? (
          <RecentlyAddedSection
            title={templateConfig.recently_added.title}
            products={products.slice(2)}
            limit={templateConfig.recently_added.limit}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
          />
        ) : null}

        {templateConfig.top_categories.enabled ? (
          <TopCategoriesSection
            title={templateConfig.top_categories.title}
            categories={categories}
            products={products}
            websiteSlug={websiteSlug}
          />
        ) : null}

        {templateConfig.popular_products.enabled ? (
          <ProductTabsSection
            title={templateConfig.popular_products.title}
            tabs={templateConfig.popular_products.tabs}
            products={products.slice(4)}
            limit={templateConfig.popular_products.limit}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        ) : null}

        {templateConfig.news.enabled ? (
          <NewsSection
            title={templateConfig.news.title}
            articles={articles}
            limit={templateConfig.news.limit}
          />
        ) : null}

        {templateConfig.brand_row.enabled ? (
          <BrandRow titles={templateConfig.brand_row.titles} />
        ) : null}

        {templateConfig.newsletter.enabled ? (
          <NewsletterSection config={templateConfig.newsletter} />
        ) : null}

        <div style={{ marginTop: 36 }}>
          <StorefrontAdBlock
            slotKey="storefront_bottom"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>
      </main>

      {templateConfig.footer.enabled ? (
        <FooterSection
          footerConfig={templateConfig.footer}
          headerMenu={headerMenu}
          websiteSlug={websiteSlug}
        />
      ) : null}

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