import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
      <div className="page-shell">
        <div className="container section-space">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">Update your product details and CTA settings.</p>
        </div>

        <div className="surface-card surface-card-padding">
          <form className="form-stack" onSubmit={handleSubmit}>
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

            <input
              className="input-control"
              name="title"
              placeholder="Product title"
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

            <input
              className="input-control"
              name="product_image"
              placeholder="Product image URL"
              value={form.product_image}
              onChange={handleChange}
            />

            <select
              className="input-control"
              name="pricing_type"
              value={form.pricing_type}
              onChange={handleChange}
            >
              <option value="simple">Simple</option>
              <option value="variable">Variable</option>
            </select>

            {form.pricing_type === 'simple' ? (
              <input
                className="input-control"
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
              />
            ) : (
              <div className="grid-2">
                <input
                  className="input-control"
                  name="min_price"
                  type="number"
                  placeholder="Minimum price"
                  value={form.min_price}
                  onChange={handleChange}
                />
                <input
                  className="input-control"
                  name="max_price"
                  type="number"
                  placeholder="Maximum price"
                  value={form.max_price}
                  onChange={handleChange}
                />
              </div>
            )}

            <input
              className="input-control"
              name="homepage_cta_label"
              placeholder="Homepage CTA label"
              value={form.homepage_cta_label}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="storefront_cta_label"
              placeholder="Storefront CTA label"
              value={form.storefront_cta_label}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="affiliate_buy_url"
              placeholder="Affiliate Buy URL"
              value={form.affiliate_buy_url}
              onChange={handleChange}
            />

            <textarea
              className="input-control"
              name="short_description"
              placeholder="Short description"
              rows="4"
              value={form.short_description}
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
              {saving ? 'Saving...' : 'Update Product'}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate(`/affiliate/products/${id}/posts`)}
            >
              Manage Product Posts
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}