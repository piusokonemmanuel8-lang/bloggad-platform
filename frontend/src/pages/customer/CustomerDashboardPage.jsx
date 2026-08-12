import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import {
  Bell,
  Bookmark,
  CircleDollarSign,
  Crown,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  Megaphone,
  MessageCircle,
  Settings,
  ShoppingBag,
  Sparkles,
  Tags,
  UserRoundCheck,
  X,
} from 'lucide-react';

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

function labelize(value, fallback = '-') {
  const text = String(value || '').trim();
  if (!text) return fallback;
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusPill({ value, tone }) {
  const normalized = String(value || '').trim().toLowerCase();
  const stateTone =
    tone ||
    (['active', 'approved', 'verified', 'paid', 'completed'].includes(normalized)
      ? 'good'
      : ['pending', 'review', 'under review', 'processing'].includes(normalized)
        ? 'warn'
        : ['rejected', 'failed', 'suspended', 'inactive'].includes(normalized)
          ? 'bad'
          : 'neutral');

  return (
    <span className={`reader-dashboard-pill ${stateTone}`}>
      {labelize(value, 'Not set')}
    </span>
  );
}

function MetricCard({ label, value, helper, to }) {
  const content = (
    <>
      <span className="reader-dashboard-metric-label">{label}</span>
      <strong>{value}</strong>
      <span className="reader-dashboard-metric-helper">{helper}</span>
    </>
  );

  return to ? (
    <Link className="reader-dashboard-metric" to={to}>
      {content}
    </Link>
  ) : (
    <div className="reader-dashboard-metric">{content}</div>
  );
}

const readerGroups = [
  {
    label: 'Discover',
    items: [
      { label: 'Overview', to: '/reader/dashboard', icon: Home },
      { label: 'For You', to: '/reader/feed', icon: Sparkles },
      { label: 'Interests', to: '/reader/interests', icon: Tags },
    ],
  },
  {
    label: 'Library',
    items: [
      { label: 'Saved Posts', to: '/reader/saved-posts', icon: Bookmark },
      { label: 'Saved Products', to: '/reader/saved-products', icon: ShoppingBag },
      { label: 'Following', to: '/reader/following', icon: UserRoundCheck },
      { label: 'Courses', to: '/reader/courses', icon: GraduationCap },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Credits', to: '/reader/credits', icon: CircleDollarSign },
      { label: 'Premium', to: '/reader/premium', icon: Crown },
      { label: 'Notifications', to: '/reader/notifications', icon: Bell },
      { label: 'Messages', to: '/reader/messages', icon: MessageCircle },
      { label: 'Settings', to: '/reader/settings', icon: Settings },
    ],
  },
  {
    label: 'Advertiser',
    items: [
      {
        label: 'Create Campaign',
        to: '/customer/advertiser/campaigns/create',
        icon: Megaphone,
      },
    ],
  },
];

function dashboardDisplayName(user) {
  return (
    user?.display_name ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    'Reader'
  );
}

function dashboardInitial(value) {
  const clean = String(value || '').trim();
  return clean ? clean.charAt(0).toUpperCase() : 'R';
}

function ReaderNavigation({ onNavigate }) {
  const location = useLocation();

  return (
    <nav className="reader-dashboard-nav" aria-label="Reader navigation">
      {readerGroups.map((group) => (
        <div className="reader-dashboard-nav-group" key={group.label}>
          <div className="reader-dashboard-nav-label">{group.label}</div>
          <div className="reader-dashboard-nav-list">
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) => {
                    const overviewAlias =
                      item.to === '/reader/dashboard' &&
                      location.pathname === '/customer/dashboard';

                    return `reader-dashboard-nav-link${
                      isActive || overviewAlias ? ' active' : ''
                    }`;
                  }}
                >
                  <span className="reader-dashboard-nav-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={1.9} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function ReaderSidebar({ customer, onLogout }) {
  const readerName = dashboardDisplayName(customer);

  return (
    <aside className="reader-dashboard-sidebar">
      <div className="reader-dashboard-brand">
        <span className="reader-dashboard-brand-mark">B</span>
        <div className="reader-dashboard-brand-copy">
          <strong>Bloggad</strong>
          <small>Reader</small>
        </div>
      </div>

      <ReaderNavigation />

      <div className="reader-dashboard-reader-card">
        <span className="reader-dashboard-avatar" aria-hidden="true">
          {dashboardInitial(readerName)}
        </span>
        <div className="reader-dashboard-reader-copy">
          <strong>{readerName}</strong>
          <small>Reader account</small>
        </div>
        <button
          type="button"
          className="reader-dashboard-logout"
          onClick={onLogout}
          aria-label="Log out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}

function InfoRow({ label, value, children }) {
  return (
    <div className="reader-dashboard-info-row">
      <span>{label}</span>
      {children || <strong>{value || '-'}</strong>}
    </div>
  );
}

function QuickLink({ eyebrow, title, description, to }) {
  return (
    <Link className="reader-dashboard-quick-link" to={to}>
      <span>{eyebrow}</span>
      <strong>{title}</strong>
      <p>{description}</p>
      <b>Open</b>
    </Link>
  );
}

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = useMemo(() => getStoredToken(), []);
  const storedUser = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    if (!token) {
      navigate('/reader/login', { replace: true });
      return undefined;
    }

    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(getApiUrl('/api/customer/dashboard'), {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to fetch Reader dashboard.');
        }

        if (isMounted) setDashboard(data);
      } catch (err) {
        if (isMounted) setError(err?.message || 'Failed to fetch Reader dashboard.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate, token]);

  const customer = dashboard?.customer || storedUser || {};
  const stats = dashboard?.stats || {};
  const registeredWriter = dashboard?.registered_under?.affiliate || null;
  const registeredWebsite = dashboard?.registered_under?.website || null;

  const writerSpacePath = registeredWebsite?.slug
    ? `/${encodeURIComponent(registeredWebsite.slug)}`
    : '/reader/feed';

  function handleLogout() {
    [
      'customerToken',
      'authToken',
      'accessToken',
      'token',
      'customerUser',
      'user',
      'customerLoginContext',
    ].forEach((key) => localStorage.removeItem(key));
    navigate('/reader/login', { replace: true });
  }

  if (location.pathname === '/reader/dashboard') {
    return (
      <ReaderUnifiedShell title="Overview" subtitle="Your Reader dashboard">
        <style>{readerDashboardCss}</style>
          <main className="reader-dashboard-main">
            <section className="reader-dashboard-hero">
              <div>
                <span className="reader-dashboard-eyebrow">READER HOME</span>
                <h1>Reader Dashboard</h1>
                <p>
                  Keep your saved content, Writer conversations, and reading tools organized
                  in one clear place.
                </p>
              </div>
              <Link className="reader-dashboard-primary-button" to="/reader/feed">
                Open For You
              </Link>
            </section>

            {error ? <div className="reader-dashboard-alert error">{error}</div> : null}

            <section className="reader-dashboard-metrics">
              <MetricCard
                label="Saved Posts"
                value={loading ? '-' : Number(stats.saved_posts || 0)}
                helper="Posts kept for later"
                to="/reader/saved-posts"
              />
              <MetricCard
                label="Saved Products"
                value={loading ? '-' : Number(stats.saved_products || 0)}
                helper="Products you bookmarked"
                to="/reader/saved-products"
              />
              <MetricCard
                label="Writer Chats"
                value={loading ? '-' : Number(stats.affiliate_chats || 0)}
                helper="Writer conversations"
                to="/reader/messages"
              />
              <MetricCard
                label="Admin Support"
                value={loading ? '-' : Number(stats.admin_chats || 0)}
                helper="Support conversations"
                to="/reader/messages"
              />
            </section>

            <section className="reader-dashboard-two-column">
              <article className="reader-dashboard-panel reader-dashboard-connection-panel">
                <div className="reader-dashboard-panel-heading">
                  <div>
                    <span className="reader-dashboard-section-kicker">CONNECTION</span>
                    <h2>Writer &amp; Writer Space</h2>
                    <p>Your signup connection and the Writer Space attached to this Reader account.</p>
                  </div>
                  {registeredWebsite?.status ? <StatusPill value={registeredWebsite.status} /> : null}
                </div>

                <div className="reader-dashboard-connection-grid">
                  <div className="reader-dashboard-connection-card">
                    <span className="reader-dashboard-card-label">REGISTERED WRITER</span>
                    <strong>{registeredWriter?.name || 'Main marketplace signup'}</strong>
                    <p>{registeredWriter?.email || 'No Writer connection'}</p>
                    <Link to="/reader/messages">Message Writer</Link>
                  </div>
                  <div className="reader-dashboard-connection-card">
                    <span className="reader-dashboard-card-label">WRITER SPACE</span>
                    <strong>{registeredWebsite?.website_name || 'Main marketplace'}</strong>
                    <p>{registeredWebsite?.slug || 'No connected Writer Space'}</p>
                    <Link to={writerSpacePath} target={registeredWebsite?.slug ? '_blank' : undefined}>
                      {registeredWebsite?.slug ? 'Open Writer Space' : 'Browse For You'}
                    </Link>
                  </div>
                </div>
              </article>

              <article className="reader-dashboard-panel">
                <div className="reader-dashboard-panel-heading simple">
                  <div>
                    <span className="reader-dashboard-section-kicker">ACCOUNT</span>
                    <h2>Account overview</h2>
                  </div>
                </div>
                <div className="reader-dashboard-info-list">
                  <InfoRow label="Status">
                    <StatusPill value={customer?.status || 'active'} />
                  </InfoRow>
                  <InfoRow label="Role" value="Reader" />
                  <InfoRow label="Reader access" value={customer?.email || 'Signed in'} />
                </div>
                <Link className="reader-dashboard-secondary-button full" to="/reader/settings">
                  Manage Settings
                </Link>
              </article>
            </section>

            <section className="reader-dashboard-section-block">
              <div className="reader-dashboard-section-title">
                <div>
                  <span className="reader-dashboard-section-kicker">QUICK ACCESS</span>
                  <h2>Your Reader tools</h2>
                </div>
                <Link to="/reader/feed">Open reading feed</Link>
              </div>
              <div className="reader-dashboard-quick-grid">
                <QuickLink
                  eyebrow="NETWORK"
                  title="Following"
                  description="See the Writers you follow and return to their work."
                  to="/reader/following"
                />
                <QuickLink
                  eyebrow="LEARNING"
                  title="Courses"
                  description="Continue Reader courses and learning activity."
                  to="/reader/courses"
                />
                <QuickLink
                  eyebrow="BALANCE"
                  title="Credits"
                  description="Review Reader credits available for supported actions."
                  to="/reader/credits"
                />
                <QuickLink
                  eyebrow="UPDATES"
                  title="Notifications"
                  description="See recent Reader notifications and account updates."
                  to="/reader/notifications"
                />
              </div>
            </section>

          </main>
      </ReaderUnifiedShell>
    );
  }
  return (
    <div className="reader-dashboard-screen">
      <style>{readerDashboardCss}</style>

      <div className="reader-dashboard-layout">
        <ReaderSidebar customer={customer} onLogout={handleLogout} />

        <div className="reader-dashboard-main-wrap">
          <header className="reader-dashboard-desktop-topbar">
            <h1>Overview</h1>
            <span>Your Reader dashboard</span>
          </header>

          <header className="reader-dashboard-mobile-topbar">
            <div className="reader-dashboard-mobile-brand">
              <span className="reader-dashboard-brand-mark">B</span>
              <strong>Reader</strong>
            </div>
            <button
              type="button"
              className="reader-dashboard-mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={15} />
              <span>Menu</span>
            </button>
          </header>

          <main className="reader-dashboard-main">
            <section className="reader-dashboard-hero">
              <div>
                <span className="reader-dashboard-eyebrow">READER HOME</span>
                <h1>Reader Dashboard</h1>
                <p>
                  Keep your saved content, Writer conversations, and reading tools organized
                  in one clear place.
                </p>
              </div>
              <Link className="reader-dashboard-primary-button" to="/reader/feed">
                Open For You
              </Link>
            </section>

            {error ? <div className="reader-dashboard-alert error">{error}</div> : null}

            <section className="reader-dashboard-metrics">
              <MetricCard
                label="Saved Posts"
                value={loading ? '-' : Number(stats.saved_posts || 0)}
                helper="Posts kept for later"
                to="/reader/saved-posts"
              />
              <MetricCard
                label="Saved Products"
                value={loading ? '-' : Number(stats.saved_products || 0)}
                helper="Products you bookmarked"
                to="/reader/saved-products"
              />
              <MetricCard
                label="Writer Chats"
                value={loading ? '-' : Number(stats.affiliate_chats || 0)}
                helper="Writer conversations"
                to="/reader/messages"
              />
              <MetricCard
                label="Admin Support"
                value={loading ? '-' : Number(stats.admin_chats || 0)}
                helper="Support conversations"
                to="/reader/messages"
              />
            </section>

            <section className="reader-dashboard-two-column">
              <article className="reader-dashboard-panel reader-dashboard-connection-panel">
                <div className="reader-dashboard-panel-heading">
                  <div>
                    <span className="reader-dashboard-section-kicker">CONNECTION</span>
                    <h2>Writer &amp; Writer Space</h2>
                    <p>Your signup connection and the Writer Space attached to this Reader account.</p>
                  </div>
                  {registeredWebsite?.status ? <StatusPill value={registeredWebsite.status} /> : null}
                </div>

                <div className="reader-dashboard-connection-grid">
                  <div className="reader-dashboard-connection-card">
                    <span className="reader-dashboard-card-label">REGISTERED WRITER</span>
                    <strong>{registeredWriter?.name || 'Main marketplace signup'}</strong>
                    <p>{registeredWriter?.email || 'No Writer connection'}</p>
                    <Link to="/reader/messages">Message Writer</Link>
                  </div>
                  <div className="reader-dashboard-connection-card">
                    <span className="reader-dashboard-card-label">WRITER SPACE</span>
                    <strong>{registeredWebsite?.website_name || 'Main marketplace'}</strong>
                    <p>{registeredWebsite?.slug || 'No connected Writer Space'}</p>
                    <Link to={writerSpacePath} target={registeredWebsite?.slug ? '_blank' : undefined}>
                      {registeredWebsite?.slug ? 'Open Writer Space' : 'Browse For You'}
                    </Link>
                  </div>
                </div>
              </article>

              <article className="reader-dashboard-panel">
                <div className="reader-dashboard-panel-heading simple">
                  <div>
                    <span className="reader-dashboard-section-kicker">ACCOUNT</span>
                    <h2>Account overview</h2>
                  </div>
                </div>
                <div className="reader-dashboard-info-list">
                  <InfoRow label="Status">
                    <StatusPill value={customer?.status || 'active'} />
                  </InfoRow>
                  <InfoRow label="Role" value="Reader" />
                  <InfoRow label="Reader access" value={customer?.email || 'Signed in'} />
                </div>
                <Link className="reader-dashboard-secondary-button full" to="/reader/settings">
                  Manage Settings
                </Link>
              </article>
            </section>

            <section className="reader-dashboard-section-block">
              <div className="reader-dashboard-section-title">
                <div>
                  <span className="reader-dashboard-section-kicker">QUICK ACCESS</span>
                  <h2>Your Reader tools</h2>
                </div>
                <Link to="/reader/feed">Open reading feed</Link>
              </div>
              <div className="reader-dashboard-quick-grid">
                <QuickLink
                  eyebrow="NETWORK"
                  title="Following"
                  description="See the Writers you follow and return to their work."
                  to="/reader/following"
                />
                <QuickLink
                  eyebrow="LEARNING"
                  title="Courses"
                  description="Continue Reader courses and learning activity."
                  to="/reader/courses"
                />
                <QuickLink
                  eyebrow="BALANCE"
                  title="Credits"
                  description="Review Reader credits available for supported actions."
                  to="/reader/credits"
                />
                <QuickLink
                  eyebrow="UPDATES"
                  title="Notifications"
                  description="See recent Reader notifications and account updates."
                  to="/reader/notifications"
                />
              </div>
            </section>

          </main>
        </div>
      </div>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            className="reader-dashboard-mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Reader menu"
          />
          <aside className="reader-dashboard-mobile-drawer" aria-label="Reader menu">
            <div className="reader-dashboard-mobile-drawer-head">
              <div className="reader-dashboard-brand">
                <span className="reader-dashboard-brand-mark">B</span>
                <div className="reader-dashboard-brand-copy">
                  <strong>Bloggad</strong>
                  <small>Reader</small>
                </div>
              </div>
              <button
                type="button"
                className="reader-dashboard-mobile-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={17} />
              </button>
            </div>

            <ReaderNavigation onNavigate={() => setMobileMenuOpen(false)} />

            <div className="reader-dashboard-reader-card">
              <span className="reader-dashboard-avatar" aria-hidden="true">
                {dashboardInitial(dashboardDisplayName(customer))}
              </span>
              <div className="reader-dashboard-reader-copy">
                <strong>{dashboardDisplayName(customer)}</strong>
                <small>Reader account</small>
              </div>
              <button
                type="button"
                className="reader-dashboard-logout"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}

const readerDashboardCss = `
  .reader-dashboard-screen,
  .reader-dashboard-screen * {
    box-sizing: border-box;
  }

  .reader-dashboard-screen {
    min-height: 100vh;
    background: #f5f6f8;
    color: #1c1f24;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .reader-dashboard-layout {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .reader-dashboard-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid #dfe3e6;
    background: #ffffff;
    padding: 22px 16px 18px;
    display: flex;
    flex-direction: column;
  }

  .reader-dashboard-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .reader-dashboard-brand-mark {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #1c1f24;
    display: grid;
    place-items: center;
  }

  .reader-dashboard-brand-mark i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ffffff;
    display: block;
  }

  .reader-dashboard-reader-card {
    margin-top: 24px;
    padding: 12px;
    border: 1px solid #e4e7ea;
    border-radius: 12px;
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
  }

  .reader-dashboard-reader-card strong,
  .reader-dashboard-reader-card span {
    display: block;
    min-width: 0;
  }

  .reader-dashboard-reader-card strong {
    font-size: 13px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-reader-card span {
    margin-top: 2px;
    color: #6e7378;
    font-size: 11px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #eef0f2;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 800;
  }

  .reader-dashboard-nav {
    margin-top: 22px;
    display: grid;
    gap: 20px;
  }

  .reader-dashboard-nav-group {
    display: grid;
    gap: 3px;
  }

  .reader-dashboard-nav-label,
  .reader-dashboard-card-label,
  .reader-dashboard-section-kicker,
  .reader-dashboard-eyebrow {
    color: #777d82;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 800;
    letter-spacing: 0.09em;
  }

  .reader-dashboard-nav-label {
    padding: 0 9px 5px;
  }

  .reader-dashboard-nav-link {
    min-height: 34px;
    padding: 7px 9px;
    border-radius: 8px;
    color: #51565b;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .reader-dashboard-nav-link:hover,
  .reader-dashboard-nav-link.active {
    background: #f0f1f2;
    color: #1c1f24;
  }

  .reader-dashboard-nav-arrow {
    color: #9aa0a5;
    font-size: 16px;
    line-height: 1;
  }

  .reader-dashboard-logout {
    margin-top: auto;
    min-height: 38px;
    width: 100%;
    border: 1px solid #dfe3e6;
    background: #ffffff;
    color: #35393d;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .reader-dashboard-main-wrap {
    min-width: 0;
  }

  .reader-dashboard-mobile-topbar {
    display: none;
  }

  .reader-dashboard-main {
    width: min(1180px, calc(100% - 48px));
    margin: 0 auto;
    padding: 42px 0 52px;
    display: grid;
    gap: 22px;
  }

  .reader-dashboard-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .reader-dashboard-hero h1 {
    margin: 5px 0 7px;
    font-size: 30px;
    line-height: 1.15;
    letter-spacing: -0.04em;
  }

  .reader-dashboard-hero p {
    max-width: 700px;
    margin: 0;
    color: #666c71;
    font-size: 13px;
    line-height: 1.65;
  }

  .reader-dashboard-primary-button,
  .reader-dashboard-secondary-button {
    min-height: 40px;
    padding: 0 15px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 12px;
    font-weight: 750;
    white-space: nowrap;
  }

  .reader-dashboard-primary-button {
    background: #1c1f24;
    border: 1px solid #1c1f24;
    color: #ffffff;
  }

  .reader-dashboard-secondary-button {
    background: #ffffff;
    border: 1px solid #d9dde0;
    color: #2d3135;
  }

  .reader-dashboard-secondary-button.full {
    width: 100%;
    margin-top: 15px;
  }

  .reader-dashboard-alert {
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 12px;
    line-height: 1.5;
  }

  .reader-dashboard-alert.error {
    border: 1px solid #efc8c8;
    background: #fff7f7;
    color: #8b2f2f;
  }

  .reader-dashboard-metrics,
  .reader-dashboard-advertiser-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .reader-dashboard-metric {
    min-width: 0;
    min-height: 112px;
    border: 1px solid #dfe3e6;
    border-radius: 11px;
    background: #ffffff;
    padding: 15px 16px;
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  a.reader-dashboard-metric:hover {
    border-color: #bec4c8;
  }

  .reader-dashboard-metric-label {
    color: #6e7378;
    font-size: 11px;
    font-weight: 700;
  }

  .reader-dashboard-metric strong {
    margin-top: 6px;
    font-size: 25px;
    line-height: 1.1;
    letter-spacing: -0.03em;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-metric-helper {
    margin-top: 6px;
    color: #858b90;
    font-size: 11px;
    line-height: 1.4;
  }

  .reader-dashboard-two-column {
    display: grid;
    grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.85fr);
    gap: 14px;
  }

  .reader-dashboard-panel,
  .reader-dashboard-section-block,
  .reader-dashboard-advertiser {
    border: 1px solid #dfe3e6;
    border-radius: 12px;
    background: #ffffff;
    padding: 20px;
  }

  .reader-dashboard-panel-heading,
  .reader-dashboard-section-title,
  .reader-dashboard-advertiser-head,
  .reader-dashboard-subpanel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .reader-dashboard-panel-heading h2,
  .reader-dashboard-section-title h2,
  .reader-dashboard-advertiser-head h2 {
    margin: 5px 0 0;
    font-size: 18px;
    line-height: 1.25;
    letter-spacing: -0.025em;
  }

  .reader-dashboard-panel-heading p,
  .reader-dashboard-advertiser-head p {
    margin: 7px 0 0;
    color: #71777c;
    font-size: 12px;
    line-height: 1.55;
  }

  .reader-dashboard-pill {
    display: inline-flex;
    min-height: 24px;
    align-items: center;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 750;
    white-space: nowrap;
    border: 1px solid #e0e3e5;
    background: #f6f7f8;
    color: #5b6065;
  }

  .reader-dashboard-pill.good {
    border-color: #cfe2d6;
    background: #f2f8f4;
    color: #326144;
  }

  .reader-dashboard-pill.warn {
    border-color: #eadbb9;
    background: #fbf8f0;
    color: #755d22;
  }

  .reader-dashboard-pill.bad {
    border-color: #ebcccc;
    background: #fbf3f3;
    color: #884040;
  }

  .reader-dashboard-connection-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .reader-dashboard-connection-card {
    border: 1px solid #e3e6e8;
    border-radius: 10px;
    padding: 14px;
    min-width: 0;
  }

  .reader-dashboard-connection-card strong,
  .reader-dashboard-connection-card p,
  .reader-dashboard-connection-card a {
    display: block;
  }

  .reader-dashboard-connection-card strong {
    margin-top: 9px;
    font-size: 14px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-connection-card p {
    margin: 5px 0 12px;
    color: #747a7f;
    font-size: 12px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-connection-card a,
  .reader-dashboard-section-title > a,
  .reader-dashboard-subpanel-head > a {
    color: #2f3337;
    font-size: 12px;
    font-weight: 750;
    text-decoration: none;
  }

  .reader-dashboard-info-list {
    margin-top: 13px;
    border-top: 1px solid #eceeef;
  }

  .reader-dashboard-info-row {
    min-height: 43px;
    padding: 9px 0;
    border-bottom: 1px solid #eceeef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .reader-dashboard-info-row > span:first-child {
    color: #777d82;
    font-size: 12px;
  }

  .reader-dashboard-info-row strong {
    max-width: 65%;
    font-size: 12px;
    line-height: 1.4;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .reader-dashboard-section-title {
    align-items: flex-end;
  }

  .reader-dashboard-quick-grid {
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .reader-dashboard-quick-link {
    min-height: 138px;
    border: 1px solid #e1e4e6;
    border-radius: 10px;
    padding: 14px;
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: column;
  }

  .reader-dashboard-quick-link > span {
    color: #81878c;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .reader-dashboard-quick-link strong {
    margin-top: 7px;
    font-size: 14px;
  }

  .reader-dashboard-quick-link p {
    margin: 6px 0 12px;
    color: #747a7f;
    font-size: 11px;
    line-height: 1.45;
  }

  .reader-dashboard-quick-link b {
    margin-top: auto;
    font-size: 11px;
  }

  .reader-dashboard-advertiser {
    background: #fbfbfc;
  }

  .reader-dashboard-advertiser-head {
    align-items: flex-end;
  }

  .reader-dashboard-advertiser-head > div:first-child {
    max-width: 650px;
  }

  .reader-dashboard-advertiser-actions {
    display: flex;
    gap: 8px;
  }

  .reader-dashboard-advertiser-metrics {
    margin-top: 18px;
  }

  .reader-dashboard-advertiser-metrics .reader-dashboard-metric {
    min-height: 101px;
  }

  .reader-dashboard-advertiser-metrics .reader-dashboard-metric strong {
    font-size: 20px;
  }

  .reader-dashboard-advertiser-grid {
    margin-top: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.85fr);
    gap: 12px;
  }

  .reader-dashboard-subpanel {
    min-width: 0;
    border: 1px solid #dfe3e6;
    border-radius: 11px;
    background: #ffffff;
    padding: 16px;
  }

  .reader-dashboard-subpanel-head {
    align-items: flex-end;
  }

  .reader-dashboard-subpanel-head h3 {
    margin: 5px 0 0;
    font-size: 15px;
    letter-spacing: -0.015em;
  }

  .reader-dashboard-campaign-list {
    margin-top: 12px;
    border-top: 1px solid #eceeef;
  }

  .reader-dashboard-campaign-row {
    min-height: 64px;
    padding: 10px 0;
    border-bottom: 1px solid #eceeef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .reader-dashboard-campaign-copy {
    min-width: 0;
  }

  .reader-dashboard-campaign-copy strong,
  .reader-dashboard-campaign-copy span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-campaign-copy strong {
    font-size: 12px;
  }

  .reader-dashboard-campaign-copy span {
    margin-top: 4px;
    color: #7c8287;
    font-size: 11px;
  }

  .reader-dashboard-campaign-meta {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reader-dashboard-campaign-meta > span:last-child {
    color: #50555a;
    font-size: 11px;
    font-weight: 700;
  }

  .reader-dashboard-empty {
    min-height: 110px;
    margin-top: 12px;
    border: 1px dashed #d9dde0;
    border-radius: 9px;
    display: grid;
    place-content: center;
    gap: 5px;
    padding: 16px;
    text-align: center;
    color: #73797e;
    font-size: 12px;
  }

  .reader-dashboard-empty strong {
    color: #34383c;
  }

  .reader-dashboard-info-list.compact-list {
    margin-top: 12px;
  }

  .reader-dashboard-footnote {
    padding: 0 2px;
    color: #7b8186;
    font-size: 11px;
    line-height: 1.55;
  }

  .reader-dashboard-mobile-overlay {
    display: none;
  }

  @media (max-width: 1180px) {
    .reader-dashboard-metrics,
    .reader-dashboard-advertiser-metrics,
    .reader-dashboard-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .reader-dashboard-two-column,
    .reader-dashboard-advertiser-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 820px) {
    .reader-dashboard-layout {
      display: block;
    }

    .reader-dashboard-sidebar {
      display: none;
    }

    .reader-dashboard-mobile-topbar {
      height: 58px;
      padding: 0 12px;
      border-bottom: 1px solid #dfe3e6;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .reader-dashboard-brand.compact {
      gap: 8px;
    }

    .reader-dashboard-brand.compact .reader-dashboard-brand-mark {
      width: 27px;
      height: 27px;
    }

    .reader-dashboard-brand.compact > div {
      display: grid;
    }

    .reader-dashboard-brand.compact strong {
      font-size: 14px;
      line-height: 1.1;
    }

    .reader-dashboard-brand.compact > div > span {
      color: #747a7f;
      font-size: 10px;
      font-weight: 600;
      margin-top: 2px;
    }

    .reader-dashboard-mobile-topbar > button {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid #d8dcdf;
      background: #ffffff;
      color: #2f3337;
      font-size: 12px;
      font-weight: 750;
    }

    .reader-dashboard-main {
      width: 100%;
      margin: 0;
      padding: 22px 8px 30px;
      gap: 14px;
    }

    .reader-dashboard-hero {
      padding: 0 2px;
      align-items: flex-start;
    }

    .reader-dashboard-hero h1 {
      margin-top: 4px;
      font-size: 24px;
    }

    .reader-dashboard-hero p {
      font-size: 12px;
      line-height: 1.55;
    }

    .reader-dashboard-hero .reader-dashboard-primary-button {
      min-height: 36px;
      padding: 0 11px;
      font-size: 11px;
    }

    .reader-dashboard-panel,
    .reader-dashboard-section-block,
    .reader-dashboard-advertiser {
      padding: 15px;
      border-radius: 10px;
    }

    .reader-dashboard-panel-heading h2,
    .reader-dashboard-section-title h2,
    .reader-dashboard-advertiser-head h2 {
      font-size: 17px;
    }

    .reader-dashboard-connection-grid {
      grid-template-columns: 1fr;
    }

    .reader-dashboard-advertiser-head {
      align-items: stretch;
      flex-direction: column;
    }

    .reader-dashboard-advertiser-actions {
      width: 100%;
    }

    .reader-dashboard-advertiser-actions a {
      flex: 1 1 0;
    }

    .reader-dashboard-mobile-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(28, 31, 36, 0.32);
    }

    .reader-dashboard-mobile-drawer {
      position: absolute;
      top: 0;
      right: 0;
      width: min(330px, 88vw);
      height: 100%;
      overflow-y: auto;
      background: #ffffff;
      border-left: 1px solid #dfe3e6;
      padding: 18px 14px;
      display: flex;
      flex-direction: column;
    }

    .reader-dashboard-mobile-drawer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .reader-dashboard-mobile-drawer-head > div {
      display: grid;
      gap: 3px;
    }

    .reader-dashboard-mobile-drawer-head span {
      color: #777d82;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.09em;
    }

    .reader-dashboard-mobile-drawer-head strong {
      font-size: 15px;
    }

    .reader-dashboard-mobile-drawer-head button {
      min-height: 32px;
      padding: 0 10px;
      border: 1px solid #dfe3e6;
      border-radius: 8px;
      background: #ffffff;
      font-size: 11px;
      font-weight: 700;
    }

    .reader-dashboard-mobile-drawer .reader-dashboard-logout {
      margin-top: 22px;
    }
  }

  @media (max-width: 560px) {
    .reader-dashboard-metrics,
    .reader-dashboard-advertiser-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .reader-dashboard-metric {
      min-height: 100px;
      padding: 12px;
    }

    .reader-dashboard-metric strong {
      font-size: 21px;
    }

    .reader-dashboard-metric-helper {
      font-size: 10.5px;
    }

    .reader-dashboard-quick-grid {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .reader-dashboard-quick-link {
      min-height: auto;
      padding: 13px;
    }

    .reader-dashboard-quick-link p {
      margin-bottom: 9px;
      font-size: 12px;
    }

    .reader-dashboard-section-title {
      align-items: flex-start;
      flex-direction: column;
    }

    .reader-dashboard-campaign-row {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .reader-dashboard-campaign-meta {
      width: 100%;
      justify-content: space-between;
    }

    .reader-dashboard-info-row {
      align-items: flex-start;
    }

    .reader-dashboard-info-row strong {
      max-width: 62%;
    }
  }

  @media (max-width: 390px) {
    .reader-dashboard-advertiser-actions {
      flex-direction: column;
    }

    .reader-dashboard-advertiser-actions a {
      width: 100%;
    }
  }

  /* Shared Reader shell standard - aligned with the approved For You / Saved Posts layout. */
  .reader-dashboard-screen {
    overflow-x: hidden;
    background: #f7f8fa;
    color: #111827;
  }

  .reader-dashboard-layout {
    grid-template-columns: 236px minmax(0, 1fr);
  }

  .reader-dashboard-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    width: 236px;
    height: 100vh;
    min-height: 100vh;
    overflow-y: auto;
    padding: 24px 18px 18px;
    border-right: 1px solid #e3e7ed;
    background: #ffffff;
  }

  .reader-dashboard-brand {
    gap: 10px;
    min-width: 0;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: normal;
  }

  .reader-dashboard-brand-mark {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 10px;
    background: #111827;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
  }

  .reader-dashboard-brand-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .reader-dashboard-brand-copy strong {
    color: #111827;
    font-size: 14px;
    line-height: 1.2;
  }

  .reader-dashboard-brand-copy small {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.2;
  }

  .reader-dashboard-nav {
    margin-top: 28px;
    display: grid;
    gap: 24px;
  }

  .reader-dashboard-nav-group {
    display: grid;
    gap: 7px;
  }

  .reader-dashboard-nav-label {
    padding: 0 1px;
    color: #8a96a8;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: 0.035em;
    text-transform: uppercase;
  }

  .reader-dashboard-nav-list {
    display: grid;
    gap: 4px;
  }

  .reader-dashboard-nav-link {
    min-height: 42px;
    padding: 0 14px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    color: #1f2937;
    font-size: 13px;
    line-height: 1.25;
    font-weight: 550;
    text-decoration: none;
  }

  .reader-dashboard-nav-link:hover {
    background: #f3f5f7;
    color: #1f2937;
  }

  .reader-dashboard-nav-link.active {
    background: #111827;
    color: #ffffff;
    font-weight: 700;
  }

  .reader-dashboard-nav-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
    display: grid;
    place-items: center;
    color: #738095;
  }

  .reader-dashboard-nav-link.active .reader-dashboard-nav-icon {
    color: #ffffff;
  }

  .reader-dashboard-reader-card {
    margin-top: auto;
    min-height: 54px;
    padding: 9px 10px;
    border: 0;
    border-radius: 12px;
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) 28px;
    align-items: center;
    gap: 9px;
    background: #f3f4f6;
  }

  .reader-dashboard-avatar {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
  }

  .reader-dashboard-reader-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .reader-dashboard-reader-copy strong,
  .reader-dashboard-reader-copy small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-dashboard-reader-copy strong {
    color: #111827;
    font-size: 11px;
  }

  .reader-dashboard-reader-copy small {
    color: #788396;
    font-size: 9px;
  }

  .reader-dashboard-logout {
    width: 28px;
    height: 28px;
    min-height: 28px;
    margin-top: 0;
    padding: 0;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #6b7280;
  }

  .reader-dashboard-logout:hover {
    background: #ffffff;
    color: #b42318;
  }

  .reader-dashboard-main-wrap {
    grid-column: 2;
    min-width: 0;
  }

  .reader-dashboard-desktop-topbar {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 0 32px;
    border-bottom: 1px solid #e3e7ed;
    background: rgba(255, 255, 255, 0.96);
  }

  .reader-dashboard-desktop-topbar h1 {
    margin: 0;
    font-size: 18px;
    line-height: 1.2;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  .reader-dashboard-desktop-topbar span {
    color: #667085;
    font-size: 12px;
  }

  .reader-dashboard-mobile-topbar {
    display: none;
  }

  .reader-dashboard-main {
    width: 100%;
    max-width: 1220px;
    margin: 0 auto;
    padding: 52px 32px 52px;
  }

  .reader-dashboard-mobile-overlay,
  .reader-dashboard-mobile-drawer {
    display: none;
  }

  @media (max-width: 991px) {
    .reader-dashboard-layout {
      display: block;
      min-height: 100vh;
    }

    .reader-dashboard-sidebar,
    .reader-dashboard-desktop-topbar {
      display: none;
    }

    .reader-dashboard-mobile-topbar {
      position: sticky;
      top: 0;
      z-index: 35;
      height: 56px;
      padding: 0 12px;
      border-bottom: 1px solid #e3e7ed;
      background: rgba(255, 255, 255, 0.98);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .reader-dashboard-mobile-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .reader-dashboard-mobile-brand .reader-dashboard-brand-mark {
      width: 28px;
      height: 28px;
      flex-basis: 28px;
      border-radius: 8px;
      font-size: 11px;
    }

    .reader-dashboard-mobile-brand strong {
      color: #111827;
      font-size: 12px;
    }

    .reader-dashboard-mobile-menu-button {
      min-width: 48px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border: 1px solid #dfe4eb;
      border-radius: 8px;
      background: #ffffff;
      color: #111827;
      font-size: 11px;
      font-weight: 700;
    }

    .reader-dashboard-main {
      width: calc(100% - 16px);
      max-width: none;
      margin: 0 8px;
      padding: 22px 0 30px;
    }

    .reader-dashboard-mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: block;
      border: 0;
      background: rgba(15, 23, 42, 0.34);
    }

    .reader-dashboard-mobile-drawer {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 55;
      width: min(320px, calc(100% - 40px));
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 16px;
      overflow-y: auto;
      border-right: 1px solid #e3e7ed;
      background: #ffffff;
      box-shadow: 18px 0 42px rgba(15, 23, 42, 0.12);
    }

    .reader-dashboard-mobile-drawer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .reader-dashboard-mobile-close {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border: 1px solid #e3e7ed;
      border-radius: 9px;
      background: #ffffff;
      color: #111827;
    }

    .reader-dashboard-mobile-drawer .reader-dashboard-nav {
      margin-top: 22px;
    }

    .reader-dashboard-mobile-drawer .reader-dashboard-reader-card {
      margin-top: 24px;
    }
  }

`;
