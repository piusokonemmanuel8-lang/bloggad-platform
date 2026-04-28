import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

function money(value) {
  const amount = Number(value || 0);
  return `$${amount.toFixed(2)}`;
}

function numberValue(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function statusClass(status) {
  if (status === 'active') return 'active';
  if (status === 'pending') return 'pending';
  if (status === 'paused') return 'paused';
  if (status === 'exhausted') return 'exhausted';
  if (status === 'rejected') return 'rejected';
  return 'neutral';
}

export default function AdminAffiliateAdsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    return {
      total: campaigns.length,
      pending: campaigns.filter((item) => item.approval_status === 'pending').length,
      active: campaigns.filter((item) => item.status === 'active').length,
      rejected: campaigns.filter((item) => item.approval_status === 'rejected').length,
      spent: campaigns.reduce((sum, item) => sum + numberValue(item.total_spent), 0),
    };
  }, [campaigns]);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/admin/affiliate-ads');
      setCampaigns(Array.isArray(data?.campaigns) ? data.campaigns : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load affiliate ads.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function approveCampaign(id) {
    try {
      setWorkingId(id);
      setNotice('');
      setError('');

      const { data } = await api.put(`/admin/affiliate-ads/${id}/approve`, {
        admin_note: 'Approved by admin.',
      });

      setNotice(data?.message || 'Ad approved successfully.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to approve ad.');
    } finally {
      setWorkingId(null);
    }
  }

  async function rejectCampaign(id) {
    const reason = window.prompt('Why are you rejecting this ad?');

    if (!reason) return;

    try {
      setWorkingId(id);
      setNotice('');
      setError('');

      const { data } = await api.put(`/admin/affiliate-ads/${id}/reject`, {
        rejection_reason: reason,
        admin_note: reason,
      });

      setNotice(data?.message || 'Ad rejected successfully.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to reject ad.');
    } finally {
      setWorkingId(null);
    }
  }

  async function pauseCampaign(id) {
    try {
      setWorkingId(id);
      setNotice('');
      setError('');

      const { data } = await api.put(`/admin/affiliate-ads/${id}/pause`);
      setNotice(data?.message || 'Ad paused successfully.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to pause ad.');
    } finally {
      setWorkingId(null);
    }
  }

  async function resumeCampaign(id) {
    try {
      setWorkingId(id);
      setNotice('');
      setError('');

      const { data } = await api.put(`/admin/affiliate-ads/${id}/resume`);
      setNotice(data?.message || 'Ad resumed successfully.');
      await fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resume ad.');
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="aaa-page">
      <style>{styles}</style>

      <section className="aaa-hero">
        <div>
          <span className="aaa-pill">Admin Affiliate Ads</span>
          <h1>Review, approve, pause, and monitor affiliate promotions.</h1>
          <p>
            Manage product, post, and website promotions created by affiliates.
            Approved and funded ads can run automatically.
          </p>
        </div>

        <div className="aaa-stats">
          <div className="aaa-stat">
            <span>Total Ads</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="aaa-stat">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
          <div className="aaa-stat">
            <span>Active</span>
            <strong>{stats.active}</strong>
          </div>
          <div className="aaa-stat">
            <span>Total Spent</span>
            <strong>{money(stats.spent)}</strong>
          </div>
        </div>
      </section>

      {(notice || error) && (
        <div className={error ? 'aaa-alert error' : 'aaa-alert success'}>
          {error || notice}
        </div>
      )}

      <section className="aaa-card">
        <div className="aaa-card-head">
          <div>
            <h2>Affiliate Ad Campaigns</h2>
            <p>
              Pending ads need approval. Edited ads return to pending review.
            </p>
          </div>

          <button type="button" onClick={fetchCampaigns} className="aaa-soft-btn">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="aaa-empty">Loading affiliate ads...</div>
        ) : campaigns.length === 0 ? (
          <div className="aaa-empty">
            <strong>No affiliate ads yet</strong>
            <span>Affiliate promotions will appear here for review.</span>
          </div>
        ) : (
          <div className="aaa-list">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="aaa-item">
                <div className="aaa-badges">
                  <span className={`aaa-badge ${statusClass(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className={`aaa-badge ${campaign.approval_status}`}>
                    {campaign.approval_status}
                  </span>
                  <span className="aaa-badge type">{campaign.ad_type}</span>
                  <span className="aaa-badge paid">{campaign.payment_status}</span>
                </div>

                <div className="aaa-main">
                  {campaign.campaign_image ? (
                    <img src={campaign.campaign_image} alt={campaign.campaign_title} />
                  ) : (
                    <div className="aaa-img">AD</div>
                  )}

                  <div>
                    <h3>{campaign.campaign_title}</h3>
                    <p>{campaign.campaign_description || 'No description added.'}</p>

                    <div className="aaa-owner">
                      <span>Affiliate: {campaign.affiliate_name || 'Unknown'}</span>
                      <span>{campaign.affiliate_email || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="aaa-metrics">
                  <div>
                    <span>Budget</span>
                    <strong>{money(campaign.total_budget)}</strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong>{money(campaign.remaining_budget)}</strong>
                  </div>
                  <div>
                    <span>Spent</span>
                    <strong>{money(campaign.total_spent)}</strong>
                  </div>
                  <div>
                    <span>Views</span>
                    <strong>{campaign.total_views || 0}</strong>
                  </div>
                  <div>
                    <span>Clicks</span>
                    <strong>{campaign.total_clicks || 0}</strong>
                  </div>
                  <div>
                    <span>CTR</span>
                    <strong>
                      {numberValue(campaign.total_views) > 0
                        ? `${(
                            (numberValue(campaign.total_clicks) /
                              numberValue(campaign.total_views)) *
                            100
                          ).toFixed(2)}%`
                        : '0.00%'}
                    </strong>
                  </div>
                </div>

                <div className="aaa-rates">
                  <span>Target ID: {campaign.target_id}</span>
                  <span>Website ID: {campaign.website_id || '-'}</span>
                  <span>View cost: {money(campaign.cost_per_view)}</span>
                  <span>Click cost: {money(campaign.cost_per_click)}</span>
                </div>

                {campaign.rejection_reason && (
                  <div className="aaa-rejection">
                    Rejection reason: {campaign.rejection_reason}
                  </div>
                )}

                <div className="aaa-actions">
                  {campaign.approval_status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => approveCampaign(campaign.id)}
                        disabled={workingId === campaign.id}
                        className="approve"
                      >
                        {workingId === campaign.id ? 'Working...' : 'Approve'}
                      </button>

                      <button
                        type="button"
                        onClick={() => rejectCampaign(campaign.id)}
                        disabled={workingId === campaign.id}
                        className="reject"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {campaign.approval_status === 'approved' && campaign.status === 'paused' ? (
                    <button
                      type="button"
                      onClick={() => resumeCampaign(campaign.id)}
                      disabled={workingId === campaign.id}
                      className="approve"
                    >
                      {workingId === campaign.id ? 'Working...' : 'Resume'}
                    </button>
                  ) : null}

                  {campaign.approval_status === 'approved' && campaign.status === 'active' ? (
                    <button
                      type="button"
                      onClick={() => pauseCampaign(campaign.id)}
                      disabled={workingId === campaign.id}
                    >
                      {workingId === campaign.id ? 'Working...' : 'Pause'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = `
  .aaa-page {
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 24%),
      #f5f7fb;
    color: #0f172a;
    padding: 4px;
  }

  .aaa-hero {
    display: grid;
    grid-template-columns: 1.08fr 0.92fr;
    gap: 28px;
    align-items: center;
    margin-bottom: 22px;
    padding: 34px;
    border-radius: 28px;
    background: linear-gradient(135deg, #07111f, #0f172a 48%, #020617);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .aaa-pill {
    display: inline-flex;
    margin-bottom: 16px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.18);
    color: #cffafe;
    border: 1px solid rgba(125, 211, 252, 0.35);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .aaa-hero h1 {
    margin: 0;
    max-width: 760px;
    font-size: 38px;
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -0.04em;
    color: #ffffff;
  }

  .aaa-hero p {
    margin: 16px 0 0;
    max-width: 720px;
    color: #e2e8f0;
    font-size: 15px;
    line-height: 1.75;
  }

  .aaa-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .aaa-stat {
    padding: 20px;
    min-height: 112px;
    border-radius: 22px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .aaa-stat span {
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .aaa-stat strong {
    display: block;
    color: #ffffff;
    font-size: 30px;
    line-height: 1;
    font-weight: 950;
  }

  .aaa-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .aaa-alert.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .aaa-alert.error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .aaa-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .aaa-card-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .aaa-card h2 {
    margin: 0;
    color: #0f172a;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .aaa-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .aaa-soft-btn,
  .aaa-actions button {
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .aaa-soft-btn {
    border: 1px solid #e2e8f0;
    padding: 11px 15px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #0f172a;
  }

  .aaa-empty {
    display: grid;
    gap: 8px;
    place-items: center;
    min-height: 260px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 34px;
  }

  .aaa-empty strong {
    color: #0f172a;
    font-size: 18px;
  }

  .aaa-list {
    display: grid;
    gap: 16px;
  }

  .aaa-item {
    padding: 20px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .aaa-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .aaa-badge {
    display: inline-flex;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 950;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .aaa-badge.active,
  .aaa-badge.approved,
  .aaa-badge.paid {
    background: #dcfce7;
    color: #166534;
  }

  .aaa-badge.pending {
    background: #fef3c7;
    color: #92400e;
  }

  .aaa-badge.paused {
    background: #e0f2fe;
    color: #075985;
  }

  .aaa-badge.exhausted,
  .aaa-badge.rejected {
    background: #ffe4e6;
    color: #be123c;
  }

  .aaa-badge.neutral,
  .aaa-badge.type {
    background: #e2e8f0;
    color: #334155;
  }

  .aaa-main {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 16px;
    align-items: start;
  }

  .aaa-main img,
  .aaa-img {
    width: 96px;
    height: 96px;
    border-radius: 18px;
    object-fit: cover;
    background: #0f172a;
    color: #ffffff;
  }

  .aaa-img {
    display: grid;
    place-items: center;
    font-size: 24px;
    font-weight: 950;
  }

  .aaa-main h3 {
    margin: 0;
    color: #0f172a;
    font-size: 20px;
    font-weight: 950;
    letter-spacing: -0.02em;
  }

  .aaa-main p {
    margin: 9px 0 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.7;
  }

  .aaa-owner {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }

  .aaa-metrics {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    margin-top: 18px;
  }

  .aaa-metrics div {
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 12px;
  }

  .aaa-metrics span {
    display: block;
    color: #64748b;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 6px;
  }

  .aaa-metrics strong {
    display: block;
    color: #0f172a;
    font-size: 15px;
    font-weight: 950;
  }

  .aaa-rates {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
    color: #64748b;
    font-size: 12px;
    font-weight: 800;
  }

  .aaa-rejection {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
    font-size: 13px;
    font-weight: 800;
  }

  .aaa-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
  }

  .aaa-actions button {
    border: 1px solid #e2e8f0;
    padding: 10px 15px;
    border-radius: 999px;
    background: #ffffff;
    color: #0f172a;
  }

  .aaa-actions button.approve {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
  }

  .aaa-actions button.reject {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .aaa-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 1100px) {
    .aaa-hero {
      grid-template-columns: 1fr;
    }

    .aaa-metrics {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 700px) {
    .aaa-page {
      padding: 0;
    }

    .aaa-hero,
    .aaa-card {
      border-radius: 20px;
      padding: 20px;
    }

    .aaa-hero h1 {
      font-size: 28px;
    }

    .aaa-stats,
    .aaa-main,
    .aaa-metrics {
      grid-template-columns: 1fr;
    }

    .aaa-main img,
    .aaa-img {
      width: 100%;
      height: 170px;
    }

    .aaa-card-head {
      flex-direction: column;
    }
  }
`;