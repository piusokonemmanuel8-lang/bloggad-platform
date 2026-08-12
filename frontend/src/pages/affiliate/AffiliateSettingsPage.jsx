import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  LogOut,
  Clock3,
  BadgeCheck,
  LockKeyhole,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

function getInitials(user) {
  const name =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    'A';

  return String(name)
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export default function AffiliateSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const profileRows = useMemo(
    () => [
      {
        label: 'Full Name',
        value: user?.name || user?.full_name || user?.fullName || '-',
        icon: User,
      },
      {
        label: 'Email',
        value: user?.email || '-',
        icon: Mail,
      },
      {
        label: 'Role',
        value: user?.role || '-',
        icon: ShieldCheck,
      },
      {
        label: 'Status',
        value: user?.status || '-',
        icon: BadgeCheck,
      },
      {
        label: 'Email Verified',
        value: user?.email_verified_at || '-',
        icon: BadgeCheck,
      },
      {
        label: 'Last Login',
        value: user?.last_login_at || '-',
        icon: Clock3,
      },
      {
        label: 'Created At',
        value: user?.created_at || '-',
        icon: CalendarDays,
      },
    ],
    [user]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

const isWriterRoute = location.pathname === '/writer/settings';
  const displayName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    'Writer';
  const writerRole = user?.role || '-';
  const writerStatus = user?.status || '-';
  const writerVerified = user?.email_verified_at ? 'Verified' : 'Not verified';

  if (isWriterRoute) {
    return (
      <div className="writer-settings-page">
        <style>{writerSettingsStyles}</style>

        <div className="writer-settings-mobile-title">Settings</div>

        <section className="writer-settings-identity-card">
          <div className="writer-settings-identity-main">
            <div className="writer-settings-avatar">{getInitials(user)}</div>

            <div className="writer-settings-identity-copy">
              <strong>{displayName}</strong>
              <span>{user?.email || '-'}</span>
            </div>
          </div>

          <div className="writer-settings-identity-badges">
            <span className="writer-settings-pill neutral">{writerRole}</span>
            <span className={`writer-settings-pill ${writerStatus === 'active' ? 'success' : 'neutral'}`}>
              {writerStatus}
            </span>
            <span className={`writer-settings-pill ${user?.email_verified_at ? 'info' : 'neutral'}`}>
              {writerVerified}
            </span>
          </div>

          <span className="writer-settings-identity-note">Account details</span>
        </section>

        <div className="writer-settings-grid">
          <section className="writer-settings-card writer-settings-profile-card">
            <div className="writer-settings-section-heading">
              <strong>Account Profile</strong>
              <span>Current account information from your Writer session.</span>
            </div>

            <div className="writer-settings-profile-grid">
              {profileRows.map((item, index) => {
                const symbols = ['N', '@', 'R', 'S', 'V', 'L', 'C'];
                const value =
                  item.label === 'Email Verified'
                    ? user?.email_verified_at
                      ? 'Verified'
                      : 'Not verified'
                    : item.value;

                return (
                  <div className="writer-settings-profile-row" key={item.label}>
                    <div className="writer-settings-field-icon">{symbols[index] || '-'}</div>

                    <div className="writer-settings-profile-copy">
                      <span>{item.label}</span>
                      <strong>{value}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="writer-settings-readonly-note">
              <strong>Read-only account information</strong>
              <span>
                These values come from your signed-in account. This page does not add profile editing
                controls.
              </span>
            </div>
          </section>

          <aside className="writer-settings-side-stack">
            <section className="writer-settings-card writer-settings-access-card">
              <div className="writer-settings-section-heading">
                <strong>Current Access</strong>
                <span className="writer-settings-desktop-only">SESSION</span>
              </div>

              <div className="writer-settings-access-info">
                <strong>You are signed in as a Writer</strong>
                <span>Your dashboard access is active on this browser session.</span>
              </div>

              <div className="writer-settings-session-state">
                <div>
                  <span className="writer-settings-desktop-only">SESSION STATUS</span>
                  <p className="writer-settings-desktop-only">
                    Local account session is currently available.
                  </p>
                </div>

                <span className="writer-settings-pill success">Active</span>
              </div>
            </section>

            <section className="writer-settings-card writer-settings-security-card">
              <div className="writer-settings-section-heading">
                <strong>Security</strong>
                <span>Logging out clears your saved local session on this browser.</span>
              </div>

              <div className="writer-settings-security-note">
                <strong className="writer-settings-desktop-only">Session protection</strong>
                <span>Use Logout when you are finished on a shared device.</span>
              </div>

              <button
                className="writer-settings-logout-button"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </section>

            <section className="writer-settings-card writer-settings-account-data-card">
              <div className="writer-settings-section-heading">
                <strong>Account Data</strong>
                <span>Profile values are loaded from your authenticated Writer account.</span>
              </div>

              <div className="writer-settings-data-row">
                <span>SOURCE</span>
                <strong>Current signed-in session</strong>
              </div>

              <div className="writer-settings-data-row">
                <span>ACTION</span>
                <strong>Logout only</strong>
              </div>
            </section>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-settings-page">
      <style>{styles}</style>

      <section className="affiliate-settings-hero">
        <div className="affiliate-settings-hero-copy">
          <div className="affiliate-settings-badge">Account settings</div>
          <h1 className="affiliate-settings-title">Settings</h1>
          <p className="affiliate-settings-subtitle">
            View your account details, current access information, and sign out of your
            Writer dashboard safely.
          </p>
        </div>

        <div className="affiliate-settings-user-card">
          <div className="affiliate-settings-avatar">{getInitials(user)}</div>
          <div className="affiliate-settings-user-meta">
            <h3>{user?.name || user?.full_name || user?.fullName || 'Writer'}</h3>
            <p>{user?.email || '-'}</p>
          </div>
        </div>
      </section>

      <section className="affiliate-settings-grid">
        <div className="affiliate-settings-panel">
          <div className="affiliate-settings-panel-head">
            <div>
              <p className="affiliate-settings-panel-kicker">Profile</p>
              <h2 className="affiliate-settings-panel-title">Account Profile</h2>
            </div>
          </div>

          <div className="affiliate-settings-profile-list">
            {profileRows.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="affiliate-settings-profile-row">
                  <div className="affiliate-settings-profile-left">
                    <div className="affiliate-settings-profile-icon">
                      <Icon size={17} />
                    </div>

                    <div>
                      <div className="affiliate-settings-profile-label">{item.label}</div>
                      <div className="affiliate-settings-profile-value">{item.value}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="affiliate-settings-side-stack">
          <div className="affiliate-settings-panel">
            <div className="affiliate-settings-panel-head">
              <div>
                <p className="affiliate-settings-panel-kicker">Session</p>
                <h2 className="affiliate-settings-panel-title">Current Access</h2>
              </div>
            </div>

            <div className="affiliate-settings-info-card">
              <div className="affiliate-settings-info-icon">
                <ShieldCheck size={18} />
              </div>

              <div>
                <h3>You are signed in as a Writer</h3>
                <p>Your dashboard access is active on this browser session.</p>
              </div>
            </div>

            <div className="affiliate-settings-info-card">
              <div className="affiliate-settings-info-icon">
                <LockKeyhole size={18} />
              </div>

              <div>
                <h3>Security</h3>
                <p>Logging out clears your saved local session on this browser.</p>
              </div>
            </div>

            <button
              className="affiliate-settings-logout-btn"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-settings-page {
    width: 100%;
  }

  .affiliate-settings-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-settings-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-settings-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-settings-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-settings-user-card {
    min-width: 280px;
    display: flex;
    align-items: center;
    gap: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 16px;
  }

  .affiliate-settings-avatar {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    background: #111827;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .affiliate-settings-user-meta h3 {
    margin: 0 0 5px;
    font-size: 17px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-settings-user-meta p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
    word-break: break-word;
  }

  .affiliate-settings-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
    gap: 20px;
  }

  .affiliate-settings-side-stack {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .affiliate-settings-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-settings-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-settings-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-settings-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-settings-profile-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-settings-profile-row {
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-settings-profile-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .affiliate-settings-profile-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-settings-profile-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  .affiliate-settings-profile-value {
    font-size: 15px;
    font-weight: 800;
    color: #111827;
    line-height: 1.5;
    word-break: break-word;
  }

  .affiliate-settings-info-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    margin-bottom: 14px;
  }

  .affiliate-settings-info-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-settings-info-card h3 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 900;
    color: #111827;
    line-height: 1.3;
  }

  .affiliate-settings-info-card p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .affiliate-settings-logout-btn {
    height: 48px;
    width: 100%;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #111827;
    background: #111827;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  @media (max-width: 1100px) {
    .affiliate-settings-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 991px) {
    .affiliate-settings-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-settings-title {
      font-size: 26px;
    }

    .affiliate-settings-user-card {
      width: 100%;
      min-width: 0;
    }

    .affiliate-settings-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-settings-title {
      font-size: 22px;
    }

    .affiliate-settings-subtitle {
      font-size: 14px;
    }

    .affiliate-settings-profile-left,
    .affiliate-settings-info-card {
      align-items: flex-start;
    }
  }
`;

const writerSettingsStyles = `
  * {
    box-sizing: border-box;
  }

  .writer-settings-page {
    width: 100%;
    min-width: 0;
    color: #161a20;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-settings-page button {
    font: inherit;
  }

  .writer-settings-mobile-title {
    display: none;
  }

  .writer-settings-card,
  .writer-settings-identity-card {
    background: #ffffff;
    border: 1px solid #e3e6ea;
    border-radius: 12px;
    box-shadow: none;
  }

  .writer-settings-identity-card {
    min-height: 90px;
    margin-bottom: 14px;
    padding: 14px;
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .writer-settings-identity-main {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .writer-settings-avatar {
    flex: 0 0 auto;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #1e2329;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
  }

  .writer-settings-identity-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .writer-settings-identity-copy > strong {
    color: #161a20;
    font-size: 15px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-settings-identity-copy > span {
    color: #68707c;
    font-size: 11px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .writer-settings-identity-badges {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-settings-pill {
    min-height: 28px;
    padding: 0 14px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .writer-settings-pill.neutral {
    border: 1px solid #e3e6ea;
    background: #f7f8fa;
    color: #4b5563;
  }

  .writer-settings-pill.success {
    border: 1px solid #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-settings-pill.info {
    border: 1px solid #b2ddff;
    background: #eff8ff;
    color: #175cd3;
  }

  .writer-settings-identity-note {
    flex: 0 0 130px;
    color: #8a929c;
    font-size: 10px;
    line-height: 1.3;
    text-align: right;
  }

  .writer-settings-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr);
    gap: 12px;
    align-items: stretch;
  }

  .writer-settings-card {
    min-width: 0;
    padding: 14px;
  }

  .writer-settings-profile-card {
    min-height: 704px;
  }

  .writer-settings-section-heading {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-settings-section-heading > strong {
    color: #161a20;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-settings-section-heading > span {
    color: #68707c;
    font-size: 11px;
    line-height: 1.4;
  }

  .writer-settings-profile-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 16px;
  }

  .writer-settings-profile-row {
    min-width: 0;
    min-height: 64px;
    padding: 10px;
    border: 1px solid #edf0f2;
    border-radius: 10px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-settings-field-icon {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border: 1px solid #e3e6ea;
    border-radius: 10px;
    background: #ffffff;
    color: #667085;
    display: grid;
    place-items: center;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
  }

  .writer-settings-profile-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-settings-profile-copy > span {
    color: #7b8491;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 700;
    text-transform: uppercase;
  }

  .writer-settings-profile-copy > strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .writer-settings-readonly-note {
    min-height: 76px;
    margin-top: 22px;
    padding: 12px;
    border: 1px solid #edf0f2;
    border-radius: 10px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .writer-settings-readonly-note > strong {
    color: #161a20;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-settings-readonly-note > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-settings-side-stack {
    min-width: 0;
    display: grid;
    grid-template-rows: auto auto 1fr;
    gap: 12px;
  }

  .writer-settings-access-card {
    min-height: 264px;
  }

  .writer-settings-access-card .writer-settings-section-heading > span,
  .writer-settings-data-row > span {
    color: #98a2b3;
    font-size: 9px;
    font-weight: 700;
  }

  .writer-settings-access-info {
    min-height: 82px;
    padding: 12px;
    border: 1px solid #edf0f2;
    border-radius: 10px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-settings-access-info > strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 600;
  }

  .writer-settings-access-info > span,
  .writer-settings-session-state p {
    margin: 0;
    color: #68707c;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-settings-session-state {
    min-height: 76px;
    margin-top: 12px;
    padding: 10px 12px;
    border: 1px solid #e3e6ea;
    border-radius: 10px;
    background: #ffffff;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-settings-session-state > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-settings-security-card {
    min-height: 232px;
  }

  .writer-settings-security-note {
    min-height: 66px;
    margin-top: 8px;
    padding: 11px 12px;
    border: 1px solid #edf0f2;
    border-radius: 10px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .writer-settings-security-note > strong {
    color: #161a20;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-settings-security-note > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.4;
  }

  .writer-settings-logout-button {
    width: 100%;
    min-height: 48px;
    margin-top: 16px;
    padding: 0 16px;
    border: 1px solid #1e2329;
    border-radius: 9px;
    background: #1e2329;
    color: #ffffff;
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-settings-account-data-card {
    min-height: 184px;
  }

  .writer-settings-data-row {
    min-height: 34px;
    border-top: 1px solid #edf0f2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-settings-data-row > strong {
    color: #161a20;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 600;
    text-align: right;
  }

  @media (max-width: 960px) {
    .writer-settings-grid {
      grid-template-columns: minmax(0, 1.4fr) minmax(300px, 1fr);
    }

    .writer-settings-identity-note {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .writer-settings-mobile-title {
      min-height: 46px;
      margin-bottom: 10px;
      padding: 0 10px;
      border: 1px solid #e3e6ea;
      border-radius: 10px;
      background: #ffffff;
      display: flex;
      align-items: center;
      color: #161a20;
      font-size: 13px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-settings-identity-card {
      min-height: 86px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
      gap: 10px;
    }

    .writer-settings-identity-main {
      gap: 12px;
    }

    .writer-settings-avatar {
      width: 50px;
      height: 50px;
      font-size: 12px;
    }

    .writer-settings-identity-copy {
      gap: 6px;
    }

    .writer-settings-identity-copy > strong {
      font-size: 12px;
    }

    .writer-settings-identity-copy > span {
      font-size: 10px;
    }

    .writer-settings-identity-badges {
      margin-left: auto;
    }

    .writer-settings-identity-badges .neutral,
    .writer-settings-identity-badges .info {
      display: none;
    }

    .writer-settings-pill {
      min-height: 28px;
      padding: 0 14px;
      font-size: 10px;
    }

    .writer-settings-grid,
    .writer-settings-side-stack {
      display: block;
    }

    .writer-settings-card {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-settings-profile-card {
      min-height: 0;
    }

    .writer-settings-section-heading {
      margin-bottom: 12px;
      gap: 5px;
    }

    .writer-settings-section-heading > strong {
      font-size: 12px;
    }

    .writer-settings-section-heading > span {
      font-size: 9px;
    }

    .writer-settings-profile-grid {
      display: block;
    }

    .writer-settings-profile-row {
      min-height: 62px;
      margin-bottom: 6px;
      padding: 9px;
      border-radius: 9px;
      gap: 11px;
    }

    .writer-settings-field-icon {
      width: 40px;
      height: 40px;
      border-radius: 9px;
      font-size: 9px;
    }

    .writer-settings-profile-copy {
      gap: 5px;
    }

    .writer-settings-profile-copy > span {
      font-size: 8px;
    }

    .writer-settings-profile-copy > strong {
      font-size: 11px;
    }

    .writer-settings-readonly-note,
    .writer-settings-account-data-card {
      display: none;
    }

    .writer-settings-access-card {
      min-height: 134px;
      position: relative;
    }

    .writer-settings-access-card .writer-settings-section-heading {
      margin-bottom: 22px;
    }

    .writer-settings-access-info {
      min-height: 0;
      padding: 0;
      border: 0;
      background: transparent;
      gap: 9px;
    }

    .writer-settings-access-info > strong {
      font-size: 11px;
    }

    .writer-settings-access-info > span {
      font-size: 9px;
    }

    .writer-settings-session-state {
      position: absolute;
      top: 9px;
      right: 10px;
      min-height: 28px;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
    }

    .writer-settings-session-state > div {
      display: none;
    }

    .writer-settings-security-card {
      min-height: 194px;
    }

    .writer-settings-security-note {
      min-height: 52px;
      margin-top: 18px;
      padding: 10px;
    }

    .writer-settings-security-note > span {
      font-size: 9px;
    }

    .writer-settings-logout-button {
      min-height: 40px;
      margin-top: 12px;
      font-size: 11px;
    }

    .writer-settings-desktop-only {
      display: none !important;
    }
  }
`;
