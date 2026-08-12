import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function getStoredToken() {
  return (
    localStorage.getItem('bloggad_token') ||
    localStorage.getItem('customerToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    ''
  );
}

function formatMoney(value, currency = 'USD') {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function toDatetimeLocalInput(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const INITIAL_FORM = {
  campaign_name: '',
  campaign_type: 'banner',
  buying_model: 'cpc',
  objective: 'traffic',
  destination_url: '',
  display_url: '',
  headline: '',
  description_text: '',
  call_to_action: 'Learn More',
  budget_total: '',
  budget_daily: '',
  bid_amount: '',
  start_at: '',
  end_at: '',
};

const CTA_OPTIONS = [
  'Learn More',
  'Buy Now',
  'Shop Now',
  'Get Offer',
  'Sign Up',
  'Order Now',
  'Download',
  'Contact Us',
];

function Field({ label, children, className = '' }) {
  return (
    <label className={`reader-campaign-field ${className}`.trim()}>
      <span className="reader-campaign-label">{label}</span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="reader-campaign-preview-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CustomerAdvertiserCreateCampaignPage() {
  const navigate = useNavigate();
  const token = useMemo(() => getStoredToken(), []);

  const [loadingWallet, setLoadingWallet] = useState(false);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);
  const [submittingCreative, setSubmittingCreative] = useState(false);

  const [wallet, setWallet] = useState(null);
  const [campaign, setCampaign] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState(INITIAL_FORM);

  const [creativeFile, setCreativeFile] = useState(null);
  const [creativePreview, setCreativePreview] = useState('');
  const [creativeAltText, setCreativeAltText] = useState('');
  const [creativeNote, setCreativeNote] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    return () => {
      if (creativePreview && creativePreview.startsWith('blob:')) {
        URL.revokeObjectURL(creativePreview);
      }
    };
  }, [creativePreview]);

  useEffect(() => {
    async function loadWallet() {
      if (!token) return;

      setLoadingWallet(true);
      setError('');

      try {
        const response = await fetch(getApiUrl('/api/customer/advertiser/wallet'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to load advertiser wallet.');
        }

        setWallet(data?.wallet || null);
      } catch (err) {
        setError(err.message || 'Failed to load advertiser wallet.');
      } finally {
        setLoadingWallet(false);
      }
    }

    loadWallet();
  }, [token]);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleCreativeFileChange(event) {
    const file = event.target.files?.[0] || null;

    if (creativePreview && creativePreview.startsWith('blob:')) {
      URL.revokeObjectURL(creativePreview);
    }

    setCreativeFile(file);

    if (file) {
      setCreativePreview(URL.createObjectURL(file));
    } else {
      setCreativePreview('');
    }
  }

  function validateForm() {
    if (!form.campaign_name.trim()) {
      throw new Error('Campaign name is required.');
    }

    if (!form.destination_url.trim()) {
      throw new Error('Destination URL is required.');
    }

    if (!form.headline.trim()) {
      throw new Error('Headline is required.');
    }

    if (!form.call_to_action.trim()) {
      throw new Error('Call to action is required.');
    }

    if (!form.budget_total || Number(form.budget_total) <= 0) {
      throw new Error('Total budget must be greater than zero.');
    }

    if (!form.budget_daily || Number(form.budget_daily) <= 0) {
      throw new Error('Daily budget must be greater than zero.');
    }

    if (!form.bid_amount || Number(form.bid_amount) <= 0) {
      throw new Error('Bid amount must be greater than zero.');
    }

    if (form.start_at && form.end_at) {
      const start = new Date(form.start_at);
      const end = new Date(form.end_at);

      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
        throw new Error('End date must be later than start date.');
      }
    }

    if (!creativeFile) {
      throw new Error('Banner image is required.');
    }
  }

  async function createCampaign() {
    const payload = {
      campaign_name: form.campaign_name.trim(),
      campaign_type: form.campaign_type,
      buying_model: form.buying_model,
      objective: form.objective,
      destination_url: form.destination_url.trim(),
      display_url: form.display_url.trim(),
      headline: form.headline.trim(),
      description_text: form.description_text.trim(),
      call_to_action: form.call_to_action.trim(),
      budget_total: Number(form.budget_total || 0),
      budget_daily: Number(form.budget_daily || 0),
      bid_amount: Number(form.bid_amount || 0),
      start_at: form.start_at || null,
      end_at: form.end_at || null,
    };

    const response = await fetch(getApiUrl('/api/customer/advertiser/campaigns'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok) {
      throw new Error(data?.message || 'Failed to create campaign.');
    }

    const createdCampaign =
      data?.campaign ||
      data?.data ||
      null;

    if (!createdCampaign?.id) {
      throw new Error('Campaign was created but no campaign id was returned.');
    }

    return createdCampaign;
  }

  async function uploadCreative(campaignId) {
    const body = new FormData();

    body.append('creative_type', form.campaign_type === 'native' ? 'native' : 'image');
    body.append('headline', form.headline.trim());
    body.append('description_text', form.description_text.trim());
    body.append('call_to_action', form.call_to_action.trim());
    body.append('destination_url', form.destination_url.trim());
    body.append('display_url', form.display_url.trim());
    body.append('alt_text', creativeAltText.trim());
    body.append('admin_note', creativeNote.trim());
    body.append('asset', creativeFile);

    const response = await fetch(
      getApiUrl(`/api/customer/advertiser/campaigns/${campaignId}/creatives`),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.ok) {
      throw new Error(data?.message || 'Failed to upload creative.');
    }

    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      validateForm();

      setSubmittingCampaign(true);
      const createdCampaign = await createCampaign();
      setCampaign(createdCampaign);
      setSubmittingCampaign(false);

      setSubmittingCreative(true);
      await uploadCreative(createdCampaign.id);
      setSubmittingCreative(false);

      setSuccess('Campaign and creative submitted successfully.');

      setTimeout(() => {
        navigate(`/customer/advertiser/campaigns/${createdCampaign.id}`);
      }, 900);
    } catch (err) {
      setSubmittingCampaign(false);
      setSubmittingCreative(false);
      setError(err.message || 'Failed to create campaign.');
    }
  }

  const isSubmitting = submittingCampaign || submittingCreative;
  const walletCurrency = wallet?.currency || 'USD';
  const walletBalance = loadingWallet
    ? 'Loading...'
    : formatMoney(wallet?.available_balance || 0, walletCurrency);
  const displayUrl = form.display_url.trim() || 'yourwebsite.com';
  const previewTitle = form.headline.trim() || 'Your ad headline preview';
  const previewDescription =
    form.description_text.trim() || 'Your ad description will show here.';

  return (
    <ReaderUnifiedShell title="Create Campaign" subtitle="Advertiser">
      <style>{styles}</style>

      <main className="reader-campaign-create-page">
        <section className="reader-campaign-context">
          <div className="reader-campaign-context-copy">
            <h1>Campaign setup</h1>
            <p>Create the campaign first, then the creative is uploaded automatically.</p>
          </div>

          <div className="reader-campaign-context-actions">
            <div className="reader-campaign-wallet" aria-live="polite">
              <span>Wallet</span>
              <strong>{walletBalance}</strong>
            </div>

            <Link className="reader-campaign-back" to="/customer/advertiser/campaigns">
              Back to campaigns
            </Link>
          </div>
        </section>

        {error ? (
          <div className="reader-campaign-alert error" role="alert">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="reader-campaign-alert success" role="status">
            {success}
          </div>
        ) : null}

        <div className="reader-campaign-layout">
          <form className="reader-campaign-form-card" onSubmit={handleSubmit}>
            <header className="reader-campaign-card-heading">
              <h2>Campaign details</h2>
              <p>Required fields match the live campaign creation flow.</p>
            </header>

            <div className="reader-campaign-fields">
              <Field label="Campaign Name">
                <input
                  value={form.campaign_name}
                  onChange={(e) => updateField('campaign_name', e.target.value)}
                  placeholder="Spring Home Banner Push"
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Campaign Type">
                <select
                  value={form.campaign_type}
                  onChange={(e) => updateField('campaign_type', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="banner">banner</option>
                  <option value="image">image</option>
                  <option value="native">native</option>
                  <option value="text">text</option>
                  <option value="html">html</option>
                </select>
              </Field>

              <Field label="Buying Model">
                <select
                  value={form.buying_model}
                  onChange={(e) => updateField('buying_model', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="cpc">cpc</option>
                  <option value="cpm">cpm</option>
                  <option value="fixed">fixed</option>
                </select>
              </Field>

              <Field label="Objective">
                <select
                  value={form.objective}
                  onChange={(e) => updateField('objective', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="traffic">traffic</option>
                  <option value="awareness">awareness</option>
                  <option value="conversion">conversion</option>
                  <option value="engagement">engagement</option>
                </select>
              </Field>

              <Field label="Destination URL">
                <input
                  value={form.destination_url}
                  onChange={(e) => updateField('destination_url', e.target.value)}
                  placeholder="https://yourwebsite.com/product"
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Display URL">
                <input
                  value={form.display_url}
                  onChange={(e) => updateField('display_url', e.target.value)}
                  placeholder="yourwebsite.com"
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Headline">
                <input
                  value={form.headline}
                  onChange={(e) => updateField('headline', e.target.value)}
                  placeholder="Upgrade your living room today"
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Call To Action">
                <select
                  value={form.call_to_action}
                  onChange={(e) => updateField('call_to_action', e.target.value)}
                  disabled={isSubmitting}
                >
                  {CTA_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Total Budget">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget_total}
                  onChange={(e) => updateField('budget_total', e.target.value)}
                  placeholder="500"
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Daily Budget">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget_daily}
                  onChange={(e) => updateField('budget_daily', e.target.value)}
                  placeholder="25"
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Bid Amount">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.bid_amount}
                  onChange={(e) => updateField('bid_amount', e.target.value)}
                  placeholder="0.50"
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Start At">
                <input
                  type="datetime-local"
                  value={toDatetimeLocalInput(form.start_at)}
                  onChange={(e) => updateField('start_at', e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="End At">
                <input
                  type="datetime-local"
                  value={toDatetimeLocalInput(form.end_at)}
                  onChange={(e) => updateField('end_at', e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Creative Alt Text">
                <input
                  value={creativeAltText}
                  onChange={(e) => setCreativeAltText(e.target.value)}
                  placeholder="Promotional banner alt text"
                  disabled={isSubmitting}
                />
              </Field>
            </div>

            <Field label="Description Text" className="full">
              <textarea
                value={form.description_text}
                onChange={(e) => updateField('description_text', e.target.value)}
                placeholder="Write the supporting ad text people should see under the headline."
                rows={4}
                disabled={isSubmitting}
              />
            </Field>

            <section className="reader-campaign-upload-section">
              <h3>Creative upload</h3>

              <label className={`reader-campaign-upload${isSubmitting ? ' disabled' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCreativeFileChange}
                  disabled={isSubmitting}
                />
                <span className="reader-campaign-upload-mark" aria-hidden="true">+</span>
                <span className="reader-campaign-upload-copy">
                  <strong>{creativeFile?.name || 'Choose banner image'}</strong>
                  <small>
                    {creativeFile
                      ? 'Image selected. The creative uploads after the campaign is created.'
                      : 'Image is required. The creative uploads after the campaign is created.'}
                  </small>
                </span>
              </label>

              <Field label="Admin Note" className="full">
                <input
                  value={creativeNote}
                  onChange={(e) => setCreativeNote(e.target.value)}
                  placeholder="Optional note for admin"
                  disabled={isSubmitting}
                />
              </Field>
            </section>

            <div className="reader-campaign-workflow-note">
              Campaign is saved first. Then the creative uploads. Successful submission opens the
              campaign detail page.
            </div>

            <div className="reader-campaign-actions">
              <button
                type="submit"
                className="reader-campaign-primary"
                disabled={isSubmitting}
              >
                {submittingCampaign
                  ? 'Creating Campaign...'
                  : submittingCreative
                    ? 'Uploading Creative...'
                    : 'Create Campaign'}
              </button>

              <Link
                className={`reader-campaign-secondary${isSubmitting ? ' disabled' : ''}`}
                to="/customer/advertiser/campaigns"
                aria-disabled={isSubmitting}
                onClick={(event) => {
                  if (isSubmitting) event.preventDefault();
                }}
              >
                Cancel
              </Link>
            </div>
          </form>

          <aside className="reader-campaign-preview-card" aria-label="Live campaign preview">
            <header className="reader-campaign-preview-head">
              <h2>Live preview</h2>
              <span>DRAFT</span>
            </header>

            <div className="reader-campaign-ad-preview">
              <div className="reader-campaign-preview-media">
                {creativePreview ? (
                  <img
                    src={creativePreview}
                    alt={creativeAltText || form.headline || 'Creative preview'}
                  />
                ) : (
                  <span>Banner preview</span>
                )}
              </div>

              <div className="reader-campaign-preview-copy">
                <small>{displayUrl.toUpperCase()}</small>
                <h3>{previewTitle}</h3>
                <p>{previewDescription}</p>
                <button type="button" tabIndex={-1} aria-hidden="true">
                  {form.call_to_action || 'Learn More'}
                </button>
              </div>
            </div>

            <div className="reader-campaign-preview-summary">
              <PreviewRow label="Type" value={form.campaign_type} />
              <PreviewRow label="Model" value={form.buying_model} />
              <PreviewRow label="Objective" value={form.objective} />
              <PreviewRow
                label="Total Budget"
                value={form.budget_total ? formatMoney(form.budget_total) : '-'}
              />
              <PreviewRow
                label="Daily Budget"
                value={form.budget_daily ? formatMoney(form.budget_daily) : '-'}
              />
              <PreviewRow label="Bid" value={form.bid_amount || '-'} />
              <PreviewRow label="Campaign ID" value={campaign?.id || '-'} />
            </div>

            <p className="reader-campaign-preview-note">
              Preview updates from the same campaign fields shown in the form.
            </p>
          </aside>
        </div>
      </main>
    </ReaderUnifiedShell>
  );
}

const styles = `
  .reader-campaign-create-page,
  .reader-campaign-create-page * {
    box-sizing: border-box;
  }

  .reader-campaign-create-page {
    width: 100%;
    max-width: 1204px;
    margin: 0 auto;
    padding: 24px 32px 48px;
    color: #0f1421;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .reader-campaign-context {
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 12px 18px;
    border: 1px solid #e3e8f0;
    border-radius: 12px;
    background: #ffffff;
  }

  .reader-campaign-context-copy {
    min-width: 0;
  }

  .reader-campaign-context-copy h1 {
    margin: 0;
    font-size: 16px;
    line-height: 1.25;
    font-weight: 650;
    color: #0f1421;
  }

  .reader-campaign-context-copy p {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: #6e7a91;
  }

  .reader-campaign-context-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reader-campaign-wallet {
    min-width: 176px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border-radius: 8px;
    background: #f6f7fb;
    color: #333b4f;
    font-size: 12px;
    white-space: nowrap;
  }

  .reader-campaign-wallet span,
  .reader-campaign-wallet strong {
    font-weight: 650;
  }

  .reader-campaign-back,
  .reader-campaign-secondary {
    text-decoration: none;
  }

  .reader-campaign-back {
    min-width: 146px;
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border: 1px solid #d6dbe5;
    border-radius: 8px;
    background: #ffffff;
    color: #141a26;
    font-size: 12px;
    font-weight: 550;
  }

  .reader-campaign-alert {
    margin-top: 14px;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.45;
  }

  .reader-campaign-alert.error {
    border: 1px solid #fecdd3;
    background: #fff1f2;
    color: #be123c;
  }

  .reader-campaign-alert.success {
    border: 1px solid #bbf7d0;
    background: #ecfdf5;
    color: #166534;
  }

  .reader-campaign-layout {
    display: grid;
    grid-template-columns: minmax(0, 752px) minmax(300px, 368px);
    align-items: start;
    gap: 20px;
    margin-top: 20px;
  }

  .reader-campaign-form-card,
  .reader-campaign-preview-card {
    min-width: 0;
    border: 1px solid #e3e8f0;
    border-radius: 14px;
    background: #ffffff;
  }

  .reader-campaign-form-card {
    display: grid;
    gap: 20px;
    padding: 22px;
  }

  .reader-campaign-card-heading h2,
  .reader-campaign-preview-head h2 {
    margin: 0;
    color: #0f1421;
    font-weight: 650;
  }

  .reader-campaign-card-heading h2 {
    font-size: 18px;
    line-height: 1.25;
  }

  .reader-campaign-card-heading p {
    margin: 4px 0 0;
    color: #6e7a91;
    font-size: 12px;
    line-height: 1.4;
  }

  .reader-campaign-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .reader-campaign-field {
    min-width: 0;
    display: grid;
    gap: 7px;
  }

  .reader-campaign-field.full {
    grid-column: 1 / -1;
  }

  .reader-campaign-label {
    color: #20242c;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 500;
  }

  .reader-campaign-field input,
  .reader-campaign-field select,
  .reader-campaign-field textarea {
    width: 100%;
    border: 1px solid #d6dbe5;
    border-radius: 8px;
    background: #ffffff;
    color: #141a26;
    font: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .reader-campaign-field input,
  .reader-campaign-field select {
    min-height: 42px;
    padding: 0 14px;
  }

  .reader-campaign-field textarea {
    min-height: 82px;
    padding: 12px 14px;
    line-height: 1.45;
    resize: vertical;
  }

  .reader-campaign-field input:focus,
  .reader-campaign-field select:focus,
  .reader-campaign-field textarea:focus {
    border-color: #8fa6d3;
    box-shadow: 0 0 0 3px rgba(84, 118, 181, 0.12);
  }

  .reader-campaign-field input:disabled,
  .reader-campaign-field select:disabled,
  .reader-campaign-field textarea:disabled {
    cursor: not-allowed;
    background: #f8fafc;
    color: #7a8597;
  }

  .reader-campaign-field input::placeholder,
  .reader-campaign-field textarea::placeholder {
    color: #a7adb8;
  }

  .reader-campaign-upload-section {
    display: grid;
    gap: 12px;
  }

  .reader-campaign-upload-section h3 {
    margin: 0;
    color: #0f1421;
    font-size: 16px;
    line-height: 1.25;
    font-weight: 650;
  }

  .reader-campaign-upload {
    min-height: 94px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border: 1px dashed #c7cfde;
    border-radius: 10px;
    background: #f9fafb;
    cursor: pointer;
  }

  .reader-campaign-upload.disabled {
    cursor: not-allowed;
    opacity: 0.68;
  }

  .reader-campaign-upload input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .reader-campaign-upload-mark {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid #d6dbe5;
    border-radius: 8px;
    background: #ffffff;
    color: #2e384d;
    font-size: 20px;
    font-weight: 500;
  }

  .reader-campaign-upload-copy {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .reader-campaign-upload-copy strong {
    overflow: hidden;
    color: #141a26;
    font-size: 13px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-campaign-upload-copy small {
    color: #738099;
    font-size: 11px;
    line-height: 1.35;
  }

  .reader-campaign-workflow-note {
    min-height: 42px;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #d1def5;
    border-radius: 8px;
    background: #f6f9fe;
    color: #384d73;
    font-size: 11px;
    line-height: 1.4;
  }

  .reader-campaign-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .reader-campaign-primary,
  .reader-campaign-secondary {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 650;
  }

  .reader-campaign-primary {
    min-width: 160px;
    padding: 0 18px;
    border: 1px solid #121726;
    background: #121726;
    color: #ffffff;
    cursor: pointer;
  }

  .reader-campaign-primary:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .reader-campaign-secondary {
    min-width: 96px;
    padding: 0 16px;
    border: 1px solid #d6dbe5;
    background: #ffffff;
    color: #141a26;
    font-weight: 550;
  }

  .reader-campaign-secondary.disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  .reader-campaign-preview-card {
    position: sticky;
    top: 92px;
    display: grid;
    gap: 16px;
    padding: 20px;
  }

  .reader-campaign-preview-head {
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .reader-campaign-preview-head h2 {
    font-size: 15px;
  }

  .reader-campaign-preview-head span {
    min-width: 52px;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: #f5f6f9;
    color: #66738c;
    font-size: 9px;
    font-weight: 750;
    letter-spacing: 0.04em;
  }

  .reader-campaign-ad-preview {
    overflow: hidden;
    border: 1px solid #e0e5ed;
    border-radius: 12px;
    background: #ffffff;
  }

  .reader-campaign-preview-media {
    height: 220px;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: #f2f5f9;
    color: #8c96a8;
    font-size: 13px;
    font-weight: 500;
  }

  .reader-campaign-preview-media img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .reader-campaign-preview-copy {
    min-height: 190px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px;
  }

  .reader-campaign-preview-copy small {
    max-width: 100%;
    overflow: hidden;
    color: #738099;
    font-size: 9px;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-campaign-preview-copy h3 {
    width: 100%;
    margin: 0;
    color: #0f1421;
    font-size: 19px;
    line-height: 1.2;
    font-weight: 750;
    overflow-wrap: anywhere;
  }

  .reader-campaign-preview-copy p {
    min-height: 44px;
    margin: 0;
    color: #66738a;
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  .reader-campaign-preview-copy button {
    min-width: 98px;
    min-height: 34px;
    padding: 0 12px;
    border: 0;
    border-radius: 7px;
    background: #1a5cd4;
    color: #ffffff;
    font-size: 11px;
    font-weight: 650;
    pointer-events: none;
  }

  .reader-campaign-preview-summary {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid #e3e8f0;
    border-radius: 10px;
    background: #f9fafb;
  }

  .reader-campaign-preview-row {
    min-height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border-bottom: 1px solid #f0f2f5;
    font-size: 11px;
  }

  .reader-campaign-preview-row:last-child {
    border-bottom: 0;
  }

  .reader-campaign-preview-row span {
    color: #738099;
  }

  .reader-campaign-preview-row strong {
    max-width: 58%;
    overflow: hidden;
    color: #141a26;
    font-weight: 650;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reader-campaign-preview-note {
    margin: 0;
    color: #7a87a1;
    font-size: 10px;
    line-height: 1.4;
  }

  @media (max-width: 1100px) {
    .reader-campaign-create-page {
      padding-right: 24px;
      padding-left: 24px;
    }

    .reader-campaign-layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .reader-campaign-preview-card {
      position: static;
    }
  }

  @media (max-width: 767px) {
    .reader-campaign-create-page {
      width: calc(100% - 16px);
      margin: 0 8px;
      padding: 16px 0 32px;
    }

    .reader-campaign-context {
      min-height: 112px;
      align-items: stretch;
      flex-direction: column;
      gap: 10px;
      padding: 14px;
    }

    .reader-campaign-context-copy h1 {
      font-size: 22px;
      line-height: 1.18;
      font-weight: 750;
    }

    .reader-campaign-context-copy p {
      display: none;
    }

    .reader-campaign-context-actions {
      width: 100%;
      justify-content: space-between;
    }

    .reader-campaign-wallet {
      min-width: 0;
      min-height: 32px;
      padding: 0 12px;
      font-size: 11px;
    }

    .reader-campaign-back {
      min-width: 0;
      min-height: 32px;
      padding: 0;
      border: 0;
      background: transparent;
      color: #334f8c;
      font-size: 11px;
    }

    .reader-campaign-alert {
      margin-top: 10px;
      border-radius: 9px;
      padding: 11px 12px;
      font-size: 12px;
    }

    .reader-campaign-layout {
      gap: 16px;
      margin-top: 16px;
    }

    .reader-campaign-form-card,
    .reader-campaign-preview-card {
      border-radius: 12px;
    }

    .reader-campaign-form-card {
      gap: 14px;
      padding: 16px;
    }

    .reader-campaign-card-heading h2 {
      font-size: 16px;
    }

    .reader-campaign-card-heading p {
      font-size: 11px;
    }

    .reader-campaign-fields {
      grid-template-columns: minmax(0, 1fr);
      gap: 12px;
    }

    .reader-campaign-label {
      font-size: 13px;
    }

    .reader-campaign-field input,
    .reader-campaign-field select {
      min-height: 42px;
      padding: 0 12px;
      font-size: 13px;
    }

    .reader-campaign-field textarea {
      min-height: 82px;
      padding: 11px 12px;
      font-size: 13px;
    }

    .reader-campaign-upload-section h3 {
      font-size: 15px;
    }

    .reader-campaign-upload {
      min-height: 106px;
      align-items: flex-start;
      flex-direction: column;
      gap: 5px;
      padding: 14px;
    }

    .reader-campaign-upload-mark {
      display: none;
    }

    .reader-campaign-upload-copy {
      width: 100%;
      gap: 5px;
    }

    .reader-campaign-upload-copy strong {
      font-size: 13px;
    }

    .reader-campaign-upload-copy small {
      font-size: 10px;
      white-space: normal;
    }

    .reader-campaign-workflow-note {
      min-height: 58px;
      font-size: 10px;
    }

    .reader-campaign-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .reader-campaign-primary,
    .reader-campaign-secondary {
      width: 100%;
    }

    .reader-campaign-preview-card {
      gap: 14px;
      padding: 16px;
    }

    .reader-campaign-preview-media {
      height: 180px;
      font-size: 12px;
    }

    .reader-campaign-preview-copy {
      min-height: 170px;
      gap: 7px;
      padding: 14px;
    }

    .reader-campaign-preview-copy small {
      font-size: 8px;
    }

    .reader-campaign-preview-copy h3 {
      font-size: 17px;
    }

    .reader-campaign-preview-copy p {
      min-height: 36px;
      font-size: 11px;
    }

    .reader-campaign-preview-copy button {
      min-width: 94px;
      min-height: 32px;
      font-size: 10px;
    }

    .reader-campaign-preview-summary {
      gap: 2px;
      padding: 9px 11px;
    }

    .reader-campaign-preview-row {
      min-height: 19px;
      font-size: 10px;
    }

    .reader-campaign-preview-note {
      display: none;
    }
  }
`;
