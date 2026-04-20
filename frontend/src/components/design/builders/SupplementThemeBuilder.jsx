import { Search, Image as ImageIcon, Rows3, PanelTop, Text, FolderKanban } from 'lucide-react';
import ImageField from '../ImageField';
import BuilderSection from '../BuilderSection';

export default function SupplementThemeBuilder({
  settings,
  onTextChange,
  onToggleChange,
  onNumberChange,
  onImageUpload,
  uploadState,
}) {
  const templateCodeKey = 'supplement_theme';
  const config = settings?.supplement_theme;
  if (!config) return null;

  return (
    <div className="affiliate-design-builder-grid">
      <BuilderSection icon={<PanelTop size={16} />} title="Top Strip">
        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            checked={!!config.top_strip.enabled}
            onChange={(e) => onToggleChange(`${templateCodeKey}.top_strip.enabled`, e.target.checked)}
          />
          <span>Enable top strip</span>
        </label>

        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Top strip message</span>
            <input
              className="affiliate-design-input"
              value={config.top_strip.message || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.top_strip.message`, e.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection icon={<Search size={16} />} title="Header">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Search placeholder</span>
            <input
              className="affiliate-design-input"
              value={config.header.search_placeholder || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.header.search_placeholder`, e.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection icon={<ImageIcon size={16} />} title="Hero">
        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            checked={!!config.hero.enabled}
            onChange={(e) => onToggleChange(`${templateCodeKey}.hero.enabled`, e.target.checked)}
          />
          <span>Enable hero section</span>
        </label>

        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Eyebrow</span>
            <input
              className="affiliate-design-input"
              value={config.hero.eyebrow || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.hero.eyebrow`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Button label</span>
            <input
              className="affiliate-design-input"
              value={config.hero.button_label || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.hero.button_label`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Hero title</span>
            <input
              className="affiliate-design-input"
              value={config.hero.title || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.hero.title`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Hero subtitle</span>
            <textarea
              className="affiliate-design-input affiliate-design-textarea small"
              rows="3"
              value={config.hero.subtitle || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.hero.subtitle`, e.target.value)}
            />
          </label>

          <ImageField
            label="Hero image"
            value={config.hero.image_url || ''}
            onChange={(e) => onTextChange(`${templateCodeKey}.hero.image_url`, e.target.value)}
            onUpload={(e) => onImageUpload(e, `${templateCodeKey}.hero.image_url`, 'supp_hero')}
            uploading={uploadState.supp_hero}
          />
        </div>
      </BuilderSection>

      <BuilderSection icon={<Rows3 size={16} />} title="Hero Promo Blocks">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.hero_promo_one.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.hero_promo_one.enabled`, e.target.checked)
              }
            />
            <span>Enable promo block 1</span>
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Promo 1 title</span>
            <input
              className="affiliate-design-input"
              value={config.hero_promo_one.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.hero_promo_one.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Promo 1 subtitle</span>
            <input
              className="affiliate-design-input"
              value={config.hero_promo_one.subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.hero_promo_one.subtitle`, e.target.value)
              }
            />
          </label>

          <ImageField
            label="Promo 1 image"
            value={config.hero_promo_one.image_url || ''}
            onChange={(e) => onTextChange(`${templateCodeKey}.hero_promo_one.image_url`, e.target.value)}
            onUpload={(e) =>
              onImageUpload(e, `${templateCodeKey}.hero_promo_one.image_url`, 'supp_promo_one')
            }
            uploading={uploadState.supp_promo_one}
          />

          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.hero_promo_two.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.hero_promo_two.enabled`, e.target.checked)
              }
            />
            <span>Enable promo block 2</span>
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Promo 2 title</span>
            <input
              className="affiliate-design-input"
              value={config.hero_promo_two.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.hero_promo_two.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Promo 2 subtitle</span>
            <input
              className="affiliate-design-input"
              value={config.hero_promo_two.subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.hero_promo_two.subtitle`, e.target.value)
              }
            />
          </label>

          <ImageField
            label="Promo 2 image"
            value={config.hero_promo_two.image_url || ''}
            onChange={(e) => onTextChange(`${templateCodeKey}.hero_promo_two.image_url`, e.target.value)}
            onUpload={(e) =>
              onImageUpload(e, `${templateCodeKey}.hero_promo_two.image_url`, 'supp_promo_two')
            }
            uploading={uploadState.supp_promo_two}
          />
        </div>
      </BuilderSection>

      <BuilderSection icon={<FolderKanban size={16} />} title="Goals / Services / Products">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.goals.enabled}
              onChange={(e) => onToggleChange(`${templateCodeKey}.goals.enabled`, e.target.checked)}
            />
            <span>Enable goals section</span>
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Goals title</span>
            <input
              className="affiliate-design-input"
              value={config.goals.title || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.goals.title`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.services.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.services.enabled`, e.target.checked)
              }
            />
            <span>Enable services strip</span>
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Service 1 title</span>
            <input
              className="affiliate-design-input"
              value={config.services.item_one_title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.services.item_one_title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Service 1 subtitle</span>
            <input
              className="affiliate-design-input"
              value={config.services.item_one_subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.services.item_one_subtitle`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Service 2 title</span>
            <input
              className="affiliate-design-input"
              value={config.services.item_two_title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.services.item_two_title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Service 2 subtitle</span>
            <input
              className="affiliate-design-input"
              value={config.services.item_two_subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.services.item_two_subtitle`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Featured products title</span>
            <input
              className="affiliate-design-input"
              value={config.featured_products.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.featured_products.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Featured products limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={config.featured_products.limit || 8}
              onChange={(e) =>
                onNumberChange(`${templateCodeKey}.featured_products.limit`, e.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection icon={<ImageIcon size={16} />} title="Large Promo / Reviews / Articles">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.large_promo.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.large_promo.enabled`, e.target.checked)
              }
            />
            <span>Enable large promo section</span>
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Large promo title</span>
            <input
              className="affiliate-design-input"
              value={config.large_promo.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.large_promo.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Large promo subtitle</span>
            <textarea
              className="affiliate-design-input affiliate-design-textarea small"
              rows="3"
              value={config.large_promo.subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.large_promo.subtitle`, e.target.value)
              }
            />
          </label>

          <ImageField
            label="Large promo image"
            value={config.large_promo.image_url || ''}
            onChange={(e) => onTextChange(`${templateCodeKey}.large_promo.image_url`, e.target.value)}
            onUpload={(e) =>
              onImageUpload(e, `${templateCodeKey}.large_promo.image_url`, 'supp_large_promo')
            }
            uploading={uploadState.supp_large_promo}
          />

          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.testimonials.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.testimonials.enabled`, e.target.checked)
              }
            />
            <span>Enable testimonials</span>
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Testimonials title</span>
            <input
              className="affiliate-design-input"
              value={config.testimonials.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.testimonials.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Articles title</span>
            <input
              className="affiliate-design-input"
              value={config.articles.title || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.articles.title`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Articles limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="24"
              value={config.articles.limit || 3}
              onChange={(e) => onNumberChange(`${templateCodeKey}.articles.limit`, e.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection icon={<Text size={16} />} title="Newsletter / Footer">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.newsletter.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.newsletter.enabled`, e.target.checked)
              }
            />
            <span>Enable newsletter section</span>
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Newsletter title</span>
            <input
              className="affiliate-design-input"
              value={config.newsletter.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.newsletter.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Newsletter placeholder</span>
            <input
              className="affiliate-design-input"
              value={config.newsletter.placeholder || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.newsletter.placeholder`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Newsletter button</span>
            <input
              className="affiliate-design-input"
              value={config.newsletter.button_label || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.newsletter.button_label`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Footer about text</span>
            <textarea
              className="affiliate-design-input affiliate-design-textarea small"
              rows="3"
              value={config.footer.about_text || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.footer.about_text`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Footer phone</span>
            <input
              className="affiliate-design-input"
              value={config.footer.phone || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.footer.phone`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Footer email</span>
            <input
              className="affiliate-design-input"
              value={config.footer.email || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.footer.email`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Footer address</span>
            <input
              className="affiliate-design-input"
              value={config.footer.address || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.footer.address`, e.target.value)}
            />
          </label>
        </div>
      </BuilderSection>
    </div>
  );
}