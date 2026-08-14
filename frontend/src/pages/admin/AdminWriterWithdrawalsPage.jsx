import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function formatMoney(value) {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `USD ${amount.toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString();
}

function statusStyle(status) {
  const value = String(status || 'pending').toLowerCase();

  if (value === 'approved') {
    return { background: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
  }

  if (value === 'paid') {
    return { background: '#ecfdf5', color: '#166534', border: '#bbf7d0' };
  }

  if (value === 'rejected') {
    return { background: '#fff1f2', color: '#be123c', border: '#fecdd3' };
  }

  return { background: '#fff7ed', color: '#c2410c', border: '#fed7aa' };
}

function StatusPill({ status }) {
  const style = statusStyle(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 30,
        padding: '0 11px',
        borderRadius: 999,
        background: style.background,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {status || 'pending'}
    </span>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 18,
        padding: 18,
        minWidth: 0,
      }}
    >
      <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div
        style={{
          marginTop: 8,
          color: '#111827',
          fontSize: 27,
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>
      {helper ? (
        <div style={{ marginTop: 6, color: '#9ca3af', fontSize: 12, lineHeight: 1.5 }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        background: '#f9fafb',
        padding: 13,
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: '#6b7280',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 7,
          color: '#111827',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.5,
          wordBreak: 'break-word',
          fontFamily: mono ? 'monospace' : 'inherit',
          whiteSpace: 'pre-wrap',
        }}
      >
        {value || '-'}
      </div>
    </div>
  );
}

export default function AdminWriterWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  async function loadWithdrawals(currentStatus = status) {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (currentStatus) params.set('status', currentStatus);

      const { data } = await api.get(
        `/api/admin/writer-finance/withdrawals${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load Writer withdrawals.');
      }

      const rows = Array.isArray(data?.withdrawals) ? data.withdrawals : [];
      setWithdrawals(rows);

      if (selected) {
        const fresh = rows.find((item) => Number(item?.id) === Number(selected?.id));
        setSelected(fresh || null);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load Writer withdrawals.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleWithdrawals = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) return withdrawals;

    return withdrawals.filter((item) => {
      return [
        item?.id,
        item?.writer_name,
        item?.writer_email,
        item?.payment_method,
        item?.payment_details,
        item?.status,
        item?.admin_note,
      ]
        .map((value) => String(value || '').toLowerCase())
        .some((value) => value.includes(needle));
    });
  }, [search, withdrawals]);

  const stats = useMemo(() => {
    const pending = withdrawals.filter((item) => item?.status === 'pending');
    const approved = withdrawals.filter((item) => item?.status === 'approved');
    const paid = withdrawals.filter((item) => item?.status === 'paid');
    const rejected = withdrawals.filter((item) => item?.status === 'rejected');

    return {
      pendingCount: pending.length,
      approvedCount: approved.length,
      paidCount: paid.length,
      rejectedCount: rejected.length,
      pendingAmount: pending.reduce((sum, item) => sum + Number(item?.amount || 0), 0),
    };
  }, [withdrawals]);

  async function runAction(item, action) {
    const actionLabel =
      action === 'approve' ? 'approve' : action === 'paid' ? 'mark paid' : 'reject';

    const confirmed = window.confirm(
      `Confirm ${actionLabel} for withdrawal #${item.id} (${formatMoney(item.amount)})?`
    );

    if (!confirmed) return;

    const noteInput = window.prompt(
      action === 'reject'
        ? 'Enter the rejection reason or Admin note'
        : 'Optional Admin note',
      item?.admin_note || ''
    );

    if (noteInput === null) return;

    if (action === 'reject' && !String(noteInput || '').trim()) {
      setError('A rejection reason is required before rejecting a withdrawal.');
      return;
    }

    setActingId(item.id);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.patch(
        `/api/admin/writer-finance/withdrawals/${item.id}/${action}`,
        { admin_note: String(noteInput || '').trim() }
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to review Writer withdrawal.');
      }

      setSuccess(data?.message || 'Writer withdrawal updated.');
      await loadWithdrawals(status);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to review Writer withdrawal.'
      );
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="admin-writer-withdrawals-page">
      <style>{`
        .admin-writer-withdrawals-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px 16px 42px;
          color: #111827;
        }

        .aww-shell {
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .aww-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .aww-stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .aww-filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 210px auto;
          gap: 10px;
        }

        .aww-table-wrap {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
        }

        .aww-table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }

        .aww-table th {
          text-align: left;
          padding: 13px 14px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .aww-table td {
          padding: 15px 14px;
          border-bottom: 1px solid #f0f2f5;
          vertical-align: top;
          font-size: 14px;
        }

        .aww-table tr:last-child td {
          border-bottom: 0;
        }

        .aww-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .aww-drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 500;
          background: rgba(15, 23, 42, 0.42);
          display: flex;
          justify-content: flex-end;
        }

        .aww-drawer {
          width: min(560px, 94vw);
          height: 100%;
          overflow-y: auto;
          background: #ffffff;
          color: #111827;
          box-shadow: -20px 0 60px rgba(15, 23, 42, 0.18);
          padding: 22px;
        }

        .aww-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        @media (max-width: 1180px) {
          .aww-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .admin-writer-withdrawals-page {
            padding: 14px 10px 28px;
          }

          .aww-stats,
          .aww-filters,
          .aww-info-grid {
            grid-template-columns: 1fr;
          }

          .aww-drawer {
            width: 100%;
          }
        }
      `}</style>

      <div className="aww-shell">
        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div className="aww-topbar">
            <div>
              <div
                style={{
                  color: '#6b7280',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Writer Finance
              </div>
              <h1
                style={{
                  margin: '7px 0 0',
                  fontSize: 30,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                }}
              >
                Writer Withdrawals
              </h1>
              <p
                style={{
                  margin: '9px 0 0',
                  color: '#6b7280',
                  fontSize: 14,
                  lineHeight: 1.7,
                  maxWidth: 760,
                }}
              >
                Review Writer payout requests, approve valid requests, mark completed payouts as paid,
                or reject a request and restore its reserved balance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadWithdrawals(status)}
              disabled={loading}
              style={secondaryButton}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </section>

        {error ? (
          <div style={errorBox}>
            {error}
          </div>
        ) : null}

        {success ? (
          <div style={successBox}>
            {success}
          </div>
        ) : null}

        <div className="aww-stats">
          <StatCard label="Pending" value={stats.pendingCount} helper={formatMoney(stats.pendingAmount)} />
          <StatCard label="Approved" value={stats.approvedCount} helper="Waiting to be paid" />
          <StatCard label="Paid" value={stats.paidCount} helper="Completed payouts" />
          <StatCard label="Rejected" value={stats.rejectedCount} helper="Returned to Writer balance" />
          <StatCard label="Loaded" value={withdrawals.length} helper="Maximum 500 newest requests" />
        </div>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 16,
          }}
        >
          <div className="aww-filters">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search writer, email, ID, payment method or details"
              style={inputStyle}
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={inputStyle}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={() => loadWithdrawals(status)}
              disabled={loading}
              style={primaryButton}
            >
              Apply
            </button>
          </div>
        </section>

        <section
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800 }}>Withdrawal requests</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>
              {visibleWithdrawals.length} visible
            </div>
          </div>

          {loading ? (
            <div style={emptyBox}>Loading Writer withdrawals...</div>
          ) : visibleWithdrawals.length ? (
            <div className="aww-table-wrap">
              <table className="aww-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Writer</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Requested</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleWithdrawals.map((item) => {
                    const busy = Number(actingId) === Number(item.id);
                    const canApprove = item?.status === 'pending';
                    const canPay = item?.status === 'pending' || item?.status === 'approved';
                    const canReject = item?.status === 'pending' || item?.status === 'approved';

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>#{item.id}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{item?.writer_name || 'Writer'}</div>
                          <div style={{ marginTop: 4, color: '#6b7280', fontSize: 12 }}>
                            {item?.writer_email || '-'}
                          </div>
                        </td>
                        <td>
                          <strong>{formatMoney(item?.amount)}</strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item?.payment_method || '-'}</div>
                          <div
                            style={{
                              marginTop: 4,
                              color: '#6b7280',
                              fontSize: 12,
                              maxWidth: 220,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={item?.payment_details || ''}
                          >
                            {item?.payment_details || '-'}
                          </div>
                        </td>
                        <td>{formatDate(item?.created_at)}</td>
                        <td>
                          <StatusPill status={item?.status} />
                        </td>
                        <td>
                          <div className="aww-actions">
                            <button
                              type="button"
                              onClick={() => setSelected(item)}
                              style={smallSecondaryButton}
                            >
                              View
                            </button>

                            {canApprove ? (
                              <button
                                type="button"
                                onClick={() => runAction(item, 'approve')}
                                disabled={busy}
                                style={smallApproveButton}
                              >
                                {busy ? 'Working...' : 'Approve'}
                              </button>
                            ) : null}

                            {canPay ? (
                              <button
                                type="button"
                                onClick={() => runAction(item, 'paid')}
                                disabled={busy}
                                style={smallPaidButton}
                              >
                                {busy ? 'Working...' : 'Mark Paid'}
                              </button>
                            ) : null}

                            {canReject ? (
                              <button
                                type="button"
                                onClick={() => runAction(item, 'reject')}
                                disabled={busy}
                                style={smallRejectButton}
                              >
                                {busy ? 'Working...' : 'Reject'}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={emptyBox}>No Writer withdrawal requests found.</div>
          )}
        </section>
      </div>

      {selected ? (
        <div
          className="aww-drawer-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <aside
            className="aww-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Writer withdrawal ${selected.id}`}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 14,
              }}
            >
              <div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Withdrawal #{selected.id}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 27,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {formatMoney(selected?.amount)}
                </div>
                <div style={{ marginTop: 9 }}>
                  <StatusPill status={selected?.status} />
                </div>
              </div>

              <button type="button" onClick={() => setSelected(null)} style={secondaryButton}>
                Close
              </button>
            </div>

            <div style={{ marginTop: 22 }} className="aww-info-grid">
              <InfoItem label="Writer" value={selected?.writer_name} />
              <InfoItem label="Writer Email" value={selected?.writer_email} />
              <InfoItem label="Payment Method" value={selected?.payment_method} />
              <InfoItem label="Requested" value={formatDate(selected?.created_at)} />
              <InfoItem label="Reviewed" value={formatDate(selected?.reviewed_at)} />
              <InfoItem label="Reviewed By" value={selected?.reviewed_by} />
            </div>

            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              <InfoItem
                label="Payment Details"
                value={selected?.payment_details || 'No payment details supplied.'}
                mono
              />
              <InfoItem
                label="Admin Note"
                value={selected?.admin_note || 'No Admin note yet.'}
              />
            </div>

            {selected?.status === 'pending' || selected?.status === 'approved' ? (
              <div
                style={{
                  marginTop: 22,
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: 18,
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 12, color: '#111827' }}>Review actions</div>
                <div className="aww-actions">
                  {selected?.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => runAction(selected, 'approve')}
                      disabled={Number(actingId) === Number(selected.id)}
                      style={approveButton}
                    >
                      Approve
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => runAction(selected, 'paid')}
                    disabled={Number(actingId) === Number(selected.id)}
                    style={paidButton}
                  >
                    Mark Paid
                  </button>

                  <button
                    type="button"
                    onClick={() => runAction(selected, 'reject')}
                    disabled={Number(actingId) === Number(selected.id)}
                    style={rejectButton}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  minHeight: 42,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  padding: '0 12px',
  fontSize: 14,
  outline: 'none',
};

const primaryButton = {
  minHeight: 42,
  border: 0,
  borderRadius: 10,
  background: '#111827',
  color: '#ffffff',
  padding: '0 17px',
  fontWeight: 800,
  cursor: 'pointer',
};

const secondaryButton = {
  minHeight: 40,
  border: '1px solid #d1d5db',
  borderRadius: 10,
  background: '#ffffff',
  color: '#374151',
  padding: '0 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const smallSecondaryButton = {
  ...secondaryButton,
  minHeight: 34,
  padding: '0 10px',
  fontSize: 12,
};

const actionBase = {
  minHeight: 36,
  borderRadius: 9,
  padding: '0 12px',
  fontWeight: 800,
  fontSize: 12,
  cursor: 'pointer',
};

const approveButton = {
  ...actionBase,
  minHeight: 42,
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  color: '#1d4ed8',
};

const paidButton = {
  ...actionBase,
  minHeight: 42,
  border: '1px solid #bbf7d0',
  background: '#ecfdf5',
  color: '#166534',
};

const rejectButton = {
  ...actionBase,
  minHeight: 42,
  border: '1px solid #fecdd3',
  background: '#fff1f2',
  color: '#be123c',
};

const smallApproveButton = {
  ...approveButton,
  minHeight: 34,
  padding: '0 10px',
};

const smallPaidButton = {
  ...paidButton,
  minHeight: 34,
  padding: '0 10px',
};

const smallRejectButton = {
  ...rejectButton,
  minHeight: 34,
  padding: '0 10px',
};

const emptyBox = {
  border: '1px dashed #d1d5db',
  borderRadius: 14,
  background: '#f9fafb',
  padding: 20,
  color: '#6b7280',
  fontSize: 14,
  textAlign: 'center',
};

const errorBox = {
  border: '1px solid #fecaca',
  borderRadius: 14,
  background: '#fff1f2',
  padding: '13px 15px',
  color: '#be123c',
  fontSize: 14,
};

const successBox = {
  border: '1px solid #bbf7d0',
  borderRadius: 14,
  background: '#ecfdf5',
  padding: '13px 15px',
  color: '#166534',
  fontSize: 14,
};