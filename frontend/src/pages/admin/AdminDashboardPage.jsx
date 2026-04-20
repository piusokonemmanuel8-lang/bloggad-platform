import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Boxes,
  Globe,
  Layers3,
  Loader2,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  Tag,
  User2,
  Users,
  WalletCards,
  FileText,
} from 'lucide-react';
import api from '../../api/axios';

function cardStyle(extra = {}) {
  return {
    background: '#ffffff',
    border: '1px solid #dcdcde',
    borderRadius: 0,
    boxShadow: 'none',
    ...extra,
  };
}

function mutedTextStyle(extra = {}) {
  return {
    color: '#646970',
    ...extra,
  };
}

function getStatusTone(status) {
  const clean = String(status || '').toLowerCase();

  if (clean === 'active' || clean === 'published') return 'success';
  if (clean === 'inactive' || clean === 'draft') return 'warning';
  if (clean === 'suspended' || clean === 'failed') return 'danger';
  return 'default';
}

function statusBadgeStyle(tone = 'default') {
  if (tone === 'success') {
    return {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  }

  if (tone === 'warning') {
    return {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  }

  if (tone === 'danger') {
    return {
      border: '1px solid #f1b5b8',
      background: '#fff1f2',
      color: '#b42318',
    };
  }

  return {
    border: '1px solid #dcdcde',
    background: '#f6f7f7',
    color: '#50575e',
  };
}

function iconBoxStyle(tone = 'default') {
  if (tone === 'primary') {
    return {
      background: '#2271b1',
      color: '#ffffff',
      border: '1px solid #2271b1',
    };
  }

  if (tone === 'success') {
    return {
      background: '#ecfdf3',
      color: '#166534',
      border: '1px solid #b7e4c7',
    };
  }

  if (tone === 'warning') {
    return {
      background: '#fff7e6',
      color: '#9a6700',
      border: '1px solid #f3d28b',
    };
  }

  if (tone === 'danger') {
    return {
      background: '#fff1f2',
      color: '#b42318',
      border: '1px solid #f1b5b8',
    };
  }

  return {
    background: '#f6f7f7',
    color: '#1d2327',
    border: '1px solid #dcdcde',
  };
}

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  return (
    <div style={cardStyle({ padding: 20 })}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#646970',
              marginBottom: 10,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1,
              fontWeight: 700,
              color: '#1d2327',
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...iconBoxStyle(tone),
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function MiniRowCard({ title, subtitle, status, statusTone = 'default', icon: Icon = FileText }) {
  return (
    <div
      style={{
        borderBottom: '1px solid #f0f0f1',
        padding: '14px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 38,
              height: 38,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f6f7f7',
              border: '1px solid #dcdcde',
              color: '#1d2327',
              flexShrink: 0,
            }}
          >
            <Icon size={17} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#1d2327',
                marginBottom: 4,
                wordBreak: 'break-word',
              }}
            >
              {title || '-'}
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#646970',
                wordBreak: 'break-word',
              }}
            >
              {subtitle || '-'}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '5px 10px',
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            ...statusBadgeStyle(statusTone),
          }}
        >
          {status || '-'}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    const { data } = await api.get('/api/admin/dashboard');
    setDashboard(data?.dashboard || null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchDashboard();
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      await fetchDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh admin dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  const users = dashboard?.users || {};
  const websites = dashboard?.websites || {};
  const products = dashboard?.products || {};
  const posts = dashboard?.posts || {};
  const categories = dashboard?.categories || {};
  const plans = dashboard?.plans || {};
  const subscriptions = dashboard?.subscriptions || {};
  const analytics = dashboard?.analytics || {};
  const linkValidation = dashboard?.link_validation || {};

  const topStats = useMemo(
    () => [
      { label: 'Users', value: users.total_users || 0, icon: Users, tone: 'primary' },
      { label: 'Affiliates', value: users.total_affiliates || 0, icon: User2 },
      { label: 'Websites', value: websites.total_websites || 0, icon: Globe },
      { label: 'Products', value: products.total_products || 0, icon: Boxes },
      { label: 'Posts', value: posts.total_posts || 0, icon: FileText },
      { label: 'Categories', value: categories.total_categories || 0, icon: Tag },
      { label: 'Plans', value: plans.total_plans || 0, icon: Layers3 },
      { label: 'Subscriptions', value: subscriptions.total_subscriptions || 0, icon: WalletCards },
    ],
    [users, websites, products, posts, categories, plans, subscriptions]
  );

  const analyticsStats = useMemo(
    () => [
      { label: 'Product Views', value: analytics.total_product_views || 0, icon: BarChart3, tone: 'primary' },
      { label: 'Product Clicks', value: analytics.total_product_clicks || 0, icon: MousePointerClick },
      { label: 'Post Views', value: analytics.total_post_views || 0, icon: Activity },
      { label: 'Slider Clicks', value: analytics.total_slider_clicks || 0, icon: MousePointerClick },
    ],
    [analytics]
  );

  const healthStats = useMemo(
    () => [
      { label: 'Passed Link Logs', value: linkValidation.total_passed_logs || 0, icon: ShieldCheck, tone: 'success' },
      { label: 'Failed Link Logs', value: linkValidation.total_failed_logs || 0, icon: AlertTriangle, tone: 'danger' },
      { label: 'Active Users', value: users.total_active_users || 0, icon: BadgeCheck, tone: 'success' },
      { label: 'Active Websites', value: websites.total_active_websites || 0, icon: Globe, tone: 'success' },
    ],
    [linkValidation, users, websites]
  );

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .admin-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .admin-section-space {
          margin-bottom: 22px;
        }

        .spin-soft {
          animation: spinSoft 0.9s linear infinite;
        }

        @keyframes spinSoft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1200px) {
          .admin-grid-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .admin-grid-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="admin-section-space">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 10,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.2,
                fontWeight: 700,
                color: '#1d2327',
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 14,
                color: '#646970',
              }}
            >
              Monitor affiliates, websites, products, posts, plans, subscriptions, analytics, and link validation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                border: '1px solid #2271b1',
                background: refreshing ? '#f6f7f7' : '#ffffff',
                color: '#2271b1',
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'spin-soft' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="admin-section-space"
          style={cardStyle({
            padding: 14,
            borderLeft: '4px solid #d63638',
            color: '#b42318',
          })}
        >
          {error}
        </div>
      ) : null}

      <div className="admin-section-space">
        <div
          style={cardStyle({
            padding: 16,
            borderLeft: '4px solid #72aee6',
            color: '#1d2327',
            fontSize: 14,
          })}
        >
          This dashboard gives a full admin summary of marketplace activity and link validation health.
        </div>
      </div>

      <div className="admin-section-space admin-grid-4">
        {topStats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>

      <div className="admin-section-space">
        <div
          style={{
            marginBottom: 10,
            fontSize: 22,
            fontWeight: 600,
            color: '#1d2327',
          }}
        >
          Performance Analytics
        </div>
        <div
          style={{
            marginBottom: 14,
            fontSize: 14,
            color: '#646970',
          }}
        >
          Traffic and click activity across products, posts, and sliders.
        </div>

        <div className="admin-grid-4">
          {analyticsStats.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              tone={item.tone}
            />
          ))}
        </div>
      </div>

      <div className="admin-section-space">
        <div
          style={{
            marginBottom: 10,
            fontSize: 22,
            fontWeight: 600,
            color: '#1d2327',
          }}
        >
          Platform Health
        </div>
        <div
          style={{
            marginBottom: 14,
            fontSize: 14,
            color: '#646970',
          }}
        >
          Active records and link validation monitoring.
        </div>

        <div className="admin-grid-4">
          {healthStats.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              icon={item.icon}
              tone={item.tone}
            />
          ))}
        </div>
      </div>

      <div className="admin-grid-3">
        <section style={cardStyle()}>
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #dcdcde',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1d2327',
                marginBottom: 6,
              }}
            >
              Recent Affiliates
            </div>
            <div style={mutedTextStyle({ fontSize: 13 })}>
              Newly added affiliate accounts and current status.
            </div>
          </div>

          <div style={{ padding: '0 18px 8px' }}>
            {(dashboard?.recent_affiliates || []).length ? (
              dashboard.recent_affiliates.map((item) => (
                <MiniRowCard
                  key={item.id}
                  title={item.name}
                  subtitle={item.email}
                  status={item.status}
                  statusTone={getStatusTone(item.status)}
                  icon={User2}
                />
              ))
            ) : (
              <div style={{ padding: '18px 0', color: '#646970' }}>No recent affiliates.</div>
            )}
          </div>
        </section>

        <section style={cardStyle()}>
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #dcdcde',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1d2327',
                marginBottom: 6,
              }}
            >
              Recent Products
            </div>
            <div style={mutedTextStyle({ fontSize: 13 })}>
              Latest products added across affiliate storefronts.
            </div>
          </div>

          <div style={{ padding: '0 18px 8px' }}>
            {(dashboard?.recent_products || []).length ? (
              dashboard.recent_products.map((item) => (
                <MiniRowCard
                  key={item.id}
                  title={item.title}
                  subtitle={`Affiliate: ${item.affiliate_name || '-'}`}
                  status={item.status}
                  statusTone={getStatusTone(item.status)}
                  icon={Boxes}
                />
              ))
            ) : (
              <div style={{ padding: '18px 0', color: '#646970' }}>No recent products.</div>
            )}
          </div>
        </section>

        <section style={cardStyle()}>
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid #dcdcde',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1d2327',
                marginBottom: 6,
              }}
            >
              Recent Posts
            </div>
            <div style={mutedTextStyle({ fontSize: 13 })}>
              Latest content submitted by affiliates.
            </div>
          </div>

          <div style={{ padding: '0 18px 8px' }}>
            {(dashboard?.recent_posts || []).length ? (
              dashboard.recent_posts.map((item) => (
                <MiniRowCard
                  key={item.id}
                  title={item.title}
                  subtitle={`Affiliate: ${item.affiliate_name || '-'}`}
                  status={item.status}
                  statusTone={getStatusTone(item.status)}
                  icon={FileText}
                />
              ))
            ) : (
              <div style={{ padding: '18px 0', color: '#646970' }}>No recent posts.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}