import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminReadingCorePage() {
  const [rules, setRules] = useState([]);
  const [reports, setReports] = useState([]);
  const [savingType, setSavingType] = useState('');
  const [savingReport, setSavingReport] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      setError('');
      const [configResponse, reportsResponse] = await Promise.all([
        api.get('/api/admin/reading/config'),
        api.get('/api/admin/reading/reports'),
      ]);

      setRules(configResponse?.data?.publish_rules || []);
      setReports(reportsResponse?.data?.reports || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load Reading standards.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateRuleLocal(contentType, field, value) {
    setRules((current) =>
      current.map((rule) =>
        rule.content_type === contentType
          ? { ...rule, [field]: value }
          : rule
      )
    );
  }

  function updateReportLocal(reportId, field, value) {
    setReports((current) =>
      current.map((report) =>
        Number(report.id) === Number(reportId)
          ? { ...report, [field]: value }
          : report
      )
    );
  }

  async function saveRule(rule) {
    try {
      setSavingType(rule.content_type);
      setError('');
      setNotice('');

      await api.put(`/api/admin/reading/publish-rules/${rule.content_type}`, {
        min_words: Number(rule.min_words || 0),
        is_active: !!rule.is_active,
      });

      setNotice(`Publish rule saved for ${rule.content_type}.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save publish rule.');
    } finally {
      setSavingType('');
    }
  }

  async function saveReport(report) {
    try {
      setSavingReport(String(report.id));
      setError('');
      setNotice('');

      await api.patch(`/api/admin/reading/reports/${report.id}`, {
        status: report.status,
        admin_note: report.admin_note || '',
      });

      setNotice(`Story report ${report.id} updated.`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update story report.');
    } finally {
      setSavingReport('');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section
        style={{
          background: '#fff',
          border: '1px solid #dcdcde',
          padding: 20,
        }}
      >
        <h1 style={{ margin: '0 0 8px' }}>Reading Standards</h1>
        <p style={{ margin: '0 0 14px', color: '#646970', lineHeight: 1.6 }}>
          Manage minimum publish lengths and review Reader story reports here.
          Topic hierarchy, parent categories, ordering, and category status continue
          to use the existing Categories manager.
        </p>
        <Link
          to="/admin/categories"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid #2271b1',
            padding: '9px 12px',
            color: '#2271b1',
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Manage Categories and Topic Hierarchy
        </Link>
      </section>

      {notice ? (
        <div
          style={{
            padding: 12,
            border: '1px solid #b7e4c7',
            background: '#ecfdf3',
            color: '#166534',
          }}
        >
          {notice}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            padding: 12,
            border: '1px solid #f1aeb5',
            background: '#fff1f2',
            color: '#b91c1c',
          }}
        >
          {error}
        </div>
      ) : null}

      <section
        style={{
          background: '#fff',
          border: '1px solid #dcdcde',
          padding: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Minimum publish length</h2>
        <p style={{ color: '#646970', lineHeight: 1.6 }}>
          Drafts remain unrestricted. These rules are checked only when a post is
          published or when a scheduled post is released.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          {rules.map((rule) => (
            <div
              key={rule.content_type}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(170px, 1fr) 150px 120px 100px',
                gap: 10,
                alignItems: 'center',
                borderTop: '1px solid #f0f0f1',
                paddingTop: 10,
              }}
            >
              <strong>{rule.content_type}</strong>
              <input
                type="number"
                min="0"
                max="5000"
                value={rule.min_words}
                onChange={(event) =>
                  updateRuleLocal(rule.content_type, 'min_words', event.target.value)
                }
              />
              <label>
                <input
                  type="checkbox"
                  checked={!!rule.is_active}
                  onChange={(event) =>
                    updateRuleLocal(rule.content_type, 'is_active', event.target.checked)
                  }
                />{' '}
                Active
              </label>
              <button
                type="button"
                disabled={savingType === rule.content_type}
                onClick={() => saveRule(rule)}
              >
                {savingType === rule.content_type ? 'Saving...' : 'Save'}
              </button>
            </div>
          ))}

          {!rules.length && !error ? (
            <div style={{ color: '#646970' }}>No publish rules are configured.</div>
          ) : null}
        </div>
      </section>

      <section
        style={{
          background: '#fff',
          border: '1px solid #dcdcde',
          padding: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Story reports</h2>
        <p style={{ color: '#646970', lineHeight: 1.6 }}>
          Reader reports are moderation signals. Updating a report does not silently
          delete or unpublish a Writer story.
        </p>

        <div style={{ display: 'grid', gap: 12 }}>
          {reports.map((report) => (
            <article
              key={report.id}
              style={{
                borderTop: '1px solid #f0f0f1',
                paddingTop: 12,
                display: 'grid',
                gap: 8,
              }}
            >
              <div>
                <strong>#{report.id} {report.post_title || `Post ${report.post_id}`}</strong>
                <div style={{ color: '#646970', fontSize: 13 }}>
                  Reason: {String(report.reason || '').replaceAll('_', ' ')}
                  {' | '}
                  Reporter: {report.reporter_name || report.reporter_user_id}
                </div>
              </div>

              {report.details ? (
                <div style={{ color: '#3c434a', whiteSpace: 'pre-wrap' }}>{report.details}</div>
              ) : null}

              <div style={{ display: 'grid', gridTemplateColumns: '180px minmax(260px, 1fr) 100px', gap: 10 }}>
                <select
                  value={report.status}
                  onChange={(event) => updateReportLocal(report.id, 'status', event.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="actioned">Actioned</option>
                </select>
                <input
                  value={report.admin_note || ''}
                  onChange={(event) => updateReportLocal(report.id, 'admin_note', event.target.value)}
                  placeholder="Internal moderation note"
                />
                <button
                  type="button"
                  disabled={savingReport === String(report.id)}
                  onClick={() => saveReport(report)}
                >
                  {savingReport === String(report.id) ? 'Saving...' : 'Save'}
                </button>
              </div>

              {report.website_slug && report.post_slug ? (
                <a
                  href={`/${report.website_slug}/post/${report.post_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#2271b1', fontWeight: 700 }}
                >
                  Open story
                </a>
              ) : null}
            </article>
          ))}

          {!reports.length && !error ? (
            <div style={{ color: '#646970' }}>No Reader story reports yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}