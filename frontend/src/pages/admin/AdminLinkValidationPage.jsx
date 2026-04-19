import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

export default function AdminLinkValidationPage() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedLogId, setSelectedLogId] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [filter, setFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deletingOne, setDeletingOne] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
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

  const fetchSingleLog = async (logId) => {
    const { data } = await api.get(`/api/admin/link-validation/${logId}`);
    setSelectedLog(data?.log || null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchLogs('all'), fetchSummary()]);
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

  const hostBreakdown = useMemo(() => summary?.by_detected_host || [], [summary]);
  const sourceBreakdown = useMemo(() => summary?.by_source_type || [], [summary]);

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading link validation logs...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Link Validation</h1>
          <p className="page-subtitle">
            Monitor allowed and blocked links and enforce the supgad.com-only rule.
          </p>
        </div>

        {error ? (
          <div
            className="surface-card surface-card-padding"
            style={{ marginBottom: 20, border: '1px solid rgba(255, 80, 80, 0.22)' }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            className="surface-card surface-card-padding"
            style={{ marginBottom: 20, border: '1px solid rgba(80, 200, 120, 0.22)' }}
          >
            {success}
          </div>
        ) : null}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <div className="stat-label">Total Logs</div>
            <div className="stat-value">{summary?.total_logs || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Passed Logs</div>
            <div className="stat-value">{summary?.passed_logs || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Failed Logs</div>
            <div className="stat-value">{summary?.failed_logs || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Current Filter</div>
            <div className="stat-value" style={{ fontSize: '1.15rem' }}>
              {filter}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <button className="btn btn-primary" type="button" onClick={() => handleFilterChange('all')}>
            All
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => handleFilterChange('passed')}>
            Passed
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => handleFilterChange('failed')}>
            Failed
          </button>
          <button className="btn btn-secondary" type="button" onClick={handleClearAll} disabled={clearingAll}>
            {clearingAll ? 'Clearing...' : 'Clear All Logs'}
          </button>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">By Source Type</h2>

            <div className="form-stack">
              {sourceBreakdown.length ? (
                sourceBreakdown.map((item) => (
                  <div key={item.source_type} className="surface-card surface-card-padding">
                    <div style={{ fontWeight: 700 }}>{item.source_type}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Total: {item.total_logs || 0}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Passed: {item.passed_logs || 0}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Failed: {item.failed_logs || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div>No source breakdown yet.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">By Detected Host</h2>

            <div className="form-stack">
              {hostBreakdown.length ? (
                hostBreakdown.map((item) => (
                  <div key={`${item.detected_host}-${item.total_logs}`} className="surface-card surface-card-padding">
                    <div style={{ fontWeight: 700 }}>{item.detected_host}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Total: {item.total_logs || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div>No host breakdown yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Validation Logs</h2>

            <div className="form-stack">
              {logs.length ? (
                logs.map((log) => (
                  <button
                    key={log.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => handleSelectLog(log)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedLogId) === String(log.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedLogId) === String(log.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{log.submitted_link || '-'}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Host: {log.detected_host || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Allowed: {log.is_allowed ? 'Yes' : 'No'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Source Type: {log.source_type || '-'}
                    </div>
                  </button>
                ))
              ) : (
                <div>No validation logs found.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Log Details</h2>

            {detailsLoading ? (
              <div>Loading log details...</div>
            ) : selectedLog ? (
              <div className="form-stack">
                <div className="surface-card surface-card-padding">
                  <div><strong>ID:</strong> {selectedLog.id}</div>
                  <div><strong>Submitted Link:</strong> {selectedLog.submitted_link || '-'}</div>
                  <div><strong>Detected Host:</strong> {selectedLog.detected_host || '-'}</div>
                  <div><strong>Allowed:</strong> {selectedLog.is_allowed ? 'Yes' : 'No'}</div>
                  <div><strong>Failure Reason:</strong> {selectedLog.failure_reason || '-'}</div>
                  <div><strong>Source Type:</strong> {selectedLog.source_type || '-'}</div>
                  <div><strong>Source ID:</strong> {selectedLog.source_id || '-'}</div>
                  <div><strong>Created At:</strong> {selectedLog.created_at || '-'}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Affiliate</h3>
                  <div><strong>Name:</strong> {selectedLog.affiliate?.name || '-'}</div>
                  <div><strong>Email:</strong> {selectedLog.affiliate?.email || '-'}</div>
                  <div><strong>Status:</strong> {selectedLog.affiliate?.status || '-'}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Website</h3>
                  <div><strong>Name:</strong> {selectedLog.website?.website_name || selectedLog.website?.name || '-'}</div>
                  <div><strong>Slug:</strong> {selectedLog.website?.slug || '-'}</div>
                  <div><strong>Status:</strong> {selectedLog.website?.status || '-'}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Actions</h3>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleDeleteOne}
                    disabled={deletingOne}
                  >
                    {deletingOne ? 'Deleting...' : 'Delete This Log'}
                  </button>
                </div>
              </div>
            ) : (
              <div>Select a validation log to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}