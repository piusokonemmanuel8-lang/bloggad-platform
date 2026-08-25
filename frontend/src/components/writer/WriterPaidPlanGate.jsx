import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, LockKeyhole, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './WriterPaidPlanGate.css';

function money(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) return '$0';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function limit(value) {
  if (value === null || value === undefined || value === '') return 'Unlimited';
  return String(value);
}

function templateCount(plan, key) {
  const mode = String(plan?.[`${key}_templates_mode`] || 'unlimited').toLowerCase();

  if (mode === 'unlimited') return 'All';

  const rows = plan?.[`allowed_${key}_templates`];
  return Array.isArray(rows) ? String(rows.length) : 'Selected';
}

function giftLabel(plan) {
  return plan?.features_json?.can_receive_gifts === true ? 'Included' : 'Not included';
}

export default function WriterPaidPlanGate({
  feature = 'This Store feature',
  children,
}) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const { data } = await api.get('/api/affiliate/subscription');
      setOverview(data || {});
    } catch (err) {
      setOverview(null);
      setError(
        err?.response?.data?.message ||
          'Unable to verify your Writer plan right now.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const currentSubscription = overview?.current_subscription || null;
  const plans = useMemo(
    () => (Array.isArray(overview?.available_plans) ? overview.available_plans : []),
    [overview]
  );

  const hasPaidPlan =
    String(currentSubscription?.status || '').toLowerCase() === 'active' &&
    Number(currentSubscription?.plan?.price || 0) > 0;

  if (loading) {
    return (
      <div className="writer-paid-gate-shell" aria-busy="true">
        <div className="writer-paid-gate-loading">
          <span className="writer-paid-gate-spinner" />
          <div>
            <strong>Checking Writer plan</strong>
            <p>Confirming access to {feature}.</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasPaidPlan) {
    return children;
  }

  return (
    <div className="writer-paid-gate-shell">
      <section className="writer-paid-gate-hero">
        <div className="writer-paid-gate-lock" aria-hidden="true">
          <LockKeyhole size={22} strokeWidth={1.8} />
        </div>

        <div className="writer-paid-gate-copy">
          <span className="writer-paid-gate-kicker">Paid Writer feature</span>
          <h1>Upgrade to use {feature}</h1>
          <p>
            Your Free Writer plan keeps your Writer Page, publishing, readers,
            comments, messages, and the Simple Writer post template. Store tools
            stay locked until you activate Starter, Pro, or Unlimited.
          </p>
        </div>

        <Link className="writer-paid-gate-primary" to="/writer/plan">
          View Writer Plans
          <ArrowRight size={16} />
        </Link>
      </section>

      {error ? (
        <div className="writer-paid-gate-alert">
          <div>
            <strong>Plan verification unavailable</strong>
            <p>{error} Store access remains locked until verification succeeds.</p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw size={15} className={refreshing ? 'is-spinning' : ''} />
            {refreshing ? 'Checking...' : 'Try again'}
          </button>
        </div>
      ) : null}

      <section className="writer-paid-gate-plans" aria-label="Paid Writer plans">
        <div className="writer-paid-gate-section-head">
          <div>
            <span className="writer-paid-gate-kicker">Upgrade options</span>
            <h2>Choose the plan that fits your Store</h2>
          </div>
          <p>No trial. Pay for the plan you want and activate it after verification.</p>
        </div>

        {plans.length ? (
          <div className="writer-paid-gate-grid">
            {plans.map((plan) => (
              <article className="writer-paid-gate-card" key={plan.id}>
                <div className="writer-paid-gate-card-head">
                  <div>
                    <h3>{plan.name || 'Writer Plan'}</h3>
                    <span>{plan.billing_cycle || 'yearly'} billing</span>
                  </div>

                  <div className="writer-paid-gate-price">
                    <strong>{money(plan.price)}</strong>
                    <span>/ year</span>
                  </div>
                </div>

                <div className="writer-paid-gate-features">
                  <div>
                    <Check size={14} />
                    <span>{limit(plan.website_limit)} Storefront</span>
                  </div>
                  <div>
                    <Check size={14} />
                    <span>{limit(plan.product_limit)} products</span>
                  </div>
                  <div>
                    <Check size={14} />
                    <span>{templateCount(plan, 'blog')} post templates</span>
                  </div>
                  <div>
                    <Check size={14} />
                    <span>{templateCount(plan, 'website')} Storefront templates</span>
                  </div>
                  <div>
                    <Check size={14} />
                    <span>Gifts: {giftLabel(plan)}</span>
                  </div>
                </div>

                <Link className="writer-paid-gate-plan-cta" to="/writer/plan">
                  Choose {plan.name || 'plan'}
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="writer-paid-gate-empty">
            <p>Paid plans could not be loaded. Open Writer Plans to check again.</p>
            <Link to="/writer/plan">Open Writer Plans</Link>
          </div>
        )}
      </section>
    </div>
  );
}