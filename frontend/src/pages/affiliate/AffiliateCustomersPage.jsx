import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getStatusClass(status) {
  const value = String(status || '').trim().toLowerCase();

  if (value === 'active') return 'active';
  if (value === 'suspended') return 'suspended';
  return 'neutral';
}

export default function AffiliateCustomersPage() {
  const location = useLocation();
  const isWriterRoute = location.pathname.startsWith('/writer/');

  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    total_customers: 0,
    active_customers: 0,
    main_marketplace_signups: 0,
  });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filteredCustomers = useMemo(() => customers || [], [customers]);

  async function loadCustomers(currentSearch = '') {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/api/customer-management/affiliate/customers', {
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
      setError(err?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers(search);
  }, [search]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  if (!isWriterRoute) {
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
              border: '1px solid #e5e7eb',
              borderRadius: 18,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>My Customers</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#111827' }}>
              {stats.total_customers || 0}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 18,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Active Customers</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#111827' }}>
              {stats.active_customers || 0}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 18,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
              Main Marketplace Signups
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#111827' }}>
              {stats.main_marketplace_signups || 0}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
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
              <h2 style={{ margin: 0, fontSize: 24, color: '#111827' }}>My Customers</h2>
              <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
                Customers registered under your affiliate/storefront activity.
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
                  border: '1px solid #d1d5db',
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
                  background: '#111827',
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
            <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Website</th>
                  <th style={thStyle}>Last Login</th>
                  <th style={thStyle}>Joined</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={emptyTdStyle}>
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={emptyTdStyle}>
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} style={{ borderTop: '1px solid #f1f5f9' }}>
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
                      <td style={tdStyle}>{customer?.registered_website?.website_name || '-'}</td>
                      <td style={tdStyle}>{formatDateTime(customer?.last_login_at)}</td>
                      <td style={tdStyle}>{formatDateTime(customer?.created_at)}</td>
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

  return (
    <div className="writer-readers-page">
      <style>{writerStyles}</style>

      <div className="writer-readers-mobile-title">Readers</div>

      <section className="writer-readers-stats">
        <article className="writer-readers-stat">
          <span>Total readers</span>
          <strong>{stats.total_customers || 0}</strong>
        </article>

        <article className="writer-readers-stat">
          <span>Active readers</span>
          <strong>{stats.active_customers || 0}</strong>
        </article>

        <article className="writer-readers-stat">
          <span>Marketplace signups</span>
          <strong>{stats.main_marketplace_signups || 0}</strong>
        </article>
      </section>

      <section className="writer-readers-search-card">
        <form className="writer-readers-search-form" onSubmit={handleSearchSubmit}>
          <strong>Search readers</strong>

          <div className="writer-readers-search-actions">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or email"
            />

            <button type="submit">Search</button>
          </div>
        </form>
      </section>

      {error ? (
        <div className="writer-readers-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="writer-readers-desktop-card">
        <header className="writer-readers-list-head">
          <strong>Readers</strong>
          <span>{stats.total_customers || 0} total</span>
        </header>

        <div className="writer-readers-table-wrap">
          <table className="writer-readers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Source</th>
                <th>Website</th>
                <th>Last Login</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="writer-readers-empty-cell">
                    Loading readers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="writer-readers-empty-cell">
                    No readers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="writer-readers-name">{customer?.name || '-'}</td>
                    <td className="writer-readers-email">{customer?.email || '-'}</td>
                    <td>
                      <span className={`writer-readers-status ${getStatusClass(customer?.status)}`}>
                        {customer?.status || '-'}
                      </span>
                    </td>
                    <td>{customer?.signup_source || '-'}</td>
                    <td>{customer?.registered_website?.website_name || '-'}</td>
                    <td>{formatDateTime(customer?.last_login_at)}</td>
                    <td>{formatDateTime(customer?.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="writer-readers-mobile-list">
        <header className="writer-readers-mobile-list-head">
          <strong>Reader list</strong>
          <span>{stats.total_customers || 0} total</span>
        </header>

        {loading ? (
          <div className="writer-readers-mobile-state">Loading readers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="writer-readers-mobile-state">No readers found.</div>
        ) : (
          <div className="writer-readers-card-list">
            {filteredCustomers.map((customer) => (
              <article className="writer-reader-card" key={customer.id}>
                <header>
                  <strong>{customer?.name || '-'}</strong>
                  <span className={`writer-readers-status ${getStatusClass(customer?.status)}`}>
                    {customer?.status || '-'}
                  </span>
                </header>

                <div className="writer-reader-email">{customer?.email || '-'}</div>

                <div className="writer-reader-info-grid">
                  <div>
                    <span>Source</span>
                    <strong>{customer?.signup_source || '-'}</strong>
                  </div>
                  <div>
                    <span>Website</span>
                    <strong>{customer?.registered_website?.website_name || '-'}</strong>
                  </div>
                  <div>
                    <span>Last Login</span>
                    <strong>{formatDateTime(customer?.last_login_at)}</strong>
                  </div>
                  <div>
                    <span>Joined</span>
                    <strong>{formatDateTime(customer?.created_at)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const writerStyles = `
  * {
    box-sizing: border-box;
  }

  .writer-readers-page {
    width: 100%;
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .writer-readers-page button,
  .writer-readers-page input {
    font: inherit;
  }

  .writer-readers-mobile-title {
    display: none;
  }

  .writer-readers-stats {
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .writer-readers-stat {
    min-width: 0;
    height: 88px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-readers-stat span {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.3;
    font-weight: 500;
  }

  .writer-readers-stat strong {
    color: #111827;
    font-size: 25px;
    line-height: 1.1;
    font-weight: 700;
  }

  .writer-readers-search-card {
    margin-bottom: 12px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-readers-search-form {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-readers-search-form > strong {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    line-height: 1.3;
    font-weight: 600;
  }

  .writer-readers-search-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .writer-readers-search-actions input {
    width: 360px;
    height: 42px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    outline: 0;
    background: #ffffff;
    color: #111827;
    font-size: 11px;
    font-weight: 500;
  }

  .writer-readers-search-actions input::placeholder {
    color: #6b7280;
    opacity: 1;
  }

  .writer-readers-search-actions input:focus {
    border-color: #111827;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.06);
  }

  .writer-readers-search-actions button {
    width: 72px;
    height: 40px;
    border: 0;
    border-radius: 10px;
    background: #1b1f25;
    color: #ffffff;
    font-size: 11px;
    line-height: 1;
    font-weight: 600;
    cursor: pointer;
  }

  .writer-readers-alert {
    margin-bottom: 12px;
    padding: 11px 13px;
    border: 1px solid #fecaca;
    border-radius: 11px;
    background: #fef2f2;
    color: #b42318;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
  }

  .writer-readers-desktop-card {
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #ffffff;
  }

  .writer-readers-list-head {
    min-height: 52px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .writer-readers-list-head > strong {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    font-weight: 600;
  }

  .writer-readers-list-head > span,
  .writer-readers-mobile-list-head > span {
    min-height: 24px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 9px;
    line-height: 1;
    font-weight: 600;
    white-space: nowrap;
  }

  .writer-readers-table-wrap {
    overflow-x: auto;
  }

  .writer-readers-table {
    width: 100%;
    min-width: 1000px;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .writer-readers-table thead {
    background: #f8fafc;
  }

  .writer-readers-table th {
    height: 44px;
    padding: 0 12px;
    color: #6b7280;
    font-size: 9px;
    line-height: 1.2;
    font-weight: 600;
    text-align: left;
    text-transform: uppercase;
  }

  .writer-readers-table th:nth-child(1) { width: 13%; }
  .writer-readers-table th:nth-child(2) { width: 19%; }
  .writer-readers-table th:nth-child(3) { width: 9%; }
  .writer-readers-table th:nth-child(4) { width: 12%; }
  .writer-readers-table th:nth-child(5) { width: 13%; }
  .writer-readers-table th:nth-child(6) { width: 18%; }
  .writer-readers-table th:nth-child(7) { width: 16%; }

  .writer-readers-table td {
    height: 56px;
    padding: 0 12px;
    border-top: 1px solid #f1f2f4;
    color: #111827;
    font-size: 11px;
    line-height: 1.4;
    vertical-align: middle;
    overflow-wrap: anywhere;
  }

  .writer-readers-name {
    font-weight: 600;
  }

  .writer-readers-email {
    color: #6b7280 !important;
  }

  .writer-readers-status {
    min-height: 25px;
    padding: 0 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 10px;
    line-height: 1;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .writer-readers-status.active {
    border-color: #abefc6;
    background: #ecfdf3;
    color: #027a48;
  }

  .writer-readers-status.suspended {
    border-color: #fccac6;
    background: #fef2f2;
    color: #b42520;
  }

  .writer-readers-empty-cell {
    height: 110px !important;
    color: #6b7280 !important;
    font-size: 11px !important;
    text-align: center;
  }

  .writer-readers-mobile-list {
    display: none;
  }

  @media (max-width: 767px) {
    .writer-readers-mobile-title {
      min-height: 50px;
      margin-bottom: 10px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      font-size: 14px;
      line-height: 1.2;
      font-weight: 600;
    }

    .writer-readers-stats {
      margin-bottom: 10px;
      gap: 8px;
    }

    .writer-readers-stat {
      height: 72px;
      padding: 10px;
      gap: 3px;
      border-radius: 12px;
    }

    .writer-readers-stat span {
      font-size: 8px;
    }

    .writer-readers-stat strong {
      font-size: 19px;
    }

    .writer-readers-stat:nth-child(1) span {
      font-size: 0;
    }

    .writer-readers-stat:nth-child(1) span::after {
      content: 'Total';
      font-size: 8px;
    }

    .writer-readers-stat:nth-child(2) span {
      font-size: 0;
    }

    .writer-readers-stat:nth-child(2) span::after {
      content: 'Active';
      font-size: 8px;
    }

    .writer-readers-stat:nth-child(3) span {
      font-size: 0;
    }

    .writer-readers-stat:nth-child(3) span::after {
      content: 'Marketplace';
      font-size: 8px;
    }

    .writer-readers-search-card {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 12px;
    }

    .writer-readers-search-form {
      min-height: 40px;
    }

    .writer-readers-search-form > strong {
      display: none;
    }

    .writer-readers-search-actions {
      width: 100%;
      gap: 8px;
    }

    .writer-readers-search-actions input {
      flex: 1;
      width: auto;
      min-width: 0;
      height: 40px;
      padding: 0 11px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-readers-search-actions button {
      width: 74px;
      height: 40px;
      border-radius: 9px;
      font-size: 10px;
    }

    .writer-readers-desktop-card {
      display: none;
    }

    .writer-readers-mobile-list {
      display: block;
    }

    .writer-readers-mobile-list-head {
      min-height: 36px;
      margin-bottom: 8px;
      padding-left: 2px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-readers-mobile-list-head > strong {
      flex: 1;
      min-width: 0;
      font-size: 11px;
      font-weight: 600;
    }

    .writer-readers-mobile-list-head > span {
      min-height: 23px;
      padding: 0 8px;
      font-size: 8px;
    }

    .writer-readers-card-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .writer-reader-card {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
    }

    .writer-reader-card > header {
      min-height: 28px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .writer-reader-card > header > strong {
      flex: 1;
      min-width: 0;
      color: #111827;
      font-size: 12px;
      line-height: 1.3;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .writer-reader-card .writer-readers-status {
      min-height: 23px;
      padding: 0 8px;
      font-size: 8px;
    }

    .writer-reader-email {
      color: #6b7280;
      font-size: 9px;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .writer-reader-info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .writer-reader-info-grid > div {
      min-width: 0;
      min-height: 42px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .writer-reader-info-grid span {
      color: #6b7280;
      font-size: 7px;
      line-height: 1.2;
      font-weight: 600;
      text-transform: uppercase;
    }

    .writer-reader-info-grid strong {
      color: #111827;
      font-size: 9px;
      line-height: 1.35;
      font-weight: 500;
      overflow-wrap: anywhere;
    }

    .writer-readers-mobile-state {
      padding: 28px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      color: #6b7280;
      font-size: 10px;
      text-align: center;
    }
  }

  @media (max-width: 390px) {
    .writer-readers-page {
      min-width: 0;
    }

    .writer-readers-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`;

const thStyle = {
  textAlign: 'left',
  padding: '14px 12px',
  fontSize: 13,
  color: '#6b7280',
  fontWeight: 700,
};

const tdStyle = {
  padding: '14px 12px',
  fontSize: 14,
  color: '#111827',
  verticalAlign: 'top',
};

const emptyTdStyle = {
  padding: '26px 12px',
  textAlign: 'center',
  color: '#6b7280',
};
