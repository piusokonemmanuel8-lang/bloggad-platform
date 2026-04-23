import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function AdminPaymentModerationDetailsPage() {
  const navigate = useNavigate();
  const { paymentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payment, setPayment] = useState(null);

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

  async function loadPayment() {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(`/api/admin/advertiser-payments/${paymentId}`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load payment.');
      }

      setPayment(data?.payment || null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load payment.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasToken && paymentId) {
      loadPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken, paymentId]);

  async function handleApprove() {
    setActing(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(`/api/admin/advertiser-payments/${paymentId}/approve`);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to approve payment.');
      }

      setSuccess(data?.message || 'Payment approved successfully.');
      await loadPayment();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve payment.');
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    const rejectionReason = window.prompt('Enter rejection reason');
    if (!rejectionReason) return;

    setActing(true);
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
      await loadPayment();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reject payment.');
    } finally {
      setActing(false);
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
        .admin-payment-detail-top {
          display: flex;
          gap: 16px;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .admin-payment-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 24px;
        }

        .admin-payment-detail-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .admin-payment-detail-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-payment-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .admin-payment-detail-stats {
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
          <div className="admin-payment-detail-top">
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
                Payment Review
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
                Funding request details
              </h1>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <StatusPill value={payment?.payment_status || 'pending'} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/admin/payment-moderation" style={secondaryBtnStyle}>
                Back
              </Link>
              <button type="button" onClick={handleApprove} disabled={acting} style={greenBtnStyle}>
                {acting ? 'Working...' : 'Approve'}
              </button>
              <button type="button" onClick={handleReject} disabled={acting} style={dangerBtnStyle}>
                {acting ? 'Working...' : 'Reject'}
              </button>
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
            Loading payment...
          </div>
        ) : (
          <>
            <div className="admin-payment-detail-stats">
              <SummaryCard
                label="Amount"
                value={formatMoney(payment?.amount || 0, payment?.currency_code || 'USD')}
              />
              <SummaryCard
                label="Wallet Balance"
                value={formatMoney(payment?.available_balance || 0, payment?.currency_code || 'USD')}
              />
              <SummaryCard
                label="Locked Balance"
                value={formatMoney(payment?.locked_balance || 0, payment?.currency_code || 'USD')}
              />
              <SummaryCard
                label="Total Funded"
                value={formatMoney(payment?.total_funded || 0, payment?.currency_code || 'USD')}
              />
            </div>

            <div className="admin-payment-detail-grid">
              <section
                style={{
                  borderRadius: 24,
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  padding: 20,
                  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
                  display: 'grid',
                  gap: 24,
                }}
              >
                <div>
                  <div style={sectionTitleStyle}>Customer and business</div>
                  <div style={infoGridStyle}>
                    <InfoCard label="Customer Name" value={payment?.user_name || '-'} />
                    <InfoCard label="Customer Email" value={payment?.user_email || '-'} />
                    <InfoCard label="Business Name" value={payment?.business_name || '-'} />
                    <InfoCard label="Contact Name" value={payment?.contact_name || '-'} />
                    <InfoCard label="Contact Email" value={payment?.contact_email || '-'} />
                    <InfoCard label="Phone" value={payment?.contact_phone || '-'} />
                  </div>
                </div>

                <div>
                  <div style={sectionTitleStyle}>Payment details</div>
                  <div style={infoGridStyle}>
                    <InfoCard label="Method" value={payment?.payment_method || '-'} />
                    <InfoCard label="Provider" value={payment?.provider_name || '-'} />
                    <InfoCard label="Reference" value={payment?.provider_reference || '-'} />
                    <InfoCard label="Status" value={payment?.payment_status || '-'} />
                    <InfoCard label="Brand Name" value={payment?.brand_name || '-'} />
                    <InfoCard label="Business Type" value={payment?.business_type || '-'} />
                    <InfoCard label="Verification" value={payment?.verification_status || '-'} />
                    <InfoCard label="Website" value={payment?.website_url || '-'} breakWord />
                  </div>
                </div>

                <div>
                  <div style={sectionTitleStyle}>Notes</div>
                  <div style={listCardStyle}>
                    <div style={listSubStyle}>{payment?.notes || 'No notes added.'}</div>
                  </div>
                </div>
              </section>

              <section
                style={{
                  borderRadius: 24,
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  padding: 20,
                  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
                  display: 'grid',
                  gap: 20,
                  alignContent: 'start',
                }}
              >
                <div>
                  <div style={sectionTitleStyle}>Proof</div>
                  {payment?.proof_url ? (
                    <a
                      href={payment.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#2563eb',
                        fontSize: 14,
                        wordBreak: 'break-word',
                        textDecoration: 'none',
                      }}
                    >
                      {payment.proof_url}
                    </a>
                  ) : (
                    <div style={listSubStyle}>No proof URL provided.</div>
                  )}
                </div>

                <div>
                  <div style={sectionTitleStyle}>Moderation actions</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <button type="button" onClick={handleApprove} disabled={acting} style={greenBtnStyle}>
                      {acting ? 'Working...' : 'Approve and Credit Wallet'}
                    </button>
                    <button type="button" onClick={handleReject} disabled={acting} style={dangerBtnStyle}>
                      {acting ? 'Working...' : 'Reject Request'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
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

function InfoCard({ label, value, breakWord = false }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        background: '#f8fafc',
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
          wordBreak: breakWord ? 'break-word' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}

const sectionTitleStyle = {
  fontSize: 24,
  fontWeight: 800,
  letterSpacing: '-0.03em',
  color: '#111827',
  marginBottom: 16,
};

const infoGridStyle = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
};

const listCardStyle = {
  borderRadius: 18,
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  padding: 16,
};

const listSubStyle = {
  fontSize: 14,
  color: '#6b7280',
  lineHeight: 1.7,
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