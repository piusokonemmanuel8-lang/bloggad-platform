import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Boxes,
  CheckCircle2,
  FileText,
  FolderTree,
  Globe,
  LayoutGrid,
  Link2,
  Loader2,
  RefreshCw,
  Shield,
  UserPlus,
  Users,
  Wallet,
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

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function StatCard({ label, value, icon: Icon, tone = 'default', helper = '' }) {
  const iconTone =
    tone === 'primary'
      ? { background: '#2271b1', color: '#fff', border: '1px solid #2271b1' }
      : tone === 'success'
      ? { background: '#ecfdf3', color: '#166534', border: '1px solid #b7e4c7' }
      : tone === 'warning'
      ? { background: '#fff7e6', color: '#9a6700', border: '1px solid #f3d28b' }
      : tone === 'danger'
      ? { background: '#fff1f2', color: '#b42318', border: '1px solid #f1b5b8' }
      : { background: '#f6f7f7', color: '#1d2327', border: '1px solid #dcdcde' };

  return (
    <div style={cardStyle({ padding: 24, minHeight: 150 })}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 14 }}>{label}</div>
          <div style={{ fontSize: 38, lineHeight: 1, fontWeight: 700, color: '#1d2327' }}>
            {value}
          </div>
          {helper ? (
            <div style={{ fontSize: 13, color: '#646970', marginTop: 14 }}>{helper}</div>
          ) : null}
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            ...iconTone,
          }}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ ...cardStyle({ padding: 16, background: '#f6f7f7', minHeight: 96 }) }}>
      <div style={{ fontSize: 12, color: '#646970', marginBottom: 10 }}>{label}</div>
      <div style={{ fontWeight: 700, color: '#1d2327', fontSize: 20 }}>{value}</div>
    </div>
  );
}

function TableStatusBadge({ value }) {
  const clean = String(value || '').toLowerCase();

  let tone = {
    border: '1px solid #dcdcde',
    background: '#f6f7f7',
    color: '#50575e',
  };

  if (['active', 'published'].includes(clean)) {
    tone = {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  } else if (['draft', 'trial'].includes(clean)) {
    tone = {
      border: '1px solid #bfdbfe',
      background: '#eff6ff',
      color: '#1d4ed8',
    };
  } else if (['inactive', 'expired'].includes(clean)) {
    tone = {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  } else if (['suspended', 'cancelled'].includes(clean)) {
    tone = {
      border: '1px solid #f1b5b8',
      background: '#fff1f2',
      color: '#b42318',
    };
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...tone,
      }}
    >
      {value || '-'}
    </span>
  );
}

function SectionCard({ title, subtitle, children, rightSlot = null }) {
  return (
    <section style={cardStyle()}>
      <div
        style={{
          padding: '20px 22px',
          borderBottom: '1px solid #dcdcde',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: '#646970' }}>{subtitle}</div>
        </div>
        {rightSlot}
      </div>
      <div style={{ padding: 22 }}>{children}</div>
    </section>
  );
}

