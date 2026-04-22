import { useMemo, useState } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function extractFirstName(user) {
  if (!user) return 'Affiliate';

  const possibleName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    user?.first_name ||
    user?.firstName ||
    '';

  if (!possibleName || typeof possibleName !== 'string') return 'Affiliate';

  return possibleName.trim().split(' ')[0] || 'Affiliate';
}

function getGreeting(name = '') {
  const hour = new Date().getHours();

  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export default function AffiliateLayout() {
  const { isAuthenticated, isAffiliate, bootstrapping, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = useMemo(() => extractFirstName(user), [user]);
  const greeting = useMemo(() => getGreeting(firstName), [firstName]);

  const navItems = [
    { label: 'Dashboard', to: '/affiliate/dashboard', icon: LayoutDashboard },
    { label: 'Website', to: '/affiliate/website', icon: Globe },
    { label: 'Products', to: '/affiliate/products', icon: ShoppingBag },
    { label: 'Posts', to: '/affiliate/posts/create', icon: FileText },
    { label: 'Templates', to: '/affiliate/templates/choose', icon: LayoutTemplate },
    { label: 'Menus', to: '/affiliate/menus', icon: MenuSquare },
    { label: 'Sliders', to: '/affiliate/sliders', icon: SlidersHorizontal },
    { label: 'Media Library', to: '/affiliate/media', icon: ImageIcon },
    { label: 'Design', to: '/affiliate/design', icon: Palette },
    { label: 'Analytics', to: '/affiliate/analytics', icon: BarChart3 },
    { label: 'My Customers', to: '/affiliate/customers', icon: Users },
    { label: 'Email Lists', to: '/affiliate/email-lists', icon: Mail },
    { label: 'Chats', to: '/affiliate/chats', icon: MessageSquare },
    { label: 'Subscription', to: '/affiliate/subscription', icon: CreditCard },
    { label: 'Settings', to: '/affiliate/settings', icon: Settings },
  ];

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
    <div className="affiliate-layout-shell">
      <style>{styles}</style>

      <aside className={`affiliate-layout-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="affiliate-layout-sidebar-top">
          <div className="affiliate-layout-brand">
            <div className="affiliate-layout-brand-logo">BG</div>

            <div className="affiliate-layout-brand-copy">
              <h2>Bloggad</h2>
              <p>Affiliate Panel</p>
            </div>
          </div>
        </div>

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
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="affiliate-layout-nav-left">
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight size={16} />
                </NavLink>
              );
            })}
          </nav>
        </div>
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
              <p>Manage your website, products, posts, design, analytics, customers, email lists, chats, and settings from one place.</p>
            </div>
          </div>

          <div className="affiliate-layout-user-card">
            <div className="affiliate-layout-user-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="affiliate-layout-user-copy">
              <strong>{firstName}</strong>
              <span>Affiliate Account</span>
            </div>
          </div>
        </header>

        <main className="affiliate-layout-content">
          <Outlet />
        </main>
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
  }
`;