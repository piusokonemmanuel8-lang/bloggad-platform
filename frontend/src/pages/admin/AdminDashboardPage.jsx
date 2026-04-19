import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/admin/dashboard');
        setDashboard(data?.dashboard || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading admin dashboard...</div>
      </div>
    );
  }

  const users = dashboard?.users || {};
  const websites = dashboard?.websites || {};
  const products = dashboard?.products || {};
  const posts = dashboard?.posts || {};
  const categories = dashboard?.categories || {};
  const plans = dashboard?.plans || {};
  const subscriptions = dashboard?.subscriptions || {};
  const analytics = dashboard?.analytics || {};
  const linkValidation = dashboard?.link_validation || {};

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Monitor affiliates, websites, products, posts, plans, analytics, and link validation.
          </p>
        </div>

        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Users</div>
            <div className="stat-value">{users.total_users || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Affiliates</div>
            <div className="stat-value">{users.total_affiliates || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Websites</div>
            <div className="stat-value">{websites.total_websites || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Products</div>
            <div className="stat-value">{products.total_products || 0}</div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Posts</div>
            <div className="stat-value">{posts.total_posts || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Categories</div>
            <div className="stat-value">{categories.total_categories || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Plans</div>
            <div className="stat-value">{plans.total_plans || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Subscriptions</div>
            <div className="stat-value">{subscriptions.total_subscriptions || 0}</div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Product Views</div>
            <div className="stat-value">{analytics.total_product_views || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Product Clicks</div>
            <div className="stat-value">{analytics.total_product_clicks || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Post Views</div>
            <div className="stat-value">{analytics.total_post_views || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Slider Clicks</div>
            <div className="stat-value">{analytics.total_slider_clicks || 0}</div>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Passed Link Logs</div>
            <div className="stat-value">{linkValidation.total_passed_logs || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Failed Link Logs</div>
            <div className="stat-value">{linkValidation.total_failed_logs || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{users.total_active_users || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Active Websites</div>
            <div className="stat-value">{websites.total_active_websites || 0}</div>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Recent Affiliates</h2>
            <div className="form-stack">
              {(dashboard?.recent_affiliates || []).length ? (
                dashboard.recent_affiliates.map((item) => (
                  <div key={item.id} className="surface-card surface-card-padding">
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>{item.email}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>Status: {item.status}</div>
                  </div>
                ))
              ) : (
                <div>No recent affiliates.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Recent Products</h2>
            <div className="form-stack">
              {(dashboard?.recent_products || []).length ? (
                dashboard.recent_products.map((item) => (
                  <div key={item.id} className="surface-card surface-card-padding">
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Affiliate: {item.affiliate_name || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>Status: {item.status}</div>
                  </div>
                ))
              ) : (
                <div>No recent products.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Recent Posts</h2>
            <div className="form-stack">
              {(dashboard?.recent_posts || []).length ? (
                dashboard.recent_posts.map((item) => (
                  <div key={item.id} className="surface-card surface-card-padding">
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Affiliate: {item.affiliate_name || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>Status: {item.status}</div>
                  </div>
                ))
              ) : (
                <div>No recent posts.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}