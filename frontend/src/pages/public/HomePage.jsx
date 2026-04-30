import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Eye,
  Gamepad2,
  Globe2,
  Heart,
  Home,
  Image as ImageIcon,
  Laptop,
  Loader2,
  Menu,
  Search,
  Share2,
  Smartphone,
  Star,
  Tv,
  User,
  Video,
  WashingMachine,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import LocalizedPrice from '../../components/common/LocalizedPrice';
import CurrencySwitcher from '../../components/common/CurrencySwitcher';
import LegalFooter from '../../components/common/LegalFooter';
import '../../components/common/CurrencySwitcher.css';
import './HomePage.css';
import './BannerHomeSlider.css';

function renderPrice(product) {
  if (product?.pricing_type === 'simple') {
    return <LocalizedPrice product={product} />;
  }

  return (
    <>
      <LocalizedPrice amount={product?.min_price || 0} />
      {' - '}
      <LocalizedPrice amount={product?.max_price || 0} />
    </>
  );
}

function resolveProductWebsiteSlug(product) {
  return (
    product?.website_slug ||
    product?.website?.slug ||
    product?.affiliate?.website_slug ||
    product?.affiliate?.website?.slug ||
    ''
  );
}

function resolveReadMoreUrl(product) {
  const productSlug = product?.slug || '';
  const websiteSlug = resolveProductWebsiteSlug(product);

  if (product?.read_more_url) return product.read_more_url;
  if (websiteSlug && productSlug) return `/${websiteSlug}/product/${productSlug}`;
  if (product?.slug) return `/product/${product.slug}`;
  return '#';
}

function resolveBuyNowUrl(product) {
  return product?.affiliate_buy_url || product?.website_url || '#';
}

function resolveVisitWebsiteUrl(product) {
  return product?.website_url || '#';
}

function resolveTrackingEndpoint(product) {
  const websiteSlug = resolveProductWebsiteSlug(product);
  const productSlug = product?.slug || '';

  if (!websiteSlug || !productSlug) return '';
  return `/api/public/products/${websiteSlug}/product/${productSlug}/click`;
}

function resolveStoreName(store) {
  return (
    store?.name ||
    store?.website_name ||
    store?.store_name ||
    store?.title ||
    store?.affiliate?.website_name ||
    store?.affiliate?.name ||
    ''
  );
}

function resolveStoreSlug(store) {
  return (
    store?.slug ||
    store?.website_slug ||
    store?.store_slug ||
    store?.affiliate?.website_slug ||
    store?.affiliate?.website?.slug ||
    ''
  );
}

function resolveStoreUrl(store) {
  const slug = resolveStoreSlug(store);
  if (!slug) return '#';
  return `/${slug}`;
}

function resolveDashboardUrl(user) {
  const role = String(user?.role || '').toLowerCase();

  if (role === 'admin') return '/admin/dashboard';
  if (role === 'affiliate') return '/affiliate/dashboard';
  if (role === 'customer') return '/customer/dashboard';
  if (role === 'advertiser') return '/advertiser/dashboard';

  return '/dashboard';
}

function resolveDisplayName(user) {
  return user?.name || user?.full_name || user?.email || 'Account';
}

function formatCompactCount(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number) || number <= 0) return '0';

  if (number >= 1000000) {
    const formatted = number / 1000000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}M`;
  }

  if (number >= 1000) {
    const formatted = number / 1000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}K`;
  }

  return `${number}`;
}

function resolveVisitCount(product) {
  return (
    product?.visit_count ||
    product?.visits_count ||
    product?.visited_count ||
    product?.visitor_count ||
    product?.website_visits ||
    product?.total_visits ||
    product?.view_count ||
    product?.views_count ||
    product?.total_views ||
    product?.click_count ||
    product?.clicks_count ||
    product?.total_clicks ||
    0
  );
}

function resolveProductScore(product) {
  const score = Number(product?.product_score || product?.rating || product?.score || 4.1);

  if (!Number.isFinite(score)) return '4.1';

  const safeScore = Math.min(5, Math.max(1, score));
  return safeScore.toFixed(1);
}

function mergeProductVisitStats(product, data) {
  if (!product || !data) return product;

  return {
    ...product,
    visit_count:
      data.visit_count !== undefined && data.visit_count !== null
        ? Number(data.visit_count || 0)
        : product.visit_count,
    product_score:
      data.product_score !== undefined && data.product_score !== null
        ? Number(data.product_score || 4.1)
        : product.product_score,
  };
}

const categoryIconMap = {
  smartphones: Smartphone,
  supplement: Smartphone,
  fashion: Smartphone,
  'laptops, tablets & pcs': Laptop,
  'pc components': Cpu,
  gaming: Gamepad2,
  appliances: WashingMachine,
  'tv & audio': Tv,
  'home & outdoor': Home,
  cameras: Camera,
};

function getCategoryIcon(name = '') {
  const key = String(name).trim().toLowerCase();
  return categoryIconMap[key] || Smartphone;
}

function createDummyProduct(seed, index, overrides = {}) {
  const imagePool = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1200&q=80',
  ];

  return {
    id: `dummy-${seed}-${index}`,
    _renderId: `dummy-${seed}-${index}`,
    title: `Product ${index + 1}`,
    short_description: 'Product preview from Bloggad marketplace.',
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    affiliate_buy_url: '#',
    slug: `product-${seed}-${index + 1}`,
    pricing_type: 'simple',
    price: 12000 + index * 3500,
    visit_count: 0,
    product_score: 4.1,
    affiliate: {
      name: 'Bloggad',
      website_name: 'Bloggad Store',
      website_slug: 'bloggad-store',
    },
    website_slug: 'bloggad-store',
    product_image: imagePool[index % imagePool.length],
    ...overrides,
  };
}

function ensureProducts(products, needed, seed, titlePrefix = 'Product') {
  const clean = Array.isArray(products) ? products.filter(Boolean) : [];
  const list = [];

  if (!clean.length) {
    return Array.from({ length: needed }, (_, index) =>
      createDummyProduct(seed, index, { title: `${titlePrefix} ${index + 1}` })
    );
  }

  let i = 0;

  while (list.length < needed) {
    const item = clean[i % clean.length];

    list.push({
      ...item,
      title: item?.title || `${titlePrefix} ${list.length + 1}`,
      _renderId: `${seed}-${item.id || i}-${list.length}`,
    });

    i += 1;
  }

  return list;
}

