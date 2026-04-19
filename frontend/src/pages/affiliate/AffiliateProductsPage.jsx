import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Pencil,
  FileText,
  RefreshCw,
  AlertCircle,
  Search,
  Eye,
  Tag,
  Layers3,
} from 'lucide-react';
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

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'active' || value === 'published') return 'affiliate-products-status active';
  if (value === 'inactive') return 'affiliate-products-status inactive';
  if (value === 'draft' || value === 'pending') return 'affiliate-products-status draft';
  if (value === 'rejected' || value === 'suspended') return 'affiliate-products-status danger';

  return 'affiliate-products-status neutral';
}

function ProductCard({ product }) {
  return (
    <div className="affiliate-products-card">
      <div className="affiliate-products-image-wrap">
        {product.product_image ? (
          <img
            src={product.product_image}
            alt={product.title}
            className="affiliate-products-image"
          />
        ) : (
          <div className="affiliate-products-image-placeholder">
            <Package size={28} />
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="affiliate-products-card-body">
        <div className="affiliate-products-card-top">
          <div className="affiliate-products-card-title-wrap">
            <h3 className="affiliate-products-card-title">{product.title}</h3>
            <span className={getStatusClass(product.status)}>{product.status || 'draft'}</span>
          </div>
        </div>

        <div className="affiliate-products-meta-grid">
          <div className="affiliate-products-meta-box">
            <span className="affiliate-products-meta-label">Pricing type</span>
            <strong>{product.pricing_type || '-'}</strong>
          </div>

          <div className="affiliate-products-meta-box">
            <span className="affiliate-products-meta-label">Price</span>
            <strong>{renderPrice(product)}</strong>
          </div>
        </div>

        <div className="affiliate-products-actions">
          <Link
            className="affiliate-products-btn secondary"
            to={`/affiliate/products/${product.id}/edit`}
          >
            <Pencil size={16} />
            Edit
          </Link>

          <Link
            className="affiliate-products-btn secondary"
            to={`/affiliate/products/${product.id}/posts`}
          >
            <FileText size={16} />
            Posts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchProducts = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/api/affiliate/products');
      const productRows = data?.products || [];
      setProducts(productRows);
      setFilteredProducts(productRows);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredProducts(products);
      return;
    }

    const nextRows = products.filter((product) => {
      const title = String(product?.title || '').toLowerCase();
      const status = String(product?.status || '').toLowerCase();
      const pricingType = String(product?.pricing_type || '').toLowerCase();

      return (
        title.includes(keyword) ||
        status.includes(keyword) ||
        pricingType.includes(keyword)
      );
    });

    setFilteredProducts(nextRows);
  }, [search, products]);

  const totals = useMemo(() => {
    const total = products.length;
    const active = products.filter((item) =>
      ['active', 'published'].includes(String(item.status || '').toLowerCase())
    ).length;
    const draft = products.filter((item) =>
      ['draft', 'pending'].includes(String(item.status || '').toLowerCase())
    ).length;

    return { total, active, draft };
  }, [products]);

  if (loading) {
    return (
      <div className="affiliate-products-page">
        <style>{styles}</style>

        <div className="affiliate-products-loading-wrap">
          <div className="affiliate-products-loading-card">
            <div className="affiliate-products-spinner" />
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-products-page">
      <style>{styles}</style>

      <section className="affiliate-products-hero">
        <div className="affiliate-products-hero-copy">
          <div className="affiliate-products-badge">Product manager</div>
          <h1 className="affiliate-products-title">My Products</h1>
          <p className="affiliate-products-subtitle">
            Manage all products on your affiliate website from one clean dashboard page.
          </p>
        </div>

        <div className="affiliate-products-hero-actions">
          <button
            type="button"
            className="affiliate-products-btn secondary"
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link className="affiliate-products-btn primary" to="/affiliate/products/create">
            <Plus size={16} />
            Create Product
          </Link>
        </div>
      </section>

      <section className="affiliate-products-stats">
        <div className="affiliate-products-stat-card">
          <div className="affiliate-products-stat-top">
            <div>
              <p className="affiliate-products-stat-label">Total Products</p>
              <h3 className="affiliate-products-stat-value">{totals.total}</h3>
            </div>
            <div className="affiliate-products-stat-icon">
              <Layers3 size={20} />
            </div>
          </div>
        </div>

        <div className="affiliate-products-stat-card">
          <div className="affiliate-products-stat-top">
            <div>
              <p className="affiliate-products-stat-label">Active</p>
              <h3 className="affiliate-products-stat-value">{totals.active}</h3>
            </div>
            <div className="affiliate-products-stat-icon">
              <Eye size={20} />
            </div>
          </div>
        </div>

        <div className="affiliate-products-stat-card">
          <div className="affiliate-products-stat-top">
            <div>
              <p className="affiliate-products-stat-label">Draft / Pending</p>
              <h3 className="affiliate-products-stat-value">{totals.draft}</h3>
            </div>
            <div className="affiliate-products-stat-icon">
              <Tag size={20} />
            </div>
          </div>
        </div>
      </section>

      <section className="affiliate-products-toolbar">
        <div className="affiliate-products-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search products by title, status or pricing type"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </section>

      {error ? (
        <div className="affiliate-products-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {filteredProducts.length ? (
        <section className="affiliate-products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : (
        <section className="affiliate-products-empty">
          <Package size={32} />
          <h3>{products.length ? 'No matching products found' : 'No products yet'}</h3>
          <p>
            {products.length
              ? 'Try another search keyword.'
              : 'Create your first product to start building your affiliate store.'}
          </p>

          {!products.length ? (
            <Link className="affiliate-products-btn primary" to="/affiliate/products/create">
              <Plus size={16} />
              Create Product
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-products-page {
    width: 100%;
  }

  .affiliate-products-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-products-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-products-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateProductsSpin 0.8s linear infinite;
  }

  @keyframes affiliateProductsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateProductsSpin 0.8s linear infinite;
  }

  .affiliate-products-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-products-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-products-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-products-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-products-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-products-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-products-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-products-btn.secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-products-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-products-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-products-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-products-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-products-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-products-stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-products-toolbar {
    margin-bottom: 20px;
  }

  .affiliate-products-search {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 0 14px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-products-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #111827;
    font-size: 14px;
  }

  .affiliate-products-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-products-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-products-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-products-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-products-image-wrap {
    width: 100%;
    height: 240px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
  }

  .affiliate-products-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-products-image-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-products-card-body {
    padding: 18px;
  }

  .affiliate-products-card-top {
    margin-bottom: 14px;
  }

  .affiliate-products-card-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-products-card-title {
    margin: 0;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-products-status {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .affiliate-products-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-products-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-products-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-products-status.danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-products-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-products-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .affiliate-products-meta-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-products-meta-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-products-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .affiliate-products-empty {
    min-height: 320px;
    border: 1px dashed #dbe2ea;
    background: #ffffff;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 24px;
  }

  .affiliate-products-empty h3 {
    margin: 0;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-products-empty p {
    margin: 0 0 8px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-products-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-products-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-products-title {
      font-size: 26px;
    }

    .affiliate-products-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-products-hero-actions {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .affiliate-products-grid,
    .affiliate-products-meta-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-products-title {
      font-size: 22px;
    }

    .affiliate-products-subtitle {
      font-size: 14px;
    }

    .affiliate-products-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-products-btn {
      width: 100%;
    }

    .affiliate-products-image-wrap {
      height: 220px;
    }
  }
`;