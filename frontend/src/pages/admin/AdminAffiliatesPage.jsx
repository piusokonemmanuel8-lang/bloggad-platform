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

function statusBadgeClass(status) {
  const clean = String(status || '').toLowerCase();

  if (clean === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (clean === 'trial') {
    return 'border-sky-200 bg-sky-50 text-sky-700';
  }

  if (clean === 'inactive' || clean === 'expired') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (clean === 'suspended' || clean === 'cancelled') {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const toneClass =
    tone === 'primary'
      ? 'bg-slate-950 text-white border-slate-950'
      : tone === 'success'
      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
      : tone === 'warning'
      ? 'bg-amber-50 text-amber-900 border-amber-200'
      : 'bg-white text-slate-900 border-slate-200';

  const iconWrapClass =
    tone === 'primary'
      ? 'bg-white/10 text-white'
      : tone === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : tone === 'warning'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{label}</p>
          <p className="mt-3 text-2xl font-bold">{value}</p>
        </div>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconWrapClass}`}>
          <Icon size={20} />
        </span>
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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm font-medium">Loading affiliates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                Administrator
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Affiliate Management</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                View affiliate accounts, review website setup, control access status, and assign
                subscription plans from one clean admin page.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
          <StatCard label="Total Affiliates" value={stats.total} icon={Users} tone="primary" />
          <StatCard label="Active Accounts" value={stats.active} icon={ShieldCheck} tone="success" />
          <StatCard label="Suspended" value={stats.suspended} icon={ShieldAlert} tone="warning" />
          <StatCard label="With Website" value={stats.withWebsite} icon={Globe} />
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Affiliate List</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select any affiliate to manage account details.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {filteredAffiliates.length} shown
              </span>
            </div>

            <div className="relative mt-4">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, website, status..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-[980px] space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
            {filteredAffiliates.length ? (
              filteredAffiliates.map((affiliate) => {
                const selected = String(selectedAffiliateId) === String(affiliate.id);

                return (
                  <button
                    key={affiliate.id}
                    type="button"
                    onClick={() => handleSelectAffiliate(affiliate)}
                    className={[
                      'w-full rounded-3xl border p-4 text-left transition',
                      selected
                        ? 'border-slate-900 bg-slate-950 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              'inline-flex h-10 w-10 items-center justify-center rounded-2xl',
                              selected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700',
                            ].join(' ')}
                          >
                            <User2 size={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{affiliate.name}</p>
                            <p
                              className={[
                                'truncate text-xs',
                                selected ? 'text-slate-300' : 'text-slate-500',
                              ].join(' ')}
                            >
                              {affiliate.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <span
                        className={[
                          'rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize',
                          selected
                            ? 'border-white/15 bg-white/10 text-white'
                            : statusBadgeClass(affiliate.status),
                        ].join(' ')}
                      >
                        {affiliate.status || '-'}
                      </span>
                    </div>

                    <div
                      className={[
                        'mt-4 grid gap-2 text-xs',
                        selected ? 'text-slate-300' : 'text-slate-500',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>Website</span>
                        <span className="truncate font-medium">
                          {affiliate.website?.website_name || '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Role</span>
                        <span className="font-medium capitalize">{affiliate.role || '-'}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-500">No affiliates found.</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          {detailsLoading ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm font-medium">Loading affiliate details...</span>
              </div>
            </div>
          ) : affiliateDetails ? (
            <>
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_380px]">
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h3 className="text-lg font-bold text-slate-900">Affiliate Profile</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Account identity, role and basic activity figures.
                      </p>
                    </div>

                    <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Full Name
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {affiliateDetails.name}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Email
                        </p>
                        <p className="mt-2 break-all text-sm font-bold text-slate-900">
                          {affiliateDetails.email}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Status
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                              affiliateDetails.status
                            )}`}
                          >
                            {affiliateDetails.status || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Role
                        </p>
                        <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                          {affiliateDetails.role || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 border-t border-slate-200 px-6 py-6 sm:grid-cols-2">
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

                  <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h3 className="text-lg font-bold text-slate-900">Website Control</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Review site profile and control website status.
                      </p>
                    </div>

                    <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Website Name
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {affiliateDetails.website?.website_name || '-'}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Slug
                        </p>
                        <p className="mt-2 break-all text-sm font-bold text-slate-900">
                          {affiliateDetails.website?.slug || '-'}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Website Status
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                              affiliateDetails.website?.website_status
                            )}`}
                          >
                            {affiliateDetails.website?.website_status || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-slate-200 px-6 py-6">
                      <button
                        type="button"
                        onClick={() => handleWebsiteStatusChange('active')}
                        disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        Set Website Active
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWebsiteStatusChange('inactive')}
                        disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        Set Website Inactive
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWebsiteStatusChange('suspended')}
                        disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ShieldAlert size={16} />
                        Suspend Website
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h3 className="text-lg font-bold text-slate-900">Affiliate Status Control</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Activate, deactivate or suspend this affiliate account.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 px-6 py-6">
                      <button
                        type="button"
                        onClick={() => handleAffiliateStatusChange('active')}
                        disabled={statusSaving}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        Set Active
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAffiliateStatusChange('inactive')}
                        disabled={statusSaving}
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        Set Inactive
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAffiliateStatusChange('suspended')}
                        disabled={statusSaving}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ShieldAlert size={16} />
                        Suspend
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h3 className="text-lg font-bold text-slate-900">Current Subscription</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Current plan overview and billing status.
                      </p>
                    </div>

                    <div className="space-y-4 px-6 py-6">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Plan
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {affiliateDetails.subscription?.plan_name || '-'}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Status
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                              affiliateDetails.subscription?.subscription_status
                            )}`}
                          >
                            {affiliateDetails.subscription?.subscription_status || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Plan Price
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {affiliateDetails.subscription?.plan_price !== null &&
                          affiliateDetails.subscription?.plan_price !== undefined
                            ? formatCurrency(affiliateDetails.subscription.plan_price)
                            : '-'}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Amount Paid
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {affiliateDetails.subscription?.amount_paid !== null &&
                          affiliateDetails.subscription?.amount_paid !== undefined
                            ? formatCurrency(affiliateDetails.subscription.amount_paid)
                            : '-'}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Start Date
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {formatDateTime(affiliateDetails.subscription?.start_date)}
                        </p>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          End Date
                        </p>
                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {formatDateTime(affiliateDetails.subscription?.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h3 className="text-lg font-bold text-slate-900">Danger Zone</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Permanently remove this affiliate account.
                      </p>
                    </div>

                    <div className="px-6 py-6">
                      <button
                        type="button"
                        onClick={handleDeleteAffiliate}
                        disabled={deleting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        {deleting ? 'Deleting...' : 'Delete Affiliate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h3 className="text-lg font-bold text-slate-900">Assign Subscription</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Attach a plan and control trial, amount paid and validity period.
                  </p>
                </div>

                <form onSubmit={handleAssignSubscription} className="space-y-6 px-6 py-6">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Plan</label>
                      <select
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        name="plan_id"
                        value={subscriptionForm.plan_id}
                        onChange={handleSubscriptionChange}
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
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Subscription Status
                      </label>
                      <select
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        name="status"
                        value={subscriptionForm.status}
                        onChange={handleSubscriptionChange}
                      >
                        <option value="trial">Trial</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Amount Paid
                      </label>
                      <div className="relative">
                        <Wallet
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                          name="amount_paid"
                          type="number"
                          placeholder="Amount paid"
                          value={subscriptionForm.amount_paid}
                          onChange={handleSubscriptionChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Trial Start
                      </label>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        name="trial_start"
                        type="datetime-local"
                        value={subscriptionForm.trial_start}
                        onChange={handleSubscriptionChange}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Trial End
                      </label>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        name="trial_end"
                        type="datetime-local"
                        value={subscriptionForm.trial_end}
                        onChange={handleSubscriptionChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Start Date
                      </label>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        name="start_date"
                        type="datetime-local"
                        value={subscriptionForm.start_date}
                        onChange={handleSubscriptionChange}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        End Date
                      </label>
                      <input
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        name="end_date"
                        type="datetime-local"
                        value={subscriptionForm.end_date}
                        onChange={handleSubscriptionChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Save subscription changes</p>
                      <p className="mt-1 text-xs text-slate-500">
                        This keeps the current API flow and only upgrades the admin UI.
                      </p>
                    </div>

                    <button
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={subscriptionSaving}
                    >
                      {subscriptionSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
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
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
                <Users size={24} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">No affiliate selected</h3>
              <p className="mt-2 text-sm text-slate-500">
                Choose an affiliate from the left panel to view details and manage the account.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}