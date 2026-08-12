import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';
import AffiliateSubscriptionLegacyPage from './AffiliateSubscriptionLegacyPage';
import './AffiliateWriterPlanApproved.css';

function formatLimitValue(value) {
  if (value === null || value === undefined || value === '') return 'Unlimited';

  const number = Number(value);
  if (Number.isFinite(number)) return String(number);

  return String(value);
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function statusClass(value) {
  const clean = String(value || '').toLowerCase();

  if (clean === 'active') return 'is-active';
  if (clean === 'trial' || clean === 'trialing') return 'is-trial';
  if (clean === 'cancelled' || clean === 'suspended') return 'is-danger';
  if (clean === 'inactive' || clean === 'expired') return 'is-muted';

  return 'is-neutral';
}

function displayAmount(value) {
  if (value === null || value === undefined || value === '') return '-';
  return formatCurrency(Number(value));
}

function WriterPlanPage() {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionPlanId, setActionPlanId] = useState('');
  const [startingTrial, setStartingTrial] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubscriptionData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [overviewRes, historyRes] = await Promise.all([
        api.get('/api/affiliate/subscription'),
        api.get('/api/affiliate/subscription/history'),
      ]);

      setOverview({
        current_subscription: overviewRes?.data?.current_subscription || null,
        available_plans: overviewRes?.data?.available_plans || [],
      });
      setHistory(historyRes?.data?.subscriptions || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Writer plan data.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const currentSubscription = overview?.current_subscription || null;
  const availablePlans = overview?.available_plans || [];

  const currentPlanId = useMemo(
    () => (currentSubscription?.plan?.id ? String(currentSubscription.plan.id) : ''),
    [currentSubscription],
  );

  const handleRefresh = async () => {
    setSuccess('');
    await fetchSubscriptionData(true);
  };

  const handleStartTrial = async () => {
    if (startingTrial) return;

    setStartingTrial(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/api/affiliate/subscription/start-trial');
      await fetchSubscriptionData(true);
      setSuccess(data?.message || 'Free trial started successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to start free trial.');
    } finally {
      setStartingTrial(false);
    }
  };

  const handleChangePlan = async (planId) => {
    if (!currentSubscription || actionPlanId) return;

    setActionPlanId(String(planId));
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/api/affiliate/subscription/change-plan', {
        plan_id: planId,
      });

      await fetchSubscriptionData(true);
      setSuccess(data?.message || 'Writer plan changed successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change Writer plan.');
    } finally {
      setActionPlanId('');
    }
  };

  if (loading) {
    return (
      <div className="writer-plan-page">
        <div className="writer-plan-loading-card">
          <span className="writer-plan-spinner" />
          <div>
            <strong>Loading Writer plan</strong>
            <p>Checking your subscription and publishing limits.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPlan = currentSubscription?.plan || null;

  return (
    <div className="writer-plan-page">
      <section className="writer-plan-section-head">
        <div>
          <span className="writer-plan-kicker">Account</span>
          <h2>Your Writer plan</h2>
          <p>Plan access, publishing limits, available upgrades, and subscription history.</p>
        </div>

        <div className="writer-plan-head-actions">
          <button
            type="button"
            className="writer-plan-btn writer-plan-btn-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {!currentSubscription ? (
            <button
              type="button"
              className="writer-plan-btn writer-plan-btn-primary"
              onClick={handleStartTrial}
              disabled={startingTrial}
            >
              {startingTrial ? 'Starting...' : 'Start Free Trial'}
            </button>
          ) : null}
        </div>
      </section>

      {error ? <div className="writer-plan-alert writer-plan-alert-error">{error}</div> : null}
      {success ? <div className="writer-plan-alert writer-plan-alert-success">{success}</div> : null}

      <section className="writer-plan-top-grid">
        <article className="writer-plan-card writer-plan-current-card">
          <div className="writer-plan-card-head">
            <div>
              <span className="writer-plan-kicker">Current plan</span>
              <h3>{currentPlan?.name || 'No active Writer plan'}</h3>
              <p>
                {currentSubscription
                  ? 'Your current Writer subscription.'
                  : 'Start your free trial before changing to another Writer plan.'}
              </p>
            </div>

            {currentSubscription ? (
              <span className={`writer-plan-status ${statusClass(currentSubscription.status)}`}>
                {currentSubscription.status || 'Unknown'}
              </span>
            ) : null}
          </div>

          {currentSubscription && currentPlan ? (
            <>
              <div className="writer-plan-price-row">
                <strong>{displayAmount(currentPlan.price)}</strong>
                <span>/ {String(currentPlan.billing_cycle || 'yearly').toLowerCase()}</span>
              </div>

              <div className="writer-plan-info-grid">
                <div className="writer-plan-info-box">
                  <span>Billing cycle</span>
                  <strong>{currentPlan.billing_cycle || '-'}</strong>
                </div>
                <div className="writer-plan-info-box">
                  <span>Trial ends</span>
                  <strong>{formatDate(currentSubscription.trial_end)}</strong>
                </div>
                <div className="writer-plan-info-box">
                  <span>Plan starts</span>
                  <strong>{formatDate(currentSubscription.start_date)}</strong>
                </div>
                <div className="writer-plan-info-box">
                  <span>Plan ends</span>
                  <strong>{formatDate(currentSubscription.end_date)}</strong>
                </div>
                <div className="writer-plan-info-box">
                  <span>Amount paid</span>
                  <strong>{displayAmount(currentSubscription.amount_paid)}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="writer-plan-empty-current">
              <strong>No subscription yet</strong>
              <p>
                The free trial is the required first step before this account can change to a
                different Writer plan.
              </p>
              <button
                type="button"
                className="writer-plan-btn writer-plan-btn-primary"
                onClick={handleStartTrial}
                disabled={startingTrial}
              >
                {startingTrial ? 'Starting...' : 'Start Free Trial'}
              </button>
            </div>
          )}
        </article>

        <article className="writer-plan-card writer-plan-access-card">
          <div className="writer-plan-card-head">
            <div>
              <span className="writer-plan-kicker">Access limits</span>
              <h3>Plan access</h3>
              <p>Publishing limits returned by your current Writer plan.</p>
            </div>
          </div>

          {currentPlan ? (
            <div className="writer-plan-limit-list">
              <div><span>Products</span><strong>{formatLimitValue(currentPlan.product_limit)}</strong></div>
              <div><span>Posts</span><strong>{formatLimitValue(currentPlan.post_limit)}</strong></div>
              <div><span>Storefronts</span><strong>{formatLimitValue(currentPlan.website_limit)}</strong></div>
              <div><span>Sliders</span><strong>{formatLimitValue(currentPlan.slider_limit)}</strong></div>
              <div><span>Menus</span><strong>{formatLimitValue(currentPlan.menu_limit)}</strong></div>
              <div>
                <span>Premium templates</span>
                <strong>{currentPlan.premium_templates_only ? 'Included' : 'Not included'}</strong>
              </div>
            </div>
          ) : (
            <div className="writer-plan-empty-small">
              <p>No current plan limits yet.</p>
            </div>
          )}
        </article>
      </section>

      <section className="writer-plan-available-section">
        <div className="writer-plan-subhead">
          <div>
            <span className="writer-plan-kicker">Upgrade options</span>
            <h3>Available plans</h3>
            <p>Choose from the active yearly Writer plans configured for your account.</p>
          </div>
        </div>

        {availablePlans.length ? (
          <div className="writer-plan-plans-grid">
            {availablePlans.map((plan) => {
              const isCurrent = currentPlanId && String(plan.id) === currentPlanId;
              const isAction = String(actionPlanId) === String(plan.id);

              return (
                <article
                  key={plan.id}
                  className={`writer-plan-plan-card${isCurrent ? ' is-current' : ''}`}
                >
                  <div className="writer-plan-plan-head">
                    <div>
                      <h4>{plan.name || 'Writer Plan'}</h4>
                      <span>{plan.billing_cycle || 'yearly'} billing</span>
                    </div>
                    {isCurrent ? <span className="writer-plan-current-pill">Current</span> : null}
                  </div>

                  <div className="writer-plan-plan-price">
                    <strong>{displayAmount(plan.price)}</strong>
                    <span>/ year</span>
                  </div>

                  <div className="writer-plan-plan-features">
                    <div><span>Products</span><strong>{formatLimitValue(plan.product_limit)}</strong></div>
                    <div><span>Posts</span><strong>{formatLimitValue(plan.post_limit)}</strong></div>
                    <div><span>Storefronts</span><strong>{formatLimitValue(plan.website_limit)}</strong></div>
                    <div><span>Sliders</span><strong>{formatLimitValue(plan.slider_limit)}</strong></div>
                    <div><span>Menus</span><strong>{formatLimitValue(plan.menu_limit)}</strong></div>
                    <div>
                      <span>Premium templates</span>
                      <strong>{plan.premium_templates_only ? 'Included' : 'Not included'}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`writer-plan-btn writer-plan-plan-btn ${
                      isCurrent ? 'writer-plan-btn-secondary' : 'writer-plan-btn-primary'
                    }`}
                    disabled={isCurrent || !!actionPlanId || !currentSubscription}
                    onClick={() => handleChangePlan(plan.id)}
                  >
                    {isCurrent
                      ? 'Current Plan'
                      : !currentSubscription
                        ? 'Start trial first'
                        : isAction
                          ? 'Changing...'
                          : 'Choose Plan'}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="writer-plan-card writer-plan-empty-small">
            <p>No active Writer plans are currently available.</p>
          </div>
        )}
      </section>

      <section className="writer-plan-card writer-plan-history">
        <div className="writer-plan-card-head">
          <div>
            <span className="writer-plan-kicker">History</span>
            <h3>Subscription history</h3>
            <p>Previous trials and plan changes on this Writer account.</p>
          </div>
        </div>

        {history.length ? (
          <>
            <div className="writer-plan-history-table-wrap">
              <table className="writer-plan-history-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Amount paid</th>
                    <th>Trial end</th>
                    <th>Subscription end</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.plan?.name || 'Unknown Plan'}</td>
                      <td>
                        <span className={`writer-plan-status ${statusClass(item.status)}`}>
                          {item.status || '-'}
                        </span>
                      </td>
                      <td>{displayAmount(item.amount_paid)}</td>
                      <td>{formatDate(item.trial_end)}</td>
                      <td>{formatDate(item.end_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="writer-plan-history-mobile">
              {history.map((item) => (
                <article key={item.id} className="writer-plan-history-mobile-card">
                  <div className="writer-plan-history-mobile-head">
                    <strong>{item.plan?.name || 'Unknown Plan'}</strong>
                    <span className={`writer-plan-status ${statusClass(item.status)}`}>
                      {item.status || '-'}
                    </span>
                  </div>
                  <div><span>Amount paid</span><strong>{displayAmount(item.amount_paid)}</strong></div>
                  <div><span>Trial end</span><strong>{formatDate(item.trial_end)}</strong></div>
                  <div><span>Subscription end</span><strong>{formatDate(item.end_date)}</strong></div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="writer-plan-empty-small">
            <p>No subscription history yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AffiliateSubscriptionPage() {
  const location = useLocation();

  if (location.pathname.startsWith('/affiliate/')) {
    return <AffiliateSubscriptionLegacyPage />;
  }

  return <WriterPlanPage />;
}