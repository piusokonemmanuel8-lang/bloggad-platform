import { useEffect, useState } from 'react';
import api from '../../api/axios';

const providerOrder = ['paystack', 'flutterwave', 'paypal'];

function providerTitle(provider) {
  if (provider === 'paystack') return 'Paystack';
  if (provider === 'flutterwave') return 'Flutterwave';
  if (provider === 'paypal') return 'PayPal';
  return provider;
}

function emptySecrets() {
  return {
    test_public_key: '',
    test_secret_key: '',
    live_public_key: '',
    live_secret_key: '',
  };
}

function normalizeGateway(gateway) {
  return {
    provider: gateway.provider,
    display_name: gateway.display_name || providerTitle(gateway.provider),
    enabled: Boolean(gateway.enabled),
    active_mode: gateway.active_mode === 'live' ? 'live' : 'test',
    configured: Boolean(gateway.configured),
    test_public_configured: Boolean(gateway.test_public_configured),
    test_secret_configured: Boolean(gateway.test_secret_configured),
    live_public_configured: Boolean(gateway.live_public_configured),
    live_secret_configured: Boolean(gateway.live_secret_configured),
    ...emptySecrets(),
  };
}

export default function AdminPaymentGatewaysPage() {
  const [settings, setSettings] = useState(null);
  const [gateways, setGateways] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProvider, setSavingProvider] = useState('');
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoading(true);
    setNotice(null);

    try {
      const response = await api.get(
        '/api/admin/writer-finance/payment-gateways'
      );
      const data = response?.data || {};
      const map = {};

      for (const gateway of data.gateways || []) {
        map[gateway.provider] = normalizeGateway(gateway);
      }

      setSettings(data.settings || null);
      setGateways(map);
    } catch (error) {
      setNotice({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to load payment gateway settings.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateSettingsField(key, value) {
    setSettings((current) => ({
      ...(current || {}),
      [key]: value,
    }));
  }

  function updateGatewayField(provider, key, value) {
    setGateways((current) => ({
      ...current,
      [provider]: {
        ...(current[provider] || {}),
        [key]: value,
      },
    }));
  }

  async function saveSettings() {
    if (!settings) return;

    setSavingSettings(true);
    setNotice(null);

    try {
      const response = await api.put(
        '/api/admin/writer-finance/reader-credit-purchase-settings',
        {
          enabled: Boolean(settings.enabled),
          credits_per_usd: Number(settings.credits_per_usd),
          quick_option_one_credits: Number(
            settings.quick_option_one_credits
          ),
          quick_option_two_credits: Number(
            settings.quick_option_two_credits
          ),
          minimum_credits: Number(settings.minimum_credits),
          maximum_credits: Number(settings.maximum_credits),
        }
      );

      setSettings(response?.data?.settings || settings);
      setNotice({
        type: 'success',
        text:
          response?.data?.message ||
          'Reader credit purchase settings saved.',
      });
    } catch (error) {
      setNotice({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to save Reader credit purchase settings.',
      });
    } finally {
      setSavingSettings(false);
    }
  }

  async function saveGateway(provider) {
    const gateway = gateways[provider];
    if (!gateway) return;

    setSavingProvider(provider);
    setNotice(null);

    try {
      const response = await api.put(
        `/api/admin/writer-finance/payment-gateways/${provider}`,
        {
          enabled: Boolean(gateway.enabled),
          active_mode: gateway.active_mode,
          test_public_key: gateway.test_public_key,
          test_secret_key: gateway.test_secret_key,
          live_public_key: gateway.live_public_key,
          live_secret_key: gateway.live_secret_key,
        }
      );

      const fresh = normalizeGateway(response?.data?.gateway || gateway);

      setGateways((current) => ({
        ...current,
        [provider]: fresh,
      }));

      setNotice({
        type: 'success',
        text:
          response?.data?.message ||
          `${providerTitle(provider)} settings saved.`,
      });
    } catch (error) {
      setNotice({
        type: 'error',
        text:
          error?.response?.data?.message ||
          `Failed to save ${providerTitle(provider)} settings.`,
      });
    } finally {
      setSavingProvider('');
    }
  }

  if (loading) {
    return (
      <main className="admin-payment-gateways-page">
        <style>{pageCss}</style>
        <div className="apg-state">Loading payment gateway settings...</div>
      </main>
    );
  }

  return (
    <main className="admin-payment-gateways-page">
      <style>{pageCss}</style>

      <header className="apg-header">
        <div>
          <span>PAYMENTS</span>
          <h1>Payment Gateways</h1>
          <p>
            Manage Reader credit pricing and secure test/live gateway
            credentials.
          </p>
        </div>
      </header>

      {notice ? (
        <div className={`apg-notice ${notice.type || ''}`} role="status">
          {notice.text}
        </div>
      ) : null}

      <section className="apg-card">
        <div className="apg-card-head">
          <div>
            <h2>Reader credit purchase settings</h2>
            <p>
              Pricing is calculated on the server. Currency is locked to USD.
            </p>
          </div>
          <label className="apg-switch">
            <input
              type="checkbox"
              checked={Boolean(settings?.enabled)}
              onChange={(event) =>
                updateSettingsField('enabled', event.target.checked)
              }
            />
            <span>Purchases enabled</span>
          </label>
        </div>

        <div className="apg-grid">
          <label>
            <span>Credits per $1 USD</span>
            <input
              type="number"
              min="1"
              step="1"
              value={settings?.credits_per_usd ?? ''}
              onChange={(event) =>
                updateSettingsField('credits_per_usd', event.target.value)
              }
            />
          </label>
          <label>
            <span>Quick option 1</span>
            <input
              type="number"
              min="1"
              step="1"
              value={settings?.quick_option_one_credits ?? ''}
              onChange={(event) =>
                updateSettingsField(
                  'quick_option_one_credits',
                  event.target.value
                )
              }
            />
          </label>
          <label>
            <span>Quick option 2</span>
            <input
              type="number"
              min="1"
              step="1"
              value={settings?.quick_option_two_credits ?? ''}
              onChange={(event) =>
                updateSettingsField(
                  'quick_option_two_credits',
                  event.target.value
                )
              }
            />
          </label>
          <label>
            <span>Minimum credits</span>
            <input
              type="number"
              min="1"
              step="1"
              value={settings?.minimum_credits ?? ''}
              onChange={(event) =>
                updateSettingsField('minimum_credits', event.target.value)
              }
            />
          </label>
          <label>
            <span>Maximum credits</span>
            <input
              type="number"
              min="1"
              step="1"
              value={settings?.maximum_credits ?? ''}
              onChange={(event) =>
                updateSettingsField('maximum_credits', event.target.value)
              }
            />
          </label>
          <label>
            <span>Currency</span>
            <input value="USD" disabled />
          </label>
        </div>

        <div className="apg-actions">
          <button
            type="button"
            onClick={saveSettings}
            disabled={savingSettings}
          >
            {savingSettings ? 'Saving...' : 'Save Reader pricing'}
          </button>
        </div>
      </section>

      <section className="apg-provider-list">
        {providerOrder.map((provider) => {
          const gateway = gateways[provider];
          if (!gateway) return null;

          const publicLabel =
            provider === 'paypal' ? 'Client ID' : 'Public key';
          const secretLabel =
            provider === 'paypal' ? 'Client secret' : 'Secret key';

          return (
            <article className="apg-card apg-provider-card" key={provider}>
              <div className="apg-card-head">
                <div>
                  <div className="apg-provider-title">
                    <h2>{providerTitle(provider)}</h2>
                    <span
                      className={
                        gateway.configured ? 'configured' : 'not-configured'
                      }
                    >
                      {gateway.configured
                        ? `${gateway.active_mode} configured`
                        : 'Active mode not configured'}
                    </span>
                  </div>
                  <p>
                    Credentials are encrypted before storage. Existing secrets
                    are never returned to this page.
                  </p>
                </div>

                <label className="apg-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(gateway.enabled)}
                    onChange={(event) =>
                      updateGatewayField(
                        provider,
                        'enabled',
                        event.target.checked
                      )
                    }
                  />
                  <span>Enabled</span>
                </label>
              </div>

              <div className="apg-mode">
                <span>Active mode</span>
                <div>
                  {['test', 'live'].map((mode) => (
                    <button
                      type="button"
                      className={
                        gateway.active_mode === mode ? 'selected' : ''
                      }
                      key={mode}
                      onClick={() =>
                        updateGatewayField(provider, 'active_mode', mode)
                      }
                    >
                      {mode === 'test' ? 'Test / Sandbox' : 'Live'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="apg-credential-sections">
                {['test', 'live'].map((mode) => (
                  <div className="apg-credential-group" key={mode}>
                    <div className="apg-credential-head">
                      <strong>
                        {mode === 'test' ? 'Test / Sandbox' : 'Live'} credentials
                      </strong>
                      <span>
                        {gateway[`${mode}_secret_configured`]
                          ? 'Secret saved'
                          : 'Secret not saved'}
                      </span>
                    </div>

                    <label>
                      <span>{publicLabel}</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={gateway[`${mode}_public_key`]}
                        placeholder={
                          gateway[`${mode}_public_configured`]
                            ? 'Configured - leave blank to keep'
                            : `Enter ${mode} ${publicLabel.toLowerCase()}`
                        }
                        onChange={(event) =>
                          updateGatewayField(
                            provider,
                            `${mode}_public_key`,
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>{secretLabel}</span>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={gateway[`${mode}_secret_key`]}
                        placeholder={
                          gateway[`${mode}_secret_configured`]
                            ? 'Configured - leave blank to keep'
                            : `Enter ${mode} ${secretLabel.toLowerCase()}`
                        }
                        onChange={(event) =>
                          updateGatewayField(
                            provider,
                            `${mode}_secret_key`,
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="apg-actions">
                <button
                  type="button"
                  onClick={() => saveGateway(provider)}
                  disabled={savingProvider === provider}
                >
                  {savingProvider === provider
                    ? 'Saving...'
                    : `Save ${providerTitle(provider)}`}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

const pageCss = `
  .admin-payment-gateways-page {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding: 24px;
    box-sizing: border-box;
    color: #0f172a;
  }
  .apg-header {
    margin-bottom: 18px;
  }
  .apg-header span {
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }
  .apg-header h1 {
    margin: 5px 0 0;
    font-size: 28px;
    letter-spacing: -0.035em;
  }
  .apg-header p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 13px;
  }
  .apg-state,
  .apg-card {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
  }
  .apg-state {
    padding: 24px;
    color: #64748b;
  }
  .apg-card {
    padding: 20px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  }
  .apg-notice {
    margin-bottom: 14px;
    padding: 12px 14px;
    border: 1px solid #dbe4ef;
    border-radius: 10px;
    background: #f8fafc;
    color: #334155;
    font-size: 13px;
  }
  .apg-notice.success {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #166534;
  }
  .apg-notice.error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }
  .apg-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }
  .apg-card-head h2 {
    margin: 0;
    font-size: 17px;
  }
  .apg-card-head p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }
  .apg-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .apg-switch input {
    width: 16px;
    height: 16px;
  }
  .apg-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }
  .apg-grid label,
  .apg-credential-group label {
    display: grid;
    gap: 6px;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
  }
  .apg-grid input,
  .apg-credential-group input {
    width: 100%;
    height: 42px;
    box-sizing: border-box;
    border: 1px solid #cbd5e1;
    border-radius: 9px;
    padding: 0 11px;
    background: #ffffff;
    color: #0f172a;
    font: inherit;
    font-size: 12px;
    outline: none;
  }
  .apg-grid input:focus,
  .apg-credential-group input:focus {
    border-color: #64748b;
    box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.12);
  }
  .apg-grid input:disabled {
    background: #f8fafc;
    color: #64748b;
  }
  .apg-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  .apg-actions button {
    min-height: 40px;
    padding: 0 15px;
    border: 0;
    border-radius: 9px;
    background: #111827;
    color: #ffffff;
    font: inherit;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
  }
  .apg-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .apg-provider-list {
    display: grid;
    gap: 14px;
    margin-top: 14px;
  }
  .apg-provider-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
  }
  .apg-provider-title > span {
    padding: 4px 7px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #64748b;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
  }
  .apg-provider-title > span.configured {
    background: #ecfdf5;
    color: #047857;
  }
  .apg-mode {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 18px;
    padding: 11px 12px;
    border-radius: 10px;
    background: #f8fafc;
  }
  .apg-mode > span {
    color: #475569;
    font-size: 11px;
    font-weight: 750;
  }
  .apg-mode > div {
    display: flex;
    gap: 6px;
  }
  .apg-mode button {
    min-height: 34px;
    padding: 0 11px;
    border: 1px solid #dbe4ef;
    border-radius: 8px;
    background: #ffffff;
    color: #475569;
    font: inherit;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
  }
  .apg-mode button.selected {
    border-color: #111827;
    background: #111827;
    color: #ffffff;
  }
  .apg-credential-sections {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }
  .apg-credential-group {
    display: grid;
    gap: 10px;
    min-width: 0;
    padding: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
  .apg-credential-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .apg-credential-head strong {
    font-size: 11px;
  }
  .apg-credential-head span {
    color: #94a3b8;
    font-size: 9px;
  }
  @media (max-width: 820px) {
    .admin-payment-gateways-page {
      padding: 14px;
    }
    .apg-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .apg-credential-sections {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 560px) {
    .admin-payment-gateways-page {
      padding: 8px;
    }
    .apg-card {
      padding: 14px;
      border-radius: 12px;
    }
    .apg-card-head {
      flex-direction: column;
    }
    .apg-grid {
      grid-template-columns: 1fr;
    }
    .apg-mode {
      align-items: flex-start;
      flex-direction: column;
    }
    .apg-actions button {
      width: 100%;
    }
  }
`;
