import { useEffect, useState } from 'react';
import api from '../../api/axios';
import './SalesLandingAnalyticsSection.css';

const sectionStyle = {
  padding: 20,
  marginBottom: 20,
  border: '1px solid #dbe3ec',
  borderRadius: 14,
  background: '#ffffff',
  color: '#172333'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
  gap: 12,
  marginTop: 18
};

const cardStyle = {
  padding: 14,
  border: '1px solid #e5eaf0',
  borderRadius: 10,
  background: '#f8fafc'
};

const controlStyle = {
  padding: '9px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  background: '#ffffff',
  color: '#172333',
  maxWidth: '100%'
};

function isoDay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function rangeForDays(days) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return { from: isoDay(start), to: isoDay(end) };
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatted(value) {
  return Math.round(number(value)).toLocaleString();
}

function duration(value) {
  const seconds = Math.floor(number(value));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  if (hours > 0) return hours + 'h ' + minutes + 'm ' + remaining + 's';
  if (minutes > 0) return minutes + 'm ' + remaining + 's';
  return remaining + 's';
}

const videoTrendOptions = [
  { key: 'video_watched_seconds', label: 'Watch time', unit: 'time' },
  { key: 'visitor_sessions', label: 'Visitor sessions', unit: 'count' },
  { key: 'active_seconds', label: 'Active engagement', unit: 'time' }
];

