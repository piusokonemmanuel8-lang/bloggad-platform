import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

export default function CategoryPage() {
  const { slug } = useParams();

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/public/categories/${slug}`);
        setCategoryData(data || null);
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading category...</div>
      </div>
    );
  }

  const category = categoryData?.category;
  const products = categoryData?.products || [];

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">{category?.name || 'Category'}</h1>
          <p className="page-subtitle">
            Browse products inside this marketplace category.
          </p>
        </div>

        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="surface-card surface-card-padding">
          <h2 className="section-title">Products</h2>

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
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      {product.short_description || ''}
                    </div>

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
              <div>No products found in this category.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}