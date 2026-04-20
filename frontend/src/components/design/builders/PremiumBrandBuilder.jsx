import {
  Image as ImageIcon,
  Rows3,
  TimerReset,
  MonitorSmartphone,
  PanelTop,
  Text,
} from 'lucide-react';
import ImageField from '../ImageField';
import BuilderSection from '../BuilderSection';

export default function PremiumBrandBuilder({
  templateCodeKey,
  settings,
  onTextChange,
  onToggleChange,
  onNumberChange,
  onImageUpload,
  uploadState,
}) {
  const config = settings?.[templateCodeKey];
  if (!config) return null;

  return (
    <div className="affiliate-design-builder-grid">
      <BuilderSection icon={<PanelTop size={16} />} title="Top Header">
        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            checked={!!config.top_header.enabled}
            onChange={(e) => onToggleChange(`${templateCodeKey}.top_header.enabled`, e.target.checked)}
          />
          <span>Enable top header block</span>
        </label>

        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Support title</span>
            <input
              className="affiliate-design-input"
              value={config.top_header.support_title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.top_header.support_title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Support text</span>
            <input
              className="affiliate-design-input"
              value={config.top_header.support_text || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.top_header.support_text`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Shipping title</span>
            <input
              className="affiliate-design-input"
              value={config.top_header.shipping_title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.top_header.shipping_title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Shipping text</span>
            <input
              className="affiliate-design-input"
              value={config.top_header.shipping_text || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.top_header.shipping_text`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Country label</span>
            <input
              className="affiliate-design-input"
              value={config.top_header.country_label || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.top_header.country_label`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Currency label</span>
            <input
              className="affiliate-design-input"
              value={config.top_header.currency_label || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.top_header.currency_label`, e.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection icon={<ImageIcon size={16} />} title="Hero Slider">
        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            checked={!!config.hero_slider.enabled}
            onChange={(e) => onToggleChange(`${templateCodeKey}.hero_slider.enabled`, e.target.checked)}
          />
          <span>Enable hero slider section</span>
        </label>

        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Hero title</span>
            <input
              className="affiliate-design-input"
              value={config.hero_slider.title || ''}
              onChange={(e) => onTextChange(`${templateCodeKey}.hero_slider.title`, e.target.value)}
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Hero subtitle</span>
            <textarea
              className="affiliate-design-input affiliate-design-textarea small"
              rows="3"
              value={config.hero_slider.subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.hero_slider.subtitle`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Primary button label</span>
            <input
              className="affiliate-design-input"
              value={config.hero_slider.primary_button_label || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.hero_slider.primary_button_label`, e.target.value)
              }
            />
          </label>

          <ImageField
            label="Hero image"
            value={config.hero_slider.image_url || ''}
            onChange={(e) => onTextChange(`${templateCodeKey}.hero_slider.image_url`, e.target.value)}
            onUpload={(e) => onImageUpload(e, `${templateCodeKey}.hero_slider.image_url`, 'hero_slider')}
            uploading={uploadState.hero_slider}
          />
        </div>
      </BuilderSection>

      <BuilderSection icon={<TimerReset size={16} />} title="Main Promo / Countdown Block">
        <label className="affiliate-design-toggle">
          <input
            type="checkbox"
            checked={!!config.promo_block_main.enabled}
            onChange={(e) =>
              onToggleChange(`${templateCodeKey}.promo_block_main.enabled`, e.target.checked)
            }
          />
          <span>Enable main promo block</span>
        </label>

        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Title</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_main.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_main.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Button label</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_main.button_label || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_main.button_label`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Days</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_main.countdown_days || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_main.countdown_days`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Hours</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_main.countdown_hours || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_main.countdown_hours`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Minutes</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_main.countdown_minutes || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_main.countdown_minutes`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Seconds</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_main.countdown_seconds || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_main.countdown_seconds`, e.target.value)
              }
            />
          </label>

          <ImageField
            label="Main promo image"
            value={config.promo_block_main.image_url || ''}
            onChange={(e) =>
              onTextChange(`${templateCodeKey}.promo_block_main.image_url`, e.target.value)
            }
            onUpload={(e) =>
              onImageUpload(e, `${templateCodeKey}.promo_block_main.image_url`, 'promo_block_main')
            }
            uploading={uploadState.promo_block_main}
          />
        </div>
      </BuilderSection>

      <BuilderSection icon={<Rows3 size={16} />} title="Small Promo Blocks">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.promo_block_small_1.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.promo_block_small_1.enabled`, e.target.checked)
              }
            />
            <span>Enable small block 1</span>
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Block 1 title</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_small_1.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_small_1.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Block 1 subtitle</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_small_1.subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_small_1.subtitle`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Block 1 button label</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_small_1.button_label || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_small_1.button_label`, e.target.value)
              }
            />
          </label>

          <ImageField
            label="Block 1 image"
            value={config.promo_block_small_1.image_url || ''}
            onChange={(e) =>
              onTextChange(`${templateCodeKey}.promo_block_small_1.image_url`, e.target.value)
            }
            onUpload={(e) =>
              onImageUpload(
                e,
                `${templateCodeKey}.promo_block_small_1.image_url`,
                'promo_block_small_1'
              )
            }
            uploading={uploadState.promo_block_small_1}
          />

          <label className="affiliate-design-toggle affiliate-design-field-full">
            <input
              type="checkbox"
              checked={!!config.promo_block_small_2.enabled}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.promo_block_small_2.enabled`, e.target.checked)
              }
            />
            <span>Enable small block 2</span>
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Block 2 title</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_small_2.title || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_small_2.title`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Block 2 subtitle</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_small_2.subtitle || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_small_2.subtitle`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field affiliate-design-field-full">
            <span className="affiliate-design-label">Block 2 button label</span>
            <input
              className="affiliate-design-input"
              value={config.promo_block_small_2.button_label || ''}
              onChange={(e) =>
                onTextChange(`${templateCodeKey}.promo_block_small_2.button_label`, e.target.value)
              }
            />
          </label>

          <ImageField
            label="Block 2 image"
            value={config.promo_block_small_2.image_url || ''}
            onChange={(e) =>
              onTextChange(`${templateCodeKey}.promo_block_small_2.image_url`, e.target.value)
            }
            onUpload={(e) =>
              onImageUpload(
                e,
                `${templateCodeKey}.promo_block_small_2.image_url`,
                'promo_block_small_2'
              )
            }
            uploading={uploadState.promo_block_small_2}
          />
        </div>
      </BuilderSection>

      <BuilderSection icon={<MonitorSmartphone size={16} />} title="Section Visibility">
        <div className="affiliate-design-toggle-grid">
          <label className="affiliate-design-toggle">
            <input
              type="checkbox"
              checked={!!config.sections.popular_categories}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.sections.popular_categories`, e.target.checked)
              }
            />
            <span>Popular Categories</span>
          </label>

          <label className="affiliate-design-toggle">
            <input
              type="checkbox"
              checked={!!config.sections.best_offers}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.sections.best_offers`, e.target.checked)
              }
            />
            <span>Best Offers</span>
          </label>

          <label className="affiliate-design-toggle">
            <input
              type="checkbox"
              checked={!!config.sections.big_promo_strip}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.sections.big_promo_strip`, e.target.checked)
              }
            />
            <span>Big Promo Strip</span>
          </label>

          <label className="affiliate-design-toggle">
            <input
              type="checkbox"
              checked={!!config.sections.promo_band}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.sections.promo_band`, e.target.checked)
              }
            />
            <span>Promo Band</span>
          </label>

          <label className="affiliate-design-toggle">
            <input
              type="checkbox"
              checked={!!config.sections.articles}
              onChange={(e) =>
                onToggleChange(`${templateCodeKey}.sections.articles`, e.target.checked)
              }
            />
            <span>Articles</span>
          </label>
        </div>
      </BuilderSection>

      <BuilderSection icon={<Text size={16} />} title="Fixed Layout Limits">
        <div className="affiliate-design-note small">
          Layout stays fixed. Only item counts inside sections can be changed.
        </div>

        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Offers per row</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={config.limits.offers_per_row || 4}
              onChange={(e) =>
                onNumberChange(`${templateCodeKey}.limits.offers_per_row`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Offers limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={config.limits.offers_limit || 8}
              onChange={(e) =>
                onNumberChange(`${templateCodeKey}.limits.offers_limit`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Categories per row</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="8"
              value={config.limits.categories_per_row || 4}
              onChange={(e) =>
                onNumberChange(`${templateCodeKey}.limits.categories_per_row`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Categories limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={config.limits.categories_limit || 8}
              onChange={(e) =>
                onNumberChange(`${templateCodeKey}.limits.categories_limit`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Articles per row</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={config.limits.articles_per_row || 4}
              onChange={(e) =>
                onNumberChange(`${templateCodeKey}.limits.articles_per_row`, e.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span className="affiliate-design-label">Articles limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="24"
              value={config.limits.articles_limit || 4}
              onChange={(e) =>
                onNumberChange(`${templateCodeKey}.limits.articles_limit`, e.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>
    </div>
  );
}