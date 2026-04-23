import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function AdminCampaignModerationDetailsPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [creatives, setCreatives] = useState([]);

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

  async function loadCampaign() {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(`/api/admin/advertiser-campaigns/${campaignId}`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load campaign.');
      }

      setCampaign(data?.campaign || null);
      setPlacements(data?.placements || []);
      setCreatives(data?.creatives || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load campaign.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasToken && campaignId) {
      loadCampaign();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken, campaignId]);

  async function handleApprove() {
    setActing(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-campaigns/${campaignId}/approve`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to approve campaign.');
      }

      setSuccess(data?.message || 'Campaign approved successfully.');
      await loadCampaign();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve campaign.');
    } finally {
      setActing(false);
    }
  }

  async function handlePause() {
    setActing(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-campaigns/${campaignId}/pause`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to pause campaign.');
      }

      setSuccess(data?.message || 'Campaign paused successfully.');
      await loadCampaign();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to pause campaign.');
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    const rejectionReason = window.prompt('Enter rejection reason');
    if (!rejectionReason) return;

    setActing(true);
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
      await loadCampaign();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reject campaign.');
    } finally {
      setActing(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .admin-campaign-detail-top {
          display: flex;
          gap: 16px;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .admin-campaign-detail-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .admin-campaign-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .admin-campaign-detail-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-campaign-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .admin-campaign-detail-stats {
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
          <div className="admin-campaign-detail-top">
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
                Campaign Review
              </div>

              <h1
                style={{
                  margin: '14px 0 0',
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 1.04,
                  color: '#111827',
                }}
              >
                {campaign?.campaign_name || 'Campaign'}
              </h1>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <StatusPill value={campaign?.approval_status || 'draft'} />
                <StatusPill value={campaign?.delivery_status || 'not_started'} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/admin/campaign-moderation" style={secondaryBtnStyle}>
                Back
              </Link>
              <button type="button" onClick={handleApprove} disabled={acting} style={greenBtnStyle}>
                {acting ? 'Working...' : 'Approve'}
              </button>
              <button type="button" onClick={handleReject} disabled={acting} style={dangerBtnStyle}>
                {acting ? 'Working...' : 'Reject'}
              </button>
              <button type="button" onClick={handlePause} disabled={acting} style={warningBtnStyle}>
                {acting ? 'Working...' : 'Pause'}
              </button>
            </div>
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

        {loading ? (
          <div
            style={{
              borderRadius: 20,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '18px 20px',
              fontSize: 14,
              color: '#6b7280',
            }}
          >
            Loading campaign...
          </div>
        ) : (
          <>
            <div className="admin-campaign-detail-stats">
              <SummaryCard label="Budget" value={formatMoney(campaign?.budget_total || 0)} />
              <SummaryCard label="Spent" value={formatMoney(campaign?.spent_amount || 0)} />
              <SummaryCard label="Clicks" value={campaign?.clicks_count || 0} />
              <SummaryCard label="Impressions" value={campaign?.impressions_count || 0} />
            </div>

            <div className="admin-campaign-detail-grid">
              <section
                style={{
                  borderRadius: 24,
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  padding: 20,
                  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
                  display: 'grid',
                  gap: 24,
                }}
              >
                <div>
                  <div style={sectionTitleStyle}>Customer and business</div>
                  <div style={infoGridStyle}>
                    <InfoCard label="Customer Name" value={campaign?.user_name || '-'} />
                    <InfoCard label="Customer Email" value={campaign?.user_email || '-'} />
                    <InfoCard label="Business Name" value={campaign?.business_name || '-'} />
                    <InfoCard label="Contact Email" value={campaign?.contact_email || '-'} />
                  </div>
                </div>

                <div>
                  <div style={sectionTitleStyle}>Campaign info</div>
                  <div style={infoGridStyle}>
                    <InfoCard label="Type" value={campaign?.campaign_type || '-'} />
                    <InfoCard label="Model" value={campaign?.buying_model || '-'} />
                    <InfoCard label="Objective" value={campaign?.objective || '-'} />
                    <InfoCard label="CTA" value={campaign?.call_to_action || '-'} />
                    <InfoCard label="Headline" value={campaign?.headline || '-'} />
                    <InfoCard label="Display URL" value={campaign?.display_url || '-'} />
                    <InfoCard
                      label="Destination URL"
                      value={campaign?.destination_url || '-'}
                      breakWord
                    />
                    <InfoCard
                      label="Rejection Reason"
                      value={campaign?.rejection_reason || '-'}
                    />
                  </div>
                </div>

                <div>
                  <div style={sectionTitleStyle}>Placements</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {placements.length ? (
                      placements.map((item) => (
                        <div key={item.id} style={listCardStyle}>
                          <div style={listTitleStyle}>{item?.placement_key || '-'}</div>
                          <div style={listSubStyle}>
                            {item?.page_type || 'storefront'} • {item?.target_mode || 'all'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={emptyStateStyle}>No placements found.</div>
                    )}
                  </div>
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
                <div style={sectionTitleStyle}>Creatives</div>
                <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
                  {creatives.length ? (
                    creatives.map((item) => (
                      <div key={item.id} style={listCardStyle}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          <div>
                            <div style={listTitleStyle}>
                              {item?.headline || item?.creative_type || 'Creative'}
                            </div>
                            <div style={listSubStyle}>
                              {item?.creative_type || '-'}{' '}
                              {Number(item?.is_primary) === 1 ? '• primary' : ''}
                            </div>
                          </div>
                          <StatusPill value={item?.approval_status || 'draft'} />
                        </div>

                        {item?.asset_url ? (
                          <div
                            style={{
                              marginTop: 12,
                              borderRadius: 14,
                              overflow: 'hidden',
                              border: '1px solid #e5e7eb',
                              background: '#ffffff',
                            }}
                          >
                            <img
                              src={item.asset_url}
                              alt={item?.alt_text || item?.headline || 'Creative'}
                              style={{
                                width: '100%',
                                height: 180,
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          </div>
                        ) : null}

                        {item?.body_text ? (
                          <div
                            style={{
                              marginTop: 12,
                              color: '#6b7280',
                              fontSize: 14,
                              lineHeight: 1.7,
                            }}
                          >
                            {item.body_text}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div style={emptyStateStyle}>No creatives found.</div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
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
    </div>
  );
}

function InfoCard({ label, value, breakWord = false }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        background: '#f8fafc',
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
          wordBreak: breakWord ? 'break-word' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}

const sectionTitleStyle = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: '-0.03em',
  color: '#111827',
  marginBottom: 16,
};

const infoGridStyle = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
};

const listCardStyle = {
  borderRadius: 18,
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  padding: 16,
};

const listTitleStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: '#111827',
};

const listSubStyle = {
  marginTop: 6,
  fontSize: 14,
  color: '#6b7280',
};

const emptyStateStyle = {
  borderRadius: 18,
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  padding: 16,
  color: '#6b7280',
  fontSize: 14,
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