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

function SalesVideoTrend({ daily, days, metricKey, onMetricChange }) {
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
        <h3>Rise and fall</h3>
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
            days={days}
            metricKey={trendMetric}
            onMetricChange={setTrendMetric}
          />
          <div className="blg-sales-metrics" style={gridStyle}>
            <Metric title="Page views" value={formatted(metrics.page_views)} />
            <Metric title="Visitor sessions" value={formatted(metrics.visitor_sessions)} />
            <Metric
              title="Session-scoped visitors"
              value={formatted(metrics.session_scoped_visitors)}
              hint="New ID per tracking session; not unique people"
            />
            <Metric title="Active engagement" value={duration(metrics.active_seconds)} />
            <Metric title="YouTube time watched" value={duration(metrics.video_watched_seconds)} />
            <Metric title="Video starts" value={formatted(metrics.video_starts)} />
            <Metric title="Pay To Join clicks" value={formatted(metrics.checkout_clicks)} />
            <Metric title="WhatsApp clicks" value={formatted(metrics.whatsapp_clicks)} />
            <Metric title="Other CTA clicks" value={formatted(metrics.external_cta_clicks)} />
            <Metric
              title="Pay To Join clicks per 100 views"
              value={number(metrics.checkout_click_rate_percent).toFixed(2)}
              hint="Repeat clicks count; can exceed 100 per 100 views"
            />
            <Metric
              title="Verified purchases"
              value={metrics.verified_payments == null ? 'Unavailable' : formatted(metrics.verified_payments)}
              hint="Requires server-side payment verification"
            />
          </div>

          <h3 style={{ margin: '24px 0 10px', fontSize: 16 }}>YouTube cumulative watch milestones</h3>
          <div className="blg-sales-milestones" style={gridStyle}>
            <Metric title="25% milestone" value={formatted(metrics.video_25)} />
            <Metric title="50% milestone" value={formatted(metrics.video_50)} />
            <Metric title="75% milestone" value={formatted(metrics.video_75)} />
            <Metric title="Completed" value={formatted(metrics.video_completions)} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            marginTop: 24
          }}>
            <div>
              <h3 style={{ fontSize: 16 }}>Traffic sources</h3>
              {sources.length === 0 ? <p>No source data recorded.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Source</th>
                      <th style={{ textAlign: 'right' }}>Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((item, index) => (
                      <tr key={item.source + index}>
                        <td style={{ padding: '8px 0' }}>{item.source}</td>
                        <td style={{ textAlign: 'right' }}>{formatted(item.visitor_sessions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: 16 }}>Daily activity by session start</h3>
              {daily.length === 0 ? <p>No daily activity recorded.</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left' }}>Day</th>
                        <th style={{ textAlign: 'right' }}>Sessions</th>
                        <th style={{ textAlign: 'right' }}>Watch time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daily.map((item, index) => (
                        <tr key={String(item.day) + index}>
                          <td style={{ padding: '8px 0' }}>{String(item.day)}</td>
                          <td style={{ textAlign: 'right' }}>{formatted(item.visitor_sessions)}</td>
                          <td style={{ textAlign: 'right' }}>{duration(item.video_watched_seconds)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#64748b', marginTop: 20 }}>
            Each tracking session gets a new visitor ID. Milestones use cumulative playback time,
            including rewatching, not furthest video position. Button clicks are not verified payments.
          </p>
        </>
      ) : null}
    </section>
  );
}