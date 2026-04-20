import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Crown,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User2,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function emptySubscriptionForm() {
  return {
    plan_id: '',
    status: 'active',
    amount_paid: '',
    trial_start: '',
    trial_end: '',
    start_date: '',
    end_date: '',
  };
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
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

  if (clean === 'trial') {
    return {
      border: '1px solid #bfdbfe',
      background: '#eff6ff',
      color: '#1d4ed8',
    };
  }

  if (clean === 'inactive' || clean === 'expired') {
    return {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  }

  if (clean === 'suspended' || clean === 'cancelled') {
    return {
      border: '1px solid #f1b5b8',
      background: '#fff1f2',
      color: '#b42318',
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

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedAffiliateId, setSelectedAffiliateId] = useState('');
  const [affiliateDetails, setAffiliateDetails] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState(emptySubscriptionForm());
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [websiteStatusSaving, setWebsiteStatusSaving] = useState(false);
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAffiliates = async () => {
    const { data } = await api.get('/api/admin/affiliates');
    setAffiliates(data?.affiliates || []);
  };

  const fetchPlans = async () => {
    const { data } = await api.get('/api/admin/plans');
    setPlans(data?.plans || []);
  };

  const fetchSingleAffiliate = async (affiliateId) => {
    const { data } = await api.get(`/api/admin/affiliates/${affiliateId}`);
    const affiliate = data?.affiliate || null;
    setAffiliateDetails(affiliate);

    setSubscriptionForm({
      plan_id: affiliate?.subscription?.plan_id || '',
      status: affiliate?.subscription?.subscription_status || 'active',
      amount_paid: affiliate?.subscription?.amount_paid ?? '',
      trial_start: affiliate?.subscription?.trial_start || '',
      trial_end: affiliate?.subscription?.trial_end || '',
      start_date: affiliate?.subscription?.start_date || '',
      end_date: affiliate?.subscription?.end_date || '',
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchAffiliates(), fetchPlans()]);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load affiliates');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSelectAffiliate = async (affiliate) => {
    try {
      setDetailsLoading(true);
      setSelectedAffiliateId(String(affiliate.id));
      setError('');
      setSuccess('');
      await fetchSingleAffiliate(affiliate.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load affiliate details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshAll = async (targetId = null) => {
    await fetchAffiliates();

    const chosenId = targetId || selectedAffiliateId;
    if (chosenId) {
      await fetchSingleAffiliate(chosenId);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setSuccess('');
      await refreshAll();
      setSuccess('Affiliate data refreshed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh affiliate data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAffiliateStatusChange = async (status) => {
    if (!selectedAffiliateId) return;

    try {
      setStatusSaving(true);
      setError('');
      setSuccess('');

      const { data } = await api.put(`/api/admin/affiliates/${selectedAffiliateId}/status`, {
        status,
      });

      await refreshAll(selectedAffiliateId);
      setSuccess(data?.message || 'Affiliate status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update affiliate status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleWebsiteStatusChange = async (websiteStatus) => {
    if (!selectedAffiliateId) return;

    try {
      setWebsiteStatusSaving(true);
      setError('');
      setSuccess('');

      const { data } = await api.put(
        `/api/admin/affiliates/${selectedAffiliateId}/website-status`,
        {
          website_status: websiteStatus,
        }
      );

      await refreshAll(selectedAffiliateId);
      setSuccess(data?.message || 'Website status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update website status');
    } finally {
      setWebsiteStatusSaving(false);
    }
  };

  const handleSubscriptionChange = (event) => {
    const { name, value } = event.target;
    setSubscriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignSubscription = async (event) => {
    event.preventDefault();

    if (!selectedAffiliateId) return;

    try {
      setSubscriptionSaving(true);
      setError('');
      setSuccess('');

      if (!subscriptionForm.plan_id) {
        throw new Error('Plan is required');
      }

      const payload = {
        plan_id: Number(subscriptionForm.plan_id),
        status: subscriptionForm.status,
        amount_paid:
          subscriptionForm.amount_paid === '' ? 0 : Number(subscriptionForm.amount_paid),
        trial_start: subscriptionForm.trial_start || null,
        trial_end: subscriptionForm.trial_end || null,
        start_date: subscriptionForm.start_date || null,
        end_date: subscriptionForm.end_date || null,
      };

      const { data } = await api.post(
        `/api/admin/affiliates/${selectedAffiliateId}/subscription`,
        payload
      );

      await refreshAll(selectedAffiliateId);
      setSuccess(data?.message || 'Subscription assigned successfully');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to assign subscription');
    } finally {
      setSubscriptionSaving(false);
    }
  };

  const handleDeleteAffiliate = async () => {
    if (!selectedAffiliateId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this affiliate account? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      const { data } = await api.delete(`/api/admin/affiliates/${selectedAffiliateId}`);
      setSelectedAffiliateId('');
      setAffiliateDetails(null);
      setSubscriptionForm(emptySubscriptionForm());
      await fetchAffiliates();
      setSuccess(data?.message || 'Affiliate deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete affiliate');
    } finally {
      setDeleting(false);
    }
  };

  const filteredAffiliates = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return affiliates;

    return affiliates.filter((affiliate) => {
      const name = String(affiliate?.name || '').toLowerCase();
      const email = String(affiliate?.email || '').toLowerCase();
      const website = String(affiliate?.website?.website_name || '').toLowerCase();
      const status = String(affiliate?.status || '').toLowerCase();
      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        website.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [affiliates, search]);

  const stats = useMemo(() => {
    const total = affiliates.length;
    const active = affiliates.filter(
      (item) => String(item?.status || '').toLowerCase() === 'active'
    ).length;
    const suspended = affiliates.filter(
      (item) => String(item?.status || '').toLowerCase() === 'suspended'
    ).length;
    const withWebsite = affiliates.filter((item) => item?.website?.id).length;

    return { total, active, suspended, withWebsite };
  }, [affiliates]);

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading affiliates...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-aff-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-aff-main-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 20px;
        }
        .admin-aff-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) 340px;
          gap: 20px;
        }
        .admin-aff-two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .admin-aff-three-grid {
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
          .admin-aff-grid-4,
          .admin-aff-three-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .admin-aff-main-grid,
          .admin-aff-split-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 700px) {
          .admin-aff-grid-4,
          .admin-aff-two-grid,
          .admin-aff-three-grid {
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
              Affiliates
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#646970' }}>
              View affiliate accounts, update statuses, manage websites, and assign subscriptions.
            </p>
          </div>

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
        Affiliate account management covers profile access, website control, and subscription assignment.
      </div>

      <div className="admin-aff-grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Affiliates" value={stats.total} icon={Users} tone="primary" />
        <StatCard label="Active Accounts" value={stats.active} icon={ShieldCheck} tone="success" />
        <StatCard label="Suspended" value={stats.suspended} icon={ShieldAlert} tone="warning" />
        <StatCard label="With Website" value={stats.withWebsite} icon={Globe} />
      </div>

      <div className="admin-aff-main-grid">
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
                  Affiliate List
                </div>
                <div style={{ fontSize: 13, color: '#646970' }}>
                  Select any affiliate to manage account details.
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
                {filteredAffiliates.length} shown
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
                placeholder="Search name, email, website, status..."
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
            {filteredAffiliates.length ? (
              filteredAffiliates.map((affiliate) => {
                const selected = String(selectedAffiliateId) === String(affiliate.id);

                return (
                  <button
                    key={affiliate.id}
                    type="button"
                    onClick={() => handleSelectAffiliate(affiliate)}
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
                          <User2 size={18} />
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
                            {affiliate.name}
                          </div>
                          <div style={{ fontSize: 13, color: '#646970', wordBreak: 'break-word' }}>
                            {affiliate.email}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...badgeStyle(affiliate.status),
                        }}
                      >
                        {affiliate.status || '-'}
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
                        <span>Website</span>
                        <strong style={{ color: '#1d2327' }}>
                          {affiliate.website?.website_name || '-'}
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
                        <span>Role</span>
                        <strong style={{ color: '#1d2327', textTransform: 'capitalize' }}>
                          {affiliate.role || '-'}
                        </strong>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 18, color: '#646970' }}>No affiliates found.</div>
            )}
          </div>
        </section>

        <section>
          {detailsLoading ? (
            <div style={cardStyle({ padding: 20 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
                <Loader2 size={18} className="spin-soft" />
                <span>Loading affiliate details...</span>
              </div>
            </div>
          ) : affiliateDetails ? (
            <>
              <div className="admin-aff-split-grid" style={{ marginBottom: 20 }}>
                <div>
                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                        Affiliate Profile
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        Account identity, role and basic activity figures.
                      </div>
                    </div>

                    <div className="admin-aff-two-grid" style={{ padding: 18 }}>
                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Full Name</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>{affiliateDetails.name}</div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Email</div>
                        <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                          {affiliateDetails.email}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Status</div>
                        <div
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...badgeStyle(affiliateDetails.status),
                          }}
                        >
                          {affiliateDetails.status || '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Role</div>
                        <div style={{ fontWeight: 600, color: '#1d2327', textTransform: 'capitalize' }}>
                          {affiliateDetails.role || '-'}
                        </div>
                      </div>
                    </div>

                    <div className="admin-aff-two-grid" style={{ padding: '0 18px 18px' }}>
                      <StatCard
                        label="Total Products"
                        value={affiliateDetails.stats?.total_products || 0}
                        icon={Crown}
                      />
                      <StatCard
                        label="Total Posts"
                        value={affiliateDetails.stats?.total_posts || 0}
                        icon={Globe}
                      />
                    </div>
                  </div>

                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                        Website Control
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        Review site profile and control website status.
                      </div>
                    </div>

                    <div className="admin-aff-three-grid" style={{ padding: 18 }}>
                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Website Name</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {affiliateDetails.website?.website_name || '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Slug</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {affiliateDetails.website?.slug || '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Website Status</div>
                        <div
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...badgeStyle(affiliateDetails.website?.website_status),
                          }}
                        >
                          {affiliateDetails.website?.website_status || '-'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '0 18px 18px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleWebsiteStatusChange('active')}
                        disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                        style={{
                          border: '1px solid #00a32a',
                          background: '#ffffff',
                          color: '#00a32a',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Set Website Active
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWebsiteStatusChange('inactive')}
                        disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                        style={{
                          border: '1px solid #dba617',
                          background: '#ffffff',
                          color: '#9a6700',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Set Website Inactive
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWebsiteStatusChange('suspended')}
                        disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                        style={{
                          border: '1px solid #d63638',
                          background: '#ffffff',
                          color: '#d63638',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Suspend Website
                      </button>
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                        Affiliate Status Control
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        Activate, deactivate or suspend this affiliate account.
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 18,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleAffiliateStatusChange('active')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #00a32a',
                          background: '#ffffff',
                          color: '#00a32a',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Set Active
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAffiliateStatusChange('inactive')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #dba617',
                          background: '#ffffff',
                          color: '#9a6700',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Set Inactive
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAffiliateStatusChange('suspended')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #d63638',
                          background: '#ffffff',
                          color: '#d63638',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Suspend
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                        Current Subscription
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        Current plan overview and billing status.
                      </div>
                    </div>

                    <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Plan</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {affiliateDetails.subscription?.plan_name || '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Status</div>
                        <div
                          style={{
                            display: 'inline-flex',
                            padding: '5px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            ...badgeStyle(affiliateDetails.subscription?.subscription_status),
                          }}
                        >
                          {affiliateDetails.subscription?.subscription_status || '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Plan Price</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {affiliateDetails.subscription?.plan_price !== null &&
                          affiliateDetails.subscription?.plan_price !== undefined
                            ? formatCurrency(affiliateDetails.subscription.plan_price)
                            : '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Amount Paid</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {affiliateDetails.subscription?.amount_paid !== null &&
                          affiliateDetails.subscription?.amount_paid !== undefined
                            ? formatCurrency(affiliateDetails.subscription.amount_paid)
                            : '-'}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Start Date</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {formatDateTime(affiliateDetails.subscription?.start_date)}
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>End Date</div>
                        <div style={{ fontWeight: 600, color: '#1d2327' }}>
                          {formatDateTime(affiliateDetails.subscription?.end_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                        Danger Zone
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        Permanently remove this affiliate account.
                      </div>
                    </div>

                    <div style={{ padding: 18 }}>
                      <button
                        type="button"
                        onClick={handleDeleteAffiliate}
                        disabled={deleting}
                        style={{
                          width: '100%',
                          border: '1px solid #d63638',
                          background: '#ffffff',
                          color: '#d63638',
                          padding: '12px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <Trash2 size={16} />
                        {deleting ? 'Deleting...' : 'Delete Affiliate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                    Assign Subscription
                  </div>
                  <div style={{ fontSize: 13, color: '#646970' }}>
                    Attach a plan and control trial, amount paid and validity period.
                  </div>
                </div>

                <form onSubmit={handleAssignSubscription} style={{ padding: 18 }}>
                  <div className="admin-aff-three-grid" style={{ marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                        Plan
                      </label>
                      <select
                        name="plan_id"
                        value={subscriptionForm.plan_id}
                        onChange={handleSubscriptionChange}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '1px solid #8c8f94',
                          background: '#fff',
                          color: '#1d2327',
                          outline: 'none',
                        }}
                      >
                        <option value="">Select plan</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                        Subscription Status
                      </label>
                      <select
                        name="status"
                        value={subscriptionForm.status}
                        onChange={handleSubscriptionChange}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          border: '1px solid #8c8f94',
                          background: '#fff',
                          color: '#1d2327',
                          outline: 'none',
                        }}
                      >
                        <option value="trial">Trial</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                        Amount Paid
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
                          name="amount_paid"
                          type="number"
                          placeholder="Amount paid"
                          value={subscriptionForm.amount_paid}
                          onChange={handleSubscriptionChange}
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

                  <div className="admin-aff-two-grid" style={{ marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                        Trial Start
                      </label>
                      <input
                        name="trial_start"
                        type="datetime-local"
                        value={subscriptionForm.trial_start}
                        onChange={handleSubscriptionChange}
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
                        Trial End
                      </label>
                      <input
                        name="trial_end"
                        type="datetime-local"
                        value={subscriptionForm.trial_end}
                        onChange={handleSubscriptionChange}
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

                  <div className="admin-aff-two-grid" style={{ marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#1d2327' }}>
                        Start Date
                      </label>
                      <input
                        name="start_date"
                        type="datetime-local"
                        value={subscriptionForm.start_date}
                        onChange={handleSubscriptionChange}
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
                        End Date
                      </label>
                      <input
                        name="end_date"
                        type="datetime-local"
                        value={subscriptionForm.end_date}
                        onChange={handleSubscriptionChange}
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

                  <div
                    style={{
                      ...cardStyle({
                        padding: 14,
                        background: '#f6f7f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }),
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2327', marginBottom: 4 }}>
                        Save subscription changes
                      </div>
                      <div style={{ fontSize: 13, color: '#646970' }}>
                        This keeps the current API flow and only updates the admin UI.
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={subscriptionSaving}
                      style={{
                        border: '1px solid #2271b1',
                        background: '#2271b1',
                        color: '#fff',
                        padding: '10px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {subscriptionSaving ? (
                        <>
                          <Loader2 size={16} className="spin-soft" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Assign Subscription
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div style={cardStyle({ padding: 40, textAlign: 'center', color: '#646970' })}>
              Select an affiliate from the left panel to view details and manage the account.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}