import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

const EMPTY_FORM = {
  title: '',
  message: '',
  category: 'update',
  priority: 'normal',
  status: 'published',
};

function formatDate(value) {
  if (!value) return 'Not published yet';

  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      published: notifications.filter((item) => item.status === 'published').length,
      drafts: notifications.filter((item) => item.status === 'draft').length,
      urgent: notifications.filter((item) => item.priority === 'urgent').length,
    };
  }, [notifications]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/admin/notifications');
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
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

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setNotice('');
    setError('');
  }

  function startEdit(notification) {
    setEditingId(notification.id);
    setForm({
      title: notification.title || '',
      message: notification.message || '',
      category: notification.category || 'update',
      priority: notification.priority || 'normal',
      status: notification.status || 'published',
    });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setNotice('');
      setError('');

      if (editingId) {
        const { data } = await api.put(`/admin/notifications/${editingId}`, form);
        setNotice(data?.message || 'Notification updated successfully.');
      } else {
        const { data } = await api.post('/admin/notifications', form);
        setNotice(data?.message || 'Notification created successfully.');
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      await fetchNotifications();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to save notification. Please check the form and try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(notificationId) {
    const confirmed = window.confirm('Delete this notification permanently?');
    if (!confirmed) return;

    try {
      setNotice('');
      setError('');

      const { data } = await api.delete(`/admin/notifications/${notificationId}`);
      setNotice(data?.message || 'Notification deleted successfully.');
      await fetchNotifications();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to delete notification. Please try again.'
      );
    }
  }

  return (
    <div className="bn-page">
      <style>{styles}</style>

      <section className="bn-hero">
        <div>
          <span className="bn-pill">Admin Notification Center</span>
          <h1>Send updates to every affiliate dashboard.</h1>
          <p>
            Create announcements, important alerts, BlogPulse notices, template updates,
            and platform messages.
          </p>
        </div>

        <div className="bn-stats">
          <div className="bn-stat">
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="bn-stat">
            <span>Published</span>
            <strong>{stats.published}</strong>
          </div>
          <div className="bn-stat">
            <span>Drafts</span>
            <strong>{stats.drafts}</strong>
          </div>
          <div className="bn-stat">
            <span>Urgent</span>
            <strong>{stats.urgent}</strong>
          </div>
        </div>
      </section>

      {(notice || error) && (
        <div className={error ? 'bn-alert bn-alert-error' : 'bn-alert bn-alert-success'}>
          {error || notice}
        </div>
      )}

      <section className="bn-grid">
        <form onSubmit={handleSubmit} className="bn-card">
          <div className="bn-card-head">
            <div>
              <h2>{editingId ? 'Edit Notification' : 'Create Notification'}</h2>
              <p>Publish instantly or save as draft.</p>
            </div>

            {editingId && (
              <button type="button" onClick={resetForm} className="bn-ghost-btn">
                Cancel
              </button>
            )}
          </div>

          <label className="bn-field">
            <span>Title</span>
            <input
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
              placeholder="Example: New BlogPulse Earnings update"
            />
          </label>

          <label className="bn-field">
            <span>Message</span>
            <textarea
              value={form.message}
              onChange={(event) => updateForm('message', event.target.value)}
              rows={8}
              placeholder="Write the update affiliates should see..."
            />
          </label>

          <div className="bn-form-row">
            <label className="bn-field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
              >
                <option value="update">Update</option>
                <option value="earning">Earning</option>
                <option value="template">Template</option>
                <option value="policy">Policy</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>

            <label className="bn-field">
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(event) => updateForm('priority', event.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>

            <label className="bn-field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => updateForm('status', event.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          <button type="submit" disabled={saving} className="bn-primary-btn">
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Notification'
                : 'Publish Notification'}
          </button>
        </form>

        <div className="bn-card">
          <div className="bn-card-head">
            <div>
              <h2>All Notifications</h2>
              <p>Manage updates shown to affiliates.</p>
            </div>

            <button type="button" onClick={fetchNotifications} className="bn-ghost-btn">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="bn-empty">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="bn-empty">
              <strong>No notifications yet</strong>
              <span>Create the first update for affiliates.</span>
            </div>
          ) : (
            <div className="bn-list">
              {notifications.map((notification) => (
                <article key={notification.id} className="bn-item">
                  <div className="bn-badges">
                    <span className={`bn-badge ${notification.status}`}>
                      {notification.status}
                    </span>
                    <span className={`bn-badge ${notification.priority}`}>
                      {notification.priority}
                    </span>
                    <span className="bn-badge category">{notification.category}</span>
                  </div>

                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>

                  <div className="bn-meta">
                    <span>Published: {formatDate(notification.published_at)}</span>
                    <span>Reads: {notification.total_reads || 0}</span>
                  </div>

                  <div className="bn-actions">
                    <button type="button" onClick={() => startEdit(notification)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(notification.id)}
                      className="danger"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = `
  .bn-page {
    width: 100%;
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 28%),
      radial-gradient(circle at top right, rgba(236, 72, 153, 0.14), transparent 25%),
      #f5f7fb;
    padding: 4px;
    color: #0f172a;
  }

  .bn-hero {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 34px;
    align-items: center;
    margin-bottom: 22px;
    padding: 34px;
    border-radius: 28px;
    background: linear-gradient(135deg, #07111f, #0f172a 48%, #020617);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
    overflow: hidden;
  }

  .bn-pill {
    display: inline-flex;
    margin-bottom: 16px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.18);
    color: #cffafe;
    border: 1px solid rgba(125, 211, 252, 0.35);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }

  .bn-hero h1 {
    margin: 0;
    max-width: 720px;
    font-size: 36px;
    line-height: 1.08;
    font-weight: 950;
    letter-spacing: -0.04em;
    color: #ffffff;
  }

  .bn-hero p {
    margin: 16px 0 0;
    max-width: 720px;
    color: #e2e8f0;
    font-size: 15px;
    line-height: 1.75;
  }

  .bn-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .bn-stat {
    padding: 20px;
    min-height: 112px;
    border-radius: 22px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .bn-stat span {
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .bn-stat strong {
    display: block;
    color: #ffffff;
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
  }

  .bn-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .bn-alert-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .bn-alert-error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .bn-grid {
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 22px;
    align-items: start;
  }

  .bn-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .bn-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
  }

  .bn-card h2 {
    margin: 0;
    font-size: 24px;
    line-height: 1.15;
    font-weight: 950;
    color: #0f172a;
    letter-spacing: -0.03em;
  }

  .bn-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .bn-field {
    display: block;
    margin-bottom: 16px;
  }

  .bn-field span {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #334155;
    font-weight: 900;
  }

  .bn-field input,
  .bn-field textarea,
  .bn-field select {
    width: 100%;
    border: 1px solid #dbe3ef;
    background: #f8fafc;
    border-radius: 16px;
    padding: 13px 14px;
    color: #0f172a;
    font-size: 14px;
    outline: none;
    transition: 0.2s ease;
  }

  .bn-field textarea {
    resize: vertical;
    min-height: 180px;
    line-height: 1.7;
  }

  .bn-field input:focus,
  .bn-field textarea:focus,
  .bn-field select:focus {
    border-color: #38bdf8;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.14);
  }

  .bn-form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .bn-primary-btn,
  .bn-ghost-btn,
  .bn-actions button {
    border: 0;
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .bn-primary-btn {
    width: 100%;
    margin-top: 4px;
    padding: 15px 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    box-shadow: 0 14px 35px rgba(59, 130, 246, 0.25);
  }

  .bn-primary-btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .bn-ghost-btn {
    padding: 11px 15px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #0f172a;
    border: 1px solid #e2e8f0;
  }

  .bn-ghost-btn:hover {
    background: #e2e8f0;
  }

  .bn-empty {
    display: grid;
    gap: 8px;
    place-items: center;
    min-height: 220px;
    border-radius: 22px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 30px;
  }

  .bn-empty strong {
    color: #0f172a;
    font-size: 18px;
  }

  .bn-list {
    display: grid;
    gap: 14px;
    max-height: 720px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .bn-item {
    border-radius: 24px;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .bn-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .bn-badge {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 10px;
    line-height: 1;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bn-badge.published {
    background: #dcfce7;
    color: #166534;
  }

  .bn-badge.draft {
    background: #fef3c7;
    color: #92400e;
  }

  .bn-badge.urgent {
    background: #ffe4e6;
    color: #be123c;
  }

  .bn-badge.important {
    background: #fae8ff;
    color: #86198f;
  }

  .bn-badge.normal,
  .bn-badge.category {
    background: #e0f2fe;
    color: #075985;
  }

  .bn-item h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 950;
    color: #0f172a;
  }

  .bn-item p {
    margin: 10px 0 0;
    white-space: pre-wrap;
    color: #475569;
    font-size: 14px;
    line-height: 1.7;
  }

  .bn-meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 15px;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .bn-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  .bn-actions button {
    padding: 10px 15px;
    border-radius: 999px;
    background: #0f172a;
    color: #ffffff;
  }

  .bn-actions button.danger {
    background: #fff1f2;
    color: #be123c;
    border: 1px solid #fecdd3;
  }

  @media (max-width: 1100px) {
    .bn-hero,
    .bn-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .bn-page {
      padding: 0;
    }

    .bn-hero,
    .bn-card {
      border-radius: 20px;
      padding: 20px;
    }

    .bn-hero h1 {
      font-size: 28px;
    }

    .bn-stats,
    .bn-form-row,
    .bn-meta {
      grid-template-columns: 1fr;
    }

    .bn-card-head {
      flex-direction: column;
    }
  }
`;