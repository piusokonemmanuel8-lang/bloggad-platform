import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import LocalizedPrice from '../../components/common/LocalizedPrice';

function renderPrice(product) {
  if (!product) return '-';

  if (product.pricing_type === 'simple') {
    return product.price !== null && product.price !== undefined ? (
      <LocalizedPrice product={product} />
    ) : (
      '-'
    );
  }

  return (
    <>
      <LocalizedPrice amount={product.min_price || 0} />
      {' - '}
      <LocalizedPrice amount={product.max_price || 0} />
    </>
  );
}

export default function ProductPage() {
  const { websiteSlug, slug } = useParams();

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clickLoading, setClickLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/api/public/products/${websiteSlug}/product/${slug}`);
        setProductData(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (websiteSlug && slug) {
      fetchProduct();
    }
  }, [websiteSlug, slug]);

  const handleTrackedClick = async (clickType) => {
    try {
      setClickLoading(true);
      setError('');

      const { data } = await api.post(
        `/api/public/products/${websiteSlug}/product/${slug}/click`,
        {
          click_type: clickType,
        }
      );

      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to process click');
    } finally {
      setClickLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#ffffff',
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
            padding: '18px 22px',
            color: '#111827',
            fontWeight: 700,
          }}
        >
          Loading product...
        </div>
      </div>
    );
  }

  const product = productData?.product;
  const posts = productData?.posts || [];
  const relatedProducts = productData?.related_products || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
      }}
    >
      <style>{`
        .product-page-container {
          width: min(1280px, calc(100% - 32px));
          margin: 0 auto;
          padding: 28px 0 56px;
        }

        .product-page-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
        }

        .product-page-posts-grid,
        .product-page-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        @media (max-width: 980px) {
          .product-page-grid,
          .product-page-posts-grid,
          .product-page-related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="product-page-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 18,
            color: '#6b7280',
            fontSize: 14,
          }}
        >
          <Link
            to={`/${websiteSlug}`}
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Back to Store
          </Link>
          <span>/</span>
          <span>{product?.title || 'Product'}</span>
        </div>

        {error ? (
          <div
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: 16,
              padding: 14,
              color: '#9a3412',
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="product-page-grid" style={{ marginBottom: 24 }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 22,
              padding: 18,
            }}
          >
            {product?.product_image ? (
              <img
                src={product.product_image}
                alt={product.title}
                style={{
                  width: '100%',
                  height: 520,
                  objectFit: 'contain',
                  borderRadius: 16,
                  background: '#f8fafc',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  height: 520,
                  borderRadius: 16,
                  background: '#f8fafc',
                }}
              />
            )}
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 22,
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 32,
                padding: '0 12px',
                borderRadius: 999,
                background: '#eff6ff',
                color: '#1d4ed8',
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 16,
              }}
            >
              {product?.category?.name || 'Product'}
            </div>

            <h1
              style={{
                margin: 0,
                color: '#111827',
                fontSize: 36,
                lineHeight: 1.1,
                fontWeight: 900,
                letterSpacing: '-0.03em',
              }}
            >
              {product?.title || 'Product'}
            </h1>

            <p
              style={{
                margin: '10px 0 0',
                color: '#6b7280',
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {product?.affiliate?.website_name || '-'} • {product?.affiliate?.name || '-'}
            </p>

            <div
              style={{
                marginTop: 22,
                fontSize: 30,
                fontWeight: 900,
                color: '#2563eb',
              }}
            >
              {renderPrice(product)}
            </div>

            <div
              style={{
                marginTop: 20,
                display: 'grid',
                gap: 14,
                color: '#374151',
                fontSize: 15,
              }}
            >
              <div>
                <strong style={{ color: '#111827' }}>Category:</strong>{' '}
                {product?.category?.name || '-'}
              </div>
              <div>
                <strong style={{ color: '#111827' }}>Status:</strong> {product?.status || '-'}
              </div>
              <div>
                <strong style={{ color: '#111827' }}>Description:</strong>{' '}
                {product?.short_description || 'No description'}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 26,
              }}
            >
              <button
                type="button"
                onClick={() => handleTrackedClick('buy_now')}
                disabled={clickLoading}
                style={{
                  minHeight: 48,
                  padding: '0 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {clickLoading ? 'Please wait...' : product?.homepage_cta_label || 'Buy Now'}
              </button>

              <button
                type="button"
                onClick={() => handleTrackedClick('read_more')}
                disabled={clickLoading}
                style={{
                  minHeight: 48,
                  padding: '0 18px',
                  borderRadius: 12,
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#111827',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {clickLoading ? 'Please wait...' : product?.storefront_cta_label || 'Read More'}
              </button>

              <Link
                to={`/${websiteSlug}`}
                style={{
                  minHeight: 48,
                  padding: '0 18px',
                  borderRadius: 12,
                  border: '1px solid #d1d5db',
                  background: '#f9fafb',
                  color: '#111827',
                  textDecoration: 'none',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Visit Store
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 22,
            padding: 22,
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              margin: '0 0 18px',
              color: '#111827',
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            Posts About This Product
          </h2>

          <div className="product-page-posts-grid">
            {posts.length ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 18,
                    overflow: 'hidden',
                  }}
                >
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : null}

                  <div style={{ padding: 16, display: 'grid', gap: 10 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: '#111827',
                        fontSize: 18,
                        lineHeight: 1.35,
                      }}
                    >
                      {post.title}
                    </div>

                    <div
                      style={{
                        color: '#6b7280',
                        lineHeight: 1.7,
                        fontSize: 14,
                      }}
                    >
                      {post.excerpt || 'No excerpt'}
                    </div>

                    <Link
                      to={post.url || `/${websiteSlug}/post/${post.slug}`}
                      style={{
                        minHeight: 44,
                        padding: '0 16px',
                        borderRadius: 12,
                        background: '#111827',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 'fit-content',
                      }}
                    >
                      Read Post
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#6b7280' }}>No posts available for this product yet.</div>
            )}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 22,
            padding: 22,
          }}
        >
          <h2
            style={{
              margin: '0 0 18px',
              color: '#111827',
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            Related Products
          </h2>

          <div className="product-page-related-grid">
            {relatedProducts.length ? (
              relatedProducts.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 18,
                    overflow: 'hidden',
                  }}
                >
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'contain',
                        background: '#f8fafc',
                        display: 'block',
                      }}
                    />
                  ) : null}

                  <div style={{ padding: 16, display: 'grid', gap: 8 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: '#111827',
                        fontSize: 18,
                        lineHeight: 1.35,
                      }}
                    >
                      {item.title}
                    </div>

                    <div
                      style={{
                        color: '#6b7280',
                        fontSize: 14,
                      }}
                    >
                      {item.category?.name || '-'}
                    </div>

                    <div
                      style={{
                        fontWeight: 900,
                        color: '#2563eb',
                        fontSize: 18,
                      }}
                    >
                      {renderPrice(item)}
                    </div>

                    <Link
                      to={`/${websiteSlug}/product/${item.slug}`}
                      style={{
                        minHeight: 44,
                        padding: '0 16px',
                        borderRadius: 12,
                        background: '#f9fafb',
                        border: '1px solid #d1d5db',
                        color: '#111827',
                        textDecoration: 'none',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 'fit-content',
                      }}
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#6b7280' }}>No related products found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}