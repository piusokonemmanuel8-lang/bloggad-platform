import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BarChart3,
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  Heart,
  Home,
  LayoutGrid,
  Loader2,
  Menu,
  Plus,
  Search,
  Share2,
  Star,
  Tags,
  UserRound,
  Users,
  X
} from 'lucide-react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';
import './HomePageFeed.css';
import './CategoryPageApproved.css';

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

function ApprovedCategoryProductCard({ product, onQuickView, onImpression, onAction }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) {
          onImpression(product);
          observer.disconnect();
        }
      },
      { threshold: [0.35] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [product, onImpression]);

  const categoryName = product?.category?.name || 'Category';

  return (
    <article ref={cardRef} className="cat-approved-product-card">
      <button
        type="button"
        className="cat-approved-product-media"
        onClick={() => onQuickView(product)}
        aria-label={`Quick view ${product?.title || 'product'}`}
      >
        {product?.product_image ? (
          <img src={product.product_image} alt={product?.title || 'Product'} />
        ) : (
          <span className="cat-approved-product-placeholder"><span /></span>
        )}
      </button>

      <div className="cat-approved-product-copy">
        <span className="cat-approved-product-category">{categoryName}</span>
        <button
          type="button"
          className="cat-approved-product-title"
          onClick={() => onQuickView(product)}
        >
          {product?.title || 'Product title'}
        </button>

        <strong className="cat-approved-product-price">{renderPrice(product)}</strong>

        <div className="cat-approved-product-actions">
          <button
            type="button"
            className="primary"
            onClick={() => onAction(product, 'buy_now', resolveBuyNowUrl(product))}
          >
            {product?.homepage_cta_label || 'Buy Now'}
          </button>

          <button
            type="button"
            onClick={() => onAction(product, 'read_more', resolveReadMoreUrl(product))}
          >
            {product?.storefront_cta_label || 'Read More'}
          </button>
        </div>

        <button
          type="button"
          className="cat-approved-quick-link"
          onClick={() => onQuickView(product)}
        >
          Quick view
        </button>
      </div>
    </article>
  );
}

function ApprovedCategorySponsoredCard({ ad, onView, onClick }) {
  const cardRef = useRef(null);
  const image = resolveSponsoredImage(ad);
  const title = resolveSponsoredTitle(ad);
  const priceValue =
    ad?.price ??
    ad?.target_price ??
    ad?.product_price ??
    null;

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) {
          onView(ad);
          observer.disconnect();
        }
      },
      { threshold: [0.35] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ad, onView]);

  return (
    <article ref={cardRef} className="cat-approved-sponsored-card">
      <span className="cat-approved-ad-badge">Ads</span>

      <button
        type="button"
        className="cat-approved-sponsored-media"
        onClick={() => onClick(ad)}
      >
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <span className="cat-approved-product-placeholder"><span /></span>
        )}
      </button>

      <div className="cat-approved-product-copy">
        <span className="cat-approved-product-category">Sponsored</span>
        <button
          type="button"
          className="cat-approved-product-title"
          onClick={() => onClick(ad)}
        >
          {title}
        </button>

        <strong className="cat-approved-product-price">
          {priceValue !== null && priceValue !== undefined
            ? formatCurrency(priceValue)
            : 'Featured'}
        </strong>

        <div className="cat-approved-product-actions">
          <button type="button" className="primary" onClick={() => onClick(ad)}>
            Buy Now
          </button>
          <button type="button" onClick={() => onClick(ad)}>
            Read More
          </button>
        </div>

        <button type="button" className="cat-approved-quick-link" onClick={() => onClick(ad)}>
          Quick view
        </button>
      </div>
    </article>
  );
}

