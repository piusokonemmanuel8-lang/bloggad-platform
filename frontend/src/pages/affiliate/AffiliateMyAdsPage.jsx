import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  };
}

function labelStyle() {
  return {
    display: 'block',
    fontSize: 13,
    fontWeight: 800,
    color: '#374151',
    marginBottom: 8,
  };
}

function inputStyle() {
  return {
    width: '100%',
    minHeight: 46,
    borderRadius: 14,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    padding: '0 14px',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
  };
}

function textareaStyle() {
  return {
    width: '100%',
    minHeight: 150,
    borderRadius: 14,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    padding: 14,
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  };
}

function badgeStyle(type = 'default') {
  const styles = {
    success: {
      background: '#ecfdf3',
      color: '#027a48',
      border: '#abefc6',
    },
    warning: {
      background: '#fffaeb',
      color: '#b54708',
      border: '#fedf89',
    },
    info: {
      background: '#eff8ff',
      color: '#175cd3',
      border: '#b2ddff',
    },
    danger: {
      background: '#fef3f2',
      color: '#b42318',
      border: '#fecdca',
    },
    default: {
      background: '#f9fafb',
      color: '#344054',
      border: '#eaecf0',
    },
  };

  const current = styles[type] || styles.default;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: `1px solid ${current.border}`,
    background: current.background,
    color: current.color,
    whiteSpace: 'nowrap',
  };
}

