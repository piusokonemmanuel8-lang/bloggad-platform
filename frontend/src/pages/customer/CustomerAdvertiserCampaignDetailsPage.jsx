import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem('customerUser') ||
      localStorage.getItem('user') ||
      '';

    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
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

function StatusPill({ value }) {
  const normalized = String(value || 'draft').toLowerCase();

  let bg = '#f3f4f6';
  let color = '#374151';

  if (normalized === 'approved') {
    bg = '#ecfdf5';
    color = '#166534';
  } else if (normalized === 'pending') {
    bg = '#eff6ff';
    color = '#1d4ed8';
  } else if (normalized === 'rejected') {
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

function CustomerSidebar({ customer, onLogout, currentPath }) {
  const links = [
    { label: 'Overview', to: '/customer/dashboard' },
    { label: 'Advertiser', to: '/customer/advertiser' },
    { label: 'Advertiser Profile', to: '/customer/advertiser/profile' },
    { label: 'Advertiser Wallet', to: '/customer/advertiser/wallet' },
    { label: 'Advertiser Campaigns', to: '/customer/advertiser/campaigns' },
    { label: 'Saved Posts', to: '/customer/saved-posts' },
    { label: 'Saved Products', to: '/customer/saved-products' },
    { label: 'Messages', to: '/customer/messages' },
    { label: 'Settings', to: '/customer/settings' },
  ];

  return (
    <aside
      style={{
        borderRadius: 26,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        padding: 20,
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.06)',
        height: 'fit-content',
      }}
    >
      <div
        style={{
          borderRadius: 22,
          border: '1px solid #eef2f7',
          background: '#f8fafc',
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#6b7280',
            marginBottom: 8,
            fontWeight: 800,
          }}
        >
          Customer Dashboard
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#111827',
            lineHeight: 1.15,
          }}
        >
          {customer?.name || 'Customer'}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 14,
            color: '#6b7280',
            wordBreak: 'break-word',
          }}
        >
          {customer?.email || '-'}
        </div>
      </div>

      <nav style={{ marginTop: 18, display: 'grid', gap: 8 }}>
        {links.map((item) => {
          const active = currentPath === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                minHeight: 48,
                borderRadius: 16,
                border: active ? '1px solid #111827' : '1px solid #e5e7eb',
                background: active ? '#111827' : '#ffffff',
                color: active ? '#ffffff' : '#111827',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        style={{
          marginTop: 18,
          width: '100%',
          minHeight: 48,
          borderRadius: 16,
          border: '1px solid #fecaca',
          background: '#fff1f2',
          color: '#be123c',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export default function CustomerAdvertiserCampaignDetailsPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const token = useMemo(() => getStoredToken(), []);
  const storedUser = useMemo(() => getStoredUser(), []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [creatives, setCreatives] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
      return;
    }

    let isMounted = true;

    async function loadCampaign() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          getApiUrl(`/api/customer/advertiser/campaigns/${campaignId}`),
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to load campaign.');
        }

        if (!isMounted) return;
        setCampaign(data?.campaign || null);
        setPlacements(data?.placements || []);
        setCreatives(data?.creatives || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load campaign.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [campaignId, navigate, token]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('user');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerLoginContext');
    navigate('/customer/login', { replace: true });
  }

  async function handleSubmitForReview() {
    if (!campaignId) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        getApiUrl(`/api/customer/advertiser/campaigns/${campaignId}/submit`),
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to submit campaign for review.');
      }

      setCampaign(data?.campaign || campaign);
      setSuccess(data?.message || 'Campaign submitted for review successfully.');
    } catch (err) {
      setError(err.message || 'Failed to submit campaign for review.');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = ['draft', 'rejected', 'paused'].includes(
    String(campaign?.approval_status || '').toLowerCase()
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .customer-advertiser-campaign-details-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .customer-advertiser-campaign-details-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
          gap: 24px;
        }

        .customer-advertiser-campaign-details-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .customer-advertiser-campaign-details-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 991px) {
          .customer-advertiser-campaign-details-layout,
          .customer-advertiser-campaign-details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .customer-advertiser-campaign-details-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <div className="customer-advertiser-campaign-details-layout">
          <CustomerSidebar
            customer={storedUser}
            onLogout={handleLogout}
            currentPath="/customer/advertiser/campaigns"
          />

          <main style={{ display: 'grid', gap: 24 }}>
            <section
              style={{
                borderRadius: 28,
                border: '1px solid #dbeafe',
                background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                padding: 24,
                boxShadow: '0 22px 50px rgba(59, 130, 246, 0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: '#dbeafe',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Campaign Details
                  </div>

                  <h1
                    style={{
                      margin: '14px 0 0',
                      fontSize: 38,
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
                      marginTop: 12,
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <StatusPill value={campaign?.approval_status || 'draft'} />
                    <StatusPill value={campaign?.delivery_status || 'not_started'} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/customer/advertiser/campaigns" style={secondaryBtnStyle}>
                    Back to Campaigns
                  </Link>
                  <Link
                    to={`/customer/advertiser/campaigns/${campaignId}/creatives`}
                    style={secondaryBtnStyle}
                  >
                    Manage Creatives
                  </Link>
                  {canSubmit ? (
                    <button
                      type="button"
                      onClick={handleSubmitForReview}
                      disabled={submitting}
                      style={primaryBtnStyle}
                    >
                      {submitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  ) : null}
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
                Loading campaign details...
              </div>
            ) : null}

            <div className="customer-advertiser-campaign-details-stats">
              <SummaryCard label="Budget" value={formatMoney(campaign?.budget_total || 0)} />
              <SummaryCard label="Spent" value={formatMoney(campaign?.spent_amount || 0)} />
              <SummaryCard label="Clicks" value={campaign?.clicks_count || 0} />
              <SummaryCard label="Impressions" value={campaign?.impressions_count || 0} />
            </div>

            <div className="customer-advertiser-campaign-details-grid">
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
                  Campaign information
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: 'grid',
                    gap: 16,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  }}
                >
                  <InfoCard label="Campaign Type" value={campaign?.campaign_type || '-'} />
                  <InfoCard label="Buying Model" value={campaign?.buying_model || '-'} />
                  <InfoCard label="Objective" value={campaign?.objective || '-'} />
                  <InfoCard label="CTA" value={campaign?.call_to_action || '-'} />
                  <InfoCard label="Headline" value={campaign?.headline || '-'} />
                  <InfoCard label="Display URL" value={campaign?.display_url || '-'} />
                  <InfoCard
                    label="Destination URL"
                    value={campaign?.destination_url || '-'}
                    breakWord
                  />
                  <InfoCard label="Daily Budget" value={formatMoney(campaign?.budget_daily || 0)} />
                  <InfoCard label="Bid Amount" value={formatMoney(campaign?.bid_amount || 0)} />
                </div>

                <div style={{ marginTop: 16 }}>
                  <InfoCard
                    label="Description"
                    value={campaign?.description_text || 'No description'}
                  />
                </div>
              </section>

              <section
                style={{
                  display: 'grid',
                  gap: 24,
                }}
              >
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
                    Placements
                  </div>

                  <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
                    {placements.length ? (
                      placements.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            borderRadius: 16,
                            border: '1px solid #e5e7eb',
                            background: '#f8fafc',
                            padding: 14,
                          }}
                        >
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                            {item?.placement_key || '-'}
                          </div>
                          <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>
                            {item?.page_type || 'storefront'} • {item?.target_mode || 'all'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          borderRadius: 16,
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc',
                          padding: 14,
                          color: '#6b7280',
                          fontSize: 14,
                        }}
                      >
                        No placements yet.
                      </div>
                    )}
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
                    Creatives
                  </div>

                  <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
                    {creatives.length ? (
                      creatives.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            borderRadius: 16,
                            border: '1px solid #e5e7eb',
                            background: '#f8fafc',
                            padding: 14,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 12,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                                {item?.headline || item?.creative_type || 'Creative'}
                              </div>
                              <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>
                                {item?.creative_type || '-'}
                              </div>
                            </div>

                            <StatusPill value={item?.approval_status || 'draft'} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          borderRadius: 16,
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc',
                          padding: 14,
                          color: '#6b7280',
                          fontSize: 14,
                        }}
                      >
                        No creatives yet.
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Link
                      to={`/customer/advertiser/campaigns/${campaignId}/creatives`}
                      style={secondaryBtnStyle}
                    >
                      Open Creatives Page
                    </Link>
                  </div>
                </section>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: '1px solid #dbeafe',
        background: '#ffffff',
        padding: 20,
        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.06)',
      }}
    >
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 30,
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
  textDecoration: 'none',
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