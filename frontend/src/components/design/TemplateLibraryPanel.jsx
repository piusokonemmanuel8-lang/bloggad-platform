import { LayoutTemplate, Eye, ChevronRight, CheckCircle2, Crown } from 'lucide-react';

function getTemplateCardClass(currentId, templateId) {
  return String(currentId) === String(templateId)
    ? 'affiliate-design-template-card active'
    : 'affiliate-design-template-card';
}

export default function TemplateLibraryPanel({
  templates,
  currentTemplateId,
  selectedBuilderId,
  onSelectTemplate,
  onOpenBuilder,
}) {
  return (
    <div className="affiliate-design-template-list">
      {templates.map((template) => {
        const isSelected = String(currentTemplateId) === String(template.id);
        const isOpen = String(selectedBuilderId) === String(template.id);

        return (
          <div
            key={template.id}
            className={getTemplateCardClass(currentTemplateId, template.id)}
          >
            <button
              type="button"
              className="affiliate-design-template-mainbtn"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="affiliate-design-template-preview">
                {template.preview_image ? (
                  <img
                    src={template.preview_image}
                    alt={template.name}
                    className="affiliate-design-template-image"
                  />
                ) : (
                  <div className="affiliate-design-template-image-empty">
                    <LayoutTemplate size={24} />
                    <span>No preview</span>
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      minHeight: 28,
                      padding: '0 12px',
                      borderRadius: 999,
                      background: template.is_premium ? '#111827' : '#ffffff',
                      color: template.is_premium ? '#ffffff' : '#111827',
                      border: template.is_premium ? 'none' : '1px solid #dbe1ea',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {template.is_premium ? <Crown size={12} /> : <LayoutTemplate size={12} />}
                    {template.is_premium ? 'Premium' : 'Standard'}
                  </span>

                  {isSelected ? (
                    <span
                      style={{
                        minHeight: 28,
                        padding: '0 12px',
                        borderRadius: 999,
                        background: '#ecfdf3',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Selected
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="affiliate-design-template-body">
                <h3>{template.name}</h3>
                <p>{template.description || 'No description'}</p>

                <div className="affiliate-design-template-meta">
                  <span>{template.template_code_key || 'no_code_key'}</span>
                  <span>{template.status || 'active'}</span>
                  {isOpen ? <span>Builder Open</span> : null}
                </div>
              </div>
            </button>

            <div className="affiliate-design-template-actions-inline">
              <button
                type="button"
                className="affiliate-design-btn secondary slim"
                onClick={() => onSelectTemplate(template)}
              >
                <Eye size={15} />
                {isSelected ? 'Selected' : 'Select'}
              </button>

              <button
                type="button"
                className="affiliate-design-btn primary slim"
                onClick={() => onOpenBuilder(template)}
              >
                <ChevronRight size={15} />
                {isOpen ? 'Builder Open' : 'Open Builder'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}