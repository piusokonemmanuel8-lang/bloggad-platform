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
  ShoppingCart,
  Star,
  Truck,
  Clock3,
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

function fallbackGroceryCategories(websiteSlug = '') {
  return [
    {
      id: 'gro-1',
      name: 'Grocery',
      slug: 'grocery',
      total_products: 20,
      url: `/${websiteSlug}/category/grocery`,
      children: [
        { name: 'Fresh Grocery', slug: 'fresh-grocery' },
        { name: 'Organic Products', slug: 'organic-products' },
        { name: 'Daily Essentials', slug: 'daily-essentials' },
      ],
    },
    {
      id: 'gro-2',
      name: 'Foods & Drinks',
      slug: 'foods-and-drinks',
      total_products: 6,
      url: `/${websiteSlug}/category/foods-and-drinks`,
      children: [
        { name: 'Juices', slug: 'juices' },
        { name: 'Snacks', slug: 'snacks' },
        { name: 'Beverages', slug: 'beverages' },
      ],
    },
    {
      id: 'gro-3',
      name: 'Fruits',
      slug: 'fruits',
      total_products: 12,
      url: `/${websiteSlug}/category/fruits`,
      children: [
        { name: 'Citrus', slug: 'citrus' },
        { name: 'Tropical', slug: 'tropical' },
        { name: 'Berries', slug: 'berries' },
      ],
    },
    {
      id: 'gro-4',
      name: 'Vegetables',
      slug: 'vegetables',
      total_products: 14,
      url: `/${websiteSlug}/category/vegetables`,
      children: [
        { name: 'Leafy Greens', slug: 'leafy-greens' },
        { name: 'Roots', slug: 'roots' },
        { name: 'Fresh Mix', slug: 'fresh-mix' },
      ],
    },
    {
      id: 'gro-5',
      name: 'Home Appliance',
      slug: 'home-appliance',
      total_products: 8,
      url: `/${websiteSlug}/category/home-appliance`,
      children: [
        { name: 'Kitchen Tools', slug: 'kitchen-tools' },
        { name: 'Storage', slug: 'storage' },
        { name: 'Cleaning', slug: 'cleaning' },
      ],
    },
    {
      id: 'gro-6',
      name: 'Beauty Products',
      slug: 'beauty-products',
      total_products: 9,
      url: `/${websiteSlug}/category/beauty-products`,
      children: [
        { name: 'Body Care', slug: 'body-care' },
        { name: 'Hair Care', slug: 'hair-care' },
        { name: 'Wellness', slug: 'wellness' },
      ],
    },
  ];
}

function fallbackHeroSlides(products = []) {
  return [
    {
      id: 'grocery-slide-1',
      image:
        products?.[0]?.product_image ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      eyebrow: 'Grocery at home',
      title: 'Your daily needs',
      subtitle: 'Organic food is food produced by methods that comply with the standards of organic farming.',
      button_label: 'Go to Shop',
      secondary_button_label: 'Learn More',
      badge: 'Fresh Delivery',
      accent: '#f4fff2',
      text_color: '#18351f',
    },
    {
      id: 'grocery-slide-2',
      image:
        products?.[1]?.product_image ||
        'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1600&q=80',
      eyebrow: 'Grocery at home',
      title: 'Healthy food market',
      subtitle: 'Shop fresh produce, drinks, snacks and home essentials in one place.',
      button_label: 'Go to Shop',
      secondary_button_label: 'Learn More',
      badge: 'Organic Picks',
      accent: '#fff9ef',
      text_color: '#25311f',
    },
    {
      id: 'grocery-slide-3',
      image:
        products?.[2]?.product_image ||
        'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1600&q=80',
      eyebrow: 'Grocery at home',
      title: 'Delivered fresh daily',
      subtitle: 'Your favorite groceries, fruits and vegetables delivered to your door.',
      button_label: 'Go to Shop',
      secondary_button_label: 'Learn More',
      badge: 'Today Deal',
      accent: '#eef8ff',
      text_color: '#18312a',
    },
  ];
}

