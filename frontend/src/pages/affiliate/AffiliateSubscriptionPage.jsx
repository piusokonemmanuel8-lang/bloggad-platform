import { useEffect, useState } from 'react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

export default function AffiliateSubscriptionPage() {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubscriptionData = async () => {
    const [overviewRes, historyRes] = await Promise.all([
      api.get('/api/affiliate/subscription'),
      api.get('/api/affiliate/subscription/history'),
    ]);

    setOverview({
      current_subscription: overviewRes?.data?.current_subscription || null,
      available_plans: overviewRes?.data?.available_plans || [],
    });
    setHistory(historyRes?.data?.subscriptions || []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await fetchSubscriptionData();
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const handleStartTrial = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const { data } = await api.post('/api/affiliate/subscription/start-trial');

      if (data?.ok) {
        await fetchSubscriptionData();
        setSuccess(data.message || 'Free trial started successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start free trial');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async (planId) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const { data } = await api.post('/api/affiliate/subscription/change-plan', {
        plan_id: planId,
      });

      if (data?.ok) {
        await fetchSubscriptionData();
        setSuccess(data.message || 'Plan changed successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading subscription...</div>
      </div>
    );
  }

  const currentSubscription = overview?.current_subscription;
  const availablePlans = overview?.available_plans || [];

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Subscription</h1>
          <p className="page-subtitle">
            Manage your trial, active plan, and yearly subscription access.
          </p>
        </div>

        {error ? (
          <div
            className="surface-card surface-card-padding"
            style={{ marginBottom: 20, border: '1px solid rgba(255, 80, 80, 0.22)' }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            className="surface-card surface-card-padding"
            style={{ marginBottom: 20, border: '1px solid rgba(80, 200, 120, 0.22)' }}
          >
            {success}
          </div>
        ) : null}

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Current Subscription</h2>

            {currentSubscription ? (
              <div className="form-stack">
                <div>
                  <strong>Status:</strong> {currentSubscription.status}
                </div>
                <div>
                  <strong>Plan:</strong> {currentSubscription.plan?.name || '-'}
                </div>
                <div>
                  <strong>Price:</strong>{' '}
                  {currentSubscription.plan?.price !== null
                    ? formatCurrency(currentSubscription.plan.price)
                    : '-'}
                </div>
                <div>
                  <strong>Billing Cycle:</strong> {currentSubscription.plan?.billing_cycle || '-'}
                </div>
                <div>
                  <strong>Trial Start:</strong> {currentSubscription.trial_start || '-'}
                </div>
                <div>
                  <strong>Trial End:</strong> {currentSubscription.trial_end || '-'}
                </div>
                <div>
                  <strong>Start Date:</strong> {currentSubscription.start_date || '-'}
                </div>
                <div>
                  <strong>End Date:</strong> {currentSubscription.end_date || '-'}
                </div>
                <div>
                  <strong>Amount Paid:</strong>{' '}
                  {currentSubscription.amount_paid !== null
                    ? formatCurrency(currentSubscription.amount_paid)
                    : '-'}
                </div>
              </div>
            ) : (
              <div className="form-stack">
                <div>No subscription yet.</div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleStartTrial}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Please wait...' : 'Start Free Trial'}
                </button>
              </div>
            )}
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Plan Limits</h2>

            {currentSubscription?.plan ? (
              <div className="form-stack">
                <div>
                  <strong>Product Limit:</strong> {currentSubscription.plan.product_limit ?? '-'}
                </div>
                <div>
                  <strong>Post Limit:</strong> {currentSubscription.plan.post_limit ?? '-'}
                </div>
                <div>
                  <strong>Website Limit:</strong> {currentSubscription.plan.website_limit ?? '-'}
                </div>
                <div>
                  <strong>Slider Limit:</strong> {currentSubscription.plan.slider_limit ?? '-'}
                </div>
                <div>
                  <strong>Menu Limit:</strong> {currentSubscription.plan.menu_limit ?? '-'}
                </div>
                <div>
                  <strong>Premium Templates Only:</strong>{' '}
                  {currentSubscription.plan.premium_templates_only ? 'Yes' : 'No'}
                </div>
              </div>
            ) : (
              <div>No active plan limits yet.</div>
            )}
          </div>
        </div>

        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h2 className="section-title">Available Plans</h2>

          <div className="grid-3">
            {availablePlans.length ? (
              availablePlans.map((plan) => (
                <div key={plan.id} className="surface-card surface-card-padding">
                  <div style={{ fontSize: '1.08rem', fontWeight: 700, marginBottom: 8 }}>
                    {plan.name}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Price: {plan.price !== null ? formatCurrency(plan.price) : '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Billing: {plan.billing_cycle}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Products: {plan.product_limit ?? '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Posts: {plan.post_limit ?? '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Sliders: {plan.slider_limit ?? '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)', marginBottom: 14 }}>
                    Menus: {plan.menu_limit ?? '-'}
                  </div>

                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => handleChangePlan(plan.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Please wait...' : 'Choose Plan'}
                  </button>
                </div>
              ))
            ) : (
              <div>No plans available.</div>
            )}
          </div>
        </div>

        <div className="surface-card surface-card-padding">
          <h2 className="section-title">Subscription History</h2>

          <div className="form-stack">
            {history.length ? (
              history.map((item) => (
                <div key={item.id} className="surface-card surface-card-padding">
                  <div style={{ fontWeight: 700 }}>{item.plan?.name || 'Unknown Plan'}</div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>Status: {item.status}</div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Amount Paid:{' '}
                    {item.amount_paid !== null ? formatCurrency(item.amount_paid) : '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Trial End: {item.trial_end || '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    End Date: {item.end_date || '-'}
                  </div>
                </div>
              ))
            ) : (
              <div>No subscription history yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}