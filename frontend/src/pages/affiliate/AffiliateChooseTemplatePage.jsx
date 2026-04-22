import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutTemplate,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/axios';

function getStatusClass(status = '') {
  const value = String(status).toLowerCase();

  if (value === 'active' || value === 'published') return 'affiliate-choose-template-status active';
  if (value === 'inactive') return 'affiliate-choose-template-status inactive';
  if (value === 'draft' || value === 'pending') return 'affiliate-choose-template-status draft';

  return 'affiliate-choose-template-status neutral';
}

async function fetchAffiliateBlogTemplates() {
  const { data } = await api.get('/api/affiliate/templates/blog');
  return data?.templates || [];
}

export default function AffiliateChooseTemplatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product_id') || '';

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchTemplates = async (isRefresh = false) => {
    try {
      setError('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const rows = await fetchAffiliateBlogTemplates();
      const activeRows = rows.filter(
        (item) => String(item?.status || '').toLowerCase() === 'active'
      );

      setTemplates(activeRows);

      if (!selectedTemplateId && activeRows.length) {
        setSelectedTemplateId(String(activeRows[0].id));
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to load affiliate blog templates'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const selectedTemplate = useMemo(() => {
    return templates.find((item) => String(item.id) === String(selectedTemplateId)) || null;
  }, [templates, selectedTemplateId]);

  const handleContinue = () => {
    if (!selectedTemplateId) {
      setError('Please choose a template');
      return;
    }

    const query = new URLSearchParams();

    if (productId) {
      query.set('product_id', productId);
    }

    query.set('template_id', selectedTemplateId);

    navigate(`/affiliate/posts/create?${query.toString()}`);
  };

  if (loading) {
    return (
      <div className="affiliate-choose-template-page">
        <style>{styles}</style>

        <div className="affiliate-choose-template-loading-wrap">
          <div className="affiliate-choose-template-loading-card">
            <div className="affiliate-choose-template-spinner" />
            <p>Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-choose-template-page">
      <style>{styles}</style>

      <section className="affiliate-choose-template-hero">
        <div className="affiliate-choose-template-hero-copy">
          <div className="affiliate-choose-template-badge">Blog templates</div>
          <h1 className="affiliate-choose-template-title">Choose Blog Template</h1>
          <p className="affiliate-choose-template-subtitle">
            Select the template you want to use for this product post before creating the content.
          </p>
        </div>

        <div className="affiliate-choose-template-hero-actions">
          <button
            type="button"
            className="affiliate-choose-template-btn secondary"
            onClick={() => fetchTemplates(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            className="affiliate-choose-template-btn primary"
            type="button"
            onClick={handleContinue}
            disabled={!selectedTemplateId}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {error ? (
        <div className="affiliate-choose-template-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="affiliate-choose-template-grid-shell">
        <div className="affiliate-choose-template-grid">
          {templates.length ? (
            templates.map((template) => {
              const active = String(selectedTemplateId) === String(template.id);

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(String(template.id))}
                  className={`affiliate-choose-template-card${active ? ' active' : ''}`}
                >
                  <div className="affiliate-choose-template-image-wrap">
                    {template.preview_image ? (
                      <img
                        src={template.preview_image}
                        alt={template.name}
                        className="affiliate-choose-template-image"
                      />
                    ) : (
                      <div className="affiliate-choose-template-image-placeholder">
                        <LayoutTemplate size={28} />
                        <span>No preview</span>
                      </div>
                    )}

                    {active ? (
                      <div className="affiliate-choose-template-selected-badge">
                        <CheckCircle2 size={16} />
                        Selected
                      </div>
                    ) : null}
                  </div>

                  <div className="affiliate-choose-template-card-body">
                    <div className="affiliate-choose-template-card-top">
                      <h3 className="affiliate-choose-template-card-title">{template.name}</h3>

                      <div className="affiliate-choose-template-card-tags">
                        <span className={getStatusClass(template.status)}>
                          {template.status || 'draft'}
                        </span>

                        <span className="affiliate-choose-template-premium-pill">
                          {template.is_premium ? (
                            <>
                              <Crown size={13} />
                              Premium
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={13} />
                              Standard
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="affiliate-choose-template-card-text">
                      {template.description || 'No description'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="affiliate-choose-template-empty">
              <LayoutTemplate size={32} />
              <h3>No templates found</h3>
              <p>There are no active blog templates available for your current plan right now.</p>
            </div>
          )}
        </div>

        {selectedTemplate ? (
          <aside className="affiliate-choose-template-side-panel">
            <p className="affiliate-choose-template-side-kicker">Selected template</p>
            <h2 className="affiliate-choose-template-side-title">{selectedTemplate.name}</h2>
            <p className="affiliate-choose-template-side-text">
              {selectedTemplate.description || 'No description'}
            </p>

            <div className="affiliate-choose-template-side-list">
              <div className="affiliate-choose-template-side-row">
                <span>Status</span>
                <strong>{selectedTemplate.status || '-'}</strong>
              </div>

              <div className="affiliate-choose-template-side-row">
                <span>Premium</span>
                <strong>{selectedTemplate.is_premium ? 'Yes' : 'No'}</strong>
              </div>

              <div className="affiliate-choose-template-side-row">
                <span>Template ID</span>
                <strong>{selectedTemplate.id}</strong>
              </div>

              <div className="affiliate-choose-template-side-row">
                <span>Product link</span>
                <strong>{productId || '-'}</strong>
              </div>
            </div>

            <button
              className="affiliate-choose-template-btn primary full"
              type="button"
              onClick={handleContinue}
            >
              Use This Template
              <ArrowRight size={16} />
            </button>
          </aside>
        ) : null}
      </section>
    </div>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .affiliate-choose-template-page {
    width: 100%;
  }

  .affiliate-choose-template-loading-wrap {
    min-height: 60vh;
    display: grid;
    place-items: center;
  }

  .affiliate-choose-template-loading-card {
    min-width: 260px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 28px 22px;
    text-align: center;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  }

  .affiliate-choose-template-spinner {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: #111827;
    margin: 0 auto 12px;
    animation: affiliateChooseTemplateSpin 0.8s linear infinite;
  }

  @keyframes affiliateChooseTemplateSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: affiliateChooseTemplateSpin 0.8s linear infinite;
  }

  .affiliate-choose-template-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid #e5e7eb;
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
    margin-bottom: 20px;
  }

  .affiliate-choose-template-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .affiliate-choose-template-title {
    margin: 0;
    font-size: 30px;
    line-height: 1.1;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-choose-template-subtitle {
    margin: 12px 0 0;
    max-width: 760px;
    color: #6b7280;
    font-size: 15px;
    line-height: 1.7;
  }

  .affiliate-choose-template-hero-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .affiliate-choose-template-btn {
    height: 46px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #ffffff;
    color: #111827;
    font-size: 14px;
    font-weight: 800;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .affiliate-choose-template-btn.primary {
    background: #111827;
    color: #ffffff;
    border-color: #111827;
  }

  .affiliate-choose-template-btn.full {
    width: 100%;
  }

  .affiliate-choose-template-grid-shell {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) 340px;
    gap: 20px;
  }

  .affiliate-choose-template-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .affiliate-choose-template-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
    padding: 0;
    color: inherit;
  }

  .affiliate-choose-template-card.active {
    border-color: #111827;
    transform: translateY(-1px);
    box-shadow: 0 22px 45px rgba(15, 23, 42, 0.08);
  }

  .affiliate-choose-template-image-wrap {
    position: relative;
    width: 100%;
    height: 240px;
    background: #f8fafc;
    border-bottom: 1px solid #eef2f7;
  }

  .affiliate-choose-template-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .affiliate-choose-template-image-placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    color: #6b7280;
    gap: 8px;
    text-align: center;
  }

  .affiliate-choose-template-selected-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
  }

  .affiliate-choose-template-card-body {
    padding: 18px;
  }

  .affiliate-choose-template-card-top {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
  }

  .affiliate-choose-template-card-title {
    margin: 0;
    font-size: 19px;
    line-height: 1.3;
    font-weight: 900;
    color: #111827;
  }

  .affiliate-choose-template-card-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .affiliate-choose-template-status,
  .affiliate-choose-template-premium-pill {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    text-transform: capitalize;
    border: 1px solid transparent;
    gap: 6px;
  }

  .affiliate-choose-template-status.active {
    background: #ecfdf3;
    color: #027a48;
    border-color: #abefc6;
  }

  .affiliate-choose-template-status.inactive {
    background: #fff7ed;
    color: #b54708;
    border-color: #fed7aa;
  }

  .affiliate-choose-template-status.draft {
    background: #f8fafc;
    color: #475467;
    border-color: #e4e7ec;
  }

  .affiliate-choose-template-status.neutral {
    background: #eef2f7;
    color: #344054;
    border-color: #dbe2ea;
  }

  .affiliate-choose-template-premium-pill {
    background: #f8fafc;
    color: #111827;
    border-color: #e5e7eb;
  }

  .affiliate-choose-template-card-text {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.7;
  }

  .affiliate-choose-template-side-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 35px rgba(15, 23, 42, 0.04);
    height: fit-content;
    position: sticky;
    top: 94px;
  }

  .affiliate-choose-template-side-kicker {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 800;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .affiliate-choose-template-side-title {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
  }

  .affiliate-choose-template-side-text {
    margin: 12px 0 18px;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.7;
  }

  .affiliate-choose-template-side-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 18px;
  }

  .affiliate-choose-template-side-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 16px;
    font-size: 14px;
  }

  .affiliate-choose-template-side-row span {
    color: #6b7280;
    font-weight: 700;
  }

  .affiliate-choose-template-side-row strong {
    color: #111827;
    font-weight: 900;
    text-align: right;
  }

  .affiliate-choose-template-alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
  }

  .affiliate-choose-template-alert.error {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
  }

  .affiliate-choose-template-empty {
    min-height: 320px;
    border: 1px dashed #dbe2ea;
    background: #ffffff;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 24px;
    grid-column: 1 / -1;
  }

  .affiliate-choose-template-empty h3 {
    margin: 0;
    color: #111827;
    font-weight: 900;
  }

  .affiliate-choose-template-empty p {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
  }

  @media (max-width: 1200px) {
    .affiliate-choose-template-grid-shell {
      grid-template-columns: 1fr;
    }

    .affiliate-choose-template-side-panel {
      position: static;
    }
  }

  @media (max-width: 991px) {
    .affiliate-choose-template-hero {
      flex-direction: column;
      padding: 20px;
    }

    .affiliate-choose-template-title {
      font-size: 26px;
    }

    .affiliate-choose-template-grid {
      grid-template-columns: 1fr;
    }

    .affiliate-choose-template-hero-actions {
      width: 100%;
    }
  }

  @media (max-width: 767px) {
    .affiliate-choose-template-title {
      font-size: 22px;
    }

    .affiliate-choose-template-subtitle {
      font-size: 14px;
    }

    .affiliate-choose-template-hero-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .affiliate-choose-template-btn {
      width: 100%;
    }

    .affiliate-choose-template-image-wrap {
      height: 220px;
    }

    .affiliate-choose-template-side-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;