function ApprovedCategoryQuickView({
  product,
  isSaved,
  actionLoading,
  onClose,
  onTrackedAction,
  onSave,
  onShare,
}) {
  useEffect(() => {
    if (!product) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="cat-approved-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="cat-approved-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Product Quick View"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="cat-approved-modal-close"
          onClick={onClose}
          aria-label="Close quick view"
        >
          x
        </button>

        <h2>Quick View</h2>

        <div className="cat-approved-modal-grid">
          <div className="cat-approved-modal-media">
            {product?.product_image ? (
              <img src={product.product_image} alt={product?.title || 'Product'} />
            ) : (
              <span className="cat-approved-product-placeholder large"><span /></span>
            )}
          </div>

          <div className="cat-approved-modal-copy">
            <span className="cat-approved-modal-category">
              {product?.category?.name || 'Category'}
            </span>
            <h3>{product?.title || 'Product'}</h3>
            <strong>{renderPrice(product)}</strong>
            <p>{product?.short_description || 'No description available.'}</p>

            <div className="cat-approved-modal-actions">
              <button
                type="button"
                className="primary"
                disabled={actionLoading}
                onClick={() => onTrackedAction('buy_now')}
              >
                {actionLoading ? 'Please wait...' : product?.homepage_cta_label || 'Buy Now'}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onTrackedAction('visit_website')}
              >
                Visit Website
              </button>

              <button
                type="button"
                className="wide"
                disabled={actionLoading}
                onClick={() => onTrackedAction('read_more')}
              >
                {product?.storefront_cta_label || 'Read More'}
              </button>
            </div>

            <div className="cat-approved-modal-tools">
              <button type="button" onClick={onSave}>
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button type="button" onClick={onShare}>Share</button>
            </div>
          </div>
        </div>
      </section>
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
  const [columns, setColumns] = useState(3);
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

  const approvedTrackImpression = useCallback(
    async (product) => {
      if (!product?.id || trackedImpressionsRef.current.has(product.id)) return;
      trackedImpressionsRef.current.add(product.id);
      await trackProductEvent(product, 'impression');
    },
    [trackProductEvent]
  );

  const approvedProductAction = useCallback(
    async (product, clickType, fallbackUrl) => {
      if (!product) return;

      try {
        const data = await trackProductEvent(product, clickType);
        const targetUrl =
          data?.redirect_url ||
          data?.url ||
          fallbackUrl;

        if (targetUrl && targetUrl !== '#') {
          window.location.assign(targetUrl);
        }
      } catch {
        if (fallbackUrl && fallbackUrl !== '#') {
          window.location.assign(fallbackUrl);
        }
      }
    },
    [trackProductEvent]
  );

  const approvedTrackedQuickAction = async (clickType) => {
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
      const targetUrl = data?.redirect_url || data?.url || fallbackUrl;

      if (targetUrl && targetUrl !== '#') {
        window.location.assign(targetUrl);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const approvedSave = async () => {
    if (!quickViewProduct?.id) return;

    setSavedProducts((current) => ({
      ...current,
      [quickViewProduct.id]: !current[quickViewProduct.id],
    }));

    try {
      await trackProductEvent(quickViewProduct, 'save');
    } catch {
      // Saving the local visual state should not fail because analytics failed.
    }
  };

  const approvedShare = async () => {
    if (!quickViewProduct) return;

    const shareUrl = resolveReadMoreUrl(quickViewProduct);
    const shareTitle = quickViewProduct?.title || 'Product';

    try {
      await trackProductEvent(quickViewProduct, 'share');
    } catch {
      // Sharing should remain available when analytics is unavailable.
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Share cancellation should not interrupt the page.
    }
  };

  if (loading) {
    return <div className="cat-approved-loading-space" aria-hidden="true" />;
  }

  return (
    <div className="cat-approved-page">
      <aside className="bh-sidebar cat-approved-bh-sidebar">
        <div className="bh-sidebar-brand">
          <Menu size={24} strokeWidth={1.8} />
          <Link to="/">Bloggad</Link>
        </div>

        <nav className="bh-sidebar-nav" aria-label="Public navigation">
          <Link className="bh-sidebar-item active" to="/">
            <Home size={21} strokeWidth={1.8} />
            <span>Home</span>
          </Link>

          <Link className="bh-sidebar-item" to="/reader/saved">
            <Bookmark size={21} strokeWidth={1.8} />
            <span>Library</span>
          </Link>

          <Link className="bh-sidebar-item" to="/reader/profile">
            <UserRound size={21} strokeWidth={1.8} />
            <span>Profile</span>
          </Link>

          <Link className="bh-sidebar-item" to="/writer/posts">
            <BookOpen size={21} strokeWidth={1.8} />
            <span>Stories</span>
          </Link>

          <Link className="bh-sidebar-item" to="/topics">
            <Tags size={21} strokeWidth={1.8} />
            <span>Topics</span>
          </Link>

          <Link className="bh-sidebar-item" to="/writer/analytics">
            <BarChart3 size={21} strokeWidth={1.8} />
            <span>Stats</span>
          </Link>
        </nav>

        <div className="bh-sidebar-divider" />

        <nav className="bh-sidebar-nav cat-approved-follow-nav">
          <Link className="bh-sidebar-item" to="/reader/following">
            <Users size={21} strokeWidth={1.8} />
            <span>Following</span>
          </Link>
        </nav>

        <div className="cat-approved-home-follow-box">
          <Plus size={18} strokeWidth={1.8} />
          <div>
            <p>Find writers and publications to follow.</p>
            <Link to="/topics">See suggestions</Link>
          </div>
        </div>

        <div className="cat-approved-sidebar-categories">
          <h2>Browse categories</h2>

          <div className="cat-approved-sidebar-category-list">
            {allCategories.length ? (
              allCategories.map((item) => (
                <Link
                  key={`sidebar-${item.id}`}
                  className={item.slug === slug ? 'active' : ''}
                  to={`/category/${item.slug}`}
                >
                  {item.name}
                </Link>
              ))
            ) : (
              <span>No categories available.</span>
            )}
          </div>
        </div>
      </aside>

      <header className="cat-approved-header">
        <Link className="cat-approved-mobile-brand" to="/">Bloggad</Link>

        <label className="cat-approved-header-search">
          <Search size={15} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search"
          />
        </label>

        <div className="cat-approved-header-actions">
          <button type="button" className="cat-approved-get-app">Get app</button>
          <Link to="/writer/posts/create">Write</Link>
          <span className="cat-approved-header-circle" />
          <Link className="cat-approved-header-avatar" to="/reader/profile">U</Link>
        </div>
      </header>

      <main className="cat-approved-main">
        {error ? <div className="cat-approved-error">{error}</div> : null}

        <div className="cat-approved-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{currentCategoryName}</span>
        </div>

        <section className="cat-approved-title-row">
          <h1>{currentCategoryName}</h1>
          <p>Browse products from independent sellers and publications across Bloggad.</p>
        </section>

        <div className="cat-approved-mobile-categories">
          {allCategories.slice(0, 5).map((item) => (
            <Link
              key={`mobile-top-${item.id}`}
              className={item.slug === slug ? 'active' : ''}
              to={`/category/${item.slug}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="cat-approved-mobile-tools">
          <button type="button" onClick={() => setSidebarOpen(true)}>Filter</button>
          <select value={sortValue} onChange={(event) => setSortValue(event.target.value)}>
            <option value="default">Default sorting</option>
            <option value="price_low_high">Price: low to high</option>
            <option value="price_high_low">Price: high to low</option>
            <option value="name_az">Name: A to Z</option>
            <option value="name_za">Name: Z to A</option>
          </select>
        </div>

        <div className="cat-approved-market-grid">
          <section className="cat-approved-products-area">
            <div className="cat-approved-toolbar">
              <div className="cat-approved-toolbar-count">
                <strong>{filteredProducts.length} products</strong>
              </div>

              <div className="cat-approved-show-count">
                <span>Show:</span>
                {[20, 16, 12, 8].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={itemsPerPage === count ? 'active' : ''}
                    onClick={() => setItemsPerPage(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>

              <label className="cat-approved-product-search">
                <Search size={14} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products"
                />
              </label>

              <select
                className="cat-approved-sort"
                value={sortValue}
                onChange={(event) => setSortValue(event.target.value)}
              >
                <option value="default">Default sorting</option>
                <option value="price_low_high">Price: low to high</option>
                <option value="price_high_low">Price: high to low</option>
                <option value="name_az">Name: A to Z</option>
                <option value="name_za">Name: Z to A</option>
              </select>

              <div className="cat-approved-grid-buttons">
                <button
                  type="button"
                  className={columns === 3 ? 'active' : ''}
                  onClick={() => setColumns(3)}
                  aria-label="Three columns"
                >
                  :::
                </button>
                <button
                  type="button"
                  className={columns === 4 ? 'active' : ''}
                  onClick={() => setColumns(4)}
                  aria-label="Four columns"
                >
                  ::
                </button>
              </div>
            </div>

            {sponsoredAds.length ? (
              <section className="cat-approved-featured">
                <div className="cat-approved-section-heading">
                  <h2>Featured Product</h2>
                  <span>Ads</span>
                </div>

                <div className="cat-approved-sponsored-grid">
                  {sponsoredAds.map((ad) => (
                    <ApprovedCategorySponsoredCard
                      key={ad.id}
                      ad={ad}
                      onView={trackSponsoredView}
                      onClick={trackSponsoredClick}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="cat-approved-all-products">
              <h2>All products</h2>

              {filteredProducts.length ? (
                <div
                  className="cat-approved-product-grid"
                  style={{ '--cat-approved-columns': columns }}
                >
                  {filteredProducts.map((product, index) => (
                    <ApprovedCategoryProductCard
                      key={product.id || index}
                      product={product}
                      onQuickView={setQuickViewProduct}
                      onImpression={approvedTrackImpression}
                      onAction={approvedProductAction}
                    />
                  ))}
                </div>
              ) : (
                <div className="cat-approved-empty">No products matched your search.</div>
              )}
            </section>
          </section>
        </div>
      </main>

      {sidebarOpen ? (
        <div className="cat-approved-drawer-backdrop" onMouseDown={() => setSidebarOpen(false)}>
          <aside
            className="cat-approved-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cat-approved-drawer-head">
              <strong>Categories</strong>
              <button type="button" onClick={() => setSidebarOpen(false)}>x</button>
            </div>

            <div className="cat-approved-drawer-list">
              {allCategories.map((item) => (
                <Link
                  key={`drawer-${item.id}`}
                  className={item.slug === slug ? 'active' : ''}
                  to={`/category/${item.slug}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      ) : null}

      <ApprovedCategoryQuickView
        product={quickViewProduct}
        isSaved={!!savedProducts[quickViewProduct?.id]}
        actionLoading={actionLoading}
        onClose={() => setQuickViewProduct(null)}
        onTrackedAction={approvedTrackedQuickAction}
        onSave={approvedSave}
        onShare={approvedShare}
      />

      <nav className="cat-approved-mobile-bottom">
        <Link className="active" to="/">Home</Link>
        <Link to="/reader/saved">Library</Link>
        <Link to="/writer/posts/create">Write</Link>
        <Link to="/reader/profile">Profile</Link>
      </nav>
    </div>
  );
}