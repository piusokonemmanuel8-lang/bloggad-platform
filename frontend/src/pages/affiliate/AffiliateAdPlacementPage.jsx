import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const writerRouteMode = location.pathname === '/writer/monetization/ad-placement';
  const [form, setForm] = useState(initialForm);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState('storefront');

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
  const activePlacementCount = [
    form.storefront_top_enabled,
    form.storefront_sidebar_enabled,
    form.storefront_bottom_enabled,
    form.post_top_enabled,
    form.post_middle_enabled,
    form.post_bottom_enabled,
    form.post_sidebar_enabled,
  ].filter((value) => Number(value) === 1).length;
  const templateLabel =
    {
      'current-template': 'Current active template',
      'minimal-template': 'Minimal template',
      'electronics-template': 'Electronics template',
    }[form.selected_template] || 'Current active template';

  if (writerRouteMode) {
    return (
      <form className="writer-ad-placement-page" onSubmit={handleSave}>
        <style>{String.raw`
          .writer-ad-placement-page,
          .writer-ad-placement-page * { box-sizing: border-box; }
          .writer-ad-placement-page {
            width: 100%;
            color: #1d2025;
            font-family: inherit;
          }
          .writer-ad-placement-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 16px;
          }
          .writer-ad-placement-eyebrow {
            margin: 0 0 6px;
            color: #8a929d;
            font-size: 11px;
            line-height: 1.2;
            font-weight: 800;
            letter-spacing: .06em;
            text-transform: uppercase;
          }
          .writer-ad-placement-head h2 {
            margin: 0;
            color: #1d2025;
            font-size: 24px;
            line-height: 1.2;
            font-weight: 800;
          }
          .writer-ad-placement-subtitle {
            max-width: 760px;
            margin: 6px 0 0;
            color: #6f7782;
            font-size: 14px;
            line-height: 1.5;
          }
          .writer-ad-placement-save {
            min-width: 152px;
            height: 40px;
            padding: 0 18px;
            border: 0;
            border-radius: 8px;
            background: #1c1f24;
            color: #fff;
            font: inherit;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
          }
          .writer-ad-placement-save:disabled { opacity: .55; cursor: not-allowed; }
          .writer-ad-placement-feedback {
            margin: 6px 0 0;
            font-size: 13px;
            line-height: 1.4;
            font-weight: 600;
          }
          .writer-ad-placement-feedback.ok { color: #237447; }
          .writer-ad-placement-feedback.error { color: #b42318; }
          .writer-ad-placement-alert {
            margin-bottom: 14px;
            padding: 12px 14px;
            border: 1px solid #f0c7c2;
            border-radius: 8px;
            background: #fff4f2;
            color: #a3362b;
            font-size: 13px;
            line-height: 1.45;
            font-weight: 600;
          }
          .writer-ad-placement-stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
          }
          .writer-ad-placement-stat,
          .writer-ad-placement-card {
            border: 1px solid #dfe3e6;
            background: #fff;
            border-radius: 10px;
          }
          .writer-ad-placement-stat { min-height: 78px; padding: 14px; }
          .writer-ad-placement-stat span {
            display: block;
            color: #737c87;
            font-size: 12px;
            line-height: 1.3;
            font-weight: 600;
          }
          .writer-ad-placement-stat strong {
            display: block;
            margin-top: 4px;
            color: #1d2025;
            font-size: 18px;
            line-height: 1.25;
            font-weight: 800;
          }
          .writer-ad-placement-stat small {
            display: block;
            margin-top: 2px;
            color: #89919b;
            font-size: 12px;
            line-height: 1.35;
          }
          .writer-ad-placement-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.62fr) minmax(340px, .9fr);
            gap: 16px;
            align-items: start;
          }
          .writer-ad-placement-left,
          .writer-ad-placement-right { display: grid; gap: 16px; min-width: 0; }
          .writer-ad-placement-right { position: sticky; top: 86px; }
          .writer-ad-placement-card { padding: 16px; }
          .writer-ad-placement-card h3 {
            margin: 0;
            color: #1d2025;
            font-size: 17px;
            line-height: 1.3;
            font-weight: 800;
          }
          .writer-ad-placement-card-copy {
            margin: 5px 0 0;
            color: #727b86;
            font-size: 13px;
            line-height: 1.45;
          }
          .writer-ad-placement-setup-grid {
            display: grid;
            grid-template-columns: 1fr 1.2fr 1fr;
            gap: 12px;
            margin-top: 16px;
          }
          .writer-ad-placement-field label {
            display: block;
            margin: 0 0 7px;
            color: #606975;
            font-size: 12px;
            line-height: 1.3;
            font-weight: 600;
          }
          .writer-ad-placement-field select,
          .writer-ad-placement-field input {
            width: 100%;
            height: 42px;
            padding: 0 12px;
            border: 1px solid #d8dde2;
            border-radius: 8px;
            background: #fff;
            color: #1d2025;
            font: inherit;
            font-size: 13px;
            outline: none;
          }
          .writer-ad-placement-field select:focus,
          .writer-ad-placement-field input:focus { border-color: #89919b; }
          .writer-ad-placement-group-head { margin-bottom: 12px; }
          .writer-ad-placement-toggle-list { display: grid; gap: 7px; }
          .writer-ad-placement-toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            min-height: 66px;
            padding: 10px 12px;
            border: 1px solid #dfe3e6;
            border-radius: 8px;
            background: #fff;
          }
          .writer-ad-placement-toggle-copy { min-width: 0; }
          .writer-ad-placement-toggle-copy strong {
            display: block;
            color: #1d2025;
            font-size: 14px;
            line-height: 1.35;
            font-weight: 700;
          }
          .writer-ad-placement-toggle-copy span {
            display: block;
            margin-top: 3px;
            color: #737c87;
            font-size: 12px;
            line-height: 1.4;
          }
          .writer-ad-placement-switch {
            position: relative;
            width: 42px;
            height: 24px;
            flex: 0 0 42px;
            padding: 0;
            border: 0;
            border-radius: 999px;
            background: #d6dce2;
            cursor: pointer;
          }
          .writer-ad-placement-switch::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 1px 2px rgba(0,0,0,.16);
            transition: left .15s ease;
          }
          .writer-ad-placement-switch.on { background: #1c1f24; }
          .writer-ad-placement-switch.on::after { left: 21px; }
          .writer-ad-placement-preview-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
          }
          .writer-ad-placement-preview-tab {
            height: 34px;
            border: 1px solid #dfe3e6;
            border-radius: 7px;
            background: #fff;
            color: #1d2025;
            font: inherit;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }
          .writer-ad-placement-preview-tab.active {
            border-color: #1c1f24;
            background: #1c1f24;
            color: #fff;
          }
          .writer-ad-placement-preview-canvas { margin-top: 14px; }
          .writer-ad-placement-preview-label {
            margin-bottom: 8px;
            color: #8a929d;
            font-size: 11px;
            line-height: 1.3;
            font-weight: 800;
            text-transform: uppercase;
          }
          .writer-ad-placement-preview-slot {
            display: grid;
            place-items: center;
            min-height: 54px;
            padding: 10px;
            border-radius: 7px;
            background: #1c1f24;
            color: #fff;
            text-align: center;
            font-size: 12px;
            line-height: 1.35;
            font-weight: 600;
          }
          .writer-ad-placement-preview-slot.soft {
            border: 1px solid #dfe3e6;
            background: #edf4fc;
            color: #265c9e;
          }
          .writer-ad-placement-preview-slot.off {
            border: 1px solid #dfe3e6;
            background: #fff;
            color: #9aa2ac;
          }
          .writer-ad-placement-preview-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 94px;
            gap: 9px;
            margin-top: 9px;
          }
          .writer-ad-placement-preview-stack { display: grid; gap: 9px; }
          .writer-ad-placement-rule-list {
            display: grid;
            gap: 10px;
            margin: 14px 0 0;
            padding: 0;
            list-style: none;
          }
          .writer-ad-placement-rule-list li {
            position: relative;
            padding-left: 18px;
            color: #3f4751;
            font-size: 12px;
            line-height: 1.45;
          }
          .writer-ad-placement-rule-list li::before {
            content: '';
            position: absolute;
            top: 7px;
            left: 0;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #a5adb6;
          }
          .writer-ad-placement-rule-list li:first-child::before { background: #1c1f24; }
          .writer-ad-placement-loading {
            margin-top: 12px;
            color: #68717d;
            font-size: 13px;
            font-weight: 600;
          }
          @media (max-width: 1180px) {
            .writer-ad-placement-grid { grid-template-columns: minmax(0, 1.35fr) minmax(310px, .9fr); }
            .writer-ad-placement-setup-grid { grid-template-columns: 1fr 1fr; }
            .writer-ad-placement-field:first-child { grid-column: 1 / -1; }
          }
          @media (max-width: 991px) {
            .writer-ad-placement-page {
              width: calc(100% + 18px);
              margin-left: -9px;
              margin-right: -9px;
            }
            .writer-ad-placement-head { gap: 12px; margin-bottom: 14px; }
            .writer-ad-placement-eyebrow { display: none; }
            .writer-ad-placement-head h2 { font-size: 20px; }
            .writer-ad-placement-subtitle { margin-top: 5px; font-size: 12px; line-height: 1.4; }
            .writer-ad-placement-save { min-width: 68px; height: 38px; padding: 0 14px; font-size: 13px; }
            .writer-ad-placement-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
            .writer-ad-placement-stat { min-height: 82px; padding: 12px; }
            .writer-ad-placement-stat.template { display: none; }
            .writer-ad-placement-stat span { font-size: 12px; }
            .writer-ad-placement-stat strong { font-size: 18px; }
            .writer-ad-placement-stat small { font-size: 12px; }
            .writer-ad-placement-grid { display: block; }
            .writer-ad-placement-left,
            .writer-ad-placement-right { gap: 12px; }
            .writer-ad-placement-right { position: static; margin-top: 12px; }
            .writer-ad-placement-card { padding: 12px; border-radius: 9px; }
            .writer-ad-placement-card h3 { font-size: 16px; }
            .writer-ad-placement-card-copy { font-size: 12px; line-height: 1.45; }
            .writer-ad-placement-setup-grid { grid-template-columns: 1fr 110px; gap: 9px; margin-top: 14px; }
            .writer-ad-placement-field:first-child { grid-column: 1 / -1; }
            .writer-ad-placement-field label { font-size: 12px; }
            .writer-ad-placement-field select,
            .writer-ad-placement-field input { height: 42px; font-size: 13px; }
            .writer-ad-placement-toggle-list { gap: 7px; }
            .writer-ad-placement-toggle-row { min-height: 68px; padding: 10px 12px; }
            .writer-ad-placement-toggle-copy strong { font-size: 14px; }
            .writer-ad-placement-toggle-copy span { font-size: 12px; }
            .writer-ad-placement-preview-row { grid-template-columns: minmax(0, 1fr) 94px; }
            .writer-ad-placement-rule-list li { font-size: 12px; }
          }
          @media (max-width: 420px) {
            .writer-ad-placement-page { width: calc(100% + 18px); }
            .writer-ad-placement-head h2 { font-size: 19px; }
            .writer-ad-placement-subtitle { max-width: 235px; }
          }
        `}</style>

        <div className="writer-ad-placement-head">
          <div>
            <p className="writer-ad-placement-eyebrow">Monetization</p>
            <h2>Ad placement</h2>
            <p className="writer-ad-placement-subtitle">
              Choose where ads can appear across your storefront and post pages. Changes are saved to your current monetization settings.
            </p>
            {saveMessage ? <p className="writer-ad-placement-feedback ok">{saveMessage}</p> : null}
            {saveError ? <p className="writer-ad-placement-feedback error">{saveError}</p> : null}
          </div>
          <button className="writer-ad-placement-save" type="submit" disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save placement'}
          </button>
        </div>

        {loadError ? <div className="writer-ad-placement-alert">{loadError}</div> : null}

        <div className="writer-ad-placement-stats">
          <div className="writer-ad-placement-stat">
            <span>Current mode</span>
            <strong>{isPlatformMode ? 'Platform monetization' : 'Individual monetization'}</strong>
            <small>{isPlatformMode ? 'Bloggad managed ads' : 'Your own ad setup'}</small>
          </div>
          <div className="writer-ad-placement-stat">
            <span>Active placements</span>
            <strong>{activePlacementCount} / 7</strong>
            <small>
              {activePlacementCount === 7
                ? 'All placement slots enabled'
                : String(7 - activePlacementCount) + ' placement slots off'}
            </small>
          </div>
          <div className="writer-ad-placement-stat template">
            <span>Template preview</span>
            <strong>{templateLabel}</strong>
            <small>Preview follows supported slots</small>
          </div>
        </div>

        <div className="writer-ad-placement-grid">
          <div className="writer-ad-placement-left">
            <section className="writer-ad-placement-card">
              <h3>Placement setup</h3>
              <p className="writer-ad-placement-card-copy">
                Set the monetization mode and preview context before choosing individual ad slots.
              </p>
              {loading ? <div className="writer-ad-placement-loading">Loading your saved placement settings...</div> : null}
              <div className="writer-ad-placement-setup-grid">
                <div className="writer-ad-placement-field">
                  <label>Monetization mode</label>
                  <select
                    value={form.monetization_mode}
                    onChange={(event) => updateField('monetization_mode', event.target.value)}
                    disabled={loading}
                  >
                    <option value="individual">Individual monetization</option>
                    <option value="platform">Platform monetization</option>
                  </select>
                </div>
                <div className="writer-ad-placement-field">
                  <label>Selected template</label>
                  <select
                    value={form.selected_template}
                    onChange={(event) => updateField('selected_template', event.target.value)}
                    disabled={loading}
                  >
                    <option value="current-template">Current active template</option>
                    <option value="minimal-template">Minimal template</option>
                    <option value="electronics-template">Electronics template</option>
                  </select>
                </div>
                <div className="writer-ad-placement-field">
                  <label>Middle insert after</label>
                  <input
                    value={form.post_middle_insert_after}
                    onChange={(event) => updateField('post_middle_insert_after', event.target.value)}
                    placeholder="2"
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            {placementGroups.map((group) => (
              <section className="writer-ad-placement-card" key={group.title}>
                <div className="writer-ad-placement-group-head">
                  <h3>{group.title}</h3>
                  <p className="writer-ad-placement-card-copy">
                    {group.title === 'Storefront placements'
                      ? 'Control positions on the storefront homepage. Unsupported template slots remain hidden.'
                      : 'Choose positions inside detailed blog posts. The middle slot uses the selected paragraph insertion point when supported.'}
                  </p>
                </div>
                <div className="writer-ad-placement-toggle-list">
                  {group.items.map((item) => {
                    const enabled = Number(form[item.key]) === 1;
                    return (
                      <div className="writer-ad-placement-toggle-row" key={item.key}>
                        <div className="writer-ad-placement-toggle-copy">
                          <strong>{item.label}</strong>
                          <span>{item.helper}</span>
                        </div>
                        <button
                          className={'writer-ad-placement-switch' + (enabled ? ' on' : '')}
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          aria-label={item.label}
                          onClick={() => updateField(item.key, enabled ? 0 : 1)}
                          disabled={loading}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="writer-ad-placement-right">
            <section className="writer-ad-placement-card">
              <h3>Placement preview</h3>
              <p className="writer-ad-placement-card-copy">
                A guide to where enabled slots can appear. Actual placement depends on template support.
              </p>
              <div className="writer-ad-placement-preview-tabs">
                <button
                  className={'writer-ad-placement-preview-tab' + (previewMode === 'storefront' ? ' active' : '')}
                  type="button"
                  onClick={() => setPreviewMode('storefront')}
                >
                  Storefront
                </button>
                <button
                  className={'writer-ad-placement-preview-tab' + (previewMode === 'post' ? ' active' : '')}
                  type="button"
                  onClick={() => setPreviewMode('post')}
                >
                  Post detail
                </button>
              </div>

              {previewMode === 'storefront' ? (
                <div className="writer-ad-placement-preview-canvas">
                  <div className="writer-ad-placement-preview-label">Storefront</div>
                  <div className={'writer-ad-placement-preview-slot' + (Number(form.storefront_top_enabled) ? '' : ' off')}>
                    {Number(form.storefront_top_enabled) ? 'Storefront top slot' : 'Storefront top off'}
                  </div>
                  <div className="writer-ad-placement-preview-row">
                    <div className="writer-ad-placement-preview-slot soft">Main storefront content</div>
                    <div className={'writer-ad-placement-preview-slot' + (Number(form.storefront_sidebar_enabled) ? ' soft' : ' off')}>
                      {Number(form.storefront_sidebar_enabled) ? 'Sidebar slot' : 'Sidebar off'}
                    </div>
                  </div>
                  <div
                    className={'writer-ad-placement-preview-slot' + (Number(form.storefront_bottom_enabled) ? ' soft' : ' off')}
                    style={{ marginTop: 9 }}
                  >
                    {Number(form.storefront_bottom_enabled) ? 'Storefront bottom slot' : 'Storefront bottom off'}
                  </div>
                </div>
              ) : (
                <div className="writer-ad-placement-preview-canvas">
                  <div className="writer-ad-placement-preview-label">Post detail</div>
                  <div className={'writer-ad-placement-preview-slot' + (Number(form.post_top_enabled) ? '' : ' off')}>
                    {Number(form.post_top_enabled) ? 'Post top slot' : 'Post top off'}
                  </div>
                  <div className="writer-ad-placement-preview-stack" style={{ marginTop: 9 }}>
                    <div className="writer-ad-placement-preview-slot soft">Article content</div>
                    <div className={'writer-ad-placement-preview-slot' + (Number(form.post_middle_enabled) ? ' soft' : ' off')}>
                      {Number(form.post_middle_enabled)
                        ? 'Post middle after paragraph ' + form.post_middle_insert_after
                        : 'Post middle off'}
                    </div>
                    <div className="writer-ad-placement-preview-slot soft">Article content continues</div>
                    <div className={'writer-ad-placement-preview-slot' + (Number(form.post_bottom_enabled) ? ' soft' : ' off')}>
                      {Number(form.post_bottom_enabled) ? 'Post bottom slot' : 'Post bottom off'}
                    </div>
                    <div className={'writer-ad-placement-preview-slot' + (Number(form.post_sidebar_enabled) ? ' soft' : ' off')}>
                      {Number(form.post_sidebar_enabled) ? 'Post sidebar slot' : 'Post sidebar off'}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="writer-ad-placement-card">
              <h3>Slot rules</h3>
              <p className="writer-ad-placement-card-copy">These rules come from the current placement behavior.</p>
              <ul className="writer-ad-placement-rule-list">
                <li>Storefront slots appear only on storefront pages.</li>
                <li>Post slots appear only on detailed blog post pages.</li>
                <li>Post middle uses the chosen paragraph insertion point when supported.</li>
                <li>Only positions supported by the current template can display an ad.</li>
                <li>Saved settings determine which approved ads may show in each slot.</li>
              </ul>
            </section>
          </div>
        </div>
      </form>
    );
  }

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
