import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ShoppingBag,
  FileText,
  MousePointerClick,
  Eye,
  CreditCard,
  Palette,
  Image as ImageIcon,
  BarChart3,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Layers3,
} from 'lucide-react';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';

function extractFirstName(user) {
  if (!user) return 'Affiliate';

  const possibleName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    user?.first_name ||
    user?.firstName ||
    '';

  if (!possibleName || typeof possibleName !== 'string') return 'Affiliate';

  return possibleName.trim().split(' ')[0] || 'Affiliate';
}

function getGreeting(name = '') {
  const hour = new Date().getHours();

  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <div className="affiliate-dashboard-stat-card">
      <div className="affiliate-dashboard-stat-top">
        <div>
          <p className="affiliate-dashboard-stat-label">{title}</p>
          <h3 className="affiliate-dashboard-stat-value">{value}</h3>
        </div>

        <div className="affiliate-dashboard-stat-icon">
          <Icon size={20} />
        </div>
      </div>

      <p className="affiliate-dashboard-stat-hint">{hint}</p>
    </div>
  );
}

function QuickActionCard({ title, text, to, icon: Icon }) {
  return (
    <Link to={to} className="affiliate-dashboard-quick-card">
      <div className="affiliate-dashboard-quick-card-top">
        <div className="affiliate-dashboard-quick-icon">
          <Icon size={18} />
        </div>

        <ArrowRight size={17} />
      </div>

      <h3 className="affiliate-dashboard-quick-title">{title}</h3>
      <p className="affiliate-dashboard-quick-text">{text}</p>
    </Link>
  );
}

