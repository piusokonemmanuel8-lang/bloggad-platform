import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Loader2,
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
  if (!product) return '-';

  if (product?.pricing_type === 'simple') {
    return product?.price !== null && product?.price !== undefined
      ? formatCurrency(product.price)
      : '-';
  }

  return `${formatCurrency(product?.min_price || 0)} - ${formatCurrency(product?.max_price || 0)}`;
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

function resolveTrackingEndpoint(product, fallbackWebsiteSlug = '') {
  const websiteSlug = resolveWebsiteSlug(product, fallbackWebsiteSlug);
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

  return '#';
}

function makeDummyProducts(websiteSlug, categoryName) {
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

  return Array.from({ length: 12 }, (_, index) => ({
    id: `website-category-dummy-${index + 1}`,
    slug: `website-category-product-${index + 1}`,
    title: `${categoryName || 'Category'} Product ${index + 1}`,
    short_description: 'Premium storefront product card ready for real website category feed.',
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    affiliate_buy_url: '#',
    website_url: websiteSlug ? `/${websiteSlug}` : '#',
    pricing_type: 'simple',
    price: 15000 + index * 5500,
    product_image: imagePool[index % imagePool.length],
    category: {
      name: categoryName || 'Category',
    },
    affiliate: {
      name: 'Bloggad',
      website_name: 'Bloggad Store',
      website_slug: websiteSlug || 'bloggad-store',
    },
    website_slug: websiteSlug || 'bloggad-store',
  }));
}

