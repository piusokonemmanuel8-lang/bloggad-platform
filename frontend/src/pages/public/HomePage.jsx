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
  Laptop,
  Loader2,
  Menu,
  Search,
  Share2,
  Smartphone,
  Star,
  Tv,
  User,
  WashingMachine,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';
import './HomePage.css';

function renderPrice(product) {
  if (product?.pricing_type === 'simple') {
    return product?.price !== null && product?.price !== undefined
      ? formatCurrency(product.price)
      : '$0.00';
  }

  return `${formatCurrency(product?.min_price || 0)} - ${formatCurrency(product?.max_price || 0)}`;
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

function formatCompactCount(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number) || number <= 0) return '0';

  if (number >= 1000000) {
    const formatted = number / 1000000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}m`;
  }

  if (number >= 1000) {
    const formatted = number / 1000;
    return `${formatted % 1 === 0 ? formatted.toFixed(0) : formatted.toFixed(1)}k`;
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
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80',
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

function buildFeaturedWebsites(pageData, products = []) {
  const directWebsites =
    pageData?.featured_websites ||
    pageData?.featuredWebsites ||
    pageData?.websites ||
    pageData?.stores ||
    [];

  const fromDirect = Array.isArray(directWebsites) ? directWebsites : [];

  const fromProducts = Array.isArray(products)
    ? products
        .map((product) => ({
          id: product?.affiliate?.id || product?.website_id || product?.affiliate_id || product?.id,
          name:
            product?.affiliate?.website_name ||
            product?.affiliate?.name ||
            product?.website_name ||
            product?.store_name,
          slug:
            product?.website_slug ||
            product?.affiliate?.website_slug ||
            product?.affiliate?.website?.slug ||
            product?.store_slug,
        }))
        .filter((store) => resolveStoreName(store) && resolveStoreSlug(store))
    : [];

  const merged = [...fromDirect, ...fromProducts];
  const seen = new Set();

  return merged
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

function CategoriesButton({ categoryTree, featuredWebsites }) {
  const [open, setOpen] = useState(false);
  const safeCategories = Array.isArray(categoryTree) ? categoryTree : [];
  const safeWebsites = Array.isArray(featuredWebsites) ? featuredWebsites : [];

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
                <div className="amazon-category-group-title">Featured Websites</div>

                {safeWebsites.length ? (
                  safeWebsites.map((store, index) => (
                    <Link
                      key={`${resolveStoreName(store)}-${index}`}
                      to={resolveStoreUrl(store)}
                      onClick={() => setOpen(false)}
                      className="amazon-category-main"
                    >
                      <span>{resolveStoreName(store)}</span>
                      <ChevronRight size={20} />
                    </Link>
                  ))
                ) : (
                  <div className="amazon-category-empty">No featured websites found yet.</div>
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

function MainSlider({ products }) {
  const slides = useMemo(() => ensureProducts(products, 4, 'slider', 'Featured Product'), [products]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <section className="main-slider-card">
      <div className="main-slider-bg">
        <div className="main-slider-inner">
          <div className="main-slider-copy">
            <div className="main-slider-sale">
              Sale Ends in:
              <span>16</span>:
              <span>46</span>:
              <span>51</span>
            </div>

            <h1 className="main-slider-title">{current?.title || 'Featured Product'}</h1>

            <div className="main-slider-subtitle">
              {current?.short_description || 'Discover products reviewed and promoted by real affiliates.'}
            </div>

            <div className="main-slider-coupon-row">
              <div className="coupon-card">
                <strong>$24 OFF</strong>
                <span>orders $209+</span>
              </div>
              <div className="coupon-card">
                <strong>$10 OFF</strong>
                <span>orders $99+</span>
              </div>
              <div className="coupon-card">
                <strong>$7 OFF</strong>
                <span>orders $65+</span>
              </div>
            </div>

            <div className="main-slider-actions">
              <Link to={resolveReadMoreUrl(current)} className="main-slider-learn-btn">
                Read More
              </Link>

              <a href={resolveBuyNowUrl(current)} target="_blank" rel="noreferrer" className="main-slider-buy-btn">
                Buy Now
              </a>
            </div>
          </div>

          <div className="main-slider-product-deal">
            <div className="main-slider-lifestyle-frame">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80"
                alt="Bloggad shopping marketplace"
                className="main-slider-lifestyle-image"
              />

              <div className="main-slider-floating-product">
                <img
                  src={current?.product_image}
                  alt={current?.title || 'Featured Product'}
                  className="main-slider-image"
                />
              </div>
            </div>

            <div className="main-slider-deal-box">
              <span>Bestsellers</span>
              <strong>{renderPrice(current)}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="main-slider-nav main-slider-nav-left"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
          className="main-slider-nav main-slider-nav-right"
        >
          <ChevronRight size={20} />
        </button>

        <div className="main-slider-tabs">
          {slides.map((slide, index) => (
            <button
              key={slide._renderId || slide.id || index}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={index === activeSlide ? 'main-slider-tab active' : 'main-slider-tab'}
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
        {oldPrice ? <del>{formatCurrency(oldPrice)}</del> : null}
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
              3 from $1.99
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

function TodayDealsStrip({ products }) {
  const items = ensureProducts(products, 6, 'today-strip', 'Today Deal');

  return (
    <section className="today-deals-section">
      <div className="today-deals-head">
        <h2>Today’s deals</h2>
        <Link to="/products">View all</Link>
      </div>

      <div className="today-deals-grid">
        {items.map((product, index) => (
          <Link
            key={product._renderId || product.id || index}
            to={resolveReadMoreUrl(product)}
            className="today-deal-card"
          >
            <span className="today-deal-img-wrap">
              <img src={product?.product_image} alt={product?.title || 'Product'} />
            </span>
            <span className="today-deal-title">{product?.title || 'Product'}</span>
            <span className="today-deal-price">{renderPrice(product)}</span>
          </Link>
        ))}
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
              <span>Premium pick</span>
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

function ProductCard({ product, onQuickView, onImpression }) {
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
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [product, onImpression]);

  const readMoreUrl = resolveReadMoreUrl(product);
  const buyNowUrl = resolveBuyNowUrl(product);
  const ratingNumber = Number(product?.id || 8) % 10;
  const visitCount = formatCompactCount(resolveVisitCount(product));

  return (
    <div ref={cardRef} className="home-product-card">
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
            <span>4.{ratingNumber || 8}</span>
          </div>

          <div className="home-product-visit-stat" title="Visit count">
            <Eye size={12} />
            <span>Visits</span>
            <strong>{visitCount}</strong>
          </div>
        </div>

        <div className="home-product-price">{renderPrice(product)}</div>

        <div className="home-product-actions">
          <Link to={readMoreUrl} className="home-product-action-btn home-product-learn-btn">
            {product?.storefront_cta_label || 'Read More'}
          </Link>

          <a href={buyNowUrl} target="_blank" rel="noreferrer" className="home-product-action-btn home-product-buy-btn">
            {product?.homepage_cta_label || 'Buy Now'}
          </a>
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

function ProductGridSection({ title, products, onQuickView, onImpression, categoryTree }) {
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
            onImpression={onImpression}
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
            onImpression={onImpression}
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
            onImpression={onImpression}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [savedProducts, setSavedProducts] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const trackedImpressionsRef = useRef(new Set());
  const trackedQuickViewsRef = useRef(new Set());

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

  const categories = pageData?.categories || [];
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const products = pageData?.products || [];
  const featuredWebsites = useMemo(() => buildFeaturedWebsites(pageData, products), [pageData, products]);

  const promoProducts = useMemo(() => ensureProducts(products, 8, 'promo', 'Promo Product'), [products]);
  const todayDeals = useMemo(() => ensureProducts(products, 6, 'today', 'Today Deal'), [products]);
  const categoryProducts = useMemo(() => ensureProducts(products, 8, 'category', 'Category Product'), [products]);
  const moreToLoveProducts = useMemo(() => ensureProducts(products, 96, 'more-love', 'More Product'), [products]);

  const trackProductEvent = useCallback(async (product, clickType) => {
    const endpoint = resolveTrackingEndpoint(product);
    if (!endpoint) return null;

    try {
      const { data } = await api.post(endpoint, {
        click_type: clickType,
      });
      return data || null;
    } catch (err) {
      return null;
    }
  }, []);

  const handleImpression = useCallback(
    async (product) => {
      if (!product?.id || trackedImpressionsRef.current.has(product.id)) return;
      trackedImpressionsRef.current.add(product.id);
      await trackProductEvent(product, 'impression');
    },
    [trackProductEvent]
  );

  useEffect(() => {
    const trackQuickView = async () => {
      if (!quickViewProduct?.id) return;
      if (trackedQuickViewsRef.current.has(quickViewProduct.id)) return;

      trackedQuickViewsRef.current.add(quickViewProduct.id);
      await trackProductEvent(quickViewProduct, 'quick_view');
    };

    trackQuickView();
  }, [quickViewProduct, trackProductEvent]);

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

  const handleToggleSave = async () => {
    if (!quickViewProduct?.id) return;

    setSavedProducts((prev) => ({
      ...prev,
      [quickViewProduct.id]: !prev[quickViewProduct.id],
    }));

    await trackProductEvent(quickViewProduct, 'save');
  };

  const handleShare = async () => {
    if (!quickViewProduct) return;

    const shareUrl = resolveReadMoreUrl(quickViewProduct);
    const shareTitle = quickViewProduct?.title || 'Product';

    await trackProductEvent(quickViewProduct, 'share');

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
            <button type="button" className="ali-language-btn">
              <Globe2 size={23} />
              <span>EN/USD</span>
              <ChevronDown size={14} />
            </button>

            <Link to="/login" className="ali-user-link">
              <User size={28} />
              <span>
                Welcome
                <br />
                <strong>Sign in / Register</strong>
              </span>
            </Link>
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
            <div className="mobile-home-auth-title">Join or sign in</div>
            <AuthLinksPills />
          </div>
        </div>

        <HeaderNav categoryTree={categoryTree} featuredWebsites={featuredWebsites} />
      </header>

      {error ? (
        <div className="homepage-shell">
          <div className="home-error-box">{error}</div>
        </div>
      ) : null}

      <MainSlider products={promoProducts} />

      <main className="homepage-shell">
        <DealShowcaseSection products={todayDeals} />

        <TodayDealsStrip products={todayDeals} />

        <WidePromoSection products={promoProducts} />

        <ShopByCategory categoryTree={categoryTree} products={categoryProducts} />

        <ProductGridSection
          title="More to love"
          products={moreToLoveProducts}
          onQuickView={setQuickViewProduct}
          onImpression={handleImpression}
          categoryTree={categoryTree}
        />
      </main>

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