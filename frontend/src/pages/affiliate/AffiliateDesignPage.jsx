import { useEffect, useMemo, useState } from 'react';
import {
  Palette,
  LayoutTemplate,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Save,
  Type,
  Smartphone,
  LayoutPanelTop,
  PanelsTopLeft,
  Search,
  SlidersHorizontal,
  PaintBucket,
  FolderKanban,
} from 'lucide-react';
import api from '../../api/axios';

function getTemplateCardClass(currentId, templateId) {
  return String(currentId) === String(templateId)
    ? 'affiliate-design-template-card active'
    : 'affiliate-design-template-card';
}

export default function AffiliateDesignPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    website_template_id: '',
    header_layout: '',
    footer_layout: '',
    mobile_menu_style: '',
    color_scheme: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    font_family: '',
    button_style: '',
    card_style: '',
    show_search: true,
    show_categories_menu: true,
    show_featured_slider: true,
    custom_css: '',
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [settingsRes, templatesRes] = await Promise.all([
        api.get('/api/affiliate/design'),
        api.get('/api/affiliate/design/templates'),
      ]);

      const settings = settingsRes?.data?.settings || null;
      const templateList = templatesRes?.data?.templates || [];

      setTemplates(templateList);

      if (settings) {
        setForm({
          website_template_id: settings.website_template_id || '',
          header_layout: settings.header_layout || '',
          footer_layout: settings.footer_layout || '',
          mobile_menu_style: settings.mobile_menu_style || '',
          color_scheme: settings.color_scheme || '',
          primary_color: settings.primary_color || '',
          secondary_color: settings.secondary_color || '',
          accent_color: settings.accent_color || '',
          font_family: settings.font_family || '',
          button_style: settings.button_style || '',
          card_style: settings.card_style || '',
          show_search: !!settings.show_search,
          show_categories_menu: !!settings.show_categories_menu,
          show_featured_slider: !!settings.show_featured_slider,
          custom_css: settings.custom_css || '',
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load design settings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        website_template_id: form.website_template_id || null,
        header_layout: form.header_layout,
        footer_layout: form.footer_layout,
        mobile_menu_style: form.mobile_menu_style,
        color_scheme: form.color_scheme,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        accent_color: form.accent_color,
        font_family: form.font_family,
        button_style: form.button_style,
        card_style: form.card_style,
        show_search: form.show_search,
        show_categories_menu: form.show_categories_menu,
        show_featured_slider: form.show_featured_slider,
        custom_css: form.custom_css,
      };

      const { data } = await api.put('/api/affiliate/design', payload);

      if (data?.ok) {
        setSuccess(data.message || 'Design settings saved successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save design settings');
    } finally {
      setSaving(false);
    }
  };

  const currentTemplate = useMemo(() => {
    return (
      templates.find((item) => String(item.id) === String(form.website_template_id)) || null
    );
  }, [templates, form.website_template_id]);

  if (loading) {
    return (
      <div className="affiliate-design-page">
        <style>{styles}</style>

        <div className="affiliate-design-loading-wrap">
          <div className="affiliate-design-loading-card">
            <div className="affiliate-design-spinner" />
            <p>Loading design settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-design-page">
      <style>{styles}</style>

      <section className="affiliate-design-hero">
        <div className="affiliate-design-hero-copy">
          <div className="affiliate-design-badge">Website appearance</div>
          <h1 className="affiliate-design-title">Design Settings</h1>
          <p className="affiliate-design-subtitle">
            Customize your website template, colors, layout, cards, buttons, and storefront
            visibility options.
          </p>
        </div>

        <div className="affiliate-design-hero-actions">
          <button
            className="affiliate-design-btn secondary"
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            className="affiliate-design-btn primary"
            type="submit"
            form="affiliate-design-form"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Design'}
          </button>
        </div>
      </section>

      <section className="affiliate-design-stats">
        <div className="affiliate-design-stat-card">
          <span>Selected Template</span>
          <strong>{currentTemplate?.name || 'None'}</strong>
        </div>

        <div className="affiliate-design-stat-card">
          <span>Search</span>
          <strong>{form.show_search ? 'Enabled' : 'Disabled'}</strong>
        </div>

        <div className="affiliate-design-stat-card">
          <span>Featured Slider</span>
          <strong>{form.show_featured_slider ? 'Enabled' : 'Disabled'}</strong>
        </div>
      </section>

      <section className="affiliate-design-grid">
        <div className="affiliate-design-panel">
          <div className="affiliate-design-panel-head">
            <div>
              <p className="affiliate-design-panel-kicker">Templates</p>
              <h2 className="affiliate-design-panel-title">Available Templates</h2>
            </div>
          </div>

          {templates.length ? (
            <div className="affiliate-design-template-list">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={getTemplateCardClass(form.website_template_id, template.id)}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      website_template_id: String(template.id),
                    }))
                  }
                >
                  <div className="affiliate-design-template-preview">
                    {template.preview_image ? (
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        className="affiliate-design-template-image"
                      />
                    ) : (
                      <div className="affiliate-design-template-image-empty">
                        <LayoutTemplate size={24} />
                        <span>No preview</span>
                      </div>
                    )}
                  </div>

                  <div className="affiliate-design-template-body">
                    <h3>{template.name}</h3>
                    <p>{template.description || 'No description'}</p>
                    <div className="affiliate-design-template-meta">
                      <span>{template.is_premium ? 'Premium' : 'Standard'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="affiliate-design-empty-small">
              <LayoutTemplate size={24} />
              <p>No website templates found.</p>
            </div>
          )}
        </div>

        <div className="affiliate-design-side-stack">
          <div className="affiliate-design-panel">
            <div className="affiliate-design-panel-head">
              <div>
                <p className="affiliate-design-panel-kicker">Customize</p>
                <h2 className="affiliate-design-panel-title">Design Controls</h2>
              </div>
            </div>

            <form
              id="affiliate-design-form"
              className="affiliate-design-form"
              onSubmit={handleSubmit}
            >
              <div className="affiliate-design-form-grid">
                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <LayoutTemplate size={16} />
                    Website template
                  </span>
                  <select
                    className="affiliate-design-input"
                    name="website_template_id"
                    value={form.website_template_id}
                    onChange={handleChange}
                  >
                    <option value="">Select template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <LayoutPanelTop size={16} />
                    Header layout
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="header_layout"
                    placeholder="Header layout"
                    value={form.header_layout}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <PanelsTopLeft size={16} />
                    Footer layout
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="footer_layout"
                    placeholder="Footer layout"
                    value={form.footer_layout}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <Smartphone size={16} />
                    Mobile menu style
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="mobile_menu_style"
                    placeholder="Mobile menu style"
                    value={form.mobile_menu_style}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <Palette size={16} />
                    Color scheme
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="color_scheme"
                    placeholder="Color scheme"
                    value={form.color_scheme}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <PaintBucket size={16} />
                    Primary color
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="primary_color"
                    placeholder="Primary color"
                    value={form.primary_color}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <PaintBucket size={16} />
                    Secondary color
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="secondary_color"
                    placeholder="Secondary color"
                    value={form.secondary_color}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <PaintBucket size={16} />
                    Accent color
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="accent_color"
                    placeholder="Accent color"
                    value={form.accent_color}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">
                    <Type size={16} />
                    Font family
                  </span>
                  <input
                    className="affiliate-design-input"
                    name="font_family"
                    placeholder="Font family"
                    value={form.font_family}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">Button style</span>
                  <input
                    className="affiliate-design-input"
                    name="button_style"
                    placeholder="Button style"
                    value={form.button_style}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-field">
                  <span className="affiliate-design-label">Card style</span>
                  <input
                    className="affiliate-design-input"
                    name="card_style"
                    placeholder="Card style"
                    value={form.card_style}
                    onChange={handleChange}
                  />
                </label>

                <label className="affiliate-design-toggle">
                  <input
                    type="checkbox"
                    name="show_search"
                    checked={form.show_search}
                    onChange={handleChange}
                  />
                  <span>
                    <Search size={15} />
                    Show search
                  </span>
                </label>

                <label className="affiliate-design-toggle">
                  <input
                    type="checkbox"
                    name="show_categories_menu"
                    checked={form.show_categories_menu}
                    onChange={handleChange}
                  />
                  <span>
                    <FolderKanban size={15} />
                    Show categories menu
                  </span>
                </label>

                <label className="affiliate-design-toggle">
                  <input
                    type="checkbox"
                    name="show_featured_slider"
                    checked={form.show_featured_slider}
                    onChange={handleChange}
                  />
                  <span>
                    <SlidersHorizontal size={15} />
                    Show featured slider
                  </span>
                </label>

                <label className="affiliate-design-field affiliate-design-field-full">
                  <span className="affiliate-design-label">Custom CSS</span>
                  <textarea
                    className="affiliate-design-input affiliate-design-textarea"
                    name="custom_css"
                    rows="8"
                    placeholder="Custom CSS"
                    value={form.custom_css}
                    onChange={handleChange}
                  />
                </label>
              </div>

              {error ? (
                <div className="affiliate-design-alert error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              ) : null}

              {success ? (
                <div className="affiliate-design-alert success">
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </div>
              ) : null}

              <div className="affiliate-design-actions">
                <button className="affiliate-design-btn primary" type="submit" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Design Settings'}
                </button>
              </div>
            </form>
          </div>

          <div className="affiliate-design-panel">
            <div className="affiliate-design-panel-head">
              <div>
                <p className="affiliate-design-panel-kicker">Summary</p>
                <h2 className="affiliate-design-panel-title">Current Selection</h2>
              </div>
            </div>

            <div className="affiliate-design-summary">
              <div className="affiliate-design-summary-row">
                <span>Template</span>
                <strong>{currentTemplate?.name || '-'}</strong>
              </div>

              <div className="affiliate-design-summary-row">
                <span>Header</span>
                <strong>{form.header_layout || '-'}</strong>
              </div>

              <div className="affiliate-design-summary-row">
                <span>Footer</span>
                <strong>{form.footer_layout || '-'}</strong>
              </div>

              <div className="affiliate-design-summary-row">
                <span>Mobile Menu</span>
                <strong>{form.mobile_menu_style || '-'}</strong>
              </div>

              <div className="affiliate-design-summary-row">
                <span>Primary Color</span>
                <strong>{form.primary_color || '-'}</strong>
              </div>

              <div className="affiliate-design-summary-row">
                <span>Accent Color</span>
                <strong>{form.accent_color || '-'}</strong>
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

  .affiliate-design-page {
    width: 100%;
  }

  .affiliate-design-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-design-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-design-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateDesignSpin 0.8s linear infinite;
  }

  @keyframes affiliateDesignSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateDesignSpin 0.8s linear infinite;
  }

  .affiliate-design-hero {
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

  .affiliate-design-badge {
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

  .affiliate-design-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-design-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-design-hero-actions,
  .affiliate-design-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-design-btn {
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

  .affiliate-design-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-design-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-design-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-design-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-design-stat-card span {
    color: #6b7280;
    font-size: 13px;
    font-weight: 700;
  }

  .affiliate-design-stat-card strong {
    color: #111827;
    font-size: 26px;
    font-weight: 900;
  }

  .affiliate-design-grid {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
    gap: 20px;
  }

  .affiliate-design-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-design-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-design-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-design-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-design-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-design-template-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .affiliate-design-template-card {
    width: 100%;
    border: 1px solid #edf2f7;
    background: #f8fafc;
    border-radius: 20px;
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
  }

  .affiliate-design-template-card.active {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .affiliate-design-template-preview {
    width: 100%;
    height: 210px;
    background: #ffffff;
    border-bottom: 1px solid #edf2f7;
  }

  .affiliate-design-template-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-design-template-image-empty {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-design-template-body {
    padding: 16px;
  }

  .affiliate-design-template-body h3 {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-design-template-body p {
    margin: 0 0 10px;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .affiliate-design-template-meta span {
    display: inline-flex;
    min-height: 32px;
    align-items: center;
    padding: 0 12px;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    font-size: 12px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-design-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-design-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .affiliate-design-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-design-field-full {
    grid-column: span 2;
  }

  .affiliate-design-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-design-input {
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

  .affiliate-design-input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.06);
  }

  .affiliate-design-textarea {
    min-height: 170px;
    padding: 14px;
    resize: vertical;
  }

  .affiliate-design-toggle {
    min-height: 50px;
    padding: 0 14px;
    border-radius: 16px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    display: flex;
    align-items: center;
  }

  .affiliate-design-toggle span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }

  .affiliate-design-toggle input {
    margin-right: 10px;
  }

  .affiliate-design-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
  }

  .affiliate-design-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-design-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-design-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-design-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-design-summary-row span {
    color: #6b7280;
    font-weight: 700;
    font-size: 13px;
  }

  .affiliate-design-summary-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
    word-break: break-word;
  }

  .affiliate-design-empty-small {
    min-height: 180px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 22px;
  }

  .affiliate-design-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  @media (max-width: 1100px) {
    .affiliate-design-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-design-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-design-title {
      font-size: 26px;
    }

    .affiliate-design-stats {
      grid-template-columns: 1fr;
    }

    .affiliate-design-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-design-title {
      font-size: 22px;
    }

    .affiliate-design-subtitle {
      font-size: 14px;
    }

    .affiliate-design-hero-actions,
    .affiliate-design-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-design-form-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-design-field-full {
      grid-column: span 1;
    }

    .affiliate-design-btn {
      width: 100%;
    }

    .affiliate-design-summary-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;