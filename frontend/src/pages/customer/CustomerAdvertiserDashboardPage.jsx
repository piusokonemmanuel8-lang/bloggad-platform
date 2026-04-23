import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

function CustomerSidebar({ customer, onLogout, currentPath }) {
  const links = [
    { label: 'Overview', to: '/customer/dashboard' },
    { label: 'Advertiser', to: '/customer/advertiser' },
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

function SummaryCard({ label, value, subtext }) {
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

export default function CustomerAdvertiserDashboardPage() {
  const navigate = useNavigate();
  const token = useMemo(() => getStoredToken(), []);
  const storedUser = useMemo(() => getStoredUser(), []);

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

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('user');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerLoginContext');
    navigate('/customer/login', { replace: true });
  }

  const customer = storedUser || null;

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .customer-advertiser-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .customer-advertiser-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .customer-advertiser-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .customer-advertiser-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 991px) {
          .customer-advertiser-layout,
          .customer-advertiser-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .customer-advertiser-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <div className="customer-advertiser-layout">
          <CustomerSidebar
            customer={customer}
            onLogout={handleLogout}
            currentPath="/customer/advertiser"
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
                    Advertiser Dashboard
                  </div>

                  <h1
                    style={{
                      margin: '14px 0 0',
                      fontSize: 42,
                      fontWeight: 800,
                      letterSpacing: '-0.05em',
                      lineHeight: 1.04,
                      color: '#111827',
                    }}
                  >
                    Manage campaigns from your customer account
                  </h1>

                  <p
                    style={{
                      margin: '12px 0 0',
                      maxWidth: 760,
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: '#6b7280',
                    }}
                  >
                    This is your advertiser area for wallet funding, campaign management, creative submission, and review tracking.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/customer/dashboard" style={secondaryBtnStyle}>
                    Back to Customer
                  </Link>
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

            {loading ? (
              <div
                style={{
                  borderRadius: 20,
                  border: '1px solid #dbeafe',
                  background: '#ffffff',
                  padding: '18px 20px',
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                Loading advertiser dashboard...
              </div>
            ) : null}

            <div className="customer-advertiser-stats">
              <SummaryCard
                label="Available Balance"
                value={formatMoney(
                  wallet?.available_balance || 0,
                  wallet?.currency_code || 'USD'
                )}
                subtext="Balance available for campaigns"
              />
              <SummaryCard
                label="Total Campaigns"
                value={stats.totalCampaigns}
                subtext="All campaigns on this account"
              />
              <SummaryCard
                label="Approved Campaigns"
                value={stats.approvedCampaigns}
                subtext="Campaigns ready to run"
              />
              <SummaryCard
                label="Pending Review"
                value={stats.pendingCampaigns}
                subtext="Waiting for admin approval"
              />
            </div>

            <div className="customer-advertiser-grid">
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
                  Advertiser profile
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: 'grid',
                    gap: 16,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  }}
                >
                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Business Name</div>
                    <div style={infoValueStyle}>{profile?.business_name || 'Not set yet'}</div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Brand Name</div>
                    <div style={infoValueStyle}>{profile?.brand_name || 'Not set yet'}</div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Business Type</div>
                    <div style={infoValueStyle}>{profile?.business_type || 'individual'}</div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Verification</div>
                    <div style={infoValueStyle}>
                      {profile?.verification_status || 'unverified'}
                    </div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Contact Name</div>
                    <div style={infoValueStyle}>
                      {profile?.contact_name || customer?.name || '-'}
                    </div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Contact Email</div>
                    <div style={{ ...infoValueStyle, wordBreak: 'break-word' }}>
                      {profile?.contact_email || customer?.email || '-'}
                    </div>
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
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: '#111827',
                  }}
                >
                  Wallet summary
                </div>

                <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Available Balance</div>
                    <div style={infoValueStyle}>
                      {formatMoney(wallet?.available_balance || 0, wallet?.currency_code || 'USD')}
                    </div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Locked Balance</div>
                    <div style={infoValueStyle}>
                      {formatMoney(wallet?.locked_balance || 0, wallet?.currency_code || 'USD')}
                    </div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Total Funded</div>
                    <div style={infoValueStyle}>
                      {formatMoney(wallet?.total_funded || 0, wallet?.currency_code || 'USD')}
                    </div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Paid Funding Requests</div>
                    <div style={infoValueStyle}>{stats.paidPayments}</div>
                  </div>
                </div>
              </section>
            </div>

            <div className="customer-advertiser-grid">
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

                <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                  {campaigns.length ? (
                    campaigns.slice(0, 8).map((campaign) => (
                      <div
                        key={campaign.id}
                        style={{
                          borderRadius: 18,
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc',
                          padding: 16,
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
                            <div style={infoValueStyle}>
                              {campaign?.campaign_name || 'Untitled Campaign'}
                            </div>
                            <div style={infoSubTextStyle}>
                              {campaign?.campaign_type || 'banner'} • {campaign?.buying_model || 'cpc'}
                            </div>
                          </div>

                          <StatusPill value={campaign?.approval_status || 'draft'} />
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={infoLabelStyle}>Budget</div>
                            <div style={infoValueStyle}>
                              {formatMoney(campaign?.budget_total || 0, wallet?.currency_code || 'USD')}
                            </div>
                          </div>

                          <div>
                            <div style={infoLabelStyle}>Spent</div>
                            <div style={infoValueStyle}>
                              {formatMoney(campaign?.spent_amount || 0, wallet?.currency_code || 'USD')}
                            </div>
                          </div>

                          <div>
                            <div style={infoLabelStyle}>Clicks</div>
                            <div style={infoValueStyle}>{campaign?.clicks_count || 0}</div>
                          </div>

                          <div>
                            <div style={infoLabelStyle}>Impressions</div>
                            <div style={infoValueStyle}>{campaign?.impressions_count || 0}</div>
                          </div>
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
                      No campaigns yet.
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
                  Recent funding requests
                </div>

                <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                  {payments.length ? (
                    payments.slice(0, 8).map((payment) => (
                      <div
                        key={payment.id}
                        style={{
                          borderRadius: 18,
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc',
                          padding: 16,
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
                            <div style={infoValueStyle}>
                              {formatMoney(
                                payment?.amount || 0,
                                payment?.currency_code || wallet?.currency_code || 'USD'
                              )}
                            </div>
                            <div style={infoSubTextStyle}>
                              {payment?.provider_name || payment?.payment_method || 'manual'}
                            </div>
                          </div>

                          <StatusPill value={payment?.payment_status || 'pending'} />
                        </div>

                        <div style={{ marginTop: 10, color: '#6b7280', fontSize: 13 }}>
                          {payment?.provider_reference || 'No payment reference'}
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
                      No funding requests yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

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

const infoCardStyle = {
  borderRadius: 18,
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  padding: 16,
};

const infoLabelStyle = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: '#6b7280',
  fontWeight: 800,
};

const infoValueStyle = {
  marginTop: 10,
  fontSize: 15,
  fontWeight: 600,
  color: '#111827',
};

const infoSubTextStyle = {
  marginTop: 6,
  fontSize: 14,
  color: '#6b7280',
};