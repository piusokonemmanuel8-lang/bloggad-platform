import { useMemo, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  ClipboardList,
  Wallet,
  BadgeDollarSign,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const adminMenu = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Verifications', to: '/admin/verifications', icon: ShieldCheck },
  { label: 'Listings', to: '/admin/listings', icon: BriefcaseBusiness },
  { label: 'Applications', to: '/admin/applications', icon: ClipboardList },
  { label: 'Wallet / Payments', to: '/admin/wallet', icon: Wallet },
  { label: 'Payroll / Finance', to: '/admin/payroll', icon: BadgeDollarSign },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

function isActivePath(pathname, to) {
  if (to === '/admin') {
    return pathname === '/admin';
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, bootstrapping, user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const current = adminMenu.find((item) => isActivePath(location.pathname, item.to));
    return current?.label || 'Administrator';
  }, [location.pathname]);

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-800 bg-slate-950 text-slate-100 transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Bloggad
            </p>
            <h1 className="mt-1 text-xl font-bold text-white">Administrator</h1>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-slate-800 px-5 py-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
            <p className="mt-2 truncate text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email || 'administrator access'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1.5">
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location.pathname, item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'group flex items-center justify-between rounded-2xl px-3 py-3 transition-all',
                    active
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={[
                        'inline-flex h-10 w-10 items-center justify-center rounded-xl border',
                        active
                          ? 'border-slate-200 bg-slate-100 text-slate-900'
                          : 'border-slate-800 bg-slate-900 text-slate-400 group-hover:text-white',
                      ].join(' ')}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </span>

                  <ChevronRight
                    size={16}
                    className={active ? 'text-slate-500' : 'text-slate-700 group-hover:text-slate-500'}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-[78px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
              >
                <Menu size={18} />
              </button>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                  Admin Panel
                </p>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{pageTitle}</h2>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                <p className="text-xs font-semibold text-slate-500">Administrator</p>
                <p className="max-w-[220px] truncate text-sm font-bold text-slate-900">
                  {user?.email || user?.name || 'Admin access'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-78px)] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}