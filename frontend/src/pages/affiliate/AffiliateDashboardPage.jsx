import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ShoppingBag,
  FileText,
  MousePointerClick,
  Eye,
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
  if (!user) return 'Writer';

  const possibleName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    user?.first_name ||
    user?.firstName ||
    '';

  if (!possibleName || typeof possibleName !== 'string') return 'Writer';

  return possibleName.trim().split(' ')[0] || 'Writer';
}

function getGreeting(name = '') {
  const hour = new Date().getHours();

  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function statusClass(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'active' || normalized === 'published') {
    return ' is-active';
  }

  if (normalized === 'trial' || normalized === 'trialing') {
    return ' is-trial';
  }

  return '';
}

function StatCard({ title, value, icon: Icon, hint }) {
  return (
    <article className="writer-dashboard-stat">
      <div className="writer-dashboard-stat-top">
        <div>
          <p className="writer-dashboard-stat-label">{title}</p>
          <strong className="writer-dashboard-stat-value">{value}</strong>
        </div>

        <span className="writer-dashboard-stat-icon" aria-hidden="true">
          <Icon size={17} strokeWidth={1.7} />
        </span>
      </div>

      <p className="writer-dashboard-stat-hint">{hint}</p>
    </article>
  );
}

function QuickActionCard({ title, text, to, icon: Icon }) {
  return (
    <Link to={to} className="writer-dashboard-action-card">
      <span className="writer-dashboard-action-icon" aria-hidden="true">
        <Icon size={17} strokeWidth={1.7} />
      </span>

      <span className="writer-dashboard-action-copy">
        <strong>{title}</strong>
        <span>{text}</span>
      </span>

      <ArrowRight
        size={15}
        strokeWidth={1.7}
        className="writer-dashboard-action-arrow"
        aria-hidden="true"
      />
    </Link>
  );
}

