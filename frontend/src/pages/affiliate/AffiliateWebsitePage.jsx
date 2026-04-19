import { useEffect, useMemo, useState } from 'react';
import {
  Globe,
  Save,
  ExternalLink,
  ShieldCheck,
  PencilLine,
  LayoutTemplate,
  Type,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';

function buildPublicWebsiteUrl(slug) {
  if (!slug) return '';
  return `/${slug}`;
}

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
        setError('');
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

        setForm({
          website_name: data.website?.website_name || '',
          slug: data.website?.slug || '',
          custom_domain: data.website?.custom_domain || '',
          meta_title: data.website?.meta_title || '',
          meta_description: data.website?.meta_description || '',
          homepage_template: data.website?.homepage_template || '',
          header_style: data.website?.header_style || '',
          footer_style: data.website?.footer_style || '',
          status: data.website?.status || 'draft',
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save website');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = useMemo(() => {
    return website?.public_url || buildPublicWebsiteUrl(form.slug);
  }, [website, form.slug]);

  const statusClass = useMemo(() => {
    const value = (form.status || '').toLowerCase();

    if (value === 'active') return 'affiliate-website-status active';
    if (value === 'inactive') return 'affiliate-website-status inactive';
    if (value === 'suspended') return 'affiliate-website-status suspended';
    return 'affiliate-website-status draft';
  }, [form.status]);

  if (loading) {
    return (
      <div className="affiliate-website-page">
        <style>{styles}</style>

        <div className="affiliate-website-loading-wrap">
          <div className="affiliate-website-loading-card">
            <div className="affiliate-website-spinner" />
            <p>Loading website...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-website-page">
      <style>{styles}</style>

      <section className="affiliate-website-hero">
        <div className="affiliate-website-hero-copy">
          <div className="affiliate-website-badge">Website manager</div>
          <h1 className="affiliate-website-title">My Website</h1>
          <p className="affiliate-website-subtitle">
            Create and manage your Bloggad storefront website with a clean admin-style
            setup that works well on desktop and mobile.
          </p>
        </div>

        <div className="affiliate-website-hero-side">
          <div className={statusClass}>{form.status || 'draft'}</div>

          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="affiliate-website-preview-btn"
            >
              <ExternalLink size={16} />
              Preview
            </a>
          ) : null}
        </div>
      </section>

      <section className="affiliate-website-grid">
        <div className="affiliate-website-panel affiliate-website-panel-main">
          <div className="affiliate-website-panel-head">
            <div>
              <p className="affiliate-website-panel-kicker">Storefront details</p>
              <h2 className="affiliate-website-panel-title">
                {website ? 'Update your website' : 'Create your website'}
              </h2>
            </div>
          </div>

          <form className="affiliate-website-form" onSubmit={handleSubmit}>
            <div className="affiliate-website-form-grid">
              <label className="affiliate-website-field">
                <span className="affiliate-website-label">
                  <Globe size={16} />
                  Website name
                </span>
                <input
                  className="affiliate-website-input"
                  name="website_name"
                  placeholder="Enter website name"
                  value={form.website_name}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-website-field">
                <span className="affiliate-website-label">
                  <PencilLine size={16} />
                  Website slug
                </span>
                <input
                  className="affiliate-website-input"
                  name="slug"
                  placeholder="your-store-slug"
                  value={form.slug}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-website-field affiliate-website-field-full">
                <span className="affiliate-website-label">
                  <LinkIcon size={16} />
                  Custom domain
                </span>
                <input
                  className="affiliate-website-input"
                  name="custom_domain"
                  placeholder="supgad.com/your-store"
                  value={form.custom_domain}
                  onChange={handleChange}
                />
                <small className="affiliate-website-help">
                  Only approved platform domain format should be used.
                </small>
              </label>

              <label className="affiliate-website-field">
                <span className="affiliate-website-label">
                  <Type size={16} />
                  Meta title
                </span>
                <input
                  className="affiliate-website-input"
                  name="meta_title"
                  placeholder="Meta title for SEO"
                  value={form.meta_title}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-website-field">
                <span className="affiliate-website-label">
                  <LayoutTemplate size={16} />
                  Homepage template
                </span>
                <input
                  className="affiliate-website-input"
                  name="homepage_template"
                  placeholder="Homepage template"
                  value={form.homepage_template}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-website-field">
                <span className="affiliate-website-label">
                  <LayoutTemplate size={16} />
                  Header style
                </span>
                <input
                  className="affiliate-website-input"
                  name="header_style"
                  placeholder="Header style"
                  value={form.header_style}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-website-field">
                <span className="affiliate-website-label">
                  <LayoutTemplate size={16} />
                  Footer style
                </span>
                <input
                  className="affiliate-website-input"
                  name="footer_style"
                  placeholder="Footer style"
                  value={form.footer_style}
                  onChange={handleChange}
                />
              </label>

              <label className="affiliate-website-field">
                <span className="affiliate-website-label">
                  <ShieldCheck size={16} />
                  Status
                </span>
                <select
                  className="affiliate-website-input"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>

              <label className="affiliate-website-field affiliate-website-field-full">
                <span className="affiliate-website-label">
                  <FileText size={16} />
                  Meta description
                </span>
                <textarea
                  className="affiliate-website-input affiliate-website-textarea"
                  name="meta_description"
                  placeholder="Short website description"
                  rows="5"
                  value={form.meta_description}
                  onChange={handleChange}
                />
              </label>
            </div>

            {error ? (
              <div className="affiliate-website-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="affiliate-website-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            ) : null}

            <div className="affiliate-website-actions">
              <button
                className="affiliate-website-save-btn"
                type="submit"
                disabled={saving}
              >
                <Save size={16} />
                {saving
                  ? 'Saving...'
                  : website
                  ? 'Update Website'
                  : 'Create Website'}
              </button>
            </div>
          </form>
        </div>

        <div className="affiliate-website-side-stack">
          <div className="affiliate-website-panel">
            <div className="affiliate-website-panel-head">
              <div>
                <p className="affiliate-website-panel-kicker">Quick preview</p>
                <h2 className="affiliate-website-panel-title">Website summary</h2>
              </div>
            </div>

            <div className="affiliate-website-summary">
              <div className="affiliate-website-summary-row">
                <span>Name</span>
                <strong>{form.website_name || '-'}</strong>
              </div>

              <div className="affiliate-website-summary-row">
                <span>Slug</span>
                <strong>{form.slug || '-'}</strong>
              </div>

              <div className="affiliate-website-summary-row">
                <span>Status</span>
                <strong>{form.status || '-'}</strong>
              </div>

              <div className="affiliate-website-summary-row column">
                <span>Public URL</span>
                <strong className="wrap">{publicUrl || '-'}</strong>
              </div>
            </div>
          </div>

          <div className="affiliate-website-panel">
            <div className="affiliate-website-panel-head">
              <div>
                <p className="affiliate-website-panel-kicker">Guide</p>
                <h2 className="affiliate-website-panel-title">Before you save</h2>
              </div>
            </div>

            <div className="affiliate-website-tips">
              <div className="affiliate-website-tip">
                <span className="dot" />
                <p>Choose a clean website name users can remember easily.</p>
              </div>
              <div className="affiliate-website-tip">
                <span className="dot" />
                <p>Use a short slug because it becomes part of your public store link.</p>
              </div>
              <div className="affiliate-website-tip">
                <span className="dot" />
                <p>Keep your meta title and description readable for search results.</p>
              </div>
              <div className="affiliate-website-tip">
                <span className="dot" />
                <p>Only approved platform links should be used for safety and consistency.</p>
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

  .affiliate-website-page {
    width: 100%;
  }

  .affiliate-website-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-website-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-website-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateWebsiteSpin 0.8s linear infinite;
  }

  @keyframes affiliateWebsiteSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-website-hero {
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

  .affiliate-website-badge {
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

  .affiliate-website-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-website-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-website-hero-side {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-website-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .affiliate-website-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-website-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-website-status.suspended {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-website-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-website-preview-btn,
  .affiliate-website-save-btn {
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

  .affiliate-website-save-btn {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-website-save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-website-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.8fr);
    gap: 20px;
  }

  .affiliate-website-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-website-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-website-panel-main {
    min-height: 100%;
  }

  .affiliate-website-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-website-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-website-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-website-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-website-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-website-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-website-field-full {
    grid-column: span 2;
  }

  .affiliate-website-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-website-input {
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

  .affiliate-website-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-website-textarea {
    min-height: 130px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-website-help {
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
  }

  .affiliate-website-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-website-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-website-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-website-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .affiliate-website-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-website-summary-row {
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

  .affiliate-website-summary-row.column {
    flex-direction: column;
    align-items: flex-start;
  }

  .affiliate-website-summary-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-website-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-website-summary-row strong.wrap {
    width: 100%;
    text-align: left;
    word-break: break-word;
  }

  .affiliate-website-tips {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-website-tip {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-website-tip .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #111827;
    margin-top: 7px;
    flex-shrink: 0;
  }

  .affiliate-website-tip p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  @media (max-width: 1100px) {
    .affiliate-website-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-website-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-website-title {
      font-size: 26px;
    }

    .affiliate-website-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-website-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-website-field-full {
      grid-column: span 1;
    }

    .affiliate-website-title {
      font-size: 22px;
    }

    .affiliate-website-subtitle {
      font-size: 14px;
    }

    .affiliate-website-preview-btn,
    .affiliate-website-save-btn {
      width: 100%;
    }

    .affiliate-website-hero-side,
    .affiliate-website-actions {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-website-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;