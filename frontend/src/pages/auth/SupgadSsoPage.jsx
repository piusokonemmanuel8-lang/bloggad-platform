import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { saveSupgadReturnRole } from '../../utils/supgadReturn';

const TOKEN_KEYS = [
  'bloggad_token',
  'token',
  'authToken',
  'accessToken',
  'customerToken',
];

const USER_KEYS = [
  'bloggad_user',
  'user',
  'customerUser',
];

function saveBloggadSession(token, user, supgadActiveRole, bloggadRole = 'reader') {
  for (const key of TOKEN_KEYS) {
    localStorage.setItem(key, token);
  }

  const serializedUser = JSON.stringify(user);

  for (const key of USER_KEYS) {
    localStorage.setItem(key, serializedUser);
  }

  localStorage.setItem('bloggad_active_role', bloggadRole);
  saveSupgadReturnRole(supgadActiveRole);
}

export default function SupgadSsoPage() {
  const startedRef = useRef(false);
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const queryParams = new URLSearchParams(window.location.search || '');
    const dashboardRole =
      queryParams.get('pulse_dashboard') === 'writer' ? 'writer' : 'reader';
    const hash = window.location.hash || '';
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const ssoToken = params.get('sso') || '';

    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`
    );

    if (!ssoToken) {
      setStatus('Supgad sign-in link is missing or invalid.');
      return;
    }

    const completeSignIn = async () => {
      try {
        const { data } = await api.post('/api/auth/supgad', {
          token: ssoToken,
        });

        if (!data?.ok || !data?.token || !data?.user) {
          throw new Error(data?.message || 'Supgad sign-in failed.');
        }

        if (dashboardRole === 'writer') {
          const switchResponse = await api.post(
            '/api/auth/switch-role',
            { role: 'writer' },
            {
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            }
          );

          const switched = switchResponse?.data || {};
          if (!switched?.ok || !switched?.token || !switched?.user) {
            throw new Error(
              switched?.message || 'Bloggad could not switch to Writer.'
            );
          }

          saveBloggadSession(
            switched.token,
            switched.user,
            data.supgad_active_role,
            'writer'
          );
          window.location.replace('/writer/dashboard');
          return;
        }

        saveBloggadSession(
          data.token,
          data.user,
          data.supgad_active_role,
          'reader'
        );
        window.location.replace('/reader/dashboard');
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Supgad sign-in failed.';

        setStatus(message);
      }
    };

    completeSignIn();
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#f7f8fa',
        color: '#111827',
      }}
    >
      <section
        style={{
          width: 'min(420px, 100%)',
          padding: '28px',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          background: '#ffffff',
          textAlign: 'center',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 14px',
            borderRadius: '12px',
            background: '#111827',
          }}
        />
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: '20px',
            lineHeight: 1.25,
          }}
        >
          Bloggad
        </h1>
        <p
          style={{
            margin: 0,
            color: '#667085',
            fontSize: '14px',
            lineHeight: 1.5,
          }}
        >
          {status}
        </p>
      </section>
    </main>
  );
}