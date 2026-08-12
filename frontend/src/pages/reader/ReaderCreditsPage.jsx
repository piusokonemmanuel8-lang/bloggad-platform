import { useEffect, useState } from 'react';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import ReaderCreditTopUpPanel from '../../components/reader/ReaderCreditTopUpPanel';
import { formatDateTime, money } from '../../components/writerReader/WorkspaceUi';
import '../customer/CustomerSavedPostsApproved.css';

function CreditStat({ label, value, note }) {
  return (
    <article className="reader-credits-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function formatCreditAmount(item) {
  const amount = Number(item?.credits_amount || 0).toLocaleString();
  const direction = String(item?.direction || '').toLowerCase();
  if (direction === 'credit') return `+${amount} credits`;
  if (direction === 'debit') return `-${amount} credits`;
  return `${amount} credits`;
}

function getCreditDirectionLabel(item) {
  const direction = String(item?.direction || '').toLowerCase();
  if (direction === 'credit') return 'CREDIT IN';
  if (direction === 'debit') return 'CREDIT OUT';
  return String(item?.direction || 'CREDIT').toUpperCase();
}

export default function ReaderCreditsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api.get('/api/reader/credits')
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.response?.data?.message || 'Failed to load Reader credits.');
      });

    return () => {
      active = false;
    };
  }, []);

  const wallet = data?.wallet || {};
  const transactions = Array.isArray(data?.transactions) ? data.transactions : [];

  return (
    <ReaderUnifiedShell title="Credits" subtitle="Your Reader library">
      <main className="reader-saved-page reader-credits-page">
        <style>{readerCreditsCss}</style>

        <section className="reader-credits-hero">
          <div>
            <h2 className="reader-credits-desktop-title">Credits wallet</h2>
            <h2 className="reader-credits-mobile-title">Credits</h2>
            <p className="reader-credits-desktop-subtitle">
              View your Reader credit balance and recent credit activity.
            </p>
            <p className="reader-credits-mobile-subtitle">
              Your Reader credit balance and recent activity.
            </p>
          </div>
          <span className="reader-credits-wallet-pill">READER WALLET</span>
        </section>

        <div className="reader-credits-info">
          <span className="reader-credits-info-icon" aria-hidden="true">i</span>
          <span>
            Credits are auditable value units used to appreciate Writers. Credit pricing is not hardcoded.
          </span>
        </div>

        {error ? (
          <div className="reader-saved-alert error reader-credits-error" role="alert">
            {error}
          </div>
        ) : null}

        <ReaderCreditTopUpPanel />

        <section className="reader-credits-metrics" aria-label="Reader credit wallet summary">
          <CreditStat
            label="Available credits"
            value={Number(wallet.available_credits || 0).toLocaleString()}
            note="Current spendable balance"
          />
          <CreditStat
            label="Available value"
            value={`$${money(wallet.available_value_usd, 6)}`}
            note="USD value of current credits"
          />
          <CreditStat
            label="Credits acquired"
            value={Number(wallet.total_credits_acquired || 0).toLocaleString()}
            note="All credits added"
          />
          <CreditStat
            label="Credits spent"
            value={Number(wallet.total_credits_spent || 0).toLocaleString()}
            note="Credits used for appreciation"
          />
        </section>

        <section className="reader-credits-activity-card">
          <div className="reader-credits-activity-head">
            <div>
              <h3>Credit activity</h3>
              <p className="reader-credits-desktop-activity-subtitle">
                Recent changes to your Reader credit wallet.
              </p>
              <p className="reader-credits-mobile-activity-subtitle">
                Recent Reader credit changes
              </p>
            </div>
            <span className="reader-credits-readonly">READ ONLY</span>
          </div>

          {transactions.length ? (
            <div className="reader-credits-activity-list">
              {transactions.map((item) => {
                const direction = String(item?.direction || '').toLowerCase();
                const directionClass =
                  direction === 'credit'
                    ? 'credit'
                    : direction === 'debit'
                      ? 'debit'
                      : '';

                return (
                  <article className="reader-credits-activity-row" key={item.id}>
                    <div className="reader-credits-activity-copy">
                      <strong>{item.transaction_type}</strong>
                      <span>
                        ${money(item.usd_value, 6)} <b aria-hidden="true">|</b> {formatDateTime(item.created_at)}
                      </span>
                    </div>
                    <div className={`reader-credits-activity-amount ${directionClass}`}>
                      <strong>{formatCreditAmount(item)}</strong>
                      <span>{getCreditDirectionLabel(item)}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="reader-credits-empty">
              <strong>No credit activity yet.</strong>
              <span>Shown when the transaction list is empty.</span>
            </div>
          )}
        </section>
      </main>
    </ReaderUnifiedShell>
  );
}

const readerCreditsCss = `
  .reader-credits-page { max-width: 1220px; padding-top: 24px; }
  .reader-credits-hero {
    display: none;
  }
  .reader-credits-hero h2 {
    margin: 0;
    color: #111827;
    font-size: 26px;
    line-height: 1.12;
    font-weight: 780;
    letter-spacing: -0.035em;
  }
  .reader-credits-hero p {
    margin: 8px 0 0;
    color: #748096;
    font-size: 13px;
    line-height: 1.55;
  }
  .reader-credits-mobile-title,
  .reader-credits-mobile-subtitle,
  .reader-credits-mobile-activity-subtitle { display: none; }
  .reader-credits-wallet-pill,
  .reader-credits-readonly {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    border-radius: 999px;
    background: #f3f4f6;
    color: #667085;
    font-size: 9px;
    line-height: 1;
    font-weight: 800;
  }
  .reader-credits-wallet-pill {
    min-height: 26px;
    padding: 0 10px;
    border: 1px solid #dce2ea;
  }
  .reader-credits-info {
    min-height: 45px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 14px;
    border: 1px solid #c9dcf7;
    border-radius: 11px;
    background: #e9f2ff;
    color: #28384f;
    font-size: 12px;
    line-height: 1.45;
  }
  .reader-credits-info-icon {
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    display: grid;
    place-items: center;
    border: 1px solid #c9dcf7;
    border-radius: 999px;
    background: #fff;
    font-size: 10px;
    font-weight: 800;
  }
  .reader-credits-error { margin-top: 14px; }
  .reader-credits-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
  .reader-credits-stat {
    min-width: 0;
    min-height: 124px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 18px;
    border: 1px solid #dce2ea;
    border-radius: 14px;
    background: #fff;
  }
  .reader-credits-stat > span {
    color: #667085;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 550;
  }
  .reader-credits-stat > strong {
    color: #111827;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 780;
    letter-spacing: -0.025em;
    overflow-wrap: anywhere;
  }
  .reader-credits-stat > small {
    margin-top: auto;
    color: #748096;
    font-size: 10px;
    line-height: 1.35;
  }
  .reader-credits-activity-card {
    min-height: 330px;
    padding: 18px;
    border: 1px solid #dce2ea;
    border-radius: 16px;
    background: #fff;
  }
  .reader-credits-activity-head {
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }
  .reader-credits-activity-head h3 {
    margin: 0;
    color: #111827;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 750;
  }
  .reader-credits-activity-head p {
    margin: 4px 0 0;
    color: #667085;
    font-size: 11px;
    line-height: 1.4;
  }
  .reader-credits-readonly { min-height: 25px; padding: 0 10px; }
  .reader-credits-activity-list { display: grid; }
  .reader-credits-activity-row {
    min-height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 12px 0;
    border-bottom: 1px solid #e3e7ed;
  }
  .reader-credits-activity-copy,
  .reader-credits-activity-amount {
    min-width: 0;
    display: grid;
    gap: 5px;
  }
  .reader-credits-activity-copy strong,
  .reader-credits-activity-amount strong {
    color: #111827;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 700;
  }
  .reader-credits-activity-copy span {
    color: #667085;
    font-size: 11px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
  .reader-credits-activity-copy b { font-weight: 400; }
  .reader-credits-activity-amount {
    flex: 0 0 auto;
    justify-items: end;
    text-align: right;
    gap: 4px;
  }
  .reader-credits-activity-amount.credit strong { color: #276749; }
  .reader-credits-activity-amount.debit strong { color: #b42318; }
  .reader-credits-activity-amount span {
    color: #748096;
    font-size: 9px;
    line-height: 1;
    font-weight: 800;
  }
  .reader-credits-empty {
    min-height: 118px;
    margin-top: 14px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 7px;
    border: 1px solid #dce2ea;
    border-radius: 15px;
    background: #fff;
    text-align: center;
  }
  .reader-credits-empty strong {
    color: #111827;
    font-size: 13px;
    line-height: 1.3;
  }
  .reader-credits-empty span {
    color: #667085;
    font-size: 10px;
    line-height: 1.4;
  }

  @media (max-width: 767px) {
    .reader-credits-page {
      width: calc(100% - 16px);
      margin: 0 8px;
      padding: 20px 0 32px;
    }
    .reader-credits-hero {
      min-height: 82px;
      display: grid;
      gap: 6px;
      align-items: start;
    }
    .reader-credits-desktop-title,
    .reader-credits-desktop-subtitle,
    .reader-credits-desktop-activity-subtitle,
    .reader-credits-info,
    .reader-credits-readonly,
    .reader-credits-stat > small { display: none; }
    .reader-credits-mobile-title,
    .reader-credits-mobile-subtitle,
    .reader-credits-mobile-activity-subtitle { display: block; }
    .reader-credits-hero h2 { font-size: 23px; line-height: 1.15; }
    .reader-credits-hero p { margin-top: 6px; font-size: 12px; line-height: 1.4; }
    .reader-credits-wallet-pill {
      justify-self: start;
      min-height: 25px;
      padding: 0 9px;
    }
    .reader-credits-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0;
    }
    .reader-credits-stat {
      min-height: 104px;
      padding: 14px 13px;
      gap: 8px;
      border-radius: 13px;
    }
    .reader-credits-stat > span { font-size: 10px; }
    .reader-credits-stat > strong { font-size: 19px; }
    .reader-credits-activity-card {
      min-height: 360px;
      padding: 16px;
      border-radius: 15px;
    }
    .reader-credits-activity-head { min-height: auto; display: block; }
    .reader-credits-activity-head h3 { font-size: 17px; }
    .reader-credits-activity-head p { font-size: 10px; }
    .reader-credits-activity-list { margin-top: 6px; }
    .reader-credits-activity-row {
      min-height: 68px;
      gap: 12px;
      padding: 10px 0;
    }
    .reader-credits-activity-copy { gap: 4px; }
    .reader-credits-activity-copy strong,
    .reader-credits-activity-amount strong { font-size: 11px; }
    .reader-credits-activity-copy span { font-size: 9px; }
    .reader-credits-activity-amount { gap: 3px; }
    .reader-credits-activity-amount span { font-size: 8px; }
    .reader-credits-empty { min-height: 118px; margin-top: 0; }
  }

  @media (min-width: 768px) and (max-width: 1120px) {
    .reader-credits-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
`;
