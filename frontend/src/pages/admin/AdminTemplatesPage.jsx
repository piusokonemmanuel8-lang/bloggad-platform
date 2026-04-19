import { useEffect, useState } from 'react';
import api from '../../api/axios';

function emptyWebsiteTemplateForm() {
  return {
    type: 'website',
    name: '',
    slug: '',
    preview_image: '',
    template_code_key: '',
    description: '',
    is_premium: false,
    status: 'active',
  };
}

function emptyBlogTemplateForm() {
  return {
    type: 'blog',
    name: '',
    slug: '',
    preview_image: '',
    template_code_key: '',
    description: '',
    is_premium: false,
    status: 'active',
  };
}

export default function AdminTemplatesPage() {
  const [websiteTemplates, setWebsiteTemplates] = useState([]);
  const [blogTemplates, setBlogTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('website');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyWebsiteTemplateForm());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);

        const [websiteRes, blogRes] = await Promise.all([
          api.get('/api/admin/templates/website'),
          api.get('/api/admin/templates/blog'),
        ]);

        const websiteList = websiteRes?.data?.templates || [];
        const blogList = blogRes?.data?.templates || [];

        setWebsiteTemplates(websiteList);
        setBlogTemplates(blogList);

        if (websiteList.length) {
          loadTemplateIntoForm('website', websiteList[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const currentList = activeTab === 'website' ? websiteTemplates : blogTemplates;

  const loadTemplateIntoForm = (type, template) => {
    setActiveTab(type);
    setSelectedId(String(template.id));
    setForm({
      type,
      name: template.name || '',
      slug: template.slug || '',
      preview_image: template.preview_image || '',
      template_code_key: template.template_code_key || '',
      description: template.description || '',
      is_premium: !!template.is_premium,
      status: template.status || 'active',
    });
    setError('');
    setSuccess('');
  };

  const resetForNew = (type = activeTab) => {
    setSelectedId('');
    setActiveTab(type);
    setForm(type === 'website' ? emptyWebsiteTemplateForm() : emptyBlogTemplateForm());
    setError('');
    setSuccess('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const refreshTemplates = async (type = activeTab, targetId = null) => {
    const [websiteRes, blogRes] = await Promise.all([
      api.get('/api/admin/templates/website'),
      api.get('/api/admin/templates/blog'),
    ]);

    const websiteList = websiteRes?.data?.templates || [];
    const blogList = blogRes?.data?.templates || [];

    setWebsiteTemplates(websiteList);
    setBlogTemplates(blogList);

    const list = type === 'website' ? websiteList : blogList;
    const found = list.find((item) => String(item.id) === String(targetId || selectedId));

    if (found) {
      loadTemplateIntoForm(type, found);
    } else if (!list.length) {
      resetForNew(type);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      throw new Error('Template name is required');
    }

    if (!form.template_code_key.trim()) {
      throw new Error('Template code key is required');
    }
  };

  const getBasePath = () =>
    form.type === 'website' ? '/api/admin/templates/website' : '/api/admin/templates/blog';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      validateForm();

      const payload = {
        name: form.name,
        slug: form.slug,
        preview_image: form.preview_image,
        template_code_key: form.template_code_key,
        description: form.description,
        is_premium: !!form.is_premium,
        status: form.status,
      };

      let response;

      if (selectedId) {
        response = await api.put(`${getBasePath()}/${selectedId}`, payload);
      } else {
        response = await api.post(getBasePath(), payload);
      }

      const savedTemplate = response?.data?.template;
      if (savedTemplate?.id) {
        await refreshTemplates(form.type, savedTemplate.id);
      }

      setSuccess(response?.data?.message || 'Template saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedId) return;

    setStatusSaving(true);
    setError('');
    setSuccess('');

    try {
      const nextStatus = form.status === 'active' ? 'inactive' : 'active';

      const { data } = await api.put(`${getBasePath()}/${selectedId}/status`, {
        status: nextStatus,
      });

      await refreshTemplates(form.type, selectedId);
      setSuccess(data?.message || 'Template status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update template status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.delete(`${getBasePath()}/${selectedId}`);
      await refreshTemplates(form.type);
      setSuccess(data?.message || 'Template deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Templates</h1>
          <p className="page-subtitle">
            Manage both website templates and blog templates for the marketplace.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              setActiveTab('website');
              resetForNew('website');
            }}
          >
            Website Templates
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setActiveTab('blog');
              resetForNew('blog');
            }}
          >
            Blog Templates
          </button>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 className="section-title" style={{ margin: 0 }}>
                {activeTab === 'website' ? 'Website Template List' : 'Blog Template List'}
              </h2>

              <button className="btn btn-primary" type="button" onClick={() => resetForNew(activeTab)}>
                New Template
              </button>
            </div>

            <div className="form-stack">
              {currentList.length ? (
                currentList.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => loadTemplateIntoForm(activeTab, template)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedId) === String(template.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedId) === String(template.id)
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

                    <div style={{ fontWeight: 700 }}>{template.name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Code Key: {template.template_code_key || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Premium: {template.is_premium ? 'Yes' : 'No'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {template.status}
                    </div>
                  </button>
                ))
              ) : (
                <div>No templates yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">
              {selectedId ? 'Edit Template' : 'Create Template'}
            </h2>

            <form className="form-stack" onSubmit={handleSubmit}>
              <input
                className="input-control"
                name="name"
                placeholder="Template name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="slug"
                placeholder="Template slug"
                value={form.slug}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="preview_image"
                placeholder="Preview image URL"
                value={form.preview_image}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="template_code_key"
                placeholder="Template code key"
                value={form.template_code_key}
                onChange={handleChange}
              />

              <textarea
                className="input-control"
                name="description"
                rows="4"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
              />

              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="is_premium"
                  checked={!!form.is_premium}
                  onChange={handleChange}
                />
                Premium template
              </label>

              <select
                className="input-control"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
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

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : selectedId ? 'Update Template' : 'Create Template'}
                </button>

                {selectedId ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleToggleStatus}
                      disabled={statusSaving}
                    >
                      {statusSaving
                        ? 'Updating...'
                        : form.status === 'active'
                          ? 'Set Inactive'
                          : 'Set Active'}
                    </button>

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}