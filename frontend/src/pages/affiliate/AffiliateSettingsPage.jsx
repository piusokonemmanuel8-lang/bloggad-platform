import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AffiliateSettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const profileRows = useMemo(
    () => [
      { label: 'Full Name', value: user?.name || '-' },
      { label: 'Email', value: user?.email || '-' },
      { label: 'Role', value: user?.role || '-' },
      { label: 'Status', value: user?.status || '-' },
      { label: 'Email Verified', value: user?.email_verified_at || '-' },
      { label: 'Last Login', value: user?.last_login_at || '-' },
      { label: 'Created At', value: user?.created_at || '-' },
    ],
    [user]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            View your account details and sign out of your affiliate dashboard.
          </p>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Account Profile</h2>

            <div className="form-stack">
              {profileRows.map((item) => (
                <div key={item.label} className="surface-card surface-card-padding">
                  <div style={{ fontSize: '0.9rem', color: 'rgba(245,247,251,0.68)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 6 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Session</h2>

            <div className="form-stack">
              <div className="surface-card surface-card-padding">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Current Access</div>
                <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                  You are signed in as an affiliate user.
                </div>
              </div>

              <div className="surface-card surface-card-padding">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Security</div>
                <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                  Logging out clears your saved local session on this browser.
                </div>
              </div>

              <button className="btn btn-primary" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}