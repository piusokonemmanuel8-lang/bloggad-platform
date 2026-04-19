import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AffiliateAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/affiliate/analytics');
        setAnalytics(data?.analytics || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading analytics...</div>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const clickBreakdown = analytics?.click_breakdown || {};
  const topProducts = analytics?.top_products || [];
  const topPosts = analytics?.top_posts || [];
  const recentActivity = analytics?.recent_activity || [];

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            Track product views, clicks, post performance, and recent website activity.
          </p>
        </div>

        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Products</div>
            <div className="stat-value">{overview.total_products || 0}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Posts</div>
            <div className="stat-value">{overview.total_posts || 0}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Product Views</div>
            <div className="stat-value">{overview.total_product_views || 0}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Product Clicks</div>
            <div className="stat-value">{overview.total_product_clicks || 0}</div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Post Views</div>
            <div className="stat-value">{overview.total_post_views || 0}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Slider Clicks</div>
            <div className="stat-value">{overview.total_slider_clicks || 0}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Buy Now Clicks</div>
            <div className="stat-value">{clickBreakdown.buy_now || 0}</div>
          </div>

          <div className="stat-box">
            <div className="stat-label">Read More / Learn More</div>
            <div className="stat-value">
              {(clickBreakdown.read_more || 0) + (clickBreakdown.learn_more || 0)}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Top Products</h2>

            <div className="form-stack">
              {topProducts.length ? (
                topProducts.map((item) => (
                  <div key={item.id} className="surface-card surface-card-padding">
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Views: {item.total_views || 0}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Clicks: {item.total_clicks || 0}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Posts: {item.total_posts || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div>No product analytics yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Top Posts</h2>

            <div className="form-stack">
              {topPosts.length ? (
                topPosts.map((item) => (
                  <div key={item.id} className="surface-card surface-card-padding">
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Views: {item.total_views || 0}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      CTA Buttons: {item.total_cta_buttons || 0}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Product: {item.product?.title || '-'}
                    </div>
                  </div>
                ))
              ) : (
                <div>No post analytics yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="surface-card surface-card-padding">
          <h2 className="section-title">Recent Activity</h2>

          <div className="form-stack">
            {recentActivity.length ? (
              recentActivity.map((item) => (
                <div key={`${item.activity_type}-${item.id}`} className="surface-card surface-card-padding">
                  <div style={{ fontWeight: 700 }}>{item.activity_type}</div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Click Type: {item.click_type || '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Product: {item.product?.title || '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Post: {item.post?.title || '-'}
                  </div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Date: {item.created_at || '-'}
                  </div>
                </div>
              ))
            ) : (
              <div>No recent analytics activity yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}