import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import validateSupgadUrl from '../../utils/validateSupgadUrl';

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

function AffiliateProductsLegacy() {
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

function makeWriterProductSlug(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function makeEmptyWriterProductForm() {
  return {
    category_id: '',
    title: '',
    slug: '',
    product_image: '',
    pricing_type: 'simple',
    price: '',
    min_price: '',
    max_price: '',
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    affiliate_buy_url: '',
    short_description: '',
    status: 'draft',
  };
}

function normalizeWriterProductForm(product = {}) {
  return {
    category_id: product.category_id || '',
    title: product.title || '',
    slug: product.slug || '',
    product_image: product.product_image || '',
    pricing_type: product.pricing_type || 'simple',
    price: product.price ?? '',
    min_price: product.min_price ?? '',
    max_price: product.max_price ?? '',
    homepage_cta_label: product.homepage_cta_label || 'Buy Now',
    storefront_cta_label: product.storefront_cta_label || 'Read More',
    affiliate_buy_url: product.affiliate_buy_url || '',
    short_description: product.short_description || '',
    status: product.status || 'draft',
  };
}

function writerProductStatusClass(status = '') {
  const clean = String(status || '').toLowerCase();
  if (clean === 'published') return 'wp-status published';
  if (clean === 'draft') return 'wp-status draft';
  if (clean === 'inactive') return 'wp-status inactive';
  return 'wp-status neutral';
}

function WriterProductImage({ product }) {
  if (product?.product_image) {
    return (
      <img
        className="wp-product-image"
        src={product.product_image}
        alt=""
      />
    );
  }

  return (
    <span className="wp-product-image wp-product-image-placeholder" aria-hidden="true">
      <Package size={18} />
    </span>
  );
}

function WriterProductDrawer({
  mode,
  productId,
  categories,
  categoriesLoading,
  onCategoriesNeeded,
  onClose,
  onSaved,
}) {
  const editing = mode === 'edit';
  const [form, setForm] = useState(makeEmptyWriterProductForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    onCategoriesNeeded();

    if (!editing || !productId) {
      setForm(makeEmptyWriterProductForm());
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get(`/api/affiliate/products/${productId}`);

        if (!active) return;

        if (!data?.product) {
          throw new Error('Product not found');
        }

        setForm(normalizeWriterProductForm(data.product));
      } catch (err) {
        if (active) {
          setError(err?.response?.data?.message || err.message || 'Failed to load product');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [editing, productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const next = {
        ...previous,
        [name]: value,
      };

      if (!editing && name === 'title' && !previous.slug.trim()) {
        next.slug = makeWriterProductSlug(value);
      }

      return next;
    });
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Product image must be below 10MB.');
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    setError('');
    setSelectedImageName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        product_image: String(reader.result || ''),
      }));
      setUploadingImage(false);
    };

    reader.onerror = () => {
      setUploadingImage(false);
      setSelectedImageName('');
      setError('Failed to read the selected image file.');
    };

    reader.readAsDataURL(file);
  };

  const validateAndBuildPayload = () => {
    if (!form.title.trim()) {
      throw new Error('Product title is required');
    }

    if (!form.product_image.trim()) {
      throw new Error('Product image is required');
    }

    if (form.pricing_type === 'simple' && !form.price) {
      throw new Error('Price is required for simple product');
    }

    if (form.pricing_type === 'variable') {
      if (!form.min_price || !form.max_price) {
        throw new Error('Minimum and maximum price are required for variable product');
      }

      if (Number(form.max_price) < Number(form.min_price)) {
        throw new Error('Maximum price must be greater than or equal to minimum price');
      }
    }

    if (form.affiliate_buy_url.trim()) {
      const validation = validateSupgadUrl(form.affiliate_buy_url, {
        required: true,
        allowEmpty: false,
        fieldName: 'Affiliate Buy URL',
      });

      if (!validation.ok) {
        throw new Error(validation.message);
      }
    }

    return {
      category_id: form.category_id || null,
      title: form.title,
      slug: form.slug,
      product_image: form.product_image,
      pricing_type: form.pricing_type,
      price: form.pricing_type === 'simple' ? form.price : null,
      min_price: form.pricing_type === 'variable' ? form.min_price : null,
      max_price: form.pricing_type === 'variable' ? form.max_price : null,
      homepage_cta_label: form.homepage_cta_label,
      storefront_cta_label: form.storefront_cta_label,
      affiliate_buy_url: form.affiliate_buy_url,
      short_description: form.short_description,
      status: form.status,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = validateAndBuildPayload();

      let response;

      if (editing) {
        response = await api.put(`/api/affiliate/products/${productId}`, payload);
      } else {
        response = await api.post('/api/affiliate/products', payload);
      }

      await onSaved(
        response?.data?.message ||
          (editing ? 'Product updated successfully' : 'Product created successfully')
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          (editing ? 'Failed to update product' : 'Failed to create product')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wp-drawer-layer" role="presentation">
      <button
        type="button"
        className="wp-drawer-backdrop"
        aria-label="Close product form"
        onClick={onClose}
      />

      <aside className="wp-drawer" role="dialog" aria-modal="true" aria-label={editing ? 'Edit product' : 'Create product'}>
        <div className="wp-drawer-head">
          <div>
            <h2>{editing ? 'Edit product' : 'Create product'}</h2>
            <p>{editing ? 'Update the product details below.' : 'Add a product to your Writer storefront.'}</p>
          </div>

          <button type="button" className="wp-icon-btn" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>

        {loading ? (
          <div className="wp-drawer-state">Loading product...</div>
        ) : (
          <form className="wp-drawer-form" onSubmit={handleSubmit}>
            <div className="wp-form-scroll">
              {error ? (
                <div className="wp-alert error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : null}

              <label className="wp-field wp-field-full">
                <span>Category</span>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  disabled={categoriesLoading || saving}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Choose category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="wp-field wp-field-full">
                <span>Product title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Product title"
                  disabled={saving}
                />
              </label>

              <label className="wp-field wp-field-full">
                <span>Slug</span>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="Optional custom slug"
                  disabled={saving}
                />
              </label>

              <div className="wp-field wp-field-full">
                <span>Product image</span>

                <label className="wp-upload">
                  <span className="wp-upload-preview">
                    {form.product_image ? (
                      <img src={form.product_image} alt="" />
                    ) : (
                      <Package size={20} />
                    )}
                  </span>

                  <span className="wp-upload-copy">
                    <strong>{selectedImageName || (form.product_image ? 'Current product image' : 'Upload image from device')}</strong>
                    <small>JPG, PNG, WEBP - under 10MB</small>
                  </span>

                  <span className="wp-upload-action">
                    {uploadingImage ? 'Reading...' : 'Choose file'}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={saving || uploadingImage}
                  />
                </label>

                {form.product_image ? (
                  <button
                    type="button"
                    className="wp-remove-image"
                    onClick={() => {
                      setForm((previous) => ({ ...previous, product_image: '' }));
                      setSelectedImageName('');
                    }}
                    disabled={saving}
                  >
                    Remove image
                  </button>
                ) : null}
              </div>

              <label className="wp-field">
                <span>Pricing type</span>
                <select
                  name="pricing_type"
                  value={form.pricing_type}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="simple">Simple</option>
                  <option value="variable">Variable</option>
                </select>
              </label>

              {form.pricing_type === 'simple' ? (
                <label className="wp-field">
                  <span>Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    disabled={saving}
                  />
                </label>
              ) : (
                <>
                  <label className="wp-field">
                    <span>Minimum price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="min_price"
                      value={form.min_price}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={saving}
                    />
                  </label>

                  <label className="wp-field">
                    <span>Maximum price</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="max_price"
                      value={form.max_price}
                      onChange={handleChange}
                      placeholder="0.00"
                      disabled={saving}
                    />
                  </label>
                </>
              )}

              <label className="wp-field">
                <span>Homepage CTA label</span>
                <input
                  name="homepage_cta_label"
                  value={form.homepage_cta_label}
                  onChange={handleChange}
                  placeholder="Buy Now"
                  disabled={saving}
                />
              </label>

              <label className="wp-field">
                <span>Storefront CTA label</span>
                <input
                  name="storefront_cta_label"
                  value={form.storefront_cta_label}
                  onChange={handleChange}
                  placeholder="Read More"
                  disabled={saving}
                />
              </label>

              <label className="wp-field wp-field-full">
                <span>Affiliate Buy URL</span>
                <input
                  name="affiliate_buy_url"
                  value={form.affiliate_buy_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  disabled={saving}
                />
                <small>External destinations are checked by Bloggad when saved.</small>
              </label>

              <label className="wp-field wp-field-full">
                <span>Short description</span>
                <textarea
                  name="short_description"
                  value={form.short_description}
                  onChange={handleChange}
                  placeholder="Add a short product description..."
                  rows={4}
                  disabled={saving}
                />
              </label>

              <label className="wp-field">
                <span>Status</span>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            <div className="wp-drawer-footer">
              <button type="button" className="wp-btn secondary" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="wp-btn primary" disabled={saving || uploadingImage}>
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Create product'}
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}

function WriterProductsWorkspace() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [drawer, setDrawer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const fetchProducts = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/api/affiliate/products');
      setProducts(data?.products || []);
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

  const ensureCategories = async () => {
    if (categoriesLoaded || categoriesLoading) return;

    try {
      setCategoriesLoading(true);
      const { data } = await api.get('/api/public/categories');
      setCategories(data?.categories || []);
      setCategoriesLoaded(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load product categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) => {
      const haystack = [
        product.title,
        product.slug,
        product.status,
        product.pricing_type,
        product.category_name,
        product.website_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [products, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter(
      (product) => String(product?.status || '').toLowerCase() === 'published'
    ).length;
    const draft = products.filter(
      (product) => String(product?.status || '').toLowerCase() === 'draft'
    ).length;
    const inactive = products.filter(
      (product) => String(product?.status || '').toLowerCase() === 'inactive'
    ).length;

    return { total, published, draft, inactive };
  }, [products]);

  const closeDrawer = () => {
    setDrawer(null);
  };

  const handleSaved = async (message) => {
    setNotice(message);
    await fetchProducts(true);
    closeDrawer();

    window.setTimeout(() => {
      setNotice('');
    }, 4500);
  };

  return (
    <div className="wp-page">
      <style>{writerProductStyles}</style>

      <div className="wp-mobile-title-row">
        <h1>Products</h1>
        <button
          type="button"
          className="wp-btn primary compact"
          onClick={() => {
            setNotice('');
            setDrawer({ mode: 'create', productId: null });
          }}
        >
          + Add
        </button>
      </div>

      <section className="wp-stats" aria-label="Product summary">
        <article className="wp-stat">
          <span>Total products</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="wp-stat">
          <span>Published</span>
          <strong>{stats.published}</strong>
        </article>
        <article className="wp-stat">
          <span>Draft</span>
          <strong>{stats.draft}</strong>
        </article>
        <article className="wp-stat inactive">
          <span>Inactive</span>
          <strong>{stats.inactive}</strong>
        </article>
        <article className="wp-stat wp-stat-context">
          <span>Store catalog</span>
          <strong>Products shown on your Writer storefront</strong>
        </article>
      </section>

      <div className="wp-toolbar">
        <label className="wp-search">
          <Search size={15} aria-hidden="true" />
          <span className="wp-sr-only">Search products</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by title, status or pricing type"
          />
        </label>

        <div className="wp-toolbar-actions">
          <button
            type="button"
            className="wp-btn secondary"
            onClick={() => fetchProducts(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            type="button"
            className="wp-btn primary wp-desktop-add"
            onClick={() => {
              setNotice('');
              setDrawer({ mode: 'create', productId: null });
            }}
          >
            + Add product
          </button>
        </div>
      </div>

      {notice ? (
        <div className="wp-alert success" role="status">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="wp-alert error" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <section className="wp-state">
          <div className="wp-spinner" />
          <strong>Loading products...</strong>
        </section>
      ) : filteredProducts.length ? (
        <>
          <section className="wp-table-wrap">
            <div className="wp-table-head">
              <span>Product</span>
              <span>Price</span>
              <span>Category</span>
              <span>Status</span>
              <span>Website</span>
              <span>Actions</span>
            </div>

            {filteredProducts.map((product) => (
              <article key={product.id} className="wp-table-row">
                <div className="wp-product-cell">
                  <WriterProductImage product={product} />
                  <span className="wp-product-copy">
                    <strong>{product.title || 'Untitled product'}</strong>
                    <small>{product.slug || '-'}</small>
                  </span>
                </div>

                <strong className="wp-price">{renderPrice(product)}</strong>
                <span>{product.category_name || '-'}</span>
                <span>
                  <span className={writerProductStatusClass(product.status)}>
                    {product.status || 'draft'}
                  </span>
                </span>
                <span className="wp-muted">{product.website_name || '-'}</span>

                <div className="wp-row-actions">
                  <button
                    type="button"
                    className="wp-mini-btn"
                    onClick={() => {
                      setNotice('');
                      setDrawer({ mode: 'edit', productId: product.id });
                    }}
                  >
                    Edit
                  </button>

                  <Link
                    className="wp-mini-btn"
                    to={`/writer/products/${product.id}/posts`}
                  >
                    Posts
                  </Link>
                </div>
              </article>
            ))}
          </section>

          <section className="wp-mobile-list">
            {filteredProducts.map((product) => (
              <article key={product.id} className="wp-mobile-card">
                <div className="wp-mobile-card-top">
                  <WriterProductImage product={product} />

                  <div className="wp-mobile-card-copy">
                    <strong>{product.title || 'Untitled product'}</strong>
                    <b>{renderPrice(product)}</b>
                    <span>{product.category_name || '-'}</span>
                  </div>

                  <span className={writerProductStatusClass(product.status)}>
                    {product.status || 'draft'}
                  </span>
                </div>

                <div className="wp-mobile-card-actions">
                  <button
                    type="button"
                    className="wp-mini-btn"
                    onClick={() => {
                      setNotice('');
                      setDrawer({ mode: 'edit', productId: product.id });
                    }}
                  >
                    Edit
                  </button>

                  <Link
                    className="wp-mini-btn"
                    to={`/writer/products/${product.id}/posts`}
                  >
                    Posts
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className="wp-state">
          <Package size={25} />
          <strong>{products.length ? 'No matching products' : 'No products yet'}</strong>
          <span>
            {products.length
              ? 'Try another search keyword.'
              : 'Add your first product to start building your Writer catalog.'}
          </span>
          {!products.length ? (
            <button
              type="button"
              className="wp-btn primary"
              onClick={() => setDrawer({ mode: 'create', productId: null })}
            >
              Add product
            </button>
          ) : null}
        </section>
      )}

      {drawer ? (
        <WriterProductDrawer
          key={`${drawer.mode}-${drawer.productId || 'new'}`}
          mode={drawer.mode}
          productId={drawer.productId}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onCategoriesNeeded={ensureCategories}
          onClose={closeDrawer}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}

export default function AffiliateProductsPage() {
  const location = useLocation();
  const writerRouteMode = location.pathname.startsWith('/writer/products');

  return writerRouteMode ? <WriterProductsWorkspace /> : <AffiliateProductsLegacy />;
}

const writerProductStyles = `
  .wp-page,
  .wp-page * {
    box-sizing: border-box;
  }

  .wp-page {
    width: 100%;
    color: #171a1f;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .wp-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .wp-mobile-title-row {
    display: none;
  }

  .wp-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(260px, 2.5fr);
    gap: 12px;
    margin-bottom: 14px;
  }

  .wp-stat {
    min-height: 70px;
    padding: 13px 15px;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
  }

  .wp-stat span {
    display: block;
    margin-bottom: 7px;
    color: #748091;
    font-size: 11px;
    line-height: 1.2;
  }

  .wp-stat strong {
    display: block;
    color: #1b1f24;
    font-size: 22px;
    line-height: 1;
  }

  .wp-stat-context strong {
    font-size: 12px;
    line-height: 1.45;
    font-weight: 500;
  }

  .wp-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .wp-search {
    flex: 1;
    min-width: 0;
    height: 42px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 8px;
    color: #98a2b0;
  }

  .wp-search input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #1d232b;
    font: inherit;
    font-size: 12px;
  }

  .wp-toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wp-btn,
  .wp-mini-btn,
  .wp-icon-btn,
  .wp-remove-image {
    border: 0;
    font: inherit;
    cursor: pointer;
  }

  .wp-btn {
    min-height: 40px;
    padding: 0 18px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
  }

  .wp-btn.compact {
    min-height: 34px;
    padding: 0 13px;
  }

  .wp-btn.primary {
    background: #1c2026;
    color: #ffffff;
  }

  .wp-btn.secondary {
    background: #ffffff;
    color: #1c2026;
    border: 1px solid #dfe3e8;
  }

  .wp-btn:disabled,
  .wp-mini-btn:disabled,
  .wp-icon-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .wp-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 7px;
    font-size: 12px;
  }

  .wp-alert.error {
    border: 1px solid #fecaca;
    background: #fff7f7;
    color: #991b1b;
  }

  .wp-alert.success {
    border: 1px solid #bbf7d0;
    background: #f4fbf6;
    color: #166534;
  }

  .wp-table-wrap {
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
  }

  .wp-table-head,
  .wp-table-row {
    display: grid;
    grid-template-columns: minmax(280px, 2.5fr) minmax(120px, 1fr) minmax(130px, 1.1fr) minmax(110px, 0.9fr) minmax(130px, 1.1fr) minmax(150px, 1.1fr);
    align-items: center;
    gap: 14px;
  }

  .wp-table-head {
    min-height: 46px;
    padding: 0 18px;
    border-bottom: 1px solid #e5e8ec;
    color: #687382;
    font-size: 10px;
    font-weight: 600;
  }

  .wp-table-row {
    min-height: 88px;
    padding: 12px 18px;
    border-bottom: 1px solid #edf0f2;
    color: #313740;
    font-size: 11px;
  }

  .wp-table-row:last-child {
    border-bottom: 0;
  }

  .wp-product-cell {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .wp-product-image {
    flex: 0 0 52px;
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 7px;
    background: #eef1f5;
  }

  .wp-product-image-placeholder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #8b95a3;
  }

  .wp-product-copy {
    min-width: 0;
  }

  .wp-product-copy strong,
  .wp-product-copy small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wp-product-copy strong {
    margin-bottom: 5px;
    color: #20242a;
    font-size: 12px;
    font-weight: 600;
  }

  .wp-product-copy small,
  .wp-muted {
    color: #84909f;
    font-size: 10px;
  }

  .wp-price {
    font-size: 11px;
  }

  .wp-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    min-height: 25px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .wp-status.published {
    background: #e8f7ee;
    color: #177245;
  }

  .wp-status.draft {
    background: #fff5dd;
    color: #9a6400;
  }

  .wp-status.inactive,
  .wp-status.neutral {
    background: #eef1f4;
    color: #657180;
  }

  .wp-row-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wp-mini-btn {
    min-width: 54px;
    min-height: 31px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 11px;
    border: 1px solid #dce1e6;
    border-radius: 6px;
    background: #ffffff;
    color: #252a31;
    font-size: 10px;
    font-weight: 600;
    text-decoration: none;
  }

  .wp-mobile-list {
    display: none;
  }

  .wp-state {
    min-height: 320px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 10px;
    padding: 40px 24px;
    background: #ffffff;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
    color: #6f7a88;
    text-align: center;
  }

  .wp-state strong {
    color: #242930;
    font-size: 14px;
  }

  .wp-state span {
    max-width: 420px;
    font-size: 12px;
  }

  .wp-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid #e3e7eb;
    border-top-color: #1c2026;
    animation: wpSpin 0.8s linear infinite;
  }

  @keyframes wpSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .wp-drawer-layer {
    position: fixed;
    inset: 0;
    z-index: 180;
  }

  .wp-drawer-backdrop {
    position: absolute;
    top: 64px;
    right: 0;
    bottom: 0;
    left: 252px;
    border: 0;
    background: rgba(25, 31, 38, 0.16);
    cursor: default;
  }

  .wp-drawer {
    position: absolute;
    top: 64px;
    right: 0;
    bottom: 0;
    width: min(530px, calc(100vw - 252px));
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-left: 1px solid #dfe3e8;
    box-shadow: -12px 0 30px rgba(15, 23, 42, 0.08);
  }

  .wp-drawer-head {
    flex: 0 0 auto;
    min-height: 76px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 18px 22px 14px;
    border-bottom: 1px solid #e4e7eb;
  }

  .wp-drawer-head h2 {
    margin: 0 0 5px;
    color: #20242a;
    font-size: 16px;
    line-height: 1.2;
  }

  .wp-drawer-head p {
    margin: 0;
    color: #7b8694;
    font-size: 11px;
  }

  .wp-icon-btn {
    width: 30px;
    height: 30px;
    display: inline-grid;
    place-items: center;
    border-radius: 6px;
    background: transparent;
    color: #66717f;
    font-size: 11px;
    font-weight: 700;
  }

  .wp-drawer-form {
    min-height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .wp-form-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
    gap: 14px;
    padding: 18px 22px 28px;
  }

  .wp-field {
    min-width: 0;
    display: grid;
    gap: 6px;
    color: #2e3339;
    font-size: 10px;
    font-weight: 600;
  }

  .wp-field-full {
    grid-column: 1 / -1;
  }

  .wp-field input,
  .wp-field select,
  .wp-field textarea {
    width: 100%;
    border: 1px solid #dce1e6;
    border-radius: 7px;
    background: #ffffff;
    color: #252a31;
    outline: none;
    font: inherit;
    font-size: 11px;
    font-weight: 400;
  }

  .wp-field input,
  .wp-field select {
    height: 40px;
    padding: 0 11px;
  }

  .wp-field textarea {
    min-height: 82px;
    resize: vertical;
    padding: 10px 11px;
  }

  .wp-field input:focus,
  .wp-field select:focus,
  .wp-field textarea:focus {
    border-color: #8993a0;
  }

  .wp-field small {
    color: #8a94a2;
    font-size: 9px;
    font-weight: 400;
    line-height: 1.4;
  }

  .wp-upload {
    position: relative;
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 78px;
    padding: 12px;
    border: 1px solid #dce1e6;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
  }

  .wp-upload input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .wp-upload-preview {
    width: 48px;
    height: 48px;
    display: inline-grid;
    place-items: center;
    overflow: hidden;
    border-radius: 7px;
    background: #e8ecf0;
    color: #87919e;
  }

  .wp-upload-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .wp-upload-copy {
    min-width: 0;
  }

  .wp-upload-copy strong,
  .wp-upload-copy small {
    display: block;
  }

  .wp-upload-copy strong {
    margin-bottom: 4px;
    overflow: hidden;
    color: #252a31;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wp-upload-copy small {
    color: #8a94a2;
    font-size: 9px;
    font-weight: 400;
  }

  .wp-upload-action {
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    padding: 0 13px;
    border: 1px solid #d8dde3;
    border-radius: 6px;
    background: #ffffff;
    color: #32373e;
    font-size: 9px;
    font-weight: 600;
  }

  .wp-remove-image {
    justify-self: start;
    padding: 3px 0;
    background: transparent;
    color: #a33434;
    font-size: 9px;
    font-weight: 600;
  }

  .wp-drawer-footer {
    flex: 0 0 auto;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 22px;
    border-top: 1px solid #e4e7eb;
    background: #ffffff;
  }

  .wp-drawer-state {
    flex: 1;
    display: grid;
    place-items: center;
    color: #707b89;
    font-size: 12px;
  }

  @media (max-width: 1120px) {
    .wp-stats {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .wp-stat-context {
      grid-column: 1 / -1;
    }

    .wp-table-head,
    .wp-table-row {
      grid-template-columns: minmax(240px, 2fr) minmax(110px, 1fr) minmax(120px, 1fr) minmax(100px, 0.8fr) minmax(130px, 1fr);
    }

    .wp-table-head > span:nth-child(5),
    .wp-table-row > .wp-muted {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .wp-page {
      width: calc(100% + 34px);
      margin-left: -17px;
      margin-right: -17px;
      padding: 15px 8px 42px;
    }

    .wp-mobile-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 12px;
    }

    .wp-mobile-title-row h1 {
      margin: 0;
      color: #20242a;
      font-size: 20px;
      line-height: 1.2;
    }

    .wp-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 9px;
      margin-bottom: 14px;
    }

    .wp-stat {
      min-height: 68px;
      padding: 12px;
    }

    .wp-stat strong {
      font-size: 21px;
    }

    .wp-stat.inactive,
    .wp-stat-context {
      display: none;
    }

    .wp-toolbar {
      display: block;
      margin-bottom: 16px;
    }

    .wp-search {
      width: 100%;
      margin-bottom: 9px;
    }

    .wp-toolbar-actions {
      display: none;
    }

    .wp-table-wrap {
      display: none;
    }

    .wp-mobile-list {
      display: grid;
      gap: 12px;
    }

    .wp-mobile-card {
      padding: 14px;
      border: 1px solid #dfe3e8;
      border-radius: 10px;
      background: #ffffff;
    }

    .wp-mobile-card-top {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr) auto;
      align-items: start;
      gap: 13px;
    }

    .wp-mobile-card .wp-product-image {
      width: 58px;
      height: 58px;
      flex-basis: 58px;
    }

    .wp-mobile-card-copy {
      min-width: 0;
    }

    .wp-mobile-card-copy strong,
    .wp-mobile-card-copy b,
    .wp-mobile-card-copy span {
      display: block;
    }

    .wp-mobile-card-copy strong {
      margin-bottom: 7px;
      overflow: hidden;
      color: #22272e;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-mobile-card-copy b {
      margin-bottom: 8px;
      color: #242931;
      font-size: 12px;
    }

    .wp-mobile-card-copy span {
      color: #84909e;
      font-size: 10px;
    }

    .wp-mobile-card .wp-status {
      min-width: 68px;
    }

    .wp-mobile-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 9px;
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid #e5e8ec;
    }

    .wp-mobile-card-actions .wp-mini-btn {
      min-width: 62px;
    }

    .wp-drawer-layer {
      z-index: 500;
    }

    .wp-drawer-backdrop {
      display: none;
    }

    .wp-drawer {
      inset: 0;
      width: 100%;
      border-left: 0;
      box-shadow: none;
    }

    .wp-drawer-head {
      min-height: 60px;
      align-items: center;
      padding: 13px 16px;
    }

    .wp-drawer-head h2 {
      font-size: 16px;
    }

    .wp-drawer-head p {
      display: none;
    }

    .wp-form-scroll {
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 18px 16px 30px;
    }

    .wp-field-full {
      grid-column: auto;
    }

    .wp-drawer-footer {
      min-height: 62px;
      padding: 10px 16px;
    }

    .wp-drawer-footer .wp-btn {
      flex: 1;
    }
  }

  @media (max-width: 390px) {
    .wp-page {
      padding-right: 8px;
      padding-left: 8px;
    }

    .wp-upload {
      grid-template-columns: 48px minmax(0, 1fr);
    }

    .wp-upload-action {
      grid-column: 1 / -1;
      justify-content: center;
    }
  }
`;
