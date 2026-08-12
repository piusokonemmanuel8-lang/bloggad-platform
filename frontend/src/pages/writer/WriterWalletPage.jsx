import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  Download,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import api from '../../api/axios';

/* BLOGGAD WRITER WALLET FIGMA APPROVED V1 */

function formatMoney(value, digits = 2) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return (0).toFixed(digits);
  }

  return number.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatDateTime(value) {
  if (!value) return 'No date';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusClass(status) {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'approved' || normalized === 'paid' || normalized === 'completed') {
    return 'is-success';
  }

  if (normalized === 'rejected' || normalized === 'failed') {
    return 'is-danger';
  }

  return 'is-pending';
}

function transactionTitle(item) {
  const referenceType = String(item?.reference_type || '').toLowerCase();
  const type = String(item?.type || '').toLowerCase();

  if (referenceType === 'writer_appreciation') {
    return 'Reader appreciation';
  }

  if (referenceType === 'writer_membership') {
    return 'Direct Writer membership';
  }

  if (type === 'withdrawal_request') {
    return 'Withdrawal requested';
  }

  if (type === 'withdrawal_paid') {
    return 'Withdrawal paid';
  }

  if (type === 'withdrawal_rejected') {
    return 'Withdrawal rejected';
  }

  return item?.description || 'Wallet activity';
}

function transactionIsDebit(item) {
  return String(item?.type || '').toLowerCase().startsWith('withdrawal');
}

function WalletRulesCard({ mobile = false }) {
  return (
    <section className={`ww-card ww-rules-card ${mobile ? 'ww-rules-mobile' : 'ww-rules-desktop'}`}>
      <div className="ww-card-head compact">
        <div>
          <span className="ww-card-kicker">Wallet rules</span>
          <h2>How withdrawals move</h2>
        </div>
        <ShieldCheck size={20} aria-hidden="true" />
      </div>

      <ol className="ww-rules-list">
        <li>
          <span>1</span>
          <div>
            <strong>Requested funds are reserved immediately</strong>
            <p>Your available balance drops when the request is submitted.</p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <strong>Platform review follows</strong>
            <p>The request stays visible while it is pending or approved.</p>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>Rejected funds return</strong>
            <p>A rejected request restores the reserved amount to your available balance.</p>
          </div>
        </li>
      </ol>
    </section>
  );
}

