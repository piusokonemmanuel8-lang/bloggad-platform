import { useEffect, useState } from 'react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

export default function AffiliateDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/affiliate/dashboard');
        setDashboard(data?.dashboard || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="container section-space">
          <div className="surface-card surface-card-padding">{error}</div>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const website = dashboard?.website;
  const subscription = dashboard?.subscription;

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Affiliate Dashboard</h1>
          <p className="page-subtitle">
            Manage your website, products, posts, sliders, menus, and analytics.
          </p>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Products</div>
            <div className="stat-value">{stats?.products?.total_products || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Posts</div>
            <div className="stat-value">{stats?.posts?.total_posts || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Product Views</div>
            <div className="stat-value">{stats?.analytics?.total_product_views || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Product Clicks</div>
            <div className="stat-value">{stats?.analytics?.total_product_clicks || 0}</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Website</h2>
            {website ? (
              <div className="form-stack">
                <div><strong>Name:</strong> {website.website_name}</div>
                <div><strong>Slug:</strong> {website.slug}</div>
                <div><strong>Status:</strong> {website.status}</div>
                <div><strong>Public URL:</strong> {website.public_url}</div>
              </div>
            ) : (
              <div>No website created yet.</div>
            )}
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Subscription</h2>
            {subscription ? (
              <div className="form-stack">
                <div><strong>Status:</strong> {subscription.status}</div>
                <div><strong>Plan:</strong> {subscription.plan?.name || '-'}</div>
                <div>
                  <strong>Price:</strong>{' '}
                  {subscription.plan?.price !== null
                    ? formatCurrency(subscription.plan.price)
                    : '-'}
                </div>
                <div><strong>End Date:</strong> {subscription.end_date || subscription.trial_end || '-'}</div>
              </div>
            ) : (
              <div>No subscription yet.</div>
            )}
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Recent Products</h2>
            <div className="form-stack">
              {(dashboard?.recent?.products || []).length ? (
                dashboard.recent.products.map((item) => (
                  <div key={item.id} className="surface-card surface-card-padding">
                    <div><strong>{item.title}</strong></div>
                    <div>Status: {item.status}</div>
                  </div>
                ))
              ) : (
                <div>No products yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Recent Posts</h2>
            <div className="form-stack">
              {(dashboard?.recent?.posts || []).length ? (
                dashboard.recent.posts.map((item) => (
                  <div key={item.id} className="surface-card surface-card-padding">
                    <div><strong>{item.title}</strong></div>
                    <div>Status: {item.status}</div>
                  </div>
                ))
              ) : (
                <div>No posts yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}