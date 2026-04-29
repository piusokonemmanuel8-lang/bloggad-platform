import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  };
}

function badgeStyle(type = 'default') {
  const map = {
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
    danger: {
      background: '#fef3f2',
      color: '#b42318',
      border: '#fecdca',
    },
    info: {
      background: '#eff8ff',
      color: '#175cd3',
      border: '#b2ddff',
    },
    default: {
      background: '#f9fafb',
      color: '#344054',
      border: '#eaecf0',
    },
  };

  const selected = map[type] || map.default;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: `1px solid ${selected.border}`,
    background: selected.background,
    color: selected.color,
    whiteSpace: 'nowrap',
  };
}

function progressBarStyle(percent) {
  return {
    width: '100%',
    height: 12,
    borderRadius: 999,
    background: '#eef2f7',
    overflow: 'hidden',
    position: 'relative',
    marginTop: 10,
    marginBottom: 8,
    boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.06)',
  };
}

function toBool(value) {
  return Number(value || 0) === 1;
}

function boolToNumber(value) {
  return value ? 1 : 0;
}

function ToggleRow({ title, description, checked, onChange, disabled }) {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 18,
        padding: 16,
        background: checked ? '#f0fdf4' : '#ffffff',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 14,
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>{title}</div>
        <div style={{ marginTop: 6, color: '#6b7280', fontSize: 14, lineHeight: 1.55 }}>
          {description}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          width: 62,
          height: 34,
          borderRadius: 999,
          border: checked ? '1px solid #16a34a' : '1px solid #d1d5db',
          background: checked ? '#16a34a' : '#e5e7eb',
          padding: 3,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.7 : 1,
          transition: '0.2s ease',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#ffffff',
            transform: checked ? 'translateX(28px)' : 'translateX(0)',
            transition: '0.2s ease',
            boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
          }}
        />
      </button>
    </div>
  );
}

function buildDefaultRequirements() {
  return [
    {
      key: 'subscription',
      title: 'Active paid subscription',
      description: 'Admin requires an active paid plan before BlogPulse earnings can be approved.',
      current: 0,
      required: 1,
      unit: 'check',
      status: 'in_progress',
      remaining: 1,
      percent: 0,
    },
    {
      key: 'storefront',
      title: 'Active storefront',
      description: 'Your storefront must be active and ready to receive traffic.',
      current: 0,
      required: 1,
      unit: 'check',
      status: 'in_progress',
      remaining: 1,
      percent: 0,
    },
    {
      key: 'policy_pages',
      title: 'Required pages completed',
      description: 'Admin controls how many required pages must be available.',
      current: 0,
      required: 4,
      unit: 'pages',
      status: 'in_progress',
      remaining: 4,
      percent: 0,
    },
    {
      key: 'published_posts',
      title: 'Published posts target',
      description: 'Admin controls the minimum number of published posts required.',
      current: 0,
      required: 15,
      unit: 'posts',
      status: 'in_progress',
      remaining: 15,
      percent: 0,
    },
    {
      key: 'valid_views',
      title: 'Valid page views target',
      description: 'Admin controls the minimum valid traffic required before approval.',
      current: 0,
      required: 1000,
      unit: 'views',
      status: 'in_progress',
      remaining: 1000,
      percent: 0,
    },
    {
      key: 'content_quality',
      title: 'Original content review',
      description: 'Admin must approve your content quality before earnings become active.',
      current: 0,
      required: 1,
      unit: 'review',
      status: 'in_progress',
      remaining: 1,
      percent: 0,
    },
  ];
}

