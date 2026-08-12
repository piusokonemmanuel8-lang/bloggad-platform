import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import {
  formatDateTime,
  money,
} from '../../components/writerReader/WorkspaceUi';
import './ReaderPremiumApproved.css';

const PACKAGE_COPY = {
  basic: {
    name: 'Basic',
    eyebrow: 'Premium reading',
    summary: 'Unlock premium reading across Bloggad with one Reader subscription.',
    benefits: [
      'Unlimited access to premium posts',
      'Read full locked articles and stories',
      'One platform plan for premium reading across Writers',
      'Keep opening premium reads from your Reader library while active',
      'Basic Reader badge on your Reader account',
      'Choose up to 10 reading interests',
    ],
  },
  premium: {
    name: 'Premium',
    eyebrow: 'Complete reading',
    summary: 'Everything in Basic, plus the higher Reader tier and Neural Listen.',
    benefits: [
      'Everything included in Basic',
      'Unlimited access to premium posts',
      'Full locked article and story access',
      'Neural Listen for eligible articles',
      'Premium Reader badge on your Reader account',
      'Choose up to 20 reading interests',
    ],
  },
};

function planTier(plan) {
  const value = String(plan?.tier || plan?.plan_tier || '').trim().toLowerCase();
  return value === 'premium' ? 'premium' : value === 'basic' ? 'basic' : '';
}

function planCycle(plan) {
  return String(plan?.billing_cycle || '').trim().toLowerCase() === 'yearly'
    ? 'yearly'
    : 'monthly';
}

function cycleLabel(cycle) {
  return cycle === 'yearly' ? 'Yearly' : 'Monthly';
}

function packagePrice(plan, fallback) {
  const raw = Number(plan?.price_usd);
  return Number.isFinite(raw) ? raw : fallback;
}

