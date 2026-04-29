import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Video,
  XCircle,
} from 'lucide-react';
import api from '../../api/axios';

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function statusClass(value = '') {
  const status = String(value).toLowerCase();

  if (status === 'active' || status === 'approved') return 'abh-status active';
  if (status === 'pending') return 'abh-status pending';
  if (status === 'paused') return 'abh-status paused';
  if (status === 'rejected') return 'abh-status rejected';
  if (status === 'ended' || status === 'exhausted') return 'abh-status ended';

  return 'abh-status neutral';
}

function mediaPreview(campaign) {
  if (campaign?.media_type === 'video') {
    return campaign?.poster_url || campaign?.image_url || '';
  }

  return campaign?.image_url || campaign?.poster_url || '';
}

export default function AdminBannerHomeAdCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    approval_status: '',
    status: '',
    owner_type: '',
  });

  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedCampaign = useMemo(
    () => campaigns.find((item) => String(item.id) === String(selectedId)) || null,
    [campaigns, selectedId]
  );

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const { data } = await api.get('/api/admin/banner-home-ad-campaigns', {
        params,
      });

      const list = Array.isArray(data?.campaigns) ? data.campaigns : [];

      setCampaigns(list);

      if (!selectedId && list.length) {
        setSelectedId(String(list[0].id));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load banner home ad campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const refreshAfterAction = async (targetId = selectedId) => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    const { data } = await api.get('/api/admin/banner-home-ad-campaigns', {
      params,
    });

    const list = Array.isArray(data?.campaigns) ? data.campaigns : [];
    setCampaigns(list);

    const found = list.find((item) => String(item.id) === String(targetId));

    if (found) {
      setSelectedId(String(found.id));
    } else if (list.length) {
      setSelectedId(String(list[0].id));
    } else {
      setSelectedId('');
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const runAction = async (action) => {
    if (!selectedCampaign?.id) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      let response;

      if (action === 'approve') {
        response = await api.put(`/api/admin/banner-home-ad-campaigns/${selectedCampaign.id}/approve`, {
          admin_note: adminNote,
        });
      }

      if (action === 'reject') {
        if (!rejectionReason.trim()) {
          throw new Error('Rejection reason is required');
        }

        response = await api.put(`/api/admin/banner-home-ad-campaigns/${selectedCampaign.id}/reject`, {
          rejection_reason: rejectionReason,
          admin_note: adminNote,
        });
      }

      if (action === 'pause') {
        response = await api.put(`/api/admin/banner-home-ad-campaigns/${selectedCampaign.id}/pause`);
      }

      if (action === 'resume') {
        response = await api.put(`/api/admin/banner-home-ad-campaigns/${selectedCampaign.id}/resume`);
      }

      await refreshAfterAction(selectedCampaign.id);

      setSuccess(response?.data?.message || 'Campaign updated successfully');
      setAdminNote('');
      setRejectionReason('');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const previewImage = mediaPreview(selectedCampaign);

  return (
    <div className="abh-page">
      <style>{styles}</style>

      <section className="abh-hero">
        <div>
          <span className="abh-badge">Admin Slider Ads</span>
          <h1>Banner Home Ad Campaigns</h1>
          <p>Approve, reject, pause, resume, and monitor paid homepage slider ad campaigns.</p>
        </div>

        <button type="button" className="abh-btn secondary" onClick={fetchCampaigns}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      <section className="abh-filter-bar">
        <label>
          <Search size={16} />
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search title, URL, affiliate..."
          />
        </label>

        <select name="approval_status" value={filters.approval_status} onChange={handleFilterChange}>
          <option value="">All approval</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="daily_paused">Daily paused</option>
          <option value="exhausted">Exhausted</option>
          <option value="ended">Ended</option>
          <option value="rejected">Rejected</option>
        </select>

        <select name="owner_type" value={filters.owner_type} onChange={handleFilterChange}>
          <option value="">All owners</option>
          <option value="affiliate">Affiliate</option>
          <option value="admin">Admin</option>
        </select>

        <button type="button" className="abh-btn primary" onClick={fetchCampaigns}>
          Apply
        </button>
      </section>

      {error ? (
        <div className="abh-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="abh-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="abh-loading">Loading campaigns...</div>
      ) : (
        <>
          <section className="abh-layout">
            <aside className="abh-list-panel">
              <div className="abh-panel-head">
                <p>Campaigns</p>
                <h2>{campaigns.length} results</h2>
              </div>

              {campaigns.length ? (
                <div className="abh-campaign-list">
                  {campaigns.map((campaign) => {
                    const active = String(selectedId) === String(campaign.id);

                    return (
                      <button
                        key={campaign.id}
                        type="button"
                        onClick={() => setSelectedId(String(campaign.id))}
                        className={`abh-campaign-card${active ? ' active' : ''}`}
                      >
                        <div className="abh-campaign-title-row">
                          <strong>{campaign.campaign_title || 'Untitled campaign'}</strong>
                          {campaign.media_type === 'video' ? <Video size={15} /> : <ImageIcon size={15} />}
                        </div>

                        <p>
                          {campaign.affiliate_name || campaign.owner_type || 'Admin'} •{' '}
                          {campaign.website_name || 'Platform'}
                        </p>

                        <div className="abh-mini-row">
                          <span className={statusClass(campaign.status)}>{campaign.status || 'pending'}</span>
                          <span className={statusClass(campaign.approval_status)}>
                            {campaign.approval_status || 'pending'}
                          </span>
                        </div>

                        <div className="abh-metrics">
                          <span>Views {campaign.total_views || 0}</span>
                          <span>Clicks {campaign.total_clicks || 0}</span>
                          <span>Left {money(campaign.remaining_budget)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="abh-empty">No banner home ad campaigns found.</div>
              )}
            </aside>

            <main className="abh-detail-panel">
              {selectedCampaign ? (
                <>
                  <div className="abh-panel-head">
                    <p>Campaign Detail</p>
                    <h2>{selectedCampaign.campaign_title}</h2>
                  </div>

                  <div className="abh-info-grid">
                    <div>
                      <span>Owner</span>
                      <strong>{selectedCampaign.owner_type}</strong>
                    </div>
                    <div>
                      <span>Affiliate</span>
                      <strong>{selectedCampaign.affiliate_name || '-'}</strong>
                    </div>
                    <div>
                      <span>Website</span>
                      <strong>{selectedCampaign.website_name || '-'}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{selectedCampaign.status}</strong>
                    </div>
                    <div>
                      <span>Approval</span>
                      <strong>{selectedCampaign.approval_status}</strong>
                    </div>
                    <div>
                      <span>Budget</span>
                      <strong>{money(selectedCampaign.total_budget)}</strong>
                    </div>
                    <div>
                      <span>Remaining</span>
                      <strong>{money(selectedCampaign.remaining_budget)}</strong>
                    </div>
                    <div>
                      <span>Spent</span>
                      <strong>{money(selectedCampaign.total_spent)}</strong>
                    </div>
                    <div>
                      <span>Cost/View</span>
                      <strong>{money(selectedCampaign.cost_per_view)}</strong>
                    </div>
                    <div>
                      <span>Cost/Click</span>
                      <strong>{money(selectedCampaign.cost_per_click)}</strong>
                    </div>
                    <div>
                      <span>Views</span>
                      <strong>{selectedCampaign.total_views || 0}</strong>
                    </div>
                    <div>
                      <span>Clicks</span>
                      <strong>{selectedCampaign.total_clicks || 0}</strong>
                    </div>
                  </div>

                  <div className="abh-review-box">
                    <label>
                      <span>Admin note</span>
                      <textarea
                        value={adminNote}
                        onChange={(event) => setAdminNote(event.target.value)}
                        placeholder="Optional note"
                        rows={3}
                      />
                    </label>

                    <label>
                      <span>Rejection reason</span>
                      <textarea
                        value={rejectionReason}
                        onChange={(event) => setRejectionReason(event.target.value)}
                        placeholder="Required only when rejecting"
                        rows={3}
                      />
                    </label>

                    <div className="abh-action-row">
                      <button
                        type="button"
                        className="abh-btn approve"
                        disabled={actionLoading}
                        onClick={() => runAction('approve')}
                      >
                        <ShieldCheck size={16} />
                        Approve
                      </button>

                      <button
                        type="button"
                        className="abh-btn reject"
                        disabled={actionLoading}
                        onClick={() => runAction('reject')}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>

                      {selectedCampaign.status === 'active' || selectedCampaign.status === 'daily_paused' ? (
                        <button
                          type="button"
                          className="abh-btn secondary"
                          disabled={actionLoading}
                          onClick={() => runAction('pause')}
                        >
                          <Pause size={16} />
                          Pause
                        </button>
                      ) : null}

                      {selectedCampaign.status === 'paused' ? (
                        <button
                          type="button"
                          className="abh-btn secondary"
                          disabled={actionLoading}
                          onClick={() => runAction('resume')}
                        >
                          <Play size={16} />
                          Resume
                        </button>
                      ) : null}

                      <a
                        href={selectedCampaign.cta_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="abh-btn secondary"
                      >
                        <Eye size={16} />
                        Open Link
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="abh-empty">Select a campaign to review.</div>
              )}
            </main>
          </section>

          {selectedCampaign ? (
            <section className="abh-preview-footer-panel">
              <div className="abh-panel-head">
                <p>Banner Preview</p>
                <h2>Homepage Slider Display</h2>
              </div>

              <div className="abh-footer-preview-card">
                <div className="abh-footer-preview-copy">
                  <span>{selectedCampaign.eyebrow_text || 'Sponsored'}</span>

                  <h3>{selectedCampaign.title || selectedCampaign.campaign_title}</h3>

                  <p>
                    {selectedCampaign.subtitle ||
                      selectedCampaign.campaign_description ||
                      'Campaign subtitle will appear here.'}
                  </p>

                  <div className="abh-footer-preview-actions">
                    <a href={selectedCampaign.cta_url || '#'} target="_blank" rel="noreferrer">
                      {selectedCampaign.cta_label || 'Shop Now'}
                    </a>

                    {selectedCampaign.secondary_cta_label && selectedCampaign.secondary_cta_url ? (
                      <a href={selectedCampaign.secondary_cta_url} target="_blank" rel="noreferrer">
                        {selectedCampaign.secondary_cta_label}
                      </a>
                    ) : null}

                    {selectedCampaign.promo_text ? <strong>{selectedCampaign.promo_text}</strong> : null}
                  </div>
                </div>

                <div className="abh-footer-preview-media">
                  <div className="abh-footer-preview-dot dot-one" />
                  <div className="abh-footer-preview-dot dot-two" />
                  <div className="abh-footer-preview-dot dot-three" />

                  {previewImage ? (
                    <img src={previewImage} alt={selectedCampaign.title || 'Campaign preview'} />
                  ) : (
                    <div className="abh-preview-empty">
                      {selectedCampaign.media_type === 'video' ? <Video size={40} /> : <ImageIcon size={40} />}
                      <span>{selectedCampaign.media_type || 'media'}</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

const styles = `
  .abh-page {
    display: grid;
    gap: 18px;
  }

  .abh-page,
  .abh-page * {
    text-shadow: none !important;
  }

  .abh-hero,
  .abh-filter-bar,
  .abh-list-panel,
  .abh-detail-panel,
  .abh-preview-footer-panel {
    opacity: 1 !important;
    filter: none !important;
  }

  .abh-hero {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
  }

  .abh-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    border-radius: 999px;
    background: #fff7ed !important;
    color: #9a3412 !important;
    border: 1px solid #fed7aa;
    padding: 9px 14px;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    opacity: 1 !important;
    filter: none !important;
    box-shadow: 0 10px 24px rgba(154, 52, 18, 0.08);
  }

  .abh-hero h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 950;
    color: #111827;
    letter-spacing: -0.04em;
  }

  .abh-hero p {
    margin: 10px 0 0;
    color: #64748b;
    line-height: 1.7;
    max-width: 760px;
  }

  .abh-btn {
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 850;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 15px;
    cursor: pointer;
    text-decoration: none;
  }

  .abh-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .abh-btn.approve {
    background: #027a48;
    color: #ffffff;
    border-color: #027a48;
  }

  .abh-btn.reject {
    background: #be123c;
    color: #ffffff;
    border-color: #be123c;
  }

  .abh-btn.secondary {
    background: #ffffff;
    color: #111827;
  }

  .abh-filter-bar {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 14px;
    display: grid;
    grid-template-columns: minmax(260px, 1fr) 170px 170px 150px auto;
    gap: 12px;
  }

  .abh-filter-bar label {
    position: relative;
    display: block;
  }

  .abh-filter-bar label svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }

  .abh-filter-bar input,
  .abh-filter-bar select,
  .abh-review-box textarea {
    width: 100%;
    min-height: 44px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    outline: none;
    color: #111827 !important;
    padding: 0 13px;
    background: #ffffff;
    font-weight: 750;
    opacity: 1 !important;
  }

  .abh-filter-bar input {
    padding-left: 42px;
  }

  .abh-filter-bar input::placeholder,
  .abh-review-box textarea::placeholder {
    color: #64748b;
    opacity: 1;
  }

  .abh-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 16px;
    padding: 14px 16px;
    font-weight: 750;
  }

  .abh-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .abh-alert.success {
    background: #ecfdf3;
    border: 1px solid #abefc6;
    color: #027a48;
  }

  .abh-loading,
  .abh-empty {
    background: #f8fafc !important;
    border: 1px dashed #94a3b8 !important;
    border-radius: 22px;
    padding: 24px;
    color: #111827 !important;
    text-align: center;
    font-size: 14px;
    font-weight: 950;
    line-height: 1.5;
    opacity: 1 !important;
    filter: none !important;
  }

  .abh-layout {
    display: grid;
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .abh-list-panel,
  .abh-detail-panel,
  .abh-preview-footer-panel {
    background: #ffffff !important;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .abh-panel-head {
    margin-bottom: 16px;
  }

  .abh-panel-head p {
    margin: 0 0 6px;
    color: #475569 !important;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    opacity: 1 !important;
  }

  .abh-panel-head h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 950;
    color: #111827 !important;
    opacity: 1 !important;
  }

  .abh-campaign-list {
    display: grid;
    gap: 12px;
    max-height: 760px;
    overflow: auto;
    padding-right: 3px;
  }

  .abh-campaign-card {
    width: 100%;
    text-align: left;
    border: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 18px;
    padding: 15px;
    cursor: pointer;
    display: grid;
    gap: 10px;
    opacity: 1 !important;
    filter: none !important;
  }

  .abh-campaign-card.active {
    background: #ffffff;
    border-color: #111827;
    box-shadow: inset 0 0 0 1px #111827;
  }

  .abh-campaign-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #111827;
  }

  .abh-campaign-title-row strong {
    font-size: 15px;
    line-height: 1.35;
    color: #111827 !important;
    font-weight: 950;
    opacity: 1 !important;
  }

  .abh-campaign-card p {
    margin: 0;
    color: #334155 !important;
    font-size: 13px;
    font-weight: 800;
    opacity: 1 !important;
  }

  .abh-mini-row,
  .abh-metrics,
  .abh-action-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .abh-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    padding: 0 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    text-transform: capitalize;
    border: 1px solid transparent;
    opacity: 1 !important;
  }

  .abh-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .abh-status.pending {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .abh-status.paused {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: #bfdbfe;
  }

  .abh-status.rejected {
    background: #fff1f2;
    color: #be123c;
    border-color: #fecdd3;
  }

  .abh-status.ended,
  .abh-status.neutral {
    background: #f1f5f9;
    color: #475569;
    border-color: #cbd5e1;
  }

  .abh-metrics span {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #334155 !important;
    font-size: 11px;
    font-weight: 900;
    border-radius: 999px;
    padding: 6px 8px;
    opacity: 1 !important;
  }

  .abh-info-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .abh-info-grid div {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    padding: 13px;
    display: grid;
    gap: 6px;
  }

  .abh-info-grid span,
  .abh-review-box label span {
    color: #475569 !important;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .abh-info-grid strong {
    color: #111827 !important;
    font-size: 15px;
    font-weight: 950;
    overflow-wrap: anywhere;
  }

  .abh-review-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 20px;
    padding: 16px;
    display: grid;
    gap: 12px;
  }

  .abh-review-box label {
    display: grid;
    gap: 8px;
  }

  .abh-review-box textarea {
    padding: 12px;
    resize: vertical;
  }

  .abh-footer-preview-card {
    position: relative;
    overflow: hidden;
    min-height: 430px;
    border-radius: 28px;
    display: grid;
    grid-template-columns: 37% 63%;
    align-items: center;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.2), transparent 28%),
      linear-gradient(135deg, #e0b894 0%, #ddb38c 38%, #dcb28b 100%);
  }

  .abh-footer-preview-card::before {
    content: "";
    position: absolute;
    left: -90px;
    top: 60px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.12) 0, rgba(255, 255, 255, 0.12) 22%, transparent 23%),
      radial-gradient(circle, rgba(255, 255, 255, 0.08) 0, rgba(255, 255, 255, 0.08) 38%, transparent 39%),
      radial-gradient(circle, rgba(111, 78, 55, 0.05) 0, rgba(111, 78, 55, 0.05) 54%, transparent 55%);
    pointer-events: none;
    z-index: 1;
  }

  .abh-footer-preview-copy {
    position: relative;
    z-index: 5;
    padding: 46px 26px 46px 58px;
    display: grid;
    align-content: center;
    gap: 16px;
  }

  .abh-footer-preview-copy > span {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.55);
    color: #2d2521;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .abh-footer-preview-copy h3 {
    margin: 0;
    color: #2d2521;
    font-size: clamp(36px, 4.8vw, 72px);
    line-height: 0.96;
    font-weight: 950;
    letter-spacing: -0.06em;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.18) !important;
  }

  .abh-footer-preview-copy p {
    margin: 0;
    max-width: 520px;
    color: rgba(45, 37, 33, 0.92);
    line-height: 1.7;
    font-size: 16px;
    font-weight: 850;
  }

  .abh-footer-preview-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .abh-footer-preview-actions a {
    min-height: 50px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    padding: 0 22px;
    font-size: 13px;
    font-weight: 950;
    text-decoration: none;
    background: #ffffff;
    color: #111827;
  }

  .abh-footer-preview-actions a:nth-child(2) {
    border: 1px solid rgba(17, 24, 39, 0.2);
    background: rgba(255, 255, 255, 0.46);
    color: #2d2521;
  }

  .abh-footer-preview-actions strong {
    color: #2d2521;
    font-size: 34px;
    font-weight: 950;
  }

  .abh-footer-preview-media {
    position: relative;
    z-index: 2;
    min-height: 430px;
    display: grid;
    place-items: center;
    padding: 34px 46px 34px 0;
  }

  .abh-footer-preview-media img,
  .abh-preview-empty {
    position: relative;
    z-index: 4;
    width: min(880px, 94%);
    height: 330px;
    border-radius: 46px;
    object-fit: cover;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.26);
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
  }

  .abh-preview-empty {
    display: grid;
    place-items: center;
    color: rgba(45, 37, 33, 0.9);
    font-weight: 950;
  }

  .abh-footer-preview-dot {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 5;
    background: rgba(70, 51, 38, 0.14);
  }

  .abh-footer-preview-dot.dot-one {
    top: 48px;
    right: 150px;
    width: 76px;
    height: 76px;
  }

  .abh-footer-preview-dot.dot-two {
    right: 56px;
    top: 90px;
    width: 42px;
    height: 42px;
  }

  .abh-footer-preview-dot.dot-three {
    right: 90px;
    bottom: 76px;
    width: 110px;
    height: 110px;
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 1200px) {
    .abh-layout {
      grid-template-columns: 1fr;
    }

    .abh-filter-bar {
      grid-template-columns: 1fr 1fr;
    }

    .abh-info-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .abh-footer-preview-card {
      grid-template-columns: 1fr;
    }

    .abh-footer-preview-copy {
      padding: 34px 28px 12px;
    }

    .abh-footer-preview-media {
      min-height: 320px;
      padding: 18px 28px 34px;
    }

    .abh-footer-preview-media img,
    .abh-preview-empty {
      width: 100%;
      height: 300px;
      border-radius: 34px;
    }
  }

  @media (max-width: 720px) {
    .abh-hero,
    .abh-action-row {
      flex-direction: column;
      align-items: stretch;
    }

    .abh-filter-bar,
    .abh-info-grid {
      grid-template-columns: 1fr;
    }

    .abh-btn {
      width: 100%;
    }

    .abh-footer-preview-copy h3 {
      font-size: 38px;
    }
  }
`;