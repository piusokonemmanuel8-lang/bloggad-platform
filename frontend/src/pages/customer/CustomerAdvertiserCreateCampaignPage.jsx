import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px 16px',
      }}
    >
      <style>{`
        .customer-campaign-create-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) 360px;
          gap: 24px;
        }

        .customer-campaign-create-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .customer-campaign-preview-card {
          position: sticky;
          top: 20px;
        }

        @media (max-width: 1100px) {
          .customer-campaign-create-layout {
            grid-template-columns: 1fr;
          }

          .customer-campaign-preview-card {
            position: static;
          }
        }

        @media (max-width: 760px) {
          .customer-campaign-create-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1380, margin: '0 auto', display: 'grid', gap: 24 }}>
        <section
          style={{
            borderRadius: 28,
            border: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: 24,
            boxShadow: '0 22px 50px rgba(15, 23, 42, 0.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: 999,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Advertiser Studio
              </div>

              <h1
                style={{
                  margin: '14px 0 0',
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  lineHeight: 1.05,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  color: '#111827',
                }}
              >
                Create Campaign
              </h1>

              <p
                style={{
                  margin: '10px 0 0',
                  maxWidth: 760,
                  color: '#6b7280',
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                Create the campaign, upload the banner creative, preview it, and submit for admin approval.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                to="/customer/advertiser/campaigns"
                style={{
                  minHeight: 46,
                  padding: '0 18px',
                  borderRadius: 14,
                  background: '#ffffff',
                  border: '1px solid #dbe1ea',
                  color: '#111827',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                Back to Campaigns
              </Link>

              <div
                style={{
                  minHeight: 46,
                  padding: '0 18px',
                  borderRadius: 14,
                  background: '#eef2ff',
                  color: '#3730a3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                {loadingWallet
                  ? 'Wallet: Loading...'
                  : `Wallet: ${formatMoney(wallet?.available_balance || 0, wallet?.currency || 'USD')}`}
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div
            style={{
              borderRadius: 20,
              border: '1px solid #fecdd3',
              background: '#fff1f2',
              padding: '16px 18px',
              fontSize: 14,
              color: '#be123c',
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              borderRadius: 20,
              border: '1px solid #bbf7d0',
              background: '#ecfdf5',
              padding: '16px 18px',
              fontSize: 14,
              color: '#166534',
            }}
          >
            {success}
          </div>
        ) : null}

        <div className="customer-campaign-create-layout">
          <form
            onSubmit={handleSubmit}
            style={{
              borderRadius: 28,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: 22,
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
              display: 'grid',
              gap: 22,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 14,
                }}
              >
                Campaign Setup
              </div>

              <div className="customer-campaign-create-grid">
                <Field label="Campaign Name">
                  <input
                    value={form.campaign_name}
                    onChange={(e) => updateField('campaign_name', e.target.value)}
                    placeholder="Spring Home Banner Push"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Campaign Type">
                  <select
                    value={form.campaign_type}
                    onChange={(e) => updateField('campaign_type', e.target.value)}
                    style={inputStyle}
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
                    style={inputStyle}
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
                    style={inputStyle}
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
                    style={inputStyle}
                  />
                </Field>

                <Field label="Display URL">
                  <input
                    value={form.display_url}
                    onChange={(e) => updateField('display_url', e.target.value)}
                    placeholder="yourwebsite.com"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Headline">
                  <input
                    value={form.headline}
                    onChange={(e) => updateField('headline', e.target.value)}
                    placeholder="Upgrade your living room today"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Call To Action">
                  <select
                    value={form.call_to_action}
                    onChange={(e) => updateField('call_to_action', e.target.value)}
                    style={inputStyle}
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
                    style={inputStyle}
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
                    style={inputStyle}
                  />
                </Field>

                <Field label="Bid Amount">
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={form.bid_amount}
                    onChange={(e) => updateField('bid_amount', e.target.value)}
                    placeholder="0.50"
                    style={inputStyle}
                  />
                </Field>

                <Field label="Start At">
                  <input
                    type="datetime-local"
                    value={toDatetimeLocalInput(form.start_at)}
                    onChange={(e) => updateField('start_at', e.target.value)}
                    style={inputStyle}
                  />
                </Field>

                <Field label="End At">
                  <input
                    type="datetime-local"
                    value={toDatetimeLocalInput(form.end_at)}
                    onChange={(e) => updateField('end_at', e.target.value)}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Creative Alt Text">
                  <input
                    value={creativeAltText}
                    onChange={(e) => setCreativeAltText(e.target.value)}
                    placeholder="Promotional banner alt text"
                    style={inputStyle}
                  />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <Field label="Description Text">
                  <textarea
                    value={form.description_text}
                    onChange={(e) => updateField('description_text', e.target.value)}
                    placeholder="Write the supporting ad text people should see under the headline."
                    style={{
                      ...inputStyle,
                      minHeight: 120,
                      resize: 'vertical',
                      paddingTop: 14,
                    }}
                  />
                </Field>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 14,
                }}
              >
                Creative Upload
              </div>

              <div
                style={{
                  borderRadius: 22,
                  border: '1px dashed #cbd5e1',
                  background: '#f8fafc',
                  padding: 18,
                  display: 'grid',
                  gap: 14,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCreativeFileChange}
                  style={{
                    width: '100%',
                    minHeight: 52,
                    padding: 12,
                    borderRadius: 16,
                    border: '1px solid #dbe1ea',
                    background: '#fff',
                  }}
                />

                <input
                  value={creativeNote}
                  onChange={(e) => setCreativeNote(e.target.value)}
                  placeholder="Optional note for admin"
                  style={inputStyle}
                />

                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: '#64748b',
                  }}
                >
                  Upload the actual banner/image people should see on the ad.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  minHeight: 54,
                  padding: '0 24px',
                  borderRadius: 16,
                  border: 'none',
                  background: '#111827',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {submittingCampaign
                  ? 'Creating Campaign...'
                  : submittingCreative
                  ? 'Uploading Creative...'
                  : 'Create Campaign'}
              </button>

              <Link
                to="/customer/advertiser/campaigns"
                style={{
                  minHeight: 54,
                  padding: '0 24px',
                  borderRadius: 16,
                  border: '1px solid #dbe1ea',
                  background: '#fff',
                  color: '#111827',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                }}
              >
                Cancel
              </Link>
            </div>
          </form>

          <div
            className="customer-campaign-preview-card"
            style={{
              borderRadius: 28,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: 22,
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
              display: 'grid',
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: '#6b7280',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Live Preview
            </div>

            <div
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                background: '#f8fafc',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1.2 / 1',
                  background: '#eef2f7',
                  overflow: 'hidden',
                }}
              >
                {creativePreview ? (
                  <img
                    src={creativePreview}
                    alt={creativeAltText || form.headline || 'Creative preview'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#94a3b8',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    Banner preview will show here
                  </div>
                )}
              </div>

              <div style={{ padding: 18 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}
                >
                  {form.display_url || 'display-url.com'}
                </div>

                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.2,
                    fontWeight: 900,
                    color: '#111827',
                  }}
                >
                  {form.headline || 'Your ad headline preview'}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: '#6b7280',
                    minHeight: 72,
                  }}
                >
                  {form.description_text || 'Your ad description will show here.'}
                </div>

                <button
                  type="button"
                  style={{
                    marginTop: 14,
                    minHeight: 46,
                    padding: '0 18px',
                    borderRadius: 14,
                    border: 'none',
                    background: '#2563eb',
                    color: '#fff',
                    fontWeight: 800,
                  }}
                >
                  {form.call_to_action || 'Learn More'}
                </button>
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                border: '1px solid #e5e7eb',
                background: '#f8fafc',
                padding: 16,
                display: 'grid',
                gap: 10,
              }}
            >
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
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span
        style={{
          fontSize: 13,
          color: '#6b7280',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', textAlign: 'right' }}>
        {value || '-'}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  minHeight: 56,
  borderRadius: 16,
  border: '1px solid #dbe1ea',
  background: '#fff',
  padding: '0 16px',
  fontSize: 15,
  outline: 'none',
  color: '#111827',
};