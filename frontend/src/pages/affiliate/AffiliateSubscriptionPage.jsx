import { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Crown,
  CalendarDays,
  Layers3,
  Rocket,
  ShieldCheck,
  History,
} from 'lucide-react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'active') return 'affiliate-subscription-status active';
  if (value === 'trial' || value === 'trialing') return 'affiliate-subscription-status trial';
  if (value === 'inactive' || value === 'expired') return 'affiliate-subscription-status inactive';
  if (value === 'cancelled' || value === 'suspended') return 'affiliate-subscription-status danger';

  return 'affiliate-subscription-status neutral';
}

export default function AffiliateSubscriptionPage() {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubscriptionData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [overviewRes, historyRes] = await Promise.all([
        api.get('/api/affiliate/subscription'),
        api.get('/api/affiliate/subscription/history'),
      ]);

      setOverview({
        current_subscription: overviewRes?.data?.current_subscription || null,
        available_plans: overviewRes?.data?.available_plans || [],
      });
      setHistory(historyRes?.data?.subscriptions || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setError('');
        await fetchSubscriptionData();
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load subscription data');
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
        await fetchSubscriptionData(true);
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
        await fetchSubscriptionData(true);
        setSuccess(data.message || 'Plan changed successfully');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  };

  const currentSubscription = overview?.current_subscription || null;
  const availablePlans = overview?.available_plans || [];

  const currentPlanId = useMemo(() => {
    return currentSubscription?.plan?.id ? String(currentSubscription.plan.id) : '';
  }, [currentSubscription]);

  if (loading) {
    return (
      <div className="affiliate-subscription-page">
        <style>{styles}</style>

        <div className="affiliate-subscription-loading-wrap">
          <div className="affiliate-subscription-loading-card">
            <div className="affiliate-subscription-spinner" />
            <p>Loading subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-subscription-page">
      <style>{styles}</style>

      <section className="affiliate-subscription-hero">
        <div className="affiliate-subscription-hero-copy">
          <div className="affiliate-subscription-badge">Subscription manager</div>
          <h1 className="affiliate-subscription-title">Subscription</h1>
          <p className="affiliate-subscription-subtitle">
            Manage your trial, active plan, billing access, and subscription history from one place.
          </p>
        </div>

        <div className="affiliate-subscription-hero-actions">
          <button
            type="button"
            className="affiliate-subscription-btn secondary"
            onClick={() => fetchSubscriptionData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {!currentSubscription ? (
            <button
              className="affiliate-subscription-btn primary"
              type="button"
              onClick={handleStartTrial}
              disabled={actionLoading}
            >
              <Rocket size={16} />
              {actionLoading ? 'Please wait...' : 'Start Free Trial'}
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="affiliate-subscription-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="affiliate-subscription-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      ) : null}

      <section className="affiliate-subscription-top-grid">
        <div className="affiliate-subscription-panel">
          <div className="affiliate-subscription-panel-head">
            <div>
              <p className="affiliate-subscription-panel-kicker">Current plan</p>
              <h2 className="affiliate-subscription-panel-title">Current Subscription</h2>
            </div>
          </div>

          {currentSubscription ? (
            <div className="affiliate-subscription-current-wrap">
              <div className="affiliate-subscription-current-top">
                <div>
                  <h3 className="affiliate-subscription-current-name">
                    {currentSubscription.plan?.name || 'Unknown Plan'}
                  </h3>
                  <div className={getStatusClass(currentSubscription.status)}>
                    {currentSubscription.status || '-'}
                  </div>
                </div>

                <div className="affiliate-subscription-current-icon">
                  <CreditCard size={22} />
                </div>
              </div>

              <div className="affiliate-subscription-info-grid">
                <div className="affiliate-subscription-info-box">
                  <span>Price</span>
                  <strong>
                    {currentSubscription.plan?.price !== null &&
                    currentSubscription.plan?.price !== undefined
                      ? formatCurrency(currentSubscription.plan.price)
                      : '-'}
                  </strong>
                </div>

                <div className="affiliate-subscription-info-box">
                  <span>Billing Cycle</span>
                  <strong>{currentSubscription.plan?.billing_cycle || '-'}</strong>
                </div>

                <div className="affiliate-subscription-info-box">
                  <span>Trial Start</span>
                  <strong>{currentSubscription.trial_start || '-'}</strong>
                </div>

                <div className="affiliate-subscription-info-box">
                  <span>Trial End</span>
                  <strong>{currentSubscription.trial_end || '-'}</strong>
                </div>

                <div className="affiliate-subscription-info-box">
                  <span>Start Date</span>
                  <strong>{currentSubscription.start_date || '-'}</strong>
                </div>

                <div className="affiliate-subscription-info-box">
                  <span>End Date</span>
                  <strong>{currentSubscription.end_date || '-'}</strong>
                </div>

                <div className="affiliate-subscription-info-box affiliate-subscription-info-box-wide">
                  <span>Amount Paid</span>
                  <strong>
                    {currentSubscription.amount_paid !== null &&
                    currentSubscription.amount_paid !== undefined
                      ? formatCurrency(currentSubscription.amount_paid)
                      : '-'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="affiliate-subscription-empty">
              <CreditCard size={30} />
              <h3>No subscription yet</h3>
              <p>Start your free trial or choose a plan below to unlock affiliate access.</p>
              <button
                className="affiliate-subscription-btn primary"
                type="button"
                onClick={handleStartTrial}
                disabled={actionLoading}
              >
                <Rocket size={16} />
                {actionLoading ? 'Please wait...' : 'Start Free Trial'}
              </button>
            </div>
          )}
        </div>

        <div className="affiliate-subscription-panel">
          <div className="affiliate-subscription-panel-head">
            <div>
              <p className="affiliate-subscription-panel-kicker">Access limits</p>
              <h2 className="affiliate-subscription-panel-title">Plan Limits</h2>
            </div>
          </div>

          {currentSubscription?.plan ? (
            <div className="affiliate-subscription-limits-list">
              <div className="affiliate-subscription-limit-row">
                <span>Product Limit</span>
                <strong>{currentSubscription.plan.product_limit ?? '-'}</strong>
              </div>
              <div className="affiliate-subscription-limit-row">
                <span>Post Limit</span>
                <strong>{currentSubscription.plan.post_limit ?? '-'}</strong>
              </div>
              <div className="affiliate-subscription-limit-row">
                <span>Website Limit</span>
                <strong>{currentSubscription.plan.website_limit ?? '-'}</strong>
              </div>
              <div className="affiliate-subscription-limit-row">
                <span>Slider Limit</span>
                <strong>{currentSubscription.plan.slider_limit ?? '-'}</strong>
              </div>
              <div className="affiliate-subscription-limit-row">
                <span>Menu Limit</span>
                <strong>{currentSubscription.plan.menu_limit ?? '-'}</strong>
              </div>
              <div className="affiliate-subscription-limit-row">
                <span>Premium Templates Only</span>
                <strong>
                  {currentSubscription.plan.premium_templates_only ? 'Yes' : 'No'}
                </strong>
              </div>
            </div>
          ) : (
            <div className="affiliate-subscription-empty-small">
              <ShieldCheck size={24} />
              <p>No active plan limits yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="affiliate-subscription-panel" style={{ marginBottom: 20 }}>
        <div className="affiliate-subscription-panel-head">
          <div>
            <p className="affiliate-subscription-panel-kicker">Upgrade options</p>
            <h2 className="affiliate-subscription-panel-title">Available Plans</h2>
          </div>
        </div>

        {availablePlans.length ? (
          <div className="affiliate-subscription-plans-grid">
            {availablePlans.map((plan) => {
              const isCurrent = currentPlanId && String(plan.id) === currentPlanId;

              return (
                <div
                  key={plan.id}
                  className={`affiliate-subscription-plan-card${isCurrent ? ' current' : ''}`}
                >
                  <div className="affiliate-subscription-plan-top">
                    <div>
                      <h3 className="affiliate-subscription-plan-name">{plan.name}</h3>
                      <p className="affiliate-subscription-plan-billing">
                        {plan.billing_cycle || '-'}
                      </p>
                    </div>

                    <div className="affiliate-subscription-plan-icon">
                      {plan.is_premium || plan.premium_templates_only ? (
                        <Crown size={20} />
                      ) : (
                        <Layers3 size={20} />
                      )}
                    </div>
                  </div>

                  <div className="affiliate-subscription-plan-price">
                    {plan.price !== null && plan.price !== undefined
                      ? formatCurrency(plan.price)
                      : '-'}
                  </div>

                  <div className="affiliate-subscription-plan-features">
                    <div><span>Products</span><strong>{plan.product_limit ?? '-'}</strong></div>
                    <div><span>Posts</span><strong>{plan.post_limit ?? '-'}</strong></div>
                    <div><span>Website</span><strong>{plan.website_limit ?? '-'}</strong></div>
                    <div><span>Sliders</span><strong>{plan.slider_limit ?? '-'}</strong></div>
                    <div><span>Menus</span><strong>{plan.menu_limit ?? '-'}</strong></div>
                    <div>
                      <span>Premium Templates</span>
                      <strong>{plan.premium_templates_only ? 'Yes' : 'No'}</strong>
                    </div>
                  </div>

                  <button
                    className={`affiliate-subscription-btn ${isCurrent ? 'secondary' : 'primary'} full`}
                    type="button"
                    onClick={() => handleChangePlan(plan.id)}
                    disabled={actionLoading || isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : actionLoading ? 'Please wait...' : 'Choose Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="affiliate-subscription-empty-small">
            <Layers3 size={24} />
            <p>No plans available.</p>
          </div>
        )}
      </section>

      <section className="affiliate-subscription-panel">
        <div className="affiliate-subscription-panel-head">
          <div>
            <p className="affiliate-subscription-panel-kicker">History</p>
            <h2 className="affiliate-subscription-panel-title">Subscription History</h2>
          </div>
        </div>

        {history.length ? (
          <div className="affiliate-subscription-history-list">
            {history.map((item) => (
              <div key={item.id} className="affiliate-subscription-history-card">
                <div className="affiliate-subscription-history-top">
                  <div className="affiliate-subscription-history-icon">
                    <History size={18} />
                  </div>

                  <div className="affiliate-subscription-history-main">
                    <h3>{item.plan?.name || 'Unknown Plan'}</h3>
                    <span className={getStatusClass(item.status)}>{item.status || '-'}</span>
                  </div>
                </div>

                <div className="affiliate-subscription-history-grid">
                  <div><span>Amount Paid</span><strong>{item.amount_paid !== null ? formatCurrency(item.amount_paid) : '-'}</strong></div>
                  <div><span>Trial End</span><strong>{item.trial_end || '-'}</strong></div>
                  <div><span>End Date</span><strong>{item.end_date || '-'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="affiliate-subscription-empty-small">
            <CalendarDays size={24} />
            <p>No subscription history yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-subscription-page {
    width: 100%;
  }

  .affiliate-subscription-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-subscription-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-subscription-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateSubscriptionSpin 0.8s linear infinite;
  }

  @keyframes affiliateSubscriptionSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateSubscriptionSpin 0.8s linear infinite;
  }

  .affiliate-subscription-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-subscription-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-subscription-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-subscription-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-subscription-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-subscription-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-subscription-btn.full {
    width: 100%;
  }

  .affiliate-subscription-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-subscription-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-subscription-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-subscription-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .affiliate-subscription-top-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .affiliate-subscription-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-subscription-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-subscription-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-subscription-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-subscription-current-wrap {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .affiliate-subscription-current-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-subscription-current-name {
    margin: 0 0 10px;
    font-size: 24px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-current-icon {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    display: grid;
    place-items: center;
    color: #111827;
    flex-shrink: 0;
  }

  .affiliate-subscription-status {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
  }

  .affiliate-subscription-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-subscription-status.trial {
    background: #eef2ff;
    color: #4338ca;
    border-color: #c7d2fe;
  }

  .affiliate-subscription-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-subscription-status.danger {
    background: #fef2f2;
    color: #b42318;
    border-color: #fecaca;
  }

  .affiliate-subscription-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-subscription-info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .affiliate-subscription-info-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-subscription-info-box-wide {
    grid-column: span 2;
  }

  .affiliate-subscription-info-box span,
  .affiliate-subscription-limit-row span,
  .affiliate-subscription-plan-features span,
  .affiliate-subscription-history-grid span {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-subscription-info-box strong,
  .affiliate-subscription-limit-row strong,
  .affiliate-subscription-plan-features strong,
  .affiliate-subscription-history-grid strong {
    font-size: 15px;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-subscription-limits-list,
  .affiliate-subscription-history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-subscription-limit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
  }

  .affiliate-subscription-plans-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-subscription-plan-card {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 18px;
  }

  .affiliate-subscription-plan-card.current {
    border-color: #111827;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .affiliate-subscription-plan-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 12px;
  }

  .affiliate-subscription-plan-name {
    margin: 0 0 4px;
    font-size: 18px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-plan-billing {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }

  .affiliate-subscription-plan-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    color: #111827;
    flex-shrink: 0;
  }

  .affiliate-subscription-plan-price {
    font-size: 28px;
    font-weight: 900;
    color: #111827;
    line-height: 1.1;
    margin-bottom: 14px;
  }

  .affiliate-subscription-plan-features {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  .affiliate-subscription-plan-features div,
  .affiliate-subscription-history-grid div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: #ffffff;
    border: 1px solid #edf2f7;
    border-radius: 14px;
  }

  .affiliate-subscription-history-card {
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-subscription-history-top {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .affiliate-subscription-history-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-subscription-history-main {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-subscription-history-main h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-subscription-history-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .affiliate-subscription-empty,
  .affiliate-subscription-empty-small {
    min-height: 180px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 22px;
  }

  .affiliate-subscription-empty h3,
  .affiliate-subscription-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  .affiliate-subscription-empty p {
    margin: 0 0 8px;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-subscription-plans-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 1100px) {
    .affiliate-subscription-top-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-subscription-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-subscription-title {
      font-size: 26px;
    }

    .affiliate-subscription-hero-actions {
      width: 100%;
    }

    .affiliate-subscription-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-subscription-title {
      font-size: 22px;
    }

    .affiliate-subscription-subtitle {
      font-size: 14px;
    }

    .affiliate-subscription-hero-actions,
    .affiliate-subscription-info-grid,
    .affiliate-subscription-plans-grid,
    .affiliate-subscription-history-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-subscription-hero-actions {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-subscription-btn {
      width: 100%;
    }

    .affiliate-subscription-info-box-wide {
      grid-column: span 1;
    }

    .affiliate-subscription-limit-row,
    .affiliate-subscription-plan-features div,
    .affiliate-subscription-history-grid div,
    .affiliate-subscription-current-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;