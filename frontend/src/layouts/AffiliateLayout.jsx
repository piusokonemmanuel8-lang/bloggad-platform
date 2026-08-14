import { useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  ShoppingBag,
  FileText,
  LayoutTemplate,
  MenuSquare,
  SlidersHorizontal,
  Image as ImageIcon,
  Palette,
  BarChart3,
  CreditCard,
  Settings,
  MessageSquare,
  Users,
  Mail,
  Menu,
  X,
  ChevronRight,
  BadgeDollarSign,
  LineChart,
  Wallet,
  SquarePen,
  PanelsTopLeft,
  ChartNoAxesCombined,
  Bell,
  Megaphone,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import RoleSwitcher from '../components/shared/RoleSwitcher';
import { getSupgadReturnUrl } from '../utils/supgadReturn';

function extractFirstName(user) {
  if (!user) return 'Writer';

  const possibleName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    user?.first_name ||
    user?.firstName ||
    '';

  if (!possibleName || typeof possibleName !== 'string') return 'Writer';

  return possibleName.trim().split(' ')[0] || 'Writer';
}

function getGreeting(name = '') {
  const hour = new Date().getHours();

  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

const navItems = [
  { label: 'Dashboard', to: '/writer/dashboard', icon: LayoutDashboard, group: 'Overview' },
  { label: 'Notifications', to: '/writer/notifications', icon: Bell, group: 'Overview' },

  { label: 'Posts', to: '/writer/posts', icon: FileText, group: 'Publish' },
  { label: 'Write', to: '/writer/posts/create', icon: SquarePen, group: 'Publish' },
  { label: 'Pages', to: '/writer/pages', icon: FileText, group: 'Publish' },
  { label: 'Series and Books', to: '/writer/series', icon: FileText, group: 'Publish' },
  { label: 'Courses', to: '/writer/courses', icon: LayoutTemplate, group: 'Publish' },
  { label: 'Community', to: '/writer/community', icon: Users, group: 'Publish' },

  { label: 'Messages', to: '/writer/messages', icon: MessageSquare, group: 'Audience' },
  { label: 'Readers', to: '/writer/readers', icon: Users, group: 'Audience' },
  { label: 'Email Lists', to: '/writer/email-lists', icon: Mail, group: 'Audience' },
  { label: 'Memberships', to: '/writer/memberships', icon: CreditCard, group: 'Audience' },

  { label: 'Storefront', to: '/writer/website', icon: Globe, group: 'Store' },
  { label: 'Products', to: '/writer/products', icon: ShoppingBag, group: 'Store' },
  { label: 'Templates', to: '/writer/templates/choose', icon: LayoutTemplate, group: 'Store' },
  { label: 'Menus', to: '/writer/menus', icon: MenuSquare, group: 'Store' },
  { label: 'Sliders', to: '/writer/sliders', icon: SlidersHorizontal, group: 'Store' },
  { label: 'Design', to: '/writer/design', icon: Palette, group: 'Store' },

  { label: 'Analytics', to: '/writer/analytics', icon: BarChart3, group: 'Insights' },
  {
    label: 'Monetization Eligibility',
    to: '/writer/monetization/eligibility',
    icon: BadgeDollarSign,
    group: 'Insights',
  },
  {
    label: 'Monetization Analytics',
    to: '/writer/monetization/analytics',
    icon: ChartNoAxesCombined,
    group: 'Insights',
  },
  {
    label: 'BlogPulse Earnings',
    to: '/writer/monetization/blogpulse-analytics',
    icon: LineChart,
    group: 'Insights',
  },
  { label: 'My Ads', to: '/writer/monetization/my-ads', icon: SquarePen, group: 'Insights' },
  {
    label: 'Ad Placement',
    to: '/writer/monetization/ad-placement',
    icon: PanelsTopLeft,
    group: 'Insights',
  },
  { label: 'Ads Account', to: '/writer/ads', icon: Megaphone, group: 'Insights' },
  { label: 'Leaderboard', to: '/writer/leaderboard', icon: Trophy, group: 'Insights' },

  { label: 'Writer Wallet', to: '/writer/wallet', icon: Wallet, group: 'Account' },
  { label: 'Writer Plan', to: '/writer/plan', icon: CreditCard, group: 'Account' },
  { label: 'Settings', to: '/writer/settings', icon: Settings, group: 'Account' },
];

const dashboardGroups = ['Overview', 'Publish', 'Audience', 'Store', 'Insights', 'Account'];

function StandardNavigation({ onNavigate, supgadReturnUrl }) {
  return (
    <div className="affiliate-layout-sidebar-menu">
      <div className="affiliate-layout-menu-label">Main Menu</div>

      <nav className="affiliate-layout-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `affiliate-layout-nav-item${isActive ? ' active' : ''}`
              }
              onClick={onNavigate}
            >
              <div className="affiliate-layout-nav-left">
                <Icon size={19} />
                <span>{item.label}</span>
              </div>

              <ChevronRight size={16} />
            </NavLink>
          );
        })}

        {supgadReturnUrl ? (
          <a
            href={supgadReturnUrl}
            className="affiliate-layout-nav-item"
            onClick={onNavigate}
          >
            <div className="affiliate-layout-nav-left">
              <Globe size={19} />
              <span>Supgad</span>
            </div>
            <ChevronRight size={16} />
          </a>
        ) : null}
      </nav>
    </div>
  );
}