export default function AffiliateDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const firstName = useMemo(() => extractFirstName(user), [user]);
  const greeting = useMemo(() => getGreeting(firstName), [firstName]);

  const fetchDashboard = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/api/affiliate/dashboard');
      setDashboard(data?.dashboard || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = dashboard?.stats || {};
  const website = dashboard?.website || null;
  const subscription = dashboard?.subscription || null;
  const recentProducts = dashboard?.recent?.products || [];
  const recentPosts = dashboard?.recent?.posts || [];

  if (loading) {
    return (
      <div className="affiliate-dashboard-page">
        <style>{styles}</style>

        <div className="affiliate-dashboard-loading-wrap">
          <div className="affiliate-dashboard-loading-card">
            <div className="affiliate-dashboard-spinner" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-dashboard-page">
      <style>{styles}</style>

      <section className="affiliate-dashboard-hero">
        <div className="affiliate-dashboard-hero-copy">
          <div className="affiliate-dashboard-badge">Affiliate overview</div>
          <h1 className="affiliate-dashboard-title">{greeting}</h1>
          <p className="affiliate-dashboard-subtitle">
            Welcome to your affiliate dashboard. Manage your website, products,
            posts, sliders, menus, design, analytics, and subscription from one place.
          </p>
        </div>

        <div className="affiliate-dashboard-hero-actions">
          <button
            type="button"
            className="affiliate-dashboard-refresh-btn"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link to="/affiliate/products/create" className="affiliate-dashboard-primary-btn">
            Add Product
          </Link>
        </div>
      </section>

      {error ? (
        <div className="affiliate-dashboard-error-card">
          <p>{error}</p>
        </div>
      ) : null}

      <section className="affiliate-dashboard-stats-grid">
        <StatCard
          title="Products"
          value={stats?.products?.total_products || 0}
          icon={ShoppingBag}
          hint="Total products inside your store"
        />
        <StatCard
          title="Posts"
          value={stats?.posts?.total_posts || 0}
          icon={FileText}
          hint="Published and drafted blog content"
        />
        <StatCard
          title="Product Views"
          value={stats?.analytics?.total_product_views || 0}
          icon={Eye}
          hint="How many times visitors viewed products"
        />
        <StatCard
          title="Product Clicks"
          value={stats?.analytics?.total_product_clicks || 0}
          icon={MousePointerClick}
          hint="Affiliate click activity from your pages"
        />
      </section>

      <section className="affiliate-dashboard-main-grid">
        <div className="affiliate-dashboard-panel affiliate-dashboard-panel-large">
          <div className="affiliate-dashboard-panel-head">
            <div>
              <p className="affiliate-dashboard-panel-kicker">Website</p>
              <h2 className="affiliate-dashboard-panel-title">Store overview</h2>
            </div>

            <Link to="/affiliate/website" className="affiliate-dashboard-panel-link">
              Open page
            </Link>
          </div>

          {website ? (
            <div className="affiliate-dashboard-website-grid">
              <div className="affiliate-dashboard-info-box">
                <span className="affiliate-dashboard-info-label">Website name</span>
                <strong>{website.website_name || '-'}</strong>
              </div>

              <div className="affiliate-dashboard-info-box">
                <span className="affiliate-dashboard-info-label">Slug</span>
                <strong>{website.slug || '-'}</strong>
              </div>

              <div className="affiliate-dashboard-info-box">
                <span className="affiliate-dashboard-info-label">Status</span>
                <strong className="affiliate-dashboard-status-pill">
                  {website.status || 'Draft'}
                </strong>
              </div>

              <div className="affiliate-dashboard-info-box affiliate-dashboard-info-box-wide">
                <span className="affiliate-dashboard-info-label">Public URL</span>

                {website.public_url ? (
                  <a
                    href={website.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="affiliate-dashboard-public-link"
                  >
                    <span>{website.public_url}</span>
                    <ExternalLink size={15} />
                  </a>
                ) : (
                  <strong>-</strong>
                )}
              </div>
            </div>
          ) : (
            <div className="affiliate-dashboard-empty-state">
              <Globe size={24} />
              <h3>No website created yet</h3>
              <p>Create your affiliate website to start showing products and posts.</p>
              <Link to="/affiliate/website" className="affiliate-dashboard-primary-btn alt">
                Set up website
              </Link>
            </div>
          )}
        </div>

        <div className="affiliate-dashboard-panel">
          <div className="affiliate-dashboard-panel-head">
            <div>
              <p className="affiliate-dashboard-panel-kicker">Subscription</p>
              <h2 className="affiliate-dashboard-panel-title">Plan details</h2>
            </div>

            <Link to="/affiliate/subscription" className="affiliate-dashboard-panel-link">
              Manage
            </Link>
          </div>

          {subscription ? (
            <div className="affiliate-dashboard-subscription-stack">
              <div className="affiliate-dashboard-mini-row">
                <span>Status</span>
                <strong>{subscription.status || '-'}</strong>
              </div>
              <div className="affiliate-dashboard-mini-row">
                <span>Plan</span>
                <strong>{subscription.plan?.name || '-'}</strong>
              </div>
              <div className="affiliate-dashboard-mini-row">
                <span>Price</span>
                <strong>
                  {subscription.plan?.price !== null &&
                  subscription.plan?.price !== undefined
                    ? formatCurrency(subscription.plan.price)
                    : '-'}
                </strong>
              </div>
              <div className="affiliate-dashboard-mini-row">
                <span>End date</span>
                <strong>{subscription.end_date || subscription.trial_end || '-'}</strong>
              </div>
            </div>
          ) : (
            <div className="affiliate-dashboard-empty-small">
              <CreditCard size={22} />
              <p>No subscription yet.</p>
            </div>
          )}
        </div>
      </section>

      <section className="affiliate-dashboard-quick-grid">
        <QuickActionCard
          title="Manage Products"
          text="Add products, edit details, and prepare links for your storefront."
          to="/affiliate/products"
          icon={ShoppingBag}
        />
        <QuickActionCard
          title="Create Post"
          text="Write content that supports your products and drives clicks."
          to="/affiliate/posts/create"
          icon={FileText}
        />
        <QuickActionCard
          title="Customize Design"
          text="Control the look and feel of your affiliate website."
          to="/affiliate/design"
          icon={Palette}
        />
        <QuickActionCard
          title="Media Library"
          text="Upload and manage banners, images, and visual assets."
          to="/affiliate/media"
          icon={ImageIcon}
        />
        <QuickActionCard
          title="Analytics"
          text="Track views, clicks, and general store performance."
          to="/affiliate/analytics"
          icon={BarChart3}
        />
        <QuickActionCard
          title="Templates"
          text="Choose the layout style for your affiliate website."
          to="/affiliate/templates/choose"
          icon={Layers3}
        />
      </section>

      <section className="affiliate-dashboard-bottom-grid">
        <div className="affiliate-dashboard-panel">
          <div className="affiliate-dashboard-panel-head">
            <div>
              <p className="affiliate-dashboard-panel-kicker">Recent products</p>
              <h2 className="affiliate-dashboard-panel-title">Latest product activity</h2>
            </div>

            <Link to="/affiliate/products" className="affiliate-dashboard-panel-link">
              View all
            </Link>
          </div>

          {recentProducts.length ? (
            <div className="affiliate-dashboard-list">
              {recentProducts.map((item) => (
                <div key={item.id} className="affiliate-dashboard-list-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p>Product item</p>
                  </div>

                  <span className="affiliate-dashboard-list-status">
                    {item.status || 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="affiliate-dashboard-empty-small">
              <ShoppingBag size={22} />
              <p>No products yet.</p>
            </div>
          )}
        </div>

        <div className="affiliate-dashboard-panel">
          <div className="affiliate-dashboard-panel-head">
            <div>
              <p className="affiliate-dashboard-panel-kicker">Recent posts</p>
              <h2 className="affiliate-dashboard-panel-title">Latest content activity</h2>
            </div>

            <Link to="/affiliate/posts/create" className="affiliate-dashboard-panel-link">
              Open posts
            </Link>
          </div>

          {recentPosts.length ? (
            <div className="affiliate-dashboard-list">
              {recentPosts.map((item) => (
                <div key={item.id} className="affiliate-dashboard-list-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p>Post item</p>
                  </div>

                  <span className="affiliate-dashboard-list-status">
                    {item.status || 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="affiliate-dashboard-empty-small">
              <FileText size={22} />
              <p>No posts yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-dashboard-page {
    width: 100%;
  }

  .affiliate-dashboard-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-dashboard-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-dashboard-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliate-spin 0.8s linear infinite;
  }

  @keyframes affiliate-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliate-spin 0.8s linear infinite;
  }

  .affiliate-dashboard-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-dashboard-badge {
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

  .affiliate-dashboard-title {
    margin: 0;
    font-size: 32px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-dashboard-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-dashboard-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  .affiliate-dashboard-refresh-btn,
  .affiliate-dashboard-primary-btn {
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

  .affiliate-dashboard-primary-btn {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-dashboard-primary-btn.alt {
    background: #111827;
    color: #ffffff;
  }

  .affiliate-dashboard-refresh-btn:hover,
  .affiliate-dashboard-primary-btn:hover,
  .affiliate-dashboard-panel-link:hover,
  .affiliate-dashboard-public-link:hover,
  .affiliate-dashboard-quick-card:hover {
    transform: translateY(-1px);
  }

  .affiliate-dashboard-refresh-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .affiliate-dashboard-error-card {
    margin-bottom: 20px;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
    border-radius: 20px;
    padding: 16px 18px;
    font-weight: 700;
  }

  .affiliate-dashboard-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-dashboard-stat-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-dashboard-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-dashboard-stat-label {
    margin: 0 0 10px;
    font-size: 13px;
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-dashboard-stat-value {
    margin: 0;
    font-size: 30px;
    line-height: 1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-dashboard-stat-icon {
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

  .affiliate-dashboard-stat-hint {
    margin: 14px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: #6b7280;
  }

  .affiliate-dashboard-main-grid,
  .affiliate-dashboard-bottom-grid {
    display: grid;
    grid-template-columns: 1.35fr 0.85fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .affiliate-dashboard-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
  }

  .affiliate-dashboard-panel-large {
    min-height: 100%;
  }

  .affiliate-dashboard-panel-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .affiliate-dashboard-panel-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-dashboard-panel-title {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-dashboard-panel-link {
    text-decoration: none;
    color: #111827;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
  }

  .affiliate-dashboard-website-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .affiliate-dashboard-info-box {
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 18px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .affiliate-dashboard-info-box-wide {
    grid-column: span 2;
  }

  .affiliate-dashboard-info-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .affiliate-dashboard-status-pill {
    display: inline-flex;
    width: fit-content;
    padding: 8px 12px;
    border-radius: 999px;
    background: #e5eefc;
    color: #1d4ed8;
  }

  .affiliate-dashboard-public-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #111827;
    text-decoration: none;
    word-break: break-all;
    font-weight: 800;
  }

  .affiliate-dashboard-subscription-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-dashboard-mini-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    font-size: 14px;
  }

  .affiliate-dashboard-mini-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-dashboard-mini-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-dashboard-quick-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .affiliate-dashboard-quick-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 22px;
    padding: 20px;
    text-decoration: none;
    color: #111827;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    transition: 0.2s ease;
  }

  .affiliate-dashboard-quick-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .affiliate-dashboard-quick-icon {
    width: 44px;
    height: 44px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    background: #f8fafc;
    border: 1px solid #edf2f7;
  }

  .affiliate-dashboard-quick-title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 900;
    line-height: 1.25;
  }

  .affiliate-dashboard-quick-text {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.7;
  }

  .affiliate-dashboard-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .affiliate-dashboard-list-item {
    padding: 16px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .affiliate-dashboard-list-item h3 {
    margin: 0 0 5px;
    font-size: 15px;
    font-weight: 800;
    color: #111827;
  }

  .affiliate-dashboard-list-item p {
    margin: 0;
    font-size: 13px;
    color: #6b7280;
  }

  .affiliate-dashboard-list-status {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    font-size: 12px;
    font-weight: 800;
    color: #111827;
    white-space: nowrap;
  }

  .affiliate-dashboard-empty-state,
  .affiliate-dashboard-empty-small {
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

  .affiliate-dashboard-empty-state h3,
  .affiliate-dashboard-empty-small p {
    margin: 0;
    color: #111827;
    font-weight: 800;
  }

  .affiliate-dashboard-empty-state p {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
    max-width: 440px;
  }

  @media (max-width: 1200px) {
    .affiliate-dashboard-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .affiliate-dashboard-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 991px) {
    .affiliate-dashboard-hero,
    .affiliate-dashboard-main-grid,
    .affiliate-dashboard-bottom-grid {
      grid-template-columns: 1fr;
      display: grid;
    }

    .affiliate-dashboard-hero {
      padding: 20px;
    }

    .affiliate-dashboard-hero-actions {
      width: 100%;
    }

    .affiliate-dashboard-title {
      font-size: 26px;
    }

    .affiliate-dashboard-panel {
      padding: 18px;
    }
  }

  @media (max-width: 767px) {
    .affiliate-dashboard-stats-grid,
    .affiliate-dashboard-quick-grid,
    .affiliate-dashboard-website-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-dashboard-info-box-wide {
      grid-column: span 1;
    }

    .affiliate-dashboard-title {
      font-size: 23px;
    }

    .affiliate-dashboard-subtitle {
      font-size: 14px;
    }

    .affiliate-dashboard-list-item,
    .affiliate-dashboard-panel-head,
    .affiliate-dashboard-mini-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .affiliate-dashboard-list-status {
      white-space: normal;
    }

    .affiliate-dashboard-refresh-btn,
    .affiliate-dashboard-primary-btn {
      width: 100%;
    }

    .affiliate-dashboard-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;