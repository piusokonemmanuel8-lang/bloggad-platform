import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Menu,
  Search,
  ShoppingCart,
  Star,
  User,
  Scale,
  Smartphone,
  Laptop,
  Cpu,
  Gamepad2,
  WashingMachine,
  Tv,
  Home,
  Camera,
  X,
  Share2,
} from 'lucide-react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function getNumericPrice(product) {
  if (product?.pricing_type === 'simple') {
    return Number(product?.price || 0);
  }

  return Number(product?.min_price || 0);
}

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
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1400&q=80',
  ];

  return {
    id: `dummy-${seed}-${index}`,
    _renderId: `dummy-${seed}-${index}`,
    title: `Product ${index + 1}`,
    short_description: 'Premium product card ready for your real homepage products.',
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    affiliate_buy_url: '#',
    slug: `product-${seed}-${index + 1}`,
    pricing_type: 'simple',
    price: 12000 + index * 7000,
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
  const fallback = [
    {
      name: 'Smartphones',
      slug: '#',
      children: [
        { name: 'Android Phones', slug: '#' },
        { name: 'iPhones', slug: '#' },
        { name: 'Accessories', slug: '#' },
      ],
    },
    {
      name: 'Laptops, Tablets & PCs',
      slug: '#',
      children: [
        { name: 'Laptops', slug: '#' },
        { name: 'Tablets', slug: '#' },
        { name: 'Accessories', slug: '#' },
      ],
    },
    {
      name: 'PC Components',
      slug: '#',
      children: [
        { name: 'Processors', slug: '#' },
        { name: 'Graphics Cards', slug: '#' },
        { name: 'SSD Storage', slug: '#' },
      ],
    },
    {
      name: 'Gaming',
      slug: '#',
      children: [
        { name: 'Consoles', slug: '#' },
        { name: 'Gamepads', slug: '#' },
        { name: 'VR Headsets', slug: '#' },
      ],
    },
    {
      name: 'Appliances',
      slug: '#',
      children: [
        { name: 'Kitchen', slug: '#' },
        { name: 'Laundry', slug: '#' },
        { name: 'Cleaning', slug: '#' },
      ],
    },
    {
      name: 'TV & Audio',
      slug: '#',
      children: [
        { name: 'Televisions', slug: '#' },
        { name: 'Speakers', slug: '#' },
        { name: 'Headphones', slug: '#' },
      ],
    },
    {
      name: 'Home & Outdoor',
      slug: '#',
      children: [
        { name: 'Lighting', slug: '#' },
        { name: 'Security', slug: '#' },
        { name: 'Garden', slug: '#' },
      ],
    },
    {
      name: 'Cameras',
      slug: '#',
      children: [
        { name: 'Mirrorless', slug: '#' },
        { name: 'Lenses', slug: '#' },
        { name: 'Accessories', slug: '#' },
      ],
    },
  ];

  if (!Array.isArray(categories) || !categories.length) return fallback;

  return categories.slice(0, 8).map((category) => ({
    ...category,
    children:
      Array.isArray(category.children) && category.children.length
        ? category.children.slice(0, 8)
        : [
            { name: `${category.name} Items`, slug: '#' },
            { name: `${category.name} Deals`, slug: '#' },
            { name: `${category.name} Accessories`, slug: '#' },
          ],
  }));
}

