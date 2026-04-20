import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  XCircle,
  Upload,
} from 'lucide-react';
import api from '../../api/axios';

const BUILT_IN_WEBSITE_TEMPLATES = [
  {
    name: 'Free Simple',
    slug: 'free-simple',
    preview_image: '',
    template_code_key: 'free_simple',
    description: 'Simple free website storefront template.',
    is_premium: false,
    status: 'active',
  },
  {
    name: 'Premium Brand',
    slug: 'premium-brand',
    preview_image: '',
    template_code_key: 'premium_brand',
    description: 'Premium visual storefront template.',
    is_premium: true,
    status: 'active',
  },
  {
    name: 'Mega Electronics',
    slug: 'mega-electronics',
    preview_image: '',
    template_code_key: 'mega_electronics',
    description: 'Electronics premium storefront template.',
    is_premium: true,
    status: 'active',
  },
];

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

function cardStyle(extra = {}) {
  return {
    background: '#ffffff',
    border: '1px solid #dcdcde',
    borderRadius: 0,
    boxShadow: 'none',
    ...extra,
  };
}

function badgeStyle(status) {
  const clean = String(status || '').toLowerCase();

  if (clean === 'active') {
    return {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  }

  if (clean === 'inactive') {
    return {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  }

  return {
    border: '1px solid #dcdcde',
    background: '#f6f7f7',
    color: '#50575e',
  };
}

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const iconTone =
    tone === 'primary'
      ? { background: '#2271b1', color: '#fff', border: '1px solid #2271b1' }
      : tone === 'success'
      ? { background: '#ecfdf3', color: '#166534', border: '1px solid #b7e4c7' }
      : tone === 'warning'
      ? { background: '#fff7e6', color: '#9a6700', border: '1px solid #f3d28b' }
      : { background: '#f6f7f7', color: '#1d2327', border: '1px solid #dcdcde' };

  return (
    <div style={cardStyle({ padding: 20 })}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 34, lineHeight: 1, fontWeight: 700, color: '#1d2327' }}>
            {value}
          </div>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...iconTone,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function tabButtonStyle(active) {
  return {
    border: active ? '1px solid #2271b1' : '1px solid #dcdcde',
    background: active ? '#2271b1' : '#ffffff',
    color: active ? '#ffffff' : '#1d2327',
    padding: '10px 16px',
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function normalizeCodeKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

export default function AdminTemplatesPage() {
  const [websiteTemplates, setWebsiteTemplates] = useState([]);
  const [blogTemplates, setBlogTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('website');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState(emptyWebsiteTemplateForm());
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const fetchTemplatesFromApi = async () => {
    const [websiteRes, blogRes] = await Promise.all([
      api.get('/api/admin/templates/website'),
      api.get('/api/admin/templates/blog'),
    ]);

    return {
      websiteList: websiteRes?.data?.templates || [],
      blogList: blogRes?.data?.templates || [],
    };
  };

  const ensureBuiltInWebsiteTemplates = async (websiteList) => {
    const existingKeys = new Set(
      websiteList.map((item) => normalizeCodeKey(item?.template_code_key))
    );

    const missingTemplates = BUILT_IN_WEBSITE_TEMPLATES.filter(
      (item) => !existingKeys.has(normalizeCodeKey(item.template_code_key))
    );

    if (!missingTemplates.length) {
      return { created: 0 };
    }

    setSeeding(true);

    try {
      await Promise.all(
        missingTemplates.map((template) =>
          api.post('/api/admin/templates/website', template)
        )
      );

      return { created: missingTemplates.length };
    } finally {
      setSeeding(false);
    }
  };

  const applyFetchedTemplates = (websiteList, blogList, preferredType = activeTab, preferredId = null) => {
    setWebsiteTemplates(websiteList);
    setBlogTemplates(blogList);

    const preferredList = preferredType === 'website' ? websiteList : blogList;
    const foundPreferred = preferredList.find(
      (item) => String(item.id) === String(preferredId || selectedId)
    );

    if (foundPreferred) {
      loadTemplateIntoForm(preferredType, foundPreferred);
      return;
    }

    if (preferredType === 'website' && websiteList.length) {
      loadTemplateIntoForm('website', websiteList[0]);
      return;
    }

    if (preferredType === 'blog' && blogList.length) {
      loadTemplateIntoForm('blog', blogList[0]);
      return;
    }

    if (websiteList.length) {
      loadTemplateIntoForm('website', websiteList[0]);
      return;
    }

    if (blogList.length) {
      loadTemplateIntoForm('blog', blogList[0]);
      return;
    }

    resetForNew(preferredType);
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError('');

        const firstFetch = await fetchTemplatesFromApi();
        const seedResult = await ensureBuiltInWebsiteTemplates(firstFetch.websiteList);

        if (seedResult.created > 0) {
          const secondFetch = await fetchTemplatesFromApi();
          applyFetchedTemplates(secondFetch.websiteList, secondFetch.blogList, 'website');
        } else {
          applyFetchedTemplates(firstFetch.websiteList, firstFetch.blogList, 'website');
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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePreviewUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPreview(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post('/api/uploads/template-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = data?.file?.url || '';
      if (!uploadedUrl) {
        throw new Error('Upload did not return file url');
      }

      setForm((prev) => ({
        ...prev,
        preview_image: uploadedUrl,
      }));

      setSuccess('Preview image uploaded successfully. Click update template to save it.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload preview image');
    } finally {
      setUploadingPreview(false);
      event.target.value = '';
    }
  };

  const refreshTemplates = async (type = activeTab, targetId = null) => {
    const fetched = await fetchTemplatesFromApi();
    applyFetchedTemplates(fetched.websiteList, fetched.blogList, type, targetId);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setSuccess('');

      const fetched = await fetchTemplatesFromApi();
      const seedResult = await ensureBuiltInWebsiteTemplates(fetched.websiteList);

      if (seedResult.created > 0) {
        await refreshTemplates(activeTab);
        setSuccess(`Templates refreshed. Added ${seedResult.created} built-in template(s).`);
      } else {
        applyFetchedTemplates(fetched.websiteList, fetched.blogList, activeTab);
        setSuccess('Templates refreshed successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh templates');
    } finally {
      setRefreshing(false);
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
      } else {
        await refreshTemplates(form.type);
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

    const confirmed = window.confirm('Are you sure you want to delete this template?');
    if (!confirmed) return;

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

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return currentList;

    return currentList.filter((template) => {
      const name = String(template?.name || '').toLowerCase();
      const slug = String(template?.slug || '').toLowerCase();
      const codeKey = String(template?.template_code_key || '').toLowerCase();
      const status = String(template?.status || '').toLowerCase();

      return (
        name.includes(keyword) ||
        slug.includes(keyword) ||
        codeKey.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [currentList, search]);

  const stats = useMemo(() => {
    const allTemplates = [...websiteTemplates, ...blogTemplates];
    const active = allTemplates.filter(
      (item) => String(item?.status || '').toLowerCase() === 'active'
    ).length;
    const inactive = allTemplates.filter(
      (item) => String(item?.status || '').toLowerCase() === 'inactive'
    ).length;
    const premium = allTemplates.filter((item) => !!item?.is_premium).length;

    return {
      website: websiteTemplates.length,
      blog: blogTemplates.length,
      active,
      inactive,
      premium,
    };
  }, [websiteTemplates, blogTemplates]);

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-template-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-template-main-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 20px;
        }
        .admin-template-two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .admin-preview-upload-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
        }
        .admin-preview-upload-btn {
          border: 1px solid #2271b1;
          background: #2271b1;
          color: #ffffff;
          padding: 12px 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }
        .admin-preview-upload-btn.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spin-soft {
          animation: spinSoft 0.9s linear infinite;
        }
        @keyframes spinSoft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          .admin-template-grid-5 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .admin-template-main-grid,
          .admin-template-two-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 700px) {
          .admin-template-grid-5,
          .admin-preview-upload-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 10,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.2,
                fontWeight: 700,
                color: '#1d2327',
              }}
            >
              Templates
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#646970' }}>
              Manage both website templates and blog templates for the marketplace.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || seeding}
              style={{
                border: '1px solid #2271b1',
                background: refreshing || seeding ? '#f6f7f7' : '#ffffff',
                color: '#2271b1',
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RefreshCw size={16} className={refreshing || seeding ? 'spin-soft' : ''} />
              {refreshing ? 'Refreshing...' : seeding ? 'Adding Built-ins...' : 'Refresh'}
            </button>

            <button
              type="button"
              onClick={() => resetForNew(activeTab)}
              style={{
                border: '1px solid #2271b1',
                background: '#2271b1',
                color: '#ffffff',
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Plus size={16} />
              New Template
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #d63638',
              color: '#b42318',
              marginBottom: 20,
            }),
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #00a32a',
              color: '#166534',
              marginBottom: 20,
            }),
          }}
        >
          {success}
        </div>
      ) : null}

      <div
        style={{
          ...cardStyle({
            padding: 16,
            marginBottom: 20,
            borderLeft: '4px solid #72aee6',
          }),
        }}
      >
        Template records control the available marketplace designs for websites and blog posts.
      </div>

      <div className="admin-template-grid-5" style={{ marginBottom: 20 }}>
        <StatCard
          label="Website Templates"
          value={stats.website}
          icon={LayoutTemplate}
          tone="primary"
        />
        <StatCard label="Blog Templates" value={stats.blog} icon={Layers3} />
        <StatCard label="Active" value={stats.active} icon={BadgeCheck} tone="success" />
        <StatCard label="Inactive" value={stats.inactive} icon={ShieldAlert} tone="warning" />
        <StatCard label="Premium" value={stats.premium} icon={Sparkles} />
      </div>

      <div style={{ ...cardStyle({ padding: 16, marginBottom: 20 }) }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('website');
              resetForNew('website');
            }}
            style={tabButtonStyle(activeTab === 'website')}
          >
            Website Templates
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('blog');
              resetForNew('blog');
            }}
            style={tabButtonStyle(activeTab === 'blog')}
          >
            Blog Templates
          </button>
        </div>
      </div>

      <div className="admin-template-main-grid">
        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1d2327',
                    marginBottom: 6,
                  }}
                >
                  {activeTab === 'website' ? 'Website Template List' : 'Blog Template List'}
                </div>
                <div style={{ fontSize: 13, color: '#646970' }}>
                  Select a template to edit its details.
                </div>
              </div>

              <div
                style={{
                  padding: '6px 10px',
                  background: '#f6f7f7',
                  border: '1px solid #dcdcde',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#50575e',
                }}
              >
                {filteredTemplates.length} shown
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#646970',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, slug, code key, status..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1px solid #8c8f94',
                  background: '#fff',
                  color: '#1d2327',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 900, overflowY: 'auto', padding: 18 }}>
            {filteredTemplates.length ? (
              filteredTemplates.map((template) => {
                const selected = String(selectedId) === String(template.id);

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => loadTemplateIntoForm(activeTab, template)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: 12,
                      padding: 16,
                      cursor: 'pointer',
                      background: selected ? '#f0f6fc' : '#ffffff',
                      border: selected ? '1px solid #72aee6' : '1px solid #dcdcde',
                    }}
                  >
                    {template.preview_image ? (
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        style={{
                          width: '100%',
                          height: 210,
                          objectFit: 'cover',
                          marginBottom: 14,
                          border: '1px solid #dcdcde',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: 160,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f6f7f7',
                          border: '1px solid #dcdcde',
                          color: '#646970',
                          marginBottom: 14,
                        }}
                      >
                        <ImageIcon size={24} />
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#1d2327',
                            marginBottom: 4,
                            wordBreak: 'break-word',
                          }}
                        >
                          {template.name}
                        </div>
                        <div style={{ fontSize: 13, color: '#646970', wordBreak: 'break-word' }}>
                          Code Key: {template.template_code_key || '-'}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...badgeStyle(template.status),
                        }}
                      >
                        {template.status || '-'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 8, fontSize: 13, color: '#646970' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>Premium</span>
                        <strong style={{ color: '#1d2327' }}>
                          {template.is_premium ? 'Yes' : 'No'}
                        </strong>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>Slug</span>
                        <strong style={{ color: '#1d2327' }}>{template.slug || '-'}</strong>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 18, color: '#646970' }}>No templates found.</div>
            )}
          </div>
        </section>

        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
              {selectedId ? 'Edit Template' : 'Create Template'}
            </div>
            <div style={{ fontSize: 13, color: '#646970' }}>
              Manage template identity, preview image, code key, description, and premium access.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 18 }}>
            <div className="admin-template-two-grid" style={{ marginBottom: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1d2327',
                  }}
                >
                  Template Name
                </label>
                <input
                  name="name"
                  placeholder="Template name"
                  value={form.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #8c8f94',
                    background: '#fff',
                    color: '#1d2327',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1d2327',
                  }}
                >
                  Slug
                </label>
                <input
                  name="slug"
                  placeholder="Template slug"
                  value={form.slug}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #8c8f94',
                    background: '#fff',
                    color: '#1d2327',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div className="admin-template-two-grid" style={{ marginBottom: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1d2327',
                  }}
                >
                  Preview Image URL
                </label>

                <div className="admin-preview-upload-row">
                  <input
                    name="preview_image"
                    placeholder="Preview image URL"
                    value={form.preview_image}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #8c8f94',
                      background: '#fff',
                      color: '#1d2327',
                      outline: 'none',
                    }}
                  />

                  <label
                    className={`admin-preview-upload-btn ${uploadingPreview ? 'disabled' : ''}`}
                  >
                    <Upload size={16} />
                    {uploadingPreview ? 'Uploading...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePreviewUpload}
                      disabled={uploadingPreview}
                      hidden
                    />
                  </label>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1d2327',
                  }}
                >
                  Template Code Key
                </label>
                <input
                  name="template_code_key"
                  placeholder="Template code key"
                  value={form.template_code_key}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #8c8f94',
                    background: '#fff',
                    color: '#1d2327',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1d2327',
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                style={{
                  width: '100%',
                  minHeight: 150,
                  padding: '12px 14px',
                  border: '1px solid #8c8f94',
                  background: '#fff',
                  color: '#1d2327',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="admin-template-two-grid">
              <div style={{ ...cardStyle({ padding: 16, background: '#f6f7f7' }) }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1d2327',
                    marginBottom: 14,
                  }}
                >
                  Template Preview
                </div>

                <div style={cardStyle({ padding: 14 })}>
                  {form.preview_image ? (
                    <img
                      src={form.preview_image}
                      alt={form.name || 'Template preview'}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        border: '1px solid #dcdcde',
                        marginBottom: 14,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f6f7f7',
                        border: '1px solid #dcdcde',
                        color: '#646970',
                        marginBottom: 14,
                      }}
                    >
                      <ImageIcon size={26} />
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: '#1d2327',
                          marginBottom: 4,
                        }}
                      >
                        {form.name || 'Template name'}
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        {form.template_code_key || 'template_code_key'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        ...badgeStyle(form.status),
                      }}
                    >
                      {form.status}
                    </div>
                  </div>

                  <div className="admin-template-two-grid">
                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Type</div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#1d2327',
                          textTransform: 'capitalize',
                        }}
                      >
                        {form.type}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>
                        Premium
                      </div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {form.is_premium ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle({ padding: 16, background: '#f6f7f7' }) }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1d2327',
                    marginBottom: 14,
                  }}
                >
                  Quick Actions
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      border: '1px solid #dcdcde',
                      background: '#ffffff',
                      color: '#1d2327',
                    }}
                  >
                    <input
                      type="checkbox"
                      name="is_premium"
                      checked={!!form.is_premium}
                      onChange={handleChange}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Premium template</span>
                  </label>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#1d2327',
                      }}
                    >
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1px solid #8c8f94',
                        background: '#fff',
                        color: '#1d2327',
                        outline: 'none',
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      border: '1px solid #2271b1',
                      background: '#2271b1',
                      color: '#ffffff',
                      padding: '10px 14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="spin-soft" />
                        Saving...
                      </>
                    ) : selectedId ? (
                      <>
                        <PencilLine size={16} />
                        Update Template
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Template
                      </>
                    )}
                  </button>

                  {selectedId ? (
                    <>
                      <button
                        type="button"
                        onClick={handleToggleStatus}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #dba617',
                          background: '#ffffff',
                          color: '#9a6700',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        {statusSaving ? (
                          <>
                            <Loader2 size={16} className="spin-soft" />
                            Updating...
                          </>
                        ) : form.status === 'active' ? (
                          <>
                            <XCircle size={16} />
                            Set Inactive
                          </>
                        ) : (
                          <>
                            <BadgeCheck size={16} />
                            Set Active
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                          border: '1px solid #d63638',
                          background: '#ffffff',
                          color: '#d63638',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        {deleting ? (
                          <>
                            <Loader2 size={16} className="spin-soft" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Delete Template
                          </>
                        )}
                      </button>
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => resetForNew(activeTab)}
                    style={{
                      border: '1px solid #8c8f94',
                      background: '#ffffff',
                      color: '#1d2327',
                      padding: '10px 14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Plus size={16} />
                    Reset For New
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}