function SponsoredAdCard({ ad, onView, onClick }) {
  const cardRef = useRef(null);

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

  const image = ad?.target_image || ad?.campaign_image || '';
  const title = ad?.target_title || ad?.campaign_title || 'Sponsored Product';
  const description = ad?.campaign_description || 'Promoted product from this category.';

  return (
    <article
      ref={cardRef}
      style={{
        background: '#ffffff',
        border: '1px solid #bfdbfe',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 14px 34px rgba(37, 99, 235, 0.08)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 12,
          top: 12,
          zIndex: 2,
          padding: '7px 10px',
          borderRadius: 999,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          fontSize: 11,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Sponsored
      </div>

      <button
        type="button"
        onClick={() => onClick(ad)}
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
          {image ? (
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                height: 240,
                objectFit: 'cover',
                borderRadius: 16,
                background: '#ffffff',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 240,
                borderRadius: 16,
                background: '#0f172a',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: 24,
              }}
            >
              AD
            </div>
          )}
        </div>

        <div style={{ padding: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: '#2563eb',
              marginBottom: 8,
              fontWeight: 900,
            }}
          >
            Promoted Product
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 19,
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1.35,
              marginBottom: 10,
            }}
          >
            {title}
          </h3>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>

          <div
            style={{
              marginTop: 14,
              padding: '12px 14px',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #6d4aff 0%, #5644f4 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            View Product
          </div>
        </div>
      </button>
    </article>
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
          .website-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .website-quick-view-grid {
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

        <div className="website-quick-view-grid">
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

function ProductCard({ product, websiteSlug, onQuickView, onImpression }) {
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
        border: '1px solid #e5e7eb',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 14px 28px rgba(15, 23, 42, 0.05)',
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
          right: 12,
          top: 12,
          zIndex: 2,
          width: 40,
          height: 40,
          borderRadius: 999,
          border: '1px solid #e5e7eb',
          background: 'rgba(255,255,255,0.96)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#111827',
          cursor: 'pointer',
        }}
      >
        <Heart size={16} />
      </button>

      <button
        type="button"
        onClick={() => onQuickView(product)}
        style={{
          border: 0,
          background: 'transparent',
          padding: 0,
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
                height: 260,
                objectFit: 'cover',
                borderRadius: 16,
                background: '#ffffff',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: 260,
                borderRadius: 16,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
              }}
            />
          )}
        </div>
      </button>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            color: '#94a3b8',
            marginBottom: 8,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {product?.category?.name || 'Category'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginBottom: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} fill="#f4b000" strokeWidth={1.5} />
          ))}
        </div>

        <div
          style={{
            color: '#111827',
            fontSize: 19,
            fontWeight: 800,
            lineHeight: 1.35,
            minHeight: 52,
            marginBottom: 12,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: '#4f46e5',
            marginBottom: 16,
          }}
        >
          {renderPrice(product)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 'auto',
          }}
        >
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: 'none',
              minHeight: 50,
              borderRadius: 16,
              background: 'linear-gradient(90deg, #6d4aff 0%, #5644f4 100%)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product?.homepage_cta_label || 'Buy Now'}
          </a>

          <Link
            to={resolveReadMoreUrl(product, websiteSlug)}
            style={{
              textDecoration: 'none',
              minHeight: 50,
              borderRadius: 16,
              border: '1px solid #d8d0ca',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: 14,
              fontWeight: 800,
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

export default function WebsiteCategoryPage() {
  const { websiteSlug, slug } = useParams();

  const [pageData, setPageData] = useState(null);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('default');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [savedProducts, setSavedProducts] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const trackedImpressionsRef = useRef(new Set());
  const trackedQuickViewsRef = useRef(new Set());
  const trackedSponsoredViewsRef = useRef(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get(`/api/public/categories/${websiteSlug}/${slug}`);
        const nextCategory = data?.category || null;

        setPageData(data || null);
        setSearchTerm('');
        setSortValue('default');
        setQuickViewProduct(null);
        setSponsoredAds([]);
        trackedSponsoredViewsRef.current = new Set();

        if (nextCategory?.id) {
          try {
            const adsRes = await api.get('/api/public/affiliate-ads', {
              params: {
                ad_type: 'product',
                category_id: nextCategory.id,
                placement_key: 'website_category_top_products',
                limit: 4,
              },
            });

            setSponsoredAds(Array.isArray(adsRes?.data?.ads) ? adsRes.data.ads : []);
          } catch (adsError) {
            setSponsoredAds([]);
          }
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load website category');
      } finally {
        setLoading(false);
      }
    };

    if (websiteSlug && slug) {
      fetchCategoryProducts();
    }
  }, [websiteSlug, slug]);

  const website = pageData?.website;
  const category = pageData?.category;
  const rawProducts = pageData?.products || [];
  const products = useMemo(() => {
    if (rawProducts.length) return rawProducts;
    return makeDummyProducts(websiteSlug, category?.name);
  }, [rawProducts, websiteSlug, category?.name]);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    let nextProducts = [...products];

    if (keyword) {
      nextProducts = nextProducts.filter((product) => {
        const title = String(product?.title || '').toLowerCase();
        const categoryName = String(product?.category?.name || '').toLowerCase();
        const websiteName = String(
          product?.affiliate?.website_name || website?.website_name || ''
        ).toLowerCase();
        const description = String(product?.short_description || '').toLowerCase();

        return (
          title.includes(keyword) ||
          categoryName.includes(keyword) ||
          websiteName.includes(keyword) ||
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

    return nextProducts;
  }, [products, searchTerm, sortValue, website?.website_name]);

  const trackProductEvent = useMemo(() => {
    return async (product, clickType) => {
      const endpoint = resolveTrackingEndpoint(product, websiteSlug);
      if (!endpoint) return null;

      try {
        const { data } = await api.post(endpoint, {
          click_type: clickType,
        });
        return data || null;
      } catch (err) {
        return null;
      }
    };
  }, [websiteSlug]);

  const trackSponsoredView = useCallback(async (ad) => {
    if (!ad?.id || trackedSponsoredViewsRef.current.has(ad.id)) return;

    trackedSponsoredViewsRef.current.add(ad.id);

    try {
      await api.post(`/api/public/affiliate-ads/${ad.id}/view`, {
        placement_key: 'website_category_top_products',
        page_url: window.location.href,
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
        placement_key: 'website_category_top_products',
        page_url: window.location.href,
        destination_url: targetUrl,
      });
    } catch (err) {
      // ignore ad tracking failure
    }

    if (targetUrl && targetUrl !== '#') {
      window.location.href = targetUrl;
    }
  }, []);

  const handleImpression = async (product) => {
    if (!product?.id || trackedImpressionsRef.current.has(product.id)) return;
    trackedImpressionsRef.current.add(product.id);
    await trackProductEvent(product, 'impression');
  };

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
        ? resolveVisitWebsiteUrl(quickViewProduct, websiteSlug)
        : resolveReadMoreUrl(quickViewProduct, websiteSlug);

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

    const shareUrl = resolveReadMoreUrl(quickViewProduct, websiteSlug);
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
          <span>Loading website category...</span>
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
    <div style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <style>{`
        .website-category-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .website-category-sponsored-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        @media (max-width: 1280px) {
          .website-category-grid,
          .website-category-sponsored-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 980px) {
          .website-category-grid,
          .website-category-sponsored-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .website-category-grid,
          .website-category-sponsored-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          width: 'min(1480px, calc(100% - 24px))',
          margin: '0 auto',
          padding: '20px 0 40px',
        }}
      >
        <header
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 22,
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #eef2f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 8,
                }}
              >
                Website Category
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: '#111827',
                  letterSpacing: '-0.04em',
                }}
              >
                {category?.name || 'Category'}
                {website?.website_name ? ` • ${website.website_name}` : ''}
              </h1>
            </div>

            <div
              style={{
                flex: '1 1 360px',
                maxWidth: 460,
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
                placeholder="Search products in this category"
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 999,
                  border: '1px solid #dbe1ea',
                  background: '#f8fafc',
                  padding: '0 18px 0 48px',
                  fontSize: 15,
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                color: '#64748b',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Link to="/" style={{ color: '#64748b' }}>
                Home
              </Link>
              <ChevronRight size={14} />
              {websiteSlug ? (
                <>
                  <Link to={`/${websiteSlug}`} style={{ color: '#64748b' }}>
                    {website?.website_name || websiteSlug}
                  </Link>
                  <ChevronRight size={14} />
                </>
              ) : null}
              <span style={{ color: '#111827', fontWeight: 800 }}>
                {category?.name || 'Category'}
              </span>
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
              borderRadius: 14,
              padding: 16,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        ) : null}

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 22,
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
            padding: 20,
          }}
        >
          {sponsoredAds.length ? (
            <div
              style={{
                marginBottom: 24,
                background:
                  'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(255,255,255,0.98))',
                border: '1px solid #bfdbfe',
                borderRadius: 22,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '7px 10px',
                      borderRadius: 999,
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      fontSize: 11,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 8,
                    }}
                  >
                    Sponsored
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: '#111827',
                      fontSize: 24,
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    Promoted {category?.name || 'Category'} Products
                  </h2>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: '#64748b',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Ads from this same category appear here first.
                </p>
              </div>

              <div className="website-category-sponsored-grid">
                {sponsoredAds.map((ad) => (
                  <SponsoredAdCard
                    key={ad.id}
                    ad={ad}
                    onView={trackSponsoredView}
                    onClick={trackSponsoredClick}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                  marginBottom: 8,
                }}
              >
                Storefront Products
              </div>
              <h2
                style={{
                  margin: 0,
                  color: '#111827',
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                }}
              >
                Products
              </h2>
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {filteredProducts.length} items
            </div>
          </div>

          <div className="website-category-grid">
            {filteredProducts.length ? (
              filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  websiteSlug={websiteSlug}
                  onQuickView={setQuickViewProduct}
                  onImpression={handleImpression}
                />
              ))
            ) : (
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 18,
                  padding: 24,
                  color: '#64748b',
                }}
              >
                No products found in this website category.
              </div>
            )}
          </div>
        </section>
      </div>

      <ProductQuickViewModal
        product={quickViewProduct}
        websiteSlug={websiteSlug}
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