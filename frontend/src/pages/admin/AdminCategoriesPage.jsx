import { useEffect, useState } from 'react';
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [form, setForm] = useState(emptyForm());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/admin/categories');
        const list = data?.categories || [];
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

    fetchCategories();
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
    const { data } = await api.get('/api/admin/categories');
    const list = data?.categories || [];
    setCategories(list);

    const found = list.find((item) => String(item.id) === String(targetId || selectedCategoryId));
    if (found) {
      loadCategoryIntoForm(found);
    } else if (!list.length) {
      resetForNew();
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Categories</h1>
          <p className="page-subtitle">
            Create, edit, activate, deactivate, and manage product categories.
          </p>
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
                Category List
              </h2>

              <button className="btn btn-primary" type="button" onClick={resetForNew}>
                New Category
              </button>
            </div>

            <div className="form-stack">
              {categories.length ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => loadCategoryIntoForm(category)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedCategoryId) === String(category.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedCategoryId) === String(category.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{category.name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>Slug: {category.slug}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {category.status}
                    </div>
                  </button>
                ))
              ) : (
                <div>No categories yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">
              {selectedCategoryId ? 'Edit Category' : 'Create Category'}
            </h2>

            <form className="form-stack" onSubmit={handleSubmit}>
              <input
                className="input-control"
                name="name"
                placeholder="Category name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="slug"
                placeholder="Category slug"
                value={form.slug}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="icon"
                placeholder="Category icon"
                value={form.icon}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="sort_order"
                type="number"
                placeholder="Sort order"
                value={form.sort_order}
                onChange={handleChange}
              />

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
                  {saving ? 'Saving...' : selectedCategoryId ? 'Update Category' : 'Create Category'}
                </button>

                {selectedCategoryId ? (
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