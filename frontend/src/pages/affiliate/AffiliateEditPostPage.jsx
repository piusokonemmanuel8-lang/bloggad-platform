import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  LayoutTemplate,
  Package,
  FolderKanban,
  Image as ImageIcon,
  ArrowLeft,
  Type,
} from 'lucide-react';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'published' || value === 'active') return 'affiliate-edit-post-status active';
  if (value === 'draft' || value === 'pending') return 'affiliate-edit-post-status draft';
  if (value === 'inactive') return 'affiliate-edit-post-status inactive';

  return 'affiliate-edit-post-status neutral';
}

export default function AffiliateEditPostPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    product_id: '',
    category_id: '',
    template_id: '',
    title: '',
    slug: '',
    excerpt: '',
    seo_title: '',
    seo_description: '',
    featured_image: '',
    status: 'draft',
    template_fields: [],
    cta_buttons: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [postRes, productsRes, templatesRes, categoriesRes] = await Promise.all([
          api.get(`/api/affiliate/posts/${id}`),
          api.get('/api/affiliate/products'),
          api.get('/api/admin/templates/blog'),
          api.get('/api/public/categories'),
        ]);

        const post = postRes?.data?.post;
        const productList = productsRes?.data?.products || [];
        const templateList = templatesRes?.data?.templates || [];
        const categoryList = categoriesRes?.data?.categories || [];

        setProducts(productList);
        setTemplates(templateList);
        setCategories(categoryList);

        if (post) {
          setForm({
            product_id: post.product_id || '',
            category_id: post.category_id || '',
            template_id: post.template_id || '',
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            seo_title: post.seo_title || '',
            seo_description: post.seo_description || '',
            featured_image: post.featured_image || '',
            status: post.status || 'draft',
            template_fields:
              (post.template_fields || []).map((field, idx) => ({
                field_key: field.field_key || '',
                field_type: field.field_type || 'text',
                field_value: field.field_value || '',
                sort_order: field.sort_order || idx + 1,
              })) || [],
            cta_buttons:
              (post.cta_buttons || []).map((button, idx) => ({
                button_key: button.button_key || `cta_${idx + 1}`,
                button_label: button.button_label || '',
                button_url: button.button_url || '',
                button_style: button.button_style || 'primary',
                open_in_new_tab: !!button.open_in_new_tab,
                sort_order: button.sort_order || idx + 1,
              })) || [],
          });
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load post');
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

      const { data } = await api.put(`/api/affiliate/posts/${id}`, payload);

      if (data?.ok) {
        setSuccess(data.message || 'Post updated successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update post');
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
      <div className="affiliate-edit-post-page">
        <style>{styles}</style>

        <div className="affiliate-edit-post-loading-wrap">
          <div className="affiliate-edit-post-loading-card">
            <div className="affiliate-edit-post-spinner" />
            <p>Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-edit-post-page">
      <style>{styles}</style>

      <section className="affiliate-edit-post-hero">
        <div className="affiliate-edit-post-hero-copy">
          <div className="affiliate-edit-post-badge">Post editor</div>
          <h1 className="affiliate-edit-post-title">Edit Post</h1>
          <p className="affiliate-edit-post-subtitle">
            Update post content, template fields, SEO details, and CTA buttons.
          </p>
        </div>

        <div className="affiliate-edit-post-hero-actions">
          <button
            className="affiliate-edit-post-btn secondary"
            type="button"
            onClick={() => navigate('/affiliate/products')}
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
        </div>
      </section>

      <section className="affiliate-edit-post-grid">
        <div className="affiliate-edit-post-panel affiliate-edit-post-panel-main">
          <div className="affiliate-edit-post-panel-head">
            <div>
              <p className="affiliate-edit-post-panel-kicker">Post details</p>
              <h2 className="affiliate-edit-post-panel-title">Update content</h2>
            </div>
          </div>

          <form className="affiliate-edit-post-form" onSubmit={handleSubmit}>
            <div className="affiliate-edit-post-form-grid">
              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <Package size={16} />
                  Product
                </span>
                <select
                  className="affiliate-edit-post-input"
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

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <FolderKanban size={16} />
                  Category
                </span>
                <select
                  className="affiliate-edit-post-input"
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

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <LayoutTemplate size={16} />
                  Template
                </span>
                <select
                  className="affiliate-edit-post-input"
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

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <Type size={16} />
                  Post title
                </span>
                <input
                  className="affiliate-edit-post-input"
                  name="title"
                  placeholder="Post title"
                  value={form.title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <LinkIcon size={16} />
                  Slug
                </span>
                <input
                  className="affiliate-edit-post-input"
                  name="slug"
                  placeholder="Custom slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">
                  <ImageIcon size={16} />
                  Featured image URL
                </span>
                <input
                  className="affiliate-edit-post-input"
                  name="featured_image"
                  placeholder="Featured image URL"
                  value={form.featured_image}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                <span className="affiliate-edit-post-label">
                  <FileText size={16} />
                  Excerpt
                </span>
                <textarea
                  className="affiliate-edit-post-input affiliate-edit-post-textarea"
                  name="excerpt"
                  placeholder="Excerpt"
                  rows="3"
                  value={form.excerpt}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">SEO title</span>
                <input
                  className="affiliate-edit-post-input"
                  name="seo_title"
                  placeholder="SEO title"
                  value={form.seo_title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-edit-post-field">
                <span className="affiliate-edit-post-label">Status</span>
                <select
                  className="affiliate-edit-post-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                <span className="affiliate-edit-post-label">SEO description</span>
                <textarea
                  className="affiliate-edit-post-input affiliate-edit-post-textarea"
                  name="seo_description"
                  placeholder="SEO description"
                  rows="3"
                  value={form.seo_description}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="affiliate-edit-post-block">
              <div className="affiliate-edit-post-block-head">
                <div>
                  <p className="affiliate-edit-post-panel-kicker">Template fields</p>
                  <h3 className="affiliate-edit-post-block-title">Content blocks</h3>
                </div>

                <button
                  className="affiliate-edit-post-btn secondary"
                  type="button"
                  onClick={addTemplateField}
                >
                  <Plus size={16} />
                  Add Field
                </button>
              </div>

              <div className="affiliate-edit-post-stack">
                {form.template_fields.map((field, index) => (
                  <div key={index} className="affiliate-edit-post-card">
                    <div className="affiliate-edit-post-card-top">
                      <div className="affiliate-edit-post-chip">Field {index + 1}</div>

                      <button
                        className="affiliate-edit-post-icon-btn"
                        type="button"
                        onClick={() => removeTemplateField(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="affiliate-edit-post-form-grid">
                      <label className="affiliate-edit-post-field">
                        <span className="affiliate-edit-post-label">Field key</span>
                        <input
                          className="affiliate-edit-post-input"
                          placeholder="Field key"
                          value={field.field_key}
                          onChange={(e) =>
                            handleTemplateFieldChange(index, 'field_key', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-edit-post-field">
                        <span className="affiliate-edit-post-label">Field type</span>
                        <select
                          className="affiliate-edit-post-input"
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

                      <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                        <span className="affiliate-edit-post-label">Field value</span>
                        <textarea
                          className="affiliate-edit-post-input affiliate-edit-post-textarea"
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

            <div className="affiliate-edit-post-block">
              <div className="affiliate-edit-post-block-head">
                <div>
                  <p className="affiliate-edit-post-panel-kicker">CTA buttons</p>
                  <h3 className="affiliate-edit-post-block-title">Action buttons</h3>
                </div>

                <button
                  className="affiliate-edit-post-btn secondary"
                  type="button"
                  onClick={addCtaButton}
                >
                  <Plus size={16} />
                  Add CTA Button
                </button>
              </div>

              <div className="affiliate-edit-post-stack">
                {form.cta_buttons.map((button, index) => (
                  <div key={index} className="affiliate-edit-post-card">
                    <div className="affiliate-edit-post-card-top">
                      <div className="affiliate-edit-post-chip">Button {index + 1}</div>

                      <button
                        className="affiliate-edit-post-icon-btn"
                        type="button"
                        onClick={() => removeCtaButton(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="affiliate-edit-post-form-grid">
                      <label className="affiliate-edit-post-field">
                        <span className="affiliate-edit-post-label">Button key</span>
                        <input
                          className="affiliate-edit-post-input"
                          placeholder="Button key"
                          value={button.button_key}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_key', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-edit-post-field">
                        <span className="affiliate-edit-post-label">Button label</span>
                        <input
                          className="affiliate-edit-post-input"
                          placeholder="Button label"
                          value={button.button_label}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_label', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-edit-post-field affiliate-edit-post-field-full">
                        <span className="affiliate-edit-post-label">Button URL</span>
                        <input
                          className="affiliate-edit-post-input"
                          placeholder="Button URL (must be supgad.com)"
                          value={button.button_url}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_url', e.target.value)
                          }
                        />
                      </label>

                      <label className="affiliate-edit-post-field">
                        <span className="affiliate-edit-post-label">Button style</span>
                        <select
                          className="affiliate-edit-post-input"
                          value={button.button_style}
                          onChange={(e) =>
                            handleCtaChange(index, 'button_style', e.target.value)
                          }
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                        </select>
                      </label>

                      <label className="affiliate-edit-post-check">
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
              <div className="affiliate-edit-post-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-edit-post-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div className="affiliate-edit-post-actions">
              <button className="affiliate-edit-post-btn primary" type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Update Post'}
              </button>

              <button
                className="affiliate-edit-post-btn secondary"
                type="button"
                onClick={() => navigate('/affiliate/products')}
              >
                <ArrowLeft size={16} />
                Back to Products
              </button>
            </div>
          </form>
        </div>

        <div className="affiliate-edit-post-side-stack">
          <div className="affiliate-edit-post-panel">
            <div className="affiliate-edit-post-panel-head">
              <div>
                <p className="affiliate-edit-post-panel-kicker">Summary</p>
                <h2 className="affiliate-edit-post-panel-title">Post overview</h2>
              </div>
            </div>

            <div className="affiliate-edit-post-summary">
              <div className="affiliate-edit-post-summary-row">
                <span>Title</span>
                <strong>{form.title || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Product</span>
                <strong>{selectedProduct?.title || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Category</span>
                <strong>{selectedCategory?.name || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Template</span>
                <strong>{selectedTemplate?.name || '-'}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Status</span>
                <strong>
                  <span className={getStatusClass(form.status)}>{form.status || '-'}</span>
                </strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>Fields</span>
                <strong>{form.template_fields.length}</strong>
              </div>

              <div className="affiliate-edit-post-summary-row">
                <span>CTA Buttons</span>
                <strong>{form.cta_buttons.length}</strong>
              </div>
            </div>
          </div>

          <div className="affiliate-edit-post-panel">
            <div className="affiliate-edit-post-panel-head">
              <div>
                <p className="affiliate-edit-post-panel-kicker">Preview</p>
                <h2 className="affiliate-edit-post-panel-title">Featured image</h2>
              </div>
            </div>

            {form.featured_image ? (
              <img
                src={form.featured_image}
                alt={form.title || 'Post preview'}
                className="affiliate-edit-post-preview-image"
              />
            ) : (
              <div className="affiliate-edit-post-preview-empty">
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

  .affiliate-edit-post-page {
    width: 100%;
  }

  .affiliate-edit-post-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-edit-post-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-edit-post-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateEditPostSpin 0.8s linear infinite;
  }

  @keyframes affiliateEditPostSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-edit-post-hero {
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

  .affiliate-edit-post-badge {
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

  .affiliate-edit-post-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-edit-post-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-edit-post-hero-actions,
  .affiliate-edit-post-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-edit-post-btn {
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

  .affiliate-edit-post-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-edit-post-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-edit-post-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 20px;
  }

  .affiliate-edit-post-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-edit-post-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-edit-post-panel-head,
  .affiliate-edit-post-block-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-edit-post-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-edit-post-panel-title,
  .affiliate-edit-post-block-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-edit-post-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-edit-post-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-edit-post-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-edit-post-field-full {
    grid-column: span 2;
  }

  .affiliate-edit-post-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-edit-post-input {
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

  .affiliate-edit-post-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-edit-post-textarea {
    min-height: 110px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-edit-post-block {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 22px;
    padding: 18px;
  }

  .affiliate-edit-post-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .affiliate-edit-post-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 16px;
  }

  .affiliate-edit-post-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .affiliate-edit-post-chip {
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

  .affiliate-edit-post-icon-btn {
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

  .affiliate-edit-post-check {
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

  .affiliate-edit-post-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-edit-post-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-edit-post-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-edit-post-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-edit-post-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-edit-post-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-edit-post-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
    word-break: break-word;
  }

  .affiliate-edit-post-status {
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

  .affiliate-edit-post-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-edit-post-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-edit-post-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-edit-post-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-edit-post-preview-image,
  .affiliate-edit-post-preview-empty {
    width: 100%;
    height: 240px;
    border-radius: 18px;
    border: 1px solid #edf2f7;
    background: #f8fafc;
  }

  .affiliate-edit-post-preview-image {
    object-fit: cover;
    display: block;
  }

  .affiliate-edit-post-preview-empty {
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  @media (max-width: 1100px) {
    .affiliate-edit-post-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-edit-post-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-edit-post-title {
      font-size: 26px;
    }

    .affiliate-edit-post-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-edit-post-title {
      font-size: 22px;
    }

    .affiliate-edit-post-subtitle {
      font-size: 14px;
    }

    .affiliate-edit-post-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-edit-post-field-full {
      grid-column: span 1;
    }

    .affiliate-edit-post-hero-actions,
    .affiliate-edit-post-actions,
    .affiliate-edit-post-block-head {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-edit-post-btn {
      width: 100%;
    }

    .affiliate-edit-post-summary-row,
    .affiliate-edit-post-card-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;