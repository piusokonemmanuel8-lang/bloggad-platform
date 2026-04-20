import { Link } from 'react-router-dom';

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
  const displayCategories = (categories || []).slice(0, settings.categoriesLimit || 4);
  const displayProducts = (products || []).slice(0, settings.offersLimit || 8);
  const displayArticles = (articles || []).slice(0, settings.articleLimit || 3);

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
    </div>
  );
}