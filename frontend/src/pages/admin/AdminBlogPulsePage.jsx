import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

const initialSettings = {
  is_enabled: 0,
  premium_only: 1,
  default_rate_per_view: '0.00010000',
  minimum_view_seconds: 15,
  minimum_scroll_percent: 10,
  ip_repeat_window_hours: 24,
  fingerprint_repeat_window_hours: 24,
  daily_ip_view_cap: 5,
  withdrawal_threshold: '10.00',
  count_only_if_ad_loaded: 0,
  block_vpn_proxy_traffic: 0,
  block_suspicious_user_agents: 1,
  allow_individual_monetization: 1,
  individual_requires_admin_approval: 1,
  individual_premium_only: 1,
  allow_custom_html_ad_code: 0,
  allow_network_js_code: 1,
};

const initialEligibilitySettings = {
  paid_subscription_required: 1,
  active_storefront_required: 1,
  required_pages_count: 4,
  minimum_published_posts: 15,
  minimum_valid_page_views: 1000,
  content_quality_review_required: 1,
  local_ads_enabled: 1,
  affiliate_ads_enabled: 1,
  global_ads_enabled: 1,
  personal_ad_id_enabled: 1,
  publisher_max_revenue_percent: 60,
  status: 'active',
};

const initialFilters = {
  monetization_mode: 'all',
  approval_status: 'all',
  provider_type: 'all',
  website_status: 'all',
  search: '',
};

const initialCodeForm = {
  provider_name: '',
  provider_type: 'adsense',
  placement_scope: 'platform',
  target_mode: 'platform',
  head_code: '',
  body_code: '',
  notes: '',
};

function toFormSettings(settings = {}) {
  return {
    ...initialSettings,
    ...settings,
    is_enabled: Number(settings?.is_enabled ?? initialSettings.is_enabled),
    premium_only: Number(settings?.premium_only ?? initialSettings.premium_only),
    minimum_view_seconds: Number(settings?.minimum_view_seconds ?? initialSettings.minimum_view_seconds),
    minimum_scroll_percent: Number(settings?.minimum_scroll_percent ?? initialSettings.minimum_scroll_percent),
    ip_repeat_window_hours: Number(settings?.ip_repeat_window_hours ?? initialSettings.ip_repeat_window_hours),
    fingerprint_repeat_window_hours: Number(settings?.fingerprint_repeat_window_hours ?? initialSettings.fingerprint_repeat_window_hours),
    daily_ip_view_cap: Number(settings?.daily_ip_view_cap ?? initialSettings.daily_ip_view_cap),
    count_only_if_ad_loaded: Number(settings?.count_only_if_ad_loaded ?? initialSettings.count_only_if_ad_loaded),
    block_vpn_proxy_traffic: Number(settings?.block_vpn_proxy_traffic ?? initialSettings.block_vpn_proxy_traffic),
    block_suspicious_user_agents: Number(settings?.block_suspicious_user_agents ?? initialSettings.block_suspicious_user_agents),
    allow_individual_monetization: Number(settings?.allow_individual_monetization ?? initialSettings.allow_individual_monetization),
    individual_requires_admin_approval: Number(settings?.individual_requires_admin_approval ?? initialSettings.individual_requires_admin_approval),
    individual_premium_only: Number(settings?.individual_premium_only ?? initialSettings.individual_premium_only),
    allow_custom_html_ad_code: Number(settings?.allow_custom_html_ad_code ?? initialSettings.allow_custom_html_ad_code),
    allow_network_js_code: Number(settings?.allow_network_js_code ?? initialSettings.allow_network_js_code),
    default_rate_per_view: String(settings?.default_rate_per_view ?? initialSettings.default_rate_per_view),
    withdrawal_threshold: String(settings?.withdrawal_threshold ?? initialSettings.withdrawal_threshold),
  };
}

