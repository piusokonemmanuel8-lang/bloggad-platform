import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Heart,
  LayoutGrid,
  Loader2,
  Menu,
  Search,
  Share2,
  Star,
  X,
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
      : '-';
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
  if (productSlug) return `/product/${productSlug}`;
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

function resolveSponsoredProductUrl(ad) {
  if (ad?.website_slug && ad?.product_slug) {
    return `/${ad.website_slug}/product/${ad.product_slug}`;
  }

  if (ad?.product_slug) {
    return `/product/${ad.product_slug}`;
  }

  if (ad?.website_slug) {
    return `/${ad.website_slug}`;
  }

  return '#';
}

function resolveSponsoredTitle(ad) {
  return ad?.target_title || ad?.campaign_title || 'Featured Product';
}

function resolveSponsoredImage(ad) {
  return ad?.display_image || ad?.target_image || ad?.campaign_image_url || ad?.campaign_image || '';
}

function makeDummyProduct(seed, index, categoryName) {
  const images = [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80',
  ];

  return {
    id: `dummy-${seed}-${index + 1}`,
    title: `${categoryName || 'Category'} Product ${index + 1}`,
    slug: `dummy-${seed}-${index + 1}`,
    short_description: 'Category product card ready for real feed connection.',
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    affiliate_buy_url: '#',
    website_url: '#',
    read_more_url: '#',
    pricing_type: 'simple',
    price: 19900 + index * 3500,
    product_image: images[index % images.length],
    category: {
      name: categoryName || 'Category',
    },
    affiliate: {
      name: 'Bloggad',
      website_name: 'Bloggad Store',
      website_slug: 'bloggad-store',
    },
    website_slug: 'bloggad-store',
  };
}

function getDisplayProducts(products, categoryName) {
  const realProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const maxProducts = 20;

  if (!realProducts.length) {
    return Array.from({ length: maxProducts }, (_, index) =>
      makeDummyProduct('category', index, categoryName)
    );
  }

  return realProducts.slice(0, maxProducts);
}

