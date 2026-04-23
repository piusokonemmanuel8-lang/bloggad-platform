import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

function cardStyle() {
  return {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 20,
    padding: 20,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  };
}

function labelStyle() {
  return {
    display: 'block',
    fontSize: 13,
    fontWeight: 800,
    color: '#374151',
    marginBottom: 8,
  };
}

function selectStyle() {
  return {
    width: '100%',
    minHeight: 46,
    borderRadius: 14,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    padding: '0 14px',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
  };
}

function inputStyle() {
  return {
    width: '100%',
    minHeight: 46,
    borderRadius: 14,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    padding: '0 14px',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
  };
}

function badgeStyle(type = 'default') {
  const map = {
    success: { background: '#ecfdf3', color: '#027a48', border: '#abefc6' },
    warning: { background: '#fffaeb', color: '#b54708', border: '#fedf89' },
    info: { background: '#eff8ff', color: '#175cd3', border: '#b2ddff' },
    default: { background: '#f9fafb', color: '#344054', border: '#eaecf0' },
  };

  const selected = map[type] || map.default;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30,
    padding: '0 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: `1px solid ${selected.border}`,
    background: selected.background,
    color: selected.color,
    whiteSpace: 'nowrap',
  };
}

function toggleRow(label, value, onChange, helper = '') {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 18,
        padding: '16px 0',
        borderBottom: '1px solid #eef2f7',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>{label}</div>
        {helper ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 1.5,
              color: '#6b7280',
            }}
          >
            {helper}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onChange(value ? 0 : 1)}
        style={{
          width: 58,
          height: 32,
          borderRadius: 999,
          border: 0,
          background: value ? '#2563eb' : '#d1d5db',
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.2s ease',
          marginTop: 2,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 4,
            left: value ? 30 : 4,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}

const initialForm = {
  monetization_mode: 'individual',
  selected_template: 'current-template',
  storefront_top_enabled: 1,
  storefront_sidebar_enabled: 0,
  storefront_bottom_enabled: 1,
  post_top_enabled: 1,
  post_middle_enabled: 1,
  post_bottom_enabled: 1,
  post_sidebar_enabled: 0,
  post_middle_insert_after: '2',
};

function normalizePlacementSettings(settings = {}) {
  return {
    ...initialForm,
    monetization_mode: settings?.monetization_mode === 'platform' ? 'platform' : 'individual',
    selected_template: settings?.selected_template || 'current-template',
    storefront_top_enabled: Number(settings?.storefront_top_enabled ?? 1),
    storefront_sidebar_enabled: Number(settings?.storefront_sidebar_enabled ?? 0),
    storefront_bottom_enabled: Number(settings?.storefront_bottom_enabled ?? 1),
    post_top_enabled: Number(settings?.post_top_enabled ?? 1),
    post_middle_enabled: Number(settings?.post_middle_enabled ?? 1),
    post_bottom_enabled: Number(settings?.post_bottom_enabled ?? 1),
    post_sidebar_enabled: Number(settings?.post_sidebar_enabled ?? 0),
    post_middle_insert_after: String(settings?.post_middle_insert_after ?? '2'),
  };
}

function buildPayload(form) {
  return {
    monetization_mode: form.monetization_mode,
    storefront_top_enabled: Number(form.storefront_top_enabled),
    storefront_sidebar_enabled: Number(form.storefront_sidebar_enabled),
    storefront_bottom_enabled: Number(form.storefront_bottom_enabled),
    post_top_enabled: Number(form.post_top_enabled),
    post_middle_enabled: Number(form.post_middle_enabled),
    post_bottom_enabled: Number(form.post_bottom_enabled),
    post_sidebar_enabled: Number(form.post_sidebar_enabled),
  };
}

function previewBlock(background, color, text) {
  return {
    minHeight: 58,
    borderRadius: 14,
    background,
    color,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 900,
    padding: 12,
    textAlign: 'center',
  };
}

export default function AffiliateAdPlacementPage() {
  const [form, setForm] = useState(initialForm);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const placementGroups = useMemo(
    () => [
      {
        title: 'Storefront placements',
        items: [
          {
            key: 'storefront_top_enabled',
            label: 'Storefront top slot',
            helper: 'Shows near the top section of the storefront homepage.',
          },
          {
            key: 'storefront_sidebar_enabled',
            label: 'Storefront sidebar slot',
            helper: 'Shows in the storefront sidebar when the chosen template supports it.',
          },
          {
            key: 'storefront_bottom_enabled',
            label: 'Storefront bottom slot',
            helper: 'Shows near the lower section of the storefront homepage.',
          },
        ],
      },
      {
        title: 'Post detail placements',
        items: [
          {
            key: 'post_top_enabled',
            label: 'Post top slot',
            helper: 'Shows below post title or opening content area.',
          },
          {
            key: 'post_middle_enabled',
            label: 'Post middle slot',
            helper: 'Shows inside article content after a chosen paragraph.',
          },
          {
            key: 'post_bottom_enabled',
            label: 'Post bottom slot',
            helper: 'Shows after the article body ends.',
          },
          {
            key: 'post_sidebar_enabled',
            label: 'Post sidebar slot',
            helper: 'Shows in sidebar when the selected template has a sidebar layout.',
          },
        ],
      },
    ],
    []
  );

  useEffect(() => {
    let ignore = false;

    async function loadSettings() {
      setLoading(true);
      setLoadError('');

      try {
        const { data } = await api.get('/api/affiliate/dashboard/monetization/settings');

        if (!data?.ok) {
          throw new Error(data?.message || 'Failed to load your saved ad placement settings.');
        }

        if (!ignore) {
          setForm(normalizePlacementSettings(data.settings || {}));
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(
            error?.response?.data?.message ||
              error.message ||
              'Failed to load your saved ad placement settings.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      ignore = true;
    };
  }, []);

  function updateField(field, value) {
    setSaveMessage('');
    setSaveError('');
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      const { data } = await api.put(
        '/api/affiliate/dashboard/monetization/settings',
        buildPayload(form)
      );

      if (!data?.ok) {
        throw new Error(data?.message || 'Failed to save your ad placement settings.');
      }

      setForm((prev) => normalizePlacementSettings({ ...data.settings, selected_template: prev.selected_template, post_middle_insert_after: prev.post_middle_insert_after }));
      setSaveMessage('Your ad placement settings have been saved.');
    } catch (error) {
      setSaveError(
        error?.response?.data?.message ||
          error.message ||
          'Failed to save your ad placement settings.'
      );
    } finally {
      setSaving(false);
    }
  }

  const isPlatformMode = form.monetization_mode === 'platform';

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section
        style={{
          ...cardStyle(),
          background:
            'linear-gradient(135deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 55%, rgba(55,65,81,1) 100%)',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
            gap: 18,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 32,
                padding: '0 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 14,
              }}
            >
              Ad Placement
            </div>

            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, fontWeight: 900 }}>
              Choose exactly where ads should appear on storefront and post pages
            </h1>

            <p
              style={{
                margin: '12px 0 0',
                maxWidth: 760,
                color: 'rgba(255,255,255,0.82)',
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              Manage the positions where your ads should display across your storefront and blog post
              pages. Your saved choices will be used for the monetization mode you select.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Current Mode
              </div>
              <div style={badgeStyle(isPlatformMode ? 'info' : 'success')}>
                {isPlatformMode ? 'Platform Monetization' : 'Individual Monetization'}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                Save Status
              </div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                {saving ? 'Saving...' : 'Ready'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {loadError ? (
        <section style={cardStyle()}>
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: '#fef3f2',
              border: '1px solid #fecdca',
              color: '#b42318',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {loadError}
          </div>
        </section>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <form onSubmit={handleSave} style={{ display: 'grid', gap: 24 }}>
          <div style={cardStyle()}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
                Placement Controls
              </h2>
              <p
                style={{
                  margin: '8px 0 0',
                  color: '#6b7280',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Turn ad positions on or off based on where you want ads to appear in your selected
                layout.
              </p>
            </div>

            {loading ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: '#f9fafb',
                  border: '1px solid #eef2f7',
                  color: '#6b7280',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Loading your saved ad placement settings...
              </div>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div>
                <label style={labelStyle()}>Monetization mode</label>
                <select
                  style={selectStyle()}
                  value={form.monetization_mode}
                  onChange={(e) => updateField('monetization_mode', e.target.value)}
                >
                  <option value="individual">Individual monetization</option>
                  <option value="platform">Platform monetization</option>
                </select>
              </div>

              <div>
                <label style={labelStyle()}>Selected template</label>
                <select
                  style={selectStyle()}
                  value={form.selected_template}
                  onChange={(e) => updateField('selected_template', e.target.value)}
                >
                  <option value="current-template">Current active template</option>
                  <option value="minimal-template">Minimal template</option>
                  <option value="electronics-template">Electronics template</option>
                </select>
              </div>

              <div>
                <label style={labelStyle()}>Post middle insert after paragraph</label>
                <input
                  style={inputStyle()}
                  value={form.post_middle_insert_after}
                  onChange={(e) => updateField('post_middle_insert_after', e.target.value)}
                  placeholder="2"
                />
              </div>
            </div>

            {placementGroups.map((group) => (
              <div key={group.title} style={{ marginTop: 10 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#111827',
                    marginBottom: 6,
                  }}
                >
                  {group.title}
                </div>

                <div style={{ display: 'grid', gap: 0 }}>
                  {group.items.map((item, index) => {
                    const content = toggleRow(
                      item.label,
                      Number(form[item.key]),
                      (value) => updateField(item.key, value),
                      item.helper
                    );

                    if (index === group.items.length - 1) {
                      return (
                        <div key={item.key} style={{ borderBottom: '1px solid #eef2f7' }}>
                          {content}
                        </div>
                      );
                    }

                    return <div key={item.key}>{content}</div>;
                  })}
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  minWidth: 170,
                  height: 46,
                  borderRadius: 14,
                  border: 0,
                  background: saving ? '#93c5fd' : '#111827',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Placement'}
              </button>

              {saveMessage ? (
                <div style={{ fontSize: 14, color: '#027a48', fontWeight: 800 }}>
                  {saveMessage}
                </div>
              ) : null}

              {saveError ? (
                <div style={{ fontSize: 14, color: '#b42318', fontWeight: 800 }}>
                  {saveError}
                </div>
              ) : null}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#111827' }}>
                Slot Rules
              </h2>
              <p
                style={{
                  margin: '8px 0 0',
                  color: '#6b7280',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                These rules help the layout know where and when ads should render.
              </p>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                'Storefront slots should appear only on storefront pages.',
                'Post slots should appear only on detailed blog post pages.',
                'Post middle slot should use the chosen paragraph insertion point when supported.',
                'If your selected layout has no sidebar, sidebar ad positions will not display.',
                'Your saved settings decide which approved ads should show in each slot.',
              ].map((text) => (
                <div
                  key={text}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: '#f9fafb',
                    border: '1px solid #eef2f7',
                    color: '#374151',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </form>

        <div style={{ display: 'grid', gap: 24 }}>
          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Placement Preview Guide
            </h3>

            <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
              <div
                style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: 18,
                  padding: 16,
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: 900, color: '#111827', marginBottom: 10 }}>
                  Storefront page
                </div>
                <div style={previewBlock('#111827', '#ffffff', 'Storefront Top Slot')} />
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 220px',
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  <div style={previewBlock('#e5e7eb', '#111827', 'Main Storefront Content')} />
                  <div style={previewBlock('#dbeafe', '#1d4ed8', 'Storefront Sidebar Slot')} />
                </div>
                <div
                  style={{
                    ...previewBlock('#ede9fe', '#6d28d9', 'Storefront Bottom Slot'),
                    marginTop: 12,
                  }}
                />
              </div>

              <div
                style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: 18,
                  padding: 16,
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: 900, color: '#111827', marginBottom: 10 }}>
                  Post detail page
                </div>
                <div style={previewBlock('#111827', '#ffffff', 'Post Top Slot')} />
                <div
                  style={{
                    ...previewBlock('#e5e7eb', '#111827', 'Article Content'),
                    marginTop: 12,
                  }}
                />
                <div
                  style={{
                    ...previewBlock('#dbeafe', '#1d4ed8', 'Post Middle Slot'),
                    marginTop: 12,
                  }}
                />
                <div
                  style={{
                    ...previewBlock('#e5e7eb', '#111827', 'Article Content Continues'),
                    marginTop: 12,
                  }}
                />
                <div
                  style={{
                    ...previewBlock('#ede9fe', '#6d28d9', 'Post Bottom Slot'),
                    marginTop: 12,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111827' }}>
              Important Note
            </h3>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 16,
                background: '#eff8ff',
                border: '1px solid #b2ddff',
                color: '#175cd3',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              Ads will display only in positions supported by your current template. Some placements,
              like sidebar ads, may not appear if that layout is not available. If you use your own
              ad account, your provider pays you directly.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}