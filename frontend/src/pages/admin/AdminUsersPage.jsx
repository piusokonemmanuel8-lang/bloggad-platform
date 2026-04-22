import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    main_marketplace_signups: 0,
  });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [error, setError] = useState('');

  const filteredCustomers = useMemo(() => customers || [], [customers]);

  async function loadCustomers(currentSearch = '') {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/api/customer-management/admin/customers', {
        params: currentSearch ? { search: currentSearch } : {},
      });

      setCustomers(data?.customers || []);
      setStats(
        data?.stats || {
          total_customers: 0,
          active_customers: 0,
          main_marketplace_signups: 0,
        }
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers(search);
  }, [search]);

  async function handleStatusChange(customerId, nextStatus) {
    try {
      setStatusLoadingId(customerId);
      setError('');

      await api.patch(`/api/customer-management/admin/customers/${customerId}/status`, {
        status: nextStatus,
      });

      await loadCustomers(search);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update customer status');
    } finally {
      setStatusLoadingId(null);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #dcdcde',
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 8 }}>Total Users</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1d2327' }}>
            {stats.total_customers || 0}
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #dcdcde',
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 8 }}>Active Users</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1d2327' }}>
            {stats.active_customers || 0}
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #dcdcde',
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 8 }}>
            Main Marketplace Signups
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1d2327' }}>
            {stats.main_marketplace_signups || 0}
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #dcdcde',
          borderRadius: 20,
          padding: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#1d2327' }}>Users</h2>
            <p style={{ margin: '6px 0 0', color: '#646970' }}>
              All customer accounts on the platform.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email"
              style={{
                width: 260,
                maxWidth: '100%',
                height: 44,
                borderRadius: 12,
                border: '1px solid #dcdcde',
                padding: '0 14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                height: 44,
                border: 0,
                borderRadius: 12,
                padding: '0 16px',
                background: '#1d2327',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Search
            </button>
          </form>
        </div>

        {error ? (
          <div
            style={{
              marginBottom: 16,
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: 14,
              padding: 14,
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f6f7f7' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Affiliate</th>
                <th style={thStyle}>Website</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={emptyTdStyle}>
                    Loading users...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={emptyTdStyle}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} style={{ borderTop: '1px solid #f0f0f1' }}>
                    <td style={tdStyle}>{customer?.name || '-'}</td>
                    <td style={tdStyle}>{customer?.email || '-'}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: 999,
                          background:
                            customer?.status === 'active'
                              ? '#dcfce7'
                              : customer?.status === 'suspended'
                              ? '#fee2e2'
                              : '#f3f4f6',
                          color:
                            customer?.status === 'active'
                              ? '#166534'
                              : customer?.status === 'suspended'
                              ? '#991b1b'
                              : '#374151',
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {customer?.status || '-'}
                      </span>
                    </td>
                    <td style={tdStyle}>{customer?.signup_source || '-'}</td>
                    <td style={tdStyle}>{customer?.registered_affiliate?.name || '-'}</td>
                    <td style={tdStyle}>{customer?.registered_website?.website_name || '-'}</td>
                    <td style={tdStyle}>{formatDateTime(customer?.created_at)}</td>
                    <td style={tdStyle}>
                      <select
                        value={customer?.status || 'active'}
                        onChange={(e) => handleStatusChange(customer.id, e.target.value)}
                        disabled={statusLoadingId === customer.id}
                        style={{
                          height: 38,
                          borderRadius: 10,
                          border: '1px solid #dcdcde',
                          padding: '0 10px',
                          background: '#fff',
                        }}
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="suspended">suspended</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '14px 12px',
  fontSize: 13,
  color: '#646970',
  fontWeight: 700,
};

const tdStyle = {
  padding: '14px 12px',
  fontSize: 14,
  color: '#1d2327',
  verticalAlign: 'top',
};

const emptyTdStyle = {
  padding: '26px 12px',
  textAlign: 'center',
  color: '#646970',
};