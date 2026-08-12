import { useEffect, useMemo, useState } from 'react';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './CustomerSettingsApproved.css';

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

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export default function CustomerSettingsPage() {
  const token = useMemo(() => getStoredToken(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'customer',
    status: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function fetchSettings() {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await fetch(getApiUrl('/api/customer/settings'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await safeJson(response);

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to fetch Reader settings.');
        }

        const profile = data?.settings?.profile || {};

        if (!active) return;

        setForm({
          name: profile?.name || '',
          email: profile?.email || '',
          role: profile?.role || 'customer',
          status: profile?.status || '',
        });
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to fetch Reader settings.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchSettings();

    return () => {
      active = false;
    };
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(getApiUrl('/api/customer/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
        }),
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to save Reader settings.');
      }

      const customer = data?.customer || null;

      if (customer) {
        localStorage.setItem('user', JSON.stringify(customer));
        localStorage.setItem('customerUser', JSON.stringify(customer));
        setForm((prev) => ({
          ...prev,
          name: customer.name || prev.name,
          email: customer.email || prev.email,
          role: customer.role || prev.role,
          status: customer.status || prev.status,
        }));
      }

      setSuccess(data?.message || 'Reader settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save Reader settings.');
    } finally {
      setSaving(false);
    }
  }

  const displayRole =
    String(form.role || 'customer').toLowerCase() === 'customer'
      ? 'Reader'
      : form.role || 'Reader';

  const displayStatus = form.status
    ? `${String(form.status).charAt(0).toUpperCase()}${String(form.status).slice(1)}`
    : '-';

  return (
    <ReaderUnifiedShell title="Settings" subtitle="Reader account">
      <div className="reader-settings-approved">
        <h1 className="reader-settings-mobile-title">Settings</h1>

        <div className="reader-settings-desktop-note" role="note">
          <span className="reader-settings-info-mark" aria-hidden="true">i</span>
          <span>
            Your Reader profile is simple: update your name here. Email, role, and status remain account reference details.
          </span>
        </div>

        <div className="reader-settings-grid">
          <section className="reader-settings-card reader-settings-profile-card">
            <h2>Account profile</h2>
            <p className="reader-settings-card-copy">
              Update the name shown on your Reader account.
            </p>

            <form onSubmit={handleSubmit} className="reader-settings-form">
              <label className="reader-settings-field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  disabled={loading || saving}
                  placeholder={loading ? 'Loading...' : 'Reader name'}
                />
              </label>

              <p className="reader-settings-helper">
                Name is required. Saving updates only this profile field.
              </p>

              <button
                type="submit"
                className="reader-settings-save"
                disabled={loading || saving}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </section>

          <section className="reader-settings-card reader-settings-details-card">
            <h2>Account details</h2>
            <p className="reader-settings-card-copy">
              Reference information from your Reader account.
            </p>

            <div className="reader-settings-reference-list">
              <div className="reader-settings-field">
                <span>Email</span>
                <div className="reader-settings-readonly">
                  {loading ? 'Loading...' : form.email || '-'}
                </div>
              </div>

              <div className="reader-settings-field">
                <span>Role</span>
                <div className="reader-settings-readonly">
                  {loading ? 'Loading...' : displayRole}
                </div>
              </div>

              <div className="reader-settings-field">
                <span>Status</span>
                <div className="reader-settings-readonly">
                  {loading ? 'Loading...' : displayStatus}
                </div>
              </div>
            </div>

            <div className="reader-settings-readonly-note">
              Email, role, and status are read-only here.
            </div>
          </section>
        </div>

        {error ? (
          <div className="reader-settings-alert error" role="alert">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="reader-settings-alert success" role="status">
            {success}
          </div>
        ) : null}

        <div className="reader-settings-mobile-note" role="note">
          <span className="reader-settings-info-mark" aria-hidden="true">i</span>
          <span>Only the name is editable on this settings page.</span>
        </div>
      </div>
    </ReaderUnifiedShell>
  );
}