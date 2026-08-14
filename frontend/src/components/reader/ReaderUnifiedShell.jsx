import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  CircleDollarSign,
  Crown,
  GraduationCap,
  Home,
  ExternalLink,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShoppingBag,
  Sparkles,
  Tags,
  UserRoundCheck,
  X,
} from 'lucide-react';
import api from '../../api/axios';
import RoleSwitcher from '../shared/RoleSwitcher';
import {
  clearSupgadReturnRole,
  getSupgadReturnUrl,
} from '../../utils/supgadReturn';
import './ReaderUnifiedShell.css';

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
];

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

function displayName(user) {
  return (
    user?.display_name ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    'Reader'
  );
}

function initialFor(value) {
  const clean = String(value || '').trim();
  return clean ? clean.charAt(0).toUpperCase() : 'R';
}

function ReaderNavigation({ onNavigate, supgadReturnUrl }) {
  return (
    <nav className="reader-unified-nav" aria-label="Reader navigation">
      {readerGroups.map((group) => (
        <div className="reader-unified-nav-group" key={group.label}>
          <div className="reader-unified-nav-label">{group.label}</div>
          <div className="reader-unified-nav-list">
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `reader-unified-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="reader-unified-nav-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={1.9} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}

      {supgadReturnUrl ? (
        <div className="reader-unified-nav-group">
          <div className="reader-unified-nav-label">Platform</div>
          <div className="reader-unified-nav-list">
            <a
              href={supgadReturnUrl}
              onClick={onNavigate}
              className="reader-unified-nav-item"
            >
              <span className="reader-unified-nav-icon" aria-hidden="true">
                <ExternalLink size={16} strokeWidth={1.9} />
              </span>
              <span>Supgad</span>
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

// BLOGGAD_READER_MOBILE_BOTTOM_NAV_V1
const readerMobileBottomItems = [
  { label: 'Home', to: '/reader/dashboard', icon: Home, end: true },
  { label: 'For You', to: '/reader/feed', icon: Sparkles, end: true },
  { label: 'Saved', to: '/reader/saved-posts', icon: Bookmark, end: true },
  { label: 'Notifications', to: '/reader/notifications', icon: Bell, end: true },
];

function ReaderMobileBottomNav({ onMenu, menuOpen }) {
  return (
    <nav
      className="reader-unified-mobile-bottom-nav"
      aria-label="Reader mobile navigation"
    >
      {readerMobileBottomItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `reader-unified-mobile-bottom-item${isActive ? ' active' : ''}`
            }
          >
            <span className="reader-unified-mobile-bottom-icon" aria-hidden="true">
              <Icon size={20} strokeWidth={1.9} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        className={`reader-unified-mobile-bottom-item${menuOpen ? ' active' : ''}`}
        onClick={onMenu}
        aria-label="Open Reader menu"
        aria-expanded={menuOpen}
      >
        <span className="reader-unified-mobile-bottom-icon" aria-hidden="true">
          <Menu size={20} strokeWidth={1.9} />
        </span>
        <span>Menu</span>
      </button>
    </nav>
  );
}
export default function ReaderUnifiedShell({
  title = 'Reader',
  subtitle = 'Reader workspace',
  children,
}) {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const readerName = useMemo(() => displayName(user), [user]);
  const supgadReturnUrl = useMemo(() => getSupgadReturnUrl(), []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [readerTier, setReaderTier] = useState('');

  useEffect(() => {
    let active = true;

    api.get('/api/reader/access/subscription')
      .then(({ data }) => {
        if (!active) return;
        const tier = String(data?.active_subscription?.plan_tier || '').trim().toLowerCase();
        setReaderTier(tier === 'premium' ? 'premium' : tier === 'basic' ? 'basic' : '');
      })
      .catch(() => {
        if (active) setReaderTier('');
      });

    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('supgad_token');
    localStorage.removeItem('user');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerLoginContext');
    clearSupgadReturnRole();
    navigate('/reader/login', { replace: true });
  }

  const sidebarContent = (
    <>
      <Link
        to="/"
        className="reader-unified-brand"
        style={{ color: 'inherit', textDecoration: 'none' }}
        aria-label="Go to Bloggad homepage"
        onClick={() => setMobileOpen(false)}
      >
        <span className="reader-unified-brand-mark" aria-hidden="true">B</span>
        <span className="reader-unified-brand-copy">
          <strong>Bloggad</strong>
          <small>Reader</small>
        </span>
      </Link>

      <ReaderNavigation
        onNavigate={() => setMobileOpen(false)}
        supgadReturnUrl={supgadReturnUrl}
      />

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: '1px solid #eef2f7',
        }}
      >
        <div
          style={{
            marginBottom: 8,
            color: '#8a96a8',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Advertiser
        </div>

        <NavLink
          to="/customer/advertiser"
          end
          onClick={() => setMobileOpen(false)}
          style={({ isActive }) => ({
            minHeight: 42,
            borderRadius: 9,
            border: isActive ? '1px solid #111827' : '1px solid #e5e7eb',
            background: isActive ? '#111827' : '#ffffff',
            color: isActive ? '#ffffff' : '#111827',
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
          })}
        >
          Advertiser Overview
        </NavLink>
      </div>

      <div
        className="reader-unified-advertiser-action"
        style={{
          marginTop: 8,
        }}
      >
        <NavLink
          to="/customer/advertiser/campaigns/create"
          onClick={() => setMobileOpen(false)}
          style={{
            minHeight: 42,
            borderRadius: 9,
            border: '1px solid #111827',
            background: '#111827',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 750,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 14px',
          }}
        >
          Create Campaign
        </NavLink>
      </div>

      <div className="reader-unified-account-card">
        <span className="reader-unified-account-avatar" aria-hidden="true">
          {initialFor(readerName)}
        </span>
        <span className="reader-unified-account-copy">
          <strong>{readerName}</strong>
          <small>
            Reader account
            {readerTier ? (
              <span className={`reader-unified-tier-badge ${readerTier}`}>
                {readerTier === 'premium' ? 'Premium' : 'Basic'}
              </span>
            ) : null}
          </small>
        </span>
        <button
          type="button"
          className="reader-unified-logout"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  );

  return (
    <div className="reader-unified-app">
      <aside className="reader-unified-sidebar">{sidebarContent}</aside>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="reader-unified-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-label="Close Reader menu"
          />
          <aside className="reader-unified-mobile-drawer">
            <div className="reader-unified-mobile-drawer-head">
              <span>Reader menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      ) : null}

      <div className="reader-unified-main">
        <header className="reader-unified-desktop-bar">
          <h1>{title}</h1>
          <div className="reader-unified-desktop-actions">
            <span className="reader-unified-desktop-subtitle">{subtitle}</span>
            <RoleSwitcher currentRole="reader" compact />
          </div>
        </header>

        <header className="reader-unified-mobile-bar">
          <button
            type="button"
            className="reader-unified-mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open Reader menu"
          >
            <Menu size={16} />
            <span>Menu</span>
          </button>

          <Link
            to="/"
            className="reader-unified-mobile-brand"
            style={{ color: 'inherit', textDecoration: 'none' }}
            aria-label="Go to Bloggad homepage"
          >
            <span className="reader-unified-brand-mark" aria-hidden="true">B</span>
            <span className="reader-unified-brand-copy">
              <strong>Bloggad</strong>
              <small>Reader</small>
            </span>
          </Link>

          <RoleSwitcher currentRole="reader" iconOnly />

          <span className="reader-unified-mobile-avatar" aria-label={readerName}>
            {initialFor(readerName)}
          </span>
        </header>

        <div className="reader-unified-content">{children}</div>

        <ReaderMobileBottomNav
          onMenu={() => setMobileOpen(true)}
          menuOpen={mobileOpen}
        />
      </div>
    </div>
  );
}