function buildCategoryTree(categories = []) {
  if (!Array.isArray(categories) || !categories.length) return [];

  return categories
    .filter((category) => category && category.name)
    .map((category) => ({
      ...category,
      children:
        Array.isArray(category.children) && category.children.length
          ? category.children.filter((child) => child && child.name)
          : [],
    }));
}

function buildFeaturedWebsites(pageData) {
  const directWebsites = pageData?.featured_websites || pageData?.featuredWebsites || [];
  const fromDirect = Array.isArray(directWebsites) ? directWebsites : [];
  const seen = new Set();

  return fromDirect
    .filter((store) => {
      const name = resolveStoreName(store);
      const slug = resolveStoreSlug(store);
      const key = slug || name;

      if (!key || seen.has(key)) return false;

      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

function resolveAdTitle(ad) {
  return ad?.target_title || ad?.campaign_title || 'Featured Product';
}

function resolveAdImage(ad) {
  return ad?.display_image || ad?.target_image || ad?.campaign_image_url || ad?.campaign_image || '';
}

function resolveAdProductUrl(ad) {
  if (ad?.website_slug && ad?.product_slug) {
    return `/${ad.website_slug}/product/${ad.product_slug}`;
  }

  if (ad?.website_slug) {
    return `/${ad.website_slug}`;
  }

  return '/products';
}

function isDirectVideoFile(url = '') {
  const value = String(url || '').trim().toLowerCase();

  return (
    value.includes('/uploads/') ||
    value.includes('.mp4') ||
    value.includes('.webm') ||
    value.includes('.ogg') ||
    value.includes('.mov') ||
    value.includes('.m4v')
  );
}

function getYouTubeVideoId(url = '') {
  const value = String(url || '').trim();

  if (!value) return '';

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      return parsed.pathname.replace('/', '').split('?')[0] || '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/watch')) return parsed.searchParams.get('v') || '';
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
    }
  } catch (err) {
    return '';
  }

  return '';
}

function isVideoGadWatchUrl(url = '') {
  const value = String(url || '').trim();

  if (!value) return false;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    return host === 'videogad.com' && parsed.pathname.startsWith('/watch');
  } catch (err) {
    return false;
  }
}