export default function AffiliateMonetizationEligibilityPage() {
  const [settings, setSettings] = useState(null);
  const [website, setWebsite] = useState(null);
  const [eligibilityProgress, setEligibilityProgress] = useState(null);
  const [templateAds, setTemplateAds] = useState({
    post_template_ads_enabled: 0,
    website_ads_enabled: 0,
    product_ads_enabled: 0,
    revenue_share_percent: 60,
    platform_share_percent: 40,
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const requirements = useMemo(() => {
    return eligibilityProgress?.requirements?.length
      ? eligibilityProgress.requirements
      : buildDefaultRequirements();
  }, [eligibilityProgress]);

  const summary = useMemo(() => {
    if (eligibilityProgress?.summary) {
      return {
        total: Number(eligibilityProgress.summary.total || 0),
        passed: Number(eligibilityProgress.summary.passed || 0),
        percent: Number(eligibilityProgress.summary.percent || 0),
        isEligible: !!eligibilityProgress.summary.is_eligible,
      };
    }

    const total = requirements.length;
    const passed = requirements.filter((item) => item.status === 'passed' || Number(item.current || 0) >= Number(item.required || 0)).length;
    const percent = total ? Math.round((passed / total) * 100) : 0;

    return {
      total,
      passed,
      percent,
      isEligible: passed === total,
    };
  }, [eligibilityProgress, requirements]);

  const applicationStatus = settings?.review_status || 'not_applied';
  const isApproved = applicationStatus === 'approved';

  const revenueMessage =
    eligibilityProgress?.publisher_revenue_message ||
    `Earn up to ${templateAds.revenue_share_percent || 60}% ad revenue from eligible sponsored placements.`;

  function getStatusBadge(status) {
    if (status === 'passed') return { label: 'Passed', tone: 'success' };
    if (status === 'pending') return { label: 'Pending Review', tone: 'info' };
    if (status === 'failed') return { label: 'Failed', tone: 'danger' };
    return { label: 'In Progress', tone: 'warning' };
  }

  function getApplicationBadge(status) {
    if (status === 'approved') return { label: 'Approved', tone: 'success' };
    if (status === 'pending') return { label: 'Pending Admin Review', tone: 'info' };
    if (status === 'rejected') return { label: 'Rejected', tone: 'danger' };
    if (status === 'draft') return { label: 'Draft', tone: 'warning' };
    return { label: 'Not Applied Yet', tone: 'warning' };
  }

  const appBadge = getApplicationBadge(applicationStatus);

  async function loadSettings() {
    try {
      setLoading(true);
      setNotice('');
      setError('');

      const { data } = await api.get('/affiliate/monetization/settings');

      const nextSettings = data?.settings || {};
      const nextTemplateAds = nextSettings?.template_ads || {};
      const nextProgress = data?.eligibility_progress || null;

      setSettings(nextSettings);
      setWebsite(data?.website || null);
      setEligibilityProgress(nextProgress);
      setTemplateAds({
        post_template_ads_enabled: Number(nextTemplateAds.post_template_ads_enabled || 0),
        website_ads_enabled: Number(nextTemplateAds.website_ads_enabled || 0),
        product_ads_enabled: Number(nextTemplateAds.product_ads_enabled || 0),
        revenue_share_percent: Number(nextTemplateAds.revenue_share_percent || 60),
        platform_share_percent: Number(nextTemplateAds.platform_share_percent || 40),
        status: nextTemplateAds.status || 'active',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load monetization settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateTemplateAd(key, value) {
    setTemplateAds((current) => ({
      ...current,
      [key]: boolToNumber(value),
    }));
  }

  async function saveTemplateAds() {
    try {
      setSaving(true);
      setNotice('');
      setError('');

      const payload = {
        ...(settings || {}),
        template_ads: {
          ...templateAds,
          ads_enabled: templateAds.status === 'active' ? 1 : 0,
        },
      };

      const { data } = await api.post('/affiliate/monetization/settings', payload);

      const nextSettings = data?.settings || {};
      const nextTemplateAds = nextSettings?.template_ads || {};
      const nextProgress = data?.eligibility_progress || eligibilityProgress;

      setSettings(nextSettings);
      setWebsite(data?.website || website);
      setEligibilityProgress(nextProgress);
      setTemplateAds({
        post_template_ads_enabled: Number(nextTemplateAds.post_template_ads_enabled || 0),
        website_ads_enabled: Number(nextTemplateAds.website_ads_enabled || 0),
        product_ads_enabled: Number(nextTemplateAds.product_ads_enabled || 0),
        revenue_share_percent: Number(nextTemplateAds.revenue_share_percent || 60),
        platform_share_percent: Number(nextTemplateAds.platform_share_percent || 40),
        status: nextTemplateAds.status || 'active',
      });

      setNotice('Publisher ad settings saved successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save publisher ad settings.');
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview() {
    try {
      setSaving(true);
      setNotice('');
      setError('');

      const { data } = await api.post('/affiliate/monetization/submit');

      setSettings(data?.settings || settings);
      setEligibilityProgress(data?.eligibility_progress || eligibilityProgress);
      setNotice(data?.message || 'Your monetization setup has been submitted for review.');
    } catch (err) {
      const responseData = err?.response?.data || {};
      setError(responseData.message || 'Failed to submit monetization setup.');

      if (responseData.eligibility_progress) {
        setEligibilityProgress(responseData.eligibility_progress);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ ...cardStyle(), color: '#111827', fontWeight: 900 }}>
        Loading monetization settings...
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <style>{`
        .blogpulse-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 24px;
          align-items: start;
        }

        .blogpulse-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
          gap: 18px;
          align-items: center;
        }

        .blogpulse-metric-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .blogpulse-requirement-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .publisher-ad-toggle-grid {
          display: grid;
          gap: 14px;
        }

        @media (max-width: 1000px) {
          .blogpulse-main-grid,
          .blogpulse-hero-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .blogpulse-metric-grid,
          .blogpulse-requirement-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {(notice || error) && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 16,
            border: error ? '1px solid #fca5a5' : '1px solid #86efac',
            background: error ? '#fef2f2' : '#ecfdf5',
            color: error ? '#b91c1c' : '#166534',
            fontWeight: 800,
          }}
        >
          {error || notice}
        </div>
      )}

      <section
        style={{
          ...cardStyle(),
          background:
            'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div className="blogpulse-hero-grid">
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
              BlogPulse Eligibility
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 32,
                lineHeight: 1.15,
                fontWeight: 900,
              }}
            >
              Track monetization readiness and unlock publisher ad earnings
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
              Your requirements are controlled by the marketplace settings. Complete the current
              targets, activate sponsored placements, and prepare your website to earn from approved
              BlogPulse ad activity.
            </p>
          </div>

          <div className="blogpulse-metric-grid">
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Completed Requirements
              </div>
              <div style={{ fontSize: 26, fontWeight: 900 }}>
                {summary.passed}/{summary.total}
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
                Readiness
              </div>
              <div style={{ fontSize: 26, fontWeight: 900 }}>{summary.percent}%</div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
                gridColumn: '1 / -1',
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Application Status
              </div>
              <div
                style={{
                  ...badgeStyle(appBadge.tone),
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                {appBadge.label}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blogpulse-main-grid">
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={cardStyle()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
                  BlogPulse Publisher Ads
                </h2>
                <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
                  Control where sponsored placements can appear across your approved publisher areas.
                </p>
              </div>

              <div style={badgeStyle(isApproved ? 'success' : 'warning')}>
                {isApproved ? 'Monetized' : 'Approval Required'}
              </div>
            </div>

            <div
              style={{
                borderRadius: 20,
                padding: 20,
                background:
                  'linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #f8fafc 100%)',
                border: '1px solid #bbf7d0',
                marginBottom: 16,
                boxShadow: '0 14px 30px rgba(22, 163, 74, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 30,
                  padding: '0 12px',
                  borderRadius: 999,
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  color: '#166534',
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 12,
                }}
              >
                Revenue Opportunity
              </div>

              <div
                style={{
                  color: '#111827',
                  fontSize: 28,
                  fontWeight: 950,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                }}
              >
                {revenueMessage}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#475569',
                  fontSize: 15,
                  lineHeight: 1.75,
                  fontWeight: 700,
                }}
              >
                Turn on publisher ads to unlock sponsored placements across your posts, website,
                and product areas. Once your BlogPulse monetization is approved, eligible ad
                activity can start generating revenue automatically while BlogPulse handles
                tracking, billing, and reporting.
              </div>
            </div>

            {!isApproved ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: '#fffaeb',
                  border: '1px solid #fedf89',
                  color: '#b54708',
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.55,
                  marginBottom: 16,
                }}
              >
                You can set your publisher ad preferences now. Earnings become active only after
                your BlogPulse monetization is approved.
              </div>
            ) : null}

            <div className="publisher-ad-toggle-grid">
              <ToggleRow
                title="Post template ads"
                description="Show sponsored placements inside your blog post templates and earn from eligible ad activity."
                checked={toBool(templateAds.post_template_ads_enabled)}
                onChange={(value) => updateTemplateAd('post_template_ads_enabled', value)}
                disabled={saving}
              />

              <ToggleRow
                title="Website ads"
                description="Allow sponsored website placements across approved areas of your storefront."
                checked={toBool(templateAds.website_ads_enabled)}
                onChange={(value) => updateTemplateAd('website_ads_enabled', value)}
                disabled={saving}
              />

              <ToggleRow
                title="Product ads"
                description="Enable sponsored product placements in eligible product sections."
                checked={toBool(templateAds.product_ads_enabled)}
                onChange={(value) => updateTemplateAd('product_ads_enabled', value)}
                disabled={saving}
              />
            </div>

            <button
              type="button"
              onClick={saveTemplateAds}
              disabled={saving}
              style={{
                marginTop: 18,
                width: '100%',
                minHeight: 50,
                borderRadius: 14,
                border: 0,
                background: '#111827',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 900,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Publisher Ad Settings'}
            </button>
          </div>

          <div style={{ ...cardStyle(), display: 'grid', gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
                Requirement Breakdown
              </h2>
              <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
                These targets come from the marketplace monetization settings set by admin.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {requirements.map((item) => {
                const percent =
                  item.percent !== undefined
                    ? Number(item.percent || 0)
                    : item.required > 0
                    ? Math.round((Number(item.current || 0) / Number(item.required || 1)) * 100)
                    : 100;

                const remaining =
                  item.remaining !== undefined
                    ? Number(item.remaining || 0)
                    : Math.max(Number(item.required || 0) - Number(item.current || 0), 0);

                const badge = getStatusBadge(item.status);

                return (
                  <div
                    key={item.key}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 18,
                      padding: 18,
                      background: '#ffffff',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 14,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
                          {item.title}
                        </div>
                        <div
                          style={{
                            marginTop: 6,
                            color: '#6b7280',
                            fontSize: 14,
                            lineHeight: 1.55,
                          }}
                        >
                          {item.description}
                        </div>
                      </div>

                      <div style={badgeStyle(badge.tone)}>{badge.label}</div>
                    </div>

                    <div style={progressBarStyle(percent)}>
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(percent, 100))}%`,
                          height: '100%',
                          borderRadius: 999,
                          background:
                            'linear-gradient(90deg, #111827 0%, #2563eb 55%, #7c3aed 100%)',
                          transition: 'width 0.25s ease',
                        }}
                      />
                    </div>

                    <div className="blogpulse-requirement-stats">
                      <div
                        style={{
                          background: '#f9fafb',
                          border: '1px solid #eef2f7',
                          borderRadius: 14,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Current</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>
                          {item.current}
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#f9fafb',
                          border: '1px solid #eef2f7',
                          borderRadius: 14,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Required</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>
                          {item.required}
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#f9fafb',
                          border: '1px solid #eef2f7',
                          borderRadius: 14,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Remaining</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>
                          {remaining}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Readiness Summary
            </h3>

            <div
              style={{
                marginTop: 18,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `conic-gradient(#111827 0% ${summary.percent}%, #e5e7eb ${summary.percent}% 100%)`,
                display: 'grid',
                placeItems: 'center',
                marginInline: 'auto',
              }}
            >
              <div
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: '#111827' }}>
                    {summary.percent}%
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 700 }}>
                    Ready
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 14,
                borderRadius: 16,
                background: summary.isEligible ? '#ecfdf3' : '#fffaeb',
                border: summary.isEligible ? '1px solid #abefc6' : '1px solid #fedf89',
                color: summary.isEligible ? '#027a48' : '#b54708',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.55,
              }}
            >
              {summary.isEligible
                ? 'All current marketplace requirements are complete. You can now apply for BlogPulse monetization.'
                : 'You have not met all current marketplace requirements yet. Complete the remaining items before applying.'}
            </div>

            <button
              type="button"
              disabled={!summary.isEligible || saving}
              onClick={submitForReview}
              style={{
                marginTop: 18,
                width: '100%',
                minHeight: 48,
                borderRadius: 14,
                border: 0,
                background: summary.isEligible ? '#111827' : '#d1d5db',
                color: summary.isEligible ? '#ffffff' : '#6b7280',
                fontSize: 14,
                fontWeight: 900,
                cursor: summary.isEligible && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Please wait...' : 'Apply for Monetization'}
            </button>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Website connected
            </h3>

            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: '#f9fafb',
                  border: '1px solid #eef2f7',
                }}
              >
                <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                  Website
                </div>
                <div style={{ color: '#111827', fontSize: 16, fontWeight: 900 }}>
                  {website?.website_name || 'No website found'}
                </div>
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: '#f9fafb',
                  border: '1px solid #eef2f7',
                }}
              >
                <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                  Slug
                </div>
                <div style={{ color: '#111827', fontSize: 16, fontWeight: 900 }}>
                  {website?.slug || '-'}
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              What happens next
            </h3>

            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {[
                'Complete the current marketplace requirements set by admin.',
                'Apply for BlogPulse monetization when your readiness reaches 100%.',
                'Admin reviews your account, storefront, traffic, and content quality.',
                'When approved, eligible sponsored activity can start generating publisher earnings.',
                'If publisher ads are turned off, sponsored placements will not show on your templates.',
              ].map((text, index) => (
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
        </div>
      </section>
    </div>
  );
}