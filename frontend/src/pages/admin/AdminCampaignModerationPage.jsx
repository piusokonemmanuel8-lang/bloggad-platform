import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

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

function StatusPill({ value }) {
  const normalized = String(value || 'draft').toLowerCase();

  let bg = '#f3f4f6';
  let color = '#374151';

  if (normalized === 'approved' || normalized === 'paid') {
    bg = '#ecfdf5';
    color = '#166534';
  } else if (normalized === 'pending') {
    bg = '#eff6ff';
    color = '#1d4ed8';
  } else if (normalized === 'rejected' || normalized === 'failed') {
    bg = '#fff1f2';
    color = '#be123c';
  } else if (normalized === 'paused') {
    bg = '#fff7ed';
    color = '#c2410c';
  }

  return (
    <span
      style={{
        minHeight: 32,
        padding: '0 12px',
        borderRadius: 999,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {value || 'draft'}
    </span>
  );
}

function SummaryCard({ label, value, subtext }) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        padding: 20,
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#111827',
        }}
      >
        {value}
      </div>
      {subtext ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: '#6b7280',
            lineHeight: 1.7,
          }}
        >
          {subtext}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminCampaignModerationPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const hasToken = useMemo(() => {
    return !!(
      localStorage.getItem('bloggad_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken')
    );
  }, []);

  useEffect(() => {
    if (!hasToken) {
      navigate('/login', { replace: true });
    }
  }, [hasToken, navigate]);

  async function loadCampaigns(currentStatus = status, currentSearch = search) {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);
      if (currentSearch) params.set('search', currentSearch);

      const { data } = await api.get(
        `/api/admin/advertiser-campaigns${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load campaigns.');
      }

      setCampaigns(data?.campaigns || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load campaigns.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasToken) {
      loadCampaigns('', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  async function handleApprove(campaignId) {
    setActingId(campaignId);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-campaigns/${campaignId}/approve`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to approve campaign.');
      }

      setSuccess(data?.message || 'Campaign approved successfully.');
      await loadCampaigns(status, search);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve campaign.');
    } finally {
      setActingId(null);
    }
  }

  async function handlePause(campaignId) {
    setActingId(campaignId);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-campaigns/${campaignId}/pause`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to pause campaign.');
      }

      setSuccess(data?.message || 'Campaign paused successfully.');
      await loadCampaigns(status, search);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to pause campaign.');
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(campaignId) {
    const rejectionReason = window.prompt('Enter rejection reason');
    if (!rejectionReason) return;

    setActingId(campaignId);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-campaigns/${campaignId}/reject`, {
        rejection_reason: rejectionReason,
      });

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to reject campaign.');
      }

      setSuccess(data?.message || 'Campaign rejected successfully.');
      await loadCampaigns(status, search);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reject campaign.');
    } finally {
      setActingId(null);
    }
  }

  const stats = useMemo(() => {
    const pending = campaigns.filter((item) => item?.approval_status === 'pending').length;
    const approved = campaigns.filter((item) => item?.approval_status === 'approved').length;
    const rejected = campaigns.filter((item) => item?.approval_status === 'rejected').length;
    const paused = campaigns.filter((item) => item?.approval_status === 'paused').length;

    return { pending, approved, rejected, paused };
  }, [campaigns]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .admin-campaign-moderation-top {
          display: flex;
          gap: 16px;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .admin-campaign-moderation-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .admin-campaign-moderation-filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px 160px;
          gap: 12px;
        }

        @media (max-width: 1100px) {
          .admin-campaign-moderation-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-campaign-moderation-filters {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .admin-campaign-moderation-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1380, margin: '0 auto', display: 'grid', gap: 24 }}>
        <section
          style={{
            borderRadius: 28,
            border: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: 24,
            boxShadow: '0 22px 50px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div className="admin-campaign-moderation-top">
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Campaign Moderation
              </div>

              <h1
                style={{
                  margin: '14px 0 0',
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 1.04,
                  color: '#111827',
                }}
              >
                Moderate customer ad campaigns
              </h1>

              <p
                style={{
                  margin: '12px 0 0',
                  maxWidth: 860,
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: '#6b7280',
                }}
              >
                Review campaigns created by customers, approve them to go live, reject them with a
                reason, or pause active campaigns. Once approved, they can serve through the
                affiliate ad slots when toggled on.
              </p>
            </div>

            <Link to="/admin/dashboard" style={secondaryBtnStyle}>
              Back to Admin
            </Link>
          </div>
        </section>

        {error ? (
          <div
            style={{
              borderRadius: 20,
              border: '1px solid #fecaca',
              background: '#fff1f2',
              padding: '16px 18px',
              fontSize: 14,
              color: '#be123c',
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              borderRadius: 20,
              border: '1px solid #bbf7d0',
              background: '#ecfdf5',
              padding: '16px 18px',
              fontSize: 14,
              color: '#166534',
            }}
          >
            {success}
          </div>
        ) : null}

        <div className="admin-campaign-moderation-stats">
          <SummaryCard label="Pending" value={stats.pending} />
          <SummaryCard label="Approved" value={stats.approved} />
          <SummaryCard label="Rejected" value={stats.rejected} />
          <SummaryCard label="Paused" value={stats.paused} />
        </div>

        <section
          style={{
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: 20,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div className="admin-campaign-moderation-filters">
            <input
              type="text"
              placeholder="Search by campaign, business, customer, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="paused">paused</option>
              <option value="draft">draft</option>
            </select>

            <button
              type="button"
              onClick={() => loadCampaigns(status, search)}
              style={primaryBtnStyle}
            >
              Filter
            </button>
          </div>
        </section>

        <section
          style={{
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: 20,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#111827',
            }}
          >
            Campaigns
          </div>

          {loading ? (
            <div
              style={{
                marginTop: 20,
                borderRadius: 18,
                border: '1px solid #e5e7eb',
                background: '#f8fafc',
                padding: 16,
                color: '#6b7280',
                fontSize: 14,
              }}
            >
              Loading campaigns...
            </div>
          ) : (
            <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
              {campaigns.length ? (
                campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    style={{
                      borderRadius: 18,
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#111827',
                          }}
                        >
                          {campaign?.campaign_name || 'Untitled Campaign'}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 14,
                            color: '#6b7280',
                            lineHeight: 1.7,
                          }}
                        >
                          {campaign?.business_name || campaign?.contact_name || 'Unknown business'}{' '}
                          • {campaign?.user_name || '-'} • {campaign?.user_email || '-'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <StatusPill value={campaign?.approval_status || 'draft'} />
                        <StatusPill value={campaign?.delivery_status || 'not_started'} />
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 12,
                      }}
                    >
                      <InfoCard label="Type" value={campaign?.campaign_type || '-'} />
                      <InfoCard label="Model" value={campaign?.buying_model || '-'} />
                      <InfoCard label="Budget" value={formatMoney(campaign?.budget_total || 0)} />
                      <InfoCard label="Spent" value={formatMoney(campaign?.spent_amount || 0)} />
                      <InfoCard label="Clicks" value={campaign?.clicks_count || 0} />
                      <InfoCard
                        label="Impressions"
                        value={campaign?.impressions_count || 0}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Link
                        to={`/admin/campaign-moderation/${campaign.id}`}
                        style={secondaryBtnStyle}
                      >
                        Open
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleApprove(campaign.id)}
                        disabled={actingId === campaign.id}
                        style={greenBtnStyle}
                      >
                        {actingId === campaign.id ? 'Working...' : 'Approve'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(campaign.id)}
                        disabled={actingId === campaign.id}
                        style={dangerBtnStyle}
                      >
                        {actingId === campaign.id ? 'Working...' : 'Reject'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePause(campaign.id)}
                        disabled={actingId === campaign.id}
                        style={warningBtnStyle}
                      >
                        {actingId === campaign.id ? 'Working...' : 'Pause'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    borderRadius: 18,
                    border: '1px solid #e5e7eb',
                    background: '#f8fafc',
                    padding: 16,
                    color: '#6b7280',
                    fontSize: 14,
                  }}
                >
                  No campaigns found.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: '#6b7280',
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 15,
          fontWeight: 600,
          color: '#111827',
        }}
      >
        {value}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  minHeight: 52,
  borderRadius: 16,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  padding: '0 16px',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: 'none',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  fontSize: 14,
  fontWeight: 700,
  textDecoration: 'none',
};

const greenBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid #bbf7d0',
  background: '#ecfdf5',
  color: '#166534',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const dangerBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#be123c',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const warningBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid #fed7aa',
  background: '#fff7ed',
  color: '#c2410c',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};