function resolveVideoRenderMode(url = '') {
  const value = String(url || '').trim();

  if (!value) {
    return {
      type: 'none',
      src: '',
    };
  }

  if (isDirectVideoFile(value)) {
    return {
      type: 'direct',
      src: value,
    };
  }

  const youtubeId = getYouTubeVideoId(value);

  if (youtubeId) {
    return {
      type: 'iframe',
      src: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&playsinline=1&rel=0&modestbranding=1`,
    };
  }

  if (isVideoGadWatchUrl(value)) {
    return {
      type: 'iframe',
      src: value,
    };
  }

  return {
    type: 'iframe',
    src: value,
  };
}

function playBannerVideo(event) {
  const video = event?.currentTarget;

  if (!video) return;

  video.play().catch(() => {});
}

function pauseSingleBannerVideo(video, reset = true) {
  if (!video || video.tagName !== 'VIDEO') return;

  video.pause();
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;

  if (reset) {
    try {
      video.currentTime = 0;
    } catch (err) {
      // ignore browser timing error
    }
  }
}

function pauseAllMainBannerVideos(reset = true) {
  const videos = document.querySelectorAll('.banner-home-slider-video');

  videos.forEach((video) => {
    pauseSingleBannerVideo(video, reset);
  });
}

function FeaturedProductAdsStrip({ ads }) {
  const safeAds = Array.isArray(ads) ? ads.filter(Boolean).slice(0, 6) : [];
  const [viewedAds, setViewedAds] = useState({});

  useEffect(() => {
    if (!safeAds.length) return;

    safeAds.forEach((ad) => {
      if (!ad?.id || viewedAds[ad.id]) return;

      setViewedAds((prev) => ({
        ...prev,
        [ad.id]: true,
      }));

      api
        .post(`/api/public/affiliate-ads/${ad.id}/view`, {
          placement_key: 'homepage_featured_product',
          page_url: window.location.href,
          publisher_website_slug: '',
          publisher_website_id: '',
          publisher_affiliate_id: '',
        })
        .catch(() => {});
    });
  }, [safeAds, viewedAds]);

  const handleAdClick = async (event, ad) => {
    event.preventDefault();

    const targetUrl = resolveAdProductUrl(ad);

    if (ad?.id) {
      try {
        await api.post(`/api/public/affiliate-ads/${ad.id}/click`, {
          placement_key: 'homepage_featured_product',
          page_url: window.location.href,
          destination_url: targetUrl,
          publisher_website_slug: '',
          publisher_website_id: '',
          publisher_affiliate_id: '',
        });
      } catch (err) {
        // continue redirect
      }
    }

    if (targetUrl && targetUrl !== '#') {
      window.location.href = targetUrl;
    }
  };

  if (!safeAds.length) return null;

  return (
    <section className="home-product-section featured-product-ad-section">
      <div className="home-section-title-row">
        <h2 className="home-section-title">Featured Product</h2>

        <Link to="/products" className="home-section-view-all">
          View all
        </Link>
      </div>

      <div className="home-product-grid-4">
        {safeAds.map((ad, index) => (
          <Link
            key={`${ad.id}-${index}`}
            to={resolveAdProductUrl(ad)}
            onClick={(event) => handleAdClick(event, ad)}
            className="home-product-card featured-product-ad-card"
          >
            <span className="featured-product-ad-label">Ads</span>

            <span className="home-product-image-wrap featured-product-ad-image-wrap">
              <img src={resolveAdImage(ad)} alt={resolveAdTitle(ad)} className="home-product-image" />
            </span>

            <span className="home-product-content">
              <span className="home-product-title-button featured-product-ad-title">
                {resolveAdTitle(ad)}
              </span>

              <span className="home-product-stats-row">
                <span className="home-product-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} fill="#ffb300" strokeWidth={1.5} />
                  ))}
                  <span>Ad</span>
                </span>

                <span className="home-product-visit-stat">
                  <Eye size={12} />
                  <span>Sponsored</span>
                </span>
              </span>

              <span className="home-product-price">{ad?.campaign_title || 'Featured product'}</span>

              <span className="featured-product-ad-description">
                {ad?.campaign_description || 'Sponsored product from an active advertiser.'}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CategoriesButton({ categoryTree, featuredWebsites }) {
  const [open, setOpen] = useState(false);
  const [viewedCampaigns, setViewedCampaigns] = useState({});
  const safeCategories = Array.isArray(categoryTree) ? categoryTree : [];
  const safeWebsites = Array.isArray(featuredWebsites) ? featuredWebsites : [];

  useEffect(() => {
    if (!open || !safeWebsites.length) return;

    safeWebsites.forEach((store) => {
      const campaignId = store?.campaign_id;

      if (!campaignId || viewedCampaigns[campaignId]) return;

      setViewedCampaigns((prev) => ({
        ...prev,
        [campaignId]: true,
      }));

      api
        .post(`/api/public/affiliate-ads/${campaignId}/view`, {
          placement_key: 'homepage_featured_website_drawer',
          page_url: window.location.href,
          publisher_website_slug: '',
          publisher_website_id: '',
          publisher_affiliate_id: '',
        })
        .catch(() => {});
    });
  }, [open, safeWebsites, viewedCampaigns]);

  const handleFeaturedWebsiteClick = async (event, store) => {
    event.preventDefault();

    const campaignId = store?.campaign_id;
    const targetUrl = resolveStoreUrl(store);

    if (campaignId) {
      try {
        await api.post(`/api/public/affiliate-ads/${campaignId}/click`, {
          placement_key: 'homepage_featured_website_drawer',
          page_url: window.location.href,
          destination_url: targetUrl,
          publisher_website_slug: '',
          publisher_website_id: '',
          publisher_affiliate_id: '',
        });
      } catch (err) {
        // continue redirect
      }
    }

    setOpen(false);

    if (targetUrl && targetUrl !== '#') {
      window.location.href = targetUrl;
    }
  };

  return (
    <>
      <div className="desktop-categories-button">
        <button type="button" onClick={() => setOpen(true)} className="home-categories-btn">
          <Menu size={22} />
          All Categories
        </button>
      </div>

      <button type="button" className="mobile-categories-pill" onClick={() => setOpen(true)}>
        <Menu size={18} />
        Categories
      </button>

      {open ? (
        <div className="amazon-category-overlay">
          <aside className="amazon-category-drawer">
            <div className="amazon-category-header">
              <div className="amazon-category-user">
                <User size={24} />
                <span>Hello, welcome</span>
              </div>

              <button type="button" className="amazon-category-close" onClick={() => setOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <div className="amazon-category-scroll">
              <div className="amazon-category-group">
                <div className="amazon-category-group-title">Website Categories</div>

                {safeCategories.length ? (
                  safeCategories.map((category, index) => {
                    const Icon = getCategoryIcon(category.name);

                    return (
                      <div key={`${category.name}-${index}`} className="amazon-category-block">
                        <Link
                          to={category.slug ? `/category/${category.slug}` : '#'}
                          className="amazon-category-main"
                          onClick={() => setOpen(false)}
                        >
                          <span className="amazon-category-main-left">
                            <Icon size={18} />
                            <span>{category.name}</span>
                          </span>

                          <ChevronRight size={20} />
                        </Link>

                        {category.children?.length ? (
                          <div className="amazon-category-children">
                            {category.children.slice(0, 10).map((child, childIndex) => (
                              <Link
                                key={`${child.name}-${childIndex}`}
                                to={child.slug ? `/category/${child.slug}` : '#'}
                                className="amazon-category-child"
                                onClick={() => setOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="amazon-category-empty">No categories found yet.</div>
                )}
              </div>

              <div className="amazon-category-group">
                <div className="amazon-category-group-title">Featured Website</div>

                {safeWebsites.length ? (
                  safeWebsites.map((store, index) => (
                    <Link
                      key={`${resolveStoreName(store)}-${store?.campaign_id || index}`}
                      to={resolveStoreUrl(store)}
                      onClick={(event) => handleFeaturedWebsiteClick(event, store)}
                      className="amazon-category-main"
                    >
                      <span>{resolveStoreName(store)}</span>
                      <ChevronRight size={20} />
                    </Link>
                  ))
                ) : (
                  <div className="amazon-category-empty">No featured website found yet.</div>
                )}
              </div>

              <div className="amazon-category-group">
                <div className="amazon-category-group-title">Marketplace Picks</div>

                <Link to="/products" onClick={() => setOpen(false)} className="amazon-category-main">
                  <span>Bundle deals</span>
                  <ChevronRight size={20} />
                </Link>

                <Link to="/products" onClick={() => setOpen(false)} className="amazon-category-main">
                  <span>SuperDeals</span>
                  <ChevronRight size={20} />
                </Link>

                <Link to="/products" onClick={() => setOpen(false)} className="amazon-category-main">
                  <span>Bloggad Business</span>
                  <ChevronRight size={20} />
                </Link>
              </div>

              <div className="amazon-category-group">
                <div className="amazon-category-group-title">Currency</div>

                <div className="amazon-category-currency-box">
                  <CurrencySwitcher />
                </div>
              </div>

              <div className="amazon-category-group">
                <div className="amazon-category-group-title">Account Center</div>

                <Link to="/login" onClick={() => setOpen(false)} className="amazon-category-main">
                  <span>Sign in</span>
                </Link>

                <Link to="/register" onClick={() => setOpen(false)} className="amazon-category-main">
                  <span>Register Affiliate</span>
                </Link>

                <Link to="/customer/register" onClick={() => setOpen(false)} className="amazon-category-main">
                  <span>Register Customer</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function AuthLinksPills() {
  return (
    <div className="homepage-auth-pills">
      <Link to="/register" className="home-auth-pill home-auth-pill-red">
        Register Affiliate
      </Link>

      <Link to="/login" className="home-auth-pill home-auth-pill-white">
        Affiliate Login
      </Link>

      <Link to="/customer/register" className="home-auth-pill home-auth-pill-orange">
        Register Customer
      </Link>

      <Link to="/customer/login" className="home-auth-pill home-auth-pill-white">
        Customer Login
      </Link>
    </div>
  );
}

function HeaderAccountBox({ user, isAuthenticated, logout }) {
  if (isAuthenticated && user) {
    return (
      <div className="ali-user-link ali-user-logged-box">
        <User size={28} />

        <span>
          {resolveDisplayName(user)}
          <br />
          <strong>{String(user?.role || 'User')}</strong>
        </span>

        <div className="ali-user-dropdown-card">
          <Link to={resolveDashboardUrl(user)} className="ali-user-dropdown-link">
            Go to Dashboard
          </Link>

          <button type="button" onClick={logout} className="ali-user-dropdown-logout">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link to="/login" className="ali-user-link">
      <User size={28} />
      <span>
        Welcome
        <br />
        <strong>Sign in / Register</strong>
      </span>
    </Link>
  );
}

function HeaderNav({ categoryTree, featuredWebsites }) {
  const realNavCategories = Array.isArray(categoryTree)
    ? categoryTree.filter((category) => category && category.name).slice(0, 8)
    : [];

  return (
    <nav className="home-nav-row">
      <CategoriesButton categoryTree={categoryTree} featuredWebsites={featuredWebsites} />

      {realNavCategories.map((category, index) => (
        <Link
          key={`${category.name}-${index}`}
          to={category.slug ? `/category/${category.slug}` : '#'}
          className={index === 0 ? 'home-nav-link hot' : 'home-nav-link'}
        >
          {category.name}
        </Link>
      ))}

      <Link to="/products" className="home-nav-link">
        Bloggad Business
      </Link>
    </nav>
  );
}

function MirrorMediaLayer({ isDirectVideo, slide, mainImage, position }) {
  if (isDirectVideo) {
    return (
      <span className={`banner-home-mirror-circle banner-home-mirror-circle-${position}`}>
        <video
          key={slide.video_url}
          className="banner-home-mirror-video"
          src={slide.video_url}
          poster={slide.poster_url || slide.image_url || ''}
          muted
          autoPlay
          playsInline
          loop
          preload="auto"
          onCanPlay={playBannerVideo}
        />
      </span>
    );
  }

  if (mainImage) {
    return (
      <span className={`banner-home-mirror-circle banner-home-mirror-circle-${position}`}>
        <img
          src={mainImage}
          alt=""
          aria-hidden="true"
          className="banner-home-mirror-image"
        />
      </span>
    );
  }

  return null;
}

function MainSlider() {
  const fallbackSlides = [
    {
      id: 'fallback-1',
      source: 'fallback',
      media_type: 'image',
      eyebrow_text: 'Discover curated home collections',
      title: 'Sectional fabric sofa by Ramón Esteve',
      subtitle: 'Premium marketplace products selected for modern living.',
      promo_text: '$3620',
      cta_label: 'Shop Now',
      cta_url: '/products',
      image_url:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
      poster_url: '',
      video_url: '',
      theme_key: 'sofa',
    },
  ];

  const activeVideoRef = useRef(null);
  const [slides, setSlides] = useState(fallbackSlides);
  const [activeSlide, setActiveSlide] = useState(0);
  const [trackedViews, setTrackedViews] = useState({});
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data } = await api.get('/api/public/banner-home-ads/slides');
        const realSlides = Array.isArray(data?.slides) ? data.slides.filter(Boolean) : [];

        if (realSlides.length) {
          pauseAllMainBannerVideos(true);
          setSoundUnlocked(false);
          setSlides(realSlides);
          setActiveSlide(0);
        }
      } catch (err) {
        pauseAllMainBannerVideos(true);
        setSoundUnlocked(false);
        setSlides(fallbackSlides);
      }
    };

    fetchSlides();

    return () => {
      pauseAllMainBannerVideos(true);
    };
  }, []);

  const slide = slides[activeSlide] || fallbackSlides[0];
  const mainImage = slide?.image_url || slide?.poster_url || '';
  const videoMode = slide?.media_type === 'video' ? resolveVideoRenderMode(slide?.video_url) : { type: 'none', src: '' };
  const isVideo = slide?.media_type === 'video' && !!videoMode.src;
  const isDirectVideo = isVideo && videoMode.type === 'direct';
  const isIframeVideo = isVideo && videoMode.type === 'iframe';
  const animationKey = `${slide?.id || 'slide'}-${activeSlide}`;

  const playActiveVideoMuted = useCallback(() => {
    const video = activeVideoRef.current;

    if (!video || video.tagName !== 'VIDEO') return;

    if (!soundUnlocked) {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
    }

    video.play().catch(() => {});
  }, [soundUnlocked]);

  const goToSlide = useCallback(
    (nextIndex) => {
      if (!slides.length) return;

      pauseAllMainBannerVideos(true);
      setSoundUnlocked(false);
      setActiveSlide(nextIndex);
    },
    [slides.length]
  );

  const goToNextSlide = useCallback(() => {
    if (!slides.length) return;

    pauseAllMainBannerVideos(true);
    setSoundUnlocked(false);
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrevSlide = useCallback(() => {
    if (!slides.length) return;

    pauseAllMainBannerVideos(true);
    setSoundUnlocked(false);
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length || slides.length <= 1) return undefined;

    if (isDirectVideo && soundUnlocked) {
      return undefined;
    }

    const timer = setInterval(() => {
      pauseAllMainBannerVideos(true);
      setSoundUnlocked(false);
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length, isDirectVideo, soundUnlocked]);

  useEffect(() => {
    if (!isDirectVideo) {
      activeVideoRef.current = null;
      return;
    }

    playActiveVideoMuted();
  }, [activeSlide, isDirectVideo, playActiveVideoMuted]);

  useEffect(() => {
    const currentSlide = slides[activeSlide];

    if (!currentSlide?.is_ad || !currentSlide?.campaign_id || trackedViews[currentSlide.campaign_id]) return;

    setTrackedViews((prev) => ({
      ...prev,
      [currentSlide.campaign_id]: true,
    }));

    api
      .post(`/api/public/banner-home-ads/ads/${currentSlide.campaign_id}/view`, {
        placement_key: 'homepage_slider',
        slide_position: activeSlide + 1,
        page_url: window.location.href,
      })
      .catch(() => {});
  }, [activeSlide, slides, trackedViews]);

  const handleSlideClick = async (event, targetUrl) => {
    event.preventDefault();

    const finalUrl = targetUrl || slide?.cta_url || '/products';

    if (slide?.is_ad && slide?.campaign_id) {
      try {
        await api.post(`/api/public/banner-home-ads/ads/${slide.campaign_id}/click`, {
          placement_key: 'homepage_slider',
          slide_position: activeSlide + 1,
          page_url: window.location.href,
          destination_url: finalUrl,
        });
      } catch (err) {
        // continue redirect
      }
    }

    if (finalUrl && finalUrl !== '#') {
      window.location.href = finalUrl;
    }
  };

  const handleTapForSound = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const video = activeVideoRef.current;

    if (!video || video.tagName !== 'VIDEO') return;

    document.querySelectorAll('.banner-home-slider-video').forEach((item) => {
      if (!item || item === video || item.tagName !== 'VIDEO') return;
      pauseSingleBannerVideo(item, true);
    });

    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;
    video.loop = false;
    video.play().catch(() => {});

    setSoundUnlocked(true);
  };

  const handleActiveVideoEnded = () => {
    setSoundUnlocked(false);
    pauseAllMainBannerVideos(true);

    if (slides.length > 1) {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }
  };

  const renderSliderMedia = () => {
    if (isDirectVideo) {
      return (
        <video
          key={`${videoMode.src}-${activeSlide}`}
          ref={activeVideoRef}
          className="banner-home-slider-video"
          src={videoMode.src}
          poster={slide.poster_url || slide.image_url || ''}
          muted={!soundUnlocked}
          autoPlay
          playsInline
          loop={!soundUnlocked}
          controls
          preload="auto"
          onCanPlay={playActiveVideoMuted}
          onLoadedMetadata={playActiveVideoMuted}
          onEnded={handleActiveVideoEnded}
          onClick={handleTapForSound}
        />
      );
    }

    if (isIframeVideo) {
      return (
        <iframe
          className="banner-home-slider-video banner-home-slider-iframe"
          src={videoMode.src}
          title={slide?.title || 'Homepage slider video'}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      );
    }

    if (mainImage) {
      return (
        <img
          src={mainImage}
          alt={slide?.title || 'Homepage slider'}
          className="banner-home-slider-main-image"
        />
      );
    }

    return (
      <span className="banner-home-slider-empty-media">
        <ImageIcon size={38} />
      </span>
    );
  };

  return (
    <section className="luxury-hero-slider banner-home-dynamic-slider">
      <div
        key={animationKey}
        className={`luxury-hero-bg luxury-hero-theme-${slide?.theme_key || 'sofa'}`}
      >
        {slide?.is_ad ? <span className="banner-home-slider-ad-badge">Ads</span> : null}

        <div className="luxury-hero-left">
          <div className="luxury-hero-category-badge">
            <span className="luxury-hero-icon">
              {isVideo ? <Video size={18} /> : <ImageIcon size={18} />}
            </span>

            <span className="luxury-hero-badge-copy">
              <span>{slide?.eyebrow_text || 'Featured marketplace slide'}</span>
            </span>
          </div>

          <h1 className="luxury-hero-title">{slide?.title || 'Homepage Slider'}</h1>

          {slide?.subtitle ? <p className="banner-home-slider-subtitle">{slide.subtitle}</p> : null}

          <div className="luxury-hero-price-row">
            <a
              href={slide?.cta_url || '/products'}
              onClick={(event) => handleSlideClick(event, slide?.cta_url || '/products')}
              className="luxury-hero-shop-btn"
            >
              {slide?.cta_label || 'Shop Now'}
            </a>

            {slide?.secondary_cta_label && slide?.secondary_cta_url ? (
              <a
                href={slide.secondary_cta_url}
                onClick={(event) => handleSlideClick(event, slide.secondary_cta_url)}
                className="banner-home-slider-secondary-btn"
              >
                {slide.secondary_cta_label}
              </a>
            ) : null}

            {slide?.promo_text ? <strong>{slide.promo_text}</strong> : null}
          </div>
        </div>

        <div className="luxury-hero-image-area">
          <div className="luxury-hero-shape luxury-hero-shape-left" />
          <div className="luxury-hero-shape luxury-hero-shape-middle" />
          <div className="luxury-hero-shape luxury-hero-shape-right" />

          <div
            className={isIframeVideo ? 'banner-home-slider-media-button has-iframe-video' : 'banner-home-slider-media-button'}
            role="button"
            tabIndex={0}
            onClick={(event) => {
              if (isIframeVideo || isDirectVideo) return;
              handleSlideClick(event, slide?.cta_url || '/products');
            }}
            onKeyDown={(event) => {
              if (isIframeVideo || isDirectVideo) return;

              if (event.key === 'Enter') {
                handleSlideClick(event, slide?.cta_url || '/products');
              }
            }}
          >
            {renderSliderMedia()}

            {isDirectVideo && !soundUnlocked ? (
              <button
                type="button"
                className="banner-home-sound-unlock-btn"
                onClick={handleTapForSound}
              >
                Tap for Sound
              </button>
            ) : null}

            <MirrorMediaLayer isDirectVideo={isDirectVideo} slide={slide} mainImage={mainImage} position="one" />
            <MirrorMediaLayer isDirectVideo={isDirectVideo} slide={slide} mainImage={mainImage} position="two" />
          </div>

          <div className="luxury-hero-bubbles">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <button
          type="button"
          className="luxury-hero-arrow luxury-hero-arrow-left"
          onClick={goToPrevSlide}
        >
          <ChevronLeft size={28} />
        </button>

        <button
          type="button"
          className="luxury-hero-arrow luxury-hero-arrow-right"
          onClick={goToNextSlide}
        >
          <ChevronRight size={28} />
        </button>

        <div className="luxury-hero-dots">
          {slides.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => goToSlide(index)}
              className={index === activeSlide ? 'active' : ''}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DealShowcaseMiniProduct({ product, badge }) {
  const numericPrice = Number(product?.price || product?.min_price || 0);
  const oldPrice = numericPrice ? numericPrice * 2.3 : 0;

  return (
    <Link to={resolveReadMoreUrl(product)} className="deal-showcase-product-card">
      <span className="deal-showcase-product-image-wrap">
        <img src={product?.product_image} alt={product?.title || 'Product'} />
      </span>

      <span className="deal-showcase-product-title">{product?.title || 'Product'}</span>

      <span className="deal-showcase-price-row">
        <strong>{renderPrice(product)}</strong>
        {oldPrice ? (
          <del>
            <LocalizedPrice amount={oldPrice} />
          </del>
        ) : null}
      </span>

      {badge ? <span className="deal-showcase-badge">{badge}</span> : null}
    </Link>
  );
}

function DealShowcaseSection({ products }) {
  const items = ensureProducts(products, 6, 'deal-showcase', 'Deal Product');
  const bundleProducts = items.slice(0, 3);
  const superDealProducts = items.slice(3, 6);

  return (
    <section className="deal-showcase-section">
      <h2 className="deal-showcase-main-title">Today&apos;s deals</h2>

      <div className="deal-showcase-grid">
        <div className="deal-showcase-panel">
          <div className="deal-showcase-panel-head">
            <h3>Bundle deals</h3>

            <Link to="/products" className="deal-showcase-pill deal-showcase-pill-yellow">
              <span className="deal-showcase-bag-icon">▣</span>
              3 from <LocalizedPrice amount={1.99} />
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="deal-showcase-products">
            {bundleProducts.map((product, index) => (
              <DealShowcaseMiniProduct
                key={product._renderId || product.id || index}
                product={product}
                badge="New shoppers only"
              />
            ))}
          </div>
        </div>

        <div className="deal-showcase-panel">
          <div className="deal-showcase-panel-head">
            <h3>SuperDeals</h3>

            <Link to="/products" className="deal-showcase-pill deal-showcase-pill-red">
              <span className="deal-showcase-clock-icon">●</span>
              Ends in: 16:23:08
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="deal-showcase-products">
            {superDealProducts.map((product, index) => (
              <DealShowcaseMiniProduct
                key={product._renderId || product.id || index}
                product={product}
                badge={index === 0 ? '-34%' : index === 1 ? '-57%' : '-72%'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WidePromoSection({ products }) {
  const items = ensureProducts(products, 3, 'wide-promo', 'Promo Product');

  return (
    <section className="wide-promo-section">
      {items.map((product, index) => (
        <div key={product._renderId || product.id || index} className={`wide-promo-card wide-promo-card-${index + 1}`}>
          <div className="wide-promo-copy">
            <div className="wide-promo-kicker">{index === 0 ? 'Top review' : index === 1 ? 'Trending' : 'Popular'}</div>
            <div className="wide-promo-title">{product?.title || 'Featured Product'}</div>
            <div className="wide-promo-price">{renderPrice(product)}</div>

            <div className="wide-promo-actions">
              <Link to={resolveReadMoreUrl(product)}>Read More</Link>
              <a href={resolveBuyNowUrl(product)} target="_blank" rel="noreferrer">
                Buy Now
              </a>
            </div>
          </div>

          <img src={product?.product_image} alt={product?.title || 'Product'} className="wide-promo-img" />
        </div>
      ))}
    </section>
  );
}

function ShopByCategory({ categoryTree, products }) {
  if (!categoryTree.length) return null;

  return (
    <section className="shop-category-section">
      <div className="home-section-title-row">
        <h2 className="home-section-title">Shop by category</h2>
        <Link to="/products" className="home-section-view-all">
          View all
        </Link>
      </div>

      <div className="shop-category-grid">
        {categoryTree.slice(0, 6).map((category, index) => {
          const Icon = getCategoryIcon(category.name);
          const previewProduct = products[index % products.length] || createDummyProduct('category', index);

          return (
            <Link
              key={`${category.name}-shop-${index}`}
              to={category.slug ? `/category/${category.slug}` : '#'}
              className="shop-category-card"
            >
              <span className="shop-category-image-wrap">
                <img src={previewProduct?.product_image} alt={category.name} />
              </span>

              <span className="shop-category-content">
                <span className="shop-category-icon">
                  <Icon size={16} />
                </span>

                <span className="shop-category-name">{category.name}</span>

                <span className="shop-category-sub">
                  {(category.children || []).slice(0, 2).map((item) => item.name).join(' • ')}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
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
}) {
  if (!product) return null;

  const safeProductScore = resolveProductScore(product);
  const visitCount = formatCompactCount(resolveVisitCount(product));

  return (
    <>
      <div onClick={onClose} className="home-modal-backdrop" />

      <div className="home-modal">
        <div className="home-modal-header">
          <div className="home-modal-label">Product Quick View</div>

          <button type="button" onClick={onClose} className="home-modal-close">
            <X size={18} />
          </button>
        </div>

        <div className="home-quick-view-grid">
          <div className="home-quick-view-image-side">
            <div className="home-quick-view-image-card">
              <img
                src={product?.product_image || ''}
                alt={product?.title || 'Product'}
                className="home-quick-view-image"
              />

              <div className="home-quick-view-verified">
                <CheckCircle2 size={14} />
                Verified
              </div>
            </div>
          </div>

          <div className="home-quick-view-content">
            <div className="home-quick-view-title-row">
              <div>
                <div className="home-quick-view-category">{product?.category?.name || 'Marketplace Product'}</div>
                <h2 className="home-quick-view-title">{product?.title || 'Product'}</h2>
              </div>

              <div className="home-quick-view-icons">
                <button
                  type="button"
                  onClick={onToggleSave}
                  className={isSaved ? 'home-modal-icon active' : 'home-modal-icon'}
                >
                  <Heart size={18} fill={isSaved ? '#e11d48' : 'none'} />
                </button>

                <button type="button" onClick={onShare} className="home-modal-icon">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="home-quick-view-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} fill="#f59e0b" strokeWidth={1.5} />
              ))}
              <span>{safeProductScore}</span>
              <span>{visitCount} Visits</span>
            </div>

            <div className="home-quick-info-grid">
              <div className="home-quick-info-card">
                <div className="home-quick-info-label">Website</div>
                <div className="home-quick-info-value">{product?.affiliate?.website_name || 'Website'}</div>
              </div>

              <div className="home-quick-info-card">
                <div className="home-quick-info-label">Price</div>
                <div className="home-quick-info-price">{renderPrice(product)}</div>
              </div>
            </div>

            <div className="home-quick-description">
              <div className="home-quick-info-label">Short Description</div>
              <div className="home-quick-description-text">
                {product?.short_description || 'No description available.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTrackedAction('visit_website')}
              disabled={actionLoading}
              className="home-quick-visit-btn"
            >
              {actionLoading ? 'Please wait...' : 'Visit Website'}
            </button>

            <div className="home-quick-actions">
              <button
                type="button"
                onClick={() => onTrackedAction('read_more')}
                disabled={actionLoading}
                className="home-quick-read-btn"
              >
                {actionLoading ? 'Please wait...' : product?.storefront_cta_label || 'Read More'}
              </button>

              <button
                type="button"
                onClick={() => onTrackedAction('buy_now')}
                disabled={actionLoading}
                className="home-quick-buy-btn"
              >
                {actionLoading ? 'Please wait...' : product?.homepage_cta_label || 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, onQuickView, onTrackedAction }) {
  const readMoreUrl = resolveReadMoreUrl(product);
  const buyNowUrl = resolveBuyNowUrl(product);
  const safeProductScore = resolveProductScore(product);
  const visitCount = formatCompactCount(resolveVisitCount(product));

  return (
    <div className="home-product-card">
      <button
        type="button"
        onClick={() => onQuickView(product)}
        className="home-product-save-btn"
        aria-label="Quick view product"
      >
        <Heart size={13} />
      </button>

      <button type="button" onClick={() => onQuickView(product)} className="home-product-image-button">
        <span className="home-product-image-wrap">
          <img src={product?.product_image} alt={product?.title || 'Product'} className="home-product-image" />
        </span>
      </button>

      <div className="home-product-content">
        <button type="button" onClick={() => onQuickView(product)} className="home-product-title-button">
          {product?.title || 'Product'}
        </button>

        <div className="home-product-stats-row">
          <div className="home-product-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} fill="#ffb300" strokeWidth={1.5} />
            ))}
            <span>{safeProductScore}</span>
          </div>

          <div className="home-product-visit-stat" title="Visit count">
            <Eye size={12} />
            <span>Visits</span>
            <strong>{visitCount}</strong>
          </div>
        </div>

        <div className="home-product-price">{renderPrice(product)}</div>

        <div className="home-product-actions">
          <button
            type="button"
            onClick={() => onTrackedAction(product, 'read_more', readMoreUrl)}
            className="home-product-action-btn home-product-learn-btn"
          >
            {product?.storefront_cta_label || 'Read More'}
          </button>

          <button
            type="button"
            onClick={() => onTrackedAction(product, 'buy_now', buyNowUrl)}
            className="home-product-action-btn home-product-buy-btn"
          >
            {product?.homepage_cta_label || 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MoreLovePromoBanners() {
  return (
    <section className="more-love-promo-banners">
      <Link to="/products" className="more-love-promo-card">
        <img
          src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=1200&q=80"
          alt="Mega discount product"
          className="more-love-promo-image"
        />

        <span className="more-love-promo-overlay" />

        <span className="more-love-promo-content">
          <span className="more-love-promo-kicker">Mega Discount</span>
          <span className="more-love-promo-title">Trending Smart Picks For The Season</span>
          <span className="more-love-promo-btn">Shop Now</span>
        </span>
      </Link>

      <Link to="/products" className="more-love-promo-card">
        <img
          src="https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=1200&q=80"
          alt="Weekend sale product"
          className="more-love-promo-image"
        />

        <span className="more-love-promo-overlay" />

        <span className="more-love-promo-content">
          <span className="more-love-promo-kicker">Weekend Sale</span>
          <span className="more-love-promo-title">Best Seller Deals For Homes</span>
          <span className="more-love-promo-btn">Shop Now</span>
        </span>
      </Link>
    </section>
  );
}

function FeaturedCategoriesCircleSection({ categoryTree }) {
  const realCategories = Array.isArray(categoryTree)
    ? categoryTree.filter((category) => category && category.name).slice(0, 10)
    : [];

  const imagePool = [
    'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=700&q=80',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
  ];

  if (!realCategories.length) return null;

  return (
    <section className="featured-circle-section">
      <div className="featured-circle-head">
        <h2>Featured Categories</h2>
        <p>Lots of fresh products and product collections</p>
      </div>

      <div className="featured-circle-grid">
        {realCategories.map((category, index) => (
          <Link
            key={`${category.name}-${index}`}
            to={category.slug ? `/category/${category.slug}` : '/products'}
            className="featured-circle-card"
          >
            <span className="featured-circle-image-wrap">
              <img src={imagePool[index % imagePool.length]} alt={category.name} />
            </span>

            <span className="featured-circle-label">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductGridSection({ title, products, onQuickView, onTrackedAction, categoryTree }) {
  const firstTwoRows = products.slice(0, 12);
  const nextRowAfterPromo = products.slice(12, 18);
  const remainingProducts = products.slice(18);

  return (
    <section className="home-product-section">
      <div className="more-love-title-wrap">
        <h2>{title}</h2>
      </div>

      <div className="home-product-grid-4">
        {firstTwoRows.map((product, index) => (
          <ProductCard
            key={product._renderId || product.id || index}
            product={product}
            onQuickView={onQuickView}
            onTrackedAction={onTrackedAction}
          />
        ))}
      </div>

      <MoreLovePromoBanners />

      <div className="home-product-grid-4">
        {nextRowAfterPromo.map((product, index) => (
          <ProductCard
            key={product._renderId || product.id || `more-love-after-promo-row-${index}`}
            product={product}
            onQuickView={onQuickView}
            onTrackedAction={onTrackedAction}
          />
        ))}
      </div>

      <FeaturedCategoriesCircleSection categoryTree={categoryTree} />

      <div className="home-product-grid-4">
        {remainingProducts.map((product, index) => (
          <ProductCard
            key={product._renderId || product.id || `more-love-after-featured-categories-${index}`}
            product={product}
            onQuickView={onQuickView}
            onTrackedAction={onTrackedAction}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  const [pageData, setPageData] = useState(null);
  const [featuredProductAds, setFeaturedProductAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [savedProducts, setSavedProducts] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/api/public/home');
        setPageData(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load homepage');
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  useEffect(() => {
    const fetchFeaturedProductAds = async () => {
      try {
        const { data } = await api.get('/api/public/affiliate-ads', {
          params: {
            ad_type: 'product',
            placement_key: 'homepage_featured_product',
            limit: 6,
          },
        });

        setFeaturedProductAds(Array.isArray(data?.ads) ? data.ads : []);
      } catch (err) {
        setFeaturedProductAds([]);
      }
    };

    fetchFeaturedProductAds();
  }, []);

  const categories = pageData?.categories || [];
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const products = pageData?.products || [];
  const featuredWebsites = useMemo(() => buildFeaturedWebsites(pageData), [pageData]);

  const promoProducts = useMemo(() => ensureProducts(products, 8, 'promo', 'Promo Product'), [products]);
  const todayDeals = useMemo(() => ensureProducts(products, 6, 'today', 'Today Deal'), [products]);
  const categoryProducts = useMemo(() => ensureProducts(products, 8, 'category', 'Category Product'), [products]);
  const moreToLoveProducts = useMemo(() => ensureProducts(products, 96, 'more-love', 'More Product'), [products]);

  const updateProductStats = useCallback((product, data) => {
    if (!product?.id || !data) return;

    setPageData((prev) => {
      if (!prev) return prev;

      const updatedProducts = Array.isArray(prev.products)
        ? prev.products.map((item) => (item?.id === product.id ? mergeProductVisitStats(item, data) : item))
        : prev.products;

      return {
        ...prev,
        products: updatedProducts,
      };
    });

    setQuickViewProduct((prev) => {
      if (!prev?.id || prev.id !== product.id) return prev;
      return mergeProductVisitStats(prev, data);
    });
  }, []);

  const trackProductEvent = useCallback(
    async (product, clickType) => {
      const endpoint = resolveTrackingEndpoint(product);
      if (!endpoint) return null;

      try {
        const { data } = await api.post(endpoint, {
          click_type: clickType,
        });

        updateProductStats(product, data);
        return data || null;
      } catch (err) {
        return null;
      }
    },
    [updateProductStats]
  );

  const handleQuickViewOpen = useCallback(
    async (product) => {
      if (!product) return;

      setQuickViewProduct(product);
      await trackProductEvent(product, 'quick_view');
    },
    [trackProductEvent]
  );

  const handleTrackedProductAction = useCallback(
    async (product, clickType, fallbackUrl = '#') => {
      if (!product) return;

      const data = await trackProductEvent(product, clickType);
      const targetUrl = data?.redirect_url || fallbackUrl;

      if (targetUrl && targetUrl !== '#') {
        window.location.href = targetUrl;
      }
    },
    [trackProductEvent]
  );

  const handleTrackedPopupAction = async (clickType) => {
    if (!quickViewProduct) return;

    const fallbackUrl =
      clickType === 'buy_now'
        ? resolveBuyNowUrl(quickViewProduct)
        : clickType === 'visit_website'
        ? resolveVisitWebsiteUrl(quickViewProduct)
        : resolveReadMoreUrl(quickViewProduct);

    try {
      setActionLoading(true);

      const data = await trackProductEvent(quickViewProduct, clickType);
      const targetUrl = data?.redirect_url || fallbackUrl;

      if (targetUrl && targetUrl !== '#') {
        window.location.href = targetUrl;
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = () => {
    if (!quickViewProduct?.id) return;

    setSavedProducts((prev) => ({
      ...prev,
      [quickViewProduct.id]: !prev[quickViewProduct.id],
    }));
  };

  const handleShare = async () => {
    if (!quickViewProduct) return;

    const shareUrl = resolveReadMoreUrl(quickViewProduct);
    const shareTitle = quickViewProduct?.title || 'Product';

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (err) {
      // ignore
    }
  };

  const handleSearch = () => {
    const query = searchTerm.trim();
    if (!query) return;
    window.location.href = `/products?search=${encodeURIComponent(query)}`;
  };

  if (loading) {
    return (
      <div className="home-loading-screen">
        <div className="home-loading-box">
          <Loader2 size={18} className="spin-soft" />
          <span>Loading homepage...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="ali-main-header">
        <div className="ali-header-shell">
          <Link to="/" className="home-logo-link">
            <span className="home-logo-mark">B</span>
            <span className="home-logo-text">
              bloggad<span>.</span>
            </span>
          </Link>

          <div className="home-search-wrap">
            <input
              type="text"
              placeholder="Search products, reviews, stores..."
              className="home-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
            />
            <button type="button" className="home-search-btn" onClick={handleSearch}>
              <Search size={24} />
            </button>
          </div>

          <div className="ali-header-actions">
            <div className="ali-language-btn ali-currency-switcher-wrap">
              <Globe2 size={23} />
              <CurrencySwitcher />
              <ChevronDown size={14} />
            </div>

            <HeaderAccountBox user={user} isAuthenticated={isAuthenticated} logout={logout} />
          </div>
        </div>

        <div className="ali-mobile-header">
          <Link to="/" className="mobile-home-logo">
            <span className="home-logo-mark">B</span>
            <span className="home-logo-text">
              bloggad<span>.</span>
            </span>
          </Link>

          <div className="mobile-search-wrap">
            <input
              type="text"
              placeholder="Search products..."
              className="mobile-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
            />
            <button type="button" className="mobile-search-btn" onClick={handleSearch}>
              <Search size={18} />
            </button>
          </div>

          <CategoriesButton categoryTree={categoryTree} featuredWebsites={featuredWebsites} />

          <div className="mobile-home-auth-wrap">
            {isAuthenticated && user ? (
              <div className="mobile-logged-auth-box">
                <Link to={resolveDashboardUrl(user)} className="home-auth-pill home-auth-pill-red">
                  Go to Dashboard
                </Link>

                <button type="button" onClick={logout} className="home-auth-pill home-auth-pill-white">
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <div className="mobile-home-auth-title">Join or sign in</div>
                <AuthLinksPills />
              </>
            )}
          </div>
        </div>

        <HeaderNav categoryTree={categoryTree} featuredWebsites={featuredWebsites} />
      </header>

      {error ? (
        <div className="homepage-shell">
          <div className="home-error-box">{error}</div>
        </div>
      ) : null}

      <MainSlider />

      <main className="homepage-shell">
        <DealShowcaseSection products={todayDeals} />
        <FeaturedProductAdsStrip ads={featuredProductAds} />
        <WidePromoSection products={promoProducts} />
        <ShopByCategory categoryTree={categoryTree} products={categoryProducts} />

        <ProductGridSection
          title="More to love"
          products={moreToLoveProducts}
          onQuickView={handleQuickViewOpen}
          onTrackedAction={handleTrackedProductAction}
          categoryTree={categoryTree}
        />
      </main>

      <LegalFooter />

      <ProductQuickViewModal
        product={quickViewProduct}
        isSaved={!!savedProducts[quickViewProduct?.id]}
        actionLoading={actionLoading}
        onClose={() => setQuickViewProduct(null)}
        onToggleSave={handleToggleSave}
        onShare={handleShare}
        onTrackedAction={handleTrackedPopupAction}
      />
    </div>
  );
}