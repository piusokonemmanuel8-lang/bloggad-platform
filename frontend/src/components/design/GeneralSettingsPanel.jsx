import {
  Palette,
  Type,
  Smartphone,
  LayoutPanelTop,
  PanelsTopLeft,
  Search,
  SlidersHorizontal,
  PaintBucket,
  FolderKanban,
} from 'lucide-react';

export default function GeneralSettingsPanel({ form, handleChange }) {
  return (
    <div className="affiliate-design-panel">
      <div className="affiliate-design-panel-head">
        <div>
          <p className="affiliate-design-panel-kicker">General settings</p>
          <h2 className="affiliate-design-panel-title">Storefront Controls</h2>
        </div>
      </div>

      <div className="affiliate-design-form-grid">
        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <LayoutPanelTop size={16} />
            Header layout
          </span>
          <input
            className="affiliate-design-input"
            name="header_layout"
            placeholder="Header layout"
            value={form.header_layout}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <PanelsTopLeft size={16} />
            Footer layout
          </span>
          <input
            className="affiliate-design-input"
            name="footer_layout"
            placeholder="Footer layout"
            value={form.footer_layout}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <Smartphone size={16} />
            Mobile menu style
          </span>
          <input
            className="affiliate-design-input"
            name="mobile_menu_style"
            placeholder="Mobile menu style"
            value={form.mobile_menu_style}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <Palette size={16} />
            Color scheme
          </span>
          <input
            className="affiliate-design-input"
            name="color_scheme"
            placeholder="Color scheme"
            value={form.color_scheme}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <PaintBucket size={16} />
            Primary color
          </span>
          <input
            className="affiliate-design-input"
            name="primary_color"
            placeholder="Primary color"
            value={form.primary_color}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <PaintBucket size={16} />
            Secondary color
          </span>
          <input
            className="affiliate-design-input"
            name="secondary_color"
            placeholder="Secondary color"
            value={form.secondary_color}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <PaintBucket size={16} />
            Accent color
          </span>
          <input
            className="affiliate-design-input"
            name="accent_color"
            placeholder="Accent color"
            value={form.accent_color}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">
            <Type size={16} />
            Font family
          </span>
          <input
            className="affiliate-design-input"
            name="font_family"
            placeholder="Font family"
            value={form.font_family}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">Button style</span>
          <input
            className="affiliate-design-input"
            name="button_style"
            placeholder="Button style"
            value={form.button_style}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-field">
          <span className="affiliate-design-label">Card style</span>
          <input
            className="affiliate-design-input"
            name="card_style"
            placeholder="Card style"
            value={form.card_style}
            onChange={handleChange}
          />
        </label>

        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            name="show_search"
            checked={form.show_search}
            onChange={handleChange}
          />
          <span>
            <Search size={15} />
            Show search
          </span>
        </label>

        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            name="show_categories_menu"
            checked={form.show_categories_menu}
            onChange={handleChange}
          />
          <span>
            <FolderKanban size={15} />
            Show categories menu
          </span>
        </label>

        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            name="show_featured_slider"
            checked={form.show_featured_slider}
            onChange={handleChange}
          />
          <span>
            <SlidersHorizontal size={15} />
            Show featured slider
          </span>
        </label>

        <label className="affiliate-design-field affiliate-design-field-full">
          <span className="affiliate-design-label">Custom CSS</span>
          <textarea
            className="affiliate-design-input affiliate-design-textarea"
            name="custom_css"
            rows="8"
            placeholder="Custom CSS"
            value={form.custom_css}
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
}