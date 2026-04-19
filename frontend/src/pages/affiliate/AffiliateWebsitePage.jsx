import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AffiliateWebsitePage() {
  const [form, setForm] = useState({
    website_name: '',
    slug: '',
    custom_domain: '',
    meta_title: '',
    meta_description: '',
    homepage_template: '',
    header_style: '',
    footer_style: '',
    status: 'draft',
  });
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/affiliate/website/me');

        if (data?.ok && data?.website) {
          setWebsite(data.website);
          setForm({
            website_name: data.website.website_name || '',
            slug: data.website.slug || '',
            custom_domain: data.website.custom_domain || '',
            meta_title: data.website.meta_title || '',
            meta_description: data.website.meta_description || '',
            homepage_template: data.website.homepage_template || '',
            header_style: data.website.header_style || '',
            footer_style: data.website.footer_style || '',
            status: data.website.status || 'draft',
          });
        }
      } catch (err) {
        if (err?.response?.status !== 404) {
          setError(err?.response?.data?.message || 'Failed to load website');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, []);

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
      const method = website ? 'put' : 'post';
      const { data } = await api[method]('/api/affiliate/website/me', form);

      if (data?.ok) {
        setWebsite(data.website);
        setSuccess(data.message || 'Website saved successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save website');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading website...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">My Website</h1>
          <p className="page-subtitle">
            Create and manage your Bloggad storefront website.
          </p>
        </div>

        <div className="surface-card surface-card-padding">
          <form className="form-stack" onSubmit={handleSubmit}>
            <input
              className="input-control"
              name="website_name"
              placeholder="Website name"
              value={form.website_name}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="slug"
              placeholder="Website slug"
              value={form.slug}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="custom_domain"
              placeholder="Custom domain"
              value={form.custom_domain}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="meta_title"
              placeholder="Meta title"
              value={form.meta_title}
              onChange={handleChange}
            />

            <textarea
              className="input-control"
              name="meta_description"
              placeholder="Meta description"
              rows="4"
              value={form.meta_description}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="homepage_template"
              placeholder="Homepage template"
              value={form.homepage_template}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="header_style"
              placeholder="Header style"
              value={form.header_style}
              onChange={handleChange}
            />

            <input
              className="input-control"
              name="footer_style"
              placeholder="Footer style"
              value={form.footer_style}
              onChange={handleChange}
            />

            <select
              className="input-control"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
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
              {saving ? 'Saving...' : website ? 'Update Website' : 'Create Website'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}