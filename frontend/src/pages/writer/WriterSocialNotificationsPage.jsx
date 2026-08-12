import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { formatDateTime } from '../../components/writerReader/WorkspaceUi';

function isReadValue(value) {
  return value === true || value === 1 || value === '1';
}

function formatNotificationTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return formatDateTime(value);
  }

  const diffMs = Date.now() - timestamp;

  if (diffMs < 0) {
    return formatDateTime(value);
  }

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (hours < 48) {
    return 'Yesterday';
  }

  return formatDateTime(value);
}

export default function WriterSocialNotificationsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  async function load(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    try {
      setError('');
      const { data } = await api.get('/api/writer/social/notifications');
      setRows(data?.notifications || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Writer notifications.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    if (!id || workingId !== null || markingAll) return;

    setWorkingId(id);

    try {
      setError('');
      await api.patch(`/api/writer/social/notifications/${id}/read`);
      await load(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark the notification as read.');
    } finally {
      setWorkingId(null);
    }
  }

  async function markAll() {
    if (markingAll || workingId !== null) return;

    setMarkingAll(true);

    try {
      setError('');
      await api.patch('/api/writer/social/notifications/mark-all-read');
      await load(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = useMemo(
    () => rows.reduce((total, item) => total + (isReadValue(item?.is_read) ? 0 : 1), 0),
    [rows]
  );

  const markAllDisabled = unreadCount === 0 || markingAll || workingId !== null;

  return (
    <div className="writer-social-notifications-page">
      <style>{`
        .writer-social-notifications-page {
          width: 100%;
          max-width: 920px;
          color: #17191f;
        }

        .writer-social-notifications-page,
        .writer-social-notifications-page * {
          box-sizing: border-box;
        }

        .wsn-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          min-height: 40px;
          margin-bottom: 14px;
        }

        .wsn-left-actions {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wsn-unread-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 32px;
          border: 1px solid #dfe3e6;
          border-radius: 999px;
          background: #ffffff;
          color: #17191f;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          padding: 0 10px;
          white-space: nowrap;
        }

        .wsn-unread-dot,
        .wsn-row-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          border-radius: 999px;
          background: #1c1f24;
        }

        .wsn-status-copy {
          margin: 0;
          color: #6f7782;
          font-size: 12px;
          line-height: 1.45;
        }

        .wsn-mark-all {
          min-width: 126px;
          min-height: 40px;
          border: 1px solid #1c1f24;
          border-radius: 9px;
          background: #1c1f24;
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
          padding: 0 15px;
          transition: background 140ms ease, border-color 140ms ease;
        }

        .wsn-mark-all:hover:not(:disabled) {
          background: #111318;
          border-color: #111318;
        }

        .wsn-mark-all:disabled {
          border-color: #d7dce2;
          background: #d7dce2;
          color: #6f7782;
          cursor: default;
        }

        .wsn-mark-all:focus-visible,
        .wsn-notification:focus-visible {
          outline: 2px solid #1c1f24;
          outline-offset: 2px;
        }

        .wsn-error {
          width: 100%;
          margin: 0 0 14px;
          border: 1px solid #ebcaca;
          border-radius: 10px;
          background: #fffafa;
          color: #8e2d2d;
          font-size: 13px;
          line-height: 1.5;
          padding: 11px 13px;
        }

        .wsn-list-shell {
          width: 100%;
          border: 1px solid #dfe3e6;
          border-radius: 15px;
          background: #ffffff;
          padding: 12px;
        }

        .wsn-list {
          display: grid;
          gap: 8px;
        }

        .wsn-notification {
          width: 100%;
          min-height: 82px;
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) 7px;
          align-items: center;
          gap: 12px;
          border: 1px solid #e3e6e9;
          border-radius: 11px;
          appearance: none;
          background: #ffffff;
          color: #17191f;
          cursor: default;
          font: inherit;
          padding: 12px 15px;
          text-align: left;
        }

        .wsn-notification.is-unread {
          background: #fbfcfc;
          cursor: pointer;
        }

        .wsn-notification.is-working {
          opacity: 0.62;
          cursor: wait;
        }

        .wsn-marker {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #f1f3f5;
          color: #6f7782;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
        }

        .wsn-notification.is-unread .wsn-marker {
          background: #1c1f24;
          color: #ffffff;
        }

        .wsn-copy {
          min-width: 0;
        }

        .wsn-item-title {
          display: block;
          margin: 0;
          color: #17191f;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
        }

        .wsn-item-message {
          display: block;
          margin: 3px 0 0;
          color: #6f7782;
          font-size: 12px;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .wsn-item-time {
          display: block;
          margin: 4px 0 0;
          color: #8a919b;
          font-size: 10px;
          line-height: 1.35;
        }

        .wsn-row-dot-placeholder {
          width: 7px;
          height: 7px;
        }

        .wsn-state {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #6f7782;
          padding: 28px 20px;
          text-align: center;
        }

        .wsn-state-title {
          margin: 0;
          color: #17191f;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.4;
        }

        .wsn-state-copy {
          margin: 0;
          max-width: 380px;
          font-size: 11px;
          line-height: 1.5;
        }

        @media (max-width: 991px) {
          .writer-social-notifications-page {
            max-width: none;
          }

          .wsn-actions-row {
            margin-bottom: 12px;
          }

          .wsn-status-copy {
            display: none;
          }

          .wsn-list-shell {
            border-radius: 13px;
            padding: 10px;
          }
        }

        @media (max-width: 520px) {
          .wsn-actions-row {
            gap: 10px;
          }

          .wsn-mark-all {
            min-width: 112px;
            min-height: 38px;
            padding: 0 12px;
          }

          .wsn-notification {
            grid-template-columns: 32px minmax(0, 1fr) 7px;
            gap: 11px;
            min-height: 82px;
            padding: 12px 13px;
          }

          .wsn-marker {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 360px) {
          .wsn-actions-row {
            align-items: stretch;
            flex-direction: column;
          }

          .wsn-left-actions {
            width: 100%;
          }

          .wsn-mark-all {
            width: 100%;
          }
        }
      `}</style>

      <div className="wsn-actions-row">
        <div className="wsn-left-actions">
          <div className="wsn-unread-pill" aria-live="polite">
            <span className="wsn-unread-dot" aria-hidden="true" />
            <span>{unreadCount} unread</span>
          </div>

          <p className="wsn-status-copy">
            New activity appears first. Select an unread item to mark it as read.
          </p>
        </div>

        <button
          type="button"
          className="wsn-mark-all"
          onClick={markAll}
          disabled={markAllDisabled}
        >
          {markingAll ? 'Marking...' : 'Mark all read'}
        </button>
      </div>

      {error ? (
        <div className="wsn-error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="wsn-list-shell" aria-label="Writer social notifications">
        {loading ? (
          <div className="wsn-state" aria-live="polite">
            <p className="wsn-state-title">Loading notifications...</p>
          </div>
        ) : rows.length ? (
          <div className="wsn-list">
            {rows.map((item) => {
              const read = isReadValue(item?.is_read);
              const working = workingId === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  className={`wsn-notification${read ? ' is-read' : ' is-unread'}${working ? ' is-working' : ''}`}
                  onClick={() => {
                    if (!read) {
                      markRead(item.id);
                    }
                  }}
                  aria-disabled={read || working}
                  aria-label={`${item.title || 'Notification'}${read ? ', read' : ', unread. Select to mark as read.'}`}
                  tabIndex={read ? -1 : 0}
                >
                  <span className="wsn-marker" aria-hidden="true">N</span>

                  <span className="wsn-copy">
                    <span className="wsn-item-title">{item.title || 'Notification'}</span>
                    {item.message ? (
                      <span className="wsn-item-message">{item.message}</span>
                    ) : null}
                    <span className="wsn-item-time">{formatNotificationTime(item.created_at)}</span>
                  </span>

                  {!read ? (
                    <span className="wsn-row-dot" aria-hidden="true" />
                  ) : (
                    <span className="wsn-row-dot-placeholder" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="wsn-state">
            <p className="wsn-state-title">No social notifications yet.</p>
            <p className="wsn-state-copy">
              New Reader activity will appear here when it is available.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
