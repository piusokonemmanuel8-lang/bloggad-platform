import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import api from '../../api/axios';
import './RoleSwitcher.css';

function saveRoleSession(data, activeRole) {
  const token = String(data?.token || '').trim();
  const user = data?.user || null;

  if (token) {
    [
      'bloggad_token',
      'token',
      'authToken',
      'accessToken',
      'customerToken',
    ].forEach((key) => localStorage.setItem(key, token));
  }

  if (user) {
    const serialized = JSON.stringify(user);

    [
      'bloggad_user',
      'user',
      'customerUser',
    ].forEach((key) => localStorage.setItem(key, serialized));
  }

  localStorage.setItem('bloggad_active_role', activeRole);
}

export default function RoleSwitcher({ currentRole = 'reader', compact = false, iconOnly = false }) {
  const normalizedCurrentRole = currentRole === 'writer' ? 'writer' : 'reader';
  const nextRole = normalizedCurrentRole === 'writer' ? 'reader' : 'writer';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSwitch() {
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      const { data } = await api.post('/api/auth/switch-role', {
        role: nextRole,
      });

      if (!data?.ok || !data?.token || !data?.user) {
        throw new Error(data?.message || 'Failed to switch role.');
      }

      saveRoleSession(data, nextRole);

      const fallback = nextRole === 'writer'
        ? '/writer/dashboard'
        : '/reader/dashboard';

      window.location.assign(data?.redirect_to || fallback);
    } catch (switchError) {
      setError(
        switchError?.response?.data?.message ||
        switchError?.message ||
        'Failed to switch role.'
      );
      setBusy(false);
    }
  }

  return (
    <span
      className={`bloggad-role-switcher${compact ? ' compact' : ''}${iconOnly ? ' icon-only' : ''}`}
    >
      <button
        type="button"
        className="bloggad-role-switcher-button"
        onClick={handleSwitch}
        disabled={busy}
        title={`Switch to ${nextRole === 'writer' ? 'Writer' : 'Reader'}`}
      >
        <ArrowLeftRight size={15} strokeWidth={1.9} />
        {iconOnly ? null : (
          <span>
            {busy
              ? 'Switching...'
              : `Switch to ${nextRole === 'writer' ? 'Writer' : 'Reader'}`}
          </span>
        )}
      </button>

      {error ? (
        <span className="bloggad-role-switcher-error" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}