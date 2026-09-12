import {
  useEffect,
  useState,
} from 'react';

import api from '../../api/axios';

import './AdminWebinarInfrastructurePage.css';

const EMPTY_FORM = {
  access_key_id: '',
  secret_access_key: '',
};

export default function AdminWebinarInfrastructurePage() {
  const [form, setForm] =
    useState(EMPTY_FORM);

  const [settings, setSettings] =
    useState(null);

  const [status, setStatus] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [checking, setChecking] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const loadSettings = async () => {
    const { data } = await api.get(
      '/api/admin/webinar-infrastructure/settings'
    );

    if (!data?.ok) {
      throw new Error(
        data?.message ||
        'Failed to load Webinar Infrastructure.'
      );
    }

    setSettings(data.settings || null);

    return data.settings || null;
  };

  const refreshStatus = async () => {
    try {
      setChecking(true);
      setError('');

      const { data } = await api.get(
        '/api/admin/webinar-infrastructure/status'
      );

      if (!data?.ok) {
        throw new Error(
          data?.message ||
          'Failed to check AWS connection.'
        );
      }

      setStatus(data);
    } catch (statusError) {
      setError(
        statusError?.response?.data?.message ||
        statusError?.message ||
        'Failed to check AWS connection.'
      );
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const loaded =
          await loadSettings();

        if (loaded?.credentials_configured) {
          await refreshStatus();
        }
      } catch (loadError) {
        setError(
          loadError?.response?.data?.message ||
          loadError?.message ||
          'Failed to load Webinar Infrastructure.'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const save = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage('');
      setError('');

      const { data } = await api.put(
        '/api/admin/webinar-infrastructure/settings',
        form
      );

      if (!data?.ok) {
        throw new Error(
          data?.message ||
          'Failed to save credentials.'
        );
      }

      setSettings(
        data.settings || null
      );

      setForm(EMPTY_FORM);

      setMessage(
        data.message ||
        'Webinar infrastructure credentials saved securely.'
      );

      await refreshStatus();
    } catch (saveError) {
      setError(
        saveError?.response?.data?.message ||
        saveError?.message ||
        'Failed to save credentials.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-webinar-infra-page">
        <div className="admin-webinar-infra-card">
          Loading Webinar Infrastructure...
        </div>
      </div>
    );
  }

  const distribution =
    status?.distribution;

  const pricing =
    status?.pricing_plan;

  const logging =
    status?.logging;

  return (
    <div className="admin-webinar-infra-page">
      <div className="admin-webinar-infra-heading">
        <div>
          <p className="admin-webinar-infra-eyebrow">
            Infrastructure control
          </p>
          <h1>Webinar Infrastructure</h1>
          <p>
            Manage the dedicated read-only AWS connection for Bloggad webinars.
          </p>
        </div>
      </div>

      <div className="admin-webinar-infra-status-grid">
        <div className="admin-webinar-infra-status-card">
          <span>AWS connection</span>
          <strong>
            {status?.connected
              ? 'Connected'
              : settings?.credentials_configured
              ? 'Needs check'
              : 'Not configured'}
          </strong>
          <small>
            Dedicated IAM credentials only.
          </small>
        </div>

        <div className="admin-webinar-infra-status-card">
          <span>CloudFront plan</span>
          <strong>
            {pricing?.plan_tier ||
              settings?.launch_policy?.cloudfront_plan_target ||
              'FREE'}
          </strong>
          <small>
            Free plan is locked for launch.
          </small>
        </div>

        <div className="admin-webinar-infra-status-card">
          <span>Protected HLS</span>
          <strong>
            {distribution?.hls_protection?.enabled
              ? 'Protected'
              : status?.connected
              ? 'Check required'
              : 'Pending connection'}
          </strong>
          <small>
            Signed-cookie playback only.
          </small>
        </div>

        <div className="admin-webinar-infra-status-card">
          <span>Standard logging</span>
          <strong>
            {logging?.standard_v2_enabled
              ? 'Enabled'
              : 'Off'}
          </strong>
          <small>
            Remains off while CloudFront is Free.
          </small>
        </div>
      </div>

      <div className="admin-webinar-infra-card">
        <div className="admin-webinar-infra-fixed-grid">
          <div>
            <span>Region</span>
            <strong>
              {settings?.region || 'us-east-1'}
            </strong>
          </div>

          <div>
            <span>AWS Account</span>
            <strong>
              {settings?.account_id ||
                '988687011114'}
            </strong>
          </div>

          <div>
            <span>Distribution</span>
            <strong>
              {settings?.distribution_id ||
                'E3A73JW8JL9RT1'}
            </strong>
          </div>

          <div>
            <span>Webinar CDN</span>
            <strong>
              {settings?.webinar_alias ||
                'webinar-media.bloggad.com'}
            </strong>
          </div>
        </div>
      </div>

      <form
        className="admin-webinar-infra-card"
        onSubmit={save}
      >
        <div className="admin-webinar-infra-section">
          <div>
            <h2>AWS credentials</h2>
            <p>
              Paste the credentials created for
              bloggad-webinar-infra-control.
              They are encrypted before storage.
            </p>
          </div>

          <div>
            <label>
              <span>AWS Access Key ID</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.access_key_id}
                onChange={(event) =>
                  updateField(
                    'access_key_id',
                    event.target.value
                  )
                }
                placeholder={
                  settings?.access_key_id_configured
                    ? 'Configured - paste both keys only to replace'
                    : 'Paste Access Key ID'
                }
              />
            </label>

            <label>
              <span>AWS Secret Access Key</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.secret_access_key}
                onChange={(event) =>
                  updateField(
                    'secret_access_key',
                    event.target.value
                  )
                }
                placeholder={
                  settings?.secret_access_key_configured
                    ? 'Configured - paste both keys only to replace'
                    : 'Paste Secret Access Key'
                }
              />
            </label>

            <small className="admin-webinar-infra-security-note">
              Saved credentials are never returned by this page.
            </small>
          </div>
        </div>

        <div className="admin-webinar-infra-divider" />

        <div className="admin-webinar-infra-section">
          <div>
            <h2>Launch safeguards</h2>
            <p>
              Paid plan changes and CloudFront logging writes are not exposed.
            </p>
          </div>

          <div className="admin-webinar-infra-lock-list">
            <div>
              <span>Encrypted storage</span>
              <strong>
                {settings?.encryption_ready
                  ? 'Ready'
                  : 'Not ready'}
              </strong>
            </div>

            <div>
              <span>Paid plan actions</span>
              <strong>Locked</strong>
            </div>

            <div>
              <span>Logging worker</span>
              <strong>Off</strong>
            </div>
          </div>
        </div>

        {message ? (
          <div className="admin-webinar-infra-message success">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="admin-webinar-infra-message error">
            {error}
          </div>
        ) : null}

        {status?.error?.message ? (
          <div className="admin-webinar-infra-message error">
            AWS status: {status.error.message}
          </div>
        ) : null}

        <div className="admin-webinar-infra-actions">
          <button
            type="button"
            className="secondary"
            onClick={refreshStatus}
            disabled={
              checking ||
              !settings?.credentials_configured
            }
          >
            {checking
              ? 'Checking...'
              : 'Refresh AWS Status'}
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              !settings?.encryption_ready
            }
          >
            {saving
              ? 'Saving...'
              : 'Save Credentials'}
          </button>
        </div>
      </form>
    </div>
  );
}