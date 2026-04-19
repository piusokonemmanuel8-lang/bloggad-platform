import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div className="affiliate-settings-page">
      <style>{styles}</style>

      <section className="affiliate-settings-hero">
        <div className="affiliate-settings-hero-copy">
          <div className="affiliate-settings-badge">Account settings</div>
          <h1 className="affiliate-settings-title">Settings</h1>
          <p className="affiliate-settings-subtitle">
            View your account details, current access information, and sign out of your
            affiliate dashboard safely.
          </p>
        </div>

        <div className="affiliate-settings-user-card">
          <div className="affiliate-settings-avatar">{getInitials(user)}</div>
          <div className="affiliate-settings-user-meta">
            <h3>{user?.name || user?.full_name || user?.fullName || 'Affiliate User'}</h3>
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
                <h3>You are signed in as an affiliate user</h3>
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