export default function WriterWalletPage() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    amount: '',
    payment_method: '',
    payment_details: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  async function load(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setError('');

      const res = await api.get('/api/writer/wallet');
      setData(res.data || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Writer wallet.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!withdrawalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !submitting) {
        setWithdrawalOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [withdrawalOpen, submitting]);

  const wallet = data?.wallet || {};
  const appreciation = data?.appreciation || {};
  const transactions = Array.isArray(data?.transactions) ? data.transactions : [];
  const withdrawals = Array.isArray(data?.withdrawals) ? data.withdrawals : [];
  const available = Number(wallet.available_balance || 0);
  const threshold = Number(data?.withdrawal_threshold || 0);
  const currency = data?.currency || 'USD';

  const withdrawalReady =
    available > 0 && (threshold <= 0 || available >= threshold);

  const thresholdProgress =
    threshold > 0
      ? Math.min(100, Math.max(0, (available / threshold) * 100))
      : available > 0
        ? 100
        : 0;

  const membershipSummary = useMemo(() => {
    return transactions.reduce(
      (summary, item) => {
        if (
          String(item?.reference_type || '').toLowerCase() === 'writer_membership' &&
          !transactionIsDebit(item)
        ) {
          summary.count += 1;
          summary.amount += Number(item?.amount || 0);
        }

        return summary;
      },
      { count: 0, amount: 0 }
    );
  }, [transactions]);

  async function requestWithdrawal(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a withdrawal amount greater than zero.');
      return;
    }

    if (threshold > 0 && amount < threshold) {
      setError(`Minimum withdrawal is USD ${formatMoney(threshold)}.`);
      return;
    }

    if (amount > available) {
      setError(`Insufficient Writer wallet balance. Available: USD ${formatMoney(available)}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setNotice('');

      const response = await api.post('/api/writer/wallet/withdrawals', {
        amount: Number(form.amount),
        payment_method: form.payment_method,
        payment_details: form.payment_details,
      });

      setForm({
        amount: '',
        payment_method: '',
        payment_details: '',
      });
      setNotice(response?.data?.message || 'Withdrawal request submitted.');
      setWithdrawalOpen(false);
      await load(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to request withdrawal.');
    } finally {
      setSubmitting(false);
    }
  }

  function openWithdrawal() {
    setError('');
    setNotice('');
    setWithdrawalOpen(true);
  }

  const statItems = [
    {
      label: 'Available',
      value: loading ? '--' : `$${formatMoney(wallet.available_balance)}`,
      helper: 'Ready funds',
      icon: Wallet,
    },
    {
      label: 'Pending',
      value: loading ? '--' : `$${formatMoney(wallet.pending_balance)}`,
      helper: 'Still settling',
      icon: Clock,
    },
    {
      label: 'Total earned',
      value: loading ? '--' : `$${formatMoney(wallet.total_earned)}`,
      helper: 'All Writer earnings',
      icon: TrendingUp,
    },
    {
      label: 'Withdrawn',
      value: loading ? '--' : `$${formatMoney(wallet.total_withdrawn)}`,
      helper: 'Paid out',
      icon: DollarSign,
    },
  ];

  return (
    <div className="writer-wallet-page">
      <style>{writerWalletStyles}</style>

      <section className="ww-page-head">
        <div>
          <span className="ww-eyebrow">Writer finances</span>
          <h1>Writer Wallet</h1>
          <p>
            Track earnings from Reader appreciation and direct memberships, review wallet
            activity, and request withdrawals from your available USD balance.
          </p>
        </div>

        <button
          type="button"
          className="ww-primary-button ww-desktop-request"
          onClick={openWithdrawal}
          disabled={!withdrawalReady}
        >
          <Download size={17} aria-hidden="true" />
          Request withdrawal
        </button>
      </section>

      {error ? (
        <div className="ww-alert is-error" role="alert">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="ww-alert is-success" role="status">
          {notice}
        </div>
      ) : null}

      <section className="ww-stats-grid" aria-label="Writer wallet balances">
        {statItems.map((item) => {
          const Icon = item.icon;

          return (
            <article className="ww-stat-card" key={item.label}>
              <div className="ww-stat-icon">
                <Icon size={19} aria-hidden="true" />
              </div>
              <span className="ww-stat-label">{item.label}</span>
              <strong className="ww-stat-value">{item.value}</strong>
              <span className="ww-stat-helper">{item.helper}</span>
            </article>
          );
        })}
      </section>

      <div className="ww-content-grid">
        <section className="ww-card ww-activity-card">
          <div className="ww-card-head">
            <div>
              <span className="ww-card-kicker">Recent movement</span>
              <h2>Wallet Activity</h2>
              <p>Credits and withdrawal events recorded in your Writer wallet.</p>
            </div>

            <button
              type="button"
              className="ww-icon-button"
              onClick={() => load(false)}
              disabled={loading}
              aria-label="Refresh wallet activity"
              title="Refresh"
            >
              <RefreshCw size={17} aria-hidden="true" />
            </button>
          </div>

          {loading ? (
            <div className="ww-state">
              <span className="ww-spinner" aria-hidden="true" />
              <strong>Loading wallet activity...</strong>
            </div>
          ) : transactions.length ? (
            <div className="ww-activity-list">
              {transactions.slice(0, 8).map((item) => {
                const debit = transactionIsDebit(item);
                const amount = Math.abs(Number(item?.amount || 0));

                return (
                  <article className="ww-activity-row" key={item.id}>
                    <div className={`ww-activity-direction ${debit ? 'is-debit' : 'is-credit'}`}>
                      {debit ? (
                        <ArrowDownRight size={17} aria-hidden="true" />
                      ) : (
                        <ArrowUpRight size={17} aria-hidden="true" />
                      )}
                    </div>

                    <div className="ww-activity-copy">
                      <div className="ww-activity-title-line">
                        <strong>{transactionTitle(item)}</strong>
                        <span className={`ww-status-pill ${statusClass(item?.status)}`}>
                          {item?.status || 'pending'}
                        </span>
                      </div>
                      <p>{item?.description || 'Wallet transaction'}</p>
                      <span>{formatDateTime(item?.created_at)}</span>
                    </div>

                    <strong className={`ww-activity-amount ${debit ? 'is-debit' : 'is-credit'}`}>
                      {debit ? '-' : '+'}${formatMoney(amount)}
                    </strong>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="ww-state">
              <Wallet size={28} aria-hidden="true" />
              <strong>No wallet activity yet</strong>
              <p>Your Writer credits and withdrawal activity will appear here.</p>
            </div>
          )}
        </section>

        <section className="ww-card ww-readiness-card">
            <div className="ww-card-head compact">
              <div>
                <span className="ww-card-kicker">Withdrawal readiness</span>
                <h2>{withdrawalReady ? 'Ready to withdraw' : 'Not ready yet'}</h2>
              </div>
              <span className={`ww-readiness-dot ${withdrawalReady ? 'is-ready' : ''}`} />
            </div>

            <div className="ww-readiness-amounts">
              <div>
                <span>Available balance</span>
                <strong>${formatMoney(available)}</strong>
              </div>
              <div>
                <span>Minimum withdrawal</span>
                <strong>${formatMoney(threshold)}</strong>
              </div>
              <div>
                <span>Currency</span>
                <strong>{currency}</strong>
              </div>
            </div>

            <div className="ww-progress-track" aria-hidden="true">
              <span style={{ width: `${thresholdProgress}%` }} />
            </div>

            <p className="ww-readiness-copy">
              {withdrawalReady
                ? 'Your available balance meets the current withdrawal requirement.'
                : threshold > 0
                  ? `Reach ${formatMoney(threshold)} USD in available funds before requesting a withdrawal.`
                  : 'Available funds are required before a withdrawal can be requested.'}
            </p>

            <button
              type="button"
              className="ww-secondary-button"
              onClick={openWithdrawal}
              disabled={!withdrawalReady}
            >
              Request withdrawal
            </button>
        </section>

        <section className="ww-card ww-earnings-card">
            <div className="ww-card-head compact">
              <div>
                <span className="ww-card-kicker">Earnings sources</span>
                <h2>Where earnings came from</h2>
              </div>
            </div>

            <div className="ww-source-list">
              <div className="ww-source-row">
                <div>
                  <span>Reader appreciation</span>
                  <small>
                    {Number(appreciation?.count || 0).toLocaleString()} appreciations
                    {' | '}
                    {Number(appreciation?.credits || 0).toLocaleString()} credits
                  </small>
                </div>
                <strong>${formatMoney(appreciation?.writer_net_usd)}</strong>
              </div>

              <div className="ww-source-row">
                <div>
                  <span>Direct memberships</span>
                  <small>{membershipSummary.count.toLocaleString()} wallet credits</small>
                </div>
                <strong>${formatMoney(membershipSummary.amount)}</strong>
              </div>
            </div>

            <div className="ww-appreciation-breakdown">
              <div>
                <span>Appreciation gross</span>
                <strong>${formatMoney(appreciation?.gross_usd)}</strong>
              </div>
              <div>
                <span>Platform fee</span>
                <strong>${formatMoney(appreciation?.platform_fee_usd)}</strong>
              </div>
            </div>
          </section>

        <WalletRulesCard />
      </div>

      <section className="ww-card ww-history-card">
        <div className="ww-card-head">
          <div>
            <span className="ww-card-kicker">Payout records</span>
            <h2>Withdrawal History</h2>
            <p>Your most recent Writer withdrawal requests and their review status.</p>
          </div>
          <span className="ww-count-badge">{withdrawals.length}</span>
        </div>

        {loading ? (
          <div className="ww-state">
            <span className="ww-spinner" aria-hidden="true" />
            <strong>Loading withdrawal history...</strong>
          </div>
        ) : withdrawals.length ? (
          <div className="ww-history-list">
            <div className="ww-history-header" aria-hidden="true">
              <span>Requested</span>
              <span>Method</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {withdrawals.slice(0, 8).map((item) => (
              <article className="ww-history-row" key={item.id}>
                <div>
                  <span className="ww-mobile-label">Requested</span>
                  <strong>{formatDateTime(item?.created_at)}</strong>
                </div>
                <div>
                  <span className="ww-mobile-label">Method</span>
                  <strong>{item?.payment_method || 'Not specified'}</strong>
                  {item?.admin_note ? <small>{item.admin_note}</small> : null}
                </div>
                <div>
                  <span className="ww-mobile-label">Amount</span>
                  <strong>${formatMoney(item?.amount)}</strong>
                </div>
                <div>
                  <span className="ww-mobile-label">Status</span>
                  <span className={`ww-status-pill ${statusClass(item?.status)}`}>
                    {item?.status || 'pending'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="ww-state">
            <Download size={27} aria-hidden="true" />
            <strong>No withdrawals yet</strong>
            <p>Submitted withdrawal requests will appear here.</p>
          </div>
        )}
      </section>

      <WalletRulesCard mobile />

      {withdrawalOpen ? (
        <div
          className="ww-dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setWithdrawalOpen(false);
            }
          }}
        >
          <section
            className="ww-withdrawal-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ww-withdrawal-title"
          >
            <div className="ww-drawer-head">
              <div>
                <span className="ww-card-kicker">Writer payout</span>
                <h2 id="ww-withdrawal-title">Request Withdrawal</h2>
                <p>Submit a payout request from your available Writer wallet balance.</p>
              </div>
              <button
                type="button"
                className="ww-icon-button"
                onClick={() => setWithdrawalOpen(false)}
                disabled={submitting}
                aria-label="Close withdrawal form"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="ww-drawer-summary">
              <div>
                <span>Available</span>
                <strong>${formatMoney(available)}</strong>
              </div>
              <div>
                <span>Minimum</span>
                <strong>${formatMoney(threshold)}</strong>
              </div>
              <div>
                <span>Currency</span>
                <strong>{currency}</strong>
              </div>
            </div>

            {error ? (
              <div className="ww-drawer-error" role="alert">
                {error}
              </div>
            ) : null}

            <form className="ww-withdrawal-form" onSubmit={requestWithdrawal}>
              <label>
                <span>Amount in USD</span>
                <input
                  type="number"
                  min={threshold > 0 ? threshold : 0.01}
                  max={available || undefined}
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, amount: event.target.value }))
                  }
                  required
                  autoFocus
                />
                <small>Enter an amount no higher than your available balance.</small>
              </label>

              <label>
                <span>Payment method</span>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Bank transfer, PayPal, or another method"
                  value={form.payment_method}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      payment_method: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                <span>Payment details</span>
                <textarea
                  rows={5}
                  maxLength={2000}
                  placeholder="Add the payout details the platform team should use."
                  value={form.payment_details}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      payment_details: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="ww-reserve-note">
                <ShieldCheck size={18} aria-hidden="true" />
                <p>
                  Submitted funds are reserved immediately. If the request is rejected, the
                  reserved amount is restored to your available balance.
                </p>
              </div>

              <div className="ww-drawer-actions">
                <button
                  type="button"
                  className="ww-secondary-button"
                  onClick={() => setWithdrawalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="ww-primary-button" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit request'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

const writerWalletStyles = `
  /* BLOGGAD WRITER WALLET FIGMA APPROVED V1 START */
  .writer-wallet-page {
    width: 100%;
    color: #172033;
    font-size: 14px;
    line-height: 1.5;
  }

  .writer-wallet-page * {
    box-sizing: border-box;
  }

  .ww-page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
  }

  .ww-page-head h1,
  .ww-card h2,
  .ww-drawer-head h2 {
    margin: 0;
    color: #101828;
    letter-spacing: -0.025em;
  }

  .ww-page-head h1 {
    margin-top: 5px;
    font-size: 26px;
    line-height: 1.15;
    font-weight: 750;
  }

  .ww-page-head p {
    max-width: 760px;
    margin: 8px 0 0;
    color: #667085;
    font-size: 14px;
    line-height: 1.6;
  }

  .ww-eyebrow,
  .ww-card-kicker {
    display: inline-block;
    color: #667085;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .ww-primary-button,
  .ww-secondary-button,
  .ww-icon-button {
    appearance: none;
    border: 0;
    font: inherit;
    cursor: pointer;
  }

  .ww-primary-button,
  .ww-secondary-button {
    min-height: 42px;
    border-radius: 10px;
    padding: 0 16px;
    font-size: 13px;
    font-weight: 700;
    transition: background 160ms ease, border-color 160ms ease, opacity 160ms ease;
  }

  .ww-primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #2563eb;
    color: #ffffff;
  }

  .ww-primary-button:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .ww-secondary-button {
    background: #ffffff;
    border: 1px solid #d0d5dd;
    color: #344054;
  }

  .ww-secondary-button:hover:not(:disabled) {
    background: #f8fafc;
  }

  .ww-primary-button:disabled,
  .ww-secondary-button:disabled,
  .ww-icon-button:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }

  .ww-alert {
    margin-bottom: 16px;
    border: 1px solid;
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 650;
  }

  .ww-alert.is-error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b42318;
  }

  .ww-alert.is-success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }

  .ww-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .ww-stat-card,
  .ww-card {
    border: 1px solid #e4e7ec;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.02);
  }

  .ww-stat-card {
    position: relative;
    min-height: 132px;
    border-radius: 14px;
    padding: 17px;
  }

  .ww-stat-icon {
    position: absolute;
    top: 15px;
    right: 15px;
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 9px;
    background: #f2f4f7;
    color: #475467;
  }

  .ww-stat-label,
  .ww-stat-helper {
    display: block;
    color: #667085;
  }

  .ww-stat-label {
    padding-right: 40px;
    font-size: 13px;
    font-weight: 650;
  }

  .ww-stat-value {
    display: block;
    margin-top: 13px;
    color: #101828;
    font-size: 23px;
    line-height: 1.1;
    font-weight: 760;
    letter-spacing: -0.025em;
  }

  .ww-stat-helper {
    margin-top: 8px;
    font-size: 12px;
  }

  .ww-content-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.62fr) minmax(300px, 0.72fr);
    gap: 14px;
    align-items: start;
  }

  .ww-activity-card {
    grid-column: 1;
    grid-row: 1 / span 3;
  }

  .ww-readiness-card {
    grid-column: 2;
    grid-row: 1;
  }

  .ww-earnings-card {
    grid-column: 2;
    grid-row: 2;
  }

  .ww-rules-desktop {
    grid-column: 2;
    grid-row: 3;
  }

  .ww-rules-mobile {
    display: none;
  }

  .ww-card {
    border-radius: 14px;
    padding: 18px;
  }

  .ww-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 15px;
  }

  .ww-card-head.compact {
    margin-bottom: 13px;
  }

  .ww-card h2 {
    margin-top: 3px;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 730;
  }

  .ww-card-head p {
    margin: 5px 0 0;
    color: #667085;
    font-size: 13px;
    line-height: 1.5;
  }

  .ww-icon-button {
    display: grid;
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    place-items: center;
    border: 1px solid #e4e7ec;
    border-radius: 10px;
    background: #ffffff;
    color: #475467;
  }

  .ww-icon-button:hover:not(:disabled) {
    background: #f8fafc;
  }

  .ww-activity-list {
    border-top: 1px solid #eaecf0;
  }

  .ww-activity-row {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    min-height: 76px;
    padding: 12px 0;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-activity-row:last-child {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .ww-activity-direction {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 10px;
  }

  .ww-activity-direction.is-credit {
    background: #ecfdf3;
    color: #027a48;
  }

  .ww-activity-direction.is-debit {
    background: #fff4ed;
    color: #b54708;
  }

  .ww-activity-copy {
    min-width: 0;
  }

  .ww-activity-title-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ww-activity-title-line strong {
    color: #344054;
    font-size: 13px;
    font-weight: 700;
  }

  .ww-activity-copy p {
    overflow: hidden;
    margin: 3px 0 0;
    color: #667085;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-activity-copy > span {
    display: block;
    margin-top: 3px;
    color: #98a2b3;
    font-size: 12px;
  }

  .ww-activity-amount {
    padding-left: 10px;
    font-size: 13px;
    font-weight: 760;
    white-space: nowrap;
  }

  .ww-activity-amount.is-credit {
    color: #027a48;
  }

  .ww-activity-amount.is-debit {
    color: #b54708;
  }

  .ww-status-pill {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    border-radius: 999px;
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    text-transform: capitalize;
  }

  .ww-status-pill.is-success {
    background: #ecfdf3;
    color: #027a48;
  }

  .ww-status-pill.is-pending {
    background: #fffaeb;
    color: #b54708;
  }

  .ww-status-pill.is-danger {
    background: #fef3f2;
    color: #b42318;
  }

  .ww-readiness-card {
    background: #fbfcff;
  }

  .ww-readiness-dot {
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    margin-top: 6px;
    border-radius: 999px;
    background: #f79009;
    box-shadow: 0 0 0 4px #fff7ed;
  }

  .ww-readiness-dot.is-ready {
    background: #12b76a;
    box-shadow: 0 0 0 4px #ecfdf3;
  }

  .ww-readiness-amounts {
    display: grid;
    gap: 0;
    margin-top: 4px;
    border-top: 1px solid #eaecf0;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-readiness-amounts > div,
  .ww-appreciation-breakdown > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 42px;
  }

  .ww-readiness-amounts span,
  .ww-appreciation-breakdown span {
    color: #667085;
    font-size: 12px;
  }

  .ww-readiness-amounts strong,
  .ww-appreciation-breakdown strong {
    color: #344054;
    font-size: 13px;
  }

  .ww-progress-track {
    overflow: hidden;
    height: 7px;
    margin-top: 15px;
    border-radius: 999px;
    background: #eaecf0;
  }

  .ww-progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #2563eb;
  }

  .ww-readiness-copy {
    margin: 10px 0 13px;
    color: #667085;
    font-size: 12px;
    line-height: 1.55;
  }

  .ww-readiness-card .ww-secondary-button {
    width: 100%;
  }

  .ww-source-list {
    display: grid;
    gap: 0;
    border-top: 1px solid #eaecf0;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-source-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 62px;
    padding: 9px 0;
  }

  .ww-source-row + .ww-source-row {
    border-top: 1px solid #eaecf0;
  }

  .ww-source-row span {
    display: block;
    color: #344054;
    font-size: 13px;
    font-weight: 680;
  }

  .ww-source-row small {
    display: block;
    margin-top: 3px;
    color: #667085;
    font-size: 12px;
  }

  .ww-source-row > strong {
    color: #101828;
    font-size: 14px;
    white-space: nowrap;
  }

  .ww-appreciation-breakdown {
    margin-top: 9px;
  }

  .ww-rules-card .ww-card-head > svg {
    color: #2563eb;
  }

  .ww-rules-list {
    display: grid;
    gap: 13px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ww-rules-list li {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr);
    gap: 10px;
  }

  .ww-rules-list li > span {
    display: grid;
    width: 25px;
    height: 25px;
    place-items: center;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 750;
  }

  .ww-rules-list strong {
    color: #344054;
    font-size: 12px;
  }

  .ww-rules-list p {
    margin: 2px 0 0;
    color: #667085;
    font-size: 12px;
    line-height: 1.5;
  }

  .ww-history-card {
    margin-top: 14px;
  }

  .ww-count-badge {
    display: grid;
    min-width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 999px;
    background: #f2f4f7;
    color: #475467;
    font-size: 12px;
    font-weight: 750;
  }

  .ww-history-list {
    overflow: hidden;
    border: 1px solid #eaecf0;
    border-radius: 11px;
  }

  .ww-history-header,
  .ww-history-row {
    display: grid;
    grid-template-columns: 1.35fr 1fr 0.72fr 0.72fr;
    gap: 14px;
    align-items: center;
    padding: 0 14px;
  }

  .ww-history-header {
    min-height: 38px;
    background: #f8fafc;
    color: #667085;
    font-size: 12px;
    font-weight: 700;
  }

  .ww-history-row {
    min-height: 64px;
    border-top: 1px solid #eaecf0;
  }

  .ww-history-row > div {
    min-width: 0;
  }

  .ww-history-row strong {
    display: block;
    overflow: hidden;
    color: #344054;
    font-size: 12px;
    font-weight: 680;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-history-row small {
    display: block;
    overflow: hidden;
    margin-top: 3px;
    color: #667085;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-mobile-label {
    display: none;
  }

  .ww-state {
    display: grid;
    min-height: 180px;
    place-items: center;
    align-content: center;
    gap: 8px;
    padding: 24px;
    color: #667085;
    text-align: center;
  }

  .ww-state strong {
    color: #344054;
    font-size: 14px;
  }

  .ww-state p {
    max-width: 360px;
    margin: 0;
    font-size: 12px;
  }

  .ww-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #d0d5dd;
    border-top-color: #2563eb;
    border-radius: 999px;
    animation: ww-spin 0.85s linear infinite;
  }

  @keyframes ww-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ww-dialog-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1300;
    display: flex;
    justify-content: flex-end;
    background: rgba(15, 23, 42, 0.34);
  }

  .ww-withdrawal-drawer {
    width: min(440px, 100%);
    height: 100%;
    overflow-y: auto;
    background: #ffffff;
    box-shadow: -18px 0 40px rgba(15, 23, 42, 0.16);
  }

  .ww-drawer-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 22px 18px;
    border-bottom: 1px solid #eaecf0;
  }

  .ww-drawer-head h2 {
    margin-top: 4px;
    font-size: 21px;
    line-height: 1.2;
    font-weight: 750;
  }

  .ww-drawer-head p {
    margin: 6px 0 0;
    color: #667085;
    font-size: 13px;
    line-height: 1.55;
  }

  .ww-drawer-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    margin: 18px 22px 0;
    overflow: hidden;
    border: 1px solid #eaecf0;
    border-radius: 11px;
    background: #eaecf0;
  }

  .ww-drawer-summary > div {
    min-width: 0;
    padding: 12px 10px;
    background: #f8fafc;
  }

  .ww-drawer-summary span,
  .ww-drawer-summary strong {
    display: block;
  }

  .ww-drawer-summary span {
    color: #667085;
    font-size: 12px;
  }

  .ww-drawer-summary strong {
    overflow: hidden;
    margin-top: 4px;
    color: #101828;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ww-drawer-error {
    margin: 14px 22px 0;
    border: 1px solid #fecaca;
    border-radius: 10px;
    padding: 10px 12px;
    background: #fef2f2;
    color: #b42318;
    font-size: 12px;
    font-weight: 650;
  }

  .ww-withdrawal-form {
    display: grid;
    gap: 16px;
    padding: 20px 22px 26px;
  }

  .ww-withdrawal-form label {
    display: grid;
    gap: 7px;
  }

  .ww-withdrawal-form label > span {
    color: #344054;
    font-size: 13px;
    font-weight: 680;
  }

  .ww-withdrawal-form input,
  .ww-withdrawal-form textarea {
    width: 100%;
    border: 1px solid #d0d5dd;
    border-radius: 10px;
    background: #ffffff;
    color: #101828;
    font: inherit;
    font-size: 14px;
    outline: none;
  }

  .ww-withdrawal-form input {
    min-height: 44px;
    padding: 0 12px;
  }

  .ww-withdrawal-form textarea {
    min-height: 112px;
    resize: vertical;
    padding: 11px 12px;
    line-height: 1.55;
  }

  .ww-withdrawal-form input:focus,
  .ww-withdrawal-form textarea:focus {
    border-color: #84adff;
    box-shadow: 0 0 0 3px #eff4ff;
  }

  .ww-withdrawal-form small {
    color: #667085;
    font-size: 12px;
  }

  .ww-reserve-note {
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    gap: 9px;
    border: 1px solid #bfdbfe;
    border-radius: 11px;
    padding: 12px;
    background: #eff6ff;
    color: #1d4ed8;
  }

  .ww-reserve-note p {
    margin: 0;
    color: #475467;
    font-size: 12px;
    line-height: 1.55;
  }

  .ww-drawer-actions {
    display: grid;
    grid-template-columns: 1fr 1.35fr;
    gap: 10px;
    padding-top: 4px;
  }

  @media (max-width: 1080px) {
    .ww-content-grid {
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
    }

    .ww-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 800px) {
    .ww-content-grid {
      grid-template-columns: 1fr;
    }

    .ww-readiness-card {
      grid-column: 1;
      grid-row: 1;
    }

    .ww-activity-card {
      grid-column: 1;
      grid-row: 2;
    }

    .ww-earnings-card {
      grid-column: 1;
      grid-row: 3;
    }

    .ww-rules-desktop {
      display: none;
    }

    .ww-rules-mobile {
      display: block;
      margin-top: 14px;
    }

    .ww-history-header {
      display: none;
    }

    .ww-history-row {
      grid-template-columns: 1fr 1fr;
      gap: 12px 20px;
      padding: 14px;
    }

    .ww-mobile-label {
      display: block;
      margin-bottom: 3px;
      color: #98a2b3;
      font-size: 12px;
      font-weight: 650;
    }
  }

  @media (max-width: 767px) {
    .writer-wallet-page {
      width: auto;
      margin-right: -9px;
      margin-left: -9px;
      font-size: 14px;
    }

    .ww-page-head {
      display: block;
      margin-bottom: 15px;
      padding: 0 1px;
    }

    .ww-page-head h1 {
      font-size: 23px;
    }

    .ww-page-head p {
      margin-top: 7px;
      font-size: 13px;
      line-height: 1.55;
    }

    .ww-desktop-request {
      display: none;
    }

    .ww-stats-grid {
      gap: 8px;
      margin-bottom: 8px;
    }

    .ww-stat-card {
      min-height: 120px;
      border-radius: 12px;
      padding: 14px;
    }

    .ww-stat-icon {
      top: 12px;
      right: 12px;
      width: 31px;
      height: 31px;
    }

    .ww-stat-label {
      font-size: 12px;
    }

    .ww-stat-value {
      margin-top: 14px;
      font-size: 20px;
    }

    .ww-stat-helper {
      font-size: 12px;
    }

    .ww-content-grid {
      gap: 8px;
    }

    .ww-rules-mobile {
      margin-top: 8px;
    }

    .ww-card {
      border-radius: 12px;
      padding: 14px;
    }

    .ww-card h2 {
      font-size: 17px;
    }

    .ww-card-head p {
      font-size: 12px;
    }

    .ww-activity-row {
      grid-template-columns: 34px minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 13px 0;
    }

    .ww-activity-amount {
      grid-column: 2;
      padding: 0;
    }

    .ww-activity-copy p {
      white-space: normal;
    }

    .ww-history-card {
      margin-top: 8px;
    }

    .ww-history-row {
      grid-template-columns: 1fr 1fr;
      gap: 13px;
      padding: 13px;
    }

    .ww-history-row strong,
    .ww-history-row small {
      white-space: normal;
    }

    .ww-dialog-backdrop {
      align-items: flex-end;
    }

    .ww-withdrawal-drawer {
      width: 100%;
      height: auto;
      max-height: 92vh;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -18px 40px rgba(15, 23, 42, 0.16);
    }

    .ww-drawer-head {
      padding: 18px 16px 14px;
    }

    .ww-drawer-head h2 {
      font-size: 20px;
    }

    .ww-drawer-summary {
      margin: 14px 16px 0;
    }

    .ww-drawer-error {
      margin: 12px 16px 0;
    }

    .ww-withdrawal-form {
      gap: 14px;
      padding: 16px 16px calc(20px + env(safe-area-inset-bottom));
    }
  }

  @media (max-width: 420px) {
    .ww-stat-value {
      font-size: 19px;
    }

    .ww-history-row {
      grid-template-columns: 1fr;
    }

    .ww-drawer-summary {
      grid-template-columns: 1fr 1fr 0.85fr;
    }

    .ww-drawer-actions {
      grid-template-columns: 1fr;
    }

    .ww-drawer-actions .ww-primary-button {
      order: -1;
    }
  }
  /* BLOGGAD WRITER WALLET FIGMA APPROVED V1 END */
`;