function fallbackMiniBanners(products = []) {
  return [
    {
      title: 'Fresh vegetables',
      subtitle: 'Everyday low price',
      image:
        products?.[3]?.product_image ||
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
      bg: '#fff4df',
    },
    {
      title: 'Healthy snacks',
      subtitle: 'Shop groceries now',
      image:
        products?.[4]?.product_image ||
        'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?auto=format&fit=crop&w=900&q=80',
      bg: '#ecfff1',
    },
  ];
}

function getTemplateConfig(settings, products) {
  const raw =
    settings?.template_settings_json?.grocery_theme ||
    settings?.grocery_theme ||
    {};

  const slides =
    Array.isArray(raw?.hero_slider?.slides) && raw.hero_slider.slides.length
      ? raw.hero_slider.slides.slice(0, 5).map((slide, index) => ({
          id: slide?.id || `grocery-slide-${index + 1}`,
          image: slide?.image_url || slide?.image || '',
          eyebrow: slide?.eyebrow || '',
          title: slide?.title || '',
          subtitle: slide?.subtitle || '',
          button_label: slide?.button_label || 'Go to Shop',
          secondary_button_label: slide?.secondary_button_label || 'Learn More',
          badge: slide?.badge || 'Fresh Delivery',
          accent: slide?.accent || '#f4fff2',
          text_color: slide?.text_color || '#18351f',
        }))
      : fallbackHeroSlides(products);

  const miniBanners =
    Array.isArray(raw?.hero_banners?.items) && raw.hero_banners.items.length
      ? raw.hero_banners.items.slice(0, 2)
      : fallbackMiniBanners(products);

  return {
    topbar: {
      enabled: raw?.topbar?.enabled !== false,
      left_text: raw?.topbar?.left_text || 'Free Delivery',
      center_text: raw?.topbar?.center_text || 'Returns Policy',
      right_text: raw?.topbar?.right_text || 'Follow Us',
    },
    header: {
      search_placeholder: raw?.header?.search_placeholder || 'Search products...',
      phone_label: raw?.header?.phone_label || '+1 212-334-0212',
      note_label: raw?.header?.note_label || 'Support 24/7',
      today_deals_label: raw?.header?.today_deals_label || "Today's Deals",
    },
    hero_slider: {
      enabled: raw?.hero_slider?.enabled !== false,
      slides,
    },
    hero_banners: {
      enabled: raw?.hero_banners?.enabled !== false,
      items: miniBanners,
    },
    category_chips: {
      enabled: raw?.category_chips?.enabled !== false,
      title: raw?.category_chips?.title || 'Shop by category',
      limit: Number(raw?.category_chips?.limit) > 0 ? Number(raw.category_chips.limit) : 6,
    },
    featured_products: {
      enabled: raw?.featured_products?.enabled !== false,
      title: raw?.featured_products?.title || 'Featured Products',
      tabs:
        Array.isArray(raw?.featured_products?.tabs) && raw.featured_products.tabs.length
          ? raw.featured_products.tabs.slice(0, 4)
          : ['Featured', 'Popular', 'Latest', 'Sale'],
      limit: Number(raw?.featured_products?.limit) > 0 ? Number(raw.featured_products.limit) : 8,
    },
    features_strip: {
      enabled: raw?.features_strip?.enabled !== false,
      item_one_title: raw?.features_strip?.item_one_title || 'Free Delivery',
      item_one_subtitle: raw?.features_strip?.item_one_subtitle || 'Orders over $30',
      item_two_title: raw?.features_strip?.item_two_title || 'Money Guarantee',
      item_two_subtitle: raw?.features_strip?.item_two_subtitle || '7 day return',
      item_three_title: raw?.features_strip?.item_three_title || 'Safe Payment',
      item_three_subtitle: raw?.features_strip?.item_three_subtitle || 'Secure checkout',
      item_four_title: raw?.features_strip?.item_four_title || 'Online Support',
      item_four_subtitle: raw?.features_strip?.item_four_subtitle || '24/7 assistance',
    },
    top_categories: {
      enabled: raw?.top_categories?.enabled !== false,
      title: raw?.top_categories?.title || 'Top Categories',
      limit: Number(raw?.top_categories?.limit) > 0 ? Number(raw.top_categories.limit) : 6,
    },
    latest_products: {
      enabled: raw?.latest_products?.enabled !== false,
      title: raw?.latest_products?.title || 'Latest Products',
      limit: Number(raw?.latest_products?.limit) > 0 ? Number(raw.latest_products.limit) : 6,
    },
    news: {
      enabled: raw?.news?.enabled !== false,
      title: raw?.news?.title || 'Marketplace News',
      limit: Number(raw?.news?.limit) > 0 ? Number(raw.news.limit) : 3,
    },
    newsletter: {
      enabled: raw?.newsletter?.enabled !== false,
      title: raw?.newsletter?.title || 'Join our newsletter',
      subtitle:
        raw?.newsletter?.subtitle ||
        'Subscribe to get grocery trends, offers, and new collection updates.',
      placeholder: raw?.newsletter?.placeholder || 'Enter your email address',
      button_label: raw?.newsletter?.button_label || 'Subscribe',
    },
    footer: {
      enabled: raw?.footer?.enabled !== false,
      about_text:
        raw?.footer?.about_text ||
        'Premium grocery storefront with editable content and fixed layout.',
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
    <div style={{ background: '#f7fbf4', color: '#244029', borderBottom: '1px solid #e6efdf' }}>
      <div
        className="grocery-container"
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
          <div style={{ fontSize: 20, fontWeight: 900, color: '#1f2c1c' }}>Browse Categories</div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid #dfe9d8',
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
                  border: '1px solid #e7efdf',
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
                    color: '#1f2c1c',
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
                      background: '#fbfdf9',
                    }}
                  >
                    {(category?.children || []).slice(0, 6).map((child, childIndex) => (
                      <Link
                        key={`${key}-${childIndex}`}
                        to={category?.url || '#'}
                        onClick={onClose}
                        style={{
                          color: '#5f7359',
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

function MainHeader({ headerMenu, categoryTree, config }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e7efdf',
        }}
      >
        <div className="grocery-container" style={{ paddingTop: 18, paddingBottom: 18 }}>
          <div
            className="grocery-header-main"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0, 1fr) auto',
              gap: 22,
              alignItems: 'center',
            }}
          >
            <Link
              to="#"
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
                  background: 'linear-gradient(135deg, #65b741, #a5d65f)',
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
                  color: '#1f2c1c',
                }}
              >
                Bloggad
              </span>
            </Link>

            <div className="grocery-search-wrap" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={config?.search_placeholder || 'Search products...'}
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 999,
                  border: '1px solid #dbe9cf',
                  background: '#fbfdf8',
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
                  background: '#65b741',
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
              className="grocery-header-meta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: '#6a7f63' }}>{config?.note_label}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1f2c1c' }}>
                  {config?.phone_label}
                </div>
              </div>

              <button
                type="button"
                className="grocery-mobile-menu"
                onClick={() => setDrawerOpen(true)}
                style={{
                  display: 'none',
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  border: '1px solid #dbe9cf',
                  background: '#fff',
                  color: '#1f2c1c',
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
            className="grocery-nav-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '280px minmax(0, 1fr) auto',
              alignItems: 'stretch',
              gap: 20,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              className="grocery-all-categories-btn"
              onClick={() => setDrawerOpen(true)}
              style={{
                height: 54,
                borderRadius: 16,
                border: 'none',
                background: '#1f2c1c',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 18px',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Menu size={18} />
              All Categories
            </button>

            <div
              className="grocery-header-links"
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
                  to={resolveMenuUrl(item)}
                  style={{
                    textDecoration: 'none',
                    color: '#1f2c1c',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {item?.label || 'Menu'}
                </Link>
              ))}
            </div>

            <div
              className="grocery-header-icons"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  minHeight: 40,
                  padding: '0 14px',
                  borderRadius: 999,
                  background: '#fff5de',
                  color: '#7f5c00',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {config?.today_deals_label}
              </div>

              {[Heart, ShoppingCart].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    border: '1px solid #dbe9cf',
                    background: '#fff',
                    color: '#1f2c1c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={18} />
                </button>
              ))}
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

function CategorySidebar({ categoryTree }) {
  const [expanded, setExpanded] = useState({});

  return (
    <aside
      className="grocery-category-sidebar"
      style={{
        background: '#fff',
        border: '1px solid #e7efdf',
        borderRadius: 22,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          minHeight: 58,
          background: '#f5faf1',
          borderBottom: '1px solid #e7efdf',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          fontWeight: 900,
          color: '#1f2c1c',
        }}
      >
        Shop Categories
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
                    : '1px solid #eff5ea',
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
                  minHeight: 56,
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  cursor: 'pointer',
                  color: '#1f2c1c',
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
                    background: '#fbfdf9',
                  }}
                >
                  {(category?.children || []).slice(0, 5).map((child, childIndex) => (
                    <Link
                      key={`${key}-child-${childIndex}`}
                      to={category?.url || '#'}
                      style={{
                        color: '#62775d',
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
        minHeight: 430,
        borderRadius: 24,
        background: current?.accent || '#f4fff2',
        position: 'relative',
        overflow: 'hidden',
        padding: '32px 32px 22px',
      }}
    >
      <div
        className="grocery-hero-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 360px) minmax(0, 1fr)',
          gap: 20,
          alignItems: 'center',
          minHeight: 370,
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
              background: 'rgba(255,255,255,0.78)',
              color: current?.text_color || '#18351f',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {current?.badge || 'Fresh Delivery'}
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 20,
              lineHeight: 1.2,
              fontWeight: 700,
              color: '#4d6d50',
            }}
          >
            {current?.eyebrow || 'Grocery at home'}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              lineHeight: 0.98,
              fontWeight: 900,
              letterSpacing: '-0.06em',
              color: current?.text_color || '#18351f',
            }}
          >
            {current?.title || 'Your daily needs'}
          </div>

          <p
            style={{
              margin: '16px 0 0',
              maxWidth: 420,
              fontSize: 15,
              lineHeight: 1.75,
              color: '#5f7359',
            }}
          >
            {current?.subtitle || 'Fresh groceries delivered to your door every day.'}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 22 }}>
            <button
              type="button"
              style={{
                minWidth: 148,
                height: 50,
                borderRadius: 14,
                border: 'none',
                background: '#65b741',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {current?.button_label || 'Go to Shop'}
            </button>

            <button
              type="button"
              style={{
                minWidth: 138,
                height: 50,
                borderRadius: 14,
                border: '1px solid #d7e8c9',
                background: '#fff',
                color: '#1f2c1c',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {current?.secondary_button_label || 'Learn More'}
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'center',
            minHeight: 300,
          }}
        >
          <img
            src={getSafeImage(current?.image, '')}
            alt={current?.title || 'Hero slide'}
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: 320,
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
          bottom: 16,
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
                background: index === activeIndex ? '#65b741' : 'rgba(101,183,65,0.25)',
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
              border: '1px solid rgba(101,183,65,0.18)',
              background: '#fff',
              color: '#65b741',
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
              border: '1px solid rgba(101,183,65,0.18)',
              background: '#fff',
              color: '#65b741',
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

function HeroMiniBanners({ config }) {
  const items = config?.items || [];

  return (
    <div
      className="grocery-mini-banners"
      style={{
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gap: 18,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            minHeight: 206,
            borderRadius: 22,
            background: item?.bg || '#fff4df',
            overflow: 'hidden',
            position: 'relative',
            padding: '24px 22px',
            border: '1px solid #ebf1e5',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 220 }}>
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.15,
                fontWeight: 900,
                color: '#1f2c1c',
              }}
            >
              {item?.title || 'Fresh vegetables'}
            </div>

            <div
              style={{
                marginTop: 10,
                color: '#61745c',
                lineHeight: 1.7,
                fontSize: 14,
              }}
            >
              {item?.subtitle || 'Everyday low price'}
            </div>

            <button
              type="button"
              style={{
                marginTop: 16,
                minWidth: 112,
                height: 42,
                borderRadius: 12,
                border: 'none',
                background: '#65b741',
                color: '#fff',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Shop Now
            </button>
          </div>

          <img
            src={getSafeImage(item?.image_url || item?.image, '')}
            alt={item?.title || 'Banner'}
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              width: '42%',
              maxHeight: 140,
              objectFit: 'contain',
            }}
          />
        </div>
      ))}
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
          fontSize: 'clamp(1.5rem, 2.4vw, 2.1rem)',
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: '#1f2c1c',
        }}
      >
        {title}
      </h2>

      <button
        type="button"
        style={{
          minHeight: 42,
          borderRadius: 999,
          border: '1px solid #dbe9cf',
          background: '#fff',
          color: '#65b741',
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
          .grocery-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .grocery-quick-view-grid {
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

        <div className="grocery-quick-view-grid">
          <div
            style={{
              padding: 22,
              background:
                'radial-gradient(circle at top left, rgba(101,183,65,0.08), transparent 28%), #f8fcf5',
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
                  border: '1px solid #dbebcf',
                  color: '#65b741',
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
                    color: '#6a7f63',
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
              <span style={{ marginLeft: 10, color: '#6a7f63', fontWeight: 700 }}>
                Fresh pick
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
                  background: '#f8fcf5',
                  border: '1px solid #e1ecd8',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#6a7f63',
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
                  background: '#f8fcf5',
                  border: '1px solid #e1ecd8',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#6a7f63',
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
                    color: '#65b741',
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
                border: '1px solid #e1ecd8',
                borderRadius: 20,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#6a7f63',
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
                  background: '#65b741',
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
                  background: '#1f2c1c',
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
        border: '1px solid #e7efdf',
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
            aspectRatio: compact ? '4 / 3.2' : settings.productImageRatio,
            background: '#f7fbf4',
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
                    : '#65b741',
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
              border: '1px solid #dbe9cf',
              background: '#ffffff',
              color: '#1f2c1c',
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
        <div style={{ color: '#6a7f63', fontSize: 13, marginBottom: 8 }}>
          {product?.category?.name || 'Grocery'}
        </div>

        <div
          style={{
            fontSize: compact ? 15 : 17,
            fontWeight: 800,
            color: '#1f2c1c',
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
            color: '#65b741',
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
              background: '#65b741',
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
                border: '1px solid #dbe9cf',
                color: '#1f2c1c',
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
}) {
  const [activeTab, setActiveTab] = useState(tabs?.[0] || 'Featured');
  const displayProducts = useMemo(() => (products || []).slice(0, limit), [products, limit]);

  return (
    <section style={{ marginTop: 38 }}>
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
              border: activeTab === tab ? 'none' : '1px solid #dbe9cf',
              background: activeTab === tab ? '#65b741' : '#fff',
              color: activeTab === tab ? '#fff' : '#1f2c1c',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="grocery-products-grid"
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
    </section>
  );
}

function FeaturesStrip({ config }) {
  const items = [
    { icon: Truck, title: config?.item_one_title, subtitle: config?.item_one_subtitle },
    { icon: RefreshCcw, title: config?.item_two_title, subtitle: config?.item_two_subtitle },
    { icon: ShieldCheck, title: config?.item_three_title, subtitle: config?.item_three_subtitle },
    { icon: Clock3, title: config?.item_four_title, subtitle: config?.item_four_subtitle },
  ];

  return (
    <section style={{ marginTop: 28 }}>
      <div
        className="grocery-features-grid"
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
                border: '1px solid #e7efdf',
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
                  background: '#f4faf0',
                  color: '#65b741',
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
                    color: '#1f2c1c',
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ marginTop: 4, color: '#6a7f63', fontSize: 13, lineHeight: 1.5 }}>
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

function CategoryChips({ title, categories, limit, websiteSlug }) {
  const items =
    Array.isArray(categories) && categories.length
      ? categories.slice(0, limit)
      : fallbackGroceryCategories(websiteSlug).slice(0, limit);

  return (
    <section style={{ marginTop: 36 }}>
      <SectionTitle title={title} actionLabel="View all" />

      <div
        className="grocery-category-chips-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 14,
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
                border: '1px solid #e7efdf',
                borderRadius: 20,
                padding: '16px 14px',
                textAlign: 'center',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  color: '#1f2c1c',
                  fontSize: 16,
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                {category?.name || 'Category'}
              </div>

              <div style={{ color: '#6a7f63', fontSize: 13 }}>
                {category?.total_products || 0} Items Available
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LatestProductsSection({
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
        className="grocery-latest-grid"
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

function NewsSection({ title, articles, limit }) {
  const items = (articles || []).slice(0, limit);

  return (
    <section style={{ marginTop: 46 }}>
      <SectionTitle title={title} actionLabel="All News" />

      <div
        className="grocery-news-grid"
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
              border: '1px solid #e7efdf',
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <img
              src={
                article?.featured_image ||
                'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&q=80'
              }
              alt={article?.title || 'Article'}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div style={{ padding: 20 }}>
              <div
                style={{
                  color: '#6a7f63',
                  fontSize: 13,
                }}
              >
                {article?.category?.name || 'Grocery'} • {article?.published_at || '2026-04-20'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#1f2c1c',
                  fontSize: 20,
                  lineHeight: 1.35,
                  fontWeight: 900,
                  minHeight: 54,
                }}
              >
                {article?.title || 'Grocery article'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#667161',
                  fontSize: 15,
                  lineHeight: 1.75,
                  minHeight: 82,
                }}
              >
                {article?.excerpt ||
                  'Read the latest grocery shopping tips, home delivery updates, and healthy food guides.'}
              </div>

              <Link
                to={article?.url || '#'}
                style={{
                  marginTop: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#65b741',
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

function NewsletterSection({ config }) {
  return (
    <section style={{ marginTop: 48 }}>
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1f2c1c, #65b741)',
          padding: '34px 26px',
          color: '#fff',
        }}
      >
        <div
          className="grocery-newsletter-grid"
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
                background: '#f3ff9d',
                color: '#1f2c1c',
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

function FooterSection({ footerConfig, headerMenu }) {
  return (
    <footer style={{ marginTop: 56, background: '#1f2c1c', color: '#f4fff2' }}>
      <div className="grocery-container" style={{ paddingTop: 46, paddingBottom: 24 }}>
        <div
          className="grocery-footer-grid"
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

            <div style={{ color: 'rgba(244,255,242,0.78)', lineHeight: 1.8, maxWidth: 360 }}>
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
                  to={resolveMenuUrl(item)}
                  style={{
                    color: 'rgba(244,255,242,0.78)',
                    textDecoration: 'none',
                  }}
                >
                  {item?.label || 'Menu'}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Store Sections</div>
            <div style={{ display: 'grid', gap: 10, color: 'rgba(244,255,242,0.78)' }}>
              <div>Grocery</div>
              <div>Foods & Drinks</div>
              <div>Fruits</div>
              <div>Vegetables</div>
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
                      color: 'rgba(244,255,242,0.82)',
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
            color: 'rgba(244,255,242,0.68)',
            fontSize: 14,
          }}
        >
          {footerConfig?.copyright}
        </div>
      </div>
    </footer>
  );
}

export default function TemplateGroceryTheme({
  websiteSlug,
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
      : fallbackGroceryCategories(websiteSlug);

  const headerMenu = menus.find((menu) => menu.location === 'header') || menus[0] || null;
  const templateConfig = useMemo(
    () => getTemplateConfig(settings, products),
    [settings, products]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7fbf4',
      }}
    >
      <style>{`
        .grocery-container {
          width: min(1440px, calc(100% - 40px));
          margin: 0 auto;
        }

        @media (max-width: 1200px) {
          .grocery-nav-row,
          .grocery-hero-layout,
          .grocery-newsletter-grid,
          .grocery-footer-grid,
          .grocery-hero-inner {
            grid-template-columns: 1fr !important;
          }

          .grocery-category-sidebar {
            display: none !important;
          }

          .grocery-products-grid,
          .grocery-category-chips-grid,
          .grocery-news-grid,
          .grocery-latest-grid,
          .grocery-features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 980px) {
          .grocery-header-main {
            grid-template-columns: 1fr !important;
          }

          .grocery-header-meta {
            justify-content: space-between !important;
          }

          .grocery-search-wrap {
            order: 3;
          }

          .grocery-header-links {
            display: none !important;
          }

          .grocery-mobile-menu {
            display: inline-flex !important;
          }

          .grocery-all-categories-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 760px) {
          .grocery-products-grid,
          .grocery-category-chips-grid,
          .grocery-news-grid,
          .grocery-latest-grid,
          .grocery-features-grid {
            grid-template-columns: 1fr !important;
          }

          .grocery-container {
            width: calc(100% - 24px) !important;
          }

          .grocery-newsletter-grid {
            grid-template-columns: 1fr !important;
          }

          .grocery-newsletter-grid > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <HeaderTopBar config={templateConfig.topbar} />
      <MainHeader
        headerMenu={headerMenu}
        categoryTree={safeCategoryTree}
        config={templateConfig.header}
      />

      <main className="grocery-container" style={{ paddingTop: 22, paddingBottom: 20 }}>
        <section
          className="grocery-hero-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '280px minmax(0, 1fr) 320px',
            gap: 18,
          }}
        >
          <CategorySidebar categoryTree={safeCategoryTree} />
          <HeroSlider config={templateConfig.hero_slider} />
          {templateConfig.hero_banners.enabled ? <HeroMiniBanners config={templateConfig.hero_banners} /> : null}
        </section>

        {templateConfig.category_chips.enabled ? (
          <CategoryChips
            title={templateConfig.category_chips.title}
            categories={categories}
            limit={templateConfig.category_chips.limit}
            websiteSlug={websiteSlug}
          />
        ) : null}

        {templateConfig.featured_products.enabled ? (
          <ProductTabsSection
            title={templateConfig.featured_products.title}
            tabs={templateConfig.featured_products.tabs}
            products={products}
            limit={templateConfig.featured_products.limit}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
          />
        ) : null}

        {templateConfig.features_strip.enabled ? (
          <FeaturesStrip config={templateConfig.features_strip} />
        ) : null}

        {templateConfig.top_categories.enabled ? (
          <CategoryChips
            title={templateConfig.top_categories.title}
            categories={categories}
            limit={templateConfig.top_categories.limit}
            websiteSlug={websiteSlug}
          />
        ) : null}

        {templateConfig.latest_products.enabled ? (
          <LatestProductsSection
            title={templateConfig.latest_products.title}
            products={products.slice(2)}
            limit={templateConfig.latest_products.limit}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
          />
        ) : null}

        {templateConfig.news.enabled ? (
          <NewsSection
            title={templateConfig.news.title}
            articles={articles}
            limit={templateConfig.news.limit}
          />
        ) : null}

        {templateConfig.newsletter.enabled ? (
          <NewsletterSection config={templateConfig.newsletter} />
        ) : null}
      </main>

      {templateConfig.footer.enabled ? (
        <FooterSection footerConfig={templateConfig.footer} headerMenu={headerMenu} />
      ) : null}

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