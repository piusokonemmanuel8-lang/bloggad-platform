import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Search,
  Share2,
  Star,
  Truck,
  Gift,
  ShieldCheck,
  Headphones,
  User,
  ChevronRight as ChevronRightIcon,
  X,
} from 'lucide-react';
import formatCurrency from '../../../utils/formatCurrency';
import MonetizationAdSlot from '../../../components/monetization/MonetizationAdSlot';
import useAffiliateMonetizationSlots from '../../../hooks/useAffiliateMonetizationSlots';

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseTemplateSettings(settings) {
  const raw = settings?.template_settings_json;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getTemplateBucket(settings) {
  const parsed = parseTemplateSettings(settings);
  return parsed?.supplement_theme || {};
}

function renderPrice(product) {
  if (!product) return '$0.00';

  if (product?.pricing_type === 'simple') {
    return product?.price !== null && product?.price !== undefined
      ? formatCurrency(product.price)
      : '$0.00';
  }

  const min = Number(product?.min_price || 0);
  const max = Number(product?.max_price || 0);

  if (min && max && min !== max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  return formatCurrency(max || min || 0);
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

function resolveReviewUrl(product, fallbackWebsiteSlug = '') {
  return (
    product?.review_url ||
    product?.review_site_url ||
    product?.external_review_url ||
    resolveReadMoreUrl(product, fallbackWebsiteSlug)
  );
}

function normalizeCategoryUrl(item, websiteSlug = '') {
  if (item?.url) return item.url;
  if (item?.slug) return `/${websiteSlug}/category/${item.slug}`;
  return '#';
}

function getProductImage(product, fallback) {
  return (
    product?.product_image ||
    product?.image ||
    product?.featured_image ||
    fallback ||
    'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1200&q=80'
  );
}

function getProductCategoryName(product) {
  return (
    product?.category?.name ||
    product?.subcategory?.name ||
    product?.category_name ||
    'Supplement'
  );
}

function getBadge(product, index = 0) {
  if (product?.badge) return String(product.badge);
  if (index % 5 === 0) return 'HOT';
  if (index % 4 === 0) return '-15%';
  if (index % 3 === 0) return 'NEW';
  return '';
}

function makeSupplementDummyCategories(websiteSlug = '') {
  const items = [
    {
      id: 'sc1',
      name: 'Lean Muscle',
      slug: 'lean-muscle',
      image:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'sc2',
      name: 'Gain Mass',
      slug: 'gain-mass',
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'sc3',
      name: 'Lose Weight',
      slug: 'lose-weight',
      image:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'sc4',
      name: 'Strength & Endurance',
      slug: 'strength-endurance',
      image:
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'sc5',
      name: 'Build Performance',
      slug: 'build-performance',
      image:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'sc6',
      name: 'Recovery',
      slug: 'recovery',
      image:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    },
  ];

  return items.map((item) => ({
    ...item,
    url: `/${websiteSlug}/category/${item.slug}`,
  }));
}

function makeSupplementDummySlides() {
  return [
    {
      id: 'supp-slide-1',
      title: 'YOUR BEST FITNESS PARTNERS',
      subtitle: 'Hardcore mass gainer perfect for bodybuilders.',
      image:
        'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=1600&q=80',
      accent: '#111111',
      button_label: 'Shop Now',
    },
    {
      id: 'supp-slide-2',
      title: 'ELEVATE YOUR GAINS',
      subtitle: 'Clean energy, strong recovery, and daily performance support.',
      image:
        'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1600&q=80',
      accent: '#0d0d0d',
      button_label: 'Shop Now',
    },
    {
      id: 'supp-slide-3',
      title: 'BUILD MORE MUSCLE',
      subtitle: 'Explore whey, pre-workout, vitamins, and recovery formulas.',
      image:
        'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1600&q=80',
      accent: '#111111',
      button_label: 'Shop Now',
    },
  ];
}

function makeSupplementDummyProducts(websiteSlug = '') {
  const pool = [
    {
      title: 'Absolute Nutrition Multivitamin - 60 Tablets',
      image:
        'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=1000&q=80',
      category: 'Multivitamins',
    },
    {
      title: 'Whey Gold Protein Supplement',
      image:
        'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=1000&q=80',
      category: 'Whey Protein',
    },
    {
      title: 'ISO0000 Cold Filtered Protein Isolate',
      image:
        'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1000&q=80',
      category: 'Protein Isolate',
    },
    {
      title: 'L-Carnitine Athletica Aid Supplement',
      image:
        'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1000&q=80',
      category: 'Fat Burner',
    },
    {
      title: 'Hydro Boost BCAA',
      image:
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1000&q=80',
      category: 'BCAA',
    },
    {
      title: 'Nitro Pre Workout',
      image:
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
      category: 'Pre Workout',
    },
    {
      title: 'Creatine Monohydrate Plus',
      image:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
      category: 'Creatine',
    },
    {
      title: 'Mass Gainer Supreme',
      image:
        'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=1000&q=80',
      category: 'Mass Gainer',
    },
  ];

  return pool.map((item, index) => ({
    id: `supp-dummy-${index + 1}`,
    slug: `supp-dummy-${index + 1}`,
    title: item.title,
    product_image: item.image,
    pricing_type: 'simple',
    price: 79 + index * 8,
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    short_description: 'Premium supplement product card ready for real storefront products.',
    category: {
      name: item.category,
      slug: item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    affiliate: {
      website_name: 'Supplement Store',
      website_slug: websiteSlug,
      name: 'Supplement Store',
    },
    website_slug: websiteSlug,
    website_url: `/${websiteSlug}`,
    read_more_url: `/${websiteSlug}/product/supp-dummy-${index + 1}`,
    affiliate_buy_url: '#',
    status: 'published',
  }));
}

function makeSupplementDummyArticles(websiteSlug = '') {
  return [
    {
      id: 'sa1',
      title: 'How to Pick the Right Whey Protein for Your Goal',
      excerpt:
        'Understand isolate, concentrate, and blend options before buying your next stack.',
      featured_image:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
      slug: 'how-to-pick-whey-protein',
      url: `/${websiteSlug}/post/how-to-pick-whey-protein`,
      published_at: '2026-04-01',
      author_name: 'Admin',
    },
    {
      id: 'sa2',
      title: 'Pre Workout vs Creatine: What Each One Does',
      excerpt:
        'One helps with intensity, the other supports strength output and repeat performance.',
      featured_image:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      slug: 'pre-workout-vs-creatine',
      url: `/${websiteSlug}/post/pre-workout-vs-creatine`,
      published_at: '2026-04-02',
      author_name: 'Admin',
    },
    {
      id: 'sa3',
      title: 'Best Recovery Supplements After Hard Training Days',
      excerpt:
        'Recovery-focused formulas can support consistency when your schedule is intense.',
      featured_image:
        'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80',
      slug: 'best-recovery-supplements',
      url: `/${websiteSlug}/post/best-recovery-supplements`,
      published_at: '2026-04-03',
      author_name: 'Admin',
    },
  ];
}

function sectionEnabled(bucket, key, fallback = true) {
  if (bucket?.[key]?.enabled === false) return false;
  if (bucket?.[key]?.enabled === true) return true;
  return fallback;
}

function getText(bucket, sectionKey, field, fallback) {
  const value = bucket?.[sectionKey]?.[field];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getImage(bucket, sectionKey, field, fallback) {
  const value = bucket?.[sectionKey]?.[field];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getNumber(bucket, sectionKey, field, fallback) {
  const value = Number(bucket?.[sectionKey]?.[field]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
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

function StoreTopStrip({ bucket }) {
  const message = getText(
    bucket,
    'top_strip',
    'message',
    'Free delivery worldwide • 30-day returns policy • Support available daily'
  );

  return (
    <div
      style={{
        background: '#9bea3b',
        color: '#111111',
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <div
        className="supp-container"
        style={{
          minHeight: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {message}
      </div>
    </div>
  );
}

function StoreHeader({ website, websiteSlug, menus, bucket, onOpenCustomerAuth }) {
  const headerMenu =
    safeArray(menus).find((menu) => menu?.location === 'header') || safeArray(menus)[0] || null;

  const navItems =
    safeArray(headerMenu?.items).length > 0
      ? safeArray(headerMenu.items).slice(0, 6)
      : [
          { id: 'n1', label: 'Home', resolved_url: `/${websiteSlug}` },
          { id: 'n2', label: 'Shop', resolved_url: `/${websiteSlug}` },
          { id: 'n3', label: 'Blog', resolved_url: `/${websiteSlug}/posts` },
          { id: 'n4', label: 'Pages', resolved_url: `/${websiteSlug}` },
          { id: 'n5', label: 'Contact', resolved_url: `/${websiteSlug}` },
        ];

  return (
    <>
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #ebebeb',
        }}
      >
        <div
          className="supp-container supp-header-row"
          style={{
            minHeight: 88,
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <button
            type="button"
            className="supp-mobile-menu-btn"
            style={{
              display: 'none',
              width: 44,
              height: 44,
              borderRadius: 999,
              border: '1px solid #e8e8e8',
              background: '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Menu size={18} />
          </button>

          <Link
            to={`/${websiteSlug}`}
            style={{
              textDecoration: 'none',
              color: '#111111',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: '-0.05em',
                textTransform: 'lowercase',
              }}
            >
              {String(website?.website_name || 'nutreko').toLowerCase()}
            </span>
          </Link>

          <div
            className="supp-header-search"
            style={{
              display: 'grid',
              gridTemplateColumns: '160px minmax(0, 1fr) 52px',
              alignItems: 'center',
              gap: 0,
              border: '1px solid #dcdcdc',
              borderRadius: 999,
              overflow: 'hidden',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                minHeight: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 14px',
                borderRight: '1px solid #e8e8e8',
                fontSize: 13,
                fontWeight: 700,
                color: '#111111',
              }}
            >
              Categories
            </div>

            <input
              type="text"
              placeholder={getText(bucket, 'header', 'search_placeholder', 'Search for products')}
              style={{
                minHeight: 52,
                border: 'none',
                outline: 'none',
                padding: '0 18px',
                fontSize: 14,
                color: '#111111',
              }}
            />

            <button
              type="button"
              style={{
                minHeight: 52,
                border: 'none',
                background: '#9bea3b',
                color: '#111111',
                cursor: 'pointer',
              }}
            >
              <Search size={18} />
            </button>
          </div>

          <div
            className="supp-header-icons"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <button type="button" style={ICON_BTN}>
              <Search size={18} />
            </button>
            <button
              type="button"
              onClick={onOpenCustomerAuth}
              style={ICON_BTN}
            >
              <User size={18} />
            </button>
            <button type="button" style={ICON_BTN}>
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #efefef',
        }}
      >
        <div
          className="supp-container supp-nav-row"
          style={{
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          <div
            className="supp-nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              flexWrap: 'wrap',
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={resolveMenuUrl(item, websiteSlug)}
                style={{
                  textDecoration: 'none',
                  color: '#111111',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div
            className="supp-header-meta"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              color: '#666666',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>EN</span>
            <span>USD</span>
          </div>
        </div>
      </div>
    </>
  );
}

function HeroSection({ sliders, categories, bucket, websiteSlug }) {
  const fallbackSlides = makeSupplementDummySlides();
  const slideItems = safeArray(sliders).length > 0 ? safeArray(sliders) : fallbackSlides;
  const goalItems =
    safeArray(categories).length > 0
      ? safeArray(categories).slice(0, 6).map((item, index) => ({
          ...item,
          image:
            item?.image ||
            item?.featured_image ||
            item?.cover_image ||
            makeSupplementDummyCategories(websiteSlug)[index % 6]?.image,
          url: normalizeCategoryUrl(item, websiteSlug),
        }))
      : makeSupplementDummyCategories(websiteSlug);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slideItems.length <= 1) return undefined;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slideItems.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slideItems.length]);

  const current = slideItems[active] || slideItems[0] || fallbackSlides[0];

  const heroTitle = getText(bucket, 'hero', 'title', current?.title || 'YOUR BEST FITNESS PARTNERS');
  const heroSubtitle = getText(
    bucket,
    'hero',
    'subtitle',
    current?.subtitle || 'Hardcore mass gainer perfect for bodybuilders.'
  );
  const heroImage = getImage(bucket, 'hero', 'image_url', current?.image || fallbackSlides[0].image);
  const heroButton = getText(bucket, 'hero', 'button_label', current?.button_label || 'Shop Now');

  const promoOneTitle = getText(bucket, 'hero_promo_one', 'title', '20% OFF');
  const promoOneSubtitle = getText(bucket, 'hero_promo_one', 'subtitle', 'ALL GYM SUPPLEMENTS');
  const promoOneImage = getImage(
    bucket,
    'hero_promo_one',
    'image_url',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
  );

  const promoTwoTitle = getText(bucket, 'hero_promo_two', 'title', 'BOOST ENERGY');
  const promoTwoSubtitle = getText(bucket, 'hero_promo_two', 'subtitle', 'BUILD YOUR DREAM BODY');
  const promoTwoImage = getImage(
    bucket,
    'hero_promo_two',
    'image_url',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
  );

  return (
    <section style={{ marginTop: 20 }}>
      <div
        className="supp-hero-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 0.85fr',
          gap: 22,
        }}
      >
        <div>
          <div
            style={{
              background: '#111111',
              borderRadius: 24,
              overflow: 'hidden',
              position: 'relative',
              minHeight: 460,
            }}
          >
            <img
              src={heroImage}
              alt={heroTitle}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.45,
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '48px 42px',
                maxWidth: 560,
                color: '#ffffff',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: '#b7b7b7',
                  fontWeight: 700,
                }}
              >
                {getText(bucket, 'hero', 'eyebrow', 'STRONG SUPPLEMENTS')}
              </div>

              <h1
                style={{
                  margin: '14px 0 0',
                  fontSize: 62,
                  lineHeight: 0.95,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                }}
              >
                {heroTitle}
              </h1>

              <p
                style={{
                  margin: '18px 0 0',
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.82)',
                  maxWidth: 420,
                }}
              >
                {heroSubtitle}
              </p>

              <button
                type="button"
                style={{
                  marginTop: 24,
                  height: 48,
                  padding: '0 22px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#ffffff',
                  color: '#111111',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {heroButton}
              </button>
            </div>

            <div
              style={{
                position: 'absolute',
                left: 24,
                right: 24,
                bottom: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                zIndex: 3,
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                {slideItems.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActive(index)}
                    style={{
                      width: index === active ? 30 : 10,
                      height: 10,
                      borderRadius: 999,
                      border: 'none',
                      background: index === active ? '#9bea3b' : 'rgba(255,255,255,0.35)',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setActive((prev) => (prev - 1 + slideItems.length) % slideItems.length)}
                  style={HERO_ARROW_BTN}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setActive((prev) => (prev + 1) % slideItems.length)}
                  style={HERO_ARROW_BTN}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div
            className="supp-hero-promo-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 22,
              marginTop: 22,
            }}
          >
            <PromoCard title={promoOneTitle} subtitle={promoOneSubtitle} image={promoOneImage} dark />
            <PromoCard title={promoTwoTitle} subtitle={promoTwoSubtitle} image={promoTwoImage} />
          </div>
        </div>

        <div>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 24,
              border: '1px solid #ededed',
              height: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#111111',
                  fontWeight: 900,
                }}
              >
                {getText(bucket, 'goals', 'title', 'SHOP BY GOALS')}
              </h2>

              <span
                style={{
                  fontSize: 12,
                  color: '#777777',
                  fontWeight: 700,
                }}
              >
                6 Sections
              </span>
            </div>

            <div
              className="supp-goals-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              {goalItems.map((item, index) => (
                <Link
                  key={item?.id || `${item?.name}-${index}`}
                  to={item?.url || '#'}
                  style={{
                    textDecoration: 'none',
                    color: '#111111',
                    borderRadius: 20,
                    overflow: 'hidden',
                    background: '#f5f5f5',
                    position: 'relative',
                    minHeight: 150,
                  }}
                >
                  <img
                    src={item?.image || makeSupplementDummyCategories(websiteSlug)[index % 6]?.image}
                    alt={item?.name || 'Goal'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      position: 'absolute',
                      inset: 0,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))',
                    }}
                  />
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      padding: 16,
                      minHeight: 150,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'end',
                    }}
                  >
                    <div
                      style={{
                        color: '#ffffff',
                        fontSize: 20,
                        fontWeight: 900,
                        lineHeight: 1.05,
                      }}
                    >
                      {item?.name || 'Goal'}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        color: '#d8d8d8',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Shop Now
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoCard({ title, subtitle, image, dark = false }) {
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 210,
        background: dark ? '#111111' : '#1a1a1a',
      }}
    >
      <img
        src={image}
        alt={title}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.42,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 24,
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 210,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: '-0.05em',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 700,
              color: '#d1d1d1',
              textTransform: 'uppercase',
            }}
          >
            {subtitle}
          </div>
        </div>

        <button
          type="button"
          style={{
            width: 110,
            height: 40,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.32)',
            background: 'transparent',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
}

function ServicesStrip({ bucket }) {
  const items = [
    {
      title: getText(bucket, 'services', 'item_one_title', 'FAST DELIVERY'),
      subtitle: getText(bucket, 'services', 'item_one_subtitle', 'View all Europe dispatch'),
      icon: <Truck size={18} />,
    },
    {
      title: getText(bucket, 'services', 'item_two_title', 'FREE GIFT WITH ORDER $150+'),
      subtitle: getText(bucket, 'services', 'item_two_subtitle', 'Multiple premium bonuses'),
      icon: <Gift size={18} />,
    },
    {
      title: getText(bucket, 'services', 'item_three_title', 'CLICK & COLLECT'),
      subtitle: getText(bucket, 'services', 'item_three_subtitle', 'Collect your local store'),
      icon: <ShieldCheck size={18} />,
    },
    {
      title: getText(bucket, 'services', 'item_four_title', '2M+ HAPPY CUSTOMERS'),
      subtitle: getText(bucket, 'services', 'item_four_subtitle', 'Have supported your journey'),
      icon: <Headphones size={18} />,
    },
  ];

  return (
    <section style={{ marginTop: 22 }}>
      <div
        className="supp-services-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 18,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              background: '#ffffff',
              border: '1px solid #ededed',
              borderRadius: 20,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'start',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                background: '#f4fbeb',
                color: '#111111',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#111111',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  marginTop: 5,
                  color: '#777777',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {item.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, actionLabel = '', actionUrl = '#' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'space-between',
        gap: 18,
        marginBottom: 18,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 44,
          lineHeight: 0.95,
          fontWeight: 900,
          letterSpacing: '-0.05em',
          color: '#111111',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h2>

      {actionLabel ? (
        <Link
          to={actionUrl}
          style={{
            textDecoration: 'none',
            color: '#111111',
            fontWeight: 800,
            fontSize: 13,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {actionLabel}
          <ChevronRightIcon size={14} />
        </Link>
      ) : null}
    </div>
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

function ProductQuickViewModal({
  product,
  website,
  websiteSlug,
  isSaved,
  actionLoading,
  onClose,
  onToggleSave,
  onShare,
  onTrackedAction,
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
              <span style={{ marginLeft: 10, color: '#64748b', fontWeight: 700 }}>
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
                  {product?.affiliate?.website_name ||
                    product?.website?.website_name ||
                    product?.website?.name ||
                    website?.website_name ||
                    website?.name ||
                    websiteSlug ||
                    'Store Name'}
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
                  {renderPrice(product)}
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

function ProductCard({
  product,
  index,
  websiteSlug,
  onQuickView,
  onImpression,
  allowProductQuickView,
}) {
  useEffect(() => {
    if (typeof onImpression === 'function') {
      onImpression(product);
    }
  }, [onImpression, product]);

  const image = getProductImage(
    product,
    'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=1000&q=80'
  );

  const badge = getBadge(product, index);

  const openQuickView = () => {
    if (allowProductQuickView && typeof onQuickView === 'function') {
      onQuickView(product);
    }
  };

  return (
    <div
      onClick={openQuickView}
      style={{
        background: '#ffffff',
        borderRadius: 22,
        border: '1px solid #ededed',
        overflow: 'hidden',
        height: '100%',
        cursor: allowProductQuickView ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: '#f7f7f7',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
        }}
      >
        {badge ? (
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              zIndex: 2,
              padding: '6px 10px',
              borderRadius: 999,
              background: badge === 'HOT' ? '#111111' : '#9bea3b',
              color: badge === 'HOT' ? '#ffffff' : '#111111',
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            {badge}
          </div>
        ) : null}

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 2,
            width: 38,
            height: 38,
            borderRadius: 999,
            border: '1px solid #ececec',
            background: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Heart size={16} />
        </button>

        <img
          src={image}
          alt={product?.title || 'Product'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      <div
        style={{
          padding: 18,
          display: 'grid',
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 800,
            color: '#8a8a8a',
          }}
        >
          {getProductCategoryName(product)}
        </div>

        <div
          style={{
            color: '#111111',
            fontSize: 17,
            lineHeight: 1.35,
            fontWeight: 800,
            minHeight: 46,
          }}
        >
          {product?.title || 'Supplement Product'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f4b000' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill="#f4b000" />
          ))}
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#111111',
          }}
        >
          {renderPrice(product)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 4,
          }}
        >
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              textDecoration: 'none',
              minHeight: 44,
              borderRadius: 999,
              background: '#9bea3b',
              color: '#111111',
              fontWeight: 900,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product?.homepage_cta_label || 'Buy Now'}
          </a>

          <Link
            to={resolveReadMoreUrl(product, websiteSlug)}
            onClick={(e) => e.stopPropagation()}
            style={{
              textDecoration: 'none',
              minHeight: 44,
              borderRadius: 999,
              border: '1px solid #e4e4e4',
              background: '#ffffff',
              color: '#111111',
              fontWeight: 900,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product?.storefront_cta_label || 'Read More'}
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturedProductsSection({
  products,
  websiteSlug,
  bucket,
  onQuickView,
  onImpression,
  allowProductQuickView,
  monetizationSettings,
  websiteId,
  affiliateUserId,
}) {
  const limit = getNumber(bucket, 'featured_products', 'limit', 8);

  return (
    <section style={{ marginTop: 48 }}>
      <SectionHeader
        title={getText(bucket, 'featured_products', 'title', 'TOP PICKS FOR YOU')}
        actionLabel="Shop all products"
        actionUrl={`/${websiteSlug}`}
      />

      <div
        className="supp-featured-wrap"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <div
          className="supp-products-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 20,
          }}
        >
          {safeArray(products)
            .slice(0, limit)
            .map((product, index) => (
              <ProductCard
                key={product?.id || index}
                product={product}
                index={index}
                websiteSlug={websiteSlug}
                onQuickView={onQuickView}
                onImpression={onImpression}
                allowProductQuickView={allowProductQuickView}
              />
            ))}
        </div>

        <div className="supp-storefront-sidebar">
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

function LargePromoSection({ bucket }) {
  const title = getText(bucket, 'large_promo', 'title', 'DEPENDABLE PRODUCTS EXCEPTIONAL SERVICE');
  const subtitle = getText(
    bucket,
    'large_promo',
    'subtitle',
    'For 20 years, we have helped individuals like you achieve various health and fitness goals by offering top-quality dietary and nutritional supplements.'
  );
  const image = getImage(
    bucket,
    'large_promo',
    'image_url',
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1400&q=80'
  );

  return (
    <section style={{ marginTop: 58 }}>
      <div
        className="supp-large-promo"
        style={{
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: 36,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: '#888888',
              fontWeight: 800,
            }}
          >
            TRUSTED SINCE 1983
          </div>

          <h2
            style={{
              margin: '14px 0 0',
              fontSize: 58,
              lineHeight: 0.92,
              fontWeight: 900,
              letterSpacing: '-0.06em',
              color: '#111111',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </h2>

          <p
            style={{
              margin: '18px 0 0',
              color: '#666666',
              fontSize: 15,
              lineHeight: 1.8,
              maxWidth: 470,
            }}
          >
            {subtitle}
          </p>

          <button
            type="button"
            style={{
              marginTop: 24,
              height: 48,
              padding: '0 22px',
              borderRadius: 999,
              border: '1px solid #111111',
              background: 'transparent',
              color: '#111111',
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: 28,
            overflow: 'hidden',
            minHeight: 440,
            background: '#efefef',
          }}
        >
          <img
            src={image}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ bucket }) {
  const items = [
    {
      name: getText(bucket, 'testimonials', 'item_one_name', 'Michael T.'),
      quote: getText(
        bucket,
        'testimonials',
        'item_one_quote',
        'The layout feels premium and the product display is clear, clean, and easy to shop.'
      ),
    },
    {
      name: getText(bucket, 'testimonials', 'item_two_name', 'Sandra A.'),
      quote: getText(
        bucket,
        'testimonials',
        'item_two_quote',
        'I found exactly what I needed for recovery and daily wellness. Checkout felt very easy.'
      ),
    },
    {
      name: getText(bucket, 'testimonials', 'item_three_name', 'David P.'),
      quote: getText(
        bucket,
        'testimonials',
        'item_three_quote',
        'Strong design, sharp product cards, and a store structure that looks like a real premium supplement shop.'
      ),
    },
  ];

  return (
    <section style={{ marginTop: 58 }}>
      <SectionHeader title={getText(bucket, 'testimonials', 'title', 'FEATURED REVIEWS')} />

      <div
        className="supp-testimonials-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              background: '#ffffff',
              border: '1px solid #ededed',
              borderRadius: 22,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', gap: 3, color: '#f4b000' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="#f4b000" />
              ))}
            </div>

            <p
              style={{
                margin: '18px 0 0',
                fontSize: 15,
                lineHeight: 1.8,
                color: '#4b4b4b',
              }}
            >
              {item.quote}
            </p>

            <div
              style={{
                marginTop: 18,
                fontSize: 15,
                fontWeight: 900,
                color: '#111111',
              }}
            >
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArticlesSection({ articles, websiteSlug, bucket }) {
  const feed =
    safeArray(articles).length > 0 ? safeArray(articles) : makeSupplementDummyArticles(websiteSlug);
  const limit = getNumber(bucket, 'articles', 'limit', 3);

  return (
    <section style={{ marginTop: 58 }}>
      <SectionHeader
        title={getText(bucket, 'articles', 'title', 'LATEST ARTICLES')}
        actionLabel="View all posts"
        actionUrl={`/${websiteSlug}/posts`}
      />

      <div
        className="supp-articles-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {feed.slice(0, limit).map((article, index) => (
          <Link
            key={article?.id || index}
            to={article?.url || `/${websiteSlug}/post/${article?.slug || ''}`}
            style={{
              textDecoration: 'none',
              color: '#111111',
              background: '#ffffff',
              border: '1px solid #ededed',
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                aspectRatio: '1.25 / 1',
                overflow: 'hidden',
                background: '#f6f6f6',
              }}
            >
              <img
                src={
                  article?.featured_image ||
                  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80'
                }
                alt={article?.title || 'Article'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            <div style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  color: '#777777',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {article?.author_name || 'Admin'}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 22,
                  lineHeight: 1.15,
                  fontWeight: 900,
                  color: '#111111',
                }}
              >
                {article?.title || 'Article Title'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#676767',
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {article?.excerpt || 'Store article preview.'}
              </div>

              <div
                style={{
                  marginTop: 16,
                  color: '#111111',
                  fontWeight: 900,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Continue Reading
                <ChevronRightIcon size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection({ bucket }) {
  return (
    <section style={{ marginTop: 60 }}>
      <div
        className="supp-newsletter"
        style={{
          borderRadius: 28,
          background: '#111111',
          color: '#ffffff',
          padding: '34px 32px',
          display: 'grid',
          gridTemplateColumns: '0.95fr 1.05fr',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: '#9bea3b',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontWeight: 800,
            }}
          >
            Subscribe Now
          </div>

          <h2
            style={{
              margin: '14px 0 0',
              fontSize: 44,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
            }}
          >
            {getText(bucket, 'newsletter', 'title', 'GET UPDATES ON NEW SUPPLEMENTS')}
          </h2>
        </div>

        <div
          className="supp-newsletter-form"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
          }}
        >
          <input
            type="email"
            placeholder={getText(bucket, 'newsletter', 'placeholder', 'Enter your email address')}
            style={{
              minHeight: 54,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.18)',
              background: '#1c1c1c',
              color: '#ffffff',
              padding: '0 18px',
              outline: 'none',
              fontSize: 14,
            }}
          />

          <button
            type="button"
            style={{
              minHeight: 54,
              borderRadius: 999,
              border: 'none',
              background: '#9bea3b',
              color: '#111111',
              padding: '0 20px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {getText(bucket, 'newsletter', 'button_label', 'Subscribe')}
          </button>
        </div>
      </div>
    </section>
  );
}

function FooterSection({ website, websiteSlug, bucket }) {
  return (
    <footer style={{ marginTop: 60, paddingBottom: 50 }}>
      <div
        className="supp-footer-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.9fr 0.9fr 1fr',
          gap: 24,
          paddingTop: 28,
          borderTop: '1px solid #e8e8e8',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: '-0.05em',
              textTransform: 'lowercase',
              color: '#111111',
            }}
          >
            {String(website?.website_name || 'nutreko').toLowerCase()}
          </div>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: 14,
              lineHeight: 1.8,
              color: '#666666',
              maxWidth: 320,
            }}
          >
            {getText(
              bucket,
              'footer',
              'about_text',
              'Premium supplement storefront layout with editable content and locked structure.'
            )}
          </p>
        </div>

        <div>
          <div style={FOOTER_TITLE}>Shop</div>
          <FooterLink to={`/${websiteSlug}`}>All Products</FooterLink>
          <FooterLink to={`/${websiteSlug}`}>Protein</FooterLink>
          <FooterLink to={`/${websiteSlug}`}>Pre Workout</FooterLink>
          <FooterLink to={`/${websiteSlug}`}>Vitamins</FooterLink>
        </div>

        <div>
          <div style={FOOTER_TITLE}>Company</div>
          <FooterLink to={`/${websiteSlug}`}>About</FooterLink>
          <FooterLink to={`/${websiteSlug}/posts`}>Blog</FooterLink>
          <FooterLink to={`/${websiteSlug}`}>Contact</FooterLink>
          <FooterLink to={`/${websiteSlug}`}>Support</FooterLink>
        </div>

        <div>
          <div style={FOOTER_TITLE}>Contact</div>
          <div style={FOOTER_TEXT}>{getText(bucket, 'footer', 'phone', '+1 000 000 0000')}</div>
          <div style={FOOTER_TEXT}>
            {getText(bucket, 'footer', 'email', 'support@example.com')}
          </div>
          <div style={FOOTER_TEXT}>
            {getText(bucket, 'footer', 'address', 'Premium wellness store address')}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: '#666666',
        fontSize: 14,
        marginTop: 10,
      }}
    >
      {children}
    </Link>
  );
}

const ICON_BTN = {
  width: 42,
  height: 42,
  borderRadius: 999,
  border: '1px solid #e8e8e8',
  background: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const HERO_ARROW_BTN = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.08)',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const FOOTER_TITLE = {
  fontSize: 14,
  fontWeight: 900,
  color: '#111111',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const FOOTER_TEXT = {
  marginTop: 10,
  color: '#666666',
  fontSize: 14,
  lineHeight: 1.7,
};

export default function TemplateSupplementTheme({
  website,
  settings,
  sliders = [],
  menus = [],
  categories = [],
  products = [],
  articles = [],
  websiteSlug = '',
  onQuickView,
  onImpression,
  savedProducts = {},
  quickViewProduct = null,
  setQuickViewProduct,
  handleToggleSave,
  handleShare,
  handleTrackedPopupAction,
  actionLoading = false,
}) {
  const bucket = useMemo(() => getTemplateBucket(settings), [settings]);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);

  const { settings: monetizationSettings } = useAffiliateMonetizationSlots({ enabled: true });

  const liveProducts =
    safeArray(products).length > 0 ? safeArray(products) : makeSupplementDummyProducts(websiteSlug);
  const liveArticles =
    safeArray(articles).length > 0 ? safeArray(articles) : makeSupplementDummyArticles(websiteSlug);
  const liveCategories =
    safeArray(categories).length > 0 ? safeArray(categories) : makeSupplementDummyCategories(websiteSlug);
  const liveSliders =
    safeArray(sliders).length > 0 ? safeArray(sliders) : makeSupplementDummySlides();

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

  const allowProductQuickView = settings?.allowProductQuickView !== false;

  const openQuickView = (product) => {
    if (!allowProductQuickView) return;
    if (typeof setQuickViewProduct === 'function') {
      setQuickViewProduct(product);
      return;
    }
    if (typeof onQuickView === 'function') {
      onQuickView(product);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f6f3',
        color: '#111111',
      }}
    >
      <StoreTopStrip bucket={bucket} />
      <StoreHeader
        website={website}
        websiteSlug={websiteSlug}
        menus={menus}
        bucket={bucket}
        onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
      />

      <div className="supp-container" style={{ padding: '0 0 20px' }}>
        <div style={{ marginTop: 20 }}>
          <StorefrontAdBlock
            slotKey="storefront_top"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>

        {sectionEnabled(bucket, 'hero', true) ? (
          <HeroSection
            sliders={liveSliders}
            categories={liveCategories}
            bucket={bucket}
            websiteSlug={websiteSlug}
          />
        ) : null}

        {sectionEnabled(bucket, 'services', true) ? <ServicesStrip bucket={bucket} /> : null}

        {sectionEnabled(bucket, 'featured_products', true) ? (
          <FeaturedProductsSection
            products={liveProducts}
            websiteSlug={websiteSlug}
            bucket={bucket}
            onQuickView={openQuickView}
            onImpression={onImpression}
            allowProductQuickView={allowProductQuickView}
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        ) : null}

        {sectionEnabled(bucket, 'large_promo', true) ? <LargePromoSection bucket={bucket} /> : null}

        {sectionEnabled(bucket, 'testimonials', true) ? <TestimonialsSection bucket={bucket} /> : null}

        {sectionEnabled(bucket, 'articles', true) ? (
          <ArticlesSection articles={liveArticles} websiteSlug={websiteSlug} bucket={bucket} />
        ) : null}

        <div style={{ marginTop: 36 }}>
          <StorefrontAdBlock
            slotKey="storefront_bottom"
            monetizationSettings={monetizationSettings}
            websiteId={resolvedWebsiteId}
            affiliateUserId={resolvedAffiliateUserId}
          />
        </div>

        {sectionEnabled(bucket, 'newsletter', true) ? <NewsletterSection bucket={bucket} /> : null}

        <FooterSection website={website} websiteSlug={websiteSlug} bucket={bucket} />
      </div>

      <CustomerAuthPopup
        open={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
        websiteSlug={websiteSlug}
        websiteId={popupWebsiteId}
        affiliateId={popupAffiliateId}
      />

      {allowProductQuickView ? (
        <ProductQuickViewModal
          product={quickViewProduct}
          website={website}
          websiteSlug={websiteSlug}
          isSaved={!!savedProducts[quickViewProduct?.id]}
          actionLoading={actionLoading}
          onClose={() => setQuickViewProduct?.(null)}
          onToggleSave={handleToggleSave}
          onShare={handleShare}
          onTrackedAction={handleTrackedPopupAction}
        />
      ) : null}

      <style>{`
        .supp-container {
          width: min(100% - 32px, 1380px);
          margin: 0 auto;
        }

        @media (max-width: 1200px) {
          .supp-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .supp-services-grid,
          .supp-testimonials-grid,
          .supp-articles-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .supp-large-promo,
          .supp-newsletter,
          .supp-hero-grid,
          .supp-featured-wrap {
            grid-template-columns: 1fr !important;
          }

          .supp-storefront-sidebar {
            order: -1;
          }
        }

        @media (max-width: 980px) {
          .supp-header-row {
            grid-template-columns: auto 1fr auto !important;
          }

          .supp-header-search {
            grid-column: 1 / -1;
            order: 3;
          }

          .supp-nav-row {
            flex-direction: column;
            align-items: flex-start !important;
            justify-content: center !important;
            padding: 14px 0;
          }

          .supp-goals-grid,
          .supp-hero-promo-row,
          .supp-footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }

          .supp-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 768px) {
          .supp-container {
            width: min(100% - 20px, 1380px);
          }

          .supp-mobile-menu-btn {
            display: inline-flex !important;
          }

          .supp-header-icons {
            gap: 8px !important;
          }

          .supp-header-icons button:nth-child(1) {
            display: none !important;
          }

          .supp-nav-links,
          .supp-header-meta {
            width: 100%;
          }

          .supp-nav-links {
            gap: 16px !important;
          }

          .supp-goals-grid,
          .supp-services-grid,
          .supp-products-grid,
          .supp-testimonials-grid,
          .supp-articles-grid,
          .supp-footer-grid,
          .supp-newsletter,
          .supp-newsletter-form,
          .supp-featured-wrap {
            grid-template-columns: 1fr !important;
          }

          .supp-header-search {
            grid-template-columns: 120px minmax(0, 1fr) 48px !important;
          }

          .supp-hero-grid h1 {
            font-size: 42px !important;
          }
        }

        @media (max-width: 560px) {
          .supp-header-row {
            grid-template-columns: auto 1fr auto !important;
            gap: 12px !important;
            min-height: 74px !important;
          }

          .supp-header-search {
            grid-template-columns: 95px minmax(0, 1fr) 44px !important;
          }

          .supp-header-search > div {
            font-size: 11px !important;
            padding: 0 8px !important;
          }

          .supp-hero-grid h1 {
            font-size: 34px !important;
          }
        }
      `}</style>
    </div>
  );
}