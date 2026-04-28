import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

function formatDate(value) {
  if (!value) return 'Just now';

  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
}

function priorityClass(priority) {
  if (priority === 'urgent') return 'afn-badge urgent';
  if (priority === 'important') return 'afn-badge important';
  return 'afn-badge normal';
}

export default function AffiliateNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((item) => Number(item.is_read) !== 1);
    }

    if (filter === 'read') {
      return notifications.filter((item) => Number(item.is_read) === 1);
    }

    return notifications;
  }, [notifications, filter]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/affiliate/notifications');

      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnreadCount(Number(data?.unread_count || 0));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load notifications. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function markRead(notificationId) {
    try {
      setWorkingId(notificationId);
      setNotice('');
      setError('');

      const { data } = await api.put(`/affiliate/notifications/${notificationId}/read`);

      setNotice(data?.message || 'Notification marked as read.');
      await fetchNotifications();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to mark notification as read.'
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function markUnread(notificationId) {
    try {
      setWorkingId(notificationId);
      setNotice('');
      setError('');

      const { data } = await api.put(`/affiliate/notifications/${notificationId}/unread`);

      setNotice(data?.message || 'Notification marked as unread.');
      await fetchNotifications();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to mark notification as unread.'
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function markAllRead() {
    try {
      setWorkingId('all');
      setNotice('');
      setError('');

      const { data } = await api.put('/affiliate/notifications/mark-all-read');

      setNotice(data?.message || 'All notifications marked as read.');
      await fetchNotifications();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to mark all notifications as read.'
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="afn-page">
      <style>{styles}</style>

      <section className="afn-hero">
        <div>
          <span className="afn-pill">Notification Center</span>
          <h1>Platform updates, alerts, and affiliate announcements.</h1>
          <p>
            Stay updated with Bloggad changes, BlogPulse Earnings notices, template
            updates, maintenance alerts, and admin announcements.
          </p>
        </div>

        <div className="afn-stats">
          <div className="afn-stat">
            <span>Total Updates</span>
            <strong>{notifications.length}</strong>
          </div>

          <div className="afn-stat unread">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>
      </section>

      {(notice || error) && (
        <div className={error ? 'afn-alert afn-alert-error' : 'afn-alert afn-alert-success'}>
          {error || notice}
        </div>
      )}

      <section className="afn-card">
        <div className="afn-card-head">
          <div>
            <h2>Your Notifications</h2>
            <p>New updates appear first. You can mark updates as read or unread.</p>
          </div>

          <div className="afn-tools">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'active' : ''}
            >
              Unread
            </button>

            <button
              type="button"
              onClick={() => setFilter('read')}
              className={filter === 'read' ? 'active' : ''}
            >
              Read
            </button>

            <button type="button" onClick={fetchNotifications}>
              Refresh
            </button>

            <button
              type="button"
              onClick={markAllRead}
              disabled={workingId === 'all' || unreadCount === 0}
              className="mark-all"
            >
              {workingId === 'all' ? 'Updating...' : 'Mark All Read'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="afn-empty">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="afn-empty">
            <strong>
              {filter === 'all'
                ? 'No notifications yet'
                : `No ${filter} notifications`}
            </strong>
            <span>Platform updates from admin will appear here.</span>
          </div>
        ) : (
          <div className="afn-list">
            {filteredNotifications.map((notification) => {
              const isRead = Number(notification.is_read) === 1;

              return (
                <article
                  key={notification.id}
                  className={isRead ? 'afn-item read' : 'afn-item unread'}
                >
                  {!isRead && <span className="afn-new-dot" />}

                  <div className="afn-badges">
                    <span className={priorityClass(notification.priority)}>
                      {notification.priority || 'normal'}
                    </span>

                    <span className="afn-badge category">
                      {notification.category || 'update'}
                    </span>

                    <span className={isRead ? 'afn-badge read-status' : 'afn-badge new-status'}>
                      {isRead ? 'Read' : 'New'}
                    </span>
                  </div>

                  <h3>{notification.title}</h3>

                  <p>{notification.message}</p>

                  <div className="afn-meta">
                    <span>
                      Published:{' '}
                      {formatDate(notification.published_at || notification.created_at)}
                    </span>
                    <span>
                      {isRead
                        ? `Read: ${formatDate(notification.read_at)}`
                        : 'Unread'}
                    </span>
                  </div>

                  <div className="afn-actions">
                    {isRead ? (
                      <button
                        type="button"
                        onClick={() => markUnread(notification.id)}
                        disabled={workingId === notification.id}
                      >
                        {workingId === notification.id ? 'Updating...' : 'Mark Unread'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markRead(notification.id)}
                        disabled={workingId === notification.id}
                        className="primary"
                      >
                        {workingId === notification.id ? 'Updating...' : 'Mark Read'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = `
  .afn-page {
    width: 100%;
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(34, 197, 94, 0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 26%),
      #f5f7fb;
    padding: 4px;
    color: #0f172a;
  }

  .afn-hero {
    display: grid;
    grid-template-columns: 1.25fr 0.75fr;
    gap: 24px;
    align-items: end;
    margin-bottom: 22px;
    padding: 30px;
    border-radius: 28px;
    background:
      linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.98)),
      radial-gradient(circle at top right, rgba(56, 189, 248, 0.35), transparent 30%);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
    overflow: hidden;
  }

  .afn-pill {
    display: inline-flex;
    margin-bottom: 14px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.14);
    color: #a5f3fc;
    border: 1px solid rgba(125, 211, 252, 0.25);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .afn-hero h1 {
    margin: 0;
    max-width: 760px;
    font-size: 36px;
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -0.04em;
  }

  .afn-hero p {
    margin: 14px 0 0;
    max-width: 680px;
    color: #cbd5e1;
    font-size: 15px;
    line-height: 1.75;
  }

  .afn-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .afn-stat {
    padding: 20px;
    border-radius: 24px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
  }

  .afn-stat.unread {
    background: rgba(56, 189, 248, 0.13);
    border-color: rgba(125, 211, 252, 0.26);
  }

  .afn-stat span {
    display: block;
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .afn-stat strong {
    display: block;
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
  }

  .afn-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .afn-alert-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .afn-alert-error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .afn-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .afn-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
  }

  .afn-card h2 {
    margin: 0;
    font-size: 25px;
    line-height: 1.15;
    font-weight: 950;
    color: #0f172a;
    letter-spacing: -0.03em;
  }

  .afn-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .afn-tools {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }

  .afn-tools button,
  .afn-actions button {
    border: 1px solid #e2e8f0;
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .afn-tools button {
    padding: 10px 14px;
    border-radius: 999px;
    background: #f8fafc;
    color: #0f172a;
    font-size: 12px;
  }

  .afn-tools button:hover {
    background: #e2e8f0;
  }

  .afn-tools button.active {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
  }

  .afn-tools button.mark-all {
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    border-color: transparent;
  }

  .afn-tools button:disabled,
  .afn-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .afn-empty {
    display: grid;
    gap: 8px;
    place-items: center;
    min-height: 260px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 34px;
  }

  .afn-empty strong {
    color: #0f172a;
    font-size: 18px;
  }

  .afn-list {
    display: grid;
    gap: 15px;
  }

  .afn-item {
    position: relative;
    overflow: hidden;
    padding: 22px;
    border-radius: 26px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    transition: 0.2s ease;
  }

  .afn-item.unread {
    border-color: rgba(14, 165, 233, 0.38);
    background:
      linear-gradient(135deg, rgba(240, 249, 255, 0.98), rgba(255,255,255,1));
    box-shadow: 0 16px 40px rgba(14, 165, 233, 0.08);
  }

  .afn-item.read {
    opacity: 0.88;
  }

  .afn-new-dot {
    position: absolute;
    top: 22px;
    right: 22px;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: #06b6d4;
    box-shadow: 0 0 0 7px rgba(6, 182, 212, 0.12);
  }

  .afn-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-right: 28px;
    margin-bottom: 12px;
  }

  .afn-badge {
    display: inline-flex;
    padding: 7px 10px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 1;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .afn-badge.urgent {
    background: #ffe4e6;
    color: #be123c;
  }

  .afn-badge.important {
    background: #fef3c7;
    color: #92400e;
  }

  .afn-badge.normal,
  .afn-badge.category {
    background: #e0f2fe;
    color: #075985;
  }

  .afn-badge.read-status {
    background: #e2e8f0;
    color: #475569;
  }

  .afn-badge.new-status {
    background: #dcfce7;
    color: #166534;
  }

  .afn-item h3 {
    margin: 0;
    max-width: 920px;
    font-size: 20px;
    font-weight: 950;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .afn-item p {
    margin: 10px 0 0;
    max-width: 980px;
    white-space: pre-wrap;
    color: #475569;
    font-size: 14px;
    line-height: 1.75;
  }

  .afn-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 16px;
    color: #64748b;
    font-size: 12px;
    font-weight: 750;
  }

  .afn-actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }

  .afn-actions button {
    padding: 11px 16px;
    border-radius: 999px;
    background: #ffffff;
    color: #0f172a;
  }

  .afn-actions button.primary {
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 12px 28px rgba(59, 130, 246, 0.2);
  }

  @media (max-width: 1000px) {
    .afn-hero {
      grid-template-columns: 1fr;
    }

    .afn-card-head {
      flex-direction: column;
    }

    .afn-tools {
      justify-content: flex-start;
    }
  }

  @media (max-width: 700px) {
    .afn-page {
      padding: 0;
    }

    .afn-hero,
    .afn-card {
      border-radius: 20px;
      padding: 20px;
    }

    .afn-hero h1 {
      font-size: 28px;
    }

    .afn-stats,
    .afn-meta {
      grid-template-columns: 1fr;
    }

    .afn-tools button {
      flex: 1;
    }
  }
`;