function SalesVideoTrend({ daily, metrics, sources, days, metricKey, onMetricChange }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const selected = videoTrendOptions.find(
    (item) => item.key === metricKey
  ) || videoTrendOptions[0];

  const range = rangeForDays(days);
  const rows = new Map(
    daily.map((item) => [String(item.day).slice(0, 10), item])
  );

  const start = new Date(range.from + 'T12:00:00');
  const values = Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const day = isoDay(date);
    const row = rows.get(day) || {};
    return { day, value: number(row[selected.key]) };
  });

  const total = values.reduce((sum, item) => sum + item.value, 0);

  const width = 1000;
  const height = 278;
  const left = 48;
  const right = 18;
  const top = 18;
  const bottom = 44;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const maximum = Math.max(4, ...values.map((item) => item.value));
  const scale = Math.ceil(maximum / 4) * 4;

  const plotted = values.map((item, index) => {
    const x = left + (values.length <= 1
      ? 0
      : (index / (values.length - 1)) * plotWidth);
    const y = top + plotHeight - (item.value / scale) * plotHeight;
    return { ...item, x, y };
  });

  const line = plotted.map((point, index) =>
    (index === 0 ? 'M ' : 'L ') + point.x + ' ' + point.y
  ).join(' ');

  const bottomY = top + plotHeight;

  const area = plotted.length
    ? line + ' L ' + plotted[plotted.length - 1].x + ' ' +
      bottomY + ' L ' + plotted[0].x + ' ' + bottomY + ' Z'
    : '';

  const labelIndexes = [...new Set([
    0,
    Math.floor((days - 1) / 4),
    Math.floor((days - 1) / 2),
    Math.floor(3 * (days - 1) / 4),
    days - 1
  ])];

  const displayTotal = selected.unit === 'time'
    ? duration(total)
    : formatted(total);

  return (
    <section className="blg-video-trend" aria-label="Video performance trend">
      <div className="blg-video-trend-heading">
        <p className="blg-video-trend-eyebrow">VIDEO PERFORMANCE TREND</p>
        <p>Recorded daily video engagement for the selected sales landing page.</p>
      </div>

      <div
        className="blg-video-trend-tabs"
        role="tablist"
        aria-label="Video trend metric"
      >
        {videoTrendOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={selected.key === option.key}
            className={selected.key === option.key ? 'is-active' : ''}
            onClick={() => onMetricChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="blg-video-trend-actions">
              <button
                type="button"
                className="blg-video-summary-toggle"
                aria-expanded={summaryOpen}
                aria-controls="blg-video-summary-panel"
                onClick={() => setSummaryOpen((open) => !open)}
              >
                {summaryOpen ? 'Hide analytics' : 'Show full analytics'}
              </button>
            </div>
            <div className={summaryOpen
              ? 'blg-video-trend-layout is-summary-open'
              : 'blg-video-trend-layout'}>
        <div className="blg-video-trend-main">
      <div className="blg-video-trend-total">
        <span>Selected period</span>
        <strong>{displayTotal}</strong>
      </div>

      <div className="blg-video-trend-chart">
        <svg
          viewBox={'0 0 ' + width + ' ' + height}
          role="img"
          aria-label={'Daily ' + selected.label.toLowerCase() + ' chart'}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const tick = (scale / 4) * index;
            const y = bottomY - (tick / scale) * plotHeight;

            return (
              <g key={index}>
                <line
                  className="blg-video-trend-gridline"
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                />
                <text
                  className="blg-video-trend-axis"
                  x={left - 11}
                  y={y + 4}
                  textAnchor="end"
                >
                  {formatted(tick)}
                </text>
              </g>
            );
          })}

          {area ? (
            <path className="blg-video-trend-area" d={area} />
          ) : null}

          {line ? (
            <path className="blg-video-trend-line" d={line} />
          ) : null}

          {plotted.map((point, index) => (
            <circle
              key={point.day}
              className="blg-video-trend-point"
              cx={point.x}
              cy={point.y}
              r={days > 35 ? 2.3 : 3.2}
            >
              <title>
                {point.day + ': ' + (
                  selected.unit === 'time'
                    ? duration(point.value)
                    : formatted(point.value)
                )}
              </title>
            </circle>
          ))}

          {labelIndexes.map((index) => {
            const point = plotted[index];
            if (!point) return null;

            return (
              <text
                key={'date-' + point.day}
                className="blg-video-trend-axis"
                x={point.x}
                y={height - 12}
                textAnchor={
                  index === 0 ? 'start' :
                  index === days - 1 ? 'end' : 'middle'
                }
              >
                {point.day.slice(5)}
              </text>
            );
          })}
        </svg>
      </div>

        </div>
        {summaryOpen ? (
                <aside
                  id="blg-video-summary-panel"
                  className="blg-video-summary"
                  aria-label="Video analytics summary"
                >
          <div className="blg-video-summary-heading">
            <strong>Performance summary</strong>
            <span>Selected sales landing page</span>
          </div>

          <div className="blg-video-summary-stats">
            <div><span>Page views</span><strong>{formatted(metrics.page_views)}</strong></div>
            <div><span>Visitor sessions</span><strong>{formatted(metrics.visitor_sessions)}</strong></div>
            <div><span>Session-scoped visitors</span><strong>{formatted(metrics.session_scoped_visitors)}</strong></div>
            <div><span>Watch time</span><strong>{duration(metrics.video_watched_seconds)}</strong></div>
            <div><span>Active engagement</span><strong>{duration(metrics.active_seconds)}</strong></div>
            <div><span>Video starts</span><strong>{formatted(metrics.video_starts)}</strong></div>
            <div><span>Pay To Join clicks</span><strong>{formatted(metrics.checkout_clicks)}</strong></div>
            <div><span>WhatsApp clicks</span><strong>{formatted(metrics.whatsapp_clicks)}</strong></div>
            <div><span>Other CTA clicks</span><strong>{formatted(metrics.external_cta_clicks)}</strong></div>
            <div><span>Clicks per 100 views</span><strong>{number(metrics.checkout_click_rate_percent).toFixed(2)}</strong></div>
          </div>

          <div className="blg-video-summary-group">
            <h4>Watch milestones</h4>
            <div className="blg-video-milestone-line">
              <span>25%: {formatted(metrics.video_25)}</span>
              <span>50%: {formatted(metrics.video_50)}</span>
              <span>75%: {formatted(metrics.video_75)}</span>
              <span>Completed: {formatted(metrics.video_completions)}</span>
            </div>
          </div>

          <div className="blg-video-summary-group">
            <h4>Traffic sources</h4>
            {sources.length === 0 ? (
              <p>No traffic recorded.</p>
            ) : (
              <div className="blg-video-source-list">
                {sources.map((item, index) => (
                  <div key={item.source + index}>
                    <span>{item.source}</span>
                    <strong>{formatted(item.visitor_sessions)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="blg-video-summary-group">
            <h4>Recent daily activity</h4>
            {daily.length === 0 ? (
              <p>No daily activity recorded.</p>
            ) : (
              <div className="blg-video-daily-list">
                {daily.slice(-5).reverse().map((item, index) => (
                  <div key={String(item.day) + index}>
                    <span>{String(item.day).slice(0, 10)}</span>
                    <strong>{duration(item.video_watched_seconds)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="blg-video-summary-group">
            <h4>Verified purchases</h4>
            <p>
              {metrics.verified_payments == null
                ? 'Unavailable - requires verified payment data'
                : formatted(metrics.verified_payments)}
            </p>
          </div>

          <p className="blg-video-summary-note">
            Visitors are session-scoped. Watch time includes replayed video.
            Clicks do not represent verified purchases.
          </p>
        </aside>
        ) : null}
      </div>
    </section>
  );
}
function Metric({ title, value, hint }) {
  return (
    <div className="blg-sales-metric" style={cardStyle}>
      <div style={{ fontSize: 12, color: '#526273' }}>{title}</div>
      <strong style={{ display: 'block', fontSize: 24, marginTop: 6 }}>
        {value}
      </strong>
      {hint ? (
        <small style={{ display: 'block', color: '#64748b', marginTop: 5 }}>
          {hint}
        </small>
      ) : null}
    </div>
  );
}

export default function SalesLandingAnalyticsSection({ enabled = false }) {
  const [pages, setPages] = useState([]);
  const [pageId, setPageId] = useState('');
  const [days, setDays] = useState(30);
  const [report, setReport] = useState(null);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [trendMetric, setTrendMetric] = useState('video_watched_seconds');

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setLoadingPages(true);

    api.get('/api/writer/sales-landing')
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.pages) ? data.pages : [];
        setPages(list);
        setPageId((current) => {
          if (list.some((item) => String(item.id) === current)) return current;
          return list.length ? String(list[0].id) : '';
        });
        setError('');
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load your sales landing pages.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPages(false);
      });

    return () => { cancelled = true; };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !pageId) {
      setReport(null);
      return undefined;
    }

    let cancelled = false;
    const range = rangeForDays(days);

    setLoadingReport(true);
    setError('');
    setReport(null);

    api.get('/api/writer/analytics/sales-landing/' + encodeURIComponent(pageId), {
      params: range
    })
      .then(({ data }) => {
        if (!cancelled) {
          if (data?.ok !== true || !data?.report) {
            throw new Error('INVALID_REPORT');
          }
          setReport(data.report);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Sales landing analytics are not available yet.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingReport(false);
      });

    return () => { cancelled = true; };
  }, [enabled, pageId, days, refreshKey]);

  if (!enabled) return null;

  const metrics = report?.metrics || {};
  const sources = Array.isArray(report?.sources) ? report.sources : [];
  const daily = Array.isArray(report?.daily) ? report.daily : [];

  return (
    <section className="blg-sales-analytics" style={sectionStyle} aria-label="Sales landing analytics">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Sales Landing Analytics</h2>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
            Visitor journeys, active engagement, video viewing, and call-to-action clicks.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <select
            aria-label="Sales landing page"
            style={controlStyle}
            value={pageId}
            disabled={loadingPages || pages.length === 0}
            onChange={(event) => setPageId(event.target.value)}
          >
            {pages.length === 0 ? <option value="">No landing pages</option> : null}
            {pages.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.title || item.slug || ('Page ' + item.id)}
              </option>
            ))}
          </select>
          <select
            aria-label="Sales landing analytics period"
            style={controlStyle}
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            type="button"
            style={controlStyle}
            disabled={loadingPages || loadingReport}
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <p role="alert" style={{ color: '#b42318' }}>{error}</p> : null}
      {loadingPages || loadingReport ? <p>Loading sales landing statistics...</p> : null}
      {!loadingPages && pages.length === 0 && !error ? (
        <p>Create a sales landing page to view its analytics.</p>
      ) : null}

      {report ? (
        <>
          <SalesVideoTrend
            daily={daily}
            metrics={metrics}
            sources={sources}
            days={days}
            metricKey={trendMetric}
            onMetricChange={setTrendMetric}
          />
        </>
      ) : null}
    </section>
  );
}