function toggleRow(label, value, onChange, helper = '') {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 18,
        padding: '16px 0',
        borderBottom: '1px solid #eef2f7',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{label}</div>
        {helper ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 1.5,
              color: '#6b7280',
            }}
          >
            {helper}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onChange(value ? 0 : 1)}
        style={{
          width: 58,
          height: 32,
          borderRadius: 999,
          border: 0,
          background: value ? '#2563eb' : '#d1d5db',
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.2s ease',
          marginTop: 2,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 4,
            left: value ? 30 : 4,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}

function WriterPlacementToggle({ label, helper, value, onChange }) {
  const enabled = Number(value) === 1;

  return (
    <div className="writer-myads-placement-row">
      <div className="writer-myads-placement-copy">
        <strong>{label}</strong>
        <span>{helper}</span>
      </div>

      <button
        type="button"
        className={`writer-myads-switch ${enabled ? 'is-on' : ''}`}
        aria-pressed={enabled}
        onClick={() => onChange(enabled ? 0 : 1)}
      >
        <span />
      </button>
    </div>
  );
}

const initialForm = {
  monetization_mode: 'individual',

  provider_name: 'Google AdSense',
  provider_type: 'adsense',
  publisher_id: '',
  head_code: '',
  notes: '',

  storefront_top_enabled: 1,
  storefront_sidebar_enabled: 0,
  storefront_bottom_enabled: 1,
  post_top_enabled: 1,
  post_middle_enabled: 1,
  post_bottom_enabled: 1,
  post_sidebar_enabled: 0,

  review_status: 'draft',
  submitted_at: null,
  reviewed_at: null,
  admin_review_note: '',
};

function normalizeSettings(settings = {}) {
  return {
    ...initialForm,
    ...settings,
    monetization_mode: settings?.monetization_mode === 'platform' ? 'platform' : 'individual',
    provider_name: settings?.provider_name || 'Google AdSense',
    provider_type: settings?.provider_type || 'adsense',
    publisher_id: settings?.publisher_id || '',
    head_code: settings?.head_code || '',
    notes: settings?.notes || '',
    storefront_top_enabled: Number(settings?.storefront_top_enabled ?? 1),
    storefront_sidebar_enabled: Number(settings?.storefront_sidebar_enabled ?? 0),
    storefront_bottom_enabled: Number(settings?.storefront_bottom_enabled ?? 1),
    post_top_enabled: Number(settings?.post_top_enabled ?? 1),
    post_middle_enabled: Number(settings?.post_middle_enabled ?? 1),
    post_bottom_enabled: Number(settings?.post_bottom_enabled ?? 1),
    post_sidebar_enabled: Number(settings?.post_sidebar_enabled ?? 0),
    review_status: settings?.review_status || 'draft',
    submitted_at: settings?.submitted_at || null,
    reviewed_at: settings?.reviewed_at || null,
    admin_review_note: settings?.admin_review_note || '',
  };
}

function buildPayload(form) {
  const base = {
    monetization_mode: form.monetization_mode,
    storefront_top_enabled: Number(form.storefront_top_enabled),
    storefront_sidebar_enabled: Number(form.storefront_sidebar_enabled),
    storefront_bottom_enabled: Number(form.storefront_bottom_enabled),
    post_top_enabled: Number(form.post_top_enabled),
    post_middle_enabled: Number(form.post_middle_enabled),
    post_bottom_enabled: Number(form.post_bottom_enabled),
    post_sidebar_enabled: Number(form.post_sidebar_enabled),
  };

  if (form.monetization_mode === 'individual') {
    return {
      ...base,
      provider_name: form.provider_name,
      provider_type: form.provider_type,
      publisher_id: form.publisher_id,
      head_code: form.head_code,
      notes: form.notes,
    };
  }

  return base;
}

function getStatusMeta(status) {
  if (status === 'approved') {
    return {
      label: 'Approved',
      tone: 'success',
      helper: 'Your monetization setup has been approved.',
    };
  }

  if (status === 'pending') {
    return {
      label: 'Pending Review',
      tone: 'info',
      helper: 'Your monetization setup has been submitted and is waiting for admin review.',
    };
  }

  if (status === 'rejected') {
    return {
      label: 'Rejected',
      tone: 'danger',
      helper: 'Your submission was reviewed and needs correction before resubmission.',
    };
  }

  return {
    label: 'Draft',
    tone: 'warning',
    helper: 'Save your setup, then submit it for review when you are ready.',
  };
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

export default function AffiliateMyAdsPage() {
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [saveMessage, setSaveMessage] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isIndividualMode = form.monetization_mode === 'individual';
  const statusMeta = useMemo(() => getStatusMeta(form.review_status), [form.review_status]);
  const isWriterRoute = location.pathname === '/writer/monetization/my-ads';

  useEffect(() => {
    let ignore = false;

    async function loadSettings() {
      setLoading(true);
      setLoadError('');

      try {
        const { data } = await api.get('/api/affiliate/dashboard/monetization/settings');

        if (!data?.ok) {
          throw new Error(data?.message || 'Failed to load your monetization settings.');
        }

        if (!ignore) {
          setForm(normalizeSettings(data.settings || {}));
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(
            error?.response?.data?.message ||
              error.message ||
              'Failed to load your monetization settings.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      ignore = true;
    };
  }, []);

  function updateField(field, value) {
    setSaveMessage('');
    setSubmitMessage('');
    setSaveError('');
    setSubmitError('');
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaveMessage('');
    setSubmitMessage('');
    setSaveError('');
    setSubmitError('');

    try {
      const { data } = await api.put(
        '/api/affiliate/dashboard/monetization/settings',
        buildPayload(form)
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to save your monetization settings.');
      }

      setForm(normalizeSettings(data.settings || {}));
      setSaveMessage(
        isIndividualMode
          ? 'Your ad settings have been saved.'
          : 'Your platform ad preferences have been saved.'
      );
    } catch (error) {
      setSaveError(
        error?.response?.data?.message ||
          error.message ||
          'Failed to save your monetization settings.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitForReview() {
    setSubmitting(true);
    setSaveMessage('');
    setSubmitMessage('');
    setSaveError('');
    setSubmitError('');

    try {
      const saveResponse = await api.put(
        '/api/affiliate/dashboard/monetization/settings',
        buildPayload(form)
      );

      if (!saveResponse?.data?.ok) {
        throw new Error(saveResponse?.data?.message || 'Failed to save your monetization settings.');
      }

      const { data } = await api.post('/api/affiliate/dashboard/monetization/submit-review');

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to submit your monetization setup for review.');
      }

      setForm(normalizeSettings(data.settings || {}));
      setSubmitMessage(data.message || 'Your monetization setup has been submitted for review.');
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error.message ||
          'Failed to submit your monetization setup for review.'
      );
    } finally {
      setSubmitting(false);
    }
  }


  if (isWriterRoute) {
    const individualSteps = [
      'Choose individual monetization if you already have your own ad account.',
      'Enter your provider details and paste your approved code.',
      'Choose where those ads should display.',
      'Save your setup, then submit it for admin review.',
      'After approval, your review status updates here.',
    ];

    const platformSteps = [
      'Choose platform monetization if you want BlogPulse ads on your pages.',
      'No provider name, publisher ID, or ad code is required.',
      'Choose where platform ads should display.',
      'Save your platform placement preferences.',
      'Your metrics and earnings appear in your monetization pages.',
    ];

    const steps = isIndividualMode ? individualSteps : platformSteps;

    return (
      <form className="writer-myads-page" onSubmit={handleSave}>
        <style>{writerMyAdsStyles}</style>

        <div className="writer-myads-mobile-title">My Ads</div>

        <section className="writer-myads-command">
          <div className="writer-myads-mode-area">
            <span className="writer-myads-eyebrow">Monetization mode</span>

            <div className="writer-myads-mode-row">
              <div className="writer-myads-mode-buttons">
                <button
                  type="button"
                  className={`writer-myads-mode-button ${isIndividualMode ? 'active' : ''}`}
                  onClick={() => updateField('monetization_mode', 'individual')}
                >
                  Individual
                </button>

                <button
                  type="button"
                  className={`writer-myads-mode-button ${!isIndividualMode ? 'active' : ''}`}
                  onClick={() => updateField('monetization_mode', 'platform')}
                >
                  Platform
                </button>
              </div>

              <span className="writer-myads-mode-helper">
                {isIndividualMode
                  ? 'Use your own approved ad account'
                  : 'Use BlogPulse platform monetization'}
              </span>
            </div>
          </div>

          <div className="writer-myads-command-actions">
            <span className={`writer-myads-status-pill ${statusMeta.tone}`}>
              {statusMeta.label}
            </span>

            <button type="submit" className="writer-myads-primary-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save My Ads'}
            </button>

            {isIndividualMode ? (
              <button
                type="button"
                className="writer-myads-secondary-button"
                onClick={handleSubmitForReview}
                disabled={submitting || form.review_status === 'pending'}
              >
                {submitting
                  ? 'Submitting...'
                  : form.review_status === 'pending'
                    ? 'Submitted For Review'
                    : 'Submit For Review'}
              </button>
            ) : null}
          </div>
        </section>

        {loadError ? <div className="writer-myads-message error">{loadError}</div> : null}
        {saveMessage ? <div className="writer-myads-message success">{saveMessage}</div> : null}
        {submitMessage ? <div className="writer-myads-message success">{submitMessage}</div> : null}
        {saveError ? <div className="writer-myads-message error">{saveError}</div> : null}
        {submitError ? <div className="writer-myads-message error">{submitError}</div> : null}

        <div className="writer-myads-layout">
          <div className="writer-myads-main-column">
            <section className="writer-myads-card writer-myads-setup-card">
              <div className="writer-myads-section-heading">
                <strong>Monetization Setup</strong>
                <span>
                  {isIndividualMode
                    ? 'Your own provider pays you directly in Individual mode.'
                    : 'BlogPulse handles ad serving in Platform mode.'}
                </span>
              </div>

              {loading ? (
                <div className="writer-myads-loading">Loading your saved settings...</div>
              ) : null}

              <div className="writer-myads-inline-review">
                <span className={`writer-myads-status-pill ${statusMeta.tone}`}>
                  {statusMeta.label}
                </span>
                <strong>{statusMeta.helper}</strong>
              </div>

              <div className="writer-myads-fields-grid">
                <label className="writer-myads-field">
                  <span>MONETIZATION MODE</span>
                  <select
                    value={form.monetization_mode}
                    onChange={(event) => updateField('monetization_mode', event.target.value)}
                  >
                    <option value="individual">Individual monetization</option>
                    <option value="platform">Platform monetization</option>
                  </select>
                </label>

                {isIndividualMode ? (
                  <>
                    <label className="writer-myads-field">
                      <span>PROVIDER NAME</span>
                      <input
                        value={form.provider_name}
                        onChange={(event) => updateField('provider_name', event.target.value)}
                        placeholder="Google AdSense"
                      />
                    </label>

                    <label className="writer-myads-field">
                      <span>PROVIDER TYPE</span>
                      <select
                        value={form.provider_type}
                        onChange={(event) => updateField('provider_type', event.target.value)}
                      >
                        <option value="adsense">AdSense</option>
                        <option value="generic">Generic network</option>
                        <option value="manual">Manual / direct ad</option>
                      </select>
                    </label>

                    <label className="writer-myads-field">
                      <span>PUBLISHER ID</span>
                      <input
                        value={form.publisher_id}
                        onChange={(event) => updateField('publisher_id', event.target.value)}
                        placeholder="pub-xxxxxxxxxxxxxxxx"
                      />
                    </label>
                  </>
                ) : null}
              </div>

              {isIndividualMode ? (
                <>
                  <label className="writer-myads-field writer-myads-field-full">
                    <span>HEAD CODE</span>
                    <textarea
                      className="writer-myads-code"
                      value={form.head_code}
                      onChange={(event) => updateField('head_code', event.target.value)}
                      placeholder="<script async src='...'></script>"
                    />
                  </label>

                  <label className="writer-myads-field writer-myads-field-full">
                    <span>NOTES</span>
                    <textarea
                      className="writer-myads-notes"
                      value={form.notes}
                      onChange={(event) => updateField('notes', event.target.value)}
                      placeholder="Optional note about your ad setup..."
                    />
                  </label>
                </>
              ) : (
                <div className="writer-myads-platform-note">
                  BlogPulse platform monetization does not require provider name, publisher ID, or ad
                  code. Once approved, the platform handles ad serving. Choose only where platform
                  ads should appear.
                </div>
              )}
            </section>

            <section className="writer-myads-card writer-myads-positions-card">
              <div className="writer-myads-section-heading">
                <strong>Ad Positions</strong>
                <span>Choose where ads should appear.</span>
              </div>

              <div className="writer-myads-position-groups">
                <div>
                  <span className="writer-myads-group-label">STOREFRONT</span>

                  <WriterPlacementToggle
                    label="Storefront top ad"
                    helper="Near the top of your storefront."
                    value={form.storefront_top_enabled}
                    onChange={(value) => updateField('storefront_top_enabled', value)}
                  />

                  <WriterPlacementToggle
                    label="Storefront sidebar ad"
                    helper="Where your template supports a sidebar."
                    value={form.storefront_sidebar_enabled}
                    onChange={(value) => updateField('storefront_sidebar_enabled', value)}
                  />

                  <WriterPlacementToggle
                    label="Storefront bottom ad"
                    helper="Lower on your storefront page."
                    value={form.storefront_bottom_enabled}
                    onChange={(value) => updateField('storefront_bottom_enabled', value)}
                  />
                </div>

                <div>
                  <span className="writer-myads-group-label">POST PAGES</span>

                  <WriterPlacementToggle
                    label="Post top ad"
                    helper="Near the top of a detailed post."
                    value={form.post_top_enabled}
                    onChange={(value) => updateField('post_top_enabled', value)}
                  />

                  <WriterPlacementToggle
                    label="Post middle ad"
                    helper="Inside article body where supported."
                    value={form.post_middle_enabled}
                    onChange={(value) => updateField('post_middle_enabled', value)}
                  />

                  <WriterPlacementToggle
                    label="Post bottom ad"
                    helper="Near the end of a blog post."
                    value={form.post_bottom_enabled}
                    onChange={(value) => updateField('post_bottom_enabled', value)}
                  />

                  <WriterPlacementToggle
                    label="Post sidebar ad"
                    helper="Where the selected template supports it."
                    value={form.post_sidebar_enabled}
                    onChange={(value) => updateField('post_sidebar_enabled', value)}
                  />
                </div>
              </div>

              <div className="writer-myads-desktop-actions">
                <button type="submit" className="writer-myads-primary-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save My Ads'}
                </button>

                {isIndividualMode ? (
                  <button
                    type="button"
                    className="writer-myads-secondary-button"
                    onClick={handleSubmitForReview}
                    disabled={submitting || form.review_status === 'pending'}
                  >
                    {submitting
                      ? 'Submitting...'
                      : form.review_status === 'pending'
                        ? 'Submitted For Review'
                        : 'Submit For Review'}
                  </button>
                ) : null}
              </div>
            </section>

            <section className="writer-myads-card writer-myads-mobile-actions">
              <button type="submit" className="writer-myads-primary-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save My Ads'}
              </button>

              {isIndividualMode ? (
                <button
                  type="button"
                  className="writer-myads-secondary-button"
                  onClick={handleSubmitForReview}
                  disabled={submitting || form.review_status === 'pending'}
                >
                  {submitting
                    ? 'Submitting...'
                    : form.review_status === 'pending'
                      ? 'Submitted For Review'
                      : 'Submit For Review'}
                </button>
              ) : null}
            </section>
          </div>

          <aside className="writer-myads-side-column">
            <section className="writer-myads-card writer-myads-review-card">
              <h3>Review Status</h3>
              <span className={`writer-myads-status-pill ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
              <p>{statusMeta.helper}</p>

              <div className="writer-myads-review-times">
                <span>
                  Submitted: {form.submitted_at ? formatDateTime(form.submitted_at) : '--'}
                </span>
                <span>
                  Reviewed: {form.reviewed_at ? formatDateTime(form.reviewed_at) : '--'}
                </span>
              </div>

              {form.admin_review_note ? (
                <div className="writer-myads-admin-note">
                  <strong>Admin note:</strong> {form.admin_review_note}
                </div>
              ) : null}
            </section>

            <section className="writer-myads-card writer-myads-how-card">
              <h3>How this works</h3>

              <div className="writer-myads-steps">
                {steps.map((text, index) => (
                  <div className="writer-myads-step" key={text}>
                    <span>{index + 1}</span>
                    <p>
                      <b>{index + 1}</b>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="writer-myads-card writer-myads-important-card">
              <h3>Important Note</h3>
              <div>
                {isIndividualMode
                  ? 'Your provider pays you directly in Individual mode. BlogPulse wallet earnings do not apply to this mode.'
                  : 'BlogPulse platform monetization uses platform-managed ads and platform earnings rules.'}
              </div>
            </section>

            <section className="writer-myads-card writer-myads-type-card">
              <span>Monetization Type</span>
              <strong>{isIndividualMode ? 'Individual Ads' : 'Platform Monetization'}</strong>
              <p>
                {isIndividualMode
                  ? 'Provider details and approval are required before your own code can go live.'
                  : 'The platform manages ad serving after approval.'}
              </p>
            </section>
          </aside>
        </div>
      </form>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          ...cardStyle(),
          background:
            'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 32,
                padding: '0 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}
            >
              My Ads
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.15,
                fontWeight: 900,
              }}
            >
              Manage your monetization setup and choose where ads should appear
            </h1>

            <p
              style={{
                margin: '12px 0 0',
                maxWidth: 760,
                color: 'rgba(255,255,255,0.82)',
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              Choose whether you want to use your own ad provider or BlogPulse platform monetization.
              The fields shown below will change based on the monetization option you select.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 14,
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Current Status
              </div>
              <div
                style={{
                  ...badgeStyle(statusMeta.tone),
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                {statusMeta.label}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Monetization Type
              </div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {isIndividualMode ? 'Individual Ads' : 'Platform Monetization'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loadError ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {loadError}
          </div>
        </section>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 24 }}>
          <div style={cardStyle()}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
                Monetization Setup
              </h2>
              <p
                style={{
                  margin: '8px 0 0',
                  color: '#6b7280',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {isIndividualMode
                  ? 'Set up your own ad account details here. Your own provider pays you directly.'
                  : 'Platform monetization uses BlogPulse ads. You only need to decide where platform ads should appear on your pages.'}
              </p>
            </div>

            {loading ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: '#f9fafb',
                  border: '1px solid #eef2f7',
                  color: '#6b7280',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Loading your saved settings...
              </div>
            ) : null}

            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 16,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={badgeStyle(statusMeta.tone)}>{statusMeta.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
                  {statusMeta.helper}
                </div>
              </div>

              {form.submitted_at ? (
                <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>
                  Submitted: {formatDateTime(form.submitted_at)}
                </div>
              ) : null}

              {form.reviewed_at ? (
                <div style={{ marginTop: 6, fontSize: 13, color: '#6b7280' }}>
                  Reviewed: {formatDateTime(form.reviewed_at)}
                </div>
              ) : null}

              {form.admin_review_note ? (
                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    fontSize: 13,
                    color: '#374151',
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Admin note:</strong> {form.admin_review_note}
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <label style={labelStyle()}>Monetization mode</label>
                <select
                  style={inputStyle()}
                  value={form.monetization_mode}
                  onChange={(e) => updateField('monetization_mode', e.target.value)}
                >
                  <option value="individual">Individual monetization</option>
                  <option value="platform">Platform monetization</option>
                </select>
              </div>

              {isIndividualMode ? (
                <>
                  <div>
                    <label style={labelStyle()}>Provider name</label>
                    <input
                      style={inputStyle()}
                      value={form.provider_name}
                      onChange={(e) => updateField('provider_name', e.target.value)}
                      placeholder="Google AdSense"
                    />
                  </div>

                  <div>
                    <label style={labelStyle()}>Provider type</label>
                    <select
                      style={inputStyle()}
                      value={form.provider_type}
                      onChange={(e) => updateField('provider_type', e.target.value)}
                    >
                      <option value="adsense">AdSense</option>
                      <option value="generic">Generic network</option>
                      <option value="manual">Manual / direct ad</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle()}>Publisher ID</label>
                    <input
                      style={inputStyle()}
                      value={form.publisher_id}
                      onChange={(e) => updateField('publisher_id', e.target.value)}
                      placeholder="pub-xxxxxxxxxxxxxxxx"
                    />
                  </div>
                </>
              ) : null}
            </div>

            {isIndividualMode ? (
              <>
                <div style={{ marginTop: 18 }}>
                  <label style={labelStyle()}>Head code</label>
                  <textarea
                    style={textareaStyle()}
                    value={form.head_code}
                    onChange={(e) => updateField('head_code', e.target.value)}
                    placeholder="<script async src='...'></script>"
                  />
                </div>

                <div style={{ marginTop: 18 }}>
                  <label style={labelStyle()}>Notes</label>
                  <textarea
                    style={{ ...textareaStyle(), minHeight: 110 }}
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Optional note about your ad setup..."
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 16,
                  background: '#eff8ff',
                  border: '1px solid #b2ddff',
                  color: '#175cd3',
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                BlogPulse platform monetization does not require provider name, publisher ID, or ad
                code from you. Once approved, the platform handles the ad serving. You only choose
                where platform ads should appear.
              </div>
            )}

            <div style={{ marginTop: 22 }}>
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#111827',
                }}
              >
                Ad Positions
              </h3>

              <div style={{ display: 'grid', gap: 0 }}>
                {toggleRow(
                  'Storefront top ad',
                  Number(form.storefront_top_enabled),
                  (value) => updateField('storefront_top_enabled', value),
                  'Shows near the top of your storefront homepage.'
                )}

                {toggleRow(
                  'Storefront sidebar ad',
                  Number(form.storefront_sidebar_enabled),
                  (value) => updateField('storefront_sidebar_enabled', value),
                  'Shows on storefront side sections where the template supports it.'
                )}

                {toggleRow(
                  'Storefront bottom ad',
                  Number(form.storefront_bottom_enabled),
                  (value) => updateField('storefront_bottom_enabled', value),
                  'Shows lower on your storefront page.'
                )}

                {toggleRow(
                  'Post top ad',
                  Number(form.post_top_enabled),
                  (value) => updateField('post_top_enabled', value),
                  'Shows near the top of your detailed blog post page.'
                )}

                {toggleRow(
                  'Post middle ad',
                  Number(form.post_middle_enabled),
                  (value) => updateField('post_middle_enabled', value),
                  'Shows inside the article body when the template supports mid-content ads.'
                )}

                {toggleRow(
                  'Post bottom ad',
                  Number(form.post_bottom_enabled),
                  (value) => updateField('post_bottom_enabled', value),
                  'Shows near the end of the blog post.'
                )}

                <div style={{ borderBottom: '1px solid #eef2f7' }}>
                  {toggleRow(
                    'Post sidebar ad',
                    Number(form.post_sidebar_enabled),
                    (value) => updateField('post_sidebar_enabled', value),
                    'Shows in the post sidebar where the selected template has sidebar support.'
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  minWidth: 170,
                  height: 46,
                  borderRadius: 14,
                  border: 0,
                  background: saving ? '#93c5fd' : '#111827',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save My Ads'}
              </button>

              {isIndividualMode ? (
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={submitting || form.review_status === 'pending'}
                  style={{
                    minWidth: 190,
                    height: 46,
                    borderRadius: 14,
                    border: '1px solid #d1d5db',
                    background:
                      submitting || form.review_status === 'pending' ? '#f3f4f6' : '#ffffff',
                    color:
                      submitting || form.review_status === 'pending' ? '#6b7280' : '#111827',
                    fontSize: 14,
                    fontWeight: 900,
                    cursor:
                      submitting || form.review_status === 'pending' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting
                    ? 'Submitting...'
                    : form.review_status === 'pending'
                      ? 'Submitted For Review'
                      : 'Submit For Review'}
                </button>
              ) : null}

              {saveMessage ? (
                <div style={{ fontSize: 14, color: '#027a48', fontWeight: 800 }}>
                  {saveMessage}
                </div>
              ) : null}

              {submitMessage ? (
                <div style={{ fontSize: 14, color: '#027a48', fontWeight: 800 }}>
                  {submitMessage}
                </div>
              ) : null}

              {saveError ? (
                <div style={{ fontSize: 14, color: '#b42318', fontWeight: 800 }}>
                  {saveError}
                </div>
              ) : null}

              {submitError ? (
                <div style={{ fontSize: 14, color: '#b42318', fontWeight: 800 }}>
                  {submitError}
                </div>
              ) : null}
            </div>
          </div>
        </form>

        <div style={{ display: 'grid', gap: 24 }}>
          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              How this works
            </h3>

            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {(isIndividualMode
                ? [
                    'Choose individual monetization if you already have your own ad account.',
                    'Enter your provider details and paste your approved code.',
                    'Choose where those ads should display on your storefront and post pages.',
                    'Save your setup, then submit it for admin review.',
                    'After approval, your review status will update here.',
                  ]
                : [
                    'Choose platform monetization if you want BlogPulse ads on your pages.',
                    'You do not need to enter provider name, publisher ID, or code.',
                    'Just choose where platform ads should display.',
                    'Once approved, BlogPulse handles the ad serving automatically.',
                    'Your metrics and earnings will appear in your monetization pages.',
                  ]
              ).map((text, index) => (
                <div
                  key={text}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(0, 1fr)',
                    gap: 12,
                    alignItems: 'start',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      background: '#111827',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: 13,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      color: '#374151',
                      fontSize: 14,
                      lineHeight: 1.6,
                      paddingTop: 4,
                    }}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Important Note
            </h3>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 16,
                background: '#eff8ff',
                border: '1px solid #b2ddff',
                color: '#175cd3',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              {isIndividualMode
                ? 'If you use your own ad account, your provider pays you directly. BlogPulse wallet earnings do not apply to this mode.'
                : 'If you use BlogPulse platform monetization, the platform manages the ads for you. Your placement choices help decide where those ads should appear.'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const writerMyAdsStyles = `
  * {
    box-sizing: border-box;
  }

  .writer-myads-page {
    width: 100%;
    min-width: 0;
    margin: 0;
    color: #161a20;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-myads-page button,
  .writer-myads-page input,
  .writer-myads-page select,
  .writer-myads-page textarea {
    font: inherit;
  }

  .writer-myads-mobile-title,
  .writer-myads-mobile-actions {
    display: none;
  }

  .writer-myads-command,
  .writer-myads-card,
  .writer-myads-message {
    background: #ffffff;
    border: 1px solid #e3e6ea;
    border-radius: 12px;
  }

  .writer-myads-command {
    position: relative;
    min-height: 70px;
    margin-bottom: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .writer-myads-mode-area {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .writer-myads-eyebrow {
    color: #68707c;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-myads-mode-row {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .writer-myads-mode-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-myads-mode-button {
    min-width: 92px;
    height: 30px;
    padding: 0 12px;
    border: 1px solid #e3e6ea;
    border-radius: 999px;
    background: #f7f8fa;
    color: #68707c;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-myads-mode-button.active {
    border-color: #1e2329;
    background: #1e2329;
    color: #ffffff;
  }

  .writer-myads-mode-helper {
    min-width: 0;
    color: #68707c;
    font-size: 12px;
    line-height: 1.35;
  }

  .writer-myads-command-actions,
  .writer-myads-desktop-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-myads-status-pill {
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eaecf0;
    background: #f9fafb;
    color: #344054;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    white-space: nowrap;
  }

  .writer-myads-status-pill.warning {
    border-color: #fedf89;
    background: #fffaeb;
    color: #b54708;
  }

  .writer-myads-status-pill.success {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-myads-status-pill.info {
    border-color: #b2ddff;
    background: #eff8ff;
    color: #175cd3;
  }

  .writer-myads-status-pill.danger {
    border-color: #fecdca;
    background: #fef3f2;
    color: #b42318;
  }

  .writer-myads-primary-button,
  .writer-myads-secondary-button {
    min-height: 40px;
    padding: 0 16px;
    border-radius: 9px;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
  }

  .writer-myads-primary-button {
    border: 1px solid #1e2329;
    background: #1e2329;
    color: #ffffff;
  }

  .writer-myads-secondary-button {
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #161a20;
  }

  .writer-myads-primary-button:disabled,
  .writer-myads-secondary-button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .writer-myads-message {
    margin-bottom: 12px;
    padding: 11px 13px;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-myads-message.success {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-myads-message.error {
    border-color: #fecdca;
    background: #fef3f2;
    color: #b42318;
  }

  .writer-myads-layout {
    display: grid;
    grid-template-columns: minmax(0, 2.06fr) minmax(320px, 0.98fr);
    gap: 12px;
    align-items: start;
  }

  .writer-myads-main-column,
  .writer-myads-side-column {
    min-width: 0;
    display: grid;
    gap: 12px;
  }

  .writer-myads-card {
    min-width: 0;
    padding: 14px;
  }

  .writer-myads-section-heading {
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-myads-section-heading > strong {
    color: #161a20;
    font-size: 15px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-myads-section-heading > span {
    color: #68707c;
    font-size: 12px;
    line-height: 1.4;
  }

  .writer-myads-loading {
    margin-bottom: 12px;
    padding: 11px 12px;
    border: 1px solid #e3e6ea;
    border-radius: 9px;
    background: #f7f8fa;
    color: #68707c;
    font-size: 12px;
    font-weight: 600;
  }

  .writer-myads-inline-review {
    min-height: 66px;
    margin-bottom: 14px;
    padding: 12px;
    border: 1px solid #e3e6ea;
    border-radius: 10px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-myads-inline-review > strong {
    color: #374151;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-myads-fields-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 16px;
  }

  .writer-myads-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .writer-myads-field > span,
  .writer-myads-group-label {
    color: #667085;
    font-size: 11px;
    line-height: 1.2;
    font-weight: 700;
  }

  .writer-myads-field input,
  .writer-myads-field select,
  .writer-myads-field textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #ccd5df;
    border-radius: 9px;
    background: #ffffff;
    color: #111827;
    outline: none;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-myads-field input,
  .writer-myads-field select {
    height: 42px;
    padding: 0 11px;
  }

  .writer-myads-field textarea {
    padding: 10px 11px;
    resize: vertical;
    font-family: inherit;
  }

  .writer-myads-field-full {
    margin-top: 12px;
  }

  .writer-myads-code {
    min-height: 78px;
  }

  .writer-myads-notes {
    min-height: 66px;
  }

  .writer-myads-platform-note {
    margin-top: 14px;
    padding: 13px;
    border: 1px solid #b2ddff;
    border-radius: 10px;
    background: #eff8ff;
    color: #175cd3;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 600;
  }

  .writer-myads-position-groups {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 32px;
  }

  .writer-myads-group-label {
    display: block;
    margin-bottom: 4px;
    color: #9aa1aa;
  }

  .writer-myads-placement-row {
    min-height: 70px;
    padding: 10px 0;
    border-bottom: 1px solid #edf0f2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-myads-placement-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .writer-myads-placement-copy > strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 600;
  }

  .writer-myads-placement-copy > span {
    color: #7b8491;
    font-size: 11px;
    line-height: 1.35;
  }

  .writer-myads-switch {
    position: relative;
    flex: 0 0 auto;
    width: 44px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: #d5dbe2;
    cursor: pointer;
  }

  .writer-myads-switch > span {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
    transition: left 0.18s ease;
  }

  .writer-myads-switch.is-on {
    background: #1e2329;
  }

  .writer-myads-switch.is-on > span {
    left: 23px;
  }

  .writer-myads-desktop-actions {
    margin-top: 14px;
  }

  .writer-myads-review-card h3,
  .writer-myads-how-card h3,
  .writer-myads-important-card h3 {
    margin: 0 0 12px;
    color: #161a20;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-myads-review-card > p {
    margin: 10px 0 0;
    color: #68707c;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-myads-review-times {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-myads-review-times > span {
    color: #8a929c;
    font-size: 11px;
    line-height: 1.35;
  }

  .writer-myads-admin-note {
    margin-top: 12px;
    padding: 10px;
    border: 1px solid #e3e6ea;
    border-radius: 9px;
    background: #f8fafc;
    color: #374151;
    font-size: 11px;
    line-height: 1.45;
  }

  .writer-myads-steps {
    display: grid;
    gap: 14px;
  }

  .writer-myads-step {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 10px;
    align-items: start;
  }

  .writer-myads-step > span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #1e2329;
    color: #ffffff;
    display: grid;
    place-items: center;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
  }

  .writer-myads-step > p {
    margin: 2px 0 0;
    color: #374151;
    font-size: 12px;
    line-height: 1.45;
  }

  .writer-myads-step > p > b {
    display: none;
  }

  .writer-myads-important-card > div {
    padding: 12px;
    border: 1px solid #b2ddff;
    border-radius: 10px;
    background: #eff8ff;
    color: #175cd3;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-myads-type-card {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .writer-myads-type-card > span {
    color: #68707c;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-myads-type-card > strong {
    color: #161a20;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
  }

  .writer-myads-type-card > p {
    margin: 0;
    color: #68707c;
    font-size: 11px;
    line-height: 1.45;
  }

  @media (max-width: 900px) {
    .writer-myads-layout {
      grid-template-columns: minmax(0, 1.55fr) minmax(280px, 1fr);
    }
  }

  @media (max-width: 767px) {
    .writer-myads-mobile-title {
      min-height: 46px;
      margin-bottom: 10px;
      padding: 0 11px;
      display: flex;
      align-items: center;
      border: 1px solid #e3e6ea;
      border-radius: 10px;
      background: #ffffff;
      color: #161a20;
      font-size: 13px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-myads-command {
      min-height: 114px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
      align-items: stretch;
    }

    .writer-myads-eyebrow {
      font-size: 10px;
    }

    .writer-myads-mode-area {
      width: 100%;
    }

    .writer-myads-mode-row {
      flex-wrap: wrap;
      gap: 10px;
    }

    .writer-myads-mode-button {
      min-width: 92px;
      height: 30px;
      font-size: 11px;
    }

    .writer-myads-mode-helper {
      width: 100%;
      font-size: 10px;
    }

    .writer-myads-command-actions {
      position: absolute;
      right: 20px;
      margin-top: 28px;
    }

    .writer-myads-command-actions .writer-myads-primary-button,
    .writer-myads-command-actions .writer-myads-secondary-button {
      display: none;
    }

    .writer-myads-status-pill {
      min-height: 28px;
      padding: 0 10px;
      font-size: 10px;
    }

    .writer-myads-layout {
      display: block;
    }

    .writer-myads-main-column,
    .writer-myads-side-column {
      display: block;
    }

    .writer-myads-card {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-myads-section-heading {
      margin-bottom: 12px;
    }

    .writer-myads-section-heading > strong {
      font-size: 13px;
    }

    .writer-myads-section-heading > span {
      font-size: 10px;
    }

    .writer-myads-inline-review {
      display: none;
    }

    .writer-myads-fields-grid {
      display: block;
    }

    .writer-myads-field {
      margin-bottom: 10px;
      gap: 5px;
    }

    .writer-myads-field > span,
    .writer-myads-group-label {
      font-size: 10px;
    }

    .writer-myads-field input,
    .writer-myads-field select {
      height: 40px;
      font-size: 11px;
    }

    .writer-myads-field textarea {
      font-size: 11px;
    }

    .writer-myads-field-full {
      margin-top: 0;
    }

    .writer-myads-code {
      min-height: 82px;
    }

    .writer-myads-notes {
      min-height: 70px;
    }

    .writer-myads-position-groups {
      display: block;
    }

    .writer-myads-position-groups > div + div {
      margin-top: 0;
    }

    .writer-myads-group-label {
      display: none;
    }

    .writer-myads-placement-row {
      min-height: 64px;
      padding: 9px 0;
    }

    .writer-myads-placement-copy > strong {
      font-size: 11px;
    }

    .writer-myads-placement-copy > span {
      font-size: 9px;
    }

    .writer-myads-desktop-actions {
      display: none;
    }

    .writer-myads-mobile-actions {
      display: grid;
      gap: 6px;
    }

    .writer-myads-mobile-actions .writer-myads-primary-button,
    .writer-myads-mobile-actions .writer-myads-secondary-button {
      width: 100%;
      min-height: 38px;
    }

    .writer-myads-side-column {
      margin-top: 0;
    }

    .writer-myads-review-card h3,
    .writer-myads-how-card h3,
    .writer-myads-important-card h3 {
      margin-bottom: 10px;
      font-size: 12px;
    }

    .writer-myads-review-card > p {
      font-size: 10px;
    }

    .writer-myads-review-times,
    .writer-myads-admin-note {
      display: none;
    }

    .writer-myads-how-card .writer-myads-steps {
      gap: 4px;
    }

    .writer-myads-step {
      display: block;
    }

    .writer-myads-step > span {
      display: none;
    }

    .writer-myads-step > p {
      margin: 0;
      color: #68707c;
      font-size: 9px;
      line-height: 1.35;
    }

    .writer-myads-step > p > b {
      display: inline;
      margin-right: 8px;
      color: #68707c;
      font-weight: 600;
    }

    .writer-myads-important-card > div {
      padding: 0;
      border: 0;
      background: transparent;
      font-size: 10px;
      line-height: 1.4;
    }

    .writer-myads-type-card {
      display: none;
    }

    .writer-myads-platform-note {
      font-size: 10px;
    }

    .writer-myads-message {
      margin-bottom: 10px;
      font-size: 10px;
    }
  }
`;
