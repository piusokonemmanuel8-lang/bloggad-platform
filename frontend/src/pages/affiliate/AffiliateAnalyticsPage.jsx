import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  RefreshCw,
  AlertCircle,
  Package,
  FileText,
  Eye,
  MousePointerClick,
  Activity,
  ShoppingCart,
  ArrowUpRight,
  Layers3,
} from 'lucide-react';
import api from '../../api/axios';

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <div className="affiliate-analytics-stat-card">
      <div className="affiliate-analytics-stat-top">
        <div>
          <p className="affiliate-analytics-stat-label">{title}</p>
          <h3 className="affiliate-analytics-stat-value">{value}</h3>
        </div>

        <div className="affiliate-analytics-stat-icon">
          <Icon size={20} />
        </div>
      </div>

      <p className="affiliate-analytics-stat-hint">{hint}</p>
    </div>
  );
}

function SimpleItemCard({ title, rows = [] }) {
  return (
    <div className="affiliate-analytics-item-card">
      <h3>{title}</h3>

      <div className="affiliate-analytics-item-rows">
        {rows.map((row) => (
          <div key={row.label} className="affiliate-analytics-item-row">
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function AffiliateAnalyticsLegacy() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/api/affiliate/analytics');
      setAnalytics(data?.analytics || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overview = analytics?.overview || {};
  const clickBreakdown = analytics?.click_breakdown || {};
  const topProducts = analytics?.top_products || [];
  const topPosts = analytics?.top_posts || [];
  const recentActivity = analytics?.recent_activity || [];

  const combinedReadMore = useMemo(() => {
    return (clickBreakdown.read_more || 0) + (clickBreakdown.learn_more || 0);
  }, [clickBreakdown]);

  if (loading) {
    return (
      <div className="affiliate-analytics-page">
        <style>{styles}</style>

        <div className="affiliate-analytics-loading-wrap">
          <div className="affiliate-analytics-loading-card">
            <div className="affiliate-analytics-spinner" />
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-analytics-page">
      <style>{styles}</style>

      <section className="affiliate-analytics-hero">
        <div className="affiliate-analytics-hero-copy">
          <div className="affiliate-analytics-badge">Performance overview</div>
          <h1 className="affiliate-analytics-title">Analytics</h1>
          <p className="affiliate-analytics-subtitle">
            Track product views, clicks, post performance, slider activity, and recent website events.
          </p>
        </div>

        <div className="affiliate-analytics-hero-actions">
          <button
            type="button"
            className="affiliate-analytics-btn secondary"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      {error ? (
        <div className="affiliate-analytics-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="affiliate-analytics-stats-grid">
        <StatCard
          title="Products"
          value={overview.total_products || 0}
          icon={Package}
          hint="Total products in your affiliate store"
        />
        <StatCard
          title="Posts"
          value={overview.total_posts || 0}
          icon={FileText}
          hint="Total content posts created"
        />
        <StatCard
          title="Product Views"
          value={overview.total_product_views || 0}
          icon={Eye}
          hint="All product page views"
        />
        <StatCard
          title="Product Clicks"
          value={overview.total_product_clicks || 0}
          icon={MousePointerClick}
          hint="All product click actions"
        />
      </section>

      <section className="affiliate-analytics-stats-grid second">
        <StatCard
          title="Post Views"
          value={overview.total_post_views || 0}
          icon={BarChart3}
          hint="All content views across posts"
        />
        <StatCard
          title="Slider Clicks"
          value={overview.total_slider_clicks || 0}
          icon={Layers3}
          hint="Clicks coming from sliders"
        />
        <StatCard
          title="Buy Now Clicks"
          value={clickBreakdown.buy_now || 0}
          icon={ShoppingCart}
          hint="Direct buy intent clicks"
        />
        <StatCard
          title="Read More / Learn More"
          value={combinedReadMore}
          icon={ArrowUpRight}
          hint="Informational CTA clicks"
        />
      </section>

      <section className="affiliate-analytics-main-grid">
        <div className="affiliate-analytics-panel">
          <div className="affiliate-analytics-panel-head">
            <div>
              <p className="affiliate-analytics-panel-kicker">Top products</p>
              <h2 className="affiliate-analytics-panel-title">Best performing products</h2>
            </div>
          </div>

          {topProducts.length ? (
            <div className="affiliate-analytics-list">
              {topProducts.map((item) => (
                <SimpleItemCard
                  key={item.id}
                  title={item.title}
                  rows={[
                    { label: 'Views', value: item.total_views || 0 },
                    { label: 'Clicks', value: item.total_clicks || 0 },
                    { label: 'Posts', value: item.total_posts || 0 },
                  ]}
                />
              ))}
            </div>
          ) : (
            <div className="affiliate-analytics-empty-small">
              <Package size={24} />
              <p>No product analytics yet.</p>
            </div>
          )}
        </div>

        <div className="affiliate-analytics-panel">
          <div className="affiliate-analytics-panel-head">
            <div>
              <p className="affiliate-analytics-panel-kicker">Top posts</p>
              <h2 className="affiliate-analytics-panel-title">Best performing posts</h2>
            </div>
          </div>

          {topPosts.length ? (
            <div className="affiliate-analytics-list">
              {topPosts.map((item) => (
                <SimpleItemCard
                  key={item.id}
                  title={item.title}
                  rows={[
                    { label: 'Views', value: item.total_views || 0 },
                    { label: 'CTA Buttons', value: item.total_cta_buttons || 0 },
                    { label: 'Product', value: item.product?.title || '-' },
                  ]}
                />
              ))}
            </div>
          ) : (
            <div className="affiliate-analytics-empty-small">
              <FileText size={24} />
              <p>No post analytics yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="affiliate-analytics-panel">
        <div className="affiliate-analytics-panel-head">
          <div>
            <p className="affiliate-analytics-panel-kicker">Recent activity</p>
            <h2 className="affiliate-analytics-panel-title">Latest tracked actions</h2>
          </div>
        </div>

        {recentActivity.length ? (
          <div className="affiliate-analytics-activity-list">
            {recentActivity.map((item) => (
              <div
                key={`${item.activity_type}-${item.id}`}
                className="affiliate-analytics-activity-card"
              >
                <div className="affiliate-analytics-activity-icon">
                  <Activity size={18} />
                </div>

                <div className="affiliate-analytics-activity-main">
                  <h3>{item.activity_type || '-'}</h3>

                  <div className="affiliate-analytics-activity-grid">
                    <div>
                      <span>Click Type</span>
                      <strong>{item.click_type || '-'}</strong>
                    </div>
                    <div>
                      <span>Product</span>
                      <strong>{item.product?.title || '-'}</strong>
                    </div>
                    <div>
                      <span>Post</span>
                      <strong>{item.post?.title || '-'}</strong>
                    </div>
                    <div>
                      <span>Date</span>
                      <strong>{item.created_at || '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="affiliate-analytics-empty">
            <Activity size={30} />
            <h3>No recent analytics activity yet</h3>
            <p>Tracked actions will appear here once users start interacting with your store.</p>
          </div>
        )}
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-analytics-page {
    width: 100%;
  }

  .affiliate-analytics-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-analytics-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-analytics-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateAnalyticsSpin 0.8s linear infinite;
  }

  @keyframes affiliateAnalyticsSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateAnalyticsSpin 0.8s linear infinite;
  }

  .affiliate-analytics-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-analytics-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-analytics-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-analytics-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-analytics-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-analytics-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-analytics-btn.secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-analytics-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-analytics-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-analytics-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-analytics-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-analytics-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-analytics-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-analytics-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-analytics-stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-analytics-stat-hint {
    margin: 14px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: #6b7280;
  }

  .affiliate-analytics-main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .affiliate-analytics-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-analytics-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-analytics-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-analytics-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-analytics-list,
  .affiliate-analytics-activity-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .affiliate-analytics-item-card {
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-analytics-item-card h3 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-analytics-item-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .affiliate-analytics-item-row,
  .affiliate-analytics-activity-grid div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    background: #ffffff;
    border: 1px solid #edf2f7;
    border-radius: 14px;
  }

  .affiliate-analytics-item-row span,
  .affiliate-analytics-activity-grid span {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-analytics-item-row strong,
  .affiliate-analytics-activity-grid strong {
    font-size: 14px;
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-analytics-activity-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-analytics-activity-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    color: #111827;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .affiliate-analytics-activity-main {
    flex: 1;
  }

  .affiliate-analytics-activity-main h3 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 900;
    color: #111827;
    text-transform: capitalize;
  }

  .affiliate-analytics-activity-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .affiliate-analytics-empty,
  .affiliate-analytics-empty-small {
    min-height: 180px;
    border: 1px dashed #dbe2ea;
    background: #f8fafc;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 22px;
  }

  .affiliate-analytics-empty h3,
  .affiliate-analytics-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  .affiliate-analytics-empty p {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
    max-width: 420px;
  }

  @media (max-width: 1200px) {
    .affiliate-analytics-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-analytics-hero,
    .affiliate-analytics-main-grid {
      grid-template-columns: 1fr;
      display: grid;
    }

    .affiliate-analytics-hero {
      padding: 20px;
    }

    .affiliate-analytics-title {
      font-size: 26px;
    }

    .affiliate-analytics-panel {
      padding: 18px;
    }

    .affiliate-analytics-activity-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    .affiliate-analytics-stats-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-analytics-title {
      font-size: 22px;
    }

    .affiliate-analytics-subtitle {
      font-size: 14px;
    }

    .affiliate-analytics-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-analytics-btn {
      width: 100%;
    }

    .affiliate-analytics-item-row,
    .affiliate-analytics-activity-card {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

const writerAnalyticsMetrics = [
  { key: 'total_activity', label: 'All activity' },
  { key: 'product_views', label: 'Product views' },
  { key: 'product_clicks', label: 'Product clicks' },
  { key: 'post_views', label: 'Post views' },
  { key: 'slider_clicks', label: 'Slider clicks' },
];

function formatWriterAnalyticsNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat(undefined, {
    notation: number >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: number >= 10000 ? 1 : 0,
  }).format(number);
}

function formatWriterAnalyticsDate(value, compact = false) {
  if (!value) return '-';

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(
    undefined,
    compact
      ? { month: 'short', day: 'numeric', timeZone: 'UTC' }
      : { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
  );
}

function getWriterAnalyticsComparison(comparison, metricKey) {
  return comparison?.[metricKey] || {
    current: 0,
    previous: 0,
    change_percent: 0,
    direction: 'flat',
  };
}

function WriterAnalyticsChange({ comparison }) {
  const direction = comparison?.direction || 'flat';
  const previous = Number(comparison?.previous || 0);
  const current = Number(comparison?.current || 0);
  const percent = Math.abs(Number(comparison?.change_percent || 0));

  let label = 'No change';

  if (previous === 0 && current > 0) {
    label = 'New activity';
  } else if (direction === 'up') {
    label = `${percent.toFixed(percent >= 10 ? 0 : 1)}% up`;
  } else if (direction === 'down') {
    label = `${percent.toFixed(percent >= 10 ? 0 : 1)}% down`;
  }

  return (
    <span className={`wa-change ${direction}`}>
      <span aria-hidden="true">
        {direction === 'up' ? '+' : direction === 'down' ? '-' : '='}
      </span>
      {label}
    </span>
  );
}

function makeWriterAnalyticsSmoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const middleX = (previous.x + current.x) / 2;

    path += ` C ${middleX} ${previous.y}, ${middleX} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
}

function WriterRiseFallChart({ points, metricKey, comparison }) {
  const width = 820;
  const height = 292;
  const padding = { top: 20, right: 18, bottom: 42, left: 48 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const values = points.map((point) => Number(point?.[metricKey] || 0));
  const rawMax = Math.max(1, ...values);
  const step = rawMax <= 4 ? 1 : Math.ceil(rawMax / 4);
  const scaleMax = Math.max(4, step * 4);
  const baselineY = padding.top + innerHeight;

  const plotted = points.map((point, index) => {
    const x =
      points.length <= 1
        ? padding.left + innerWidth / 2
        : padding.left + (index / (points.length - 1)) * innerWidth;

    const value = Number(point?.[metricKey] || 0);
    const y = padding.top + innerHeight - (value / scaleMax) * innerHeight;

    return {
      ...point,
      x,
      y,
      value,
    };
  });

  const linePath = makeWriterAnalyticsSmoothPath(plotted);
  const areaPath = plotted.length
    ? `${linePath} L ${plotted[plotted.length - 1].x} ${baselineY} L ${plotted[0].x} ${baselineY} Z`
    : '';

  const tickValues = [0, 1, 2, 3, 4].map((index) => step * index);
  const labelIndexes =
    points.length <= 7
      ? points.map((_, index) => index)
      : [
          0,
          Math.floor((points.length - 1) * 0.25),
          Math.floor((points.length - 1) * 0.5),
          Math.floor((points.length - 1) * 0.75),
          points.length - 1,
        ];

  const uniqueLabelIndexes = [...new Set(labelIndexes)];

  return (
    <div className="wa-chart-shell">
      <div className="wa-chart-total">
        <span>Selected period</span>
        <strong>{formatWriterAnalyticsNumber(comparison?.current || 0)}</strong>
        <WriterAnalyticsChange comparison={comparison} />
      </div>

      <div className="wa-chart-scroll">
        <svg
          className="wa-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Daily analytics rise and fall chart"
        >
          <defs>
            <linearGradient id="writerAnalyticsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {tickValues.map((tick) => {
            const y = padding.top + innerHeight - (tick / scaleMax) * innerHeight;

            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  className="wa-chart-grid"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="wa-chart-axis"
                >
                  {formatWriterAnalyticsNumber(tick)}
                </text>
              </g>
            );
          })}

          {areaPath ? <path d={areaPath} className="wa-chart-area" /> : null}
          {linePath ? <path d={linePath} className="wa-chart-line" /> : null}

          {plotted.map((point, index) => (
            <circle
              key={`${point.date}-${index}`}
              cx={point.x}
              cy={point.y}
              r={points.length > 35 ? 2.2 : 3}
              className="wa-chart-point"
            >
              <title>
                {`${formatWriterAnalyticsDate(point.date)}: ${formatWriterAnalyticsNumber(point.value)}`}
              </title>
            </circle>
          ))}

          {uniqueLabelIndexes.map((index) => {
            const point = plotted[index];
            if (!point) return null;

            return (
              <text
                key={`label-${point.date}`}
                x={point.x}
                y={height - 14}
                textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
                className="wa-chart-axis"
              >
                {formatWriterAnalyticsDate(point.date, true)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function WriterAnalyticsStat({ label, value, hint }) {
  return (
    <article className="wa-stat">
      <span>{label}</span>
      <strong>{formatWriterAnalyticsNumber(value)}</strong>
      <small>{hint}</small>
    </article>
  );
}

function WriterAnalyticsWorkspace() {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState(30);
  const [metricKey, setMetricKey] = useState('total_activity');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAnalytics = async ({ refresh = false, days = period } = {}) => {
    try {
      setError('');

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/api/writer/analytics', {
        params: { days },
      });

      setAnalytics(data?.analytics || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics({ days: period });
  }, [period]);

  const overview = analytics?.overview || {};
  const clickBreakdown = analytics?.click_breakdown || {};
  const topProducts = Array.isArray(analytics?.top_products) ? analytics.top_products : [];
  const topPosts = Array.isArray(analytics?.top_posts) ? analytics.top_posts : [];
  const recentActivity = Array.isArray(analytics?.recent_activity) ? analytics.recent_activity : [];
  const trend = analytics?.trend || {};
  const trendPoints = Array.isArray(trend?.points) ? trend.points : [];
  const comparison = getWriterAnalyticsComparison(trend?.comparison, metricKey);
  const combinedReadMore =
    Number(clickBreakdown.read_more || 0) + Number(clickBreakdown.learn_more || 0);

  if (loading) {
    return (
      <div className="wa-page">
        <style>{writerAnalyticsStyles}</style>
        <section className="wa-loading">
          <div className="wa-spinner" />
          <strong>Loading analytics...</strong>
        </section>
      </div>
    );
  }

  return (
    <div className="wa-page">
      <style>{writerAnalyticsStyles}</style>

      <div className="wa-command">
        <div>
          <p>Performance</p>
          <span>See how Readers move through your products and stories over time.</span>
        </div>

        <div className="wa-command-actions">
          <select
            aria-label="Analytics period"
            value={period}
            onChange={(event) => setPeriod(Number(event.target.value))}
            disabled={refreshing}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <button
            type="button"
            className="wa-btn"
            onClick={() => loadAnalytics({ refresh: true, days: period })}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="wa-alert" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="wa-stats" aria-label="Analytics summary">
        <WriterAnalyticsStat
          label="Product views"
          value={overview.total_product_views || 0}
          hint="All recorded product views"
        />
        <WriterAnalyticsStat
          label="Product clicks"
          value={overview.total_product_clicks || 0}
          hint="All product click actions"
        />
        <WriterAnalyticsStat
          label="Post views"
          value={overview.total_post_views || 0}
          hint="All recorded story views"
        />
        <WriterAnalyticsStat
          label="Slider clicks"
          value={overview.total_slider_clicks || 0}
          hint="Tracked slider interactions"
        />
      </section>

      <section className="wa-panel wa-trend-panel">
        <div className="wa-panel-head">
          <div>
            <p>Traffic trend</p>
            <h2>Rise and fall</h2>
            <span>Real daily activity for the selected period compared with the previous period.</span>
          </div>
        </div>

        <div className="wa-metric-tabs" role="tablist" aria-label="Chart metric">
          {writerAnalyticsMetrics.map((metric) => (
            <button
              key={metric.key}
              type="button"
              role="tab"
              aria-selected={metricKey === metric.key}
              className={metricKey === metric.key ? 'is-active' : ''}
              onClick={() => setMetricKey(metric.key)}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {trendPoints.length ? (
          <WriterRiseFallChart
            points={trendPoints}
            metricKey={metricKey}
            comparison={comparison}
          />
        ) : (
          <div className="wa-empty">
            <BarChart3 size={24} />
            <strong>No trend activity yet</strong>
            <span>Daily analytics will appear here as Readers interact with your content.</span>
          </div>
        )}
      </section>

      <section className="wa-secondary-grid">
        <div className="wa-panel">
          <div className="wa-panel-head compact">
            <div>
              <p>Top products</p>
              <h2>Best performing products</h2>
            </div>
          </div>

          {topProducts.length ? (
            <div className="wa-ranking-list">
              {topProducts.slice(0, 6).map((item, index) => (
                <article key={item.id} className="wa-ranking-row">
                  <span className="wa-rank">{index + 1}</span>
                  <div>
                    <strong>{item.title || 'Untitled product'}</strong>
                    <small>{formatWriterAnalyticsNumber(item.total_views || 0)} views</small>
                  </div>
                  <b>{formatWriterAnalyticsNumber(item.total_clicks || 0)} clicks</b>
                </article>
              ))}
            </div>
          ) : (
            <div className="wa-empty small">
              <Package size={20} />
              <span>No product analytics yet.</span>
            </div>
          )}
        </div>

        <div className="wa-panel">
          <div className="wa-panel-head compact">
            <div>
              <p>Top posts</p>
              <h2>Best performing stories</h2>
            </div>
          </div>

          {topPosts.length ? (
            <div className="wa-ranking-list">
              {topPosts.slice(0, 6).map((item, index) => (
                <article key={item.id} className="wa-ranking-row">
                  <span className="wa-rank">{index + 1}</span>
                  <div>
                    <strong>{item.title || 'Untitled story'}</strong>
                    <small>{item.product?.title || 'Independent story'}</small>
                  </div>
                  <b>{formatWriterAnalyticsNumber(item.total_views || 0)} views</b>
                </article>
              ))}
            </div>
          ) : (
            <div className="wa-empty small">
              <FileText size={20} />
              <span>No story analytics yet.</span>
            </div>
          )}
        </div>
      </section>

      <section className="wa-bottom-grid">
        <div className="wa-panel">
          <div className="wa-panel-head compact">
            <div>
              <p>Intent</p>
              <h2>Product click actions</h2>
            </div>
          </div>

          <div className="wa-intent-grid">
            <article>
              <span>Buy now</span>
              <strong>{formatWriterAnalyticsNumber(clickBreakdown.buy_now || 0)}</strong>
            </article>
            <article>
              <span>Read / Learn more</span>
              <strong>{formatWriterAnalyticsNumber(combinedReadMore)}</strong>
            </article>
          </div>
        </div>

        <div className="wa-panel">
          <div className="wa-panel-head compact">
            <div>
              <p>Recent</p>
              <h2>Latest tracked activity</h2>
            </div>
          </div>

          {recentActivity.length ? (
            <div className="wa-activity-list">
              {recentActivity.slice(0, 8).map((item) => (
                <article key={`${item.activity_type}-${item.id}`}>
                  <span className="wa-activity-dot" />
                  <div>
                    <strong>{String(item.activity_type || 'activity').replace(/_/g, ' ')}</strong>
                    <small>
                      {item.product?.title ||
                        item.post?.title ||
                        item.click_type ||
                        'Website activity'}
                    </small>
                  </div>
                  <time>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                  </time>
                </article>
              ))}
            </div>
          ) : (
            <div className="wa-empty small">
              <Activity size={20} />
              <span>No recent analytics activity yet.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AffiliateAnalyticsPage() {
  const location = useLocation();
  const writerRouteMode = location.pathname === '/writer/analytics';

  return writerRouteMode ? <WriterAnalyticsWorkspace /> : <AffiliateAnalyticsLegacy />;
}

const writerAnalyticsStyles = `
  .wa-page,
  .wa-page * {
    box-sizing: border-box;
  }

  .wa-page {
    width: 100%;
    color: #1f242b;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .wa-command {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 14px;
  }

  .wa-command p,
  .wa-panel-head p {
    margin: 0 0 4px;
    color: #778290;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .wa-command > div > span,
  .wa-panel-head > div > span {
    color: #7c8794;
    font-size: 11px;
    line-height: 1.45;
  }

  .wa-command-actions {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .wa-command select,
  .wa-btn {
    height: 38px;
    border: 1px solid #dce1e6;
    border-radius: 7px;
    background: #ffffff;
    color: #252a31;
    font: inherit;
    font-size: 11px;
  }

  .wa-command select {
    min-width: 126px;
    padding: 0 32px 0 11px;
  }

  .wa-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .wa-btn:disabled,
  .wa-command select:disabled {
    opacity: 0.58;
    cursor: not-allowed;
  }

  .wa-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    padding: 10px 12px;
    border: 1px solid #fecaca;
    border-radius: 7px;
    background: #fff7f7;
    color: #991b1b;
    font-size: 11px;
  }

  .wa-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .wa-stat {
    min-height: 96px;
    padding: 15px;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
    background: #ffffff;
  }

  .wa-stat > span {
    display: block;
    margin-bottom: 8px;
    color: #7a8593;
    font-size: 10px;
    font-weight: 600;
  }

  .wa-stat strong {
    display: block;
    margin-bottom: 8px;
    color: #20242a;
    font-size: 23px;
    line-height: 1;
  }

  .wa-stat small {
    color: #929aa5;
    font-size: 9px;
    line-height: 1.35;
  }

  .wa-panel {
    min-width: 0;
    padding: 18px;
    border: 1px solid #dfe3e8;
    border-radius: 9px;
    background: #ffffff;
  }

  .wa-trend-panel {
    margin-bottom: 14px;
  }

  .wa-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .wa-panel-head.compact {
    margin-bottom: 12px;
  }

  .wa-panel-head h2 {
    margin: 0 0 5px;
    color: #20242a;
    font-size: 14px;
    line-height: 1.25;
  }

  .wa-metric-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 10px;
  }

  .wa-metric-tabs button {
    min-height: 30px;
    padding: 0 11px;
    border: 1px solid #dce1e6;
    border-radius: 999px;
    background: #ffffff;
    color: #687382;
    font: inherit;
    font-size: 9px;
    font-weight: 600;
    cursor: pointer;
  }

  .wa-metric-tabs button.is-active {
    border-color: #20242a;
    background: #20242a;
    color: #ffffff;
  }

  .wa-chart-total {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-height: 34px;
    margin-bottom: 4px;
  }

  .wa-chart-total > span:first-child {
    color: #84909d;
    font-size: 9px;
  }

  .wa-chart-total strong {
    color: #20242a;
    font-size: 21px;
    line-height: 1;
  }

  .wa-change {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 700;
  }

  .wa-change.up {
    color: #18794e;
  }

  .wa-change.down {
    color: #b42318;
  }

  .wa-change.flat {
    color: #778290;
  }

  .wa-chart-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .wa-chart {
    width: 100%;
    min-width: 680px;
    height: auto;
    aspect-ratio: 820 / 292;
    display: block;
    color: #20242a;
  }

  .wa-chart-grid {
    stroke: #e8ebee;
    stroke-width: 1;
  }

  .wa-chart-axis {
    fill: #87919d;
    font-size: 10px;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .wa-chart-area {
    fill: url(#writerAnalyticsAreaFill);
    color: #20242a;
  }

  .wa-chart-line {
    fill: none;
    stroke: #20242a;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .wa-chart-point {
    fill: #ffffff;
    stroke: #20242a;
    stroke-width: 2;
  }

  .wa-secondary-grid,
  .wa-bottom-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  .wa-ranking-list,
  .wa-activity-list {
    display: grid;
  }

  .wa-ranking-row {
    min-width: 0;
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-height: 56px;
    border-top: 1px solid #edf0f2;
  }

  .wa-ranking-row:first-child,
  .wa-activity-list article:first-child {
    border-top: 0;
  }

  .wa-rank {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: #f0f2f4;
    color: #66717f;
    font-size: 9px;
    font-weight: 700;
  }

  .wa-ranking-row div {
    min-width: 0;
  }

  .wa-ranking-row strong,
  .wa-ranking-row small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wa-ranking-row strong {
    margin-bottom: 4px;
    color: #292e35;
    font-size: 10px;
  }

  .wa-ranking-row small {
    color: #8b95a1;
    font-size: 9px;
  }

  .wa-ranking-row b {
    color: #4b5563;
    font-size: 9px;
    font-weight: 600;
  }

  .wa-intent-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .wa-intent-grid article {
    min-height: 74px;
    padding: 13px;
    border: 1px solid #e3e6ea;
    border-radius: 8px;
    background: #fafbfc;
  }

  .wa-intent-grid span,
  .wa-intent-grid strong {
    display: block;
  }

  .wa-intent-grid span {
    margin-bottom: 9px;
    color: #7f8995;
    font-size: 9px;
  }

  .wa-intent-grid strong {
    color: #252a31;
    font-size: 18px;
  }

  .wa-activity-list article {
    min-width: 0;
    display: grid;
    grid-template-columns: 8px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    border-top: 1px solid #edf0f2;
  }

  .wa-activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #697482;
  }

  .wa-activity-list div {
    min-width: 0;
  }

  .wa-activity-list strong,
  .wa-activity-list small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wa-activity-list strong {
    margin-bottom: 3px;
    color: #30353c;
    font-size: 9px;
    text-transform: capitalize;
  }

  .wa-activity-list small,
  .wa-activity-list time {
    color: #8a94a0;
    font-size: 8px;
  }

  .wa-empty,
  .wa-loading {
    min-height: 220px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    color: #7e8996;
    text-align: center;
  }

  .wa-empty.small {
    min-height: 150px;
  }

  .wa-empty strong,
  .wa-loading strong {
    color: #30353c;
    font-size: 11px;
  }

  .wa-empty span {
    max-width: 360px;
    font-size: 9px;
  }

  .wa-loading {
    min-height: 55vh;
  }

  .wa-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e3e7eb;
    border-top-color: #20242a;
    border-radius: 999px;
    animation: waSpin 0.8s linear infinite;
  }

  @keyframes waSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 960px) {
    .wa-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .wa-secondary-grid,
    .wa-bottom-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767px) {
    .wa-page {
      width: calc(100% + 34px);
      margin-left: -17px;
      margin-right: -17px;
      padding: 14px 8px 38px;
    }

    .wa-command {
      align-items: flex-start;
      gap: 12px;
    }

    .wa-command > div:first-child {
      min-width: 0;
      flex: 1;
    }

    .wa-command > div:first-child > span {
      display: none;
    }

    .wa-command-actions {
      gap: 7px;
    }

    .wa-command select {
      min-width: 112px;
      height: 34px;
      padding-left: 9px;
      font-size: 9px;
    }

    .wa-btn {
      width: 35px;
      height: 34px;
      padding: 0;
      font-size: 0;
    }

    .wa-btn svg {
      width: 14px;
      height: 14px;
    }

    .wa-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }

    .wa-stat {
      min-height: 82px;
      padding: 12px;
    }

    .wa-stat strong {
      font-size: 20px;
    }

    .wa-stat small {
      display: none;
    }

    .wa-panel {
      padding: 14px 12px;
      border-radius: 8px;
    }

    .wa-trend-panel,
    .wa-secondary-grid,
    .wa-bottom-grid {
      margin-bottom: 10px;
    }

    .wa-panel-head {
      margin-bottom: 10px;
    }

    .wa-panel-head > div > span {
      font-size: 9px;
    }

    .wa-metric-tabs {
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 3px;
      scrollbar-width: none;
    }

    .wa-metric-tabs::-webkit-scrollbar {
      display: none;
    }

    .wa-metric-tabs button {
      flex: 0 0 auto;
    }

    .wa-chart {
      min-width: 610px;
      height: auto;
    }

    .wa-ranking-row {
      min-height: 54px;
    }

    .wa-intent-grid {
      gap: 8px;
    }

    .wa-intent-grid article {
      min-height: 68px;
      padding: 11px;
    }
  }
`;
