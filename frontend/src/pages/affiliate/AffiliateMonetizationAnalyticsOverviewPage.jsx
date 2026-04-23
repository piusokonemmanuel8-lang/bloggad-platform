import { useState } from 'react';

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

function StatCard({ label, value, helper }) {
  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', lineHeight: 1.1 }}>
        {value}
      </div>
      {helper ? (
        <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{helper}</div>
      ) : null}
    </div>
  );
}

export default function AffiliateMonetizationAnalyticsOverviewPage() {
  const [mode, setMode] = useState('individual');

  const isPlatformMode = mode === 'platform';

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
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
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
              Monetization Analytics
            </div>

            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
              Follow your monetization performance in one place
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
              Use this page to monitor your monetization activity. Platform monetization and
              individual monetization are shown differently so you can easily understand what applies
              to your account.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Current Mode
              </div>
              <div style={badgeStyle(isPlatformMode ? 'info' : 'success')}>
                {isPlatformMode ? 'Platform Monetization' : 'Individual Monetization'}
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
                Status
              </div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {isPlatformMode ? 'Platform Summary' : 'Individual Summary'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={cardStyle()}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            alignItems: 'end',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 8 }}>
              Analytics Mode
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{
                width: '100%',
                minHeight: 46,
                borderRadius: 14,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                padding: '0 14px',
                fontSize: 14,
                color: '#111827',
                outline: 'none',
              }}
            >
              <option value="individual">Individual monetization analytics</option>
              <option value="platform">Platform monetization analytics</option>
            </select>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: isPlatformMode ? '#eff8ff' : '#ecfdf3',
              border: isPlatformMode ? '1px solid #b2ddff' : '1px solid #abefc6',
              color: isPlatformMode ? '#175cd3' : '#027a48',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {isPlatformMode
              ? 'This area is for your BlogPulse monetization performance and earnings summary.'
              : 'This area is for the performance of ads from your own monetization account.'}
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <StatCard label="Total Views" value="—" helper="Your tracked views will appear here." />
        <StatCard label="Unique Visitors" value="—" helper="Your audience summary will appear here." />
        <StatCard label="Valid Views" value="—" helper="Qualified views will appear here." />
        <StatCard
          label={isPlatformMode ? 'Estimated Earnings' : 'Monetization Type'}
          value="—"
          helper={
            isPlatformMode
              ? 'Your platform earnings summary will appear here.'
              : 'Your own ad provider handles payments for this mode.'
          }
        />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div style={cardStyle()}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
              Performance Trend
            </h2>
            <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
              Your activity chart will appear here when your analytics data is available.
            </p>
          </div>

          <div
            style={{
              minHeight: 320,
              borderRadius: 18,
              border: '1px dashed #cbd5e1',
              background: '#f8fafc',
              padding: 24,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#111827', marginBottom: 10 }}>
                Your chart will appear here
              </div>
              <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, maxWidth: 520 }}>
                Once your monetization activity is available, this section will display your trend
                in a clear line chart.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              What You Will See Here
            </h3>
            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {[
                'Your monetization views and visitor summary.',
                'Your qualified activity based on the selected monetization mode.',
                'Your earnings summary for platform monetization when available.',
                'Your personal ad performance summary for individual monetization.',
              ].map((text) => (
                <div
                  key={text}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: '#f9fafb',
                    border: '1px solid #eef2f7',
                    color: '#374151',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Mode Guide
            </h3>
            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {[
                'Individual monetization lets you review the performance of ads from your own ad account.',
                'Platform monetization shows your BlogPulse performance and earnings summary.',
                'This page changes based on the monetization mode you choose above.',
              ].map((text) => (
                <div
                  key={text}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: '#f9fafb',
                    border: '1px solid #eef2f7',
                    color: '#374151',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}