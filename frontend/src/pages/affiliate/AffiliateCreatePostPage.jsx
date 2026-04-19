import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Link as LinkIcon,
  LayoutTemplate,
  Package,
  FolderKanban,
  Image as ImageIcon,
  Type,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'published' || value === 'active') return 'affiliate-create-post-status active';
  if (value === 'draft' || value === 'pending') return 'affiliate-create-post-status draft';
  if (value === 'inactive') return 'affiliate-create-post-status inactive';

  return 'affiliate-create-post-status neutral';
}

export default function AffiliateCreatePostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const presetProductId = searchParams.get('product_id') || '';

  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    product_id: presetProductId,
    category_id: '',
    template_id: '',
    title: '',
    slug: '',
    excerpt: '',
    seo_title: '',
    seo_description: '',
    featured_image: '',
    status: 'draft',
    template_fields: [
      { field_key: 'headline', field_type: 'text', field_value: '', sort_order: 1 },
      { field_key: 'subheadline', field_type: 'text', field_value: '', sort_order: 2 },
      { field_key: 'content_block_1', field_type: 'textarea', field_value: '', sort_order: 3 },
      { field_key: 'content_block_2', field_type: 'textarea', field_value: '', sort_order: 4 },
    ],
    cta_buttons: [
      {
        button_key: 'primary_cta',
        button_label: 'Buy Now',
        button_url: '',
        button_style: 'primary',
        open_in_new_tab: true,
        sort_order: 1,
      },
      {
        button_key: 'secondary_cta',
        button_label: 'Learn More',
        button_url: '',
        button_style: 'secondary',
        open_in_new_tab: true,
        sort_order: 2,
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsRes, templatesRes, categoriesRes] = await Promise.all([
          api.get('/api/affiliate/products'),
          api.get('/api/admin/templates/blog'),
          api.get('/api/public/categories'),
        ]);

        setProducts(productsRes?.data?.products || []);
        setTemplates(templatesRes?.data?.templates || []);
        setCategories(categoriesRes?.data?.categories || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load post setup data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTemplateFieldChange = (index, key, value) => {
    setForm((prev) => {
      const nextFields = [...prev.template_fields];
      nextFields[index] = {
        ...nextFields[index],
        [key]: value,
      };

      return {
        ...prev,
        template_fields: nextFields,
      };
    });
  };

  const addTemplateField = () => {
    setForm((prev) => ({
      ...prev,
      template_fields: [
        ...prev.template_fields,
        {
          field_key: '',
          field_type: 'text',
          field_value: '',
          sort_order: prev.template_fields.length + 1,
        },
      ],
    }));
  };

  const removeTemplateField = (index) => {
    setForm((prev) => ({
      ...prev,
      template_fields: prev.template_fields
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({
          ...item,
          sort_order: idx + 1,
        })),
    }));
  };

  const handleCtaChange = (index, key, value) => {
    setForm((prev) => {
      const nextButtons = [...prev.cta_buttons];
      nextButtons[index] = {
        ...nextButtons[index],
        [key]: value,
      };

      return {
        ...prev,
        cta_buttons: nextButtons,
      };
    });
  };

  const addCtaButton = () => {
    setForm((prev) => ({
      ...prev,
      cta_buttons: [
        ...prev.cta_buttons,
        {
          button_key: `cta_${prev.cta_buttons.length + 1}`,
          button_label: '',
          button_url: '',
          button_style: 'primary',
          open_in_new_tab: true,
          sort_order: prev.cta_buttons.length + 1,
        },
      ],
    }));
  };

  const removeCtaButton = (index) => {
    setForm((prev) => ({
      ...prev,
      cta_buttons: prev.cta_buttons
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({
          ...item,
          sort_order: idx + 1,
        })),
    }));
  };

  const validateBeforeSubmit = () => {
    if (!form.product_id) {
      throw new Error('Product is required');
    }

    if (!form.template_id) {
      throw new Error('Template is required');
    }

    if (!form.title.trim()) {
      throw new Error('Post title is required');
    }

    for (const field of form.template_fields) {
      if (!String(field.field_key || '').trim()) {
        throw new Error('Every template field must have a field key');
      }

      const looksLikeLinkField =
        String(field.field_type || '').toLowerCase().includes('url') ||
        String(field.field_type || '').toLowerCase().includes('link') ||
        String(field.field_key || '').toLowerCase().includes('url') ||
        String(field.field_key || '').toLowerCase().includes('link') ||
        String(field.field_key || '').toLowerCase().includes('cta');

      if (looksLikeLinkField && String(field.field_value || '').trim()) {
        const result = validateSupgadUrl(field.field_value, {
          required: true,
          allowEmpty: false,
          fieldName: `Template field (${field.field_key})`,
        });

        if (!result.ok) {
          throw new Error(result.message);
        }
      }
    }

    for (const button of form.cta_buttons) {
      if (!String(button.button_label || '').trim()) {
        throw new Error('Every CTA button must have a label');
      }

      if (String(button.button_url || '').trim()) {
        const result = validateSupgadUrl(button.button_url, {
          required: true,
          allowEmpty: false,
          fieldName: `CTA Button URL (${button.button_label})`,
        });

        if (!result.ok) {
          throw new Error(result.message);
        }
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      validateBeforeSubmit();

      const payload = {
        product_id: Number(form.product_id),
        category_id: form.category_id || null,
        template_id: Number(form.template_id),
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        featured_image: form.featured_image,
        status: form.status,
        template_fields: form.template_fields.map((field, idx) => ({
          ...field,
          sort_order: idx + 1,
        })),
        cta_buttons: form.cta_buttons.map((button, idx) => ({
          ...button,
          open_in_new_tab: !!button.open_in_new_tab,
          sort_order: idx + 1,
        })),
      };

      const { data } = await api.post('/api/affiliate/posts', payload);

      if (data?.ok && data?.post?.id) {
        setSuccess('Post created successfully. Redirecting...');
        setTimeout(() => {
          navigate(`/affiliate/posts/${data.post.id}/edit`);
        }, 700);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(form.product_id)),
    [products, form.product_id]
  );

  const selectedTemplate = useMemo(
    () => templates.find((item) => String(item.id) === String(form.template_id)),
    [templates, form.template_id]
  );

  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === String(form.category_id)),
    [categories, form.category_id]
  );

  if (loading) {
    return (
      <div className="affiliate-create-post-page">
        <style>{styles}</style>

        <div className="affiliate-create-post-loading-wrap">
          <div className="affiliate-create-post-loading-card">
            <div className="affiliate-create-post-spinner" />
            <p>Loading post setup...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-create-post-page">
      <style>{styles}</style>

      <section className="affiliate-create-post-hero">
        <div className="affiliate-create-post-hero-copy">
          <div className="affiliate-create-post-badge">Post creator</div>
          <h1 className="affiliate-create-post-title">Create Post</h1>
          <p className="affiliate-create-post-subtitle">
            Choose a template and fill in the content blocks for this product post.
          </p>
        </div>

        <div className="affiliate-create-post-hero-actions">
          <button
            className="affiliate-create-post-btn secondary"
            type="button"
            onClick={() => navigate('/affiliate/products')}
          >
            Back to Products
          </button>
        </div>
      </section>

      <section className="affiliate-create-post-grid">
        <div className="affiliate-create-post-panel affiliate-create-post-panel-main">
          <div className="affiliate-create-post-panel-head">
            <div>
              <p className="affiliate-create-post-panel-kicker">Post details</p>
              <h2 className="affiliate-create-post-panel-title">Create content</h2>
            </div>
          </div>

          <form className="affiliate-create-post-form" onSubmit={handleSubmit}>
            <div className="affiliate-create-post-form-grid">
              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <Package size={16} />
                  Product
                </span>
                <select
                  className="affiliate-create-post-input"
                  name="product_id"
                  value={form.product_id}
                  onChange={handleChange}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <FolderKanban size={16} />
                  Category
                </span>
                <select
                  className="affiliate-create-post-input"
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

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <LayoutTemplate size={16} />
                  Template
                </span>
                <select
                  className="affiliate-create-post-input"
                  name="template_id"
                  value={form.template_id}
                  onChange={handleChange}
                >
                  <option value="">Select blog template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <Type size={16} />
                  Post title
                </span>
                <input
                  className="affiliate-create-post-input"
                  name="title"
                  placeholder="Post title"
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <LinkIcon size={16} />
                  Slug
                </span>
                <input
                  className="affiliate-create-post-input"
                  name="slug"
                  placeholder="Custom slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">
                  <ImageIcon size={16} />
                  Featured image URL
                </span>
                <input
                  className="affiliate-create-post-input"
                  name="featured_image"
                  placeholder="Featured image URL"
                  value={form.featured_image}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field affiliate-create-post-field-full">
                <span className="affiliate-create-post-label">
                  <FileText size={16} />
                  Excerpt
                </span>
                <textarea
                  className="affiliate-create-post-input affiliate-create-post-textarea"
                  name="excerpt"
                  placeholder="Excerpt"
                  rows="3"
                  value={form.excerpt}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">SEO title</span>
                <input
                  className="affiliate-create-post-input"
                  name="seo_title"
                  placeholder="SEO title"
                  value={form.seo_title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-create-post-field">
                <span className="affiliate-create-post-label">Status</span>
                <select
                  className="affiliate-create-post-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="affiliate-create-post-field affiliate-create-post-field-full">
                <span className="affiliate-create-post-label">SEO description</span>
                <textarea
                  className="affiliate-create-post-input affiliate-create-post-textarea"
                  name="seo_description"
                  placeholder="SEO description"
                  rows="3"
                  value={form.seo_description}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="affiliate-create-post-block">
              <div className="affiliate-create-post-block-head">
                <div>
                  <p className="affiliate-create-post-panel-kicker">Template fields</p>
                  <h3 className="affiliate-create-post-block-title">Content blocks</h3>
                </div>

                <button
                  className="affiliate-create-post-btn secondary"
                  type="button"
                  onClick={addTemplateField}
                >
                  <Plus size={16} />
                  Add Field
                </button>
              </div>

              <div className="affiliate-create-post-stack">
                {form.template_fields.map((field, index) => (
                  <div key={index} className="affiliate-create-post-card">
                    <div className="affiliate-create-post-card-top">
                      <div className="affiliate-create-post-chip">Field {index + 1}</div>

                      <button
                        className="affiliate-create-post-icon-btn"
                        type="button"
                        onClick={() => removeTemplateField(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="affiliate-create-post-form-grid">
                      <label className="affiliate-create-post-field">
                        <span className="affiliate-create-post-label">Field key</span>
                        <input
                          className="affiliate-create-post-input"
                          placeholder="Field key"
                          value={field.field_key}
                          onChange={(e) =>
                            handleTemplateFieldChange(index, 'field_key', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-create-post-field">
                        <span className="affiliate-create-post-label">Field type</span>
                        <select
                          className="affiliate-create-post-input"
                          value={field.field_type}
                          onChange={(e) =>
                            handleTemplateFieldChange(index, 'field_type', e.target.value)
                          }
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="url">URL</option>
                          <option value="image">Image</option>
                        </select>
                      </label>

                      <label className="affiliate-create-post-field affiliate-create-post-field-full">
                        <span className="affiliate-create-post-label">Field value</span>
                        <textarea
                          className="affiliate-create-post-input affiliate-create-post-textarea"
                          rows="3"
                          placeholder="Field value"
                          value={field.field_value}
                          onChange={(e) =>
                            handleTemplateFieldChange(index, 'field_value', e.target.value)
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="affiliate-create-post-block">
              <div className="affiliate-create-post-block-head">
                <div>
                  <p className="affiliate-create-post-panel-kicker">CTA buttons</p>
                  <h3 className="affiliate-create-post-block-title">Action buttons</h3>
                </div>

                <button
                  className="affiliate-create-post-btn secondary"
                  type="button"
                  onClick={addCtaButton}
                >
                  <Plus size={16} />
                  Add CTA Button
                </button>
              </div>

              <div className="affiliate-create-post-stack">
                {form.cta_buttons.map((button, index) => (
                  <div key={index} className="affiliate-create-post-card">
                    <div className="affiliate-create-post-card-top">
                      <div className="affiliate-create-post-chip">Button {index + 1}</div>

                      <button
                        className="affiliate-create-post-icon-btn"
                        type="button"
                        onClick={() => removeCtaButton(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="affiliate-create-post-form-grid">
                      <label className="affiliate-create-post-field">
                        <span className="affiliate-create-post-label">Button key</span>
                        <input
                          className="affiliate-create-post-input"
                          placeholder="Button key"
                          value={button.button_key}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_key', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-create-post-field">
                        <span className="affiliate-create-post-label">Button label</span>
                        <input
                          className="affiliate-create-post-input"
                          placeholder="Button label"
                          value={button.button_label}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_label', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-create-post-field affiliate-create-post-field-full">
                        <span className="affiliate-create-post-label">Button URL</span>
                        <input
                          className="affiliate-create-post-input"
                          placeholder="Button URL (must be supgad.com)"
                          value={button.button_url}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_url', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-create-post-field">
                        <span className="affiliate-create-post-label">Button style</span>
                        <select
                          className="affiliate-create-post-input"
                          value={button.button_style}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_style', e.target.value)
                          }
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                        </select>
                      </label>

                      <label className="affiliate-create-post-check">
                        <input
                          type="checkbox"
                          checked={!!button.open_in_new_tab}
                          onChange={(e) =>
                            handleCtaChange(index, 'open_in_new_tab', e.target.checked)
                          }
                        />
                        <span>Open in new tab</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <div className="affiliate-create-post-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-create-post-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div className="affiliate-create-post-actions">
              <button className="affiliate-create-post-btn primary" type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>

        <div className="affiliate-create-post-side-stack">
          <div className="affiliate-create-post-panel">
            <div className="affiliate-create-post-panel-head">
              <div>
                <p className="affiliate-create-post-panel-kicker">Summary</p>
                <h2 className="affiliate-create-post-panel-title">Post overview</h2>
              </div>
            </div>

            <div className="affiliate-create-post-summary">
              <div className="affiliate-create-post-summary-row">
                <span>Title</span>
                <strong>{form.title || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Product</span>
                <strong>{selectedProduct?.title || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Category</span>
                <strong>{selectedCategory?.name || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Template</span>
                <strong>{selectedTemplate?.name || '-'}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Status</span>
                <strong>
                  <span className={getStatusClass(form.status)}>{form.status || '-'}</span>
                </strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>Fields</span>
                <strong>{form.template_fields.length}</strong>
              </div>

              <div className="affiliate-create-post-summary-row">
                <span>CTA Buttons</span>
                <strong>{form.cta_buttons.length}</strong>
              </div>
            </div>
          </div>

          <div className="affiliate-create-post-panel">
            <div className="affiliate-create-post-panel-head">
              <div>
                <p className="affiliate-create-post-panel-kicker">Preview</p>
                <h2 className="affiliate-create-post-panel-title">Featured image</h2>
              </div>
            </div>

            {form.featured_image ? (
              <img
                src={form.featured_image}
                alt={form.title || 'Post preview'}
                className="affiliate-create-post-preview-image"
              />
            ) : (
              <div className="affiliate-create-post-preview-empty">
                <ImageIcon size={26} />
                <span>No featured image</span>
              </div>
            )}
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

  .affiliate-create-post-page {
    width: 100%;
  }

  .affiliate-create-post-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-create-post-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-create-post-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateCreatePostSpin 0.8s linear infinite;
  }

  @keyframes affiliateCreatePostSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-create-post-hero {
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

  .affiliate-create-post-badge {
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

  .affiliate-create-post-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-create-post-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-create-post-hero-actions,
  .affiliate-create-post-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-create-post-btn {
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

  .affiliate-create-post-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-create-post-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-create-post-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 20px;
  }

  .affiliate-create-post-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-create-post-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-create-post-panel-head,
  .affiliate-create-post-block-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-create-post-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-create-post-panel-title,
  .affiliate-create-post-block-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-create-post-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-create-post-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-create-post-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-create-post-field-full {
    grid-column: span 2;
  }

  .affiliate-create-post-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-create-post-input {
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

  .affiliate-create-post-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-create-post-textarea {
    min-height: 110px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-create-post-block {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 22px;
    padding: 18px;
  }

  .affiliate-create-post-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .affiliate-create-post-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 16px;
  }

  .affiliate-create-post-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .affiliate-create-post-chip {
    display: inline-flex;
    align-items: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    color: #111827;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-create-post-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #111827;
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .affiliate-create-post-check {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 50px;
    padding: 0 14px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }

  .affiliate-create-post-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-create-post-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-create-post-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-create-post-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-create-post-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-create-post-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-create-post-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
    word-break: break-word;
  }

  .affiliate-create-post-status {
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

  .affiliate-create-post-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-create-post-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-create-post-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-create-post-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-create-post-preview-image,
  .affiliate-create-post-preview-empty {
    width: 100%;
    height: 240px;
    border-radius: 18px;
    border: 1px solid #edf2f7;
    background: #f8fafc;
  }

  .affiliate-create-post-preview-image {
    object-fit: cover;
    display: block;
  }

  .affiliate-create-post-preview-empty {
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  @media (max-width: 1100px) {
    .affiliate-create-post-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-create-post-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-create-post-title {
      font-size: 26px;
    }

    .affiliate-create-post-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-create-post-title {
      font-size: 22px;
    }

    .affiliate-create-post-subtitle {
      font-size: 14px;
    }

    .affiliate-create-post-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-create-post-field-full {
      grid-column: span 1;
    }

    .affiliate-create-post-hero-actions,
    .affiliate-create-post-actions,
    .affiliate-create-post-block-head {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-create-post-btn {
      width: 100%;
    }

    .affiliate-create-post-summary-row,
    .affiliate-create-post-card-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;