import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FolderTree,
  Hash,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react';
import api from '../../api/axios';

function emptyForm() {
  return {
    name: '',
    slug: '',
    icon: '',
    sort_order: 0,
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    const { data } = await api.get('/api/admin/categories');
    return data?.categories || [];
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        const list = await fetchCategories();
        setCategories(list);

        if (list.length) {
          loadCategoryIntoForm(list[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const loadCategoryIntoForm = (category) => {
    setSelectedCategoryId(String(category.id));
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      icon: category.icon || '',
      sort_order: category.sort_order ?? 0,
      status: category.status || 'active',
    });
    setError('');
    setSuccess('');
  };

  const resetForNew = () => {
    setSelectedCategoryId('');
    setForm(emptyForm());
    setError('');
    setSuccess('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const refreshCategories = async (targetId = null) => {
    const list = await fetchCategories();
    setCategories(list);

    const found = list.find((item) => String(item.id) === String(targetId || selectedCategoryId));
    if (found) {
      loadCategoryIntoForm(found);
    } else if (!list.length) {
      resetForNew();
    } else {
      loadCategoryIntoForm(list[0]);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setSuccess('');
      await refreshCategories();
      setSuccess('Categories refreshed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh categories');
    } finally {
      setRefreshing(false);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      throw new Error('Category name is required');
    }
  };

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
        icon: form.icon,
        sort_order: Number(form.sort_order || 0),
        status: form.status,
      };

      let response;

      if (selectedCategoryId) {
        response = await api.put(`/api/admin/categories/${selectedCategoryId}`, payload);
      } else {
        response = await api.post('/api/admin/categories', payload);
      }

      const savedCategory = response?.data?.category;
      if (savedCategory?.id) {
        await refreshCategories(savedCategory.id);
      } else {
        await refreshCategories();
      }

      setSuccess(response?.data?.message || 'Category saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedCategoryId) return;

    setStatusSaving(true);
    setError('');
    setSuccess('');

    try {
      const nextStatus = form.status === 'active' ? 'inactive' : 'active';

      const { data } = await api.put(`/api/admin/categories/${selectedCategoryId}/status`, {
        status: nextStatus,
      });

      await refreshCategories(selectedCategoryId);
      setSuccess(data?.message || 'Category status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update category status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategoryId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this category? This action cannot be undone.'
    );

    if (!confirmed) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.delete(`/api/admin/categories/${selectedCategoryId}`);
      await refreshCategories();
      setSuccess(data?.message || 'Category deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter((category) => {
      const name = String(category?.name || '').toLowerCase();
      const slug = String(category?.slug || '').toLowerCase();
      const icon = String(category?.icon || '').toLowerCase();
      const status = String(category?.status || '').toLowerCase();

      return (
        name.includes(keyword) ||
        slug.includes(keyword) ||
        icon.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [categories, search]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(
      (item) => String(item?.status || '').toLowerCase() === 'active'
    ).length;
    const inactive = categories.filter(
      (item) => String(item?.status || '').toLowerCase() === 'inactive'
    ).length;

    return { total, active, inactive };
  }, [categories]);

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-cat-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-cat-main-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 20px;
        }
        .admin-cat-two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .spin-soft {
          animation: spinSoft 0.9s linear infinite;
        }
        @keyframes spinSoft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          .admin-cat-grid-3,
          .admin-cat-main-grid,
          .admin-cat-two-grid {
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
              Categories
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#646970' }}>
              Create, edit, activate, deactivate, and manage product categories.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                border: '1px solid #2271b1',
                background: refreshing ? '#f6f7f7' : '#ffffff',
                color: '#2271b1',
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'spin-soft' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>

            <button
              type="button"
              onClick={resetForNew}
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
              New Category
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

      <div style={{ ...cardStyle({ padding: 16, marginBottom: 20, borderLeft: '4px solid #72aee6' }) }}>
        Category records control how products are grouped and displayed across the marketplace.
      </div>

      <div className="admin-cat-grid-3" style={{ marginBottom: 20 }}>
        <StatCard label="Total Categories" value={stats.total} icon={FolderTree} tone="primary" />
        <StatCard label="Active Categories" value={stats.active} icon={CheckCircle2} tone="success" />
        <StatCard label="Inactive Categories" value={stats.inactive} icon={ShieldAlert} tone="warning" />
      </div>

      <div className="admin-cat-main-grid">
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
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                  Category List
                </div>
                <div style={{ fontSize: 13, color: '#646970' }}>
                  Select a category to edit its details.
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
                {filteredCategories.length} shown
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
                placeholder="Search name, slug, icon, status..."
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
            {filteredCategories.length ? (
              filteredCategories.map((category) => {
                const selected = String(selectedCategoryId) === String(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => loadCategoryIntoForm(category)}
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f6f7f7',
                            border: '1px solid #dcdcde',
                            color: '#1d2327',
                            flexShrink: 0,
                          }}
                        >
                          <Tag size={18} />
                        </div>

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
                            {category.name}
                          </div>
                          <div style={{ fontSize: 13, color: '#646970', wordBreak: 'break-word' }}>
                            {category.slug || '-'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...badgeStyle(category.status),
                        }}
                      >
                        {category.status || '-'}
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
                        <span>Icon</span>
                        <strong style={{ color: '#1d2327' }}>{category.icon || '-'}</strong>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>Sort Order</span>
                        <strong style={{ color: '#1d2327' }}>{category.sort_order ?? 0}</strong>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 18, color: '#646970' }}>No categories found.</div>
            )}
          </div>
        </section>

        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
              {selectedCategoryId ? 'Edit Category' : 'Create Category'}
            </div>
            <div style={{ fontSize: 13, color: '#646970' }}>
              Manage name, slug, icon, sort order, and category visibility.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 18 }}>
            <div className="admin-cat-two-grid" style={{ marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                  Category Name
                </label>
                <div style={{ position: 'relative' }}>
                  <FolderTree
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
                    name="name"
                    placeholder="Category name"
                    value={form.name}
                    onChange={handleChange}
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

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                  Slug
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash
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
                    name="slug"
                    placeholder="Category slug"
                    value={form.slug}
                    onChange={handleChange}
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
            </div>

            <div className="admin-cat-grid-3" style={{ marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                  Icon
                </label>
                <div style={{ position: 'relative' }}>
                  <Tag
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
                    name="icon"
                    placeholder="Category icon"
                    value={form.icon}
                    onChange={handleChange}
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

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                  Sort Order
                </label>
                <input
                  name="sort_order"
                  type="number"
                  placeholder="Sort order"
                  value={form.sort_order}
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
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
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
            </div>

            <div className="admin-cat-two-grid">
              <div style={{ ...cardStyle({ padding: 16, background: '#f6f7f7' }) }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2327', marginBottom: 14 }}>
                  Category Preview
                </div>

                <div style={cardStyle({ padding: 14 })}>
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
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 4 }}>
                        {form.name || 'Category name'}
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        {form.slug || 'category-slug'}
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

                  <div className="admin-cat-two-grid">
                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Icon</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>{form.icon || '-'}</div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Sort Order</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {Number(form.sort_order || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle({ padding: 16, background: '#f6f7f7' }) }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2327', marginBottom: 14 }}>
                  Quick Actions
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
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
                    ) : selectedCategoryId ? (
                      <>
                        <PencilLine size={16} />
                        Update Category
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Category
                      </>
                    )}
                  </button>

                  {selectedCategoryId ? (
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
                            <CheckCircle2 size={16} />
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
                            Delete Category
                          </>
                        )}
                      </button>
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={resetForNew}
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