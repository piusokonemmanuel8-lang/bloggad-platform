import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

function createSlugFromTitle(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AffiliateCreateProductPage() {
  const navigate = useNavigate();

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

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await api.get('/api/public/categories');
        setCategories(data?.categories || []);
      } catch (err) {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === 'title' && !prev.slug.trim()) {
        next.slug = createSlugFromTitle(value);
      }

      return next;
    });
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

      const { data } = await api.post('/api/affiliate/products', payload);

      if (data?.ok && data?.product?.id) {
        setSuccess('Product created successfully. Redirecting...');
        setTimeout(() => {
          navigate(`/affiliate/products/${data.product.id}/posts`);
        }, 700);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="affiliate-create-product-page">
      <style>{styles}</style>

      <section className="affiliate-create-product-hero">
        <div className="affiliate-create-product-hero-copy">
          <div className="affiliate-create-product-badge">Product creator</div>
          <h1 className="affiliate-create-product-title">Create Product</h1>
          <p className="affiliate-create-product-subtitle">
            Add a product, choose pricing, and connect only approved Supgad links.
          </p>
        </div>

        <div className="affiliate-create-product-hero-icon">
          <Package size={28} />
        </div>
      </section>

      <section className="affiliate-create-product-grid">
        <div className="affiliate-create-product-panel affiliate-create-product-panel-main">
          <div className="affiliate-create-product-panel-head">
            <div>
              <p className="affiliate-create-product-panel-kicker">Product details</p>
              <h2 className="affiliate-create-product-panel-title">
                Fill in the product information
              </h2>
            </div>
          </div>

          <form className="affiliate-create-product-form" onSubmit={handleSubmit}>
            <div className="affiliate-create-product-form-grid">
              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <Layers3 size={16} />
                  Category
                </span>
                <select
                  className="affiliate-create-product-input"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <Package size={16} />
                  Product title
                </span>
                <input
                  className="affiliate-create-product-input"
                  name="title"
                  placeholder="Product title"
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <Tag size={16} />
                  Slug
                </span>
                <input
                  className="affiliate-create-product-input"
                  name="slug"
                  placeholder="Custom slug (optional)"
                  value={form.slug}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <ImageIcon size={16} />
                  Product image URL
                </span>
                <input
                  className="affiliate-create-product-input"
                  name="product_image"
                  placeholder="Product image URL"
                  value={form.product_image}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <DollarSign size={16} />
                  Pricing type
                </span>
                <select
                  className="affiliate-create-product-input"
                  name="pricing_type"
                  value={form.pricing_type}
                  onChange={handleChange}
                >
                  <option value="simple">Simple</option>
                  <option value="variable">Variable</option>
                </select>
              </label>

              {form.pricing_type === 'simple' ? (
                <label className="affiliate-create-product-field">
                  <span className="affiliate-create-product-label">
                    <DollarSign size={16} />
                    Price
                  </span>
                  <input
                    className="affiliate-create-product-input"
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleChange}
                  />
                </label>
              ) : (
                <>
                  <label className="affiliate-create-product-field">
                    <span className="affiliate-create-product-label">
                      <DollarSign size={16} />
                      Minimum price
                    </span>
                    <input
                      className="affiliate-create-product-input"
                      name="min_price"
                      type="number"
                      placeholder="Minimum price"
                      value={form.min_price}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="affiliate-create-product-field">
                    <span className="affiliate-create-product-label">
                      <DollarSign size={16} />
                      Maximum price
                    </span>
                    <input
                      className="affiliate-create-product-input"
                      name="max_price"
                      type="number"
                      placeholder="Maximum price"
                      value={form.max_price}
                      onChange={handleChange}
                    />
                  </label>
                </>
              )}

              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <ShoppingBag size={16} />
                  Homepage CTA label
                </span>
                <input
                  className="affiliate-create-product-input"
                  name="homepage_cta_label"
                  placeholder="Homepage CTA label"
                  value={form.homepage_cta_label}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <ShoppingBag size={16} />
                  Storefront CTA label
                </span>
                <input
                  className="affiliate-create-product-input"
                  name="storefront_cta_label"
                  placeholder="Storefront CTA label"
                  value={form.storefront_cta_label}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-product-field affiliate-create-product-field-full">
                <span className="affiliate-create-product-label">
                  <LinkIcon size={16} />
                  Affiliate Buy URL
                </span>
                <input
                  className="affiliate-create-product-input"
                  name="affiliate_buy_url"
                  placeholder="Affiliate Buy URL (must be supgad.com)"
                  value={form.affiliate_buy_url}
                  onChange={handleChange}
                />
                <small className="affiliate-create-product-help">
                  Only supgad.com links are allowed.
                </small>
              </label>

              <label className="affiliate-create-product-field affiliate-create-product-field-full">
                <span className="affiliate-create-product-label">
                  <FileText size={16} />
                  Short description
                </span>
                <textarea
                  className="affiliate-create-product-input affiliate-create-product-textarea"
                  name="short_description"
                  placeholder="Short description"
                  rows="5"
                  value={form.short_description}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-product-field">
                <span className="affiliate-create-product-label">
                  <Tag size={16} />
                  Status
                </span>
                <select
                  className="affiliate-create-product-input"
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
              <div className="affiliate-create-product-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-create-product-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div className="affiliate-create-product-actions">
              <button
                className="affiliate-create-product-save-btn"
                type="submit"
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>

        <div className="affiliate-create-product-side-stack">
          <div className="affiliate-create-product-panel">
            <div className="affiliate-create-product-panel-head">
              <div>
                <p className="affiliate-create-product-panel-kicker">Live summary</p>
                <h2 className="affiliate-create-product-panel-title">Preview details</h2>
              </div>
            </div>

            <div className="affiliate-create-product-summary">
              <div className="affiliate-create-product-summary-row">
                <span>Title</span>
                <strong>{form.title || '-'}</strong>
              </div>

              <div className="affiliate-create-product-summary-row">
                <span>Category</span>
                <strong>{selectedCategoryName}</strong>
              </div>

              <div className="affiliate-create-product-summary-row">
                <span>Slug</span>
                <strong>{form.slug || '-'}</strong>
              </div>

              <div className="affiliate-create-product-summary-row">
                <span>Pricing type</span>
                <strong>{form.pricing_type || '-'}</strong>
              </div>

              <div className="affiliate-create-product-summary-row">
                <span>Price preview</span>
                <strong>{pricePreview}</strong>
              </div>

              <div className="affiliate-create-product-summary-row">
                <span>Status</span>
                <strong>{form.status || '-'}</strong>
              </div>
            </div>
          </div>

          <div className="affiliate-create-product-panel">
            <div className="affiliate-create-product-panel-head">
              <div>
                <p className="affiliate-create-product-panel-kicker">Rules</p>
                <h2 className="affiliate-create-product-panel-title">Important notes</h2>
              </div>
            </div>

            <div className="affiliate-create-product-tips">
              <div className="affiliate-create-product-tip">
                <span className="dot" />
                <p>Product title and image are required.</p>
              </div>

              <div className="affiliate-create-product-tip">
                <span className="dot" />
                <p>Simple pricing needs one price only.</p>
              </div>

              <div className="affiliate-create-product-tip">
                <span className="dot" />
                <p>Variable pricing needs minimum and maximum values.</p>
              </div>

              <div className="affiliate-create-product-tip">
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

  .affiliate-create-product-page {
    width: 100%;
  }

  .affiliate-create-product-hero {
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

  .affiliate-create-product-badge {
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

  .affiliate-create-product-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-create-product-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-create-product-hero-icon {
    width: 62px;
    height: 62px;
    border-radius: 20px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-create-product-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
    gap: 20px;
  }

  .affiliate-create-product-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-create-product-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-create-product-panel-main {
    min-height: 100%;
  }

  .affiliate-create-product-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-create-product-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-create-product-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-create-product-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-create-product-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-create-product-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-create-product-field-full {
    grid-column: span 2;
  }

  .affiliate-create-product-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-create-product-input {
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

  .affiliate-create-product-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-create-product-textarea {
    min-height: 130px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-create-product-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-create-product-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-create-product-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-create-product-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-create-product-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .affiliate-create-product-save-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #111827;
    background: #111827;
    color: #ffffff;
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

  .affiliate-create-product-save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-create-product-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-product-summary-row {
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

  .affiliate-create-product-summary-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-create-product-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-create-product-tips {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-product-tip {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-create-product-tip .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #111827;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .affiliate-create-product-tip p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 1100px) {
    .affiliate-create-product-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-create-product-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-create-product-title {
      font-size: 26px;
    }

    .affiliate-create-product-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-create-product-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-create-product-field-full {
      grid-column: span 1;
    }

    .affiliate-create-product-title {
      font-size: 22px;
    }

    .affiliate-create-product-subtitle {
      font-size: 14px;
    }

    .affiliate-create-product-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-create-product-save-btn {
      width: 100%;
    }
  }
`;