function SimpleTable({ columns, rows, emptyText = 'No data found.' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: 760,
        }}
      >
        <thead>
          <tr style={{ background: '#f6f7f7' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  fontSize: 12,
                  color: '#646970',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  border: '1px solid #dcdcde',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '16px',
                      border: '1px solid #dcdcde',
                      fontSize: 14,
                      color: '#1d2327',
                      verticalAlign: 'top',
                    }}
                  >
                    {column.render ? column.render(row) : row[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '20px 16px',
                  border: '1px solid #dcdcde',
                  color: '#646970',
                }}
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    const { data } = await api.get('/api/admin/dashboard');
    setDashboard(data?.dashboard || null);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchDashboard();
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin dashboard overview');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      await fetchDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh dashboard overview');
    } finally {
      setRefreshing(false);
    }
  };

  const topStats = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        label: 'Total Users',
        value: dashboard?.users?.total_users || 0,
        icon: Users,
        tone: 'primary',
        helper: `${dashboard?.users?.total_active_users || 0} active users`,
      },
      {
        label: 'Total Affiliates',
        value: dashboard?.users?.total_affiliates || 0,
        icon: UserPlus,
        tone: 'success',
        helper: `${dashboard?.users?.total_admins || 0} admins`,
      },
      {
        label: 'Total Websites',
        value: dashboard?.websites?.total_websites || 0,
        icon: Globe,
        helper: `${dashboard?.websites?.total_active_websites || 0} active websites`,
      },
      {
        label: 'Total Products',
        value: dashboard?.products?.total_products || 0,
        icon: Boxes,
        helper: `${dashboard?.products?.total_published_products || 0} published`,
      },
      {
        label: 'Total Posts',
        value: dashboard?.posts?.total_posts || 0,
        icon: FileText,
        helper: `${dashboard?.posts?.total_published_posts || 0} published`,
      },
      {
        label: 'Subscriptions',
        value: dashboard?.subscriptions?.total_subscriptions || 0,
        icon: Wallet,
        tone: 'warning',
        helper: `${dashboard?.subscriptions?.total_active_subscriptions || 0} active`,
      },
    ];
  }, [dashboard]);

  if (loading) {
    return (
      <div style={cardStyle({ padding: 24 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading admin dashboard...</span>
        </div>

        <style>{`
          .spin-soft {
            animation: spinSoft 0.9s linear infinite;
          }
          @keyframes spinSoft {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-dash-top-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }
        .admin-dash-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }
        .admin-dash-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }
        .admin-dash-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        .admin-dash-mini-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .spin-soft {
          animation: spinSoft 0.9s linear infinite;
        }
        @keyframes spinSoft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1400px) {
          .admin-dash-grid-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 1200px) {
          .admin-dash-top-grid,
          .admin-dash-grid-3,
          .admin-dash-grid-2,
          .admin-dash-mini-grid-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 820px) {
          .admin-dash-top-grid,
          .admin-dash-grid-4,
          .admin-dash-grid-3,
          .admin-dash-grid-2,
          .admin-dash-mini-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 30,
                lineHeight: 1.2,
                fontWeight: 700,
                color: '#1d2327',
              }}
            >
              Dashboard Overview
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 14, color: '#646970', maxWidth: 860 }}>
              Monitor users, affiliates, storefront activity, content, subscriptions, analytics, and
              recent platform records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              border: '1px solid #2271b1',
              background: refreshing ? '#f6f7f7' : '#ffffff',
              color: '#2271b1',
              padding: '11px 18px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 46,
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-soft' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            ...cardStyle({
              padding: 16,
              borderLeft: '4px solid #d63638',
              color: '#b42318',
              marginBottom: 24,
            }),
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          ...cardStyle({
            padding: 18,
            marginBottom: 24,
            borderLeft: '4px solid #72aee6',
          }),
        }}
      >
        This is the real admin overview page. It pulls only admin dashboard totals and recent records.
      </div>

      <div className="admin-dash-top-grid" style={{ marginBottom: 24 }}>
        {topStats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            tone={item.tone}
            helper={item.helper}
          />
        ))}
      </div>

      <div className="admin-dash-grid-4" style={{ marginBottom: 24 }}>
        <SectionCard
          title="User Summary"
          subtitle="Platform account breakdown"
          rightSlot={<Shield size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat label="Active Users" value={dashboard?.users?.total_active_users || 0} />
            <MiniStat label="Inactive Users" value={dashboard?.users?.total_inactive_users || 0} />
            <MiniStat label="Suspended Users" value={dashboard?.users?.total_suspended_users || 0} />
          </div>
        </SectionCard>

        <SectionCard
          title="Website Summary"
          subtitle="Storefront and website statuses"
          rightSlot={<LayoutGrid size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat label="Active Websites" value={dashboard?.websites?.total_active_websites || 0} />
            <MiniStat label="Draft Websites" value={dashboard?.websites?.total_draft_websites || 0} />
            <MiniStat
              label="Inactive / Suspended"
              value={
                (dashboard?.websites?.total_inactive_websites || 0) +
                (dashboard?.websites?.total_suspended_websites || 0)
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Catalog Summary"
          subtitle="Products and content status"
          rightSlot={<Boxes size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat
              label="Published Products"
              value={dashboard?.products?.total_published_products || 0}
            />
            <MiniStat label="Draft Products" value={dashboard?.products?.total_draft_products || 0} />
            <MiniStat
              label="Inactive Products"
              value={dashboard?.products?.total_inactive_products || 0}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Post Summary"
          subtitle="Blog content activity"
          rightSlot={<FileText size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat label="Published Posts" value={dashboard?.posts?.total_published_posts || 0} />
            <MiniStat label="Draft Posts" value={dashboard?.posts?.total_draft_posts || 0} />
            <MiniStat label="Inactive Posts" value={dashboard?.posts?.total_inactive_posts || 0} />
          </div>
        </SectionCard>
      </div>

      <div className="admin-dash-grid-3" style={{ marginBottom: 24 }}>
        <SectionCard
          title="Categories"
          subtitle="Category availability on the platform"
          rightSlot={<FolderTree size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat label="Total Categories" value={dashboard?.categories?.total_categories || 0} />
            <MiniStat
              label="Active Categories"
              value={dashboard?.categories?.total_active_categories || 0}
            />
            <MiniStat
              label="Inactive Categories"
              value={dashboard?.categories?.total_inactive_categories || 0}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Subscription Plans"
          subtitle="Plan records configured by admin"
          rightSlot={<Wallet size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat label="Total Plans" value={dashboard?.plans?.total_plans || 0} />
            <MiniStat label="Active Plans" value={dashboard?.plans?.total_active_plans || 0} />
            <MiniStat label="Inactive Plans" value={dashboard?.plans?.total_inactive_plans || 0} />
          </div>
        </SectionCard>

        <SectionCard
          title="Subscriptions"
          subtitle="Affiliate plan status overview"
          rightSlot={<CheckCircle2 size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat
              label="Trial Subscriptions"
              value={dashboard?.subscriptions?.total_trial_subscriptions || 0}
            />
            <MiniStat
              label="Active Subscriptions"
              value={dashboard?.subscriptions?.total_active_subscriptions || 0}
            />
            <MiniStat
              label="Expired / Cancelled"
              value={
                (dashboard?.subscriptions?.total_expired_subscriptions || 0) +
                (dashboard?.subscriptions?.total_cancelled_subscriptions || 0)
              }
            />
          </div>
        </SectionCard>
      </div>

      <div className="admin-dash-grid-2" style={{ marginBottom: 24 }}>
        <SectionCard
          title="Analytics Overview"
          subtitle="High-level engagement counters"
          rightSlot={<BarChart3 size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat
              label="Product Views"
              value={dashboard?.analytics?.total_product_views || 0}
            />
            <MiniStat
              label="Product Clicks"
              value={dashboard?.analytics?.total_product_clicks || 0}
            />
            <MiniStat label="Post Views" value={dashboard?.analytics?.total_post_views || 0} />
          </div>

          <div style={{ marginTop: 16 }}>
            <MiniStat
              label="Slider Clicks"
              value={dashboard?.analytics?.total_slider_clicks || 0}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Link Validation Logs"
          subtitle="Allowed and blocked domain checks"
          rightSlot={<Link2 size={18} color="#646970" />}
        >
          <div className="admin-dash-mini-grid-3">
            <MiniStat
              label="Total Validation Logs"
              value={dashboard?.link_validation?.total_validation_logs || 0}
            />
            <MiniStat
              label="Passed Logs"
              value={dashboard?.link_validation?.total_passed_logs || 0}
            />
            <MiniStat
              label="Failed Logs"
              value={dashboard?.link_validation?.total_failed_logs || 0}
            />
          </div>
        </SectionCard>
      </div>

      <div className="admin-dash-grid-2" style={{ marginBottom: 24 }}>
        <SectionCard
          title="Recent Affiliates"
          subtitle="Latest affiliate accounts added to the platform"
          rightSlot={<Users size={18} color="#646970" />}
        >
          <SimpleTable
            columns={[
              {
                key: 'name',
                label: 'Affiliate',
                render: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: '#1d2327', marginBottom: 4 }}>
                      {row.name || '-'}
                    </div>
                    <div style={{ fontSize: 13, color: '#646970', wordBreak: 'break-word' }}>
                      {row.email || '-'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'role',
                label: 'Role',
                render: (row) => (
                  <span style={{ textTransform: 'capitalize' }}>{row.role || '-'}</span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <TableStatusBadge value={row.status} />,
              },
              {
                key: 'created_at',
                label: 'Created',
                render: (row) => formatDateTime(row.created_at),
              },
            ]}
            rows={dashboard?.recent_affiliates || []}
            emptyText="No recent affiliates found."
          />
        </SectionCard>

        <SectionCard
          title="Recent Products"
          subtitle="Latest product records submitted by affiliates"
          rightSlot={<Boxes size={18} color="#646970" />}
        >
          <SimpleTable
            columns={[
              {
                key: 'title',
                label: 'Product',
                render: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: '#1d2327', marginBottom: 4 }}>
                      {row.title || '-'}
                    </div>
                    <div style={{ fontSize: 13, color: '#646970' }}>
                      Slug: {row.slug || '-'}
                    </div>
                  </div>
                ),
              },
              {
                key: 'affiliate_name',
                label: 'Affiliate',
              },
              {
                key: 'website_name',
                label: 'Website',
                render: (row) => row.website_name || '-',
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => <TableStatusBadge value={row.status} />,
              },
              {
                key: 'created_at',
                label: 'Created',
                render: (row) => formatDateTime(row.created_at),
              },
            ]}
            rows={dashboard?.recent_products || []}
            emptyText="No recent products found."
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Posts"
        subtitle="Latest blog post records across affiliate storefronts"
        rightSlot={<Activity size={18} color="#646970" />}
      >
        <SimpleTable
          columns={[
            {
              key: 'title',
              label: 'Post',
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 600, color: '#1d2327', marginBottom: 4 }}>
                    {row.title || '-'}
                  </div>
                  <div style={{ fontSize: 13, color: '#646970' }}>
                    Slug: {row.slug || '-'}
                  </div>
                </div>
              ),
            },
            {
              key: 'affiliate_name',
              label: 'Affiliate',
            },
            {
              key: 'website_name',
              label: 'Website',
              render: (row) => row.website_name || '-',
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <TableStatusBadge value={row.status} />,
            },
            {
              key: 'created_at',
              label: 'Created',
              render: (row) => formatDateTime(row.created_at),
            },
          ]}
          rows={dashboard?.recent_posts || []}
          emptyText="No recent posts found."
        />
      </SectionCard>
    </div>
  );
}