function toEligibilityForm(settings = {}) {
  return {
    ...initialEligibilitySettings,
    ...settings,
    paid_subscription_required: Number(settings?.paid_subscription_required ?? initialEligibilitySettings.paid_subscription_required),
    active_storefront_required: Number(settings?.active_storefront_required ?? initialEligibilitySettings.active_storefront_required),
    required_pages_count: Number(settings?.required_pages_count ?? initialEligibilitySettings.required_pages_count),
    minimum_published_posts: Number(settings?.minimum_published_posts ?? initialEligibilitySettings.minimum_published_posts),
    minimum_valid_page_views: Number(settings?.minimum_valid_page_views ?? initialEligibilitySettings.minimum_valid_page_views),
    content_quality_review_required: Number(settings?.content_quality_review_required ?? initialEligibilitySettings.content_quality_review_required),
    local_ads_enabled: Number(settings?.local_ads_enabled ?? initialEligibilitySettings.local_ads_enabled),
    affiliate_ads_enabled: Number(settings?.affiliate_ads_enabled ?? initialEligibilitySettings.affiliate_ads_enabled),
    global_ads_enabled: Number(settings?.global_ads_enabled ?? initialEligibilitySettings.global_ads_enabled),
    personal_ad_id_enabled: Number(settings?.personal_ad_id_enabled ?? initialEligibilitySettings.personal_ad_id_enabled),
    publisher_max_revenue_percent: Number(settings?.publisher_max_revenue_percent ?? initialEligibilitySettings.publisher_max_revenue_percent),
    status: settings?.status || initialEligibilitySettings.status,
  };
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildSettingsPayload(form, eligibilityForm) {
  return {
    is_enabled: Number(form.is_enabled),
    premium_only: Number(form.premium_only),
    default_rate_per_view: parseNumber(form.default_rate_per_view, 0),
    minimum_view_seconds: parseNumber(form.minimum_view_seconds, 0),
    minimum_scroll_percent: parseNumber(form.minimum_scroll_percent, 0),
    ip_repeat_window_hours: parseNumber(form.ip_repeat_window_hours, 1),
    fingerprint_repeat_window_hours: parseNumber(form.fingerprint_repeat_window_hours, 1),
    daily_ip_view_cap: parseNumber(form.daily_ip_view_cap, 1),
    withdrawal_threshold: parseNumber(form.withdrawal_threshold, 0),
    count_only_if_ad_loaded: Number(form.count_only_if_ad_loaded),
    block_vpn_proxy_traffic: Number(form.block_vpn_proxy_traffic),
    block_suspicious_user_agents: Number(form.block_suspicious_user_agents),
    allow_individual_monetization: Number(form.allow_individual_monetization),
    individual_requires_admin_approval: Number(form.individual_requires_admin_approval),
    individual_premium_only: Number(form.individual_premium_only),
    allow_custom_html_ad_code: Number(form.allow_custom_html_ad_code),
    allow_network_js_code: Number(form.allow_network_js_code),
    eligibility_settings: {
      paid_subscription_required: Number(eligibilityForm.paid_subscription_required),
      active_storefront_required: Number(eligibilityForm.active_storefront_required),
      required_pages_count: parseNumber(eligibilityForm.required_pages_count, 0),
      minimum_published_posts: parseNumber(eligibilityForm.minimum_published_posts, 0),
      minimum_valid_page_views: parseNumber(eligibilityForm.minimum_valid_page_views, 0),
      content_quality_review_required: Number(eligibilityForm.content_quality_review_required),
      local_ads_enabled: Number(eligibilityForm.local_ads_enabled),
      affiliate_ads_enabled: Number(eligibilityForm.affiliate_ads_enabled),
      global_ads_enabled: Number(eligibilityForm.global_ads_enabled),
      personal_ad_id_enabled: Number(eligibilityForm.personal_ad_id_enabled),
      publisher_max_revenue_percent: parseNumber(eligibilityForm.publisher_max_revenue_percent, 60),
      status: eligibilityForm.status || 'active',
    },
  };
}

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #dcdcde',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 10px 30px rgba(16,24,40,0.04)',
  };
}

function sectionTitleStyle() {
  return {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  };
}

function sectionHintStyle() {
  return {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
    lineHeight: 1.5,
  };
}

function labelStyle() {
  return {
    fontSize: 13,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 8,
    display: 'block',
  };
}

