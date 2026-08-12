import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './ReaderNotificationsApproved.css';

function isUnread(item) {
  return !item?.is_read;
}

function markerFor(item) {
  const source = String(item?.title || item?.type || 'N').trim();
  const match = source.match(/[A-Za-z0-9]/);
  return (match?.[0] || 'N').toUpperCase();
}

function formatNotificationTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function ReaderNotificationsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => rows.reduce((count, item) => count + (isUnread(item) ? 1 : 0), 0),
    [rows]
  );

  async function load({ showLoading = true } = {}) {
    try {
      if (showLoading) setLoading(true);
      setError('');

      const { data } = await api.get('/api/reader/social/notifications');
      setRows(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Reader notifications.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    if (!id || busyId || markingAll) return;

    try {
      setBusyId(id);
      setError('');

      await api.patch(`/api/reader/social/notifications/${id}/read`);
      await load({ showLoading: false });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update notification.');
    } finally {
      setBusyId(null);
    }
  }

  async function markAll() {
    if (!unreadCount || markingAll || busyId) return;

    try {
      setMarkingAll(true);
      setError('');

      await api.patch('/api/reader/social/notifications/mark-all-read');
      await load({ showLoading: false });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update notifications.');
    } finally {
      setMarkingAll(false);
    }
  }

  const markAllDisabled = loading || markingAll || !!busyId || unreadCount === 0;

  return (
    <ReaderUnifiedShell
      title="Notifications"
      subtitle="Your Reader activity"
    >
      <main className="reader-notifications-page">
        <section className="reader-notifications-heading">
          <div className="reader-notifications-heading-copy">
            <h2>Recent activity</h2>
            <p>Writer replies, course completion, and followed Writer activity.</p>
          </div>

          {unreadCount > 0 ? (
            <span className="reader-notifications-unread-pill">
              {unreadCount} unread
            </span>
          ) : null}
        </section>

        {!loading && rows.length > 0 && unreadCount > 0 ? (
          <div className="reader-notifications-info" role="note">
            <span className="reader-notifications-info-icon" aria-hidden="true">i</span>
            <span>Select an unread notification to mark it as read. New activity appears first.</span>
          </div>
        ) : null}

        {error ? (
          <div className="reader-notifications-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="reader-notifications-mobile-actions">
          <button
            type="button"
            className="reader-notifications-mark-all"
            onClick={markAll}
            disabled={markAllDisabled}
          >
            {markingAll ? 'Marking read...' : 'Mark all read'}
          </button>
        </div>

        {loading ? (
          <section className="reader-notifications-state-card" aria-live="polite">
            <div className="reader-notifications-state-icon" aria-hidden="true">N</div>
            <strong>Loading notifications...</strong>
            <span>Your Reader activity is being loaded.</span>
          </section>
        ) : rows.length === 0 ? (
          <section className="reader-notifications-state-card">
            <div className="reader-notifications-state-icon" aria-hidden="true">N</div>
            <strong>No notifications yet.</strong>
            <span>
              Writer replies, course completion, and followed Writer activity will appear here when available.
            </span>
          </section>
        ) : (
          <section className="reader-notifications-card" aria-label="Reader notifications">
            <div className="reader-notifications-card-head">
              <div>
                <h3>Your notifications</h3>
                <p>Unread items are highlighted until you select them.</p>
              </div>

              <button
                type="button"
                className="reader-notifications-mark-all"
                onClick={markAll}
                disabled={markAllDisabled}
              >
                {markingAll ? 'Marking read...' : 'Mark all read'}
              </button>
            </div>

            <div className="reader-notifications-list">
              {rows.map((item) => {
                const unread = isUnread(item);
                const itemBusy = busyId === item.id;

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`reader-notifications-item${unread ? ' is-unread' : ''}`}
                    onClick={() => unread && markRead(item.id)}
                    disabled={!unread || itemBusy || markingAll}
                    aria-label={
                      unread
                        ? `${item.title || 'Unread notification'}. Select to mark as read.`
                        : item.title || 'Read notification'
                    }
                  >
                    <span className="reader-notifications-marker" aria-hidden="true">
                      {markerFor(item)}
                    </span>

                    <span className="reader-notifications-copy">
                      <strong>{item.title || 'Notification'}</strong>
                      <span className="reader-notifications-message">
                        {item.message || ''}
                      </span>
                      <span className="reader-notifications-time">
                        {itemBusy ? 'Marking as read...' : formatNotificationTime(item.created_at)}
                      </span>
                    </span>

                    {unread ? (
                      <span className="reader-notifications-dot" aria-label="Unread" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </ReaderUnifiedShell>
  );
}
