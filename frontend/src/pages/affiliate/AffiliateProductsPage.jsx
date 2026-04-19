import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function renderPrice(product) {
  if (product.pricing_type === 'simple') {
    return product.price !== null ? formatCurrency(product.price) : '-';
  }

  return `${formatCurrency(product.min_price || 0)} - ${formatCurrency(product.max_price || 0)}`;
}

export default function AffiliateProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/affiliate/products');
        setProducts(data?.products || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div
          className="surface-card surface-card-padding"
          style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}
        >
          <div>
            <h1 className="page-title">My Products</h1>
            <p className="page-subtitle">Manage all products on your affiliate website.</p>
          </div>

          <Link className="btn btn-primary" to="/affiliate/products/create">
            Create Product
          </Link>
        </div>

        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

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
                  <div style={{ color: 'rgba(245,247,251,0.7)' }}>Status: {product.status}</div>
                  <div style={{ color: 'rgba(245,247,251,0.7)' }}>
                    Pricing: {product.pricing_type}
                  </div>
                  <div style={{ fontWeight: 700 }}>{renderPrice(product)}</div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    <Link className="btn btn-secondary" to={`/affiliate/products/${product.id}/edit`}>
                      Edit
                    </Link>

                    <Link className="btn btn-secondary" to={`/affiliate/products/${product.id}/posts`}>
                      Posts
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="surface-card surface-card-padding">No products yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}