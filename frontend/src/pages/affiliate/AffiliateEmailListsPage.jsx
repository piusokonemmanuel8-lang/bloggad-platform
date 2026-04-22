import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AffiliateEmailListsPage() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const totalLeads = leads.length;
    const totalCustomers = leads.filter((lead) => !!lead?.customer_user_id).length;
    const totalWebsites = new Set(
      leads.map((lead) => lead?.website_id).filter(Boolean)
    ).size;

    return {
      totalLeads,
      totalCustomers,
      totalWebsites,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;

    const query = search.trim().toLowerCase();

    return (leads || []).filter((lead) => {
      return (
        String(lead?.email || '').toLowerCase().includes(query) ||
        String(lead?.website?.website_name || '').toLowerCase().includes(query) ||
        String(lead?.website?.slug || '').toLowerCase().includes(query) ||
        String(lead?.customer?.name || '').toLowerCase().includes(query) ||
        String(lead?.customer?.email || '').toLowerCase().includes(query) ||
        String(lead?.template?.name || '').toLowerCase().includes(query) ||
        String(lead?.source_type || '').toLowerCase().includes(query)
      );
    });
  }, [leads, search]);

  async function loadLeads() {
    try {
      setLoading(true);
      setError('');

      const { data } = await api.get('/api/email-list/leads');
      setLeads(data?.leads || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load email lists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

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
            border: '1px solid #e5e7eb',
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>My Email Leads</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#111827' }}>
            {stats.totalLeads}
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
            Leads Linked To Customers
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#111827' }}>
            {stats.totalCustomers}
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
            Websites With Leads
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#111827' }}>
            {stats.totalWebsites}
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
            <h2 style={{ margin: 0, fontSize: 24, color: '#111827' }}>Email Lists</h2>
            <p style={{ margin: '6px 0 0', color: '#6b7280' }}>
              Email leads captured from your storefronts.
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
              placeholder="Search email, website, customer, source"
              style={{
                width: 300,
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
          <table style={{ width: '100%', minWidth: 1020, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Website</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Template</th>
                <th style={thStyle}>Captured At</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={emptyTdStyle}>
                    Loading email leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} style={emptyTdStyle}>
                    No email leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{lead?.email || '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{lead?.website?.website_name || '-'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                        {lead?.website?.slug || '-'}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {lead?.customer ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{lead.customer.name || '-'}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                            {lead.customer.email || '-'}
                          </div>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: '#eef2ff',
                          color: '#4338ca',
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {lead?.source_type || '-'}
                      </span>
                    </td>
                    <td style={tdStyle}>{lead?.template?.name || '-'}</td>
                    <td style={tdStyle}>{formatDateTime(lead?.captured_at)}</td>
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