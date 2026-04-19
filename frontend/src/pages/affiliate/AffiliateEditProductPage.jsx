import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Package,
  Save,
  Image as ImageIcon,
  Tag,
  Link as LinkIcon,
  FileText,
  Layers3,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

export default function AffiliateEditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
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
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/api/affiliate/products/${id}`),
          api.get('/api/public/categories'),
        ]);

        const product = productRes?.data?.product;
        const categoriesList = categoriesRes?.data?.categories || [];

        setCategories(categoriesList);

        if (product) {
          setForm({
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
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedCategoryName = useMemo(() => {
    const found = categories.find((item) => String(item.id) === String(form.category_id));
    return found?.name || '-';
  }, [categories, form.category_id]);

  const pricePreview = useMemo(() => {
    if (form.pricing_type === 'simple') {
      return form.price ? form.price : '-';
    }

    if (!form.min_price && !form.max_price) return '-';
    return `${form.min_price || 0} - ${form.max_price || 0}`;
  }, [form.pricing_type, form.price, form.min_price, form.max_price]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
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

      const payload = {
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

      const { data } = await api.put(`/api/affiliate/products/${id}`, payload);

      if (data?.ok) {
        setSuccess(data.message || 'Product updated successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="affiliate-edit-product-page">
        <style>{styles}</style>

        <div className="affiliate-edit-product-loading-wrap">
          <div className="affiliate-edit-product-loading-card">
            <div className="affiliate-edit-product-spinner" />
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-edit-product-page">
      <style>{styles}</style>

      <section className="affiliate-edit-product-hero">
        <div className="affiliate-edit-product-hero-copy">
          <div className="affiliate-edit-product-badge">Product editor</div>
          <h1 className="affiliate-edit-product-title">Edit Product</h1>
          <p className="affiliate-edit-product-subtitle">
            Update product details, pricing, CTA text, and approved Supgad link settings.
          </p>
        </div>

        <div className="affiliate-edit-product-hero-actions">
          <button
            className="affiliate-edit-product-btn secondary"
            type="button"
            onClick={() => navigate(`/affiliate/products/${id}/posts`)}
          >
            <FileText size={16} />
            Manage Posts
          </button>
        </div>
      </section>

      <section className="affiliate-edit-product-grid">
        <div className="affiliate-edit-product-panel affiliate-edit-product-panel-main">
          <div className="affiliate-edit-product-panel-head">
            <div>
              <p className="affiliate-edit-product-panel-kicker">Product details</p>
              <h2 className="affiliate-edit-product-panel-title">Update product information</h2>
            </div>
          </div>

          <form className="affiliate-edit-product-form" onSubmit={handleSubmit}>
            <div className="affiliate-edit-product-form-grid">
              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <Layers3 size={16} />
                  Category
                </span>
                <select
                  className="affiliate-edit-product-input"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <Package size={16} />
                  Product title
                </span>
                <input
                  className="affiliate-edit-product-input"
                  name="title"
                  placeholder="Product title"
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <Tag size={16} />
                  Slug
                </span>
                <input
                  className="affiliate-edit-product-input"
                  name="slug"
                  placeholder="Custom slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <ImageIcon size={16} />
                  Product image URL
                </span>
                <input
                  className="affiliate-edit-product-input"
                  name="product_image"
                  placeholder="Product image URL"
                  value={form.product_image}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <DollarSign size={16} />
                  Pricing type
                </span>
                <select
                  className="affiliate-edit-product-input"
                  name="pricing_type"
                  value={form.pricing_type}
                  onChange={handleChange}
                >
                  <option value="simple">Simple</option>
                  <option value="variable">Variable</option>
                </select>
              </label>

              {form.pricing_type === 'simple' ? (
                <label className="affiliate-edit-product-field">
                  <span className="affiliate-edit-product-label">
                    <DollarSign size={16} />
                    Price
                  </span>
                  <input
                    className="affiliate-edit-product-input"
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </label>
              ) : (
                <>
                  <label className="affiliate-edit-product-field">
                    <span className="affiliate-edit-product-label">
                      <DollarSign size={16} />
                      Minimum price
                    </span>
                    <input
                      className="affiliate-edit-product-input"
                      name="min_price"
                      type="number"
                      placeholder="Minimum price"
                      value={form.min_price}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="affiliate-edit-product-field">
                    <span className="affiliate-edit-product-label">
                      <DollarSign size={16} />
                      Maximum price
                    </span>
                    <input
                      className="affiliate-edit-product-input"
                      name="max_price"
                      type="number"
                      placeholder="Maximum price"
                      value={form.max_price}
                      onChange={handleChange}
                    />
                  </label>
                </>
              )}

              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <ShoppingBag size={16} />
                  Homepage CTA label
                </span>
                <input
                  className="affiliate-edit-product-input"
                  name="homepage_cta_label"
                  placeholder="Homepage CTA label"
                  value={form.homepage_cta_label}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <ShoppingBag size={16} />
                  Storefront CTA label
                </span>
                <input
                  className="affiliate-edit-product-input"
                  name="storefront_cta_label"
                  placeholder="Storefront CTA label"
                  value={form.storefront_cta_label}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-product-field affiliate-edit-product-field-full">
                <span className="affiliate-edit-product-label">
                  <LinkIcon size={16} />
                  Affiliate Buy URL
                </span>
                <input
                  className="affiliate-edit-product-input"
                  name="affiliate_buy_url"
                  placeholder="Affiliate Buy URL"
                  value={form.affiliate_buy_url}
                  onChange={handleChange}
                />
                <small className="affiliate-edit-product-help">
                  Only supgad.com links are allowed.
                </small>
              </label>

              <label className="affiliate-edit-product-field affiliate-edit-product-field-full">
                <span className="affiliate-edit-product-label">
                  <FileText size={16} />
                  Short description
                </span>
                <textarea
                  className="affiliate-edit-product-input affiliate-edit-product-textarea"
                  name="short_description"
                  placeholder="Short description"
                  rows="5"
                  value={form.short_description}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-product-field">
                <span className="affiliate-edit-product-label">
                  <Tag size={16} />
                  Status
                </span>
                <select
                  className="affiliate-edit-product-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>

            {error ? (
              <div className="affiliate-edit-product-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-edit-product-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div className="affiliate-edit-product-actions">
              <button
                className="affiliate-edit-product-btn primary"
                type="submit"
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Update Product'}
              </button>

              <button
                className="affiliate-edit-product-btn secondary"
                type="button"
                onClick={() => navigate(`/affiliate/products/${id}/posts`)}
              >
                <ArrowRight size={16} />
                Manage Product Posts
              </button>
            </div>
          </form>
        </div>

        <div className="affiliate-edit-product-side-stack">
          <div className="affiliate-edit-product-panel">
            <div className="affiliate-edit-product-panel-head">
              <div>
                <p className="affiliate-edit-product-panel-kicker">Live summary</p>
                <h2 className="affiliate-edit-product-panel-title">Preview details</h2>
              </div>
            </div>

            <div className="affiliate-edit-product-summary">
              <div className="affiliate-edit-product-summary-row">
                <span>Title</span>
                <strong>{form.title || '-'}</strong>
              </div>

              <div className="affiliate-edit-product-summary-row">
                <span>Category</span>
                <strong>{selectedCategoryName}</strong>
              </div>

              <div className="affiliate-edit-product-summary-row">
                <span>Slug</span>
                <strong>{form.slug || '-'}</strong>
              </div>

              <div className="affiliate-edit-product-summary-row">
                <span>Pricing type</span>
                <strong>{form.pricing_type || '-'}</strong>
              </div>

              <div className="affiliate-edit-product-summary-row">
                <span>Price preview</span>
                <strong>{pricePreview}</strong>
              </div>

              <div className="affiliate-edit-product-summary-row">
                <span>Status</span>
                <strong>{form.status || '-'}</strong>
              </div>
            </div>
          </div>

          <div className="affiliate-edit-product-panel">
            <div className="affiliate-edit-product-panel-head">
              <div>
                <p className="affiliate-edit-product-panel-kicker">Rules</p>
                <h2 className="affiliate-edit-product-panel-title">Important notes</h2>
              </div>
            </div>

            <div className="affiliate-edit-product-tips">
              <div className="affiliate-edit-product-tip">
                <span className="dot" />
                <p>Product title and image are required.</p>
              </div>

              <div className="affiliate-edit-product-tip">
                <span className="dot" />
                <p>Simple pricing needs one price only.</p>
              </div>

              <div className="affiliate-edit-product-tip">
                <span className="dot" />
                <p>Variable pricing needs minimum and maximum values.</p>
              </div>

              <div className="affiliate-edit-product-tip">
                <span className="dot" />
                <p>Only supgad.com affiliate links are allowed on the platform.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-edit-product-page {
    width: 100%;
  }

  .affiliate-edit-product-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-edit-product-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-edit-product-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateEditProductSpin 0.8s linear infinite;
  }

  @keyframes affiliateEditProductSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-edit-product-hero {
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

  .affiliate-edit-product-badge {
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

  .affiliate-edit-product-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-edit-product-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-edit-product-hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-edit-product-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
    gap: 20px;
  }

  .affiliate-edit-product-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-edit-product-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-edit-product-panel-main {
    min-height: 100%;
  }

  .affiliate-edit-product-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-edit-product-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-edit-product-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-edit-product-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-edit-product-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-edit-product-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-edit-product-field-full {
    grid-column: span 2;
  }

  .affiliate-edit-product-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-edit-product-input {
    width: 100%;
    min-height: 50px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    padding: 0 14px;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: 0.2s ease;
  }

  .affiliate-edit-product-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-edit-product-textarea {
    min-height: 130px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-edit-product-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-edit-product-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-edit-product-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-edit-product-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-edit-product-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-edit-product-btn {
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

  .affiliate-edit-product-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-edit-product-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-product-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    font-size: 14px;
  }

  .affiliate-edit-product-summary-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-edit-product-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-edit-product-tips {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-product-tip {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-edit-product-tip .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #111827;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .affiliate-edit-product-tip p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 1100px) {
    .affiliate-edit-product-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-edit-product-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-edit-product-title {
      font-size: 26px;
    }

    .affiliate-edit-product-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-edit-product-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-edit-product-field-full {
      grid-column: span 1;
    }

    .affiliate-edit-product-title {
      font-size: 22px;
    }

    .affiliate-edit-product-subtitle {
      font-size: 14px;
    }

    .affiliate-edit-product-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-edit-product-actions,
    .affiliate-edit-product-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-edit-product-btn {
      width: 100%;
    }
  }
`;