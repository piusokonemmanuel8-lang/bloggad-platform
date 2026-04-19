import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

export default function AffiliateChooseTemplatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product_id') || '';

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/admin/templates/blog');
        setTemplates(data?.templates || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

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
      <div className="page-shell">
        <div className="container section-space">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Choose Blog Template</h1>
          <p className="page-subtitle">
            Select the template you want to use for this product post.
          </p>
        </div>

        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="grid-3">
          {templates.length ? (
            templates.map((template) => {
              const active = String(selectedTemplateId) === String(template.id);

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(String(template.id))}
                  className="surface-card surface-card-padding"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: active
                      ? '1px solid rgba(122, 92, 255, 0.9)'
                      : '1px solid rgba(255,255,255,0.08)',
                    background: active
                      ? 'rgba(122, 92, 255, 0.12)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                >
                  {template.preview_image ? (
                    <img
                      src={template.preview_image}
                      alt={template.name}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontSize: '1.08rem', fontWeight: 700 }}>{template.name}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      {template.description || 'No description'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Premium: {template.is_premium ? 'Yes' : 'No'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {template.status}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="surface-card surface-card-padding">No templates found.</div>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-primary" type="button" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}