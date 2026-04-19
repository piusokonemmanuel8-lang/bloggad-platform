import { useEffect, useMemo, useState } from 'react';
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

export default function AffiliateAnalyticsPage() {
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