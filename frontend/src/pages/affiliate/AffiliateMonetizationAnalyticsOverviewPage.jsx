import { useState } from 'react';
import { useLocation } from 'react-router-dom';

function legacyCardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  };
}

function legacyBadgeStyle(type = 'default') {
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

function LegacyStatCard({ label, value, helper }) {
  return (
    <div style={legacyCardStyle()}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', lineHeight: 1.1 }}>
        {value}
      </div>
      {helper ? (
        <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
          {helper}
        </div>
      ) : null}
    </div>
  );
}

function WriterMetricCard({ label, helper }) {
  return (
    <article className="writer-monetization-metric-card">
      <span>{label}</span>
      <strong>-</strong>
      <small>{helper}</small>
    </article>
  );
}

export default function AffiliateMonetizationAnalyticsOverviewPage() {
  const location = useLocation();
  const [mode, setMode] = useState('individual');

  const isWriterRoute = location.pathname === '/writer/monetization/analytics';
  const isPlatformMode = mode === 'platform';

  if (isWriterRoute) {
    return (
      <div className="writer-monetization-analytics-page">
        <style>{writerStyles}</style>

        <div className="writer-monetization-mobile-title">Monetization Analytics</div>

        <section className="writer-monetization-mode-card">
          <div className="writer-monetization-mode-label">Analytics mode</div>

          <div className="writer-monetization-mode-row">
            <div className="writer-monetization-mode-buttons">
              <button
                type="button"
                className={`writer-monetization-mode-button ${!isPlatformMode ? 'active' : ''}`}
                onClick={() => setMode('individual')}
              >
                Individual
              </button>

              <button
                type="button"
                className={`writer-monetization-mode-button ${isPlatformMode ? 'active' : ''}`}
                onClick={() => setMode('platform')}
              >
                Platform
              </button>
            </div>

            <span className="writer-monetization-mode-helper">
              {isPlatformMode ? 'BlogPulse performance and earnings' : 'Own-ad monetization performance'}
            </span>

            <span
              className={`writer-monetization-mode-status ${
                isPlatformMode ? 'platform' : 'individual'
              }`}
            >
              {isPlatformMode ? 'Platform monetization' : 'Individual monetization'}
            </span>
          </div>
        </section>

        <section className="writer-monetization-metrics">
          <WriterMetricCard label="Total Views" helper="Tracked views" />
          <WriterMetricCard label="Unique Visitors" helper="Audience summary" />
          <WriterMetricCard label="Valid Views" helper="Qualified views" />
          <WriterMetricCard
            label={isPlatformMode ? 'Estimated Earnings' : 'Monetization Type'}
            helper={isPlatformMode ? 'Platform earnings summary' : 'Provider handles payments'}
          />
        </section>

        <section className="writer-monetization-content-grid">
          <article className="writer-monetization-trend-card">
            <header>
              <strong>Performance Trend</strong>
              <span>
                {isPlatformMode
                  ? 'Platform activity will appear when analytics data is available.'
                  : 'Activity will appear when analytics data is available.'}
              </span>
            </header>

            <div className="writer-monetization-chart-placeholder">
              <span>Your chart will appear here</span>

              <div className="writer-monetization-chart-line">
                <i className="dot dot-one" />
                <i className="dot dot-two" />
                <i className="dot dot-three" />
                <i className="dot dot-four" />
              </div>
            </div>
          </article>

          <aside className="writer-monetization-side-stack">
            <article className="writer-monetization-guide-card writer-monetization-see-card">
              <strong>What You Will See</strong>
              <div className="writer-monetization-guide-list">
                <span>Views and visitor summary</span>
                <span>Qualified activity by mode</span>
                <span>Earnings when available</span>
                <span>Personal ad performance</span>
              </div>
            </article>

            <article className="writer-monetization-guide-card">
              <strong>Mode Guide</strong>
              <div className="writer-monetization-mode-guide-copy">
                <span>
                  <b>Individual</b>
                  Your own ad account performance.
                </span>
                <span>
                  <b>Platform</b>
                  BlogPulse performance and earnings.
                </span>
              </div>
            </article>
          </aside>
        </section>

        <section className="writer-monetization-data-notice">
          <strong>
            {isPlatformMode
              ? 'Analytics data is not connected yet'
              : 'Analytics data is not connected yet'}
          </strong>
          <span>
            The page currently preserves mode switching and placeholders. Live metrics can plug into
            these cards without changing the layout.
          </span>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          ...legacyCardStyle(),
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
              <div style={legacyBadgeStyle(isPlatformMode ? 'info' : 'success')}>
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

      <section style={legacyCardStyle()}>
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
              onChange={(event) => setMode(event.target.value)}
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
        <LegacyStatCard label="Total Views" value="-" helper="Your tracked views will appear here." />
        <LegacyStatCard
          label="Unique Visitors"
          value="-"
          helper="Your audience summary will appear here."
        />
        <LegacyStatCard label="Valid Views" value="-" helper="Qualified views will appear here." />
        <LegacyStatCard
          label={isPlatformMode ? 'Estimated Earnings' : 'Monetization Type'}
          value="-"
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
        <div style={legacyCardStyle()}>
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
                Once your monetization activity is available, this section will display your trend in
                a clear line chart.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          <div style={legacyCardStyle()}>
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

          <div style={legacyCardStyle()}>
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

const writerStyles = `
  * {
    box-sizing: border-box;
  }

  .writer-monetization-analytics-page {
    width: 100%;
    min-width: 0;
    color: #161a20;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-monetization-analytics-page button {
    font: inherit;
  }

  .writer-monetization-mobile-title {
    display: none;
  }

  .writer-monetization-mode-card,
  .writer-monetization-metric-card,
  .writer-monetization-trend-card,
  .writer-monetization-guide-card,
  .writer-monetization-data-notice {
    background: #ffffff;
    border: 1px solid #e3e6ea;
    box-shadow: none;
  }

  .writer-monetization-mode-card {
    min-height: 68px;
    margin-bottom: 12px;
    padding: 10px 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 7px;
  }

  .writer-monetization-mode-label {
    color: #68707c;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-monetization-mode-row {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .writer-monetization-mode-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-monetization-mode-button {
    min-width: 88px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid #e3e6ea;
    border-radius: 999px;
    background: #f7f8fa;
    color: #68707c;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-monetization-mode-button.active {
    border-color: #1e2329;
    background: #1e2329;
    color: #ffffff;
  }

  .writer-monetization-mode-helper {
    min-width: 0;
    flex: 1;
    color: #68707c;
    font-size: 9px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .writer-monetization-mode-status {
    flex: 0 0 auto;
    min-height: 28px;
    padding: 0 11px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-monetization-mode-status.individual {
    border: 1px solid #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-monetization-mode-status.platform {
    border: 1px solid #b2ddff;
    background: #eff8ff;
    color: #175cd3;
  }

  .writer-monetization-metrics {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-monetization-metric-card {
    min-width: 0;
    height: 92px;
    padding: 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 6px;
  }

  .writer-monetization-metric-card > span {
    color: #68707c;
    font-size: 10px;
    line-height: 1.2;
    font-weight: 600;
  }

  .writer-monetization-metric-card > strong {
    color: #161a20;
    font-size: 22px;
    line-height: 1;
    font-weight: 700;
  }

  .writer-monetization-metric-card > small {
    margin-top: auto;
    color: #8a929c;
    font-size: 8px;
    line-height: 1.3;
    font-weight: 400;
  }

  .writer-monetization-content-grid {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: minmax(0, 2.08fr) minmax(300px, 1fr);
    gap: 12px;
    align-items: stretch;
  }

  .writer-monetization-trend-card {
    min-width: 0;
    min-height: 380px;
    padding: 14px;
    border-radius: 12px;
  }

  .writer-monetization-trend-card > header {
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .writer-monetization-trend-card > header > strong,
  .writer-monetization-guide-card > strong,
  .writer-monetization-data-notice > strong {
    color: #161a20;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 700;
  }

  .writer-monetization-trend-card > header > span {
    color: #68707c;
    font-size: 9px;
    line-height: 1.35;
  }

  .writer-monetization-chart-placeholder {
    position: relative;
    width: 100%;
    height: 290px;
    overflow: hidden;
    border: 1px solid #e3e6ea;
    border-radius: 10px;
    background: #f7f8fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .writer-monetization-chart-placeholder > span {
    position: relative;
    z-index: 2;
    color: #6d7580;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-monetization-chart-line {
    position: absolute;
    left: 7%;
    right: 7%;
    top: 64%;
    height: 1px;
    background: #cbd2da;
  }

  .writer-monetization-chart-line .dot {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #b7bec8;
  }

  .writer-monetization-chart-line .dot-one {
    left: 8%;
    top: -16px;
  }

  .writer-monetization-chart-line .dot-two {
    left: 34%;
    top: -47px;
  }

  .writer-monetization-chart-line .dot-three {
    left: 61%;
    top: -31px;
  }

  .writer-monetization-chart-line .dot-four {
    left: 85%;
    top: -63px;
  }

  .writer-monetization-side-stack {
    min-width: 0;
    display: grid;
    grid-template-rows: 1fr 1.04fr;
    gap: 12px;
  }

  .writer-monetization-guide-card {
    min-width: 0;
    padding: 14px;
    border-radius: 12px;
  }

  .writer-monetization-guide-list {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .writer-monetization-guide-list > span {
    min-height: 24px;
    color: #68707c;
    font-size: 9px;
    line-height: 24px;
  }

  .writer-monetization-mode-guide-copy {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .writer-monetization-mode-guide-copy > span {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #68707c;
    font-size: 9px;
    line-height: 1.4;
  }

  .writer-monetization-mode-guide-copy b {
    color: #68707c;
    font-size: 9px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-monetization-data-notice {
    min-height: 72px;
    padding: 13px 14px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
  }

  .writer-monetization-data-notice > span {
    color: #68707c;
    font-size: 9px;
    line-height: 1.4;
  }

  @media (min-width: 768px) {
    .writer-monetization-mode-label {
      font-size: 12px;
    }

    .writer-monetization-mode-button {
      font-size: 11px;
    }

    .writer-monetization-mode-helper {
      font-size: 11px;
    }

    .writer-monetization-mode-status {
      font-size: 10px;
    }

    .writer-monetization-metric-card > span {
      font-size: 12px;
    }

    .writer-monetization-metric-card > small {
      font-size: 10px;
      line-height: 1.4;
    }

    .writer-monetization-trend-card > header > strong,
    .writer-monetization-guide-card > strong {
      font-size: 14px;
    }

    .writer-monetization-trend-card > header > span {
      font-size: 11px;
      line-height: 1.45;
    }

    .writer-monetization-chart-placeholder > span {
      font-size: 13px;
    }

    .writer-monetization-guide-list > span {
      min-height: 26px;
      font-size: 11px;
      line-height: 26px;
    }

    .writer-monetization-mode-guide-copy > span,
    .writer-monetization-mode-guide-copy b {
      font-size: 11px;
      line-height: 1.5;
    }

    .writer-monetization-data-notice > strong {
      font-size: 13px;
    }

    .writer-monetization-data-notice > span {
      font-size: 10px;
      line-height: 1.5;
    }
  }
  @media (max-width: 900px) {
    .writer-monetization-content-grid {
      grid-template-columns: minmax(0, 1.55fr) minmax(250px, 1fr);
    }
  }

  @media (max-width: 767px) {
    .writer-monetization-mobile-title {
      min-height: 46px;
      margin-bottom: 10px;
      padding: 0 12px;
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

    .writer-monetization-mode-card {
      min-height: 82px;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 10px;
      gap: 10px;
    }

    .writer-monetization-mode-label {
      font-size: 9px;
    }

    .writer-monetization-mode-row {
      gap: 10px;
    }

    .writer-monetization-mode-buttons {
      gap: 8px;
      flex: 0 0 auto;
    }

    .writer-monetization-mode-button {
      min-width: 88px;
      height: 28px;
      padding: 0 10px;
      font-size: 10px;
    }

    .writer-monetization-mode-helper {
      font-size: 8px;
    }

    .writer-monetization-mode-status {
      display: none;
    }

    .writer-monetization-metrics {
      margin-bottom: 10px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .writer-monetization-metric-card {
      height: 92px;
      padding: 14px;
      border-radius: 12px;
    }

    .writer-monetization-content-grid {
      margin-bottom: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .writer-monetization-trend-card {
      min-height: 208px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-monetization-trend-card > header {
      margin-bottom: 10px;
      gap: 4px;
    }

    .writer-monetization-trend-card > header > strong,
    .writer-monetization-guide-card > strong {
      font-size: 11px;
    }

    .writer-monetization-trend-card > header > span {
      font-size: 8px;
    }

    .writer-monetization-chart-placeholder {
      height: 144px;
      border-radius: 8px;
    }

    .writer-monetization-chart-placeholder > span {
      font-size: 10px;
    }

    .writer-monetization-chart-line {
      display: none;
    }

    .writer-monetization-side-stack {
      display: block;
    }

    .writer-monetization-see-card {
      display: none;
    }

    .writer-monetization-guide-card {
      min-height: 106px;
      padding: 10px;
      border-radius: 10px;
    }

    .writer-monetization-mode-guide-copy {
      margin-top: 10px;
      gap: 5px;
    }

    .writer-monetization-mode-guide-copy > span {
      display: block;
      font-size: 8px;
      line-height: 18px;
    }

    .writer-monetization-mode-guide-copy b {
      display: inline;
      margin-right: 3px;
      font-size: 8px;
    }

    .writer-monetization-data-notice {
      min-height: 80px;
      padding: 12px 10px;
      border-radius: 10px;
      gap: 6px;
    }

    .writer-monetization-data-notice > strong {
      font-size: 10px;
    }

    .writer-monetization-data-notice > span {
      font-size: 8px;
      line-height: 1.4;
    }
  }

  @media (max-width: 390px) {
    .writer-monetization-mode-row {
      gap: 8px;
    }

    .writer-monetization-mode-button {
      min-width: 86px;
    }

    .writer-monetization-mode-helper {
      min-width: 0;
    }
  }
`;