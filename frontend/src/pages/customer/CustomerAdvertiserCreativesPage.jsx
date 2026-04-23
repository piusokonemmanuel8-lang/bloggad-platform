import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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

function StatusPill({ value }) {
  const normalized = String(value || 'draft').toLowerCase();

  let bg = '#f3f4f6';
  let color = '#374151';

  if (normalized === 'approved') {
    bg = '#ecfdf5';
    color = '#166534';
  } else if (normalized === 'pending') {
    bg = '#eff6ff';
    color = '#1d4ed8';
  } else if (normalized === 'rejected') {
    bg = '#fff1f2';
    color = '#be123c';
  }

  return (
    <span
      style={{
        minHeight: 32,
        padding: '0 12px',
        borderRadius: 999,
        background: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {value || 'draft'}
    </span>
  );
}

function CustomerSidebar({ customer, onLogout, currentPath }) {
  const links = [
    { label: 'Overview', to: '/customer/dashboard' },
    { label: 'Advertiser', to: '/customer/advertiser' },
    { label: 'Advertiser Profile', to: '/customer/advertiser/profile' },
    { label: 'Advertiser Wallet', to: '/customer/advertiser/wallet' },
    { label: 'Advertiser Campaigns', to: '/customer/advertiser/campaigns' },
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

export default function CustomerAdvertiserCreativesPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const token = useMemo(() => getStoredToken(), []);
  const storedUser = useMemo(() => getStoredUser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [creatives, setCreatives] = useState([]);

  const [form, setForm] = useState({
    creative_type: 'image',
    asset_url: '',
    thumbnail_url: '',
    headline: '',
    body_text: '',
    button_text: '',
    html_code: '',
    width_px: '',
    height_px: '',
    alt_text: '',
    is_primary: true,
  });

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
      return;
    }

    let isMounted = true;

    async function loadCreatives() {
      setLoading(true);
      setError('');

      try {
        const [campaignResponse, creativesResponse] = await Promise.all([
          fetch(getApiUrl(`/api/customer/advertiser/campaigns/${campaignId}`), {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }),
          fetch(getApiUrl(`/api/customer/advertiser/campaigns/${campaignId}/creatives`), {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          }),
        ]);

        const [campaignData, creativesData] = await Promise.all([
          campaignResponse.json(),
          creativesResponse.json(),
        ]);

        if (!campaignResponse.ok || !campaignData?.ok) {
          throw new Error(campaignData?.message || 'Failed to load campaign.');
        }

        if (!creativesResponse.ok || !creativesData?.ok) {
          throw new Error(creativesData?.message || 'Failed to load creatives.');
        }

        if (!isMounted) return;

        setCampaign(campaignData?.campaign || null);
        setCreatives(creativesData?.creatives || []);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load creatives.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCreatives();

    return () => {
      isMounted = false;
    };
  }, [campaignId, navigate, token]);

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
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        getApiUrl(`/api/customer/advertiser/campaigns/${campaignId}/creatives`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            creative_type: form.creative_type,
            asset_url: form.asset_url,
            thumbnail_url: form.thumbnail_url,
            headline: form.headline,
            body_text: form.body_text,
            button_text: form.button_text,
            html_code: form.html_code,
            width_px: form.width_px || null,
            height_px: form.height_px || null,
            alt_text: form.alt_text,
            is_primary: form.is_primary ? 1 : 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to create creative.');
      }

      setSuccess(data?.message || 'Creative created successfully.');
      setCreatives((prev) => [data.creative, ...prev]);
      setForm({
        creative_type: 'image',
        asset_url: '',
        thumbnail_url: '',
        headline: '',
        body_text: '',
        button_text: '',
        html_code: '',
        width_px: '',
        height_px: '',
        alt_text: '',
        is_primary: false,
      });
    } catch (err) {
      setError(err.message || 'Failed to create creative.');
    } finally {
      setSaving(false);
    }
  }

  const showAssetFields = form.creative_type === 'image';
  const showHtmlField = form.creative_type === 'html';
  const showTextFields = ['text', 'native'].includes(form.creative_type);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .customer-advertiser-creatives-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .customer-advertiser-creatives-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: 24px;
        }

        .customer-advertiser-creatives-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 991px) {
          .customer-advertiser-creatives-layout,
          .customer-advertiser-creatives-grid,
          .customer-advertiser-creatives-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <div className="customer-advertiser-creatives-layout">
          <CustomerSidebar
            customer={storedUser}
            onLogout={handleLogout}
            currentPath="/customer/advertiser/campaigns"
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
                    Campaign Creatives
                  </div>

                  <h1
                    style={{
                      margin: '14px 0 0',
                      fontSize: 36,
                      fontWeight: 800,
                      letterSpacing: '-0.05em',
                      lineHeight: 1.04,
                      color: '#111827',
                    }}
                  >
                    {campaign?.campaign_name || 'Campaign Creatives'}
                  </h1>

                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <StatusPill value={campaign?.approval_status || 'draft'} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link
                    to={`/customer/advertiser/campaigns/${campaignId}`}
                    style={secondaryBtnStyle}
                  >
                    Back to Campaign
                  </Link>
                  <Link
                    to="/customer/advertiser/campaigns"
                    style={secondaryBtnStyle}
                  >
                    All Campaigns
                  </Link>
                </div>
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
                Loading creatives...
              </div>
            ) : null}

            <div className="customer-advertiser-creatives-grid">
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
                  Add new creative
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                  <div className="customer-advertiser-creatives-form-grid">
                    <div style={fieldWrapStyle}>
                      <label style={labelStyle}>Creative Type</label>
                      <select
                        name="creative_type"
                        value={form.creative_type}
                        onChange={handleChange}
                        style={inputStyle}
                      >
                        <option value="image">image</option>
                        <option value="html">html</option>
                        <option value="text">text</option>
                        <option value="native">native</option>
                      </select>
                    </div>

                    <Field
                      label="Headline"
                      name="headline"
                      value={form.headline}
                      onChange={handleChange}
                    />

                    {showAssetFields ? (
                      <>
                        <Field
                          label="Asset URL"
                          name="asset_url"
                          value={form.asset_url}
                          onChange={handleChange}
                        />
                        <Field
                          label="Thumbnail URL"
                          name="thumbnail_url"
                          value={form.thumbnail_url}
                          onChange={handleChange}
                        />
                      </>
                    ) : null}

                    {showTextFields || showAssetFields ? (
                      <>
                        <Field
                          label="Button Text"
                          name="button_text"
                          value={form.button_text}
                          onChange={handleChange}
                        />
                        <Field
                          label="Alt Text"
                          name="alt_text"
                          value={form.alt_text}
                          onChange={handleChange}
                        />
                      </>
                    ) : null}

                    {showAssetFields ? (
                      <>
                        <Field
                          label="Width PX"
                          name="width_px"
                          type="number"
                          value={form.width_px}
                          onChange={handleChange}
                        />
                        <Field
                          label="Height PX"
                          name="height_px"
                          type="number"
                          value={form.height_px}
                          onChange={handleChange}
                        />
                      </>
                    ) : null}
                  </div>

                  {showTextFields || showAssetFields ? (
                    <div style={fieldWrapStyle}>
                      <label style={labelStyle}>Body Text</label>
                      <textarea
                        name="body_text"
                        value={form.body_text}
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
                  ) : null}

                  {showHtmlField ? (
                    <div style={fieldWrapStyle}>
                      <label style={labelStyle}>HTML Code</label>
                      <textarea
                        name="html_code"
                        value={form.html_code}
                        onChange={handleChange}
                        rows={8}
                        style={{
                          ...inputStyle,
                          minHeight: 180,
                          paddingTop: 14,
                          resize: 'vertical',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  ) : null}

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 14,
                      color: '#111827',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="is_primary"
                      checked={form.is_primary}
                      onChange={handleChange}
                    />
                    Make this primary creative
                  </label>

                  <button type="submit" disabled={saving} style={primaryBtnStyle}>
                    {saving ? 'Saving...' : 'Add Creative'}
                  </button>
                </form>
              </section>

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
                  Existing creatives
                </div>

                <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                  {creatives.length ? (
                    creatives.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          borderRadius: 18,
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc',
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 12,
                            flexWrap: 'wrap',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: '#111827',
                              }}
                            >
                              {item?.headline || item?.creative_type || 'Creative'}
                            </div>
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 14,
                                color: '#6b7280',
                              }}
                            >
                              {item?.creative_type || '-'} {Number(item?.is_primary) === 1 ? '• primary' : ''}
                            </div>
                          </div>

                          <StatusPill value={item?.approval_status || 'draft'} />
                        </div>

                        {item?.asset_url ? (
                          <div
                            style={{
                              marginTop: 12,
                              borderRadius: 14,
                              overflow: 'hidden',
                              border: '1px solid #e5e7eb',
                              background: '#ffffff',
                            }}
                          >
                            <img
                              src={item.asset_url}
                              alt={item?.alt_text || item?.headline || 'Creative'}
                              style={{
                                width: '100%',
                                height: 180,
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          </div>
                        ) : null}

                        {item?.body_text ? (
                          <div
                            style={{
                              marginTop: 12,
                              color: '#6b7280',
                              fontSize: 14,
                              lineHeight: 1.7,
                            }}
                          >
                            {item.body_text}
                          </div>
                        ) : null}

                        {item?.rejection_reason ? (
                          <div
                            style={{
                              marginTop: 12,
                              borderRadius: 14,
                              border: '1px solid #fecaca',
                              background: '#fff1f2',
                              padding: 12,
                              color: '#be123c',
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {item.rejection_reason}
                          </div>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        borderRadius: 18,
                        border: '1px solid #e5e7eb',
                        background: '#f8fafc',
                        padding: 16,
                        color: '#6b7280',
                        fontSize: 14,
                      }}
                    >
                      No creatives yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
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
  textDecoration: 'none',
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