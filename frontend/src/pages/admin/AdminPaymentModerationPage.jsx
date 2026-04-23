import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

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

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        padding: 20,
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
      }}
    >
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 28,
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

export default function AdminPaymentModerationPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const hasToken = useMemo(() => {
    return !!(
      localStorage.getItem('bloggad_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken')
    );
  }, []);

  useEffect(() => {
    if (!hasToken) {
      navigate('/login', { replace: true });
    }
  }, [hasToken, navigate]);

  async function loadPayments(currentStatus = status, currentSearch = search) {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);
      if (currentSearch) params.set('search', currentSearch);

      const { data } = await api.get(
        `/api/admin/advertiser-payments${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load payments.');
      }

      setPayments(data?.payments || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasToken) {
      loadPayments('', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken]);

  async function handleApprove(paymentId) {
    setActingId(paymentId);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-payments/${paymentId}/approve`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to approve payment.');
      }

      setSuccess(data?.message || 'Payment approved successfully.');
      await loadPayments(status, search);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve payment.');
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(paymentId) {
    const rejectionReason = window.prompt('Enter rejection reason');
    if (!rejectionReason) return;

    setActingId(paymentId);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-payments/${paymentId}/reject`, {
        rejection_reason: rejectionReason,
      });

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to reject payment.');
      }

      setSuccess(data?.message || 'Payment rejected successfully.');
      await loadPayments(status, search);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reject payment.');
    } finally {
      setActingId(null);
    }
  }

  const stats = useMemo(() => {
    const pending = payments.filter((item) => item?.payment_status === 'pending').length;
    const paid = payments.filter((item) => item?.payment_status === 'paid').length;
    const failed = payments.filter((item) => item?.payment_status === 'failed').length;
    const totalAmount = payments.reduce((sum, item) => sum + Number(item?.amount || 0), 0);

    return { pending, paid, failed, totalAmount };
  }, [payments]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .admin-payment-moderation-top {
          display: flex;
          gap: 16px;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .admin-payment-moderation-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .admin-payment-moderation-filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px 160px;
          gap: 12px;
        }

        @media (max-width: 1100px) {
          .admin-payment-moderation-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-payment-moderation-filters {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .admin-payment-moderation-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1380, margin: '0 auto', display: 'grid', gap: 24 }}>
        <section
          style={{
            borderRadius: 28,
            border: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: 24,
            boxShadow: '0 22px 50px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div className="admin-payment-moderation-top">
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Payment Moderation
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
                Moderate customer funding requests
              </h1>

              <p
                style={{
                  margin: '12px 0 0',
                  maxWidth: 860,
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: '#6b7280',
                }}
              >
                Review wallet funding requests submitted by customers. Approving credits the advertiser
                wallet. Rejecting keeps the wallet unchanged.
              </p>
            </div>

            <Link to="/admin/dashboard" style={secondaryBtnStyle}>
              Back to Admin
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

        <div className="admin-payment-moderation-stats">
          <SummaryCard label="Pending" value={stats.pending} />
          <SummaryCard label="Paid" value={stats.paid} />
          <SummaryCard label="Failed" value={stats.failed} />
          <SummaryCard label="Visible Total" value={formatMoney(stats.totalAmount || 0)} />
        </div>

        <section
          style={{
            borderRadius: 24,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: 20,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div className="admin-payment-moderation-filters">
            <input
              type="text"
              placeholder="Search by business, customer, email, provider, reference"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="">All statuses</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
            </select>

            <button
              type="button"
              onClick={() => loadPayments(status, search)}
              style={primaryBtnStyle}
            >
              Filter
            </button>
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
            Funding requests
          </div>

          {loading ? (
            <div
              style={{
                marginTop: 20,
                borderRadius: 18,
                border: '1px solid #e5e7eb',
                background: '#f8fafc',
                padding: 16,
                color: '#6b7280',
                fontSize: 14,
              }}
            >
              Loading payments...
            </div>
          ) : (
            <div style={{ marginTop: 20, display: 'grid', gap: 14 }}>
              {payments.length ? (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    style={{
                      borderRadius: 18,
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: '#111827',
                          }}
                        >
                          {formatMoney(payment?.amount || 0, payment?.currency_code || 'USD')}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 14,
                            color: '#6b7280',
                            lineHeight: 1.7,
                          }}
                        >
                          {payment?.business_name || payment?.contact_name || 'Unknown business'} •{' '}
                          {payment?.user_name || '-'} • {payment?.user_email || '-'}
                        </div>
                      </div>

                      <StatusPill value={payment?.payment_status || 'pending'} />
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 12,
                      }}
                    >
                      <InfoCard label="Method" value={payment?.payment_method || '-'} />
                      <InfoCard label="Provider" value={payment?.provider_name || '-'} />
                      <InfoCard label="Reference" value={payment?.provider_reference || '-'} />
                      <InfoCard
                        label="Wallet Balance"
                        value={formatMoney(
                          payment?.available_balance || 0,
                          payment?.currency_code || 'USD'
                        )}
                      />
                    </div>

                    {payment?.proof_url ? (
                      <div
                        style={{
                          marginTop: 14,
                          fontSize: 14,
                          color: '#2563eb',
                          wordBreak: 'break-word',
                        }}
                      >
                        Proof URL: {payment.proof_url}
                      </div>
                    ) : null}

                    <div
                      style={{
                        marginTop: 16,
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Link to={`/admin/payment-moderation/${payment.id}`} style={secondaryBtnStyle}>
                        Open
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleApprove(payment.id)}
                        disabled={actingId === payment.id}
                        style={greenBtnStyle}
                      >
                        {actingId === payment.id ? 'Working...' : 'Approve'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(payment.id)}
                        disabled={actingId === payment.id}
                        style={dangerBtnStyle}
                      >
                        {actingId === payment.id ? 'Working...' : 'Reject'}
                      </button>
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
                  No funding requests found.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: '#6b7280',
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 15,
          fontWeight: 600,
          color: '#111827',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
    </div>
  );
}

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

const greenBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid #bbf7d0',
  background: '#ecfdf5',
  color: '#166534',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const dangerBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '0 18px',
  borderRadius: 16,
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#be123c',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};