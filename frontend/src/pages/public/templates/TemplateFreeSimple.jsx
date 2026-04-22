import { Link } from 'react-router-dom';
import { User, X } from 'lucide-react';
import { useMemo, useState } from 'react';

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

  const websiteSlug = resolveWebsiteSlug(product, fallbackWebsiteSlug);
  if (websiteSlug && product?.slug) return `/${websiteSlug}/product/${product.slug}`;
  if (product?.slug) return `/product/${product.slug}`;
  return '#';
}

function resolveBuyNowUrl(product) {
  return product?.affiliate_buy_url || product?.website_url || '#';
}

function resolveCategoryUrl(category, websiteSlug) {
  return category?.url || `/${websiteSlug}/category/${category?.slug || ''}`;
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

function SimpleProductCard({ product, websiteSlug, formatCurrency }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <Link
        to={resolveReadMoreUrl(product, websiteSlug)}
        style={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            background: '#f8fafc',
            overflow: 'hidden',
          }}
        >
          <img
            src={product?.product_image}
            alt={product?.title || 'Product'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </Link>

      <div style={{ padding: 14 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.4,
            minHeight: 42,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 16,
            fontWeight: 800,
            color: '#2563eb',
          }}
        >
          {renderPrice(product, formatCurrency)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginTop: 14,
          }}
        >
          <a
            href={resolveBuyNowUrl(product)}
            target="_blank"
            rel="noreferrer"
            style={{
              height: 42,
              borderRadius: 10,
              background: '#2563eb',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Buy Now
          </a>

          <Link
            to={resolveReadMoreUrl(product, websiteSlug)}
            style={{
              height: 42,
              borderRadius: 10,
              background: '#f3f4f6',
              color: '#111827',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TemplateFreeSimple({
  website,
  websiteSlug,
  categories,
  products,
  articles,
  settings,
  formatCurrency,
}) {
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);

  const displayCategories = (categories || []).slice(0, settings.categoriesLimit || 4);
  const displayProducts = (products || []).slice(0, settings.offersLimit || 8);
  const displayArticles = (articles || []).slice(0, settings.articleLimit || 3);

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
      }}
    >
      <style>{`
        .free-template-container {
          width: min(1200px, calc(100% - 32px));
          margin: 0 auto;
        }

        @media (max-width: 860px) {
          .free-template-categories,
          .free-template-products,
          .free-template-articles {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div
          className="free-template-container"
          style={{
            minHeight: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: '#111827',
              }}
            >
              {website?.website_name || 'Bloggad'}
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#6b7280',
              }}
            >
              Simple storefront
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setCustomerAuthOpen(true)}
              style={{
                height: 42,
                padding: '0 18px',
                borderRadius: 10,
                border: '1px solid #dbe3f0',
                background: '#ffffff',
                color: '#111827',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <User size={16} />
              Sign In
            </button>

            <Link
              to={`/${websiteSlug}`}
              style={{
                height: 42,
                padding: '0 18px',
                borderRadius: 10,
                background: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Visit Store
            </Link>
          </div>
        </div>
      </header>

      <main className="free-template-container" style={{ padding: '26px 0 60px' }}>
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1.15,
            }}
          >
            {website?.website_name || 'Storefront'}
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 16,
              color: '#4b5563',
              maxWidth: 760,
              lineHeight: 1.7,
            }}
          >
            Clean free template for affiliates that want a simple store layout.
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#111827',
              marginBottom: 16,
            }}
          >
            Categories
          </div>

          <div
            className="free-template-categories"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(settings.categoriesPerRow || 4, 4)}, minmax(0, 1fr))`,
              gap: 16,
            }}
          >
            {displayCategories.map((category, index) => (
              <Link
                key={category?.id || index}
                to={resolveCategoryUrl(category, websiteSlug)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 18,
                  textDecoration: 'none',
                  color: '#111827',
                  fontWeight: 700,
                }}
              >
                <div>{category?.name || 'Category'}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: '#6b7280',
                    fontWeight: 500,
                  }}
                >
                  {category?.total_products || 0} products
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#111827',
              marginBottom: 16,
            }}
          >
            Products
          </div>

          <div
            className="free-template-products"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(settings.offersPerRow || 4, 4)}, minmax(0, 1fr))`,
              gap: 16,
            }}
          >
            {displayProducts.map((product, index) => (
              <SimpleProductCard
                key={product?.id || index}
                product={product}
                websiteSlug={websiteSlug}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#111827',
              marginBottom: 16,
            }}
          >
            Articles
          </div>

          <div
            className="free-template-articles"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(settings.articlePerRow || 3, 3)}, minmax(0, 1fr))`,
              gap: 16,
            }}
          >
            {displayArticles.map((article, index) => (
              <Link
                key={article?.id || index}
                to={article?.url || '#'}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: '#111827',
                }}
              >
                <img
                  src={article?.featured_image}
                  alt={article?.title || 'Article'}
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      lineHeight: 1.35,
                    }}
                  >
                    {article?.title || 'Article'}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 14,
                      color: '#6b7280',
                      lineHeight: 1.7,
                    }}
                  >
                    {article?.excerpt || 'Read more from this website.'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <CustomerAuthPopup
        open={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
        websiteSlug={websiteSlug}
        websiteId={popupWebsiteId}
        affiliateId={popupAffiliateId}
      />
    </div>
  );
}