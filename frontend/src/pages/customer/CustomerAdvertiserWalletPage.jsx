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

function formatMoney(value, currency = 'USD') {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency || 'USD'} ${amount.toFixed(2)}`;
  }
}

function StatusPill({ value }) {
  const normalized = String(value || 'pending').toLowerCase();

  let bg = '#f3f4f6';
  let color = '#374151';

  if (normalized === 'paid') {
    bg = '#ecfdf5';
    color = '#166534';
  } else if (normalized === 'pending') {
    bg = '#eff6ff';
    color = '#1d4ed8';
  } else if (normalized === 'failed' || normalized === 'rejected') {
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
      {value || 'pending'}
    </span>
  );
}

function CustomerSidebar({ customer, onLogout, currentPath }) {
  const links = [
    { label: 'Overview', to: '/customer/dashboard' },
    { label: 'Advertiser', to: '/customer/advertiser' },
    { label: 'Advertiser Profile', to: '/customer/advertiser/profile' },
    { label: 'Advertiser Wallet', to: '/customer/advertiser/wallet' },
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

export default function CustomerAdvertiserWalletPage() {
  const navigate = useNavigate();
  const token = useMemo(() => getStoredToken(), []);
  const storedUser = useMemo(() => getStoredUser(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wallet, setWallet] = useState(null);
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    payment_method: 'manual',
    provider_name: '',
    provider_reference: '',
    currency_code: 'USD',
    proof_url: '',
    notes: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
      return;
    }

    let isMounted = true;

    async function loadWallet() {
      setLoading(true);
      setError('');

      try {
        const walletResponse = await fetch(getApiUrl('/api/customer/advertiser/wallet'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const walletData = await walletResponse.json();

        if (!walletResponse.ok || !walletData?.ok) {
          throw new Error(walletData?.message || 'Failed to load advertiser wallet.');
        }

        if (!isMounted) return;

        setWallet(walletData?.wallet || null);
        setPayments(walletData?.recent_payments || []);
        setTransactions(walletData?.recent_transactions || []);
        setForm((prev) => ({
          ...prev,
          currency_code: walletData?.wallet?.currency_code || 'USD',
        }));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load advertiser wallet.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, [navigate, token]);

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
      const response = await fetch(getApiUrl('/api/customer/advertiser/payments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: form.amount,
          payment_method: form.payment_method,
          provider_name: form.provider_name,
          provider_reference: form.provider_reference,
          currency_code: form.currency_code,
          proof_url: form.proof_url,
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to submit funding request.');
      }

      setSuccess(data?.message || 'Funding request submitted successfully.');
      setPayments((prev) => [data.payment, ...prev]);
      setForm((prev) => ({
        ...prev,
        amount: '',
        provider_name: '',
        provider_reference: '',
        proof_url: '',
        notes: '',
      }));
    } catch (err) {
      setError(err.message || 'Failed to submit funding request.');
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
        .customer-advertiser-wallet-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .customer-advertiser-wallet-top {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .customer-advertiser-wallet-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: 24px;
        }

        @media (max-width: 1100px) {
          .customer-advertiser-wallet-top {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 991px) {
          .customer-advertiser-wallet-layout,
          .customer-advertiser-wallet-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}>
        <div className="customer-advertiser-wallet-layout">
          <CustomerSidebar
            customer={storedUser}
            onLogout={handleLogout}
            currentPath="/customer/advertiser/wallet"
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
                    Advertiser Wallet
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
                    Fund and manage your wallet
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
                Loading wallet...
              </div>
            ) : null}

            <div className="customer-advertiser-wallet-top">
              <SummaryCard
                label="Available Balance"
                value={formatMoney(wallet?.available_balance || 0, wallet?.currency_code || 'USD')}
              />
              <SummaryCard
                label="Locked Balance"
                value={formatMoney(wallet?.locked_balance || 0, wallet?.currency_code || 'USD')}
              />
              <SummaryCard
                label="Total Funded"
                value={formatMoney(wallet?.total_funded || 0, wallet?.currency_code || 'USD')}
              />
            </div>

            <div className="customer-advertiser-wallet-grid">
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
                  Submit funding request
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'grid', gap: 16 }}>
                  <Field
                    label="Amount"
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                  />

                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Payment Method</label>
                    <select
                      name="payment_method"
                      value={form.payment_method}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="manual">manual</option>
                      <option value="bank_transfer">bank_transfer</option>
                      <option value="card">card</option>
                      <option value="crypto">crypto</option>
                    </select>
                  </div>

                  <Field
                    label="Provider Name"
                    name="provider_name"
                    value={form.provider_name}
                    onChange={handleChange}
                  />

                  <Field
                    label="Provider Reference"
                    name="provider_reference"
                    value={form.provider_reference}
                    onChange={handleChange}
                  />

                  <Field
                    label="Currency Code"
                    name="currency_code"
                    value={form.currency_code}
                    onChange={handleChange}
                  />

                  <Field
                    label="Proof URL"
                    name="proof_url"
                    value={form.proof_url}
                    onChange={handleChange}
                  />

                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={4}
                      style={{
                        ...inputStyle,
                        minHeight: 110,
                        paddingTop: 14,
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button type="submit" disabled={saving} style={primaryBtnStyle}>
                    {saving ? 'Submitting...' : 'Submit Funding Request'}
                  </button>
                </form>
              </section>

              <section
                style={{
                  display: 'grid',
                  gap: 24,
                }}
              >
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
                    Recent funding
                  </div>

                  <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                    {payments.length ? (
                      payments.slice(0, 6).map((payment) => (
                        <div
                          key={payment.id}
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
                              <div style={infoValueStyle}>
                                {formatMoney(
                                  payment?.amount || 0,
                                  payment?.currency_code || wallet?.currency_code || 'USD'
                                )}
                              </div>
                              <div style={infoSubTextStyle}>
                                {payment?.provider_name || payment?.payment_method || 'manual'}
                              </div>
                            </div>

                            <StatusPill value={payment?.payment_status || 'pending'} />
                          </div>

                          <div style={{ marginTop: 10, color: '#6b7280', fontSize: 13 }}>
                            {payment?.provider_reference || 'No payment reference'}
                          </div>
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
                        No funding requests yet.
                      </div>
                    )}
                  </div>
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
                    Recent transactions
                  </div>

                  <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
                    {transactions.length ? (
                      transactions.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            borderRadius: 18,
                            border: '1px solid #e5e7eb',
                            background: '#f8fafc',
                            padding: 16,
                          }}
                        >
                          <div style={infoValueStyle}>{item?.transaction_type || 'transaction'}</div>
                          <div style={infoSubTextStyle}>
                            {formatMoney(
                              item?.amount || 0,
                              wallet?.currency_code || 'USD'
                            )}{' '}
                            • {item?.direction || 'credit'}
                          </div>
                          <div style={{ marginTop: 6, color: '#6b7280', fontSize: 13 }}>
                            {item?.reference_code || item?.description || 'No reference'}
                          </div>
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
                        No wallet transactions yet.
                      </div>
                    )}
                  </div>
                </section>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: '1px solid #dbeafe',
        background: '#ffffff',
        padding: 20,
        boxShadow: '0 12px 30px rgba(59, 130, 246, 0.06)',
      }}
    >
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#111827',
        }}
      >
        {value}
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

const infoValueStyle = {
  marginTop: 10,
  fontSize: 15,
  fontWeight: 600,
  color: '#111827',
};

const infoSubTextStyle = {
  marginTop: 6,
  fontSize: 14,
  color: '#6b7280',
};