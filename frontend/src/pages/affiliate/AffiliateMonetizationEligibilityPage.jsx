import { useMemo } from 'react';

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
    '--fill-width': `${Math.max(0, Math.min(100, percent))}%`,
  };
}

export default function AffiliateMonetizationEligibilityPage() {
  const requirements = useMemo(
    () => [
      {
        key: 'subscription',
        title: 'Active paid subscription',
        description: 'You must have an active paid plan. Free plans are not eligible.',
        current: 1,
        required: 1,
        unit: 'check',
        status: 'passed',
      },
      {
        key: 'storefront',
        title: 'Active storefront',
        description: 'Your storefront must be active and ready to receive traffic.',
        current: 1,
        required: 1,
        unit: 'check',
        status: 'passed',
      },
      {
        key: 'policy_pages',
        title: 'Required pages completed',
        description: 'About, Contact, Privacy Policy, and Terms should be available.',
        current: 2,
        required: 4,
        unit: 'pages',
        status: 'in_progress',
      },
      {
        key: 'published_posts',
        title: 'Published posts target',
        description: 'Build up enough original published posts before applying.',
        current: 3,
        required: 15,
        unit: 'posts',
        status: 'in_progress',
      },
      {
        key: 'valid_views',
        title: 'Valid page views target',
        description: 'Grow quality traffic. Duplicate or suspicious traffic does not count.',
        current: 127,
        required: 1000,
        unit: 'views',
        status: 'in_progress',
      },
      {
        key: 'content_quality',
        title: 'Original content review',
        description: 'Content must be original and policy-safe before approval.',
        current: 0,
        required: 1,
        unit: 'review',
        status: 'pending',
      },
    ],
    []
  );

  const summary = useMemo(() => {
    const total = requirements.length;
    const passed = requirements.filter((item) => item.current >= item.required).length;
    const percent = total ? Math.round((passed / total) * 100) : 0;
    const isEligible = passed === total;

    return { total, passed, percent, isEligible };
  }, [requirements]);

  const applicationStatus = 'not_applied';

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
    return { label: 'Not Applied Yet', tone: 'warning' };
  }

  const appBadge = getApplicationBadge(applicationStatus);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          ...cardStyle(),
          background:
            'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.3fr) minmax(280px, 0.7fr)',
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
              Track every monetization requirement before you apply
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
              This page shows every BlogPulse requirement, your live progress, what remains,
              and when your account becomes ready for monetization approval.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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
              <div style={{ ...badgeStyle(appBadge.tone), background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' }}>
                {appBadge.label}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div style={{ ...cardStyle(), display: 'grid', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
              Requirement Breakdown
            </h2>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
              Each requirement updates live. When all items pass, the application button becomes active.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {requirements.map((item) => {
              const percent = item.required > 0 ? Math.round((item.current / item.required) * 100) : 0;
              const remaining = Math.max(item.required - item.current, 0);
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

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 12,
                      marginTop: 12,
                    }}
                  >
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
                ? 'All requirements are complete. You can now apply for BlogPulse monetization.'
                : 'You have not met all requirements yet. Keep completing the remaining items below.'}
            </div>

            <button
              type="button"
              disabled={!summary.isEligible}
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
                cursor: summary.isEligible ? 'pointer' : 'not-allowed',
              }}
            >
              Apply for Monetization
            </button>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              What happens next
            </h3>

            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {[
                'Meet all monetization requirements.',
                'Click Apply for Monetization.',
                'Admin reviews your account and content quality.',
                'Once approved, BlogPulse Analytics and BlogPulse Wallet become active.',
                'If you want to use your own ad account instead, use My Ads without waiting for BlogPulse approval.',
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