function TopLink({ children, href = '#' }) {
  return (
    <a
      href={href}
      style={{
        color: '#6f6a65',
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}

function HeaderIcon({ children, count }) {
  return (
    <button
      type="button"
      style={{
        position: 'relative',
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1px solid #e6dfd9',
        background: '#fff',
        color: '#222',
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
            background: '#f3eeff',
            border: '1px solid #e7dcff',
            color: '#6a48ff',
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

function MobileCategoryPanel({ open, onClose, categoryTree }) {
  if (!open) return null;

  return (
    <div
      className="mobile-category-overlay"
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
          <div style={{ fontSize: 18, fontWeight: 800, color: '#232323' }}>Categories</div>
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
              <div
                key={`${category.name}-mobile-${index}`}
                style={{
                  border: '1px solid #eee7e1',
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <Link
                  to={category.slug ? `/category/${category.slug}` : '#'}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    color: '#232323',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 16,
                    marginBottom: category.children?.length ? 12 : 0,
                  }}
                >
                  <Icon size={18} />
                  <span>{category.name}</span>
                </Link>

                {category.children?.length ? (
                  <div style={{ display: 'grid', gap: 10, paddingLeft: 30 }}>
                    {category.children.slice(0, 6).map((child, childIndex) => (
                      <Link
                        key={`${child.name}-${childIndex}`}
                        to={child.slug ? `/category/${child.slug}` : '#'}
                        onClick={onClose}
                        style={{
                          color: '#6d6761',
                          textDecoration: 'none',
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {child.name}
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

function CategoriesButton({ categoryTree }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="desktop-categories-button"
        style={{ position: 'relative' }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          style={{
            height: 52,
            borderRadius: 999,
            border: 'none',
            background: '#1f1f1f',
            color: '#fff',
            padding: '0 22px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Menu size={18} />
          Categories
          <ChevronDown size={16} />
        </button>

        {open ? (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              left: 0,
              width: 720,
              background: '#fff',
              border: '1px solid #ece5df',
              borderRadius: 24,
              boxShadow: '0 30px 70px rgba(0,0,0,0.12)',
              padding: 18,
              zIndex: 60,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '260px 1fr',
                gap: 18,
              }}
            >
              <div
                style={{
                  borderRight: '1px solid #eee7e2',
                  paddingRight: 12,
                  display: 'grid',
                  gap: 4,
                }}
              >
                {categoryTree.map((category, index) => {
                  const Icon = getCategoryIcon(category.name);
                  return (
                    <Link
                      key={`${category.name}-${index}`}
                      to={category.slug ? `/category/${category.slug}` : '#'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        color: '#232323',
                        textDecoration: 'none',
                        padding: '12px 10px',
                        borderRadius: 14,
                        fontWeight: 600,
                      }}
                    >
                      <Icon size={18} />
                      <span>{category.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 18,
                }}
              >
                {categoryTree.slice(0, 4).map((category, index) => (
                  <div key={`${category.name}-sub-${index}`}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: '#232323',
                        marginBottom: 12,
                      }}
                    >
                      {category.name}
                    </div>

                    <div style={{ display: 'grid', gap: 10 }}>
                      {(category.children || []).slice(0, 6).map((child, childIndex) => (
                        <Link
                          key={`${category.name}-${child.name}-${childIndex}`}
                          to={child.slug ? `/category/${child.slug}` : '#'}
                          style={{
                            color: '#6d6761',
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="mobile-categories-pill"
        onClick={() => setOpen(true)}
        style={{
          display: 'none',
          width: '100%',
          height: 50,
          borderRadius: 999,
          border: 'none',
          background: '#1f1f1f',
          color: '#fff',
          padding: '0 18px',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        <Menu size={18} />
        Categories
      </button>

      <MobileCategoryPanel open={open} onClose={() => setOpen(false)} categoryTree={categoryTree} />
    </>
  );
}

function CategoryMenu({ categoryTree }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <aside
      className="desktop-left-category-card"
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: 18,
        minHeight: 628,
        position: 'relative',
      }}
    >
      <div style={{ display: 'grid', gap: 6 }}>
        {categoryTree.map((category, index) => {
          const Icon = getCategoryIcon(category.name);

          return (
            <div
              key={`${category.name}-${index}`}
              style={{ position: 'relative' }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <Link
                to={category.slug ? `/category/${category.slug}` : '#'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  color: '#222',
                  textDecoration: 'none',
                  fontSize: 18,
                  fontWeight: 600,
                  padding: '12px 10px',
                  borderRadius: 14,
                }}
              >
                <span
                  style={{
                    width: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b5563',
                  }}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span>{category.name}</span>
              </Link>
            </div>
          );
        })}

        <button
          type="button"
          style={{
            marginTop: 8,
            width: 'fit-content',
            border: 'none',
            background: '#101010',
            color: '#fff',
            borderRadius: 999,
            padding: '12px 20px',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ⚡ Buy Bloggad
        </button>
      </div>

      {categoryTree[activeIndex]?.children?.length ? (
        <div
          style={{
            position: 'absolute',
            left: 'calc(100% - 4px)',
            top: 18,
            width: 300,
            background: '#fff',
            border: '1px solid #ece5df',
            borderRadius: 22,
            boxShadow: '0 24px 56px rgba(0,0,0,0.12)',
            padding: 18,
            zIndex: 40,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: '#232323',
              marginBottom: 14,
            }}
          >
            {categoryTree[activeIndex].name}
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {categoryTree[activeIndex].children.slice(0, 8).map((child, index) => (
              <Link
                key={`${child.name}-${index}`}
                to={child.slug ? `/category/${child.slug}` : '#'}
                style={{
                  color: '#6d6761',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function MainSlider() {
  const slides = [
    {
      id: 1,
      title: 'Meet the new Surface laptop',
      subtitle: 'Gorgeous at every angle',
      image:
        'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1800&q=80',
      button: 'Buy Now',
      tabs: 'Surface laptop',
    },
    {
      id: 2,
      title: 'Galaxy Fold7 | Flip7',
      subtitle: 'Unlock Ultra capabilities',
      image:
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1800&q=80',
      button: 'Buy Now',
      tabs: 'Galaxy Fold7 | Flip7',
    },
    {
      id: 3,
      title: 'Unwrap mixed reality with Meta Quest 3',
      subtitle: '',
      image:
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1800&q=80',
      button: 'Buy Now',
      tabs: 'Meta Quest 3',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  const current = slides[activeSlide];

  return (
    <div
      className="main-slider-card"
      style={{
        background: '#fff',
        borderRadius: 24,
        minHeight: 628,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          minHeight: 628,
          background:
            'linear-gradient(90deg, rgba(244,236,240,1) 0%, rgba(226,238,250,1) 100%)',
        }}
      >
        <div
          className="main-slider-inner"
          style={{
            position: 'absolute',
            inset: 0,
            padding: '58px 54px 36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 760 }}>
            <h2
              className="main-slider-title"
              style={{
                margin: 0,
                color: '#232323',
                fontWeight: 800,
                lineHeight: 1.1,
                fontSize: 'clamp(42px, 4vw, 62px)',
                letterSpacing: '-0.04em',
              }}
            >
              {current.title}
            </h2>

            {current.subtitle ? (
              <div
                className="main-slider-subtitle"
                style={{
                  marginTop: 18,
                  color: '#7a7a7a',
                  fontSize: 'clamp(24px, 2vw, 34px)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {current.subtitle}
              </div>
            ) : null}

            <a
              href="#"
              style={{
                marginTop: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 128,
                height: 52,
                borderRadius: 999,
                background: '#6246ff',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                textDecoration: 'none',
              }}
            >
              {current.button}
            </a>
          </div>

          <div
            className="main-slider-image-wrap"
            style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              marginTop: 16,
            }}
          >
            <img
              src={current.image}
              alt={current.title}
              className="main-slider-image"
              style={{
                width: '100%',
                maxWidth: 760,
                maxHeight: 360,
                objectFit: 'contain',
              }}
            />
          </div>

          <div
            className="main-slider-tabs"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 34,
              flexWrap: 'wrap',
              marginTop: 14,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  color: index === activeSlide ? '#232323' : '#9a9a9a',
                  fontWeight: 500,
                  fontSize: 16,
                  borderBottom: index === activeSlide ? '2px solid #232323' : '2px solid transparent',
                  paddingBottom: 4,
                }}
              >
                {slide.tabs}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="main-slider-nav main-slider-nav-left"
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.9)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 3,
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
          className="main-slider-nav main-slider-nav-right"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(255,255,255,0.9)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 3,
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function HotDealCard({ product }) {
  return (
    <aside
      className="desktop-hot-deal-card"
      style={{
        background: '#fff',
        borderRadius: 24,
        padding: 18,
        minHeight: 628,
        display: 'flex',
        flexDirection: 'column',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#7447ff', fontSize: 24 }}>💧</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#232323' }}>Hot Deals</div>
        </div>

        <div
          style={{
            borderRadius: 999,
            background: '#6246ff',
            color: '#fff',
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: 'nowrap',
          }}
        >
          255 : 23 : 28 : 02
        </div>
      </div>

      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
          minHeight: 390,
          marginBottom: 22,
          background: '#f3ece8',
        }}
      >
        <img
          src={
            product?.product_image ||
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80'
          }
          alt={product?.title || 'Hot deal'}
          style={{
            width: '100%',
            height: 390,
            objectFit: 'cover',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(0,0,0,0.05))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 20,
          }}
        >
          <div style={{ fontSize: 16, color: '#7e736b', marginBottom: 14 }}>
            {product?.title || 'Audioengine A2+BT'}
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#232323',
              lineHeight: 1.28,
              maxWidth: 280,
              marginBottom: 22,
            }}
          >
            Only today, 25% discount
          </div>

          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 130,
              height: 52,
              borderRadius: 999,
              background: '#fff',
              color: '#232323',
              fontWeight: 700,
              fontSize: 18,
              textDecoration: 'none',
            }}
          >
            Buy Now
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 'auto' }}>
        <img
          src={
            product?.product_image ||
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80'
          }
          alt={product?.title || 'Product'}
          style={{
            width: 60,
            height: 60,
            borderRadius: 10,
            objectFit: 'cover',
            background: '#f3f3f3',
          }}
        />

        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#232323', marginBottom: 8 }}>
            {product?.title || 'Audioengine A2+BT'}
          </div>

          <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginBottom: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={17} fill="#f4b000" strokeWidth={1.5} />
            ))}
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: '#5c45ff' }}>{renderPrice(product)}</div>
        </div>
      </div>
    </aside>
  );
}

function PromoProductMiniCard({ product }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '74px 1fr',
        gap: 18,
        alignItems: 'center',
        border: '1px solid #ddd7d2',
        borderRadius: 24,
        background: '#f8f8f8',
        padding: '18px 20px',
        minHeight: 132,
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={product?.product_image}
          alt={product?.title || 'Product'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      <div>
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.25,
            fontWeight: 600,
            color: '#3a3a3a',
            marginBottom: 10,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginBottom: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={17} fill="#f4b000" strokeWidth={1.5} />
          ))}
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5' }}>{renderPrice(product)}</div>
      </div>
    </div>
  );
}

function MidPromoSection({ products }) {
  const sideProducts = products.slice(0, 6);

  return (
    <section className="home-mid-promo">
      <div
        style={{
          background: '#000',
          borderRadius: 34,
          overflow: 'hidden',
          minHeight: 620,
          position: 'relative',
          padding: '44px 28px 0',
        }}
      >
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            Mi Cordless Screwdriver
          </div>

          <div
            style={{
              color: '#fff',
              fontSize: 'clamp(46px, 5vw, 68px)',
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              marginBottom: 24,
            }}
          >
            AirPods Pro 3
          </div>

          <a
            href="#"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 172,
              height: 56,
              borderRadius: 999,
              background: '#4f35e1',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            Shop Now
          </a>
        </div>

        <div
          style={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            paddingInline: 20,
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1400&q=80"
            alt="AirPods promo"
            style={{
              width: '100%',
              maxWidth: 760,
              maxHeight: 430,
              objectFit: 'contain',
            }}
          />
        </div>
      </div>

      <div className="desktop-promo-side" style={{ display: 'grid', gap: 24 }}>
        <div className="home-mini-product-grid">
          {sideProducts.map((product, index) => (
            <PromoProductMiniCard key={product._renderId || product.id || index} product={product} />
          ))}
        </div>

        <div style={{ color: '#8a7768', fontSize: 17, lineHeight: 1.7 }}>
          <div>*Number of products is limited!</div>
          <div style={{ marginTop: 10 }}>
            **Promotional products cannot be combined with promotional codes.
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          margin: 0,
          color: '#202124',
          fontSize: 34,
          lineHeight: 1.1,
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </h2>

      <a
        href="#"
        style={{
          color: '#6d4aff',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        View all
      </a>
    </div>
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
          width: 'min(980px, calc(100% - 24px))',
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
          .home-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .home-quick-view-grid {
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

        <div className="home-quick-view-grid">
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

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
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

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#f59e0b',
              }}
            >
              <Star size={15} fill="#f59e0b" />
              <Star size={15} fill="#f59e0b" />
              <Star size={15} fill="#f59e0b" />
              <Star size={15} fill="#f59e0b" />
              <Star size={15} />
              <span
                style={{
                  color: '#64748b',
                  fontSize: 13,
                  fontWeight: 700,
                  marginLeft: 4,
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
                  {product?.affiliate?.website_name || 'Website'}
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
                    color: '#4f46e5',
                    lineHeight: 1.1,
                  }}
                >
                  {renderPrice(product)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
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
                borderRadius: 16,
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 56,
                  borderRadius: 18,
                  background: '#2563eb',
                  border: '1px solid #2563eb',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 15,
                  boxShadow: '0 14px 28px rgba(37, 99, 235, 0.22)',
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 56,
                  borderRadius: 18,
                  background: '#111827',
                  border: '1px solid #111827',
                  color: '#ffffff',
                  fontWeight: 900,
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
        borderRadius: 24,
        border: '1px solid #ece6e0',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <button
        type="button"
        onClick={() => onQuickView(product)}
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid #ddd7d1',
          background: 'rgba(255,255,255,0.96)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1f2937',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        <Heart size={17} />
      </button>

      <button
        type="button"
        onClick={() => onQuickView(product)}
        style={{
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          className="product-card-image-wrap"
          style={{
            background: '#f8f8f8',
            padding: 0,
            minHeight: 300,
            height: 300,
            overflow: 'hidden',
          }}
        >
          <img
            src={product?.product_image}
            alt={product?.title || 'Product'}
            className="product-card-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      </button>

      <div className="product-card-content" style={{ padding: 22, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          className="product-card-title"
          style={{
            color: '#202124',
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.35,
            minHeight: 50,
            marginBottom: 14,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginBottom: 14 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={17} fill="#f4b000" strokeWidth={1.5} />
          ))}
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#4f46e5',
            marginBottom: 18,
          }}
        >
          {renderPrice(product)}
        </div>

        <div
          className="product-card-actions"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginTop: 'auto',
          }}
        >
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              height: 52,
              borderRadius: 18,
              background: 'linear-gradient(90deg, #6d4aff 0%, #5644f4 100%)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product?.homepage_cta_label || 'Buy Now'}
          </a>

          <Link
            to={resolveReadMoreUrl(product)}
            style={{
              textDecoration: 'none',
              height: 52,
              borderRadius: 18,
              border: '1px solid #d8d0ca',
              background: '#fff',
              color: '#1f2937',
              fontSize: 14,
              fontWeight: 700,
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

function ProductGridSection({ title, products, onQuickView, onImpression }) {
  return (
    <section style={{ marginTop: 54 }}>
      <SectionTitle title={title} />
      <div className="home-product-grid-4">
        {products.map((product, index) => (
          <ProductCard
            key={product._renderId || product.id || index}
            product={product}
            onQuickView={onQuickView}
            onImpression={onImpression}
          />
        ))}
      </div>
    </section>
  );
}

function LimitedOfferSection({ products, onQuickView, onImpression }) {
  const leftBannerProduct = products[0];
  const rightProducts = products.slice(0, 6);

  return (
    <section style={{ marginTop: 54 }}>
      <SectionTitle title="Limited offer" />

      <div className="home-limited-wrap">
        <div
          style={{
            background:
              'linear-gradient(145deg, rgba(22,23,27,0.94), rgba(79,70,229,0.78)), url("https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=80") center/cover',
            borderRadius: 28,
            minHeight: 748,
            overflow: 'hidden',
            position: 'relative',
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ maxWidth: 440 }}>
            <div
              style={{
                color: 'rgba(255,255,255,0.76)',
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Limited Time
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: 'clamp(38px, 4vw, 56px)',
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                marginBottom: 14,
              }}
            >
              Big banner promo for special offers
            </div>

            <div
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 16,
                lineHeight: 1.7,
                marginBottom: 22,
              }}
            >
              Ready for your backend banner connection.
            </div>

            <a
              href={resolveBuyNowUrl(leftBannerProduct)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 148,
                height: 52,
                borderRadius: 999,
                background: '#fff',
                color: '#202124',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Buy Now
            </a>
          </div>
        </div>

        <div className="home-limited-products-grid">
          {rightProducts.map((product, index) => (
            <ProductCard
              key={product._renderId || product.id || index}
              product={product}
              onQuickView={onQuickView}
              onImpression={onImpression}
            />
          ))}
        </div>
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

  const promoProducts = useMemo(() => ensureProducts(products, 6, 'promo', 'Promo Product'), [products]);
  const bestSellingProducts = useMemo(() => ensureProducts(products, 8, 'best', 'Best Selling'), [products]);
  const appliancesProducts = useMemo(
    () => ensureProducts(products, 8, 'appliances', 'Appliance Product'),
    [products]
  );
  const limitedOfferProducts = useMemo(
    () => ensureProducts(products, 6, 'limited', 'Limited Offer'),
    [products]
  );
  const hotDealProduct = promoProducts[0];

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

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f3efeb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 20px',
            background: '#fff',
            borderRadius: 16,
            color: '#374151',
          }}
        >
          <Loader2 size={18} className="spin-soft" />
          <span>Loading homepage...</span>
        </div>

        <style>{`
          .spin-soft {
            animation: spinSoft 0.9s linear infinite;
          }
          @keyframes spinSoft {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3efeb',
      }}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .homepage-shell {
          width: min(100%, 1880px);
          margin: 0 auto;
          padding: 0 22px 64px;
        }

        .homepage-top-grid {
          display: grid;
          grid-template-columns: 470px minmax(0, 1fr) 470px;
          gap: 24px;
          align-items: stretch;
        }

        .home-mid-promo {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 980px;
          gap: 24px;
          align-items: start;
          margin-top: 28px;
        }

        .home-mini-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        .home-product-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 28px;
        }

        .home-limited-wrap {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .home-limited-products-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }

        @media (max-width: 1800px) {
          .homepage-top-grid {
            grid-template-columns: 380px minmax(0, 1fr) 380px;
          }

          .home-mid-promo {
            grid-template-columns: minmax(0, 1fr) 820px;
          }
        }

        @media (max-width: 1450px) {
          .homepage-top-grid,
          .home-mid-promo,
          .home-limited-wrap {
            grid-template-columns: 1fr;
          }

          .home-product-grid-4 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .home-limited-products-grid,
          .home-mini-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 980px) {
          .home-product-grid-4,
          .home-limited-products-grid,
          .home-mini-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .homepage-shell {
            padding: 0 14px 40px;
          }
        }

        @media (max-width: 767px) {
          .desktop-categories-button,
          .desktop-left-category-card,
          .desktop-hot-deal-card,
          .desktop-promo-side,
          .desktop-top-strip,
          .desktop-main-header {
            display: none !important;
          }

          .mobile-categories-pill {
            display: inline-flex !important;
          }

          .homepage-top-grid,
          .home-mid-promo,
          .home-limited-wrap,
          .home-product-grid-4,
          .home-limited-products-grid,
          .home-mini-product-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .main-slider-card {
            min-height: 430px !important;
            border-radius: 22px !important;
          }

          .main-slider-card > div {
            min-height: 430px !important;
          }

          .main-slider-inner {
            padding: 28px 18px 18px !important;
          }

          .main-slider-title {
            font-size: 28px !important;
            line-height: 1.14 !important;
          }

          .main-slider-subtitle {
            font-size: 18px !important;
            margin-top: 10px !important;
          }

          .main-slider-image-wrap {
            margin-top: 8px !important;
          }

          .main-slider-image {
            max-width: 100% !important;
            max-height: 185px !important;
          }

          .main-slider-tabs {
            gap: 16px !important;
            margin-top: 10px !important;
          }

          .main-slider-tabs button {
            font-size: 13px !important;
          }

          .main-slider-nav {
            width: 34px !important;
            height: 34px !important;
            top: auto !important;
            bottom: 14px !important;
            transform: none !important;
          }

          .main-slider-nav-left {
            left: 14px !important;
          }

          .main-slider-nav-right {
            right: 14px !important;
          }

          .product-card-image-wrap {
            height: 240px !important;
            min-height: 240px !important;
          }

          .product-card-content {
            padding: 16px !important;
          }

          .product-card-title {
            min-height: auto !important;
            font-size: 17px !important;
            margin-bottom: 10px !important;
          }

          .product-card-actions {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }

          .product-card-actions a {
            height: 46px !important;
            border-radius: 14px !important;
            font-size: 13px !important;
          }

          .mobile-category-overlay {
            display: block;
          }

          .mobile-only-top-area {
            display: grid !important;
            gap: 14px !important;
            padding-top: 14px !important;
            padding-bottom: 14px !important;
          }

          .homepage-shell {
            padding: 0 12px 28px;
          }
        }
      `}</style>

      <div
        className="desktop-top-strip"
        style={{
          background: '#f6f4f2',
          borderBottom: '1px solid #e9e4df',
        }}
      >
        <div
          className="homepage-shell"
          style={{
            paddingTop: 18,
            paddingBottom: 18,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              color: '#7a726d',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            FREE SHIPPING FOR ALL ORDERS OF $1200
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              flexWrap: 'wrap',
            }}
          >
            <TopLink href="#">Blog</TopLink>
            <TopLink href="#">About Us</TopLink>
            <TopLink href="#">Contact Us</TopLink>
            <TopLink href="#">FAQs</TopLink>
          </div>
        </div>
      </div>

      <div className="homepage-shell">
        {error ? (
          <div
            style={{
              marginTop: 20,
              background: '#fff',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 14,
              padding: 14,
            }}
          >
            {error}
          </div>
        ) : null}

        <header
          className="desktop-main-header"
          style={{
            paddingTop: 24,
            paddingBottom: 24,
            display: 'grid',
            gap: 22,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto minmax(0, 1fr) auto auto',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #5b34ff, #8b5cf6)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 26,
                }}
              >
                B
              </span>

              <span
                style={{
                  color: '#232323',
                  fontWeight: 800,
                  fontSize: 34,
                  letterSpacing: '-0.04em',
                }}
              >
                bloggad<span style={{ color: '#5b34ff' }}>.</span>
              </span>
            </Link>

            <CategoriesButton categoryTree={categoryTree} />

            <div style={{ position: 'relative', minWidth: 0 }}>
              <input
                type="text"
                placeholder="Search for products"
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 999,
                  border: '1px solid #e5dfd9',
                  background: '#fff',
                  padding: '0 76px 0 26px',
                  fontSize: 16,
                  color: '#1f2937',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: 4,
                  top: 4,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#5b34ff',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Search size={20} />
              </button>
            </div>

            <button
              type="button"
              style={{
                height: 52,
                borderRadius: 999,
                border: '2px solid #6046ff',
                background: 'transparent',
                color: '#6046ff',
                padding: '0 26px',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Discounts
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <HeaderIcon>
                <User size={20} />
              </HeaderIcon>
              <HeaderIcon count={0}>
                <Scale size={20} />
              </HeaderIcon>
              <HeaderIcon count={0}>
                <Heart size={20} />
              </HeaderIcon>
              <HeaderIcon count={0}>
                <ShoppingCart size={20} />
              </HeaderIcon>
            </div>
          </div>
        </header>

        <div className="mobile-only-top-area" style={{ display: 'none' }}>
          <CategoriesButton categoryTree={categoryTree} />
        </div>

        <section className="homepage-top-grid">
          <CategoryMenu categoryTree={categoryTree} />
          <MainSlider />
          <HotDealCard product={hotDealProduct} />
        </section>

        <MidPromoSection products={promoProducts} />

        <ProductGridSection
          title="Best selling"
          products={bestSellingProducts}
          onQuickView={setQuickViewProduct}
          onImpression={handleImpression}
        />
        <ProductGridSection
          title="Popular in appliances"
          products={appliancesProducts}
          onQuickView={setQuickViewProduct}
          onImpression={handleImpression}
        />
        <LimitedOfferSection
          products={limitedOfferProducts}
          onQuickView={setQuickViewProduct}
          onImpression={handleImpression}
        />
      </div>

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