function ActivityList({ items, kind, emptyIcon: EmptyIcon, emptyText }) {
  if (!items.length) {
    return (
      <div className="writer-dashboard-empty-compact">
        <EmptyIcon size={19} strokeWidth={1.6} />
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <div className="writer-dashboard-activity-list">
      {items.map((item) => (
        <div key={item.id} className="writer-dashboard-activity-row">
          <div className="writer-dashboard-activity-copy">
            <strong>{item.title || (kind === 'product' ? 'Untitled product' : 'Untitled post')}</strong>
            <span>{kind === 'product' ? 'Product item' : 'Post item'}</span>
          </div>

          <span
            className={`writer-dashboard-status${statusClass(item.status)}`}
          >
            {item.status || 'Draft'}
          </span>
        </div>
      ))}
    </div>
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
      <div className="writer-dashboard-page">
        <style>{styles}</style>
        <div className="writer-dashboard-loading">
          <span className="writer-dashboard-spinner" />
          <strong>Loading dashboard...</strong>
          <span>Preparing your Writer overview.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="writer-dashboard-page">
      <style>{styles}</style>

      <section className="writer-dashboard-hero">
        <div className="writer-dashboard-hero-copy">
          <p className="writer-dashboard-eyebrow">Writer overview</p>
          <h1>{greeting}</h1>
          <p className="writer-dashboard-lead">
            Manage your Writer Space, publishing, products, audience and performance
            from one clear workspace.
          </p>
        </div>

        <div className="writer-dashboard-hero-actions">
          <Link
            to="/affiliate/products/create"
            className="writer-dashboard-button primary"
          >
            Add product
          </Link>

          <button
            type="button"
            className="writer-dashboard-button secondary"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              strokeWidth={1.8}
              className={refreshing ? 'spin' : ''}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      {error ? (
        <div className="writer-dashboard-error" role="alert">
          <strong>Dashboard could not refresh.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <section className="writer-dashboard-stats" aria-label="Writer statistics">
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
          title="Product views"
          value={stats?.analytics?.total_product_views || 0}
          icon={Eye}
          hint="How many times visitors viewed products"
        />
        <StatCard
          title="Product clicks"
          value={stats?.analytics?.total_product_clicks || 0}
          icon={MousePointerClick}
          hint="Writer click activity from your pages"
        />
      </section>

      <section className="writer-dashboard-overview-grid">
        <article className="writer-dashboard-panel writer-dashboard-store-panel">
          <div className="writer-dashboard-panel-head">
            <div>
              <p className="writer-dashboard-panel-kicker">Storefront</p>
              <h2>Store overview</h2>
            </div>

            <Link to="/affiliate/website" className="writer-dashboard-text-link">
              Open page
              <ArrowRight size={14} strokeWidth={1.7} />
            </Link>
          </div>

          {website ? (
            <div className="writer-dashboard-store-grid">
              <div className="writer-dashboard-detail">
                <span>Website name</span>
                <strong>{website.website_name || '-'}</strong>
              </div>

              <div className="writer-dashboard-detail">
                <span>Slug</span>
                <strong>{website.slug || '-'}</strong>
              </div>

              <div className="writer-dashboard-detail">
                <span>Status</span>
                <strong
                  className={`writer-dashboard-status${statusClass(website.status)}`}
                >
                  {website.status || 'Draft'}
                </strong>
              </div>

              <div className="writer-dashboard-detail wide">
                <span>Public URL</span>

                {website.public_url ? (
                  <a
                    href={website.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="writer-dashboard-public-link"
                  >
                    <span>{website.public_url}</span>
                    <ExternalLink size={13} strokeWidth={1.7} />
                  </a>
                ) : (
                  <strong>-</strong>
                )}
              </div>
            </div>
          ) : (
            <div className="writer-dashboard-empty">
              <span className="writer-dashboard-empty-icon">
                <Globe size={20} strokeWidth={1.6} />
              </span>
              <div>
                <strong>No website created yet</strong>
                <p>Create your Writer Space to start showing products and posts.</p>
              </div>
              <Link
                to="/affiliate/website"
                className="writer-dashboard-button secondary compact"
              >
                Set up website
              </Link>
            </div>
          )}
        </article>

        <article className="writer-dashboard-panel">
          <div className="writer-dashboard-panel-head">
            <div>
              <p className="writer-dashboard-panel-kicker">Subscription</p>
              <h2>Plan details</h2>
            </div>

            <Link
              to="/affiliate/subscription"
              className="writer-dashboard-text-link"
            >
              Manage
              <ArrowRight size={14} strokeWidth={1.7} />
            </Link>
          </div>

          {subscription ? (
            <div className="writer-dashboard-plan-list">
              <div>
                <span>Status</span>
                <strong
                  className={`writer-dashboard-status${statusClass(subscription.status)}`}
                >
                  {subscription.status || '-'}
                </strong>
              </div>

              <div>
                <span>Plan</span>
                <strong>{subscription.plan?.name || '-'}</strong>
              </div>

              <div>
                <span>Price</span>
                <strong>
                  {subscription.plan?.price !== null &&
                  subscription.plan?.price !== undefined
                    ? formatCurrency(subscription.plan.price)
                    : '-'}
                </strong>
              </div>

              <div>
                <span>Ends</span>
                <strong>{subscription.end_date || subscription.trial_end || '-'}</strong>
              </div>
            </div>
          ) : (
            <div className="writer-dashboard-empty-compact plan-empty">
              <span>No subscription yet.</span>
            </div>
          )}
        </article>
      </section>

      <section className="writer-dashboard-section">
        <div className="writer-dashboard-section-head">
          <div>
            <p className="writer-dashboard-panel-kicker">Shortcuts</p>
            <h2>Quick actions</h2>
          </div>
        </div>

        <div className="writer-dashboard-actions-grid">
          <QuickActionCard
            title="Manage products"
            text="Add products, edit details, and prepare links for your storefront."
            to="/affiliate/products"
            icon={ShoppingBag}
          />
          <QuickActionCard
            title="Create post"
            text="Write content that supports your products and drives clicks."
            to="/affiliate/posts/create"
            icon={FileText}
          />
          <QuickActionCard
            title="Customize design"
            text="Control the look and feel of your Writer Space."
            to="/affiliate/design"
            icon={Palette}
          />
          <QuickActionCard
            title="Media library"
            text="Manage images and media used across your Writer Space."
            to="/affiliate/media"
            icon={ImageIcon}
          />
          <QuickActionCard
            title="Analytics"
            text="Review product views, clicks and performance."
            to="/affiliate/analytics"
            icon={BarChart3}
          />
          <QuickActionCard
            title="Templates"
            text="Choose the layout style for your Writer Space."
            to="/affiliate/templates/choose"
            icon={Layers3}
          />
        </div>
      </section>

      <section className="writer-dashboard-activity-grid">
        <article className="writer-dashboard-panel">
          <div className="writer-dashboard-panel-head">
            <div>
              <p className="writer-dashboard-panel-kicker">Recent products</p>
              <h2>Latest product activity</h2>
            </div>

            <Link
              to="/affiliate/products"
              className="writer-dashboard-text-link"
            >
              View all
              <ArrowRight size={14} strokeWidth={1.7} />
            </Link>
          </div>

          <ActivityList
            items={recentProducts}
            kind="product"
            emptyIcon={ShoppingBag}
            emptyText="No products yet."
          />
        </article>

        <article className="writer-dashboard-panel">
          <div className="writer-dashboard-panel-head">
            <div>
              <p className="writer-dashboard-panel-kicker">Recent posts</p>
              <h2>Latest content activity</h2>
            </div>

            <Link
              to="/affiliate/posts/create"
              className="writer-dashboard-text-link"
            >
              Open posts
              <ArrowRight size={14} strokeWidth={1.7} />
            </Link>
          </div>

          <ActivityList
            items={recentPosts}
            kind="post"
            emptyIcon={FileText}
            emptyText="No posts yet."
          />
        </article>
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .writer-dashboard-page {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    color: #17191f;
  }

  .writer-dashboard-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
    margin-bottom: 24px;
  }

  .writer-dashboard-hero-copy {
    min-width: 0;
    max-width: 720px;
  }

  .writer-dashboard-eyebrow,
  .writer-dashboard-panel-kicker {
    margin: 0 0 7px;
    color: #8a929c;
    font-size: 9px;
    line-height: 1.35;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .writer-dashboard-hero h1 {
    margin: 0;
    color: #17191f;
    font-size: clamp(28px, 3vw, 38px);
    line-height: 1.08;
    font-weight: 760;
    letter-spacing: -0.035em;
  }

  .writer-dashboard-lead {
    margin: 11px 0 0;
    color: #69727e;
    max-width: 660px;
    font-size: 13px;
    line-height: 1.55;
  }

  .writer-dashboard-hero-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
  }

  .writer-dashboard-button {
    min-height: 39px;
    border-radius: 8px;
    padding: 0 14px;
    border: 1px solid transparent;
    font: inherit;
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .writer-dashboard-button.primary {
    background: #1c1f24;
    border-color: #1c1f24;
    color: #ffffff;
  }

  .writer-dashboard-button.primary:hover {
    background: #292d33;
  }

  .writer-dashboard-button.secondary {
    background: #ffffff;
    border-color: #d9dde1;
    color: #3f4752;
  }

  .writer-dashboard-button.secondary:hover {
    background: #f8f9fa;
    border-color: #cbd0d5;
  }

  .writer-dashboard-button:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  .writer-dashboard-button.compact {
    min-height: 34px;
    padding-inline: 12px;
  }

  .writer-dashboard-error {
    margin: 0 0 18px;
    min-height: 48px;
    padding: 11px 14px;
    border: 1px solid #edd3d0;
    border-radius: 8px;
    background: #fff8f7;
    display: flex;
    align-items: center;
    gap: 9px;
    flex-wrap: wrap;
    color: #7d332e;
    font-size: 11px;
  }

  .writer-dashboard-error strong {
    color: #612520;
  }

  .writer-dashboard-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border: 1px solid #dfe3e6;
    border-radius: 10px;
    overflow: hidden;
    background: #ffffff;
    margin-bottom: 18px;
  }

  .writer-dashboard-stat {
    min-width: 0;
    min-height: 120px;
    padding: 18px 19px;
    background: #ffffff;
  }

  .writer-dashboard-stat + .writer-dashboard-stat {
    border-left: 1px solid #e6e9eb;
  }

  .writer-dashboard-stat-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .writer-dashboard-stat-label {
    margin: 0 0 8px;
    color: #717a85;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 650;
  }

  .writer-dashboard-stat-value {
    display: block;
    color: #17191f;
    font-size: 28px;
    line-height: 1;
    font-weight: 730;
    letter-spacing: -0.035em;
  }

  .writer-dashboard-stat-icon {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: #f4f5f6;
    color: #717984;
    flex-shrink: 0;
  }

  .writer-dashboard-stat-hint {
    margin: 14px 0 0;
    color: #979ea7;
    font-size: 9.5px;
    line-height: 1.4;
  }

  .writer-dashboard-overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.75fr);
    gap: 18px;
    margin-bottom: 22px;
  }

  .writer-dashboard-panel {
    min-width: 0;
    border: 1px solid #dfe3e6;
    border-radius: 10px;
    background: #ffffff;
    padding: 19px;
  }

  .writer-dashboard-panel-head,
  .writer-dashboard-section-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .writer-dashboard-panel-head {
    padding-bottom: 15px;
    border-bottom: 1px solid #eceeef;
  }

  .writer-dashboard-panel h2,
  .writer-dashboard-section-head h2 {
    margin: 0;
    color: #24272c;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 720;
    letter-spacing: -0.015em;
  }

  .writer-dashboard-text-link {
    color: #5c6570;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    line-height: 1.3;
    font-weight: 700;
    white-space: nowrap;
  }

  .writer-dashboard-text-link:hover {
    color: #17191f;
  }

  .writer-dashboard-store-grid {
    padding-top: 16px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .writer-dashboard-detail {
    min-width: 0;
    min-height: 66px;
    padding: 12px;
    border: 1px solid #ebedef;
    border-radius: 8px;
    background: #fafafa;
    display: grid;
    align-content: start;
    gap: 6px;
  }

  .writer-dashboard-detail.wide {
    grid-column: 1 / -1;
  }

  .writer-dashboard-detail > span,
  .writer-dashboard-plan-list > div > span {
    color: #949ba4;
    font-size: 9px;
    line-height: 1.3;
    font-weight: 650;
  }

  .writer-dashboard-detail > strong,
  .writer-dashboard-plan-list > div > strong {
    min-width: 0;
    color: #353a42;
    font-size: 11px;
    line-height: 1.4;
    font-weight: 680;
    overflow-wrap: anywhere;
  }

  .writer-dashboard-public-link {
    min-width: 0;
    color: #4d5968;
    font-size: 10.5px;
    line-height: 1.4;
    font-weight: 650;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    text-decoration: none;
  }

  .writer-dashboard-public-link span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .writer-dashboard-status {
    width: fit-content;
    max-width: 100%;
    min-height: 22px;
    padding: 0 8px;
    border: 1px solid #dde1e5;
    border-radius: 999px;
    background: #f5f6f7;
    color: #6b737d;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px !important;
    line-height: 1;
    font-weight: 750 !important;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .writer-dashboard-status.is-active {
    border-color: #d5e2d9;
    background: #f2f7f3;
    color: #496653;
  }

  .writer-dashboard-status.is-trial {
    border-color: #e6dfcf;
    background: #faf8f2;
    color: #746545;
  }

  .writer-dashboard-plan-list {
    padding-top: 6px;
    display: grid;
  }

  .writer-dashboard-plan-list > div {
    min-height: 47px;
    border-bottom: 1px solid #eff1f2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-dashboard-plan-list > div:last-child {
    border-bottom: 0;
  }

  .writer-dashboard-plan-list > div > strong {
    text-align: right;
  }

  .writer-dashboard-empty {
    min-height: 142px;
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding-top: 14px;
  }

  .writer-dashboard-empty-icon {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: #f4f5f6;
    color: #727b86;
  }

  .writer-dashboard-empty strong {
    color: #343941;
    font-size: 12px;
  }

  .writer-dashboard-empty p {
    margin: 5px 0 0;
    color: #8a929c;
    font-size: 10px;
    line-height: 1.45;
  }

  .writer-dashboard-empty-compact {
    min-height: 90px;
    color: #8b939d;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 10.5px;
  }

  .writer-dashboard-empty-compact.plan-empty {
    min-height: 146px;
  }

  .writer-dashboard-section {
    margin-bottom: 22px;
  }

  .writer-dashboard-section-head {
    margin-bottom: 11px;
  }

  .writer-dashboard-actions-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .writer-dashboard-action-card {
    min-width: 0;
    min-height: 82px;
    padding: 14px;
    border: 1px solid #dfe3e6;
    border-radius: 9px;
    background: #ffffff;
    color: inherit;
    text-decoration: none;
    display: grid;
    grid-template-columns: 31px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 11px;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }

  .writer-dashboard-action-card:hover {
    border-color: #cbd0d5;
    transform: translateY(-1px);
  }

  .writer-dashboard-action-icon {
    width: 31px;
    height: 31px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: #f4f5f6;
    color: #626c78;
  }

  .writer-dashboard-action-copy {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .writer-dashboard-action-copy strong {
    color: #343940;
    font-size: 11px;
    line-height: 1.3;
    font-weight: 710;
  }

  .writer-dashboard-action-copy > span {
    color: #9299a2;
    font-size: 9px;
    line-height: 1.45;
  }

  .writer-dashboard-action-arrow {
    color: #a0a6ad;
  }

  .writer-dashboard-activity-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .writer-dashboard-activity-list {
    display: grid;
  }

  .writer-dashboard-activity-row {
    min-height: 61px;
    border-bottom: 1px solid #eff1f2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .writer-dashboard-activity-row:last-child {
    border-bottom: 0;
  }

  .writer-dashboard-activity-copy {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  .writer-dashboard-activity-copy strong {
    color: #353a41;
    font-size: 11px;
    line-height: 1.35;
    font-weight: 690;
    overflow-wrap: anywhere;
  }

  .writer-dashboard-activity-copy span {
    color: #9aa1a9;
    font-size: 9px;
    line-height: 1.3;
  }

  .writer-dashboard-loading {
    min-height: 62vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    color: #747d88;
    font-size: 10px;
    text-align: center;
  }

  .writer-dashboard-loading strong {
    color: #333941;
    font-size: 12px;
  }

  .writer-dashboard-spinner {
    width: 26px;
    height: 26px;
    margin-bottom: 5px;
    border-radius: 999px;
    border: 2px solid #dfe3e6;
    border-top-color: #343940;
    animation: writerDashboardSpin 0.75s linear infinite;
  }

  .spin {
    animation: writerDashboardSpin 0.75s linear infinite;
  }

  @keyframes writerDashboardSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1120px) {
    .writer-dashboard-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-dashboard-stat + .writer-dashboard-stat {
      border-left: 0;
    }

    .writer-dashboard-stat:nth-child(even) {
      border-left: 1px solid #e6e9eb;
    }

    .writer-dashboard-stat:nth-child(n + 3) {
      border-top: 1px solid #e6e9eb;
    }

    .writer-dashboard-overview-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 800px) {
    .writer-dashboard-actions-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-dashboard-activity-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .writer-dashboard-page {
      max-width: none;
    }

    .writer-dashboard-hero {
      display: grid;
      gap: 18px;
      margin-bottom: 18px;
    }

    .writer-dashboard-eyebrow {
      margin-bottom: 6px;
    }

    .writer-dashboard-hero h1 {
      font-size: 29px;
      line-height: 1.08;
    }

    .writer-dashboard-lead {
      margin-top: 9px;
      font-size: 12px;
      line-height: 1.5;
    }

    .writer-dashboard-hero-actions {
      width: 100%;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
    }

    .writer-dashboard-button {
      min-height: 42px;
    }

    .writer-dashboard-hero-actions .writer-dashboard-button.primary {
      grid-column: 1;
      grid-row: 1;
    }

    .writer-dashboard-hero-actions .writer-dashboard-button.secondary {
      grid-column: 2;
      grid-row: 1;
      padding-inline: 12px;
    }

    .writer-dashboard-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      margin-bottom: 14px;
    }

    .writer-dashboard-stat {
      min-height: 110px;
      padding: 15px;
    }

    .writer-dashboard-stat-value {
      font-size: 25px;
    }

    .writer-dashboard-stat-hint {
      margin-top: 12px;
      font-size: 9px;
    }

    .writer-dashboard-overview-grid {
      gap: 13px;
      margin-bottom: 18px;
    }

    .writer-dashboard-panel {
      padding: 16px;
    }

    .writer-dashboard-store-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .writer-dashboard-detail:nth-child(3) {
      grid-column: 1 / -1;
    }

    .writer-dashboard-empty {
      grid-template-columns: 38px minmax(0, 1fr);
      align-items: start;
    }

    .writer-dashboard-empty .writer-dashboard-button {
      grid-column: 1 / -1;
      width: 100%;
    }

    .writer-dashboard-actions-grid {
      grid-template-columns: 1fr;
    }

    .writer-dashboard-action-card {
      min-height: 74px;
    }

    .writer-dashboard-activity-grid {
      gap: 13px;
    }
  }
`;