export default function ReaderPremiumPage() {
  const [plans, setPlans] = useState([]);
  const [subscriptionState, setSubscriptionState] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [cycle, setCycle] = useState('monthly');
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/reader/access/plans'),
      api.get('/api/reader/access/subscription'),
      api.get('/api/reader/access/memberships'),
      api.get('/api/reader/access/checkout/options'),
    ])
      .then(([plansRes, subRes, memberRes, checkoutRes]) => {
        setPlans(Array.isArray(plansRes?.data?.plans) ? plansRes.data.plans : []);
        setSubscriptionState(subRes?.data || null);
        setMemberships(
          Array.isArray(memberRes?.data?.memberships)
            ? memberRes.data.memberships
            : []
        );

        const nextGateways = Array.isArray(checkoutRes?.data?.gateways)
          ? checkoutRes.data.gateways
          : [];

        setGateways(nextGateways);
        setSelectedProvider((current) => {
          if (nextGateways.some((item) => item.provider === current)) {
            return current;
          }

          return nextGateways[0]?.provider || '';
        });
      })
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            'Failed to load Reader premium access.'
        )
      );
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = String(
      params.get('subscription_payment') || ''
    ).toLowerCase();
    const reference = String(params.get('purchase_ref') || '').trim();

    if (!paymentStatus && !reference) {
      return;
    }

    let active = true;

    async function refreshAfterPayment() {
      if (reference) {
        try {
          const response = await api.get(
            `/api/reader/access/checkout/status/${encodeURIComponent(reference)}`
          );

          if (!active) return;

          const purchase = response?.data?.purchase || {};
          const status = String(purchase.status || paymentStatus).toLowerCase();

          if (status === 'paid') {
            setCheckoutNotice(
              `${purchase.plan_name || 'Reader subscription'} payment verified. Your access is active.`
            );

            const subscriptionRes = await api.get('/api/reader/access/subscription');

            if (active) {
              setSubscriptionState(subscriptionRes?.data || null);
            }
          } else if (status === 'cancelled') {
            setCheckoutNotice('Checkout was cancelled. No subscription was activated.');
          } else if (status === 'failed') {
            setCheckoutError(
              purchase.failure_reason ||
                'Payment could not be verified. No subscription was activated.'
            );
          } else {
            setCheckoutNotice(
              'Payment is still pending verification. Refresh this page after the gateway confirms it.'
            );
          }
        } catch (err) {
          if (active) {
            setCheckoutError(
              err?.response?.data?.message ||
                'Unable to confirm the Reader subscription payment.'
            );
          }
        }
      } else if (paymentStatus === 'cancelled') {
        setCheckoutNotice('Checkout was cancelled. No subscription was activated.');
      }

      const url = new URL(window.location.href);
      url.searchParams.delete('subscription_payment');
      url.searchParams.delete('purchase_ref');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }

    refreshAfterPayment();

    return () => {
      active = false;
    };
  }, []);

  const activeSubscription = subscriptionState?.active_subscription || null;
  const history = Array.isArray(subscriptionState?.subscriptions)
    ? subscriptionState.subscriptions
    : [];

  const activeTier = planTier(activeSubscription);
  const activeCycle = planCycle(activeSubscription);

  const visiblePackages = useMemo(
    () =>
      ['basic', 'premium'].map((tier) => {
        const plan =
          plans.find(
            (item) => planTier(item) === tier && planCycle(item) === cycle
          ) || null;

        const fallback =
          tier === 'basic'
            ? cycle === 'yearly'
              ? 59.88
              : 4.99
            : cycle === 'yearly'
              ? 119.88
              : 9.99;

        return {
          tier,
          plan,
          price: packagePrice(plan, fallback),
          copy: PACKAGE_COPY[tier],
          current: activeTier === tier && activeCycle === cycle,
        };
      }),
    [plans, cycle, activeTier, activeCycle]
  );

  async function startCheckout(plan) {
    if (!plan || !selectedProvider || checkoutLoadingId) {
      return;
    }

    setCheckoutLoadingId(plan.id);
    setCheckoutError('');
    setCheckoutNotice('');

    try {
      const response = await api.post('/api/reader/access/checkout/initialize', {
        plan_id: plan.id,
        provider: selectedProvider,
      });

      const checkoutUrl = response?.data?.checkout_url;

      if (!checkoutUrl) {
        throw new Error('Payment gateway did not return a checkout URL.');
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      setCheckoutError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to open secure Reader subscription checkout.'
      );
      setCheckoutLoadingId(null);
    }
  }

  return (
    <ReaderUnifiedShell title="Premium" subtitle="Reader access">
      <main className="reader-premium-page">
        <h1 className="reader-premium-mobile-title">Premium</h1>

        {error ? (
          <div className="reader-premium-error" role="alert">
            {error}
          </div>
        ) : null}

        {checkoutError ? (
          <div className="reader-premium-error" role="alert">
            {checkoutError}
          </div>
        ) : null}

        {checkoutNotice ? (
          <div className="reader-premium-checkout-notice" role="status">
            {checkoutNotice}
          </div>
        ) : null}

        <section
          className="reader-premium-section"
          aria-labelledby="reader-premium-plans-title"
        >
          <div className="reader-premium-cycle-simple" aria-label="Billing cycle">
            {['monthly', 'yearly'].map((item) => (
              <button
                key={item}
                type="button"
                className={cycle === item ? 'active' : ''}
                onClick={() => setCycle(item)}
                aria-pressed={cycle === item}
              >
                {cycleLabel(item)}
              </button>
            ))}
          </div>

          <div className="reader-premium-package-grid">
            {visiblePackages.map(({ tier, plan, price, copy, current }) => {
              const loading =
                plan && Number(checkoutLoadingId) === Number(plan.id);
              const canBuy =
                Boolean(plan) &&
                Boolean(selectedProvider) &&
                gateways.length > 0 &&
                !current &&
                !checkoutLoadingId;

              return (
                <article
                  key={tier}
                  className={[
                    'reader-premium-package-card',
                    tier === 'premium' ? 'featured' : '',
                    current ? 'current' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="reader-premium-package-topline">
                    <span className={`reader-premium-tier-badge ${tier}`}>
                      {copy.name}
                    </span>
                    {tier === 'premium' ? (
                      <span className="reader-premium-recommended">Recommended</span>
                    ) : null}
                    {current ? (
                      <span className="reader-premium-current">Current plan</span>
                    ) : null}
                  </div>

                  <span className="reader-premium-kicker">{copy.eyebrow}</span>
                  <h3>{copy.name} Reader</h3>

                  <div className="reader-premium-package-price">
                    <strong>${money(price)}</strong>
                    <span>/{cycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>

                  {cycle === 'yearly' ? (
                    <div className="reader-premium-year-note">
                      ${money(price / 12)} per month, billed yearly
                    </div>
                  ) : null}

                  <p className="reader-premium-package-summary">{copy.summary}</p>

                  <ul className="reader-premium-benefits">
                    {copy.benefits.map((benefit) => (
                      <li key={benefit}>
                        <span aria-hidden="true">+</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`reader-premium-buy-button ${tier}`}
                    disabled={!canBuy}
                    onClick={() => startCheckout(plan)}
                  >
                    {current
                      ? 'Current plan'
                      : loading
                        ? 'Opening secure checkout...'
                        : `Buy Now - ${copy.name}`}
                  </button>

                  <div className="reader-premium-package-foot">
                    {plan ? (
                      <span>
                        {plan.name} - ${money(plan.price_usd)} /{' '}
                        {planCycle(plan)}
                      </span>
                    ) : (
                      <span>Plan is currently unavailable.</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          className="reader-premium-section reader-premium-lower-card"
          aria-labelledby="reader-premium-current-title"
        >
          <div className="reader-premium-section-head">
            <div>
              <h2 id="reader-premium-current-title">Current platform access</h2>
              <p>Your active Reader plan and subscription history.</p>
            </div>
            {activeTier ? (
              <span className={`reader-premium-tier-badge ${activeTier}`}>
                {activeTier === 'premium' ? 'Premium Reader' : 'Basic Reader'}
              </span>
            ) : (
              <span className="reader-premium-pill">No active plan</span>
            )}
          </div>

          {activeSubscription ? (
            <article className="reader-premium-current-card">
              <div>
                <span className="reader-premium-kicker">ACTIVE READER PLAN</span>
                <h3>{activeSubscription.plan_name}</h3>
                <p>
                  {cycleLabel(activeSubscription.billing_cycle)} access through{' '}
                  {formatDateTime(activeSubscription.ends_at)}.
                </p>
              </div>
              <strong>${money(activeSubscription.plan_price_usd)}</strong>
            </article>
          ) : (
            <div className="reader-premium-empty reader-premium-empty-box">
              No active Reader platform subscription.
            </div>
          )}

          {history.length ? (
            <div className="reader-premium-table-wrap">
              <table className="reader-premium-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Tier</th>
                    <th>Status</th>
                    <th>Paid</th>
                    <th>Ends</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.plan_name || '-'}</td>
                      <td>
                        {planTier(item)
                          ? planTier(item) === 'premium'
                            ? 'Premium'
                            : 'Basic'
                          : 'Legacy'}
                      </td>
                      <td>{item.status || '-'}</td>
                      <td>
                        {item.currency_code || 'USD'} {money(item.amount_paid_usd)}
                      </td>
                      <td>{formatDateTime(item.ends_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section
          className="reader-premium-section reader-premium-lower-card"
          aria-labelledby="reader-premium-memberships-title"
        >
          <div className="reader-premium-section-head">
            <div>
              <h2 id="reader-premium-memberships-title">Direct Writer memberships</h2>
              <p>
                Separate Writer memberships remain available alongside Reader
                platform access.
              </p>
            </div>
            <span className="reader-premium-pill">{memberships.length} total</span>
          </div>

          {memberships.length ? (
            <div className="reader-premium-membership-list">
              {memberships.map((membership) => (
                <article
                  className="reader-premium-membership-card"
                  key={membership.id}
                >
                  <div>
                    <strong>Writer #{membership.writer_user_id}</strong>
                    <span>{membership.status || 'unknown'}</span>
                  </div>
                  <div>
                    <strong>
                      {membership.currency_code || 'USD'}{' '}
                      {money(membership.amount_paid_usd)}
                    </strong>
                    <span>Ends {formatDateTime(membership.ends_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="reader-premium-empty reader-premium-empty-box">
              No direct Writer memberships yet.
            </div>
          )}
        </section>
      </main>
    </ReaderUnifiedShell>
  );
}
