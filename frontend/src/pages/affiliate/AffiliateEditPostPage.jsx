import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import validateSupgadUrl from '../../utils/validateSupgadUrl';

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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Edit Post</h1>
          <p className="page-subtitle">
            Update post content, template fields, and CTA buttons.
          </p>
        </div>

        <div className="surface-card surface-card-padding">
          <form className="form-stack" onSubmit={handleSubmit}>
            <select
              className="input-control"
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

            <select
              className="input-control"
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

            <select
              className="input-control"
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

            <input
              className="input-control"
              name="title"
              placeholder="Post title"
              value={form.title}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="slug"
              placeholder="Custom slug"
              value={form.slug}
              onChange={handleChange}
            />

            <textarea
              className="input-control"
              name="excerpt"
              placeholder="Excerpt"
              rows="3"
              value={form.excerpt}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="seo_title"
              placeholder="SEO title"
              value={form.seo_title}
              onChange={handleChange}
            />

            <textarea
              className="input-control"
              name="seo_description"
              placeholder="SEO description"
              rows="3"
              value={form.seo_description}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="featured_image"
              placeholder="Featured image URL"
              value={form.featured_image}
              onChange={handleChange}
            />

            <select
              className="input-control"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="surface-card surface-card-padding">
              <h2 className="section-title">Template Fields</h2>

              <div className="form-stack">
                {form.template_fields.map((field, index) => (
                  <div key={index} className="surface-card surface-card-padding">
                    <div className="form-stack">
                      <input
                        className="input-control"
                        placeholder="Field key"
                        value={field.field_key}
                        onChange={(e) =>
                          handleTemplateFieldChange(index, 'field_key', e.target.value)
                        }
                      />

                      <select
                        className="input-control"
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

                      <textarea
                        className="input-control"
                        rows="3"
                        placeholder="Field value"
                        value={field.field_value}
                        onChange={(e) =>
                          handleTemplateFieldChange(index, 'field_value', e.target.value)
                        }
                      />

                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => removeTemplateField(index)}
                      >
                        Remove Field
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={addTemplateField}
                style={{ marginTop: 14 }}
              >
                Add Field
              </button>
            </div>

            <div className="surface-card surface-card-padding">
              <h2 className="section-title">CTA Buttons</h2>

              <div className="form-stack">
                {form.cta_buttons.map((button, index) => (
                  <div key={index} className="surface-card surface-card-padding">
                    <div className="form-stack">
                      <input
                        className="input-control"
                        placeholder="Button key"
                        value={button.button_key}
                        onChange={(e) =>
                          handleCtaChange(index, 'button_key', e.target.value)
                        }
                      />

                      <input
                        className="input-control"
                        placeholder="Button label"
                        value={button.button_label}
                        onChange={(e) =>
                          handleCtaChange(index, 'button_label', e.target.value)
                        }
                      />

                      <input
                        className="input-control"
                        placeholder="Button URL (must be supgad.com)"
                        value={button.button_url}
                        onChange={(e) =>
                          handleCtaChange(index, 'button_url', e.target.value)
                        }
                      />

                      <select
                        className="input-control"
                        value={button.button_style}
                        onChange={(e) =>
                          handleCtaChange(index, 'button_style', e.target.value)
                        }
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                      </select>

                      <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={!!button.open_in_new_tab}
                          onChange={(e) =>
                            handleCtaChange(index, 'open_in_new_tab', e.target.checked)
                          }
                        />
                        Open in new tab
                      </label>

                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => removeCtaButton(index)}
                      >
                        Remove Button
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={addCtaButton}
                style={{ marginTop: 14 }}
              >
                Add CTA Button
              </button>
            </div>

            {error ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(255, 80, 80, 0.12)',
                  border: '1px solid rgba(255, 80, 80, 0.22)',
                }}
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(80, 200, 120, 0.12)',
                  border: '1px solid rgba(80, 200, 120, 0.22)',
                }}
              >
                {success}
              </div>
            ) : null}

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Post'}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate('/affiliate/products')}
            >
              Back to Products
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}