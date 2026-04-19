import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function renderPrice(product) {
  if (product.pricing_type === 'simple') {
    return product.price !== null && product.price !== undefined
      ? formatCurrency(product.price)
      : '-';
  }

  return `${formatCurrency(product.min_price || 0)} - ${formatCurrency(product.max_price || 0)}`;
}

export default function HomePage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading homepage...</div>
      </div>
    );
  }

  const stats = pageData?.stats || {};
  const categories = pageData?.categories || [];
  const products = pageData?.products || [];

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Bloggad Marketplace</h1>
          <p className="page-subtitle">
            Discover affiliate storefronts, products, categories, and blog-style buying guides.
          </p>
        </div>

        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Products</div>
            <div className="stat-value">{stats.total_products || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Websites</div>
            <div className="stat-value">{stats.total_websites || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Categories</div>
            <div className="stat-value">{stats.total_categories || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Posts</div>
            <div className="stat-value">{stats.total_posts || 0}</div>
          </div>
        </div>

        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h2 className="section-title">Browse Categories</h2>

          <div className="grid-4">
            {categories.length ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="surface-card surface-card-padding"
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{category.name}</div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Products: {category.total_products || 0}
                  </div>
                </Link>
              ))
            ) : (
              <div>No categories available.</div>
            )}
          </div>
        </div>

        <div className="surface-card surface-card-padding">
          <h2 className="section-title">Featured Products</h2>

          <div className="grid-3">
            {products.length ? (
              products.map((product) => (
                <div key={product.id} className="surface-card surface-card-padding">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.title}
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
                    <div style={{ fontSize: '1.08rem', fontWeight: 700 }}>{product.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Website: {product.affiliate?.website_name || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Affiliate: {product.affiliate?.name || '-'}
                    </div>
                    <div style={{ fontWeight: 700 }}>{renderPrice(product)}</div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                      <Link className="btn btn-primary" to={product.read_more_url || '#'}>
                        {product.storefront_cta_label || 'Read More'}
                      </Link>

                      <Link className="btn btn-secondary" to={product.website_url || '#'}>
                        Visit Store
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No products available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}