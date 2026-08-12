import { useEffect, useState } from 'react';
import api from '../../api/axios';

const cardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  background: '#ffffff',
  padding: 14,
};

const buttonStyle = {
  minHeight: 38,
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  background: '#ffffff',
  color: '#0f172a',
  padding: '0 12px',
  fontWeight: 800,
  cursor: 'pointer',
};

export function WriterMessagePrivacySettings() {
  const [settings, setSettings] = useState({
    contact_policy: 'followers',
    paid_members_direct: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/customer-affiliate-chats/message-settings');
      setSettings({
        contact_policy: data?.settings?.contact_policy || 'followers',
        paid_members_direct: data?.settings?.paid_members_direct !== false,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Writer message settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setNotice('');

      const { data } = await api.put('/api/customer-affiliate-chats/message-settings', {
        contact_policy: settings.contact_policy,
        paid_members_direct: !!settings.paid_members_direct,
      });

      setSettings({
        contact_policy: data?.settings?.contact_policy || settings.contact_policy,
        paid_members_direct: data?.settings?.paid_members_direct !== false,
      });
      setNotice(data?.message || 'Writer message settings updated.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save Writer message settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} style={{ ...cardStyle, display: 'grid', gap: 10 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#64748b', letterSpacing: '0.06em' }}>
          READER CONTACT POLICY
        </div>
        <strong style={{ display: 'block', marginTop: 4, color: '#0f172a' }}>
          Who can start a conversation?
        </strong>
      </div>

      <select
        value={settings.contact_policy}
        disabled={loading || saving}
        onChange={(event) =>
          setSettings((prev) => ({ ...prev, contact_policy: event.target.value }))
        }
        style={{
          minHeight: 42,
          border: '1px solid #cbd5e1',
          borderRadius: 10,
          padding: '0 10px',
          background: '#ffffff',
        }}
      >
        <option value="everyone">Everyone</option>
        <option value="followers">Followers</option>
        <option value="paid_members">Paid Members</option>
        <option value="nobody">Nobody</option>
      </select>

      <label style={{ display: 'flex', gap: 9, alignItems: 'center', color: '#334155' }}>
        <input
          type="checkbox"
          checked={!!settings.paid_members_direct}
          disabled={loading || saving}
          onChange={(event) =>
            setSettings((prev) => ({ ...prev, paid_members_direct: event.target.checked }))
          }
        />
        Paid Members can message directly without a request.
      </label>

      <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>
        Followers normally send a message request first. You can accept or decline each request.
      </div>

      <button type="submit" disabled={loading || saving} style={buttonStyle}>
        {saving ? 'Saving...' : 'Save message policy'}
      </button>

      {notice ? <div style={{ color: '#166534', fontWeight: 700 }}>{notice}</div> : null}
      {error ? <div style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
    </form>
  );
}

export function ConversationSafetyControls({
  chatId,
  participantRole,
  enabled = true,
  onChanged,
}) {
  const [chat, setChat] = useState(null);
  const [controls, setControls] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const isWriter = participantRole === 'writer';

  async function load() {
    if (!enabled || !chatId) {
      setChat(null);
      setControls(null);
      return;
    }

    try {
      setError('');
      const { data } = await api.get(`/api/customer-affiliate-chats/${chatId}`);
      setChat(data?.chat || null);
      setControls(data?.controls || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load conversation controls.');
    }
  }

  useEffect(() => {
    load();
  }, [chatId, enabled, participantRole]);

  async function decide(action) {
    try {
      setBusy(action);
      setError('');
      setNotice('');

      const { data } = await api.patch(
        `/api/customer-affiliate-chats/${chatId}/request/${action}`
      );

      setChat(data?.chat || chat);
      setNotice(data?.message || `Message request ${action}ed.`);
      await load();
      await onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update message request.');
    } finally {
      setBusy('');
    }
  }

  async function changeControl(action) {
    try {
      setBusy(action);
      setError('');
      setNotice('');

      const { data } = await api.patch(
        `/api/customer-affiliate-chats/${chatId}/control/${action}`
      );

      setControls(data?.controls || controls);
      setNotice(data?.message || 'Conversation control updated.');
      await onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update conversation control.');
    } finally {
      setBusy('');
    }
  }

  async function report(event) {
    event.preventDefault();

    if (!reportReason.trim()) {
      setError('Enter a reason before reporting this conversation.');
      return;
    }

    try {
      setBusy('report');
      setError('');
      setNotice('');

      const { data } = await api.post(
        `/api/customer-affiliate-chats/${chatId}/report`,
        { reason: reportReason.trim() }
      );

      setReportReason('');
      setNotice(data?.message || 'Conversation reported.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to report conversation.');
    } finally {
      setBusy('');
    }
  }

  if (!enabled || !chatId) return null;

  const requestStatus = chat?.request_status || 'accepted';
  const muted = isWriter ? !!controls?.writer_muted : !!controls?.reader_muted;
  const blocked = isWriter ? !!controls?.writer_blocked : !!controls?.reader_blocked;

  return (
    <div style={{ ...cardStyle, marginBottom: 14, display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ color: '#0f172a' }}>Conversation controls</strong>
        <span
          style={{
            borderRadius: 999,
            background:
              requestStatus === 'pending'
                ? '#fff7ed'
                : requestStatus === 'declined'
                ? '#fef2f2'
                : '#ecfdf3',
            padding: '5px 9px',
            fontSize: 12,
            fontWeight: 900,
            color:
              requestStatus === 'pending'
                ? '#9a3412'
                : requestStatus === 'declined'
                ? '#b91c1c'
                : '#166534',
          }}
        >
          {requestStatus === 'pending'
            ? 'Message request pending'
            : requestStatus === 'declined'
            ? 'Request declined'
            : 'Conversation accepted'}
        </span>
      </div>

      {isWriter && requestStatus === 'pending' ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={!!busy}
            style={buttonStyle}
            onClick={() => decide('accept')}
          >
            {busy === 'accept' ? 'Accepting...' : 'Accept request'}
          </button>
          <button
            type="button"
            disabled={!!busy}
            style={buttonStyle}
            onClick={() => decide('decline')}
          >
            {busy === 'decline' ? 'Declining...' : 'Decline request'}
          </button>
        </div>
      ) : null}

      {!isWriter && requestStatus === 'pending' ? (
        <div style={{ color: '#92400e', fontSize: 13 }}>
          The Writer must accept this request before more messages can be sent.
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={!!busy}
          style={buttonStyle}
          onClick={() => changeControl(muted ? 'unmute' : 'mute')}
        >
          {muted ? 'Unmute conversation' : 'Mute conversation'}
        </button>
        <button
          type="button"
          disabled={!!busy}
          style={{
            ...buttonStyle,
            borderColor: blocked ? '#fecaca' : '#cbd5e1',
            color: blocked ? '#b91c1c' : '#0f172a',
          }}
          onClick={() => changeControl(blocked ? 'unblock' : 'block')}
        >
          {blocked ? 'Unblock account' : 'Block account'}
        </button>
      </div>

      <form onSubmit={report} style={{ display: 'grid', gap: 8 }}>
        <textarea
          rows={2}
          value={reportReason}
          onChange={(event) => setReportReason(event.target.value)}
          placeholder="Reason for report"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            padding: 10,
            resize: 'vertical',
          }}
        />
        <button
          type="submit"
          disabled={busy === 'report' || !reportReason.trim()}
          style={buttonStyle}
        >
          {busy === 'report' ? 'Reporting...' : 'Report conversation'}
        </button>
      </form>

      {notice ? <div style={{ color: '#166534', fontWeight: 700 }}>{notice}</div> : null}
      {error ? <div style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</div> : null}
    </div>
  );
}
