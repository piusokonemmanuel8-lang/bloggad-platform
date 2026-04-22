import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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

const links = [
  { label: 'Overview', to: '/customer/dashboard' },
  { label: 'Saved Posts', to: '/customer/saved-posts' },
  { label: 'Saved Products', to: '/customer/saved-products' },
  { label: 'Messages', to: '/customer/messages' },
  { label: 'Settings', to: '/customer/settings' },
];

export default function CustomerPageShell({
  currentPath,
  badge = 'Customer Area',
  title = 'Customer Dashboard',
  subtitle = '',
  headerRight = null,
  children,
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const customer = useMemo(() => getStoredUser(), []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('user');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerLoginContext');
    navigate('/customer/login', { replace: true });
  }

  const sidebar = (
    <aside
      style={{
        borderRadius: 24,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        padding: 20,
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
        height: 'fit-content',
      }}
    >
      <div
        style={{
          borderRadius: 20,
          border: '1px solid #eef2f7',
          background: '#f8fafc',
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: '#6b7280',
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Customer Dashboard
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
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
              onClick={() => setMobileOpen(false)}
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
        onClick={handleLogout}
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .customer-shell-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .customer-shell-mobile-topbar {
          display: none;
        }

        @media (max-width: 991px) {
          .customer-shell-layout {
            grid-template-columns: 1fr;
          }

          .customer-shell-desktop-sidebar {
            display: none;
          }

          .customer-shell-mobile-topbar {
            display: flex;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <div
          className="customer-shell-mobile-topbar"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 16,
            borderRadius: 20,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: 14,
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#6b7280',
                fontWeight: 800,
              }}
            >
              Customer Menu
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 16,
                fontWeight: 800,
                color: '#111827',
              }}
            >
              {customer?.name || 'Customer'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#111827',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>
        </div>

        {mobileOpen ? (
          <>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                border: 0,
                background: 'rgba(15, 23, 42, 0.35)',
                zIndex: 70,
                cursor: 'pointer',
              }}
              aria-label="Close menu backdrop"
            />

            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: 'min(320px, calc(100% - 40px))',
                background: '#f8fafc',
                padding: 16,
                overflowY: 'auto',
                zIndex: 71,
                boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#111827',
                  }}
                >
                  Menu
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#111827',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {sidebar}
            </div>
          </>
        ) : null}

        <div className="customer-shell-layout">
          <div className="customer-shell-desktop-sidebar">{sidebar}</div>

          <main style={{ display: 'grid', gap: 24 }}>
            <section
              style={{
                borderRadius: 28,
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: 24,
                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.05)',
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
                    {badge}
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
                    {title}
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
                    {subtitle}
                  </p>
                </div>

                {headerRight ? <div>{headerRight}</div> : null}
              </div>
            </section>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}