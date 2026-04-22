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

function StatCard({ label, value, href }) {
  const content = (
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
          fontSize: 34,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#111827',
        }}
      >
        {value}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link
      to={href}
      style={{
        display: 'block',
        textDecoration: 'none',
      }}
    >
      {content}
    </Link>
  );
}

function CustomerSidebar({ customer, onLogout, currentPath }) {
  const links = [
    { label: 'Overview', to: '/customer/dashboard' },
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

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  const token = useMemo(() => getStoredToken(), []);
  const storedUser = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
      return;
    }

    let isMounted = true;

    async function fetchDashboard() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(getApiUrl('/api/customer/dashboard'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to fetch dashboard.');
        }

        if (!isMounted) return;
        setDashboard(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch dashboard.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboard();

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

  const customer = dashboard?.customer || storedUser || null;
  const stats = dashboard?.stats || {
    saved_posts: 0,
    saved_products: 0,
    affiliate_chats: 0,
    admin_chats: 0,
  };
  const registeredAffiliate = dashboard?.registered_under?.affiliate || null;
  const registeredWebsite = dashboard?.registered_under?.website || null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .customer-dashboard-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .customer-dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .customer-dashboard-bottom {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .customer-dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 991px) {
          .customer-dashboard-layout,
          .customer-dashboard-bottom {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .customer-dashboard-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <div className="customer-dashboard-layout">
          <CustomerSidebar
            customer={customer}
            onLogout={handleLogout}
            currentPath="/customer/dashboard"
          />

          <main style={{ display: 'grid', gap: 24 }}>
            <section
              style={{
                borderRadius: 28,
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: 24,
                boxShadow: '0 22px 50px rgba(15, 23, 42, 0.06)',
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
                      background: '#ecfdf5',
                      border: '1px solid #bbf7d0',
                      color: '#166534',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Welcome
                  </div>

                  <h1
                    style={{
                      margin: '14px 0 0',
                      fontSize: 44,
                      fontWeight: 800,
                      letterSpacing: '-0.05em',
                      lineHeight: 1.04,
                      color: '#111827',
                    }}
                  >
                    Your customer space
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
                    Save posts to continue later, bookmark products you like, request direct coupon offers, and chat with affiliates or admin.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/customer/saved-posts" style={primaryBtnStyle}>
                    View Saved Posts
                  </Link>
                  <Link to="/customer/messages" style={secondaryBtnStyle}>
                    Open Messages
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
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  padding: '18px 20px',
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                Loading dashboard...
              </div>
            ) : null}

            <div className="customer-dashboard-stats">
              <StatCard
                label="Saved Posts"
                value={stats.saved_posts || 0}
                href="/customer/saved-posts"
              />
              <StatCard
                label="Saved Products"
                value={stats.saved_products || 0}
                href="/customer/saved-products"
              />
              <StatCard
                label="Affiliate Chats"
                value={stats.affiliate_chats || 0}
                href="/customer/messages"
              />
              <StatCard
                label="Admin Support Chats"
                value={stats.admin_chats || 0}
                href="/customer/messages"
              />
            </div>

            <div className="customer-dashboard-bottom">
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
                  Account summary
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
                    <div style={infoLabelStyle}>Full Name</div>
                    <div style={infoValueStyle}>{customer?.name || '-'}</div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Email</div>
                    <div style={{ ...infoValueStyle, wordBreak: 'break-word' }}>
                      {customer?.email || '-'}
                    </div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Role</div>
                    <div style={infoValueStyle}>{customer?.role || 'customer'}</div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Status</div>
                    <div style={infoValueStyle}>{customer?.status || '-'}</div>
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
                  Registration ownership
                </div>

                <div style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Registered Under Affiliate</div>
                    <div style={infoValueStyle}>
                      {registeredAffiliate?.name || 'Main marketplace signup'}
                    </div>
                    <div style={infoSubTextStyle}>
                      {registeredAffiliate?.email || 'No affiliate ownership'}
                    </div>
                  </div>

                  <div style={infoCardStyle}>
                    <div style={infoLabelStyle}>Registered Storefront</div>
                    <div style={infoValueStyle}>
                      {registeredWebsite?.website_name || 'Main marketplace'}
                    </div>
                    <div style={infoSubTextStyle}>
                      {registeredWebsite?.slug || '-'}
                    </div>
                  </div>

                  <Link to="/customer/settings" style={secondaryFullBtnStyle}>
                    Manage Settings
                  </Link>
                </div>
              </section>
            </div>
          </main>
        </div>
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
  background: '#111827',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 700,
  textDecoration: 'none',
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

const secondaryFullBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
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