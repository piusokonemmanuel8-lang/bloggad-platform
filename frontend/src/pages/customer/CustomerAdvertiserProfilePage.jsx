import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

function CustomerSidebar({ customer, onLogout, currentPath }) {
  const links = [
    { label: 'Overview', to: '/customer/dashboard' },
    { label: 'Advertiser', to: '/customer/advertiser' },
    { label: 'Advertiser Profile', to: '/customer/advertiser/profile' },
    { label: 'Saved Posts', to: '/customer/saved-posts' },
    { label: 'Saved Products', to: '/customer/saved-products' },
    { label: 'Messages', to: '/customer/messages' },
    { label: 'Settings', to: '/customer/settings' },
  ];

  return (
    <aside
      style={{
        borderRadius: 26,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        padding: 20,
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.06)',
        height: 'fit-content',
      }}
    >
      <div
        style={{
          borderRadius: 22,
          border: '1px solid #eef2f7',
          background: '#f8fafc',
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#6b7280',
            marginBottom: 8,
            fontWeight: 800,
          }}
        >
          Customer Dashboard
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#111827',
            lineHeight: 1.15,
          }}
        >
          {customer?.name || 'Customer'}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 14,
            color: '#6b7280',
            wordBreak: 'break-word',
          }}
        >
          {customer?.email || '-'}
        </div>
      </div>

      <nav style={{ marginTop: 18, display: 'grid', gap: 8 }}>
        {links.map((item) => {
          const active = currentPath === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                minHeight: 48,
                borderRadius: 16,
                border: active ? '1px solid #111827' : '1px solid #e5e7eb',
                background: active ? '#111827' : '#ffffff',
                color: active ? '#ffffff' : '#111827',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        style={{
          marginTop: 18,
          width: '100%',
          minHeight: 48,
          borderRadius: 16,
          border: '1px solid #fecaca',
          background: '#fff1f2',
          color: '#be123c',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </aside>
  );
}

export default function CustomerAdvertiserProfilePage() {
  const navigate = useNavigate();
  const token = useMemo(() => getStoredToken(), []);
  const storedUser = useMemo(() => getStoredUser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    brand_name: '',
    business_type: 'individual',
    country: '',
    state: '',
    city: '',
    address_line1: '',
    address_line2: '',
    notes: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(getApiUrl('/api/customer/advertiser/profile'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to load advertiser profile.');
        }

        if (!isMounted) return;

        const nextProfile = data?.advertiser_profile || null;
        setProfile(nextProfile);
        setForm({
          business_name: nextProfile?.business_name || '',
          contact_name: nextProfile?.contact_name || storedUser?.name || '',
          contact_email: nextProfile?.contact_email || storedUser?.email || '',
          contact_phone: nextProfile?.contact_phone || '',
          website_url: nextProfile?.website_url || '',
          brand_name: nextProfile?.brand_name || '',
          business_type: nextProfile?.business_type || 'individual',
          country: nextProfile?.country || '',
          state: nextProfile?.state || '',
          city: nextProfile?.city || '',
          address_line1: nextProfile?.address_line1 || '',
          address_line2: nextProfile?.address_line2 || '',
          notes: nextProfile?.notes || '',
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load advertiser profile.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, token, storedUser]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('user');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerLoginContext');
    navigate('/customer/login', { replace: true });
  }

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
      const response = await fetch(getApiUrl('/api/customer/advertiser/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to save advertiser profile.');
      }

      setProfile(data?.advertiser_profile || null);
      setSuccess(data?.message || 'Advertiser profile saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save advertiser profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .customer-advertiser-profile-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .customer-advertiser-profile-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 991px) {
          .customer-advertiser-profile-layout,
          .customer-advertiser-profile-form {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <div className="customer-advertiser-profile-layout">
          <CustomerSidebar
            customer={storedUser}
            onLogout={handleLogout}
            currentPath="/customer/advertiser/profile"
          />

          <main style={{ display: 'grid', gap: 24 }}>
            <section
              style={{
                borderRadius: 28,
                border: '1px solid #dbeafe',
                background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                padding: 24,
                boxShadow: '0 22px 50px rgba(59, 130, 246, 0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: '#dbeafe',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Advertiser Profile
                  </div>

                  <h1
                    style={{
                      margin: '14px 0 0',
                      fontSize: 40,
                      fontWeight: 800,
                      letterSpacing: '-0.05em',
                      lineHeight: 1.04,
                      color: '#111827',
                    }}
                  >
                    Set up your advertiser details
                  </h1>
                </div>

                <Link to="/customer/advertiser" style={secondaryBtnStyle}>
                  Back to Advertiser
                </Link>
              </div>
            </section>

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

            {loading ? (
              <div
                style={{
                  borderRadius: 20,
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  padding: '18px 20px',
                  fontSize: 14,
                  color: '#6b7280',
                }}
              >
                Loading advertiser profile...
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
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#111827',
                }}
              >
                Advertiser details
              </div>

              <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                <div className="customer-advertiser-profile-form">
                  <Field
                    label="Business Name"
                    name="business_name"
                    value={form.business_name}
                    onChange={handleChange}
                  />
                  <Field
                    label="Brand Name"
                    name="brand_name"
                    value={form.brand_name}
                    onChange={handleChange}
                  />
                  <Field
                    label="Contact Name"
                    name="contact_name"
                    value={form.contact_name}
                    onChange={handleChange}
                  />
                  <Field
                    label="Contact Email"
                    name="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={handleChange}
                  />
                  <Field
                    label="Contact Phone"
                    name="contact_phone"
                    value={form.contact_phone}
                    onChange={handleChange}
                  />
                  <Field
                    label="Website URL"
                    name="website_url"
                    value={form.website_url}
                    onChange={handleChange}
                  />

                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Business Type</label>
                    <select
                      name="business_type"
                      value={form.business_type}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="individual">individual</option>
                      <option value="company">company</option>
                      <option value="agency">agency</option>
                      <option value="brand">brand</option>
                      <option value="other">other</option>
                    </select>
                  </div>

                  <Field
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                  />
                  <Field
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                  />
                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                  />
                  <Field
                    label="Address Line 1"
                    name="address_line1"
                    value={form.address_line1}
                    onChange={handleChange}
                  />
                  <Field
                    label="Address Line 2"
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ ...fieldWrapStyle, marginTop: 16 }}>
                  <label style={labelStyle}>Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={5}
                    style={{
                      ...inputStyle,
                      minHeight: 120,
                      paddingTop: 14,
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <button type="submit" disabled={saving} style={primaryBtnStyle}>
                    {saving ? 'Saving...' : 'Save Advertiser Profile'}
                  </button>

                  <div
                    style={{
                      minHeight: 48,
                      borderRadius: 16,
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      color: '#6b7280',
                      fontSize: 14,
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0 16px',
                    }}
                  >
                    Verification: {profile?.verification_status || 'unverified'}
                  </div>
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text' }) {
  return (
    <div style={fieldWrapStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
}

const fieldWrapStyle = {
  display: 'grid',
  gap: 8,
};

const labelStyle = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: '#6b7280',
  fontWeight: 800,
};

const inputStyle = {
  width: '100%',
  minHeight: 52,
  borderRadius: 16,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  padding: '0 16px',
  fontSize: 14,
  color: '#111827',
  outline: 'none',
};

const primaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: 'none',
  background: '#2563eb',
  color: '#ffffff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  fontSize: 14,
  fontWeight: 700,
  textDecoration: 'none',
};