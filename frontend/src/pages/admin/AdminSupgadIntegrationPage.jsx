import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import './AdminSupgadIntegrationPage.css';

const EMPTY_FORM = {
  sso_secret: '',
  sync_key: '',
  api_base_url: '',
};

export default function AdminSupgadIntegrationPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const status = useMemo(
    () => ({
      sso: settings?.sso_secret_configured ? 'Configured' : 'Not configured',
      sync: settings?.sync_key_configured ? 'Configured' : 'Not configured',
    }),
    [settings]
  );

  const load = async () => {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/api/admin/supgad-integration');

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load settings.');
      }

      setSettings(data.settings || null);
      setForm((current) => ({
        ...current,
        api_base_url: data.settings?.api_base_url || '',
      }));
    } catch (loadError) {
      setError(
        loadError?.response?.data?.message ||
          loadError?.message ||
          'Failed to load settings.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field, value) => {
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

      const { data } = await api.put('/api/admin/supgad-integration', form);

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to save settings.');
      }

      setSettings(data.settings || null);
      setForm({
        sso_secret: '',
        sync_key: '',
        api_base_url: data.settings?.api_base_url || '',
      });
      setMessage('Supgad integration settings saved.');
    } catch (saveError) {
      setError(
        saveError?.response?.data?.message ||
          saveError?.message ||
          'Failed to save settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-supgad-page">
        <div className="admin-supgad-card">Loading Supgad integration...</div>
      </div>
    );
  }

  return (
    <div className="admin-supgad-page">
      <div className="admin-supgad-heading">
        <div>
          <p className="admin-supgad-eyebrow">Platform integration</p>
          <h1>Supgad Integration</h1>
          <p>
            Connect Bloggad to Supgad without exposing integration secrets.
          </p>
        </div>
      </div>

      <div className="admin-supgad-status-grid">
        <div className="admin-supgad-status-card">
          <span>Supgad SSO</span>
          <strong>{status.sso}</strong>
          <small>
            {settings?.sso_secret_source === 'admin'
              ? 'Stored securely in Admin'
              : 'Using server environment fallback'}
          </small>
        </div>

        <div className="admin-supgad-status-card">
          <span>Traffic Sync</span>
          <strong>{status.sync}</strong>
          <small>
            {settings?.sync_key_source === 'admin'
              ? 'Stored securely in Admin'
              : 'Using server environment fallback'}
          </small>
        </div>

        <div className="admin-supgad-status-card">
          <span>Encrypted storage</span>
          <strong>
            {settings?.encryption_ready ? 'Ready' : 'Not ready'}
          </strong>
          <small>Secrets are never returned by this page.</small>
        </div>
      </div>

      <form className="admin-supgad-card" onSubmit={save}>
        <div className="admin-supgad-section">
          <div>
            <h2>Single Sign-On</h2>
            <p>
              Paste the exact BLOGGAD_SSO_SECRET already configured on Supgad.
            </p>
          </div>

          <label>
            <span>BLOGGAD_SSO_SECRET</span>
            <input
              type="password"
              autoComplete="new-password"
              value={form.sso_secret}
              onChange={(event) =>
                updateField('sso_secret', event.target.value)
              }
              placeholder={
                settings?.sso_secret_configured
                  ? 'Configured - paste only to replace'
                  : 'Paste Supgad SSO secret'
              }
            />
          </label>
        </div>

        <div className="admin-supgad-divider" />

        <div className="admin-supgad-section">
          <div>
            <h2>Traffic Sync</h2>
            <p>
              Paste the exact BLOGGAD_SUPGAD_SYNC_KEY used by Supgad for the
              x-bloggad-sync-key channel.
            </p>
          </div>

          <label>
            <span>BLOGGAD_SUPGAD_SYNC_KEY</span>
            <input
              type="password"
              autoComplete="new-password"
              value={form.sync_key}
              onChange={(event) =>
                updateField('sync_key', event.target.value)
              }
              placeholder={
                settings?.sync_key_configured
                  ? 'Configured - paste only to replace'
                  : 'Paste Supgad traffic sync key'
              }
            />
          </label>

          <label>
            <span>Supgad API Base URL</span>
            <input
              type="url"
              value={form.api_base_url}
              onChange={(event) =>
                updateField('api_base_url', event.target.value)
              }
              placeholder="https://supgad.com"
            />
            <small>
              Local development can use http://localhost:5000.
            </small>
          </label>
        </div>

        {message ? (
          <div className="admin-supgad-message success">{message}</div>
        ) : null}

        {error ? (
          <div className="admin-supgad-message error">{error}</div>
        ) : null}

        <div className="admin-supgad-actions">
          <button type="submit" disabled={saving || !settings?.encryption_ready}>
            {saving ? 'Saving...' : 'Save Integration'}
          </button>
        </div>
      </form>
    </div>
  );
}