import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  CheckCircle2,
  Crown,
  ExternalLink,
  Globe,
  Layers3,
  LayoutTemplate,
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
    allow_external_links: false,
    website_templates_mode: 'unlimited',
    blog_templates_mode: 'unlimited',
    allowed_website_template_ids: [],
    allowed_blog_template_ids: [],
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

function yesNoPill(active) {
  return active
    ? {
        border: '1px solid #b7e4c7',
        background: '#ecfdf3',
        color: '#166534',
      }
    : {
        border: '1px solid #dcdcde',
        background: '#f6f7f7',
        color: '#50575e',
      };
}

function modePill(active) {
  return active
    ? {
        border: '1px solid #bfdbfe',
        background: '#eff6ff',
        color: '#1d4ed8',
      }
    : {
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

function TemplatePicker({
  title,
  icon: Icon,
  modeName,
  modeValue,
  onModeChange,
  templates,
  selectedIds,
  onToggleTemplate,
  emptyMessage,
}) {
  const selectedCount = selectedIds.length;

  return (
    <div
      style={{
        border: '1px solid #dcdcde',
        background: '#f6f7f7',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #dcdcde',
            background: '#ffffff',
            color: '#2271b1',
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1d2327', marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#646970', lineHeight: 1.5 }}>
            Choose whether this plan gets all templates or only specific ones.
          </div>
        </div>

        <div
          style={{
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: 600,
            ...modePill(modeValue === 'specific'),
          }}
        >
          {modeValue === 'specific' ? `${selectedCount} selected` : 'Unlimited'}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            border: '1px solid #dcdcde',
            background: '#ffffff',
            cursor: 'pointer',
          }}
        >
          <input
            type="radio"
            name={modeName}
            value="unlimited"
            checked={modeValue === 'unlimited'}
            onChange={onModeChange}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1d2327' }}>Unlimited</span>
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            border: '1px solid #dcdcde',
            background: '#ffffff',
            cursor: 'pointer',
          }}
        >
          <input
            type="radio"
            name={modeName}
            value="specific"
            checked={modeValue === 'specific'}
            onChange={onModeChange}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1d2327' }}>Specific only</span>
        </label>
      </div>

      {modeValue === 'specific' ? (
        templates.length ? (
          <div
            style={{
              display: 'grid',
              gap: 10,
              maxHeight: 260,
              overflowY: 'auto',
              paddingRight: 2,
            }}
          >
            {templates.map((template) => {
              const checked = selectedIds.includes(Number(template.id));

              return (
                <label
                  key={template.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    border: checked ? '1px solid #72aee6' : '1px solid #dcdcde',
                    background: checked ? '#f0f6fc' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleTemplate(template.id)}
                    style={{ marginTop: 2 }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1d2327',
                        marginBottom: 4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {template.name}
                    </div>

                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>
                      {template.template_code_key || template.slug || '-'}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          ...badgeStyle(template.status),
                        }}
                      >
                        {template.status || 'active'}
                      </span>

                      <span
                        style={{
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          ...yesNoPill(!!template.is_premium),
                        }}
                      >
                        {template.is_premium ? 'Premium' : 'Free'}
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: 14,
              border: '1px solid #dcdcde',
              background: '#ffffff',
              color: '#646970',
              fontSize: 13,
            }}
          >
            {emptyMessage}
          </div>
        )
      ) : null}
    </div>
  );
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [websiteTemplates, setWebsiteTemplates] = useState([]);
  const [blogTemplates, setBlogTemplates] = useState([]);
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

  const fetchTemplates = async () => {
    const [websiteRes, blogRes] = await Promise.all([
      api.get('/api/admin/templates/website'),
      api.get('/api/admin/templates/blog'),
    ]);

    return {
      website_templates: websiteRes?.data?.templates || [],
      blog_templates: blogRes?.data?.templates || [],
    };
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');

        const [planList, templateData] = await Promise.all([fetchPlans(), fetchTemplates()]);

        setPlans(planList);
        setWebsiteTemplates(templateData.website_templates || []);
        setBlogTemplates(templateData.blog_templates || []);

        if (planList.length) {
          loadPlanIntoForm(planList[0]);
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
      allow_external_links: !!plan.allow_external_links,
      website_templates_mode: plan.website_templates_mode || 'unlimited',
      blog_templates_mode: plan.blog_templates_mode || 'unlimited',
      allowed_website_template_ids: Array.isArray(plan.allowed_website_template_ids)
        ? plan.allowed_website_template_ids.map(Number)
        : [],
      allowed_blog_template_ids: Array.isArray(plan.allowed_blog_template_ids)
        ? plan.allowed_blog_template_ids.map(Number)
        : [],
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

  const handleToggleMultiTemplate = (fieldName, templateId) => {
    const cleanId = Number(templateId);

    setForm((prev) => {
      const current = Array.isArray(prev[fieldName]) ? prev[fieldName].map(Number) : [];
      const exists = current.includes(cleanId);

      return {
        ...prev,
        [fieldName]: exists ? current.filter((id) => id !== cleanId) : [...current, cleanId],
      };
    });
  };

  const refreshPlans = async (targetId = null) => {
    const [list, templateData] = await Promise.all([fetchPlans(), fetchTemplates()]);

    setPlans(list);
    setWebsiteTemplates(templateData.website_templates || []);
    setBlogTemplates(templateData.blog_templates || []);

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

    if (
      form.website_templates_mode === 'specific' &&
      (!Array.isArray(form.allowed_website_template_ids) || !form.allowed_website_template_ids.length)
    ) {
      throw new Error('Select at least one design template for specific design mode');
    }

    if (
      form.blog_templates_mode === 'specific' &&
      (!Array.isArray(form.allowed_blog_template_ids) || !form.allowed_blog_template_ids.length)
    ) {
      throw new Error('Select at least one post template for specific post mode');
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
        allow_external_links: !!form.allow_external_links,
        website_templates_mode: form.website_templates_mode,
        blog_templates_mode: form.blog_templates_mode,
        allowed_website_template_ids: Array.isArray(form.allowed_website_template_ids)
          ? form.allowed_website_template_ids.map(Number)
          : [],
        allowed_blog_template_ids: Array.isArray(form.allowed_blog_template_ids)
          ? form.allowed_blog_template_ids.map(Number)
          : [],
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
      const externalLinks = plan?.allow_external_links ? 'yes enabled external' : 'no disabled internal supgad';
      const websiteMode = String(plan?.website_templates_mode || '').toLowerCase();
      const blogMode = String(plan?.blog_templates_mode || '').toLowerCase();

      return (
        name.includes(keyword) ||
        billingCycle.includes(keyword) ||
        status.includes(keyword) ||
        price.includes(keyword) ||
        externalLinks.includes(keyword) ||
        websiteMode.includes(keyword) ||
        blogMode.includes(keyword)
      );
    });
  }, [plans, search]);

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((item) => String(item?.status || '').toLowerCase() === 'active').length;
    const inactive = plans.filter((item) => String(item?.status || '').toLowerCase() === 'inactive').length;
    const premiumOnly = plans.filter((item) => !!item?.premium_templates_only).length;
    const externalEnabled = plans.filter((item) => !!item?.allow_external_links).length;

    return { total, active, inactive, premiumOnly, externalEnabled };
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
        .admin-plan-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
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
          .admin-plan-grid-5,
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
              Create and manage yearly subscription plans, limits, premium access, external links, and exact allowed templates.
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
        Plans now control limits, premium access, external links, and also exact allowed design templates and post templates.
      </div>

      <div className="admin-plan-grid-5" style={{ marginBottom: 20 }}>
        <StatCard label="Total Plans" value={stats.total} icon={Tag} tone="primary" />
        <StatCard label="Active Plans" value={stats.active} icon={BadgeCheck} tone="success" />
        <StatCard label="Inactive Plans" value={stats.inactive} icon={ShieldAlert} tone="warning" />
        <StatCard label="Premium Only" value={stats.premiumOnly} icon={Sparkles} />
        <StatCard label="External Links On" value={stats.externalEnabled} icon={ExternalLink} />
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

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>External Links</span>
                        <strong style={{ color: '#1d2327' }}>
                          {plan.allow_external_links ? 'Allowed' : 'Supgad only'}
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
                        <span>Design Templates</span>
                        <strong style={{ color: '#1d2327', textTransform: 'capitalize' }}>
                          {plan.website_templates_mode === 'specific'
                            ? `${plan.allowed_website_template_ids?.length || 0} selected`
                            : 'Unlimited'}
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
                        <span>Post Templates</span>
                        <strong style={{ color: '#1d2327', textTransform: 'capitalize' }}>
                          {plan.blog_templates_mode === 'specific'
                            ? `${plan.allowed_blog_template_ids?.length || 0} selected`
                            : 'Unlimited'}
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
              <div
                style={{
                  border: '1px solid #dcdcde',
                  background: '#f6f7f7',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #dcdcde',
                      background: '#ffffff',
                      color: '#2271b1',
                      flexShrink: 0,
                    }}
                  >
                    <ExternalLink size={18} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1d2327', marginBottom: 6 }}>
                      External posting links
                    </div>
                    <div style={{ fontSize: 13, color: '#646970', lineHeight: 1.5 }}>
                      Turn this on if affiliates on this package should be allowed to use links outside <strong>supgad.com</strong>
                      when creating products, CTA buttons, and blog post link fields.
                    </div>
                  </div>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '14px 16px',
                    border: '1px solid #dcdcde',
                    background: '#ffffff',
                    marginTop: 14,
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2327', marginBottom: 4 }}>
                      Allow external links for this plan
                    </div>
                    <div style={{ fontSize: 12, color: '#646970' }}>
                      Off = only supgad.com. On = any valid domain allowed.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        ...yesNoPill(!!form.allow_external_links),
                      }}
                    >
                      {form.allow_external_links ? 'Enabled' : 'Disabled'}
                    </div>

                    <input
                      type="checkbox"
                      name="allow_external_links"
                      checked={!!form.allow_external_links}
                      onChange={handleChange}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="admin-plan-two-grid" style={{ marginBottom: 16 }}>
              <TemplatePicker
                title="Design template access"
                icon={LayoutTemplate}
                modeName="website_templates_mode"
                modeValue={form.website_templates_mode}
                onModeChange={handleChange}
                templates={websiteTemplates}
                selectedIds={form.allowed_website_template_ids}
                onToggleTemplate={(templateId) =>
                  handleToggleMultiTemplate('allowed_website_template_ids', templateId)
                }
                emptyMessage="No design templates available."
              />

              <TemplatePicker
                title="Post template access"
                icon={Layers3}
                modeName="blog_templates_mode"
                modeValue={form.blog_templates_mode}
                onModeChange={handleChange}
                templates={blogTemplates}
                selectedIds={form.allowed_blog_template_ids}
                onToggleTemplate={(templateId) =>
                  handleToggleMultiTemplate('allowed_blog_template_ids', templateId)
                }
                emptyMessage="No post templates available."
              />
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

                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>
                        External Links
                      </div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {form.allow_external_links ? 'Allowed' : 'Supgad only'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>
                        Design Templates
                      </div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {form.website_templates_mode === 'specific'
                          ? `${form.allowed_website_template_ids.length} selected`
                          : 'Unlimited'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>
                        Post Templates
                      </div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {form.blog_templates_mode === 'specific'
                          ? `${form.allowed_blog_template_ids.length} selected`
                          : 'Unlimited'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Limits</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        P: {form.product_limit === '' ? '-' : form.product_limit} | B: {form.post_limit === '' ? '-' : form.post_limit}
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