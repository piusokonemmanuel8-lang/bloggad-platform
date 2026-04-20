import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  LayoutTemplate,
  CreditCard,
  ShieldCheck,
  Box,
  FileText,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const adminMenu = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Affiliates', to: '/admin/affiliates', icon: Users },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree },
  { label: 'Templates', to: '/admin/templates', icon: LayoutTemplate },
  { label: 'Plans', to: '/admin/plans', icon: CreditCard },
  { label: 'Products', to: '/admin/products', icon: Box },
  { label: 'Posts', to: '/admin/posts', icon: FileText },
  { label: 'Link Validation', to: '/admin/link-validation', icon: ShieldCheck },
];

function isActivePath(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, bootstrapping, user, logout } = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const pageTitle = useMemo(() => {
    const current = adminMenu.find((item) => isActivePath(location.pathname, item.to));
    return current?.label || 'Administrator';
  }, [location.pathname]);

  if (bootstrapping) {
    return (
      <div
        className="admin-wp-shell"
        style={{
          minHeight: '100vh',
          background: '#f1f1f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1f2937',
        }}
      >
        Loading administrator...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const sidebarVisible = isDesktop || mobileOpen;

  return (
    <div className="admin-wp-shell" style={{ minHeight: '100vh', background: '#f1f1f1' }}>
      {!isDesktop && mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            border: 0,
            zIndex: 99,
            cursor: 'pointer',
          }}
        />
      ) : null}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          background: '#1d2327',
          color: '#f0f0f1',
          borderRight: '1px solid #101517',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <div
          style={{
            padding: '22px 22px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: 8,
                }}
              >
                Bloggad Admin
              </div>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                Main Menu
              </div>
            </div>

            {!isDesktop ? (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        </div>

        <div style={{ padding: '10px 0', overflowY: 'auto', flex: 1 }}>
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(location.pathname, item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (!isDesktop) setMobileOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 22px',
                  color: active ? '#72aee6' : '#f0f0f1',
                  background: active ? '#2c3338' : 'transparent',
                  borderLeft: active ? '3px solid #72aee6' : '3px solid transparent',
                  fontWeight: active ? 700 : 500,
                  fontSize: 16,
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div
          style={{
            padding: 18,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              marginBottom: 14,
              padding: 14,
              borderRadius: 10,
              background: '#23282d',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.45)',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Signed in as
            </div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{user?.name || 'Administrator'}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', wordBreak: 'break-word' }}>
              {user?.email || '-'}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#2c3338',
              color: '#fff',
              borderRadius: 10,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div
        className="admin-wp-shell"
        style={{
          marginLeft: isDesktop ? 280 : 0,
          minHeight: '100vh',
          transition: 'margin-left 0.25s ease',
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: '#ffffff',
            borderBottom: '1px solid #dcdcde',
            padding: '14px 26px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {!isDesktop ? (
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: '1px solid #dcdcde',
                    background: '#fff',
                    color: '#1d2327',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Menu size={18} />
                </button>
              ) : null}

              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#646970',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                    fontWeight: 700,
                  }}
                >
                  Admin Panel
                </div>
                <div
                  style={{
                    fontSize: 26,
                    lineHeight: 1.15,
                    fontWeight: 700,
                    color: '#1d2327',
                  }}
                >
                  {pageTitle}
                </div>
              </div>
            </div>

            <div
              style={{
                display: isDesktop ? 'block' : 'none',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Administrator</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1d2327',
                  maxWidth: 260,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email || user?.name || 'Admin'}
              </div>
            </div>
          </div>
        </header>

        <main style={{ padding: 26 }}>
          <div style={{ width: '100%', maxWidth: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}