function SponsoredAdCard({ ad, onView, onClick }) {
  const cardRef = useRef(null);
  const image = resolveSponsoredImage(ad);
  const title = resolveSponsoredTitle(ad);
  const description = ad?.campaign_description || 'Sponsored product from an active advertiser.';

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onView(ad);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [ad, onView]);

  return (
    <article ref={cardRef} className="category-sponsored-product-card">
      <span className="category-sponsored-ads-badge">Ads</span>

      <button type="button" onClick={() => onClick(ad)} className="category-sponsored-image-button">
        <span className="category-sponsored-image-wrap">
          {image ? (
            <img src={image} alt={title} className="category-sponsored-image" />
          ) : (
            <span className="category-sponsored-image-empty">AD</span>
          )}
        </span>
      </button>

      <button type="button" onClick={() => onClick(ad)} className="category-sponsored-content-button">
        <span className="category-sponsored-category">Sponsored</span>

        <span className="category-sponsored-rating">
          <span>5.0</span>
          <Star size={14} fill="#f59e0b" />
        </span>

        <span className="category-sponsored-title">{title}</span>

        <span className="category-sponsored-price">
          {ad?.campaign_title || 'Featured product'}
        </span>

        <span className="category-sponsored-hover-description">{description}</span>
      </button>
    </article>
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
          zIndex: 200,
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
          zIndex: 201,
        }}
      >
        <style>{`
          .quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .quick-view-grid {
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

        <div className="quick-view-grid">
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

function ProductCard({
  product,
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
      {
        threshold: 0.35,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [product, onImpression]);

  return (
    <div
      ref={cardRef}
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
        minHeight: '100%',
      }}
    >
      <button
        type="button"
        onClick={() => onQuickView(product)}
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          width: 34,
          height: 34,
          borderRadius: 999,
          border: '1px solid #e5e7eb',
          background: 'rgba(255,255,255,0.95)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#111827',
          cursor: 'pointer',
          zIndex: 2,
        }}
      >
        <Heart size={15} />
      </button>

      <button
        type="button"
        onClick={() => onQuickView(product)}
        style={{
          width: '100%',
          border: 0,
          padding: 0,
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            background: '#f8fafc',
            padding: 14,
            borderBottom: '1px solid #eef2f7',
          }}
        >
          {product?.product_image ? (
            <img
              src={product.product_image}
              alt={product.title}
              style={{
                width: '100%',
                height: 240,
                objectFit: 'cover',
                borderRadius: 14,
                background: '#ffffff',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 240,
                borderRadius: 14,
                border: '1px solid #e5e7eb',
                background: '#ffffff',
              }}
            />
          )}
        </div>
      </button>

      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 13,
            color: '#94a3b8',
            marginBottom: 8,
          }}
        >
          {product?.category?.name || 'Category'}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginBottom: 10,
            color: '#f59e0b',
          }}
        >
          <span style={{ fontSize: 14, color: '#64748b', marginRight: 4 }}>5.0</span>
          <Star size={14} fill="#f59e0b" />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.35,
            marginBottom: 10,
            minHeight: 48,
          }}
        >
          {product?.title || 'Product title'}
        </div>

        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#4f46e5',
            marginBottom: 14,
          }}
        >
          {renderPrice(product)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            style={{
              textAlign: 'center',
              padding: '11px 12px',
              borderRadius: 12,
              background: '#2563eb',
              border: '1px solid #2563eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {product?.homepage_cta_label || 'Buy Now'}
          </a>

          <Link
            to={resolveReadMoreUrl(product)}
            style={{
              textAlign: 'center',
              padding: '11px 12px',
              borderRadius: 12,
              background: '#ffffff',
              border: '1px solid #d1d5db',
              color: '#111827',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {product?.storefront_cta_label || 'Read More'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();

  const [categoryData, setCategoryData] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('default');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [columns, setColumns] = useState(4);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [savedProducts, setSavedProducts] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const trackedImpressionsRef = useRef(new Set());
  const trackedQuickViewsRef = useRef(new Set());
  const trackedSponsoredViewsRef = useRef(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError('');

        const [categoryRes, homeRes] = await Promise.all([
          api.get(`/api/public/categories/${slug}`),
          api.get('/api/public/home'),
        ]);

        const nextCategoryData = categoryRes?.data || null;
        const nextCategory = nextCategoryData?.category || null;

        setCategoryData(nextCategoryData);
        setAllCategories(homeRes?.data?.categories || []);
        setSearchTerm('');
        setSortValue('default');
        setItemsPerPage(20);
        setColumns(4);
        setQuickViewProduct(null);
        setSponsoredAds([]);
        trackedSponsoredViewsRef.current = new Set();

        if (nextCategory?.id) {
          try {
            const adsRes = await api.get('/api/public/affiliate-ads', {
              params: {
                ad_type: 'product',
                category_id: nextCategory.id,
                placement_key: 'category_top_products',
                limit: 4,
              },
            });

            setSponsoredAds(Array.isArray(adsRes?.data?.ads) ? adsRes.data.ads : []);
          } catch (adsError) {
            setSponsoredAds([]);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  const category = categoryData?.category;
  const products = categoryData?.products || [];
  const currentCategoryName = category?.name || 'Category';

  const baseProducts = useMemo(
    () => getDisplayProducts(products, currentCategoryName),
    [products, currentCategoryName]
  );

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    let nextProducts = [...baseProducts];

    if (keyword) {
      nextProducts = nextProducts.filter((product) => {
        const title = String(product?.title || '').toLowerCase();
        const categoryName = String(product?.category?.name || '').toLowerCase();
        const website = String(product?.affiliate?.website_name || '').toLowerCase();
        const affiliate = String(product?.affiliate?.name || '').toLowerCase();
        const description = String(product?.short_description || '').toLowerCase();

        return (
          title.includes(keyword) ||
          categoryName.includes(keyword) ||
          website.includes(keyword) ||
          affiliate.includes(keyword) ||
          description.includes(keyword)
        );
      });
    }

    if (sortValue === 'price_low_high') {
      nextProducts.sort((a, b) => getNumericPrice(a) - getNumericPrice(b));
    } else if (sortValue === 'price_high_low') {
      nextProducts.sort((a, b) => getNumericPrice(b) - getNumericPrice(a));
    } else if (sortValue === 'name_az') {
      nextProducts.sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')));
    } else if (sortValue === 'name_za') {
      nextProducts.sort((a, b) => String(b?.title || '').localeCompare(String(a?.title || '')));
    }

    return nextProducts.slice(0, itemsPerPage);
  }, [baseProducts, searchTerm, sortValue, itemsPerPage]);

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

  const trackSponsoredView = useCallback(async (ad) => {
    if (!ad?.id || trackedSponsoredViewsRef.current.has(ad.id)) return;

    trackedSponsoredViewsRef.current.add(ad.id);

    try {
      await api.post(`/api/public/affiliate-ads/${ad.id}/view`, {
        placement_key: 'category_top_products',
        page_url: window.location.href,
        publisher_website_slug: '',
        publisher_website_id: '',
        publisher_affiliate_id: '',
      });
    } catch (err) {
      // ignore ad tracking failure
    }
  }, []);

  const trackSponsoredClick = useCallback(async (ad) => {
    if (!ad?.id) return;

    const targetUrl = resolveSponsoredProductUrl(ad);

    try {
      await api.post(`/api/public/affiliate-ads/${ad.id}/click`, {
        placement_key: 'category_top_products',
        page_url: window.location.href,
        destination_url: targetUrl,
        publisher_website_slug: '',
        publisher_website_id: '',
        publisher_affiliate_id: '',
      });
    } catch (err) {
      // ignore ad tracking failure
    }

    if (targetUrl && targetUrl !== '#') {
      window.location.href = targetUrl;
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
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#334155',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Loader2 size={18} className="spin-soft" />
          <span>Loading category...</span>
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
        background: '#f5f7fb',
      }}
    >
      <style>{`
        .category-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .category-main-grid {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 24px;
        }

        .category-product-grid {
          display: grid;
          grid-template-columns: repeat(var(--category-columns, 4), minmax(0, 1fr));
          gap: 20px;
        }

        .category-sponsored-grid {
          display: grid;
          grid-template-columns: repeat(var(--category-columns, 4), minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .category-sponsored-product-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
          min-height: 100%;
          display: block;
        }

        .category-sponsored-ads-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 3;
          background: rgba(17, 24, 39, 0.92);
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 999px;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
        }

        .category-sponsored-image-button,
        .category-sponsored-content-button {
          width: 100%;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          text-align: left;
          display: block;
        }

        .category-sponsored-image-wrap {
          display: block;
          background: #f8fafc;
          padding: 14px;
          border-bottom: 1px solid #eef2f7;
          position: relative;
          overflow: hidden;
        }

        .category-sponsored-image {
          width: 100%;
          height: 240px;
          object-fit: contain;
          border-radius: 14px;
          background: #ffffff;
          display: block;
          transform: scale(1);
          transition: transform 0.25s ease;
        }

        .category-sponsored-product-card:hover .category-sponsored-image {
          transform: scale(1.06);
        }

        .category-sponsored-image-empty {
          width: 100%;
          height: 240px;
          border-radius: 14px;
          background: #111827;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 24px;
        }

        .category-sponsored-content-button {
          padding: 16px;
          position: relative;
        }

        .category-sponsored-category {
          display: block;
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .category-sponsored-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 10px;
          color: #f59e0b;
        }

        .category-sponsored-rating span {
          font-size: 14px;
          color: #64748b;
          margin-right: 4px;
        }

        .category-sponsored-title {
          display: block;
          font-size: 18px;
          font-weight: 800;
          color: #111827;
          line-height: 1.35;
          margin-bottom: 10px;
          min-height: 48px;
        }

        .category-sponsored-price {
          display: block;
          font-size: 24px;
          font-weight: 900;
          color: #ff2b05;
          margin-bottom: 14px;
          line-height: 1.15;
        }

        .category-sponsored-hover-description {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 12px;
          z-index: 4;
          min-height: 58px;
          max-height: 88px;
          overflow: hidden;
          background: rgba(17, 24, 39, 0.93);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.45;
          border-radius: 16px;
          padding: 10px 12px;
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.22s ease;
          pointer-events: none;
        }

        .category-sponsored-product-card:hover .category-sponsored-hover-description {
          opacity: 1;
          transform: translateY(0);
        }

        .category-sponsored-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .category-sponsored-heading-row h2 {
          margin: 0;
          color: #111827;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .category-sponsored-heading-row span {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          background: #111827;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 11px;
        }

        @media (max-width: 1100px) {
          .category-main-grid {
            grid-template-columns: 1fr;
          }

          .category-product-grid,
          .category-sponsored-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .category-product-grid,
          .category-sponsored-grid {
            grid-template-columns: 1fr;
          }

          .category-sponsored-hover-description {
            display: none;
          }
        }
      `}</style>

      {sidebarOpen ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close categories"
          style={{
            position: 'fixed',
            inset: 0,
            border: 0,
            background: 'rgba(15,23,42,0.35)',
            zIndex: 80,
          }}
        />
      ) : null}

      <div
        style={{
          width: 'min(1460px, calc(100% - 24px))',
          margin: '0 auto',
          padding: '18px 0 40px',
        }}
      >
        <header
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.04)',
            marginBottom: 18,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #eef2f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                color: '#111827',
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: '-0.03em',
              }}
            >
              Bloggad
            </div>

            <div
              style={{
                flex: '1 1 520px',
                maxWidth: 720,
                position: 'relative',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search for products"
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: '1px solid #dbe1ea',
                  background: '#f8fafc',
                  padding: '0 16px 0 48px',
                  fontSize: 15,
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                color: '#111827',
                fontWeight: 700,
                flexWrap: 'wrap',
              }}
            >
              <span>Blog</span>
              <span>About Us</span>
              <span>Contact Us</span>
              <span>FAQs</span>
            </div>
          </div>
        </header>

        {error ? (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #fecaca',
              borderLeft: '4px solid #dc2626',
              color: '#991b1b',
              borderRadius: 12,
              padding: 16,
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            color: '#64748b',
            fontSize: 14,
            marginBottom: 18,
            fontWeight: 600,
          }}
        >
          <Link to="/" style={{ color: '#64748b' }}>
            Home
          </Link>
          <span>/</span>
          <span>{currentCategoryName}</span>
          <span>/</span>
          <span style={{ color: '#111827', fontWeight: 800 }}>{currentCategoryName}</span>
        </div>

        <div className="category-main-grid">
          <aside style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              style={{
                width: '100%',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '13px 16px',
                borderRadius: 14,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#111827',
                fontWeight: 800,
                marginBottom: 14,
                cursor: 'pointer',
              }}
              className="category-mobile-button"
            >
              <Menu size={18} />
              Categories
            </button>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  padding: '16px 18px',
                  borderBottom: '1px solid #eef2f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#111827',
                  }}
                >
                  Categories
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'none',
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#111827',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  className="category-close-button"
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: 12 }}>
                {allCategories.length ? (
                  allCategories.map((item) => {
                    const active = item.slug === slug;

                    return (
                      <Link
                        key={item.id}
                        to={`/category/${item.slug}`}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '13px 12px',
                          borderRadius: 12,
                          background: active ? '#eff6ff' : 'transparent',
                          border: active ? '1px solid #bfdbfe' : '1px solid transparent',
                          color: active ? '#1d4ed8' : '#111827',
                          fontWeight: active ? 800 : 700,
                          marginBottom: 4,
                        }}
                      >
                        <span>{item.name}</span>
                        <ChevronRight size={15} />
                      </Link>
                    );
                  })
                ) : (
                  <div style={{ padding: 8, color: '#64748b' }}>No categories available.</div>
                )}
              </div>
            </div>

            <style>{`
              @media (max-width: 1100px) {
                .category-mobile-button {
                  display: inline-flex !important;
                }

                .category-close-button {
                  display: inline-flex !important;
                }
              }
            `}</style>

            {sidebarOpen ? (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 'min(340px, 88vw)',
                  background: '#ffffff',
                  borderRight: '1px solid #e5e7eb',
                  zIndex: 90,
                  overflowY: 'auto',
                  boxShadow: '0 20px 40px rgba(15,23,42,0.18)',
                  display:
                    typeof window !== 'undefined' && window.innerWidth <= 1100 ? 'block' : 'none',
                }}
              >
                <div
                  style={{
                    padding: '16px 18px',
                    borderBottom: '1px solid #eef2f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#111827',
                    }}
                  >
                    Categories
                  </div>

                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      color: '#111827',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ padding: 12 }}>
                  {allCategories.map((item) => {
                    const active = item.slug === slug;

                    return (
                      <Link
                        key={`mobile-${item.id}`}
                        to={`/category/${item.slug}`}
                        onClick={() => setSidebarOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '13px 12px',
                          borderRadius: 12,
                          background: active ? '#eff6ff' : 'transparent',
                          border: active ? '1px solid #bfdbfe' : '1px solid transparent',
                          color: active ? '#1d4ed8' : '#111827',
                          fontWeight: active ? 800 : 700,
                          marginBottom: 4,
                        }}
                      >
                        <span>{item.name}</span>
                        <ChevronRight size={15} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </aside>

          <main>
            <div className="category-topbar" style={{ marginBottom: 18 }}>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 40,
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: '#111827',
                    marginBottom: 10,
                  }}
                >
                  {currentCategoryName}
                </h1>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#64748b',
                    fontWeight: 700,
                  }}
                >
                  <span>Show :</span>

                  {[20, 16, 12, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setItemsPerPage(count)}
                      style={{
                        border: 0,
                        background: 'transparent',
                        color: itemsPerPage === count ? '#111827' : '#64748b',
                        fontWeight: itemsPerPage === count ? 900 : 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {count}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setColumns(4)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      border: columns === 4 ? '1px solid #93c5fd' : '1px solid #e5e7eb',
                      background: columns === 4 ? '#eff6ff' : '#ffffff',
                      color: columns === 4 ? '#2563eb' : '#94a3b8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Grid3X3 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setColumns(3)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      border: columns === 3 ? '1px solid #93c5fd' : '1px solid #e5e7eb',
                      background: columns === 3 ? '#eff6ff' : '#ffffff',
                      color: columns === 3 ? '#2563eb' : '#94a3b8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>

                <div
                  style={{
                    minWidth: 220,
                    height: 46,
                    borderRadius: 999,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <select
                    value={sortValue}
                    onChange={(event) => setSortValue(event.target.value)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 0,
                      outline: 'none',
                      background: 'transparent',
                      color: '#64748b',
                      fontWeight: 600,
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="default">Default sorting</option>
                    <option value="price_low_high">Price: low to high</option>
                    <option value="price_high_low">Price: high to low</option>
                    <option value="name_az">Name: A to Z</option>
                    <option value="name_za">Name: Z to A</option>
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {sponsoredAds.length ? (
              <section>
                <div className="category-sponsored-heading-row">
                  <h2>Featured Product</h2>
                  <span>Ads</span>
                </div>

                <div
                  className="category-sponsored-grid"
                  style={{ '--category-columns': columns }}
                >
                  {sponsoredAds.map((ad) => (
                    <SponsoredAdCard
                      key={ad.id}
                      ad={ad}
                      onView={trackSponsoredView}
                      onClick={trackSponsoredClick}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <div
              className="category-product-grid"
              style={{ '--category-columns': columns }}
            >
              {filteredProducts.length ? (
                filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id || index}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onImpression={handleImpression}
                  />
                ))
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 18,
                    padding: 24,
                    color: '#64748b',
                  }}
                >
                  No products matched your search.
                </div>
              )}
            </div>
          </main>
        </div>
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