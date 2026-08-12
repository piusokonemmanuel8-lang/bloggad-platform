import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function getStoredToken() {
  return (
    localStorage.getItem('customerToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    ''
  );
}

function formatMoney(value, currency = 'USD') {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency || 'USD'} ${amount.toFixed(2)}`;
  }
}

function SummaryCard({ label, value, subtext }) {
  return (
    <div className="advertiser-dashboard-stat-card">
      <div className="advertiser-dashboard-stat-label">{label}</div>
      <div className="advertiser-dashboard-stat-value">{value}</div>
      {subtext ? <div className="advertiser-dashboard-stat-subtext">{subtext}</div> : null}
    </div>
  );
}

function StatusPill({ value }) {
  const normalized = String(value || 'draft').toLowerCase();
  let className = 'advertiser-dashboard-status advertiser-dashboard-status-neutral';

  if (normalized === 'approved' || normalized === 'paid' || normalized === 'verified') {
    className = 'advertiser-dashboard-status advertiser-dashboard-status-positive';
  } else if (normalized === 'pending') {
    className = 'advertiser-dashboard-status advertiser-dashboard-status-pending';
  } else if (normalized === 'rejected' || normalized === 'failed') {
    className = 'advertiser-dashboard-status advertiser-dashboard-status-danger';
  } else if (normalized === 'paused') {
    className = 'advertiser-dashboard-status advertiser-dashboard-status-warning';
  }

  return <span className={className}>{value || 'draft'}</span>;
}

function DetailRow({ label, value }) {
  return (
    <div className="advertiser-dashboard-detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CustomerAdvertiserDashboardPage() {
  const navigate = useNavigate();
  const token = useMemo(() => getStoredToken(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
      return;
    }

    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [profileRes, walletRes, paymentsRes, campaignsRes] = await Promise.all([
          fetch(getApiUrl('/api/customer/advertiser/profile'), {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }),
          fetch(getApiUrl('/api/customer/advertiser/wallet'), {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }),
          fetch(getApiUrl('/api/customer/advertiser/payments'), {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }),
          fetch(getApiUrl('/api/customer/advertiser/campaigns'), {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }),
        ]);

        const [profileData, walletData, paymentsData, campaignsData] = await Promise.all([
          profileRes.json(),
          walletRes.json(),
          paymentsRes.json(),
          campaignsRes.json(),
        ]);

        if (!profileRes.ok || !profileData?.ok) {
          throw new Error(profileData?.message || 'Failed to load advertiser profile.');
        }
        if (!walletRes.ok || !walletData?.ok) {
          throw new Error(walletData?.message || 'Failed to load advertiser wallet.');
        }
        if (!paymentsRes.ok || !paymentsData?.ok) {
          throw new Error(paymentsData?.message || 'Failed to load advertiser payments.');
        }
        if (!campaignsRes.ok || !campaignsData?.ok) {
          throw new Error(campaignsData?.message || 'Failed to load advertiser campaigns.');
        }

        if (!isMounted) return;

        setProfile(profileData?.advertiser_profile || walletData?.advertiser_profile || null);
        setWallet(walletData?.wallet || profileData?.advertiser_wallet || null);
        setPayments(paymentsData?.payments || []);
        setCampaigns(campaignsData?.campaigns || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load advertiser dashboard.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate, token]);

  const stats = useMemo(() => {
    const approvedCampaigns = campaigns.filter(
      (item) => item?.approval_status === 'approved'
    ).length;
    const pendingCampaigns = campaigns.filter(
      (item) => item?.approval_status === 'pending'
    ).length;
    const paidPayments = payments.filter(
      (item) => item?.payment_status === 'paid'
    ).length;

    return {
      totalCampaigns: campaigns.length,
      approvedCampaigns,
      pendingCampaigns,
      paidPayments,
    };
  }, [campaigns, payments]);

  const currency = wallet?.currency_code || 'USD';
  const recentCampaigns = campaigns.slice(0, 8);
  const recentPayments = payments.slice(0, 8);
  const verification = profile?.verification_status || 'unverified';

  return (
    <ReaderUnifiedShell title="Advertiser" subtitle="Advertiser">
      <style>{`
        .advertiser-dashboard-page {
          display: grid;
          gap: 16px;
          color: #0e121f;
        }

        .advertiser-dashboard-quickbar,
        .advertiser-dashboard-card,
        .advertiser-dashboard-stat-card {
          background: #ffffff;
          border: 1px solid #e6eaf0;
          box-shadow: none;
        }

        .advertiser-dashboard-quickbar {
          min-height: 60px;
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .advertiser-dashboard-overview-label {
          font-size: 15px;
          font-weight: 700;
        }

        .advertiser-dashboard-mobile-heading {
          display: none;
        }

        .advertiser-dashboard-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .advertiser-dashboard-action {
          min-height: 36px;
          border-radius: 8px;
          border: 1px solid #e6eaf0;
          background: #ffffff;
          color: #0e121f;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          white-space: nowrap;
        }

        .advertiser-dashboard-action-primary {
          min-width: 148px;
          border-color: #121727;
          background: #121727;
          color: #ffffff;
          font-weight: 700;
        }

        .advertiser-dashboard-alert {
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.5;
        }

        .advertiser-dashboard-alert-error {
          border: 1px solid #fecaca;
          background: #fff1f2;
          color: #be123c;
        }

        .advertiser-dashboard-alert-loading {
          border: 1px solid #e6eaf0;
          background: #ffffff;
          color: #748098;
        }

        .advertiser-dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .advertiser-dashboard-stat-card {
          min-height: 100px;
          border-radius: 12px;
          padding: 16px;
        }

        .advertiser-dashboard-stat-label {
          color: #748098;
          font-size: 12px;
        }

        .advertiser-dashboard-stat-value {
          margin-top: 7px;
          color: #0e121f;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.03em;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-stat-subtext {
          margin-top: 6px;
          color: #748098;
          font-size: 10px;
        }

        .advertiser-dashboard-body {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(290px, 1fr);
          gap: 16px;
          align-items: start;
        }

        .advertiser-dashboard-card {
          border-radius: 14px;
          padding: 18px;
          min-width: 0;
        }

        .advertiser-dashboard-campaigns {
          grid-column: 1;
          grid-row: 1 / span 2;
        }

        .advertiser-dashboard-wallet {
          grid-column: 2;
          grid-row: 1;
        }

        .advertiser-dashboard-profile {
          grid-column: 2;
          grid-row: 2;
        }

        .advertiser-dashboard-funding {
          grid-column: 1;
          grid-row: 3;
        }

        .advertiser-dashboard-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .advertiser-dashboard-card-title {
          margin: 0;
          color: #0e121f;
          font-size: 16px;
          line-height: 1.25;
          font-weight: 700;
        }

        .advertiser-dashboard-card-hint {
          margin-top: 5px;
          color: #748098;
          font-size: 11px;
          line-height: 1.4;
        }

        .advertiser-dashboard-text-link {
          color: #1a5cd4;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .advertiser-dashboard-list {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .advertiser-dashboard-campaign-item,
        .advertiser-dashboard-funding-item {
          border: 1px solid #e6eaf0;
          background: #f7f8fa;
          border-radius: 10px;
        }

        .advertiser-dashboard-campaign-item {
          padding: 14px;
        }

        .advertiser-dashboard-campaign-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .advertiser-dashboard-campaign-name {
          color: #0e121f;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-campaign-meta {
          margin-top: 5px;
          color: #748098;
          font-size: 10px;
          text-transform: lowercase;
        }

        .advertiser-dashboard-status {
          min-height: 24px;
          border-radius: 999px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          line-height: 1;
          font-weight: 800;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .advertiser-dashboard-status-positive {
          background: #ecfbf3;
          color: #166534;
        }

        .advertiser-dashboard-status-pending {
          background: #eff6ff;
          color: #1a5cd4;
        }

        .advertiser-dashboard-status-danger {
          background: #fff1f2;
          color: #be123c;
        }

        .advertiser-dashboard-status-warning {
          background: #fff7ed;
          color: #c2410c;
        }

        .advertiser-dashboard-status-neutral {
          background: #f5f6f9;
          color: #748098;
        }

        .advertiser-dashboard-metrics {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .advertiser-dashboard-metric-label {
          color: #748098;
          font-size: 9px;
          font-weight: 800;
        }

        .advertiser-dashboard-metric-value {
          margin-top: 5px;
          color: #0e121f;
          font-size: 13px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-detail-list {
          margin-top: 10px;
        }

        .advertiser-dashboard-detail-row {
          min-height: 57px;
          border-bottom: 1px solid #e6eaf0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(120px, 0.8fr);
          align-items: center;
          gap: 14px;
          color: #748098;
          font-size: 10px;
        }

        .advertiser-dashboard-detail-row:last-child {
          border-bottom: 0;
        }

        .advertiser-dashboard-detail-row strong {
          color: #0e121f;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-verification {
          margin-top: 14px;
        }

        .advertiser-dashboard-funding-item {
          min-height: 78px;
          padding: 12px 14px;
          display: grid;
          grid-template-columns: minmax(150px, 1fr) minmax(150px, 1fr) auto;
          align-items: center;
          gap: 14px;
        }

        .advertiser-dashboard-funding-amount {
          color: #0e121f;
          font-size: 14px;
          font-weight: 700;
        }

        .advertiser-dashboard-funding-provider,
        .advertiser-dashboard-funding-reference {
          margin-top: 5px;
          color: #748098;
          font-size: 10px;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .advertiser-dashboard-empty {
          border: 1px solid #e6eaf0;
          background: #f7f8fa;
          border-radius: 10px;
          padding: 16px;
          color: #748098;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 1100px) {
          .advertiser-dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .advertiser-dashboard-body {
            grid-template-columns: 1fr;
          }

          .advertiser-dashboard-campaigns,
          .advertiser-dashboard-wallet,
          .advertiser-dashboard-profile,
          .advertiser-dashboard-funding {
            grid-column: 1;
            grid-row: auto;
          }
        }

        @media (max-width: 767px) {
          .advertiser-dashboard-page {
            gap: 10px;
          }

          .advertiser-dashboard-quickbar {
            min-height: 96px;
            padding: 12px 14px;
            display: block;
          }

          .advertiser-dashboard-overview-label {
            display: none;
          }

          .advertiser-dashboard-mobile-heading {
            display: block;
          }

          .advertiser-dashboard-mobile-title {
            font-size: 22px;
            line-height: 1.1;
            font-weight: 800;
            letter-spacing: -0.03em;
          }

          .advertiser-dashboard-mobile-subtitle {
            margin-top: 2px;
            color: #748098;
            font-size: 10px;
          }

          .advertiser-dashboard-actions {
            margin-top: 8px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 6px;
          }

          .advertiser-dashboard-action,
          .advertiser-dashboard-action-primary {
            min-width: 0;
            min-height: 34px;
            padding: 0 7px;
            font-size: 10px;
          }

          .advertiser-dashboard-action-primary {
            font-size: 0;
          }

          .advertiser-dashboard-action-primary::after {
            content: '+ Create';
            font-size: 10px;
          }

          .advertiser-dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .advertiser-dashboard-stat-card {
            min-height: 74px;
            padding: 11px 12px;
          }

          .advertiser-dashboard-stat-label {
            font-size: 10px;
          }

          .advertiser-dashboard-stat-value {
            margin-top: 5px;
            font-size: 20px;
          }

          .advertiser-dashboard-stat-subtext {
            display: none;
          }

          .advertiser-dashboard-body {
            gap: 10px;
          }

          .advertiser-dashboard-card {
            border-radius: 12px;
            padding: 14px;
          }

          .advertiser-dashboard-campaigns { order: 1; }
          .advertiser-dashboard-wallet { order: 2; }
          .advertiser-dashboard-profile { order: 3; }
          .advertiser-dashboard-funding { order: 4; }

          .advertiser-dashboard-card-title {
            font-size: 15px;
          }

          .advertiser-dashboard-card-hint,
          .advertiser-dashboard-text-link {
            font-size: 10px;
          }

          .advertiser-dashboard-list {
            margin-top: 12px;
            gap: 8px;
          }

          .advertiser-dashboard-campaign-item {
            padding: 12px;
          }

          .advertiser-dashboard-campaign-name {
            font-size: 13px;
          }

          .advertiser-dashboard-campaign-meta {
            font-size: 9px;
          }

          .advertiser-dashboard-status {
            min-height: 22px;
            padding: 0 8px;
            font-size: 8px;
          }

          .advertiser-dashboard-metrics {
            margin-top: 16px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px 16px;
          }

          .advertiser-dashboard-metric-label {
            font-size: 8px;
          }

          .advertiser-dashboard-metric-value {
            margin-top: 3px;
            font-size: 11px;
          }

          .advertiser-dashboard-detail-row {
            min-height: 55px;
            grid-template-columns: minmax(0, 1fr) minmax(150px, 1.15fr);
            gap: 10px;
            font-size: 9px;
          }

          .advertiser-dashboard-detail-row strong {
            font-size: 11px;
          }

          .advertiser-dashboard-funding-item {
            min-height: 70px;
            padding: 10px 11px;
            grid-template-columns: minmax(90px, 1fr) minmax(90px, 1fr) auto;
            gap: 8px;
          }

          .advertiser-dashboard-funding-amount {
            font-size: 12px;
          }

          .advertiser-dashboard-funding-provider,
          .advertiser-dashboard-funding-reference {
            font-size: 9px;
          }
        }

        @media (max-width: 380px) {
          .advertiser-dashboard-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .advertiser-dashboard-quickbar {
            min-height: 136px;
          }

          .advertiser-dashboard-detail-row {
            grid-template-columns: 1fr;
            gap: 4px;
            padding: 10px 0;
          }

          .advertiser-dashboard-funding-item {
            grid-template-columns: 1fr auto;
          }

          .advertiser-dashboard-funding-reference {
            grid-column: 1;
          }
        }
      `}</style>

      <main className="advertiser-dashboard-page">
        <section className="advertiser-dashboard-quickbar">
          <div className="advertiser-dashboard-overview-label">Advertiser overview</div>
          <div className="advertiser-dashboard-mobile-heading">
            <div className="advertiser-dashboard-mobile-title">Advertiser</div>
            <div className="advertiser-dashboard-mobile-subtitle">Overview</div>
          </div>

          <div className="advertiser-dashboard-actions">
            <Link className="advertiser-dashboard-action" to="/customer/advertiser/profile">
              Profile
            </Link>
            <Link className="advertiser-dashboard-action" to="/customer/advertiser/wallet">
              Wallet
            </Link>
            <Link className="advertiser-dashboard-action" to="/customer/advertiser/campaigns">
              Campaigns
            </Link>
            <Link
              className="advertiser-dashboard-action advertiser-dashboard-action-primary"
              to="/customer/advertiser/campaigns/create"
            >
              + Create Campaign
            </Link>
          </div>
        </section>

        {error ? (
          <div className="advertiser-dashboard-alert advertiser-dashboard-alert-error">{error}</div>
        ) : null}

        {loading ? (
          <div className="advertiser-dashboard-alert advertiser-dashboard-alert-loading">
            Loading advertiser dashboard...
          </div>
        ) : null}

        <section className="advertiser-dashboard-stats" aria-label="Advertiser summary">
          <SummaryCard
            label="Available Balance"
            value={formatMoney(wallet?.available_balance || 0, currency)}
            subtext="Ready for campaigns"
          />
          <SummaryCard label="Total Campaigns" value={stats.totalCampaigns} subtext="All campaigns" />
          <SummaryCard label="Approved" value={stats.approvedCampaigns} subtext="Ready to run" />
          <SummaryCard label="Pending Review" value={stats.pendingCampaigns} subtext="Awaiting review" />
        </section>

        <section className="advertiser-dashboard-body">
          <section className="advertiser-dashboard-card advertiser-dashboard-campaigns">
            <div className="advertiser-dashboard-card-head">
              <div>
                <h2 className="advertiser-dashboard-card-title">Recent campaigns</h2>
                <div className="advertiser-dashboard-card-hint">
                  Latest campaign performance and review status
                </div>
              </div>
              <Link className="advertiser-dashboard-text-link" to="/customer/advertiser/campaigns">
                View all
              </Link>
            </div>

            <div className="advertiser-dashboard-list">
              {recentCampaigns.length ? (
                recentCampaigns.map((campaign) => (
                  <article key={campaign.id} className="advertiser-dashboard-campaign-item">
                    <div className="advertiser-dashboard-campaign-head">
                      <div>
                        <div className="advertiser-dashboard-campaign-name">
                          {campaign?.campaign_name || 'Untitled Campaign'}
                        </div>
                        <div className="advertiser-dashboard-campaign-meta">
                          {campaign?.campaign_type || 'banner'} / {campaign?.buying_model || 'cpc'} /{' '}
                          {campaign?.objective || 'traffic'}
                        </div>
                      </div>
                      <StatusPill value={campaign?.approval_status || 'draft'} />
                    </div>

                    <div className="advertiser-dashboard-metrics">
                      <div>
                        <div className="advertiser-dashboard-metric-label">Budget</div>
                        <div className="advertiser-dashboard-metric-value">
                          {formatMoney(campaign?.budget_total || 0, currency)}
                        </div>
                      </div>
                      <div>
                        <div className="advertiser-dashboard-metric-label">Spent</div>
                        <div className="advertiser-dashboard-metric-value">
                          {formatMoney(campaign?.spent_amount || 0, currency)}
                        </div>
                      </div>
                      <div>
                        <div className="advertiser-dashboard-metric-label">Clicks</div>
                        <div className="advertiser-dashboard-metric-value">{campaign?.clicks_count || 0}</div>
                      </div>
                      <div>
                        <div className="advertiser-dashboard-metric-label">Impressions</div>
                        <div className="advertiser-dashboard-metric-value">
                          {campaign?.impressions_count || 0}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="advertiser-dashboard-empty">No campaigns yet.</div>
              )}
            </div>
          </section>

          <section className="advertiser-dashboard-card advertiser-dashboard-wallet">
            <div className="advertiser-dashboard-card-head">
              <h2 className="advertiser-dashboard-card-title">Wallet summary</h2>
              <Link className="advertiser-dashboard-text-link" to="/customer/advertiser/wallet">
                Wallet
              </Link>
            </div>
            <div className="advertiser-dashboard-detail-list">
              <DetailRow label="Available balance" value={formatMoney(wallet?.available_balance || 0, currency)} />
              <DetailRow label="Locked balance" value={formatMoney(wallet?.locked_balance || 0, currency)} />
              <DetailRow label="Total funded" value={formatMoney(wallet?.total_funded || 0, currency)} />
              <DetailRow label="Paid funding requests" value={stats.paidPayments} />
            </div>
          </section>

          <section className="advertiser-dashboard-card advertiser-dashboard-profile">
            <div className="advertiser-dashboard-card-head">
              <h2 className="advertiser-dashboard-card-title">Advertiser profile</h2>
              <Link className="advertiser-dashboard-text-link" to="/customer/advertiser/profile">
                Profile
              </Link>
            </div>
            <div className="advertiser-dashboard-detail-list">
              <DetailRow label="Business Name" value={profile?.business_name || 'Not set yet'} />
              <DetailRow label="Brand Name" value={profile?.brand_name || 'Not set yet'} />
              <DetailRow label="Business Type" value={profile?.business_type || 'individual'} />
              <DetailRow label="Verification" value={verification} />
              <DetailRow label="Contact Name" value={profile?.contact_name || '-'} />
              <DetailRow label="Contact Email" value={profile?.contact_email || '-'} />
            </div>
            <div className="advertiser-dashboard-verification">
              <StatusPill value={verification} />
            </div>
          </section>

          <section className="advertiser-dashboard-card advertiser-dashboard-funding">
            <div className="advertiser-dashboard-card-head">
              <div>
                <h2 className="advertiser-dashboard-card-title">Recent funding requests</h2>
                <div className="advertiser-dashboard-card-hint">
                  Latest advertiser wallet funding activity
                </div>
              </div>
            </div>

            <div className="advertiser-dashboard-list">
              {recentPayments.length ? (
                recentPayments.map((payment) => (
                  <article key={payment.id} className="advertiser-dashboard-funding-item">
                    <div>
                      <div className="advertiser-dashboard-funding-amount">
                        {formatMoney(payment?.amount || 0, payment?.currency_code || currency)}
                      </div>
                      <div className="advertiser-dashboard-funding-provider">
                        {payment?.provider_name || payment?.payment_method || 'manual'}
                      </div>
                    </div>
                    <div className="advertiser-dashboard-funding-reference">
                      {payment?.provider_reference || 'No payment reference'}
                    </div>
                    <StatusPill value={payment?.payment_status || 'pending'} />
                  </article>
                ))
              ) : (
                <div className="advertiser-dashboard-empty">No funding requests yet.</div>
              )}
            </div>
          </section>
        </section>
      </main>
    </ReaderUnifiedShell>
  );
}
