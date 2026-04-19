import { useEffect, useState } from 'react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function emptyForm() {
  return {
    name: '',
    price: '',
    billing_cycle: 'yearly',
    product_limit: '',
    post_limit: '',
    website_limit: '',
    slider_limit: '',
    menu_limit: '',
    premium_templates_only: false,
    features_json: '',
    status: 'active',
  };
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [form, setForm] = useState(emptyForm());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/admin/plans');
        const list = data?.plans || [];
        setPlans(list);

        if (list.length) {
          loadPlanIntoForm(list[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const loadPlanIntoForm = (plan) => {
    setSelectedPlanId(String(plan.id));
    setForm({
      name: plan.name || '',
      price: plan.price ?? '',
      billing_cycle: plan.billing_cycle || 'yearly',
      product_limit: plan.product_limit ?? '',
      post_limit: plan.post_limit ?? '',
      website_limit: plan.website_limit ?? '',
      slider_limit: plan.slider_limit ?? '',
      menu_limit: plan.menu_limit ?? '',
      premium_templates_only: !!plan.premium_templates_only,
      features_json: plan.features_json ? JSON.stringify(plan.features_json, null, 2) : '',
      status: plan.status || 'active',
    });
    setError('');
    setSuccess('');
  };

  const resetForNew = () => {
    setSelectedPlanId('');
    setForm(emptyForm());
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

  const refreshPlans = async (targetId = null) => {
    const { data } = await api.get('/api/admin/plans');
    const list = data?.plans || [];
    setPlans(list);

    const found = list.find((item) => String(item.id) === String(targetId || selectedPlanId));
    if (found) {
      loadPlanIntoForm(found);
    } else if (!list.length) {
      resetForNew();
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      throw new Error('Plan name is required');
    }

    if (form.price === '' || Number(form.price) < 0) {
      throw new Error('Valid plan price is required');
    }

    if (form.features_json.trim()) {
      try {
        JSON.parse(form.features_json);
      } catch (err) {
        throw new Error('Features JSON must be valid JSON');
      }
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
        price: Number(form.price),
        billing_cycle: form.billing_cycle,
        product_limit: form.product_limit === '' ? null : Number(form.product_limit),
        post_limit: form.post_limit === '' ? null : Number(form.post_limit),
        website_limit: form.website_limit === '' ? null : Number(form.website_limit),
        slider_limit: form.slider_limit === '' ? null : Number(form.slider_limit),
        menu_limit: form.menu_limit === '' ? null : Number(form.menu_limit),
        premium_templates_only: !!form.premium_templates_only,
        features_json: form.features_json.trim() ? JSON.parse(form.features_json) : null,
        status: form.status,
      };

      let response;

      if (selectedPlanId) {
        response = await api.put(`/api/admin/plans/${selectedPlanId}`, payload);
      } else {
        response = await api.post('/api/admin/plans', payload);
      }

      const savedPlan = response?.data?.plan;
      if (savedPlan?.id) {
        await refreshPlans(savedPlan.id);
      }

      setSuccess(response?.data?.message || 'Plan saved successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedPlanId) return;

    setStatusSaving(true);
    setError('');
    setSuccess('');

    try {
      const nextStatus = form.status === 'active' ? 'inactive' : 'active';

      const { data } = await api.put(`/api/admin/plans/${selectedPlanId}/status`, {
        status: nextStatus,
      });

      await refreshPlans(selectedPlanId);
      setSuccess(data?.message || 'Plan status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update plan status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlanId) return;

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.delete(`/api/admin/plans/${selectedPlanId}`);
      await refreshPlans();
      setSuccess(data?.message || 'Plan deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Plans</h1>
          <p className="page-subtitle">
            Create and manage yearly subscription plans, limits, and premium access rules.
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
                Plan List
              </h2>

              <button className="btn btn-primary" type="button" onClick={resetForNew}>
                New Plan
              </button>
            </div>

            <div className="form-stack">
              {plans.length ? (
                plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => loadPlanIntoForm(plan)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedPlanId) === String(plan.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedPlanId) === String(plan.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{plan.name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Price: {plan.price !== null ? formatCurrency(plan.price) : '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Billing: {plan.billing_cycle}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {plan.status}
                    </div>
                  </button>
                ))
              ) : (
                <div>No plans yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">
              {selectedPlanId ? 'Edit Plan' : 'Create Plan'}
            </h2>

            <form className="form-stack" onSubmit={handleSubmit}>
              <input
                className="input-control"
                name="name"
                placeholder="Plan name"
                value={form.name}
                onChange={handleChange}
              />

              <input
                className="input-control"
                name="price"
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
              />

              <select
                className="input-control"
                name="billing_cycle"
                value={form.billing_cycle}
                onChange={handleChange}
              >
                <option value="yearly">Yearly</option>
              </select>

              <div className="grid-2">
                <input
                  className="input-control"
                  name="product_limit"
                  type="number"
                  placeholder="Product limit"
                  value={form.product_limit}
                  onChange={handleChange}
                />
                <input
                  className="input-control"
                  name="post_limit"
                  type="number"
                  placeholder="Post limit"
                  value={form.post_limit}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-2">
                <input
                  className="input-control"
                  name="website_limit"
                  type="number"
                  placeholder="Website limit"
                  value={form.website_limit}
                  onChange={handleChange}
                />
                <input
                  className="input-control"
                  name="slider_limit"
                  type="number"
                  placeholder="Slider limit"
                  value={form.slider_limit}
                  onChange={handleChange}
                />
              </div>

              <input
                className="input-control"
                name="menu_limit"
                type="number"
                placeholder="Menu limit"
                value={form.menu_limit}
                onChange={handleChange}
              />

              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="premium_templates_only"
                  checked={!!form.premium_templates_only}
                  onChange={handleChange}
                />
                Premium templates only
              </label>

              <textarea
                className="input-control"
                name="features_json"
                rows="8"
                placeholder='Features JSON e.g. {"trial_days":30}'
                value={form.features_json}
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
                  {saving ? 'Saving...' : selectedPlanId ? 'Update Plan' : 'Create Plan'}
                </button>

                {selectedPlanId ? (
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