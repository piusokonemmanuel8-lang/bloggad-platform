import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 18,
    padding: 18,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
  };
}

function pillButtonStyle(active = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    padding: '0 14px',
    borderRadius: 999,
    border: `1px solid ${active ? '#bfdbfe' : '#e5e7eb'}`,
    background: active ? '#eff6ff' : '#ffffff',
    color: active ? '#1d4ed8' : '#475467',
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  };
}

function metricCard(label, value, helper, tone = 'default') {
  const toneMap = {
    default: { bg: '#ffffff', border: '#e5e7eb', value: '#111827' },
    blue: { bg: '#f8fbff', border: '#dbeafe', value: '#1d4ed8' },
    green: { bg: '#f6fef9', border: '#d1fadf', value: '#027a48' },
    amber: { bg: '#fffcf5', border: '#fedf89', value: '#b54708' },
    slate: { bg: '#f8fafc', border: '#e2e8f0', value: '#0f172a' },
  };

  const current = toneMap[tone] || toneMap.default;

  return (
    <div
      style={{
        ...cardStyle(),
        background: current.bg,
        border: `1px solid ${current.border}`,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: '#667085', marginBottom: 8 }}>{label}</div>
      <div
        style={{
          fontSize: 30,
          lineHeight: 1,
          fontWeight: 900,
          color: current.value,
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: '#667085', lineHeight: 1.5 }}>
        {helper}
      </div>
    </div>
  );
}

