import { useEffect, useMemo, useState } from 'react';
import CustomerPageShell from '../../components/customer/CustomerPageShell';

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
          throw new Error(data?.message || 'Failed to fetch customer settings.');
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
        setError(err.message || 'Failed to fetch customer settings.');
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
        throw new Error(data?.message || 'Failed to save customer settings.');
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

      setSuccess(data?.message || 'Customer settings saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save customer settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <CustomerPageShell
      currentPath="/customer/settings"
      badge="Profile Settings"
      title="Manage your account"
      subtitle="Update your customer name here. Email, role, and status are shown for reference."
    >
      {error ? (
        <div
          style={{
            borderRadius: 20,
            border: '1px solid #fecaca',
            background: '#fff1f2',
            padding: '16px 18px',
            fontSize: 14,
            color: '#be123c',
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            borderRadius: 20,
            border: '1px solid #bbf7d0',
            background: '#ecfdf5',
            padding: '16px 18px',
            fontSize: 14,
            color: '#166534',
          }}
        >
          {success}
        </div>
      ) : null}

      <section
        style={{
          borderRadius: 24,
          border: '1px solid #e5e7eb',
          background: '#ffffff',
          padding: 20,
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
        }}
      >
        {loading ? (
          <div
            style={{
              fontSize: 14,
              color: '#6b7280',
            }}
          >
            Loading settings...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gap: 20,
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={form.email}
                readOnly
                style={readOnlyInputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Role
              </label>
              <input
                type="text"
                value={form.role}
                readOnly
                style={readOnlyInputStyle}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Status
              </label>
              <input
                type="text"
                value={form.status}
                readOnly
                style={readOnlyInputStyle}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  minHeight: 48,
                  padding: '0 18px',
                  borderRadius: 16,
                  border: '1px solid #111827',
                  background: '#111827',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.65 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </section>
    </CustomerPageShell>
  );
}

const inputStyle = {
  width: '100%',
  minHeight: 48,
  borderRadius: 16,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  padding: '0 16px',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
};

const readOnlyInputStyle = {
  width: '100%',
  minHeight: 48,
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  padding: '0 16px',
  fontSize: 14,
  color: '#6b7280',
  outline: 'none',
};