function inputStyle() {
  return {
    width: '100%',
    minHeight: 44,
    borderRadius: 12,
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
    minHeight: 140,
    borderRadius: 12,
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

function selectStyle() {
  return inputStyle();
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
        borderBottom: '1px solid #eef0f3',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{label}</div>
        {helper ? (
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 1.45 }}>
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

function badgeStyle(type = 'default') {
  const map = {
    success: { background: '#ecfdf3', color: '#027a48', border: '#abefc6' },
    warning: { background: '#fffaeb', color: '#b54708', border: '#fedf89' },
    danger: { background: '#fef3f2', color: '#b42318', border: '#fecdca' },
    info: { background: '#eff8ff', color: '#175cd3', border: '#b2ddff' },
    default: { background: '#f9fafb', color: '#344054', border: '#eaecf0' },
  };

  const current = map[type] || map.default;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
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

function submissionStatusTone(status) {
  if (status === 'approved') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'default';
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export default function AdminBlogPulsePage() {
  const { token, bootstrapping } = useAuth();

  const [settingsForm, setSettingsForm] = useState(initialSettings);
  const [eligibilityForm, setEligibilityForm] = useState(initialEligibilitySettings);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [codeForm, setCodeForm] = useState(initialCodeForm);
  const [codeBoxMessage, setCodeBoxMessage] = useState('');
  const [codeBoxError, setCodeBoxError] = useState('');
  const [savingCodeBox, setSavingCodeBox] = useState(false);
  const [applyingFilter, setApplyingFilter] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState('');
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewingAction, setReviewingAction] = useState('');

  const [contentReviews, setContentReviews] = useState([]);
  const [contentReviewsLoading, setContentReviewsLoading] = useState(false);
  const [contentReviewsError, setContentReviewsError] = useState('');
  const [contentReviewNotes, setContentReviewNotes] = useState({});
  const [activeContentReviewUserId, setActiveContentReviewUserId] = useState(null);
  const [contentReviewMessage, setContentReviewMessage] = useState('');
  const [contentReviewError, setContentReviewError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadPage() {
      if (bootstrapping) return;

      if (!token) {
        if (!ignore) {
          setLoading(false);
          setSettingsError('Not authorized. No token provided.');
        }
        return;
      }

      setLoading(true);
      setSettingsError('');

      try {
        const { data } = await api.get('/api/admin/blogpulse/settings');

        if (!data?.ok) {
          throw new Error(data?.message || 'Failed to load BlogPulse settings.');
        }

        if (!ignore) {
          setSettingsForm(toFormSettings(data.settings || {}));
          setEligibilityForm(toEligibilityForm(data.eligibility_settings || {}));
          setPolicy(data.policy || null);
        }
      } catch (error) {
        if (!ignore) {
          setSettingsError(
            error?.response?.data?.message || error.message || 'Failed to load BlogPulse settings.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      ignore = true;
    };
  }, [token, bootstrapping]);

  async function loadSubmissions() {
    if (!token) return;

    setSubmissionsLoading(true);
    setSubmissionsError('');
    setReviewMessage('');
    setReviewError('');

    try {
      const params = {};

      if (filters.monetization_mode !== 'all') params.monetization_mode = filters.monetization_mode;
      if (filters.approval_status !== 'all') params.approval_status = filters.approval_status;
      if (filters.provider_type !== 'all') params.provider_type = filters.provider_type;
      if (filters.website_status !== 'all') params.website_status = filters.website_status;
      if (filters.search.trim()) params.search = filters.search.trim();

      const { data } = await api.get('/api/admin/blogpulse/submissions', { params });

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load monetization submissions.');
      }

      const nextSubmissions = Array.isArray(data.submissions) ? data.submissions : [];
      setSubmissions(nextSubmissions);

      const nextNotes = {};
      nextSubmissions.forEach((item) => {
        nextNotes[item.id] = item.admin_review_note || '';
      });
      setReviewNotes(nextNotes);
    } catch (error) {
      setSubmissionsError(
        error?.response?.data?.message || error.message || 'Failed to load monetization submissions.'
      );
    } finally {
      setSubmissionsLoading(false);
    }
  }

  async function loadContentReviews() {
    if (!token) return;

    setContentReviewsLoading(true);
    setContentReviewsError('');
    setContentReviewMessage('');
    setContentReviewError('');

    try {
      const { data } = await api.get('/api/admin/blogpulse/content-quality');

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to load content quality reviews.');
      }

      const nextReviews = Array.isArray(data.reviews) ? data.reviews : [];
      setContentReviews(nextReviews);

      const nextNotes = {};
      nextReviews.forEach((item) => {
        nextNotes[item.user_id] = item.content_quality_note || '';
      });
      setContentReviewNotes(nextNotes);
    } catch (error) {
      setContentReviewsError(
        error?.response?.data?.message ||
          error.message ||
          'Failed to load content quality reviews.'
      );
    } finally {
      setContentReviewsLoading(false);
    }
  }

  useEffect(() => {
    if (bootstrapping || !token) return;
    loadSubmissions();
    loadContentReviews();
  }, [bootstrapping, token]);

  async function handleSaveSettings(event) {
    event.preventDefault();

    if (!token) {
      setSettingsError('Not authorized. No token provided.');
      return;
    }

    setSavingSettings(true);
    setSettingsMessage('');
    setSettingsError('');

    try {
      const { data } = await api.put(
        '/api/admin/blogpulse/settings',
        buildSettingsPayload(settingsForm, eligibilityForm)
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to save BlogPulse settings.');
      }

      setSettingsForm(toFormSettings(data.settings || {}));
      setEligibilityForm(toEligibilityForm(data.eligibility_settings || {}));
      setPolicy(data.policy || null);
      setSettingsMessage(data?.message || 'BlogPulse settings updated successfully.');
    } catch (error) {
      setSettingsError(
        error?.response?.data?.message || error.message || 'Failed to save BlogPulse settings.'
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveCodeBox(event) {
    event.preventDefault();

    setCodeBoxMessage('');
    setCodeBoxError('');

    if (!codeForm.provider_name.trim()) {
      setCodeBoxError('Provider name is required.');
      return;
    }

    if (!codeForm.head_code.trim() && !codeForm.body_code.trim()) {
      setCodeBoxError('Enter head code or body / placement code before saving.');
      return;
    }

    setSavingCodeBox(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setCodeBoxMessage('Code box saved.');
    } catch (error) {
      setCodeBoxError('Failed to save code box.');
    } finally {
      setSavingCodeBox(false);
    }
  }

  async function handleApplyWithFilter() {
    setCodeBoxMessage('');
    setCodeBoxError('');

    if (!codeForm.provider_name.trim()) {
      setCodeBoxError('Provider name is required before applying with filter.');
      return;
    }

    if (!codeForm.head_code.trim() && !codeForm.body_code.trim()) {
      setCodeBoxError('Enter head code or body / placement code before applying with filter.');
      return;
    }

    setApplyingFilter(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setCodeBoxMessage('Code box filter applied.');
    } catch (error) {
      setCodeBoxError('Failed to apply filter.');
    } finally {
      setApplyingFilter(false);
    }
  }

  async function handleContentQualityReview(userId, status) {
    setActiveContentReviewUserId(userId);
    setContentReviewMessage('');
    setContentReviewError('');

    try {
      const { data } = await api.patch(`/api/admin/blogpulse/content-quality/${userId}/review`, {
        content_quality_status: status,
        content_quality_note: contentReviewNotes[userId] || '',
      });

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to update content quality review.');
      }

      setContentReviewMessage(data.message || 'Content quality review updated successfully.');
      await loadContentReviews();
    } catch (error) {
      setContentReviewError(
        error?.response?.data?.message ||
          error.message ||
          'Failed to update content quality review.'
      );
    } finally {
      setActiveContentReviewUserId(null);
    }
  }

  async function handleReviewSubmission(submissionId, reviewStatus) {
    setReviewMessage('');
    setReviewError('');
    setActiveSubmissionId(submissionId);
    setReviewingAction(reviewStatus);

    try {
      const { data } = await api.patch(
        `/api/admin/blogpulse/submissions/${submissionId}/review`,
        {
          review_status: reviewStatus,
          admin_review_note: reviewNotes[submissionId] || '',
        }
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to review submission.');
      }

      setReviewMessage(data.message || 'Submission reviewed successfully.');
      await loadSubmissions();
    } catch (error) {
      setReviewError(
        error?.response?.data?.message || error.message || 'Failed to review submission.'
      );
    } finally {
      setActiveSubmissionId(null);
      setReviewingAction('');
    }
  }

  function updateSetting(field, value) {
    setSettingsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateEligibility(field, value) {
    setEligibilityForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateFilter(field, value) {
    setCodeBoxMessage('');
    setCodeBoxError('');
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateCodeForm(field, value) {
    setCodeBoxMessage('');
    setCodeBoxError('');
    setCodeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateReviewNote(submissionId, value) {
    setReviewNotes((prev) => ({
      ...prev,
      [submissionId]: value,
    }));
  }

  function updateContentReviewNote(userId, value) {
    setContentReviewNotes((prev) => ({
      ...prev,
      [userId]: value,
    }));
  }

  const eligibilityItems = policy?.minimum_requirements || [];
  const notes = policy?.notes || [];

  const pendingCount = useMemo(
    () => submissions.filter((item) => item.review_status === 'pending').length,
    [submissions]
  );

  const pendingContentCount = useMemo(
    () => contentReviews.filter((item) => item.content_quality_status === 'pending').length,
    [contentReviews]
  );

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <section
        style={{
          ...cardStyle(),
          padding: 24,
          background:
            'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06), rgba(14,165,233,0.04))',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                padding: '8px 12px',
                background: '#ffffff',
                border: '1px solid #dbeafe',
                color: '#1d4ed8',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}
            >
              BlogPulse Control Center
            </div>

            <h1
              style={{
                fontSize: 32,
                lineHeight: 1.15,
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 10px',
              }}
            >
              Manage marketplace monetization, eligibility, publisher ads, and reviews
            </h1>

            <p
              style={{
                fontSize: 15,
                color: '#4b5563',
                lineHeight: 1.65,
                margin: 0,
                maxWidth: 760,
              }}
            >
              Control BlogPulse Earnings, marketplace ad eligibility, local ads, affiliate ads,
              global ads, personal ad ID ads, payout rules, content quality reviews, and affiliate
              monetization approvals.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            <div style={{ ...cardStyle(), padding: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Program</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {policy?.program_name || 'BlogPulse Earnings'}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Eligibility</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {eligibilityForm.status === 'active' ? 'Active' : 'Disabled'}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                Content Pending
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {pendingContentCount}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                Pending Reviews
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
                {pendingCount}
              </div>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 22 }}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
            gap: 22,
          }}
        >
          <div style={{ display: 'grid', gap: 22 }}>
            <div style={cardStyle()}>
              <h2 style={sectionTitleStyle()}>Marketplace Monetization Eligibility</h2>
              <p style={sectionHintStyle()}>
                Set the rules affiliates must meet before BlogPulse, sponsored publisher ads, local
                ads, affiliate ads, global ads, and personal ad ID monetization can become active.
              </p>

              <div style={{ marginTop: 8 }}>
                {toggleRow(
                  'Enable eligibility rules',
                  eligibilityForm.status === 'active' ? 1 : 0,
                  (value) => updateEligibility('status', value ? 'active' : 'disabled'),
                  'When disabled, eligibility rules are not active for marketplace monetization.'
                )}

                {toggleRow(
                  'Paid subscription required',
                  Number(eligibilityForm.paid_subscription_required),
                  (value) => updateEligibility('paid_subscription_required', value),
                  'Require affiliates to have an active paid subscription before monetization approval.'
                )}

                {toggleRow(
                  'Active storefront required',
                  Number(eligibilityForm.active_storefront_required),
                  (value) => updateEligibility('active_storefront_required', value),
                  'Require the affiliate website/storefront to be active before approval.'
                )}

                <div style={{ borderBottom: '1px solid #eef0f3' }}>
                  {toggleRow(
                    'Content quality review required',
                    Number(eligibilityForm.content_quality_review_required),
                    (value) => updateEligibility('content_quality_review_required', value),
                    'Require admin content quality approval before earnings become active.'
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                <div>
                  <label style={labelStyle()}>Required pages count</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={eligibilityForm.required_pages_count}
                    onChange={(e) => updateEligibility('required_pages_count', e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Minimum published posts</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={eligibilityForm.minimum_published_posts}
                    onChange={(e) => updateEligibility('minimum_published_posts', e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Minimum valid page views</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={eligibilityForm.minimum_valid_page_views}
                    onChange={(e) => updateEligibility('minimum_valid_page_views', e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Publisher max revenue percent</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={eligibilityForm.publisher_max_revenue_percent}
                    onChange={(e) => updateEligibility('publisher_max_revenue_percent', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={sectionTitleStyle()}>Marketplace Ad Program Access</h2>
              <p style={sectionHintStyle()}>
                Control which monetization programs are available across the marketplace.
              </p>

              <div style={{ marginTop: 8 }}>
                {toggleRow(
                  'Local ads enabled',
                  Number(eligibilityForm.local_ads_enabled),
                  (value) => updateEligibility('local_ads_enabled', value),
                  'Allow platform-managed local/direct ads to participate in BlogPulse monetization.'
                )}

                {toggleRow(
                  'Affiliate ads enabled',
                  Number(eligibilityForm.affiliate_ads_enabled),
                  (value) => updateEligibility('affiliate_ads_enabled', value),
                  'Allow affiliate promoted posts, products, and websites to run through eligible publisher placements.'
                )}

                {toggleRow(
                  'Global ads enabled',
                  Number(eligibilityForm.global_ads_enabled),
                  (value) => updateEligibility('global_ads_enabled', value),
                  'Allow global marketplace ads to run through eligible publisher placements.'
                )}

                <div style={{ borderBottom: '1px solid #eef0f3' }}>
                  {toggleRow(
                    'Personal ad ID ads enabled',
                    Number(eligibilityForm.personal_ad_id_enabled),
                    (value) => updateEligibility('personal_ad_id_enabled', value),
                    'Allow eligible affiliates to use their own approved ad provider or ad ID setup.'
                  )}
                </div>
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={sectionTitleStyle()}>Platform Monetization Settings</h2>
              <p style={sectionHintStyle()}>
                Control the BlogPulse payout engine, valid view rules, fraud protection, and payout
                threshold for platform-managed monetization.
              </p>

              <div style={{ marginTop: 8 }}>
                {toggleRow(
                  'Enable BlogPulse platform monetization',
                  Number(settingsForm.is_enabled),
                  (value) => updateSetting('is_enabled', value),
                  'When enabled, approved premium blogs can earn BlogPulse credits from valid traffic.'
                )}

                {toggleRow(
                  'Paid subscription only',
                  Number(settingsForm.premium_only),
                  (value) => updateSetting('premium_only', value),
                  'Only affiliates on an active paid subscription can qualify for platform monetization.'
                )}

                {toggleRow(
                  'Count only if ad loads',
                  Number(settingsForm.count_only_if_ad_loaded),
                  (value) => updateSetting('count_only_if_ad_loaded', value),
                  'Requires the ad placement to load before a valid view can be credited.'
                )}

                {toggleRow(
                  'Block VPN / proxy traffic',
                  Number(settingsForm.block_vpn_proxy_traffic),
                  (value) => updateSetting('block_vpn_proxy_traffic', value),
                  'Use this when you want stricter protection against suspicious traffic sources.'
                )}

                <div style={{ borderBottom: '1px solid #eef0f3' }}>
                  {toggleRow(
                    'Block suspicious user agents',
                    Number(settingsForm.block_suspicious_user_agents),
                    (value) => updateSetting('block_suspicious_user_agents', value),
                    'Filters obvious bot-like or unusual traffic signatures before crediting views.'
                  )}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                }}
              >
                <div>
                  <label style={labelStyle()}>Rate per valid view</label>
                  <input
                    style={inputStyle()}
                    value={settingsForm.default_rate_per_view}
                    onChange={(e) => updateSetting('default_rate_per_view', e.target.value)}
                    placeholder="0.00010000"
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Withdrawal threshold</label>
                  <input
                    style={inputStyle()}
                    value={settingsForm.withdrawal_threshold}
                    onChange={(e) => updateSetting('withdrawal_threshold', e.target.value)}
                    placeholder="10.00"
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Minimum view seconds</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={settingsForm.minimum_view_seconds}
                    onChange={(e) => updateSetting('minimum_view_seconds', e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Minimum scroll percent</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={settingsForm.minimum_scroll_percent}
                    onChange={(e) => updateSetting('minimum_scroll_percent', e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>IP repeat window (hours)</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={settingsForm.ip_repeat_window_hours}
                    onChange={(e) => updateSetting('ip_repeat_window_hours', e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Fingerprint repeat window (hours)</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={settingsForm.fingerprint_repeat_window_hours}
                    onChange={(e) => updateSetting('fingerprint_repeat_window_hours', e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle()}>Daily IP view cap</label>
                  <input
                    type="number"
                    style={inputStyle()}
                    value={settingsForm.daily_ip_view_cap}
                    onChange={(e) => updateSetting('daily_ip_view_cap', e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="submit"
                  disabled={savingSettings}
                  style={{
                    minWidth: 220,
                    height: 46,
                    borderRadius: 12,
                    border: 0,
                    background: savingSettings ? '#93c5fd' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: savingSettings ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingSettings ? 'Saving...' : 'Save BlogPulse Settings'}
                </button>

                {settingsMessage ? (
                  <div style={{ fontSize: 14, color: '#15803d', fontWeight: 700 }}>
                    {settingsMessage}
                  </div>
                ) : null}

                {settingsError ? (
                  <div style={{ fontSize: 14, color: '#b91c1c', fontWeight: 700 }}>
                    {settingsError}
                  </div>
                ) : null}
              </div>
            </div>

            <div style={cardStyle()}>
              <h2 style={sectionTitleStyle()}>Individual Monetization Policy</h2>
              <p style={sectionHintStyle()}>
                Control when affiliates can use their own ad provider code on their own storefronts
                and post pages.
              </p>

              <div style={{ marginTop: 8 }}>
                {toggleRow(
                  'Allow individual monetization',
                  Number(settingsForm.allow_individual_monetization),
                  (value) => updateSetting('allow_individual_monetization', value),
                  'Lets affiliates submit and use their own approved ad provider code.'
                )}

                {toggleRow(
                  'Require admin approval',
                  Number(settingsForm.individual_requires_admin_approval),
                  (value) => updateSetting('individual_requires_admin_approval', value),
                  'Affiliate ad code stays pending until you approve it.'
                )}

                {toggleRow(
                  'Paid subscription only',
                  Number(settingsForm.individual_premium_only),
                  (value) => updateSetting('individual_premium_only', value),
                  'Only affiliates on active paid plans can use individual monetization.'
                )}

                {toggleRow(
                  'Allow custom HTML ad code',
                  Number(settingsForm.allow_custom_html_ad_code),
                  (value) => updateSetting('allow_custom_html_ad_code', value),
                  'Lets admins or affiliates paste approved non-network HTML ad blocks where allowed.'
                )}

                <div style={{ borderBottom: '1px solid #eef0f3' }}>
                  {toggleRow(
                    'Allow network JavaScript code',
                    Number(settingsForm.allow_network_js_code),
                    (value) => updateSetting('allow_network_js_code', value),
                    'Lets the system accept provider JavaScript snippets such as approved ad network tags.'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 22, alignSelf: 'start' }}>
            <div style={cardStyle()}>
              <h2 style={sectionTitleStyle()}>Current Eligibility Policy</h2>
              <p style={sectionHintStyle()}>
                This is what affiliates will see on their BlogPulse eligibility page.
              </p>

              {loading ? (
                <div style={{ marginTop: 18, color: '#6b7280' }}>Loading policy...</div>
              ) : null}

              {!!eligibilityItems.length && !loading ? (
                <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
                  {eligibilityItems.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        fontSize: 14,
                        color: '#374151',
                        lineHeight: 1.55,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}

              {!!notes.length ? (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
                    Notes
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {notes.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          fontSize: 14,
                          color: '#1e3a8a',
                          lineHeight: 1.55,
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div style={cardStyle()}>
              <h2 style={sectionTitleStyle()}>Affiliate Monetization Filters</h2>
              <p style={sectionHintStyle()}>
                Filter platform users, individual ad users, pending approvals, and provider types from
                one place.
              </p>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle()}>Mode</label>
                  <select
                    style={selectStyle()}
                    value={filters.monetization_mode}
                    onChange={(e) => updateFilter('monetization_mode', e.target.value)}
                  >
                    <option value="all">All modes</option>
                    <option value="platform">Platform</option>
                    <option value="individual">Individual</option>
                    <option value="none">Not monetized</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle()}>Approval</label>
                  <select
                    style={selectStyle()}
                    value={filters.approval_status}
                    onChange={(e) => updateFilter('approval_status', e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle()}>Provider Type</label>
                  <select
                    style={selectStyle()}
                    value={filters.provider_type}
                    onChange={(e) => updateFilter('provider_type', e.target.value)}
                  >
                    <option value="all">All providers</option>
                    <option value="adsense">AdSense</option>
                    <option value="generic">Generic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle()}>Website Status</label>
                  <select
                    style={selectStyle()}
                    value={filters.website_status}
                    onChange={(e) => updateFilter('website_status', e.target.value)}
                  >
                    <option value="all">All websites</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle()}>Search affiliate / website / provider</label>
                  <input
                    style={inputStyle()}
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    placeholder="Search by affiliate, website slug, provider name..."
                  />
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
                  type="button"
                  onClick={loadSubmissions}
                  disabled={submissionsLoading}
                  style={{
                    minWidth: 170,
                    height: 44,
                    borderRadius: 12,
                    border: 0,
                    background: submissionsLoading ? '#93c5fd' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: submissionsLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submissionsLoading ? 'Loading...' : 'Apply Filters'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilters(initialFilters);
                    setTimeout(() => loadSubmissions(), 0);
                  }}
                  style={{
                    minWidth: 140,
                    height: 44,
                    borderRadius: 12,
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#111827',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>
      </form>

      <div style={cardStyle()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={sectionTitleStyle()}>Original Content Quality Reviews</h2>
            <p style={sectionHintStyle()}>
              Approve or reject affiliate content quality before they apply for full BlogPulse monetization.
            </p>
          </div>

          <button
            type="button"
            onClick={loadContentReviews}
            disabled={contentReviewsLoading}
            style={{
              minWidth: 150,
              height: 42,
              borderRadius: 12,
              border: 0,
              background: contentReviewsLoading ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 800,
              cursor: contentReviewsLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {contentReviewsLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {contentReviewMessage ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              background: '#ecfdf3',
              border: '1px solid #abefc6',
              color: '#027a48',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {contentReviewMessage}
          </div>
        ) : null}

        {contentReviewError || contentReviewsError ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {contentReviewError || contentReviewsError}
          </div>
        ) : null}

        {contentReviewsLoading ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Loading content quality reviews...
          </div>
        ) : null}

        {!contentReviewsLoading && !contentReviews.length ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            No content quality reviews found.
          </div>
        ) : null}

        {!contentReviewsLoading && contentReviews.length ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {contentReviews.map((item) => {
              const isBusy = activeContentReviewUserId === item.user_id;
              const noteValue = contentReviewNotes[item.user_id] || '';

              return (
                <div
                  key={item.user_id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 18,
                    background: '#ffffff',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
                    gap: 18,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        marginBottom: 10,
                      }}
                    >
                      <div style={badgeStyle(submissionStatusTone(item.content_quality_status))}>
                        Content: {item.content_quality_status || 'pending'}
                      </div>

                      <div style={badgeStyle('info')}>
                        {item.total_posts || 0} Posts
                      </div>

                      <div style={badgeStyle(submissionStatusTone(item.review_status))}>
                        Monetization: {item.review_status || 'draft'}
                      </div>
                    </div>

                    <h3
                      style={{
                        margin: '0 0 8px',
                        fontSize: 20,
                        fontWeight: 800,
                        color: '#111827',
                      }}
                    >
                      {item.affiliate?.name || 'Affiliate'}
                    </h3>

                    <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.65 }}>
                      <div><strong>Email:</strong> {item.affiliate?.email || '-'}</div>
                      <div>
                        <strong>Website:</strong>{' '}
                        {item.website?.website_name || '-'}
                        {item.website?.slug ? ` (${item.website.slug})` : ''}
                      </div>
                      <div><strong>Website Status:</strong> {item.website?.status || '-'}</div>
                      <div><strong>Reviewed:</strong> {formatDateTime(item.content_quality_reviewed_at)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={labelStyle()}>Content Review Note</label>
                      <textarea
                        value={noteValue}
                        onChange={(e) => updateContentReviewNote(item.user_id, e.target.value)}
                        placeholder="Write note about originality, quality, policy safety, or correction needed..."
                        style={{ ...textareaStyle(), minHeight: 110 }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleContentQualityReview(item.user_id, 'approved')}
                        style={{
                          minWidth: 120,
                          height: 42,
                          borderRadius: 12,
                          border: 0,
                          background: '#16a34a',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          opacity: isBusy ? 0.7 : 1,
                        }}
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleContentQualityReview(item.user_id, 'rejected')}
                        style={{
                          minWidth: 120,
                          height: 42,
                          borderRadius: 12,
                          border: 0,
                          background: '#dc2626',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          opacity: isBusy ? 0.7 : 1,
                        }}
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleContentQualityReview(item.user_id, 'pending')}
                        style={{
                          minWidth: 120,
                          height: 42,
                          borderRadius: 12,
                          border: '1px solid #d1d5db',
                          background: '#ffffff',
                          color: '#111827',
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          opacity: isBusy ? 0.7 : 1,
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div style={cardStyle()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={sectionTitleStyle()}>Submitted Monetization Reviews</h2>
            <p style={sectionHintStyle()}>
              Review affiliate monetization submissions here, inspect the submitted code, and approve
              or reject with an admin note.
            </p>
          </div>

          <div style={badgeStyle('info')}>
            {submissions.length} Submission{submissions.length === 1 ? '' : 's'}
          </div>
        </div>

        {reviewMessage ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              background: '#ecfdf3',
              border: '1px solid #abefc6',
              color: '#027a48',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {reviewMessage}
          </div>
        ) : null}

        {reviewError ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {reviewError}
          </div>
        ) : null}

        {submissionsError ? (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {submissionsError}
          </div>
        ) : null}

        {submissionsLoading ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Loading monetization submissions...
          </div>
        ) : null}

        {!submissionsLoading && !submissions.length ? (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            No monetization submissions found.
          </div>
        ) : null}

        {!submissionsLoading && submissions.length ? (
          <div style={{ display: 'grid', gap: 18 }}>
            {submissions.map((item) => {
              const isBusy = activeSubmissionId === item.id;
              const noteValue = reviewNotes[item.id] || '';

              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 16,
                    padding: 18,
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)',
                      gap: 18,
                    }}
                  >
                    <div style={{ display: 'grid', gap: 14 }}>
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap',
                            marginBottom: 10,
                          }}
                        >
                          <div style={badgeStyle(submissionStatusTone(item.review_status))}>
                            {item.review_status || 'draft'}
                          </div>
                          <div style={badgeStyle('default')}>
                            {item.monetization_mode === 'platform'
                              ? 'Platform'
                              : 'Individual'}
                          </div>
                          {item.provider_type ? (
                            <div style={badgeStyle('info')}>{item.provider_type}</div>
                          ) : null}
                        </div>

                        <h3
                          style={{
                            margin: '0 0 8px',
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#111827',
                          }}
                        >
                          {item.affiliate?.name || 'Affiliate'}
                        </h3>

                        <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.65 }}>
                          <div><strong>Email:</strong> {item.affiliate?.email || '-'}</div>
                          <div>
                            <strong>Website:</strong>{' '}
                            {item.website?.website_name || '-'}
                            {item.website?.slug ? ` (${item.website.slug})` : ''}
                          </div>
                          <div><strong>Submitted:</strong> {formatDateTime(item.submitted_at)}</div>
                          <div><strong>Reviewed:</strong> {formatDateTime(item.reviewed_at)}</div>
                          <div><strong>Provider:</strong> {item.provider_name || '-'}</div>
                          <div><strong>Publisher ID:</strong> {item.publisher_id || '-'}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: 10,
                        }}
                      >
                        {[
                          ['Storefront Top', item.placements?.storefront_top_enabled],
                          ['Storefront Sidebar', item.placements?.storefront_sidebar_enabled],
                          ['Storefront Bottom', item.placements?.storefront_bottom_enabled],
                          ['Post Top', item.placements?.post_top_enabled],
                          ['Post Middle', item.placements?.post_middle_enabled],
                          ['Post Bottom', item.placements?.post_bottom_enabled],
                          ['Post Sidebar', item.placements?.post_sidebar_enabled],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            style={{
                              padding: 10,
                              borderRadius: 12,
                              background: '#f9fafb',
                              border: '1px solid #eef2f7',
                              fontSize: 13,
                              color: '#374151',
                              fontWeight: 700,
                            }}
                          >
                            {label}: {Number(value) ? 'On' : 'Off'}
                          </div>
                        ))}
                      </div>

                      {item.head_code ? (
                        <div>
                          <label style={labelStyle()}>Submitted Head Code</label>
                          <textarea
                            readOnly
                            value={item.head_code}
                            style={{ ...textareaStyle(), minHeight: 140, background: '#f9fafb' }}
                          />
                        </div>
                      ) : null}

                      {item.notes ? (
                        <div>
                          <label style={labelStyle()}>Affiliate Note</label>
                          <div
                            style={{
                              padding: 12,
                              borderRadius: 12,
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              fontSize: 14,
                              color: '#374151',
                              lineHeight: 1.6,
                            }}
                          >
                            {item.notes}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                      <div
                        style={{
                          padding: 14,
                          borderRadius: 14,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#111827',
                            marginBottom: 8,
                          }}
                        >
                          Review Status
                        </div>
                        <div style={{ fontSize: 14, color: '#475467', lineHeight: 1.6 }}>
                          Current status: <strong>{item.review_status || 'draft'}</strong>
                        </div>
                        {item.admin_review_note ? (
                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 14,
                              color: '#475467',
                              lineHeight: 1.6,
                            }}
                          >
                            <strong>Last admin note:</strong> {item.admin_review_note}
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <label style={labelStyle()}>Admin Review Note</label>
                        <textarea
                          value={noteValue}
                          onChange={(e) => updateReviewNote(item.id, e.target.value)}
                          placeholder="Write a reason for approval, correction, or rejection..."
                          style={{ ...textareaStyle(), minHeight: 130 }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReviewSubmission(item.id, 'approved')}
                          style={{
                            minWidth: 140,
                            height: 44,
                            borderRadius: 12,
                            border: 0,
                            background: isBusy && reviewingAction === 'approved' ? '#86efac' : '#16a34a',
                            color: '#ffffff',
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            opacity: isBusy && reviewingAction !== 'approved' ? 0.7 : 1,
                          }}
                        >
                          {isBusy && reviewingAction === 'approved' ? 'Approving...' : 'Approve'}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReviewSubmission(item.id, 'rejected')}
                          style={{
                            minWidth: 140,
                            height: 44,
                            borderRadius: 12,
                            border: 0,
                            background: isBusy && reviewingAction === 'rejected' ? '#fca5a5' : '#dc2626',
                            color: '#ffffff',
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            opacity: isBusy && reviewingAction !== 'rejected' ? 0.7 : 1,
                          }}
                        >
                          {isBusy && reviewingAction === 'rejected' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSaveCodeBox} style={cardStyle()}>
        <h2 style={sectionTitleStyle()}>Ad Code Box</h2>
        <p style={sectionHintStyle()}>
          Save platform ad code or provider-specific snippets here, then apply them with your selected
          filter.
        </p>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle()}>Provider name</label>
            <input
              style={inputStyle()}
              value={codeForm.provider_name}
              onChange={(e) => updateCodeForm('provider_name', e.target.value)}
              placeholder="Google AdSense"
            />
          </div>

          <div>
            <label style={labelStyle()}>Provider type</label>
            <select
              style={selectStyle()}
              value={codeForm.provider_type}
              onChange={(e) => updateCodeForm('provider_type', e.target.value)}
            >
              <option value="adsense">AdSense</option>
              <option value="generic">Generic network</option>
              <option value="manual">Manual / direct ad</option>
            </select>
          </div>

          <div>
            <label style={labelStyle()}>Placement scope</label>
            <select
              style={selectStyle()}
              value={codeForm.placement_scope}
              onChange={(e) => updateCodeForm('placement_scope', e.target.value)}
            >
              <option value="platform">Platform ads</option>
              <option value="individual">Individual ads</option>
              <option value="mixed">Mixed / custom</option>
            </select>
          </div>

          <div>
            <label style={labelStyle()}>Target mode</label>
            <select
              style={selectStyle()}
              value={codeForm.target_mode}
              onChange={(e) => updateCodeForm('target_mode', e.target.value)}
            >
              <option value="platform">Apply to platform monetization</option>
              <option value="individual">Apply to individual monetization</option>
              <option value="all">All monetization modes</option>
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 18,
          }}
        >
          <div>
            <label style={labelStyle()}>Head code</label>
            <textarea
              style={textareaStyle()}
              value={codeForm.head_code}
              onChange={(e) => updateCodeForm('head_code', e.target.value)}
              placeholder="<script>...</script>"
            />
          </div>

          <div>
            <label style={labelStyle()}>Body / placement code</label>
            <textarea
              style={textareaStyle()}
              value={codeForm.body_code}
              onChange={(e) => updateCodeForm('body_code', e.target.value)}
              placeholder="<ins class='adsbygoogle'>...</ins>"
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <label style={labelStyle()}>Admin notes</label>
          <textarea
            style={{ ...textareaStyle(), minHeight: 110 }}
            value={codeForm.notes}
            onChange={(e) => updateCodeForm('notes', e.target.value)}
            placeholder="Describe where this code should run, who can use it, or what it is meant for."
          />
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
            disabled={savingCodeBox}
            style={{
              minWidth: 170,
              height: 46,
              borderRadius: 12,
              border: 0,
              background: savingCodeBox ? '#9ca3af' : '#111827',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 800,
              cursor: savingCodeBox ? 'not-allowed' : 'pointer',
            }}
          >
            {savingCodeBox ? 'Saving...' : 'Save Code Box'}
          </button>

          <button
            type="button"
            onClick={handleApplyWithFilter}
            disabled={applyingFilter}
            style={{
              minWidth: 170,
              height: 46,
              borderRadius: 12,
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#111827',
              fontSize: 14,
              fontWeight: 800,
              cursor: applyingFilter ? 'not-allowed' : 'pointer',
              opacity: applyingFilter ? 0.7 : 1,
            }}
          >
            {applyingFilter ? 'Applying...' : 'Apply With Filter'}
          </button>

          {codeBoxMessage ? (
            <div style={{ fontSize: 14, color: '#15803d', fontWeight: 700 }}>
              {codeBoxMessage}
            </div>
          ) : null}

          {codeBoxError ? (
            <div style={{ fontSize: 14, color: '#b91c1c', fontWeight: 700 }}>
              {codeBoxError}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}