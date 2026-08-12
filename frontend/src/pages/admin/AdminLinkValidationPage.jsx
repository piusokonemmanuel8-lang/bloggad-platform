import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  ExternalLink,
  Filter,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
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

function resultBadgeStyle(allowed) {
  if (allowed) {
    return {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  }

  return {
    border: '1px solid #f1b5b8',
    background: '#fff1f2',
    color: '#b42318',
  };
}

function filterButtonStyle(active) {
  return {
    border: active ? '1px solid #2271b1' : '1px solid #dcdcde',
    background: active ? '#2271b1' : '#ffffff',
    color: active ? '#ffffff' : '#1d2327',
    padding: '10px 16px',
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const iconTone =
    tone === 'primary'
      ? { background: '#2271b1', color: '#fff', border: '1px solid #2271b1' }
      : tone === 'success'
      ? { background: '#ecfdf3', color: '#166534', border: '1px solid #b7e4c7' }
      : tone === 'danger'
      ? { background: '#fff1f2', color: '#b42318', border: '1px solid #f1b5b8' }
      : { background: '#f6f7f7', color: '#1d2327', border: '1px solid #dcdcde' };

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
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 34, lineHeight: 1, fontWeight: 700, color: '#1d2327' }}>
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
            ...iconTone,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminLinkValidationPage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedLogId, setSelectedLogId] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [domainRules, setDomainRules] = useState([]);
  const [editingRuleId, setEditingRuleId] = useState('');
  const [domainRuleSaving, setDomainRuleSaving] = useState(false);
  const [domainRuleDeletingId, setDomainRuleDeletingId] = useState('');
  const [domainRuleForm, setDomainRuleForm] = useState({
    domain: '',
    rule_status: 'review',
    category: '',
    reason: '',
    applies_to_subdomains: true,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deletingOne, setDeletingOne] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLogs = async (nextFilter = filter) => {
    let endpoint = '/api/admin/link-validation';

    if (nextFilter === 'failed') {
      endpoint = '/api/admin/link-validation/failed';
    }

    if (nextFilter === 'passed') {
      endpoint = '/api/admin/link-validation/passed';
    }

    const { data } = await api.get(endpoint);
    setLogs(data?.logs || []);
  };

  const fetchSummary = async () => {
    const { data } = await api.get('/api/admin/link-validation/summary');
    setSummary(data?.summary || null);
  };

  const fetchDomainRules = async () => {
    const { data } = await api.get('/api/admin/link-validation/domains');
    setDomainRules(data?.rules || []);
  };

  const resetDomainRuleForm = () => {
    setEditingRuleId('');
    setDomainRuleForm({
      domain: '',
      rule_status: 'review',
      category: '',
      reason: '',
      applies_to_subdomains: true,
      is_active: true,
    });
  };

  const handleDomainRuleField = (field, value) => {
    setDomainRuleForm((current) => ({ ...current, [field]: value }));
  };

  const handleEditDomainRule = (rule) => {
    setEditingRuleId(String(rule.id));
    setDomainRuleForm({
      domain: rule.domain || '',
      rule_status: rule.rule_status || 'review',
      category: rule.category || '',
      reason: rule.reason || '',
      applies_to_subdomains: Boolean(rule.applies_to_subdomains),
      is_active: Boolean(rule.is_active),
    });
    setError('');
    setSuccess('');
  };

  const handleSaveDomainRule = async (event) => {
    event.preventDefault();

    if (!domainRuleForm.domain.trim()) {
      setError('Domain is required');
      return;
    }

    try {
      setDomainRuleSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        domain: domainRuleForm.domain.trim(),
        rule_status: domainRuleForm.rule_status,
        category: domainRuleForm.category.trim() || null,
        reason: domainRuleForm.reason.trim() || null,
        applies_to_subdomains: Boolean(domainRuleForm.applies_to_subdomains),
        is_active: Boolean(domainRuleForm.is_active),
      };

      if (editingRuleId) {
        await api.put(`/api/admin/link-validation/domains/${editingRuleId}`, payload);
      } else {
        await api.post('/api/admin/link-validation/domains', payload);
      }

      await fetchDomainRules();
      setSuccess(editingRuleId ? 'Domain rule updated successfully' : 'Domain rule created successfully');
      resetDomainRuleForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save domain rule');
    } finally {
      setDomainRuleSaving(false);
    }
  };

  const handleDeleteDomainRule = async (rule) => {
    const confirmed = window.confirm(`Delete domain rule for ${rule.domain}?`);
    if (!confirmed) return;

    try {
      setDomainRuleDeletingId(String(rule.id));
      setError('');
      setSuccess('');
      await api.delete(`/api/admin/link-validation/domains/${rule.id}`);
      await fetchDomainRules();
      if (String(editingRuleId) === String(rule.id)) {
        resetDomainRuleForm();
      }
      setSuccess('Domain rule deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete domain rule');
    } finally {
      setDomainRuleDeletingId('');
    }
  };

  const fetchSingleLog = async (logId) => {
    const { data } = await api.get(`/api/admin/link-validation/${logId}`);
    setSelectedLog(data?.log || null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await Promise.all([fetchLogs('all'), fetchSummary(), fetchDomainRules()]);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load link validation logs');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleFilterChange = async (nextFilter) => {
    try {
      setLoading(true);
      setFilter(nextFilter);
      setSelectedLogId('');
      setSelectedLog(null);
      setError('');
      setSuccess('');
      await fetchLogs(nextFilter);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to filter validation logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLog = async (log) => {
    try {
      setDetailsLoading(true);
      setSelectedLogId(String(log.id));
      setError('');
      setSuccess('');
      await fetchSingleLog(log.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load validation log details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteOne = async () => {
    if (!selectedLogId) return;

    const confirmed = window.confirm('Delete this validation log?');
    if (!confirmed) return;

    try {
      setDeletingOne(true);
      setError('');
      setSuccess('');

      const { data } = await api.delete(`/api/admin/link-validation/${selectedLogId}`);

      setSelectedLogId('');
      setSelectedLog(null);
      await Promise.all([fetchLogs(filter), fetchSummary()]);
      setSuccess(data?.message || 'Validation log deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete validation log');
    } finally {
      setDeletingOne(false);
    }
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm('Clear all validation logs?');
    if (!confirmed) return;

    try {
      setClearingAll(true);
      setError('');
      setSuccess('');

      const { data } = await api.delete('/api/admin/link-validation');

      setSelectedLogId('');
      setSelectedLog(null);
      await Promise.all([fetchLogs(filter), fetchSummary()]);
      setSuccess(data?.message || 'All validation logs cleared successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to clear validation logs');
    } finally {
      setClearingAll(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setSuccess('');
      await Promise.all([fetchLogs(filter), fetchSummary(), fetchDomainRules()]);
      if (selectedLogId) {
        await fetchSingleLog(selectedLogId);
      }
      setSuccess('Link validation data refreshed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh link validation data');
    } finally {
      setRefreshing(false);
    }
  };

  const hostBreakdown = useMemo(() => summary?.by_detected_host || [], [summary]);
  const sourceBreakdown = useMemo(() => summary?.by_source_type || [], [summary]);

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return logs;

    return logs.filter((log) => {
      const submittedLink = String(log?.submitted_link || '').toLowerCase();
      const detectedHost = String(log?.detected_host || '').toLowerCase();
      const sourceType = String(log?.source_type || '').toLowerCase();
      const failureReason = String(log?.failure_reason || '').toLowerCase();
      const status = log?.is_allowed ? 'allowed' : 'blocked';

      return (
        submittedLink.includes(keyword) ||
        detectedHost.includes(keyword) ||
        sourceType.includes(keyword) ||
        failureReason.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [logs, search]);

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading link validation logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-link-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-link-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-link-main-grid {
          display: grid;
          grid-template-columns: 420px minmax(0, 1fr);
          gap: 20px;
        }
        .admin-link-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .admin-link-domain-grid {
          display: grid;
          grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr);
          gap: 20px;
        }
        .admin-link-domain-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .spin-soft {
          animation: spinSoft 0.9s linear infinite;
        }
        @keyframes spinSoft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          .admin-link-grid-4,
          .admin-link-grid-2,
          .admin-link-main-grid,
          .admin-link-detail-grid,
          .admin-link-domain-grid,
          .admin-link-domain-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ marginBottom: 22 }}>
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
              Link Validation
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#646970' }}>
              Monitor passed and blocked links and review violations across the platform.
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

            <button
              type="button"
              onClick={handleClearAll}
              disabled={clearingAll}
              style={{
                border: '1px solid #d63638',
                background: '#ffffff',
                color: '#d63638',
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Trash2 size={16} />
              {clearingAll ? 'Clearing...' : 'Clear All Logs'}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #d63638',
              color: '#b42318',
              marginBottom: 20,
            }),
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #00a32a',
              color: '#166534',
              marginBottom: 20,
            }),
          }}
        >
          {success}
        </div>
      ) : null}

      <div style={{ ...cardStyle({ padding: 16, marginBottom: 20, borderLeft: '4px solid #72aee6' }) }}>
        This page tracks allowed and blocked outbound links so Bloggad can review destination domains and enforce link safety policy.
      </div>

      <section style={{ ...cardStyle(), marginBottom: 20 }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1d2327', marginBottom: 6 }}>
            Domain Rules
          </div>
          <div style={{ fontSize: 13, color: '#646970' }}>
            Control destination domains without restricting legitimate external links for Writers.
          </div>
        </div>

        <div className="admin-link-domain-grid" style={{ padding: 18 }}>
          <form onSubmit={handleSaveDomainRule} style={cardStyle({ padding: 16, background: '#f6f7f7' })}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 14 }}>
              {editingRuleId ? 'Edit Domain Rule' : 'Add Domain Rule'}
            </div>

            <div className="admin-link-domain-form-grid">
              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d2327' }}>Domain</span>
                <input
                  type="text"
                  value={domainRuleForm.domain}
                  onChange={(event) => handleDomainRuleField('domain', event.target.value)}
                  placeholder="example.com"
                  required
                  style={{ padding: '11px 12px', border: '1px solid #8c8f94', background: '#fff' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d2327' }}>Rule</span>
                <select
                  value={domainRuleForm.rule_status}
                  onChange={(event) => handleDomainRuleField('rule_status', event.target.value)}
                  style={{ padding: '11px 12px', border: '1px solid #8c8f94', background: '#fff' }}
                >
                  <option value="allow">Allow</option>
                  <option value="block">Block</option>
                  <option value="review">Review</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d2327' }}>Category</span>
                <input
                  type="text"
                  value={domainRuleForm.category}
                  onChange={(event) => handleDomainRuleField('category', event.target.value)}
                  placeholder="e.g. gambling, adult, phishing"
                  style={{ padding: '11px 12px', border: '1px solid #8c8f94', background: '#fff' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d2327' }}>Reason</span>
                <textarea
                  value={domainRuleForm.reason}
                  onChange={(event) => handleDomainRuleField('reason', event.target.value)}
                  placeholder="Why should Bloggad allow, block, or review this domain?"
                  rows={3}
                  style={{ padding: '11px 12px', border: '1px solid #8c8f94', background: '#fff', resize: 'vertical' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1d2327' }}>
                <input
                  type="checkbox"
                  checked={domainRuleForm.applies_to_subdomains}
                  onChange={(event) => handleDomainRuleField('applies_to_subdomains', event.target.checked)}
                />
                Apply this rule to subdomains
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1d2327' }}>
                <input
                  type="checkbox"
                  checked={domainRuleForm.is_active}
                  onChange={(event) => handleDomainRuleField('is_active', event.target.checked)}
                />
                Rule is active
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button
                type="submit"
                disabled={domainRuleSaving}
                style={{
                  border: '1px solid #2271b1',
                  background: '#2271b1',
                  color: '#fff',
                  padding: '10px 16px',
                  fontWeight: 600,
                  cursor: domainRuleSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {domainRuleSaving ? 'Saving...' : editingRuleId ? 'Update Rule' : 'Add Rule'}
              </button>
              {editingRuleId ? (
                <button
                  type="button"
                  onClick={resetDomainRuleForm}
                  disabled={domainRuleSaving}
                  style={{
                    border: '1px solid #8c8f94',
                    background: '#fff',
                    color: '#1d2327',
                    padding: '10px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          <div style={cardStyle()}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #dcdcde' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                Current Rules ({domainRules.length})
              </div>
            </div>
            <div style={{ padding: 16, maxHeight: 560, overflowY: 'auto' }}>
              {domainRules.length ? (
                domainRules.map((rule) => {
                  const tone =
                    rule.rule_status === 'allow'
                      ? { background: '#ecfdf3', color: '#166534', border: '1px solid #b7e4c7' }
                      : rule.rule_status === 'block'
                      ? { background: '#fff1f2', color: '#b42318', border: '1px solid #f1b5b8' }
                      : { background: '#fff8e5', color: '#8a4b08', border: '1px solid #f0c36d' };

                  return (
                    <div key={rule.id} style={{ ...cardStyle({ padding: 14 }), marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#1d2327', wordBreak: 'break-word' }}>
                            {rule.domain}
                          </div>
                          <div style={{ fontSize: 12, color: '#646970', marginTop: 5 }}>
                            {rule.category || 'Uncategorized'}
                            {rule.applies_to_subdomains ? ' - includes subdomains' : ' - exact domain only'}
                          </div>
                        </div>
                        <span
                          style={{
                            ...tone,
                            padding: '5px 9px',
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            alignSelf: 'flex-start',
                          }}
                        >
                          {rule.rule_status}
                        </span>
                      </div>

                      <div style={{ fontSize: 13, color: '#646970', marginTop: 10, wordBreak: 'break-word' }}>
                        {rule.reason || 'No reason recorded.'}
                      </div>

                      <div style={{ fontSize: 12, color: rule.is_active ? '#166534' : '#646970', marginTop: 8 }}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => handleEditDomainRule(rule)}
                          style={{
                            border: '1px solid #2271b1',
                            background: '#fff',
                            color: '#2271b1',
                            padding: '7px 11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDomainRule(rule)}
                          disabled={String(domainRuleDeletingId) === String(rule.id)}
                          style={{
                            border: '1px solid #d63638',
                            background: '#fff',
                            color: '#d63638',
                            padding: '7px 11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {String(domainRuleDeletingId) === String(rule.id) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: '#646970', fontSize: 13 }}>
                  No domain rules yet. Valid outbound links remain allowed unless another safety rule blocks them.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="admin-link-grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Logs" value={summary?.total_logs || 0} icon={Globe} tone="primary" />
        <StatCard label="Passed Logs" value={summary?.passed_logs || 0} icon={ShieldCheck} tone="success" />
        <StatCard label="Failed Logs" value={summary?.failed_logs || 0} icon={ShieldAlert} tone="danger" />
        <StatCard label="Current Filter" value={String(filter || 'all').toUpperCase()} icon={Filter} />
      </div>

      <div style={{ ...cardStyle({ padding: 16, marginBottom: 20 }) }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
              Filter Logs
            </div>
            <div style={{ fontSize: 13, color: '#646970' }}>
              Switch between all, allowed, and blocked validation records.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              style={filterButtonStyle(filter === 'all')}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('passed')}
              style={filterButtonStyle(filter === 'passed')}
            >
              Passed
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('failed')}
              style={filterButtonStyle(filter === 'failed')}
            >
              Failed
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 460 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#646970',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search links, host, source type, reason..."
            style={{
              width: '100%',
              padding: '12px 14px 12px 40px',
              border: '1px solid #8c8f94',
              background: '#fff',
              color: '#1d2327',
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div className="admin-link-grid-2" style={{ marginBottom: 20 }}>
        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
              By Source Type
            </div>
            <div style={{ fontSize: 13, color: '#646970' }}>
              Validation volume split by content source type.
            </div>
          </div>

          <div style={{ padding: 18 }}>
            {sourceBreakdown.length ? (
              sourceBreakdown.map((item) => (
                <div
                  key={item.source_type}
                  style={{
                    border: '1px solid #dcdcde',
                    background: '#ffffff',
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#1d2327', textTransform: 'capitalize' }}>
                        {item.source_type || '-'}
                      </div>
                      <div style={{ fontSize: 13, color: '#646970', marginTop: 4 }}>
                        Source type summary
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        background: '#f6f7f7',
                        border: '1px solid #dcdcde',
                        color: '#50575e',
                      }}
                    >
                      {item.total_logs || 0} total
                    </div>
                  </div>

                  <div className="admin-link-detail-grid">
                    <div style={{ ...cardStyle({ padding: 12, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Total</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>{item.total_logs || 0}</div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#ecfdf3', border: '1px solid #b7e4c7' }) }}>
                      <div style={{ fontSize: 12, color: '#166534', marginBottom: 8 }}>Passed</div>
                      <div style={{ fontWeight: 600, color: '#166534' }}>{item.passed_logs || 0}</div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 12, background: '#fff1f2', border: '1px solid #f1b5b8', gridColumn: '1 / -1' }) }}>
                      <div style={{ fontSize: 12, color: '#b42318', marginBottom: 8 }}>Failed</div>
                      <div style={{ fontWeight: 600, color: '#b42318' }}>{item.failed_logs || 0}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#646970' }}>No source breakdown yet.</div>
            )}
          </div>
        </section>

        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
              By Detected Host
            </div>
            <div style={{ fontSize: 13, color: '#646970' }}>
              Host distribution of submitted and validated links.
            </div>
          </div>

          <div style={{ padding: 18 }}>
            {hostBreakdown.length ? (
              hostBreakdown.map((item) => (
                <div
                  key={`${item.detected_host}-${item.total_logs}`}
                  style={{
                    border: '1px solid #dcdcde',
                    background: '#ffffff',
                    padding: 14,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                      {item.detected_host || '-'}
                    </div>
                    <div style={{ fontSize: 13, color: '#646970', marginTop: 4 }}>
                      Detected host
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '5px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#f6f7f7',
                      border: '1px solid #dcdcde',
                      color: '#50575e',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.total_logs || 0}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#646970' }}>No host breakdown yet.</div>
            )}
          </div>
        </section>
      </div>

      <div className="admin-link-main-grid">
        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                  Validation Logs
                </div>
                <div style={{ fontSize: 13, color: '#646970' }}>
                  Select a record to inspect its full validation details.
                </div>
              </div>

              <div
                style={{
                  padding: '6px 10px',
                  background: '#f6f7f7',
                  border: '1px solid #dcdcde',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#50575e',
                }}
              >
                {filteredLogs.length} shown
              </div>
            </div>
          </div>

          <div style={{ maxHeight: 980, overflowY: 'auto', padding: 18 }}>
            {filteredLogs.length ? (
              filteredLogs.map((log) => {
                const selected = String(selectedLogId) === String(log.id);

                return (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => handleSelectLog(log)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: 12,
                      padding: 16,
                      cursor: 'pointer',
                      background: selected ? '#f0f6fc' : '#ffffff',
                      border: selected ? '1px solid #72aee6' : '1px solid #dcdcde',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: log.is_allowed ? '#ecfdf3' : '#fff1f2',
                            border: log.is_allowed
                              ? '1px solid #b7e4c7'
                              : '1px solid #f1b5b8',
                            color: log.is_allowed ? '#166534' : '#b42318',
                            flexShrink: 0,
                          }}
                        >
                          {log.is_allowed ? <ShieldCheck size={18} /> : <Ban size={18} />}
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
                            {log.submitted_link || '-'}
                          </div>
                          <div style={{ fontSize: 13, color: '#646970', wordBreak: 'break-word' }}>
                            Host: {log.detected_host || '-'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...resultBadgeStyle(Boolean(log.is_allowed)),
                        }}
                      >
                        {log.is_allowed ? 'Allowed' : 'Blocked'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 8, fontSize: 13, color: '#646970' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>Source Type</span>
                        <strong style={{ color: '#1d2327' }}>{log.source_type || '-'}</strong>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>Reason</span>
                        <strong style={{ color: '#1d2327' }}>
                          {log.failure_reason || (log.is_allowed ? 'Passed' : '-')}
                        </strong>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ color: '#646970' }}>No validation logs found.</div>
            )}
          </div>
        </section>

        <section>
          {detailsLoading ? (
            <div style={cardStyle({ padding: 20 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
                <Loader2 size={18} className="spin-soft" />
                <span>Loading log details...</span>
              </div>
            </div>
          ) : selectedLog ? (
            <>
              <div style={{ ...cardStyle(), marginBottom: 20 }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                    Log Details
                  </div>
                  <div style={{ fontSize: 13, color: '#646970' }}>
                    Full inspection of the selected validation record.
                  </div>
                </div>

                <div className="admin-link-detail-grid" style={{ padding: 18 }}>
                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7', gridColumn: '1 / -1' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Submitted Link</div>
                    <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                      {selectedLog.submitted_link || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Log ID</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>{selectedLog.id}</div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Detected Host</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {selectedLog.detected_host || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Validation Result</div>
                    <div
                      style={{
                        display: 'inline-flex',
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        ...resultBadgeStyle(Boolean(selectedLog.is_allowed)),
                      }}
                    >
                      {selectedLog.is_allowed ? 'Allowed' : 'Blocked'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Source Type</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {selectedLog.source_type || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Source ID</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {selectedLog.source_id || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Created At</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {formatDateTime(selectedLog.created_at)}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7', gridColumn: '1 / -1' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Failure Reason</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {selectedLog.failure_reason || '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-link-grid-2" style={{ marginBottom: 20 }}>
                <div style={cardStyle()}>
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>Affiliate</div>
                  </div>

                  <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                    <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Name</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {selectedLog.affiliate?.name || '-'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Email</div>
                      <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                        {selectedLog.affiliate?.email || '-'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Status</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {selectedLog.affiliate?.status || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>Website</div>
                  </div>

                  <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                    <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Website Name</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {selectedLog.website?.website_name || selectedLog.website?.name || '-'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Slug</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {selectedLog.website?.slug || '-'}
                      </div>
                    </div>

                    <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                      <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Status</div>
                      <div style={{ fontWeight: 600, color: '#1d2327' }}>
                        {selectedLog.website?.status || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>Actions</div>
                </div>

                <div style={{ padding: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {selectedLog.submitted_link ? (
                    <a
                      href={selectedLog.submitted_link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        border: '1px solid #8c8f94',
                        background: '#ffffff',
                        color: '#1d2327',
                        padding: '10px 14px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <ExternalLink size={16} />
                      Open Submitted Link
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleDeleteOne}
                    disabled={deletingOne}
                    style={{
                      border: '1px solid #d63638',
                      background: '#fff1f2',
                      color: '#d63638',
                      padding: '10px 14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {deletingOne ? (
                      <>
                        <Loader2 size={16} className="spin-soft" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete This Log
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={cardStyle({ padding: 40, textAlign: 'center', color: '#646970' })}>
              Choose a validation record from the left panel to inspect details.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}