function DashboardNavigation({ onNavigate, supgadReturnUrl }) {
  return (
    <div className="dashboard-nav-scroll">
      {dashboardGroups.map((group) => {
        const items = navItems.filter((item) => item.group === group);

        return (
          <div className="dashboard-nav-group" key={group}>
            <div className="dashboard-nav-label">{group}</div>

            <nav className="dashboard-nav-list" aria-label={`${group} navigation`}>
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `dashboard-nav-item${isActive ? ' active' : ''}`
                    }
                    onClick={onNavigate}
                  >
                    <span className="dashboard-nav-icon">
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="dashboard-nav-text">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        );
      })}

      {supgadReturnUrl ? (
        <div className="dashboard-nav-group">
          <div className="dashboard-nav-label">Platform</div>
          <nav className="dashboard-nav-list" aria-label="Platform navigation">
            <a
              href={supgadReturnUrl}
              className="dashboard-nav-item"
              onClick={onNavigate}
            >
              <span className="dashboard-nav-icon">
                <Globe size={16} strokeWidth={1.8} />
              </span>
              <span className="dashboard-nav-text">Supgad</span>
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

// BLOGGAD_WRITER_MOBILE_BOTTOM_NAV_V1
const writerMobileBottomItems = [
  { label: 'Dashboard', to: '/writer/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Posts', to: '/writer/posts', icon: FileText, end: true },
  { label: 'Write', to: '/writer/posts/create', icon: SquarePen, end: true, primary: true },
  { label: 'Analytics', to: '/writer/analytics', icon: BarChart3, end: true },
];

function WriterMobileBottomNav({ onMenu, menuOpen }) {
  return (
    <nav className="writer-mobile-bottom-nav" aria-label="Writer mobile navigation">
      {writerMobileBottomItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `writer-mobile-bottom-item${item.primary ? ' writer-write' : ''}${isActive ? ' active' : ''}`
            }
          >
            <span className="writer-mobile-bottom-icon" aria-hidden="true">
              <Icon size={item.primary ? 21 : 20} strokeWidth={1.9} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        className={`writer-mobile-bottom-item${menuOpen ? ' active' : ''}`}
        onClick={onMenu}
        aria-label="Open Writer menu"
        aria-expanded={menuOpen}
      >
        <span className="writer-mobile-bottom-icon" aria-hidden="true">
          <Menu size={20} strokeWidth={1.9} />
        </span>
        <span>Menu</span>
      </button>
    </nav>
  );
}
export default function AffiliateLayout() {
  const { isAuthenticated, isAffiliate, bootstrapping, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = useMemo(() => extractFirstName(user), [user]);
  const greeting = useMemo(() => getGreeting(firstName), [firstName]);
  const supgadReturnUrl = useMemo(() => getSupgadReturnUrl(), []);

  const connectedWriterShellMode =
  location.pathname === '/writer/plan' ||
  (location.pathname === '/writer/dashboard' ||
    location.pathname === '/writer/notifications' ||
    location.pathname === '/writer/posts' ||
    location.pathname === '/writer/posts/create' ||
    location.pathname === '/writer/series' ||
    location.pathname === '/writer/pages' ||
    location.pathname === '/writer/courses' ||
    location.pathname === '/writer/community' ||
    location.pathname === '/writer/readers' ||
    location.pathname === '/writer/email-lists' ||
    location.pathname === '/writer/messages' ||
    location.pathname === '/writer/website' ||
    location.pathname === '/writer/templates/choose') ||
    location.pathname === '/writer/memberships' ||
    location.pathname === '/writer/menus' ||
    location.pathname.startsWith('/writer/products') ||
    location.pathname === '/writer/analytics' ||
    location.pathname === '/writer/design'
    || location.pathname === '/writer/sliders' ||
    location.pathname === '/writer/monetization/analytics' ||
    location.pathname === '/writer/monetization/eligibility' ||
    location.pathname === '/writer/monetization/my-ads'
    || location.pathname === '/writer/monetization/blogpulse-analytics' ||
    location.pathname === '/writer/monetization/ad-placement' ||
    location.pathname === '/writer/settings' ||
    location.pathname === '/writer/leaderboard' ||
    location.pathname === '/writer/wallet' ||
    location.pathname === '/writer/ads';

  const dashboardMode =
    connectedWriterShellMode ||
    location.pathname === '/affiliate/dashboard';

  const shellTitle = location.pathname === '/writer/ads'
    ? 'Ads Account'
    : (location.pathname === '/writer/wallet'
    ? 'Writer Wallet'
    : (location.pathname === '/writer/leaderboard'
    ? 'Leaderboard'
    : (location.pathname === '/writer/plan'
    ? 'Writer Plan'
    : location.pathname === '/writer/settings'
    ? 'Settings'
    : (location.pathname === '/writer/monetization/ad-placement'
    ? 'Ad Placement'
    : (location.pathname === '/writer/monetization/blogpulse-analytics'
    ? 'BlogPulse Earnings'
    : (location.pathname === '/writer/monetization/my-ads'
    ? 'My Ads'
    : (location.pathname === '/writer/monetization/eligibility'
    ? 'Monetization Eligibility'
    : (location.pathname === '/writer/monetization/analytics'
    ? 'Monetization Analytics'
    : (location.pathname === '/writer/sliders'
    ? 'Sliders'
    : (location.pathname === '/writer/design'
    ? 'Design'
    : (location.pathname === '/writer/analytics'
    ? 'Analytics'
    : (location.pathname.startsWith('/writer/products')
    ? 'Products'
    : (location.pathname === '/writer/menus' ? 'Menus' : location.pathname === '/writer/templates/choose'
    ? 'Templates'
    : (location.pathname === '/writer/memberships' ? 'Memberships' : (location.pathname === '/writer/website'
    ? 'Storefront'
    : (location.pathname === '/writer/messages'
    ? 'Messages'
    : (location.pathname === '/writer/readers' ? 'Readers' : (location.pathname === '/writer/community'
      ? 'Community'
      : location.pathname === '/writer/courses'
        ? 'Courses'
        : location.pathname === '/writer/notifications'
          ? 'Notifications'
          : location.pathname === '/writer/posts'
            ? 'Posts'
            : location.pathname === '/writer/posts/create'
              ? 'Write'
              : location.pathname === '/writer/series'
                ? 'Series and Books'
                : location.pathname === '/writer/pages'
                  ? 'Pages'
                  : location.pathname === '/writer/email-lists'
                    ? 'Email Lists'
                    : 'Dashboard'))))))))))))))))));

  const shellSubtitle =
    location.pathname === '/writer/dashboard' ||
    location.pathname === '/affiliate/dashboard'
      ? 'Writer overview and recent activity'
      : '';

  if (bootstrapping) {
    return (
      <div className="affiliate-layout-loading">
        <style>{styles}</style>
        <div className="affiliate-layout-loading-card">
          <div className="affiliate-layout-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAffiliate) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className={`affiliate-layout-shell${dashboardMode ? ' dashboard-redesign' : ''}${location.pathname.startsWith('/writer/') ? ' writer-mobile-nav-enabled' : ''}`}
    >
      <style>{styles}</style>

      <aside
        className={`affiliate-layout-sidebar ${mobileOpen ? 'open' : ''}${
          dashboardMode ? ' dashboard-sidebar' : ''
        }`}
      >
        <div className="affiliate-layout-sidebar-top">
          <div className="affiliate-layout-brand">
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: 'inherit',
                textDecoration: 'none',
              }}
              aria-label="Go to Bloggad homepage"
              onClick={() => setMobileOpen(false)}
            >
              <div className="affiliate-layout-brand-logo">
                {dashboardMode ? <span className="dashboard-brand-dot" /> : 'BG'}
              </div>

              <div className="affiliate-layout-brand-copy">
                <h2>Bloggad</h2>
                <p>Writer Studio</p>
              </div>
            </Link>

            {dashboardMode ? (
              <button
                type="button"
                className="dashboard-sidebar-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close Writer menu"
              >
                <X size={18} />
              </button>
            ) : null}
          </div>
        </div>

        {dashboardMode ? (
          <DashboardNavigation
            onNavigate={() => setMobileOpen(false)}
            supgadReturnUrl={supgadReturnUrl}
          />
        ) : (
          <StandardNavigation
            onNavigate={() => setMobileOpen(false)}
            supgadReturnUrl={supgadReturnUrl}
          />
        )}
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="affiliate-layout-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <div className="affiliate-layout-main">
        {dashboardMode ? (
          <header className="dashboard-layout-topbar">
            <div className="dashboard-mobile-bar">
              <button
                type="button"
                className="dashboard-mobile-menu"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle Writer menu"
              >
                {mobileOpen ? <X size={19} /> : <Menu size={19} />}
              </button>

              <Link
                to="/"
                className="dashboard-mobile-brand"
                style={{ color: 'inherit', textDecoration: 'none' }}
                aria-label="Go to Bloggad homepage"
              >
                <span className="dashboard-mobile-brand-mark">
                  <span />
                </span>
                <strong>Bloggad</strong>
              </Link>

              <RoleSwitcher currentRole="writer" iconOnly />

              <div className="dashboard-mobile-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="dashboard-desktop-title">
              <h1>{shellTitle}</h1>
              {shellSubtitle ? <p>{shellSubtitle}</p> : null}
            </div>

            <div className="dashboard-account">
              <RoleSwitcher currentRole="writer" compact />
              <div className="dashboard-account-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="dashboard-account-copy">
                <strong>{firstName}</strong>
                <span>Writer Account</span>
              </div>
            </div>
          </header>
        ) : (
          <header className="affiliate-layout-topbar">
            <div className="affiliate-layout-topbar-left">
              <button
                type="button"
                className="affiliate-layout-menu-btn"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="affiliate-layout-topbar-copy">
                <h1>{greeting}</h1>
                <p>
                  Manage your Writer Space, posts, series, courses, community, products,
                  monetization, analytics, messages, notifications, and settings from one place.
                </p>
              </div>
            </div>

            <div className="affiliate-layout-user-card">
              <RoleSwitcher currentRole="writer" compact />
              <div className="affiliate-layout-user-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="affiliate-layout-user-copy">
                <strong>{firstName}</strong>
                <span>Writer Account</span>
              </div>
            </div>
          </header>
        )}

        <main className="affiliate-layout-content">
          <Outlet />
        </main>

        {location.pathname.startsWith('/writer/') ? (
          <WriterMobileBottomNav
            onMenu={() => setMobileOpen(true)}
            menuOpen={mobileOpen}
          />
        ) : null}
      </div>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    background: #f3f4f6;
    color: #111827;
  }

  .affiliate-layout-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #f3f4f6;
    padding: 24px;
  }

  .affiliate-layout-loading-card {
    min-width: 240px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-layout-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateLayoutSpin 0.8s linear infinite;
  }

  @keyframes affiliateLayoutSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .affiliate-layout-shell {
    min-height: 100vh;
    background: #f3f4f6;
  }

  .affiliate-layout-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 292px;
    height: 100vh;
    background: #ffffff;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    z-index: 50;
    overflow-y: auto;
  }

  .affiliate-layout-sidebar-top {
    padding: 22px 18px 16px;
    border-bottom: 1px solid #eef2f7;
  }

  .affiliate-layout-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .affiliate-layout-brand-logo {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-weight: 900;
    font-size: 20px;
    flex-shrink: 0;
  }

  .affiliate-layout-brand-copy h2 {
    margin: 0 0 4px;
    font-size: 18px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-layout-brand-copy p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
  }

  .affiliate-layout-sidebar-menu {
    padding: 18px;
    flex: 1;
  }

  .affiliate-layout-menu-label {
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .affiliate-layout-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-layout-nav-item {
    min-height: 52px;
    border-radius: 16px;
    padding: 0 14px;
    text-decoration: none;
    color: #111827;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid transparent;
    transition: 0.2s ease;
    background: transparent;
  }

  .affiliate-layout-nav-item:hover {
    background: #f8fafc;
    border-color: #edf2f7;
  }

  .affiliate-layout-nav-item.active {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-layout-nav-left {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .affiliate-layout-nav-left span {
    font-size: 15px;
    font-weight: 800;
    line-height: 1.3;
  }

  .affiliate-layout-main {
    min-height: 100vh;
    margin-left: 292px;
  }

  .affiliate-layout-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(243, 244, 246, 0.96);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid #e5e7eb;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .affiliate-layout-topbar-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .affiliate-layout-menu-btn {
    display: none;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .affiliate-layout-topbar-copy h1 {
    margin: 0 0 4px;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-layout-topbar-copy p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
  }

  .affiliate-layout-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .affiliate-layout-user-avatar {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .affiliate-layout-user-copy {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .affiliate-layout-user-copy strong {
    font-size: 15px;
    line-height: 1.2;
    color: #111827;
  }

  .affiliate-layout-user-copy span {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.3;
  }

  .affiliate-layout-content {
    padding: 24px;
  }

  .affiliate-layout-backdrop {
    display: none;
  }

  .dashboard-nav-scroll,
  .dashboard-layout-topbar,
  .dashboard-mobile-bar,
  .dashboard-sidebar-close {
    display: none;
  }

  /* Approved Writer Dashboard Figma overrides only. */
  .dashboard-redesign {
    background: #f5f6f7;
    color: #17191f;
  }

  .dashboard-redesign .affiliate-layout-sidebar {
    width: 248px;
    border-right: 1px solid #dfe3e6;
    box-shadow: none;
    overflow: hidden;
  }

  .dashboard-redesign .affiliate-layout-sidebar-top {
    padding: 18px 18px 17px;
    border-bottom: 1px solid #e8eaec;
  }

  .dashboard-redesign .affiliate-layout-brand {
    gap: 11px;
    min-width: 0;
  }

  .dashboard-redesign .affiliate-layout-brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    position: relative;
  }

  .dashboard-brand-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #ffffff;
    display: block;
  }

  .dashboard-redesign .affiliate-layout-brand-copy {
    min-width: 0;
  }

  .dashboard-redesign .affiliate-layout-brand-copy h2 {
    margin: 0 0 2px;
    font-size: 15px;
    font-weight: 750;
    letter-spacing: -0.01em;
  }

  .dashboard-redesign .affiliate-layout-brand-copy p {
    font-size: 11px;
    color: #7a828d;
  }

  .dashboard-redesign .affiliate-layout-main {
    margin-left: 248px;
    background: #f5f6f7;
  }

  .dashboard-redesign .affiliate-layout-content {
    padding: 30px;
  }

  .dashboard-redesign .dashboard-nav-scroll {
    display: block;
    flex: 1;
    padding: 13px 12px 24px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cfd4d9 transparent;
  }

  .dashboard-nav-group + .dashboard-nav-group {
    margin-top: 15px;
  }

  .dashboard-nav-label {
    padding: 0 10px;
    margin-bottom: 5px;
    color: #9aa1aa;
    font-size: 9px;
    line-height: 1.4;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .dashboard-nav-list {
    display: grid;
    gap: 2px;
  }

  .dashboard-nav-item {
    min-height: 34px;
    padding: 0 9px;
    border-radius: 7px;
    color: #555f6c;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 12px;
    font-weight: 620;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .dashboard-nav-item:hover {
    color: #17191f;
    background: #f4f5f6;
  }

  .dashboard-nav-item.active {
    color: #ffffff;
    background: #1c1f24;
  }

  .dashboard-nav-icon {
    width: 18px;
    display: grid;
    place-items: center;
    flex: 0 0 18px;
    opacity: 0.92;
  }

  .dashboard-nav-text {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .dashboard-redesign .dashboard-layout-topbar {
    min-height: 72px;
    padding: 0 30px;
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1px solid #dfe3e6;
    backdrop-filter: blur(10px);
  }

  .dashboard-desktop-title h1 {
    margin: 0 0 3px;
    color: #17191f;
    font-size: 17px;
    line-height: 1.2;
    font-weight: 760;
    letter-spacing: -0.015em;
  }

  .dashboard-desktop-title p {
    margin: 0;
    color: #7a828d;
    font-size: 11px;
    line-height: 1.35;
  }

  .dashboard-account {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .dashboard-account-avatar,
  .dashboard-mobile-avatar {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #1c1f24;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .dashboard-account-copy {
    display: grid;
    gap: 1px;
    min-width: 86px;
  }

  .dashboard-account-copy strong {
    color: #25282e;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 700;
  }

  .dashboard-account-copy span {
    color: #8a919b;
    font-size: 10px;
    line-height: 1.25;
  }

  @media (max-width: 991px) {
    .affiliate-layout-main {
      margin-left: 0;
    }

    .affiliate-layout-sidebar {
      transform: translateX(-100%);
      transition: transform 0.22s ease;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
    }

    .affiliate-layout-sidebar.open {
      transform: translateX(0);
    }

    .affiliate-layout-menu-btn {
      display: inline-flex;
    }

    .affiliate-layout-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.35);
      border: 0;
      z-index: 40;
    }

    .affiliate-layout-topbar {
      padding: 14px 16px;
    }

    .affiliate-layout-content {
      padding: 16px;
    }

    .dashboard-redesign .affiliate-layout-main {
      margin-left: 0;
    }

    .dashboard-redesign .affiliate-layout-sidebar {
      width: min(306px, 84vw);
      transform: translateX(-100%);
      box-shadow: none;
      z-index: 60;
      overflow: hidden;
    }

    .dashboard-redesign .affiliate-layout-sidebar.open {
      transform: translateX(0);
      box-shadow: 18px 0 48px rgba(20, 24, 31, 0.12);
    }

    .dashboard-redesign .affiliate-layout-backdrop {
      z-index: 55;
      background: rgba(17, 20, 25, 0.36);
    }

    .dashboard-redesign .dashboard-sidebar-close {
      margin-left: auto;
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 7px;
      background: #f4f5f6;
      color: #4f5864;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .dashboard-redesign .dashboard-layout-topbar {
      min-height: 64px;
      padding: 0 17px;
    }

    .dashboard-desktop-title,
    .dashboard-account {
      display: none;
    }

    .dashboard-redesign .dashboard-mobile-bar {
      width: 100%;
      display: grid;
      grid-template-columns: 36px 1fr 34px 34px;
      align-items: center;
      gap: 10px;
    }

    .dashboard-mobile-menu {
      width: 36px;
      height: 36px;
      border: 1px solid #dfe3e6;
      border-radius: 8px;
      background: #ffffff;
      color: #2f343c;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .dashboard-mobile-brand {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .dashboard-mobile-brand strong {
      color: #1d2025;
      font-size: 14px;
      font-weight: 760;
    }

    .dashboard-mobile-brand-mark {
      width: 27px;
      height: 27px;
      border-radius: 7px;
      background: #1c1f24;
      display: grid;
      place-items: center;
    }

    .dashboard-mobile-brand-mark span {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: #ffffff;
    }

    .dashboard-mobile-avatar {
      width: 32px;
      height: 32px;
      justify-self: end;
    }

    .dashboard-redesign .affiliate-layout-content {
      padding: 20px 17px 34px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-layout-topbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .affiliate-layout-topbar-left {
      width: 100%;
    }

    .affiliate-layout-user-card {
      width: 100%;
    }

    .affiliate-layout-topbar-copy h1 {
      font-size: 18px;
    }

    .affiliate-layout-topbar-copy p {
      font-size: 13px;
    }

    .dashboard-redesign .dashboard-layout-topbar {
      flex-direction: row;
      align-items: center;
    }
  }
  /* BLOGGAD_WRITER_MOBILE_BOTTOM_NAV_V1 */
  .writer-mobile-bottom-nav {
    display: none;
  }

  @media (max-width: 767px) {
    .writer-mobile-nav-enabled .affiliate-layout-content {
      padding-bottom: 108px;
    }

    .writer-mobile-bottom-nav {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
      min-height: 82px;
      padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
      border-top: 1px solid #e2e5e8;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(14px);
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      align-items: start;
      box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.05);
    }

    .writer-mobile-bottom-item {
      min-width: 0;
      min-height: 58px;
      padding: 5px 2px 3px;
      border: 0;
      border-radius: 10px;
      background: transparent;
      color: #7a828d;
      text-decoration: none;
      font: inherit;
      font-size: 10px;
      line-height: 1.15;
      font-weight: 650;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      cursor: pointer;
    }

    .writer-mobile-bottom-item:hover,
    .writer-mobile-bottom-item.active {
      color: #17191f;
    }

    .writer-mobile-bottom-icon {
      width: 31px;
      height: 31px;
      border-radius: 10px;
      display: grid;
      place-items: center;
    }

    .writer-mobile-bottom-item.active:not(.writer-write) .writer-mobile-bottom-icon {
      background: #f0f2f4;
    }

    .writer-mobile-bottom-item.writer-write {
      position: relative;
      margin-top: -12px;
      color: #17191f;
      font-weight: 750;
    }

    .writer-mobile-bottom-item.writer-write .writer-mobile-bottom-icon {
      width: 43px;
      height: 43px;
      border-radius: 999px;
      background: #17191f;
      color: #ffffff;
      box-shadow: 0 8px 18px rgba(23, 25, 31, 0.2);
    }

    .writer-mobile-bottom-item.writer-write.active .writer-mobile-bottom-icon {
      background: #000000;
    }
  }
`;
