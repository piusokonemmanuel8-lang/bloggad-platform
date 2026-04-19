import { useEffect, useState } from 'react';
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

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedAffiliateId, setSelectedAffiliateId] = useState('');
  const [affiliateDetails, setAffiliateDetails] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState(emptySubscriptionForm());

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [websiteStatusSaving, setWebsiteStatusSaving] = useState(false);
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading affiliates...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Affiliates</h1>
          <p className="page-subtitle">
            View affiliate accounts, update statuses, manage websites, and assign subscriptions.
          </p>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Affiliate List</h2>

            <div className="form-stack">
              {affiliates.length ? (
                affiliates.map((affiliate) => (
                  <button
                    key={affiliate.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => handleSelectAffiliate(affiliate)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedAffiliateId) === String(affiliate.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedAffiliateId) === String(affiliate.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{affiliate.name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>{affiliate.email}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {affiliate.status}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Website: {affiliate.website?.website_name || '-'}
                    </div>
                  </button>
                ))
              ) : (
                <div>No affiliates yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Affiliate Details</h2>

            {detailsLoading ? (
              <div>Loading affiliate details...</div>
            ) : affiliateDetails ? (
              <div className="form-stack">
                <div className="surface-card surface-card-padding">
                  <div><strong>Name:</strong> {affiliateDetails.name}</div>
                  <div><strong>Email:</strong> {affiliateDetails.email}</div>
                  <div><strong>Status:</strong> {affiliateDetails.status}</div>
                  <div><strong>Role:</strong> {affiliateDetails.role}</div>
                  <div><strong>Total Products:</strong> {affiliateDetails.stats?.total_products || 0}</div>
                  <div><strong>Total Posts:</strong> {affiliateDetails.stats?.total_posts || 0}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Website</h3>
                  <div><strong>Name:</strong> {affiliateDetails.website?.website_name || '-'}</div>
                  <div><strong>Slug:</strong> {affiliateDetails.website?.slug || '-'}</div>
                  <div><strong>Status:</strong> {affiliateDetails.website?.website_status || '-'}</div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleWebsiteStatusChange('active')}
                      disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                    >
                      Set Website Active
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleWebsiteStatusChange('inactive')}
                      disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                    >
                      Set Website Inactive
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleWebsiteStatusChange('suspended')}
                      disabled={websiteStatusSaving || !affiliateDetails.website?.id}
                    >
                      Suspend Website
                    </button>
                  </div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Affiliate Status</h3>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleAffiliateStatusChange('active')}
                      disabled={statusSaving}
                    >
                      Set Active
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleAffiliateStatusChange('inactive')}
                      disabled={statusSaving}
                    >
                      Set Inactive
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleAffiliateStatusChange('suspended')}
                      disabled={statusSaving}
                    >
                      Suspend
                    </button>
                  </div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Current Subscription</h3>
                  <div><strong>Plan:</strong> {affiliateDetails.subscription?.plan_name || '-'}</div>
                  <div><strong>Status:</strong> {affiliateDetails.subscription?.subscription_status || '-'}</div>
                  <div>
                    <strong>Price:</strong>{' '}
                    {affiliateDetails.subscription?.plan_price !== null &&
                    affiliateDetails.subscription?.plan_price !== undefined
                      ? formatCurrency(affiliateDetails.subscription.plan_price)
                      : '-'}
                  </div>
                  <div>
                    <strong>Amount Paid:</strong>{' '}
                    {affiliateDetails.subscription?.amount_paid !== null &&
                    affiliateDetails.subscription?.amount_paid !== undefined
                      ? formatCurrency(affiliateDetails.subscription.amount_paid)
                      : '-'}
                  </div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Assign Subscription</h3>

                  <form className="form-stack" onSubmit={handleAssignSubscription}>
                    <select
                      className="input-control"
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

                    <select
                      className="input-control"
                      name="status"
                      value={subscriptionForm.status}
                      onChange={handleSubscriptionChange}
                    >
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                      className="input-control"
                      name="amount_paid"
                      type="number"
                      placeholder="Amount paid"
                      value={subscriptionForm.amount_paid}
                      onChange={handleSubscriptionChange}
                    />

                    <div className="grid-2">
                      <input
                        className="input-control"
                        name="trial_start"
                        type="datetime-local"
                        value={subscriptionForm.trial_start}
                        onChange={handleSubscriptionChange}
                      />
                      <input
                        className="input-control"
                        name="trial_end"
                        type="datetime-local"
                        value={subscriptionForm.trial_end}
                        onChange={handleSubscriptionChange}
                      />
                    </div>

                    <div className="grid-2">
                      <input
                        className="input-control"
                        name="start_date"
                        type="datetime-local"
                        value={subscriptionForm.start_date}
                        onChange={handleSubscriptionChange}
                      />
                      <input
                        className="input-control"
                        name="end_date"
                        type="datetime-local"
                        value={subscriptionForm.end_date}
                        onChange={handleSubscriptionChange}
                      />
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={subscriptionSaving}>
                      {subscriptionSaving ? 'Saving...' : 'Assign Subscription'}
                    </button>
                  </form>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Danger Zone</h3>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleDeleteAffiliate}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete Affiliate'}
                  </button>
                </div>

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
              </div>
            ) : (
              <div>Select an affiliate to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}