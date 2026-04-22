import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminEmailListsPage() {
  const [leads, setLeads] = useState([]);
  const [totals, setTotals] = useState({
    total_leads: 0,
    total_affiliates_with_leads: 0,
    total_websites_with_leads: 0,
  });
  const [byAffiliate, setByAffiliate] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        String(lead?.template?.name || '').toLowerCase().includes(query)
      );
    });
  }, [leads, search]);

  async function loadPage() {
    try {
      setLoading(true);
      setError('');

      const [statsRes, leadsRes] = await Promise.all([
        api.get('/api/email-list/admin/stats'),
        api.get('/api/email-list/leads'),
      ]);

      setTotals(
        statsRes?.data?.totals || {
          total_leads: 0,
          total_affiliates_with_leads: 0,
          total_websites_with_leads: 0,
        }
      );

      setByAffiliate(statsRes?.data?.by_affiliate || []);
      setLeads(leadsRes?.data?.leads || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load email lists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
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
            border: '1px solid #dcdcde',
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 8 }}>Total Email Leads</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1d2327' }}>
            {totals.total_leads || 0}
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
            Affiliates With Leads
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1d2327' }}>
            {totals.total_affiliates_with_leads || 0}
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
            Websites With Leads
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#1d2327' }}>
            {totals.total_websites_with_leads || 0}
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
            <h2 style={{ margin: 0, fontSize: 24, color: '#1d2327' }}>Email Lists</h2>
            <p style={{ margin: '6px 0 0', color: '#646970' }}>
              All captured email leads across the platform.
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
              placeholder="Search email, website, customer, template"
              style={{
                width: 300,
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
          <table style={{ width: '100%', minWidth: 1080, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f6f7f7' }}>
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
                    Loading email lists...
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
                  <tr key={lead.id} style={{ borderTop: '1px solid #f0f0f1' }}>
                    <td style={tdStyle}>{lead?.email || '-'}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{lead?.website?.website_name || '-'}</div>
                      <div style={{ fontSize: 12, color: '#646970', marginTop: 4 }}>
                        {lead?.website?.slug || '-'}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {lead?.customer ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{lead.customer.name || '-'}</div>
                          <div style={{ fontSize: 12, color: '#646970', marginTop: 4 }}>
                            {lead.customer.email || '-'}
                          </div>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={tdStyle}>{lead?.source_type || '-'}</td>
                    <td style={tdStyle}>{lead?.template?.name || '-'}</td>
                    <td style={tdStyle}>{formatDateTime(lead?.captured_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 22, color: '#1d2327' }}>Top Affiliates by Leads</h3>
          <p style={{ margin: '6px 0 0', color: '#646970' }}>
            Read-only lead ranking from current captured email lists.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f6f7f7' }}>
                <th style={thStyle}>Affiliate Name</th>
                <th style={thStyle}>Affiliate Email</th>
                <th style={thStyle}>Total Leads</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={emptyTdStyle}>
                    Loading affiliate lead stats...
                  </td>
                </tr>
              ) : byAffiliate.length === 0 ? (
                <tr>
                  <td colSpan={3} style={emptyTdStyle}>
                    No affiliate lead stats found.
                  </td>
                </tr>
              ) : (
                byAffiliate.map((item) => (
                  <tr key={item.affiliate_id} style={{ borderTop: '1px solid #f0f0f1' }}>
                    <td style={tdStyle}>{item?.affiliate_name || '-'}</td>
                    <td style={tdStyle}>{item?.affiliate_email || '-'}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          minWidth: 44,
                          justifyContent: 'center',
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: '#eef2ff',
                          color: '#4338ca',
                          fontWeight: 800,
                        }}
                      >
                        {item?.total_leads || 0}
                      </span>
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