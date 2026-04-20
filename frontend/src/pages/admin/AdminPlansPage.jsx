import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Crown,
  Loader2,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  Wallet,
  XCircle,
} from 'lucide-react';
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

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPlans = async () => {
    const { data } = await api.get('/api/admin/plans');
    return data?.plans || [];
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        const list = await fetchPlans();
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

    init();
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
    const list = await fetchPlans();
    setPlans(list);

    const found = list.find((item) => String(item.id) === String(targetId || selectedPlanId));
    if (found) {
      loadPlanIntoForm(found);
    } else if (!list.length) {
      resetForNew();
    } else {
      loadPlanIntoForm(list[0]);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setSuccess('');
      await refreshPlans();
      setSuccess('Plans refreshed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh plans');
    } finally {
      setRefreshing(false);
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
      } else {
        await refreshPlans();
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

    const confirmed = window.confirm('Are you sure you want to delete this plan?');
    if (!confirmed) return;

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

  const filteredPlans = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return plans;

    return plans.filter((plan) => {
      const name = String(plan?.name || '').toLowerCase();
      const billingCycle = String(plan?.billing_cycle || '').toLowerCase();
      const status = String(plan?.status || '').toLowerCase();
      const price = String(plan?.price ?? '').toLowerCase();

      return (
        name.includes(keyword) ||
        billingCycle.includes(keyword) ||
        status.includes(keyword) ||
        price.includes(keyword)
      );
    });
  }, [plans, search]);

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((item) => String(item?.status || '').toLowerCase() === 'active').length;
    const inactive = plans.filter((item) => String(item?.status || '').toLowerCase() === 'inactive').length;
    const premiumOnly = plans.filter((item) => !!item?.premium_templates_only).length;

    return { total, active, inactive, premiumOnly };
  }, [plans]);

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-plan-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-plan-main-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 20px;
        }
        .admin-plan-two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .admin-plan-three-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
          .admin-plan-grid-4,
          .admin-plan-main-grid,
          .admin-plan-two-grid,
          .admin-plan-three-grid {
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
              Plans
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#646970' }}>
              Create and manage yearly subscription plans, limits, and premium access rules.
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
              New Plan
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
        Subscription plans control pricing, content limits, and premium template access for affiliates.
      </div>

      <div className="admin-plan-grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Plans" value={stats.total} icon={Tag} tone="primary" />
        <StatCard label="Active Plans" value={stats.active} icon={BadgeCheck} tone="success" />
        <StatCard label="Inactive Plans" value={stats.inactive} icon={ShieldAlert} tone="warning" />
        <StatCard label="Premium Only" value={stats.premiumOnly} icon={Sparkles} />
      </div>

      <div className="admin-plan-main-grid">
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
                  Plan List
                </div>
                <div style={{ fontSize: 13, color: '#646970' }}>
                  Select a plan to edit subscription settings.
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
                {filteredPlans.length} shown
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
                placeholder="Search name, price, cycle, status..."
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
            {filteredPlans.length ? (
              filteredPlans.map((plan) => {
                const selected = String(selectedPlanId) === String(plan.id);

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => loadPlanIntoForm(plan)}
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
                          <Crown size={18} />
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
                            {plan.name}
                          </div>
                          <div style={{ fontSize: 13, color: '#646970' }}>
                            {plan.price !== null && plan.price !== undefined
                              ? formatCurrency(plan.price)
                              : '-'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...badgeStyle(plan.status),
                        }}
                      >
                        {plan.status || '-'}
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
                        <span>Billing</span>
                        <strong style={{ color: '#1d2327', textTransform: 'capitalize' }}>
                          {plan.billing_cycle || '-'}
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
                        <span>Premium Templates</span>
                        <strong style={{ color: '#1d2327' }}>
                          {plan.premium_templates_only ? 'Yes' : 'No'}
                        </strong>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 18, color: '#646970' }}>No plans found.</div>
            )}
          </div>
        </section>

        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
              {selectedPlanId ? 'Edit Plan' : 'Create Plan'}
            </div>
            <div style={{ fontSize: 13, color: '#646970' }}>
              Manage plan price, limits, access rules, and feature configuration.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 18 }}>
            <div className="admin-plan-three-grid" style={{ marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                  Plan Name
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
                    name="name"
                    placeholder="Plan name"
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
                  Price
                </label>
                <div style={{ position: 'relative' }}>
                  <Wallet
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
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={form.price}
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
                  Billing Cycle
                </label>
                <select
                  name="billing_cycle"
                  value={form.billing_cycle}
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
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="admin-plan-three-grid" style={{ marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                  Product Limit
                </label>
                <input
                  name="product_limit"
                  type="number"
                  placeholder="Product limit"
                  value={form.product_limit}
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
                  Post Limit
                </label>
                <input
                  name="post_limit"
                  type="number"
                  placeholder="Post limit"
                  value={form.post_limit}
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
                  Website Limit
                </label>
                <input
                  name="website_limit"
                  type="number"
                  placeholder="Website limit"
                  value={form.website_limit}
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

            <div className="admin-plan-three-grid" style={{ marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                  Slider Limit
                </label>
                <input
                  name="slider_limit"
                  type="number"
                  placeholder="Slider limit"
                  value={form.slider_limit}
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
                  Menu Limit
                </label>
                <input
                  name="menu_limit"
                  type="number"
                  placeholder="Menu limit"
                  value={form.menu_limit}
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

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #dcdcde',
                    background: '#f6f7f7',
                    color: '#1d2327',
                  }}
                >
                  <input
                    type="checkbox"
                    name="premium_templates_only"
                    checked={!!form.premium_templates_only}
                    onChange={handleChange}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Premium templates only</span>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                Features JSON
              </label>
              <textarea
                name="features_json"
                rows="8"
                placeholder='Features JSON e.g. {"trial_days":30}'
                value={form.features_json}
                onChange={handleChange}
                style={{
                  width: '100%',
                  minHeight: 220,
                  padding: '12px 14px',
                  border: '1px solid #8c8f94',
                  background: '#fff',
                  color: '#1d2327',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div className="admin-plan-two-grid">
              <div style={{ ...cardStyle({ padding: 16, background: '#f6f7f7' }) }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2327', marginBottom: 14 }}>
                  Plan Preview
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
                        {form.name || 'Plan name'}
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        {form.price === '' ? '-' : formatCurrency(Number(form.price || 0))}
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

                  <div className="admin-plan-two-grid">
                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Billing</div>
                      <div style={{ fontWeight: 600, color: '#1d2327', textTransform: 'capitalize' }}>
                        {form.billing_cycle || '-'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>
                        Premium Templates
                      </div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {form.premium_templates_only ? 'Yes' : 'No'}
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
                    ) : selectedPlanId ? (
                      <>
                        <PencilLine size={16} />
                        Update Plan
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Create Plan
                      </>
                    )}
                  </button>

                  {selectedPlanId ? (
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
                            Delete Plan
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