function badgeStyle(type = 'default') {
  const map = {
    success: { background: '#ecfdf3', color: '#027a48', border: '#abefc6' },
    warning: { background: '#fffaeb', color: '#b54708', border: '#fedf89' },
    info: { background: '#eff8ff', color: '#175cd3', border: '#b2ddff' },
    default: { background: '#f9fafb', color: '#344054', border: '#eaecf0' },
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

function formatMoney(value) {
  const amount = Number(value || 0);
  return `$${amount.toFixed(2)}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value || 0));
}

function buildChartPath(points, width, height, maxValue) {
  if (!points.length) return '';

  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const safeMax = maxValue > 0 ? maxValue : 1;

  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (Number(point.value || 0) / safeMax) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function buildAreaPath(linePath, width, height) {
  if (!linePath) return '';
  return `${linePath} L ${width} ${height} L 0 ${height} Z`;
}

function LineAnalyticsChart({ chartPoints }) {
  const [hoverIndex, setHoverIndex] = useState(chartPoints.length ? chartPoints.length - 1 : -1);

  useEffect(() => {
    setHoverIndex(chartPoints.length ? chartPoints.length - 1 : -1);
  }, [chartPoints]);

  const width = 1000;
  const height = 260;
  const values = chartPoints.map((point) => Number(point.value || 0));
  const maxValue = Math.max(...values, 0);
  const linePath = buildChartPath(chartPoints, width, height, maxValue);
  const areaPath = buildAreaPath(linePath, width, height);

  const activePoint =
    hoverIndex >= 0 && hoverIndex < chartPoints.length ? chartPoints[hoverIndex] : null;

  const stepX = chartPoints.length > 1 ? width / (chartPoints.length - 1) : width;
  const safeMax = maxValue > 0 ? maxValue : 1;

  const activeX =
    activePoint && hoverIndex >= 0 ? hoverIndex * stepX : 0;
  const activeY =
    activePoint ? height - (Number(activePoint.value || 0) / safeMax) * height : height;

  return (
    <div
      style={{
        ...cardStyle(),
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '18px 18px 12px',
          borderBottom: '1px solid #eef2f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 900,
              color: '#111827',
            }}
          >
            Earnings Overview
          </h3>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: '#667085',
              lineHeight: 1.6,
            }}
          >
            Last 7 days earnings trend based on tracked post views and your current BlogPulse rate.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={badgeStyle('info')}>Last 7 days</div>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            height: 330,
            borderRadius: 18,
            border: '1px solid #eef2f7',
            background: '#fbfdff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {[0, 1, 2, 3, 4].map((line) => (
            <div
              key={line}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${line * 25}%`,
                borderTop: '1px solid #edf2f7',
              }}
            />
          ))}

          {activePoint ? (
            <div
              style={{
                position: 'absolute',
                left: `calc(${((hoverIndex / Math.max(chartPoints.length - 1, 1)) * 100).toFixed(4)}% + 70px)`,
                top: 18,
                transform: 'translateX(-50%)',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  minWidth: 150,
                  borderRadius: 14,
                  background: '#111827',
                  color: '#ffffff',
                  padding: '10px 12px',
                  boxShadow: '0 10px 25px rgba(15,23,42,0.22)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.85 }}>
                  {activePoint.fullDate}
                </div>
                <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700 }}>
                  Views: {formatNumber(activePoint.views)}
                </div>
                <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700 }}>
                  Revenue: {formatMoney(activePoint.value)}
                </div>
              </div>
            </div>
          ) : null}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              left: 70,
              right: 20,
              top: 20,
              bottom: 40,
              width: 'calc(100% - 90px)',
              height: 'calc(100% - 60px)',
              zIndex: 1,
            }}
          >
            <defs>
              <linearGradient id="earningsLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="earningsFillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(59,130,246,0.20)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
              </linearGradient>
            </defs>

            {areaPath ? <path d={areaPath} fill="url(#earningsFillGradient)" /> : null}
            {linePath ? (
              <path
                d={linePath}
                fill="none"
                stroke="url(#earningsLineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}

            {activePoint ? (
              <line
                x1={activeX}
                y1="0"
                x2={activeX}
                y2={height}
                stroke="#bfdbfe"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            ) : null}

            {chartPoints.map((point, index) => {
              const x = index * stepX;
              const y = height - (Number(point.value || 0) / safeMax) * height;
              const isActive = index === hoverIndex;

              return (
                <g key={`${point.label}-${index}`}>
                  <circle cx={x} cy={y} r={isActive ? '8' : '6'} fill="#ffffff" />
                  <circle cx={x} cy={y} r={isActive ? '5' : '4'} fill="#1d4ed8" />
                </g>
              );
            })}

            {chartPoints.map((point, index) => {
              const x = index * stepX;

              return (
                <rect
                  key={`hover-${point.label}-${index}`}
                  x={Math.max(x - stepX / 2, 0)}
                  y="0"
                  width={chartPoints.length > 1 ? stepX : width}
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(index)}
                />
              );
            })}
          </svg>

          <div
            style={{
              position: 'absolute',
              left: 16,
              top: 14,
              bottom: 54,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {[
              formatMoney(maxValue),
              formatMoney(maxValue * 0.75),
              formatMoney(maxValue * 0.5),
              formatMoney(maxValue * 0.25),
              formatMoney(0),
            ].map((label, index) => (
              <div
                key={`${label}-${index}`}
                style={{
                  fontSize: 11,
                  color: '#98a2b3',
                  fontWeight: 700,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              left: 70,
              right: 20,
              bottom: 12,
              display: 'grid',
              gridTemplateColumns: `repeat(${chartPoints.length || 1}, minmax(0, 1fr))`,
              gap: 10,
            }}
          >
            {chartPoints.map((point, index) => (
              <div
                key={point.label}
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: index === hoverIndex ? '#1d4ed8' : '#98a2b3',
                  fontWeight: index === hoverIndex ? 900 : 700,
                }}
              >
                {point.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, total, items, badgeLabel }) {
  return (
    <div style={{ ...cardStyle(), minHeight: 100 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 900,
              color: '#111827',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 13,
              color: '#667085',
              lineHeight: 1.6,
            }}
          >
            Real tracked performance from your monetized posts.
          </p>
        </div>

        <div style={badgeStyle('info')}>{badgeLabel}</div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px minmax(0, 1fr)',
          gap: 20,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            margin: '0 auto',
            borderRadius: '50%',
            background:
              'conic-gradient(#2563eb 0 25%, #60a5fa 25% 50%, #0f172a 50% 70%, #93c5fd 70% 85%, #cbd5e1 85% 100%)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            style={{
              width: 126,
              height: 126,
              borderRadius: '50%',
              background: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              padding: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: '#111827',
                }}
              >
                {total}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: '#667085',
                  fontWeight: 700,
                }}
              >
                Total Summary
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '14px minmax(0, 1fr) auto',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 14,
                background: '#f8fafc',
                border: '1px solid #eef2f7',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: item.color,
                }}
              />
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#344054',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#111827',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function tableHeadStyle() {
  return {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: 12,
    fontWeight: 900,
    color: '#667085',
    borderBottom: '1px solid #eef2f7',
    background: '#f8fafc',
  };
}

function tableCellStyle() {
  return {
    padding: '14px',
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
    borderBottom: '1px solid #f2f4f7',
  };
}

export default function AffiliateBlogPulseAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [earningsData, setEarningsData] = useState(null);
  const [tableMode, setTableMode] = useState('revenue');

  useEffect(() => {
    let ignore = false;

    async function loadEarnings() {
      setLoading(true);
      setErrorMessage('');

      try {
        const { data } = await api.get('/api/affiliate/blogpulse-earnings');

        if (!data?.ok || !data?.earnings) {
          throw new Error(data?.message || 'Failed to load BlogPulse earnings.');
        }

        if (!ignore) {
          setEarningsData(data.earnings);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error?.response?.data?.message || error.message || 'Failed to load BlogPulse earnings.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadEarnings();

    return () => {
      ignore = true;
    };
  }, []);

  const monetization = earningsData?.monetization || {};
  const overview = earningsData?.overview || {};
  const chart = Array.isArray(earningsData?.chart) ? earningsData.chart : [];
  const summaryTable = earningsData?.summary_table || {};
  const topPosts = Array.isArray(earningsData?.top_posts) ? earningsData.top_posts : [];

  const monetizationApproved =
    monetization?.monetization_mode === 'platform' && Number(monetization?.platform_enabled || 0) === 1;

  const chartPoints = useMemo(
    () =>
      chart.map((item) => ({
        label: item.label,
        fullDate: item.date,
        views: Number(item.post_views || 0),
        value: Number(item.post_views || 0) * Number(monetization?.rate_per_view || 0),
      })),
    [chart, monetization]
  );

  const summaryItems = useMemo(
    () => [
      {
        label: 'Tracked Post Views',
        value: formatNumber(overview?.tracked_post_views || 0),
        color: '#2563eb',
      },
      {
        label: 'Tracked Product Views',
        value: formatNumber(overview?.tracked_product_views || 0),
        color: '#60a5fa',
      },
      {
        label: 'Product Clicks',
        value: formatNumber(overview?.tracked_product_clicks || 0),
        color: '#0f172a',
      },
      {
        label: 'Slider Clicks',
        value: formatNumber(overview?.tracked_slider_clicks || 0),
        color: '#93c5fd',
      },
      {
        label: 'Published Posts',
        value: formatNumber(overview?.total_posts || 0),
        color: '#cbd5e1',
      },
    ],
    [overview]
  );

  const tableRows = useMemo(() => {
    const rows = [];

    if (summaryTable?.today) {
      rows.push({
        period: summaryTable.today.label || 'Today',
        tracked_post_views: formatNumber(summaryTable.today.tracked_post_views || 0),
        estimated_revenue: formatMoney(summaryTable.today.estimated_revenue || 0),
      });
    }

    if (summaryTable?.last_7_days) {
      rows.push({
        period: summaryTable.last_7_days.label || 'Last 7 Days',
        tracked_post_views: formatNumber(summaryTable.last_7_days.tracked_post_views || 0),
        estimated_revenue: formatMoney(summaryTable.last_7_days.estimated_revenue || 0),
      });
    }

    return rows;
  }, [summaryTable]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          ...cardStyle(),
          background:
            'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)',
          color: '#ffffff',
          padding: 24,
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
              BlogPulse Earnings
            </div>

            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.12, fontWeight: 900 }}>
              Review your BlogPulse earnings and monetization activity
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
              This page uses your tracked monetization data to show earnings, post performance, and
              revenue trend in a cleaner analytics layout.
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
                Access Status
              </div>
              <div style={monetizationApproved ? badgeStyle('success') : badgeStyle('warning')}>
                {monetizationApproved ? 'Active' : 'Awaiting Approval'}
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
                Earnings Mode
              </div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>BlogPulse Platform</div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: '#f8fafc',
              border: '1px solid #eef2f7',
              color: '#475467',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            Loading BlogPulse earnings...
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.65,
            }}
          >
            {errorMessage}
          </div>
        </section>
      ) : null}

      {!loading && !errorMessage && !monetizationApproved ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: '#fffaeb',
              border: '1px solid #fedf89',
              color: '#b54708',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.65,
            }}
          >
            Your BlogPulse earnings dashboard becomes fully active after your platform monetization
            approval is completed.
          </div>
        </section>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 18,
        }}
      >
        {metricCard(
          'Estimated Revenue',
          formatMoney(overview?.estimated_revenue || 0),
          'Calculated from tracked post views and your current BlogPulse rate.',
          'blue'
        )}
        {metricCard(
          'Tracked Post Views',
          formatNumber(overview?.tracked_post_views || 0),
          'Total monetizable post views currently tracked.',
          'slate'
        )}
        {metricCard(
          'Tracked Product Views',
          formatNumber(overview?.tracked_product_views || 0),
          'Total product page views tracked on your storefront.',
          'amber'
        )}
        {metricCard(
          'Product Clicks',
          formatNumber(overview?.tracked_product_clicks || 0),
          'Total product clicks tracked across your website.',
          'green'
        )}
        {metricCard(
          'Slider Clicks',
          formatNumber(overview?.tracked_slider_clicks || 0),
          'Total slider clicks currently tracked.',
          'default'
        )}
        {metricCard(
          'Published Posts',
          formatNumber(overview?.total_posts || 0),
          'Total posts available for monetization tracking.',
          'blue'
        )}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, 0.75fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <LineAnalyticsChart chartPoints={chartPoints} />
        <SummaryCard
          title="Activity Summary"
          total={formatNumber(overview?.tracked_post_views || 0)}
          badgeLabel="Tracked"
          items={summaryItems}
        />
      </section>

      <section style={cardStyle()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 900,
                color: '#111827',
              }}
            >
              Earnings Summary Table
            </h3>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: '#667085',
                lineHeight: 1.6,
              }}
            >
              A real breakdown of your current monetization summary by period.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setTableMode('revenue')}
              style={pillButtonStyle(tableMode === 'revenue')}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setTableMode('views')}
              style={pillButtonStyle(tableMode === 'views')}
            >
              Tracked Views
            </button>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            border: '1px solid #eef2f7',
            borderRadius: 16,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr>
                <th style={tableHeadStyle()}>Period</th>
                <th style={tableHeadStyle()}>Tracked Post Views</th>
                <th style={tableHeadStyle()}>
                  {tableMode === 'revenue' ? 'Estimated Revenue' : 'Tracked Views'}
                </th>
              </tr>
            </thead>

            <tbody>
              {tableRows.length ? (
                tableRows.map((row) => (
                  <tr key={row.period}>
                    <td style={tableCellStyle()}>{row.period}</td>
                    <td style={tableCellStyle()}>{row.tracked_post_views}</td>
                    <td style={tableCellStyle()}>
                      {tableMode === 'revenue' ? row.estimated_revenue : row.tracked_post_views}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={tableCellStyle()} colSpan={3}>
                    No earnings summary available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={cardStyle()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 900,
                color: '#111827',
              }}
            >
              Top Earning Posts
            </h3>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                color: '#667085',
                lineHeight: 1.6,
              }}
            >
              Your top tracked posts ranked by post views and estimated earnings.
            </p>
          </div>

          <div style={badgeStyle('info')}>Posts</div>
        </div>

        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            border: '1px solid #eef2f7',
            borderRadius: 16,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr>
                <th style={tableHeadStyle()}>Post Title</th>
                <th style={tableHeadStyle()}>Slug</th>
                <th style={tableHeadStyle()}>Tracked Views</th>
                <th style={tableHeadStyle()}>Estimated Earnings</th>
              </tr>
            </thead>

            <tbody>
              {topPosts.length ? (
                topPosts.map((post) => (
                  <tr key={post.id}>
                    <td style={tableCellStyle()}>{post.title}</td>
                    <td style={tableCellStyle()}>{post.slug}</td>
                    <td style={tableCellStyle()}>{formatNumber(post.total_views || 0)}</td>
                    <td style={tableCellStyle()}>{formatMoney(post.estimated_earnings || 0)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={tableCellStyle()} colSpan={4}>
                    No post earnings data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}