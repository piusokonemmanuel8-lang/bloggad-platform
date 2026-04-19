import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function renderPrice(product) {
  if (!product) return '-';

  if (product.pricing_type === 'simple') {
    return product.price !== null && product.price !== undefined
      ? formatCurrency(product.price)
      : '-';
  }

  return `${formatCurrency(product.min_price || 0)} - ${formatCurrency(product.max_price || 0)}`;
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

      const { data } = await api.post(`/api/public/products/${websiteSlug}/product/${slug}/click`, {
        click_type: clickType,
      });

      if (data?.redirect_url) {
        if (clickType === 'buy_now') {
          window.location.href = data.redirect_url;
          return;
        }

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
      <div className="page-shell">
        <div className="container section-space">Loading product...</div>
      </div>
    );
  }

  const product = productData?.product;
  const posts = productData?.posts || [];
  const relatedProducts = productData?.related_products || [];

  return (
    <div className="page-shell">
      <div className="container section-space">
        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="surface-card surface-card-padding">
            {product?.product_image ? (
              <img
                src={product.product_image}
                alt={product.title}
                style={{
                  width: '100%',
                  height: 420,
                  objectFit: 'cover',
                  borderRadius: 18,
                }}
              />
            ) : (
              <div style={{ height: 420 }} />
            )}
          </div>

          <div className="surface-card surface-card-padding">
            <h1 className="page-title">{product?.title || 'Product'}</h1>
            <p className="page-subtitle">
              {product?.affiliate?.website_name || '-'} • {product?.affiliate?.name || '-'}
            </p>

            <div className="form-stack" style={{ marginTop: 20 }}>
              <div>
                <strong>Price:</strong> {renderPrice(product)}
              </div>
              <div>
                <strong>Category:</strong> {product?.category?.name || '-'}
              </div>
              <div>
                <strong>Status:</strong> {product?.status || '-'}
              </div>
              <div>
                <strong>Description:</strong> {product?.short_description || 'No description'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => handleTrackedClick('buy_now')}
                disabled={clickLoading}
              >
                {clickLoading ? 'Please wait...' : product?.homepage_cta_label || 'Buy Now'}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => handleTrackedClick('read_more')}
                disabled={clickLoading}
              >
                {clickLoading ? 'Please wait...' : product?.storefront_cta_label || 'Read More'}
              </button>

              <Link className="btn btn-secondary" to={`/${websiteSlug}`}>
                Visit Store
              </Link>
            </div>
          </div>
        </div>

        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h2 className="section-title">Posts About This Product</h2>

          <div className="grid-3">
            {posts.length ? (
              posts.map((post) => (
                <div key={post.id} className="surface-card surface-card-padding">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontWeight: 700 }}>{post.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      {post.excerpt || 'No excerpt'}
                    </div>

                    <Link className="btn btn-primary" to={post.url || `/${websiteSlug}/post/${post.slug}`}>
                      Read Post
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div>No posts available for this product yet.</div>
            )}
          </div>
        </div>

        <div className="surface-card surface-card-padding">
          <h2 className="section-title">Related Products</h2>

          <div className="grid-3">
            {relatedProducts.length ? (
              relatedProducts.map((item) => (
                <div key={item.id} className="surface-card surface-card-padding">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      {item.category?.name || '-'}
                    </div>
                    <div style={{ fontWeight: 700 }}>{renderPrice(item)}</div>

                    <Link className="btn btn-secondary" to={`/${websiteSlug}/product/${item.slug}`}>
                      View Product
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div>No related products found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}