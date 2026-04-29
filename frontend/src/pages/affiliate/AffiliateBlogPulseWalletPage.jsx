import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  };
}

function badgeStyle(type = 'default') {
  const map = {
    success: { background: '#ecfdf3', color: '#027a48', border: '#abefc6' },
    warning: { background: '#fffaeb', color: '#b54708', border: '#fedf89' },
    danger: { background: '#fef3f2', color: '#b42318', border: '#fecdca' },
    info: { background: '#eff8ff', color: '#175cd3', border: '#b2ddff' },
    default: { background: '#f9fafb', color: '#344054', border: '#eaecf0' },
  };

  const current = map[type] || map.default;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: `1px solid ${current.border}`,
    background: current.background,
    color: current.color,
    whiteSpace: 'nowrap',
  };
}

function StatCard({ label, value, helper, tone = 'default' }) {
  const toneMap = {
    success: {
      background: 'linear-gradient(135deg, #ecfdf3 0%, #ffffff 70%)',
      border: '#bbf7d0',
      color: '#027a48',
    },
    warning: {
      background: 'linear-gradient(135deg, #fffaeb 0%, #ffffff 70%)',
      border: '#fedf89',
      color: '#b54708',
    },
    info: {
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 70%)',
      border: '#bfdbfe',
      color: '#175cd3',
    },
    default: {
      background: '#ffffff',
      border: '#e5e7eb',
      color: '#111827',
    },
  };

  const selected = toneMap[tone] || toneMap.default;

  return (
    <div
      style={{
        ...cardStyle(),
        background: selected.background,
        border: `1px solid ${selected.border}`,
      }}
    >
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: selected.color, lineHeight: 1.1 }}>
        {value}
      </div>
      {helper ? (
        <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

function TableBadge({ status }) {
  if (status === 'paid' || status === 'settled') return <div style={badgeStyle('success')}>Settled</div>;
  if (status === 'pending') return <div style={badgeStyle('warning')}>Pending</div>;
  if (status === 'rejected') return <div style={badgeStyle('danger')}>Rejected</div>;
  return <div style={badgeStyle('default')}>Draft</div>;
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function AffiliateBlogPulseWalletPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [earningsData, setEarningsData] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadWalletSummary() {
      setLoading(true);
      setErrorMessage('');

      try {
        const { data } = await api.get('/api/affiliate/blogpulse-earnings');

        if (!data?.ok || !data?.earnings) {
          throw new Error(data?.message || 'Failed to load BlogPulse wallet data.');
        }

        if (!ignore) {
          setEarningsData(data.earnings);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error?.response?.data?.message || error.message || 'Failed to load BlogPulse wallet data.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadWalletSummary();

    return () => {
      ignore = true;
    };
  }, []);

  const monetization = earningsData?.monetization || {};
  const overview = earningsData?.overview || {};
  const sponsoredAds = earningsData?.sponsored_ads || {};
  const summaryTable = earningsData?.summary_table || {};

  const platformEnabled = Number(monetization?.platform_enabled || 0) === 1;
  const hasSponsoredEarnings =
    Number(sponsoredAds?.total_earnings || 0) > 0 ||
    Number(sponsoredAds?.pending_earnings || 0) > 0 ||
    Number(sponsoredAds?.settled_earnings || 0) > 0;

  const walletUnlocked = platformEnabled || hasSponsoredEarnings;

  const availableBalance = Number(
    overview?.wallet_available_estimate ??
      Number(overview?.platform_estimated_revenue || 0) + Number(sponsoredAds?.settled_earnings || 0)
  );

  const pendingBalance = Number(sponsoredAds?.pending_earnings || 0);
  const totalEarned = Number(overview?.estimated_revenue || 0);
  const totalWithdrawn = 0;

  const transactions = useMemo(
    () => [
      {
        id: 1,
        date: 'Today',
        type: 'Platform + Sponsored Earnings',
        amount: formatMoney(summaryTable?.today?.estimated_revenue || 0),
        status: walletUnlocked ? 'pending' : 'draft',
      },
      {
        id: 2,
        date: 'Last 7 Days',
        type: 'Total Estimated Earnings',
        amount: formatMoney(summaryTable?.last_7_days?.estimated_revenue || 0),
        status: walletUnlocked ? 'pending' : 'draft',
      },
      {
        id: 3,
        date: 'All Time',
        type: 'Sponsored Ads Pending',
        amount: formatMoney(sponsoredAds?.pending_earnings || 0),
        status: Number(sponsoredAds?.pending_earnings || 0) > 0 ? 'pending' : 'draft',
      },
      {
        id: 4,
        date: 'All Time',
        type: 'Sponsored Ads Settled',
        amount: formatMoney(sponsoredAds?.settled_earnings || 0),
        status: Number(sponsoredAds?.settled_earnings || 0) > 0 ? 'settled' : 'draft',
      },
    ],
    [summaryTable, sponsoredAds, walletUnlocked]
  );

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          ...cardStyle(),
          background:
            'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 32,
                padding: '0 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}
            >
              BlogPulse Wallet
            </div>

            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
              Track your BlogPulse and sponsored ad publisher earnings
            </h1>

            <p
              style={{
                margin: '12px 0 0',
                maxWidth: 760,
                color: 'rgba(255,255,255,0.82)',
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              This wallet now includes BlogPulse platform earnings and sponsored ad revenue earned
              when approved campaigns appear on your monetized post templates.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Wallet Access
              </div>
              <div style={walletUnlocked ? badgeStyle('success') : badgeStyle('warning')}>
                {walletUnlocked ? 'Active' : 'Available After Approval'}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Publisher Sponsored Earnings
              </div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {formatMoney(sponsoredAds?.total_earnings || 0)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: '#f8fafc',
              border: '1px solid #eef2f7',
              color: '#475467',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Loading wallet summary...
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.65,
            }}
          >
            {errorMessage}
          </div>
        </section>
      ) : null}

      {!loading && !errorMessage && !walletUnlocked ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 18,
              borderRadius: 18,
              background: '#fffaeb',
              border: '1px solid #fedf89',
              color: '#b54708',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.65,
            }}
          >
            Your BlogPulse wallet becomes active after your platform monetization or sponsored
            publisher ads begin recording eligible earnings.
          </div>
        </section>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <StatCard
          label="Available Balance"
          value={formatMoney(availableBalance)}
          helper="Estimated balance available from platform earnings plus settled sponsored ad earnings."
          tone="success"
        />
        <StatCard
          label="Pending Sponsored Earnings"
          value={formatMoney(pendingBalance)}
          helper="Sponsored ad revenue recorded but not settled yet."
          tone="warning"
        />
        <StatCard
          label="Total Earned"
          value={formatMoney(totalEarned)}
          helper="Total estimated platform and sponsored ad earnings."
          tone="info"
        />
        <StatCard
          label="Total Withdrawn"
          value={formatMoney(totalWithdrawn)}
          helper="Total withdrawals completed from your BlogPulse wallet."
        />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <StatCard
          label="Sponsored Views"
          value={Number(sponsoredAds?.total_views || 0).toLocaleString()}
          helper="Sponsored ad views recorded on your monetized templates."
        />
        <StatCard
          label="Sponsored Clicks"
          value={Number(sponsoredAds?.total_clicks || 0).toLocaleString()}
          helper="Sponsored ad clicks recorded on your monetized templates."
        />
        <StatCard
          label="Settled Sponsored Earnings"
          value={formatMoney(sponsoredAds?.settled_earnings || 0)}
          helper="Sponsored earnings already settled."
          tone="success"
        />
        <StatCard
          label="Pending Events"
          value={Number(sponsoredAds?.pending_events || 0).toLocaleString()}
          helper="Sponsored events waiting for settlement."
          tone="warning"
        />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div style={cardStyle()}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
                Wallet Activity
              </h2>
              <p
                style={{
                  margin: '8px 0 0',
                  color: '#6b7280',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                A summary of your BlogPulse platform and sponsored publisher earnings.
              </p>
            </div>

            <button
              type="button"
              disabled={!walletUnlocked}
              style={{
                minWidth: 180,
                height: 44,
                borderRadius: 14,
                border: 0,
                background: walletUnlocked ? '#111827' : '#d1d5db',
                color: walletUnlocked ? '#ffffff' : '#6b7280',
                fontSize: 14,
                fontWeight: 900,
                cursor: walletUnlocked ? 'pointer' : 'not-allowed',
              }}
            >
              Request Withdrawal
            </button>
          </div>

          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              border: '1px solid #eef2f7',
              borderRadius: 18,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={thStyle}>Period</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.date}</td>
                    <td style={tdStyle}>{item.type}</td>
                    <td style={tdStyle}>{item.amount}</td>
                    <td style={tdStyle}>
                      <TableBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Wallet Rules
            </h3>

            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {[
                'BlogPulse platform earnings are estimated from tracked post views.',
                'Sponsored ad publisher earnings are recorded when visitors view or click sponsored placements on your monetized templates.',
                'Sponsored earnings can remain pending until platform settlement is completed.',
                'Available balance includes platform estimated earnings and settled sponsored earnings.',
              ].map((text) => (
                <div
                  key={text}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: '#f9fafb',
                    border: '1px solid #eef2f7',
                    color: '#374151',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Withdrawal Flow
            </h3>

            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {[
                'Earn through BlogPulse platform views and sponsored ad placements.',
                'Pending sponsored earnings wait for settlement.',
                'Settled earnings are added to your available wallet estimate.',
                'Withdrawals are reviewed and processed by the platform.',
              ].map((text, index) => (
                <div
                  key={text}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(0, 1fr)',
                    gap: 12,
                    alignItems: 'start',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: '#111827',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: 13,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      color: '#374151',
                      fontSize: 14,
                      lineHeight: 1.6,
                      paddingTop: 4,
                    }}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '14px 16px',
  fontSize: 13,
  fontWeight: 900,
  color: '#374151',
  borderBottom: '1px solid #eef2f7',
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: '#111827',
  borderBottom: '1px solid #f3f4f6',
};