import { useEffect, useState } from 'react';
import api from '../../api/axios';

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
      }
    };

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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading design settings...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Design Settings</h1>
          <p className="page-subtitle">
            Customize your website template, colors, layout, and storefront look.
          </p>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Available Templates</h2>

            <div className="form-stack">
              {templates.length ? (
                templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        website_template_id: String(template.id),
                      }))
                    }
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(form.website_template_id) === String(template.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(form.website_template_id) === String(template.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {template.preview_image ? (
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        style={{
                          width: '100%',
                          height: 220,
                          objectFit: 'cover',
                          borderRadius: 16,
                          marginBottom: 14,
                        }}
                      />
                    ) : null}

                    <div style={{ display: 'grid', gap: 8 }}>
                      <div style={{ fontSize: '1.08rem', fontWeight: 700 }}>{template.name}</div>
                      <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                        {template.description || 'No description'}
                      </div>
                      <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                        Premium: {template.is_premium ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div>No website templates found.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Customize Design</h2>

            <form className="form-stack" onSubmit={handleSubmit}>
              <select
                className="input-control"
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

              <input
                className="input-control"
                name="header_layout"
                placeholder="Header layout"
                value={form.header_layout}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="footer_layout"
                placeholder="Footer layout"
                value={form.footer_layout}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="mobile_menu_style"
                placeholder="Mobile menu style"
                value={form.mobile_menu_style}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="color_scheme"
                placeholder="Color scheme"
                value={form.color_scheme}
                onChange={handleChange}
              />

              <div className="grid-2">
                <input
                  className="input-control"
                  name="primary_color"
                  placeholder="Primary color"
                  value={form.primary_color}
                  onChange={handleChange}
                />
                <input
                  className="input-control"
                  name="secondary_color"
                  placeholder="Secondary color"
                  value={form.secondary_color}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-2">
                <input
                  className="input-control"
                  name="accent_color"
                  placeholder="Accent color"
                  value={form.accent_color}
                  onChange={handleChange}
                />
                <input
                  className="input-control"
                  name="font_family"
                  placeholder="Font family"
                  value={form.font_family}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-2">
                <input
                  className="input-control"
                  name="button_style"
                  placeholder="Button style"
                  value={form.button_style}
                  onChange={handleChange}
                />
                <input
                  className="input-control"
                  name="card_style"
                  placeholder="Card style"
                  value={form.card_style}
                  onChange={handleChange}
                />
              </div>

              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="show_search"
                  checked={form.show_search}
                  onChange={handleChange}
                />
                Show search
              </label>

              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="show_categories_menu"
                  checked={form.show_categories_menu}
                  onChange={handleChange}
                />
                Show categories menu
              </label>

              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="show_featured_slider"
                  checked={form.show_featured_slider}
                  onChange={handleChange}
                />
                Show featured slider
              </label>

              <textarea
                className="input-control"
                name="custom_css"
                rows="8"
                placeholder="Custom CSS"
                value={form.custom_css}
                onChange={handleChange}
              />

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
                {saving ? 'Saving...' : 'Save Design Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}