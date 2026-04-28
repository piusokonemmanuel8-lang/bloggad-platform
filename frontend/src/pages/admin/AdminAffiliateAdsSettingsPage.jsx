import { useEffect, useState } from 'react';
import api from '../../services/api';

const DEFAULT_SETTINGS = {
  minimum_budget: '10',
  product_cost_per_view: '0.0015',
  product_cost_per_click: '0.0700',
  post_cost_per_view: '0.0010',
  post_cost_per_click: '0.0400',
  website_cost_per_view: '0.0010',
  website_cost_per_click: '0.0500',
  currency: 'USD',
};

export default function AdminAffiliateAdsSettingsPage() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function fetchSettings() {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/admin/affiliate-ads-settings');
      const settings = data?.settings || DEFAULT_SETTINGS;

      setForm({
        minimum_budget: String(settings.minimum_budget ?? '10'),
        product_cost_per_view: String(settings.product_cost_per_view ?? '0.0015'),
        product_cost_per_click: String(settings.product_cost_per_click ?? '0.0700'),
        post_cost_per_view: String(settings.post_cost_per_view ?? '0.0010'),
        post_cost_per_click: String(settings.post_cost_per_click ?? '0.0400'),
        website_cost_per_view: String(settings.website_cost_per_view ?? '0.0010'),
        website_cost_per_click: String(settings.website_cost_per_click ?? '0.0500'),
        currency: settings.currency || 'USD',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load affiliate ads settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setNotice('');
      setError('');

      const payload = {
        minimum_budget: Number(form.minimum_budget),
        product_cost_per_view: Number(form.product_cost_per_view),
        product_cost_per_click: Number(form.product_cost_per_click),
        post_cost_per_view: Number(form.post_cost_per_view),
        post_cost_per_click: Number(form.post_cost_per_click),
        website_cost_per_view: Number(form.website_cost_per_view),
        website_cost_per_click: Number(form.website_cost_per_click),
        currency: form.currency,
      };

      const { data } = await api.put('/admin/affiliate-ads-settings', payload);

      setNotice(data?.message || 'Affiliate ads settings updated successfully.');
      await fetchSettings();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save affiliate ads settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="aas-page">
      <style>{styles}</style>

      <section className="aas-hero">
        <div>
          <span className="aas-pill">Affiliate Ads Settings</span>
          <h1>Set view and click prices for affiliate promotions.</h1>
          <p>
            Control the minimum budget and charge rates for product, post, and website ads.
            Affiliates will see these prices before creating campaigns.
          </p>
        </div>

        <div className="aas-rate-card">
          <span>Minimum Budget</span>
          <strong>{form.currency} {Number(form.minimum_budget || 0).toFixed(2)}</strong>
          <p>Applies to new campaigns and top-ups.</p>
        </div>
      </section>

      {(notice || error) && (
        <div className={error ? 'aas-alert error' : 'aas-alert success'}>
          {error || notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="aas-card">
        <div className="aas-card-head">
          <div>
            <h2>Pricing Rules</h2>
            <p>Use very small decimal prices for views and higher prices for clicks.</p>
          </div>

          <button type="button" onClick={fetchSettings} className="aas-soft-btn">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="aas-empty">Loading settings...</div>
        ) : (
          <>
            <div className="aas-grid">
              <label className="aas-field">
                <span>Minimum Budget</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.0001"
                  value={form.minimum_budget}
                  onChange={(event) => updateForm('minimum_budget', event.target.value)}
                />
              </label>

              <label className="aas-field">
                <span>Currency</span>
                <select
                  value={form.currency}
                  onChange={(event) => updateForm('currency', event.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                </select>
              </label>
            </div>

            <div className="aas-sections">
              <section className="aas-pricing-box">
                <h3>Product Promotion</h3>
                <p>Shown inside product-featured areas.</p>

                <label className="aas-field">
                  <span>Product Cost Per View</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.product_cost_per_view}
                    onChange={(event) => updateForm('product_cost_per_view', event.target.value)}
                  />
                </label>

                <label className="aas-field">
                  <span>Product Cost Per Click</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.product_cost_per_click}
                    onChange={(event) => updateForm('product_cost_per_click', event.target.value)}
                  />
                </label>
              </section>

              <section className="aas-pricing-box">
                <h3>Post Promotion</h3>
                <p>Shown inside promoted blog/post areas.</p>

                <label className="aas-field">
                  <span>Post Cost Per View</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.post_cost_per_view}
                    onChange={(event) => updateForm('post_cost_per_view', event.target.value)}
                  />
                </label>

                <label className="aas-field">
                  <span>Post Cost Per Click</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.post_cost_per_click}
                    onChange={(event) => updateForm('post_cost_per_click', event.target.value)}
                  />
                </label>
              </section>

              <section className="aas-pricing-box">
                <h3>Website Promotion</h3>
                <p>Shown inside featured website sections.</p>

                <label className="aas-field">
                  <span>Website Cost Per View</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.website_cost_per_view}
                    onChange={(event) => updateForm('website_cost_per_view', event.target.value)}
                  />
                </label>

                <label className="aas-field">
                  <span>Website Cost Per Click</span>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.website_cost_per_click}
                    onChange={(event) => updateForm('website_cost_per_click', event.target.value)}
                  />
                </label>
              </section>
            </div>

            <button type="submit" disabled={saving} className="aas-primary-btn">
              {saving ? 'Saving...' : 'Save Affiliate Ads Settings'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

const styles = `
  .aas-page {
    min-height: calc(100vh - 120px);
    background:
      radial-gradient(circle at top left, rgba(14, 165, 233, 0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 24%),
      #f5f7fb;
    color: #0f172a;
    padding: 4px;
  }

  .aas-hero {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    align-items: center;
    margin-bottom: 22px;
    padding: 34px;
    border-radius: 28px;
    background: linear-gradient(135deg, #07111f, #0f172a 48%, #020617);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .aas-pill {
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

  .aas-hero h1 {
    margin: 0;
    max-width: 760px;
    font-size: 38px;
    line-height: 1.05;
    font-weight: 950;
    letter-spacing: -0.04em;
    color: #ffffff;
  }

  .aas-hero p {
    margin: 16px 0 0;
    max-width: 720px;
    color: #e2e8f0;
    font-size: 15px;
    line-height: 1.75;
  }

  .aas-rate-card {
    padding: 24px;
    border-radius: 24px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .aas-rate-card span {
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 900;
    margin-bottom: 10px;
  }

  .aas-rate-card strong {
    display: block;
    color: #ffffff;
    font-size: 34px;
    line-height: 1;
    font-weight: 950;
  }

  .aas-rate-card p {
    margin: 12px 0 0;
    color: #cbd5e1;
    font-size: 13px;
  }

  .aas-alert {
    margin-bottom: 18px;
    padding: 15px 18px;
    border-radius: 18px;
    font-size: 14px;
    font-weight: 800;
  }

  .aas-alert.success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .aas-alert.error {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #9f1239;
  }

  .aas-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .aas-card-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 22px;
  }

  .aas-card h2 {
    margin: 0;
    color: #0f172a;
    font-size: 24px;
    font-weight: 950;
    letter-spacing: -0.03em;
  }

  .aas-card-head p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
  }

  .aas-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }

  .aas-sections {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .aas-pricing-box {
    border-radius: 24px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 20px;
  }

  .aas-pricing-box h3 {
    margin: 0;
    color: #0f172a;
    font-size: 18px;
    font-weight: 950;
  }

  .aas-pricing-box p {
    margin: 7px 0 18px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.5;
  }

  .aas-field {
    display: block;
    margin-bottom: 16px;
  }

  .aas-field span {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #334155;
    font-weight: 900;
  }

  .aas-field input,
  .aas-field select {
    width: 100%;
    border: 1px solid #dbe3ef;
    background: #ffffff;
    border-radius: 16px;
    padding: 13px 14px;
    color: #0f172a;
    font-size: 14px;
    outline: none;
  }

  .aas-field input:focus,
  .aas-field select:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.14);
  }

  .aas-primary-btn,
  .aas-soft-btn {
    cursor: pointer;
    font-weight: 950;
    transition: 0.2s ease;
  }

  .aas-primary-btn {
    width: 100%;
    border: 0;
    margin-top: 10px;
    padding: 15px 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #ffffff;
    box-shadow: 0 14px 35px rgba(59, 130, 246, 0.25);
  }

  .aas-primary-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .aas-soft-btn {
    border: 1px solid #e2e8f0;
    padding: 11px 15px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #0f172a;
  }

  .aas-empty {
    display: grid;
    place-items: center;
    min-height: 220px;
    border-radius: 24px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    color: #64748b;
    text-align: center;
    padding: 34px;
  }

  @media (max-width: 1100px) {
    .aas-hero,
    .aas-sections {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .aas-page {
      padding: 0;
    }

    .aas-hero,
    .aas-card {
      border-radius: 20px;
      padding: 20px;
    }

    .aas-hero h1 {
      font-size: 28px;
    }

    .aas-grid {
      grid-template-columns: 1fr;
    }

    .aas-card-head {
      flex-direction: column;
    }
  }
`;