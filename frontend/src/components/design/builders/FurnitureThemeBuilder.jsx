import BuilderSection from '../BuilderSection';
import ImageField from '../ImageField';

function getSlides(settings) {
  const slides = settings?.furniture_theme?.hero_slider?.slides;
  if (Array.isArray(slides) && slides.length) {
    return slides.slice(0, 5);
  }

  return [
    {
      id: 'furniture-slide-1',
      title: 'Up To 30% Off',
      subtitle: "Let's Make Home Happy",
      button_label: 'Shop Now',
      image_url: '',
      badge: 'New Collection',
      accent: '#f3ece4',
      text_color: '#2a211b',
    },
    {
      id: 'furniture-slide-2',
      title: 'Modern Living',
      subtitle: 'Elegant pieces for every room',
      button_label: 'Explore Now',
      image_url: '',
      badge: 'Best Seller',
      accent: '#eee4d8',
      text_color: '#2a211b',
    },
    {
      id: 'furniture-slide-3',
      title: 'Comfort Collection',
      subtitle: 'Premium furniture at better prices',
      button_label: 'View Deals',
      image_url: '',
      badge: 'Trending',
      accent: '#e9ded0',
      text_color: '#2a211b',
    },
  ];
}

function TabFields({ label, values = [], basePath, onTextChange }) {
  const items = Array.from({ length: 4 }, (_, index) => values[index] || '');

  return (
    <div className="affiliate-design-form-grid">
      {items.map((value, index) => (
        <label key={`${basePath}-${index}`} className="affiliate-design-field">
          <span>{label} {index + 1}</span>
          <input
            className="affiliate-design-input"
            type="text"
            value={value}
            onChange={(event) => onTextChange(`${basePath}.${index}`, event.target.value)}
            placeholder={`Tab ${index + 1}`}
          />
        </label>
      ))}
    </div>
  );
}

export default function FurnitureThemeBuilder({
  settings,
  onTextChange,
  onToggleChange,
  onNumberChange,
  onImageUpload,
  uploadState,
}) {
  const furniture = settings?.furniture_theme || {};
  const slides = getSlides(settings);

  return (
    <div className="affiliate-design-builder-stack">
      <BuilderSection
        title="Top Bar"
        description="Edit the small top strip above the header."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.topbar?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.topbar.enabled', event.target.checked)}
            />
            <span>Enable top bar</span>
          </label>

          <label className="affiliate-design-field">
            <span>Left Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.topbar?.left_text || ''}
              onChange={(event) => onTextChange('furniture_theme.topbar.left_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Center Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.topbar?.center_text || ''}
              onChange={(event) => onTextChange('furniture_theme.topbar.center_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Right Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.topbar?.right_text || ''}
              onChange={(event) => onTextChange('furniture_theme.topbar.right_text', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Header"
        description="Edit header search and contact details."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span>Search Placeholder</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.header?.search_placeholder || ''}
              onChange={(event) => onTextChange('furniture_theme.header.search_placeholder', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Phone Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.header?.phone_label || ''}
              onChange={(event) => onTextChange('furniture_theme.header.phone_label', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Support Note</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.header?.note_label || ''}
              onChange={(event) => onTextChange('furniture_theme.header.note_label', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Hero Slider"
        description="This template uses up to 5 hero slides. Edit each slide separately."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.hero_slider?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.hero_slider.enabled', event.target.checked)}
            />
            <span>Enable hero slider</span>
          </label>
        </div>

        {Array.from({ length: 5 }, (_, index) => {
          const slide = slides[index] || {
            id: `furniture-slide-${index + 1}`,
            title: '',
            subtitle: '',
            button_label: '',
            image_url: '',
            badge: '',
            accent: '',
            text_color: '',
          };

          return (
            <div key={slide.id || index} className="affiliate-design-subsection">
              <div className="affiliate-design-subsection-title">Slide {index + 1}</div>

              <div className="affiliate-design-form-grid">
                <label className="affiliate-design-field">
                  <span>Title</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.title || ''}
                    onChange={(event) =>
                      onTextChange(`furniture_theme.hero_slider.slides.${index}.title`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Subtitle</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.subtitle || ''}
                    onChange={(event) =>
                      onTextChange(`furniture_theme.hero_slider.slides.${index}.subtitle`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Button Label</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.button_label || ''}
                    onChange={(event) =>
                      onTextChange(`furniture_theme.hero_slider.slides.${index}.button_label`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Badge</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.badge || ''}
                    onChange={(event) =>
                      onTextChange(`furniture_theme.hero_slider.slides.${index}.badge`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Accent Color</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.accent || ''}
                    onChange={(event) =>
                      onTextChange(`furniture_theme.hero_slider.slides.${index}.accent`, event.target.value)
                    }
                    placeholder="#f3ece4"
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Text Color</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.text_color || ''}
                    onChange={(event) =>
                      onTextChange(`furniture_theme.hero_slider.slides.${index}.text_color`, event.target.value)
                    }
                    placeholder="#2a211b"
                  />
                </label>
              </div>

              <ImageField
                label={`Slide ${index + 1} Image`}
                value={slide.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `furniture_theme.hero_slider.slides.${index}.image_url`,
                    `furniture_slide_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`furniture_slide_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection
        title="New Arrivals"
        description="Edit the title, tabs, and product count."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.new_arrivals?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.new_arrivals.enabled', event.target.checked)}
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.new_arrivals?.title || ''}
              onChange={(event) => onTextChange('furniture_theme.new_arrivals.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Product Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={furniture?.new_arrivals?.limit || 8}
              onChange={(event) => onNumberChange('furniture_theme.new_arrivals.limit', event.target.value)}
            />
          </label>
        </div>

        <TabFields
          label="Tab"
          values={furniture?.new_arrivals?.tabs || []}
          basePath="furniture_theme.new_arrivals.tabs"
          onTextChange={onTextChange}
        />
      </BuilderSection>

      <BuilderSection
        title="Features Strip"
        description="Edit the four service/highlight blocks under new arrivals."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.features_strip?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.features_strip.enabled', event.target.checked)}
            />
            <span>Enable features strip</span>
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_one_title || ''}
              onChange={(event) => onTextChange('furniture_theme.features_strip.item_one_title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_one_subtitle || ''}
              onChange={(event) =>
                onTextChange('furniture_theme.features_strip.item_one_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_two_title || ''}
              onChange={(event) => onTextChange('furniture_theme.features_strip.item_two_title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_two_subtitle || ''}
              onChange={(event) =>
                onTextChange('furniture_theme.features_strip.item_two_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_three_title || ''}
              onChange={(event) =>
                onTextChange('furniture_theme.features_strip.item_three_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_three_subtitle || ''}
              onChange={(event) =>
                onTextChange('furniture_theme.features_strip.item_three_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_four_title || ''}
              onChange={(event) =>
                onTextChange('furniture_theme.features_strip.item_four_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.features_strip?.item_four_subtitle || ''}
              onChange={(event) =>
                onTextChange('furniture_theme.features_strip.item_four_subtitle', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Recently Added"
        description="Control the recently added section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.recently_added?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.recently_added.enabled', event.target.checked)}
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.recently_added?.title || ''}
              onChange={(event) => onTextChange('furniture_theme.recently_added.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Product Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={furniture?.recently_added?.limit || 6}
              onChange={(event) => onNumberChange('furniture_theme.recently_added.limit', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Top Categories"
        description="Control the weekly top categories section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.top_categories?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.top_categories.enabled', event.target.checked)}
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.top_categories?.title || ''}
              onChange={(event) => onTextChange('furniture_theme.top_categories.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Category Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="24"
              value={furniture?.top_categories?.limit || 6}
              onChange={(event) => onNumberChange('furniture_theme.top_categories.limit', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Popular Products"
        description="Edit title, tabs, and count for popular products."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.popular_products?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.popular_products.enabled', event.target.checked)}
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.popular_products?.title || ''}
              onChange={(event) => onTextChange('furniture_theme.popular_products.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Product Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={furniture?.popular_products?.limit || 8}
              onChange={(event) => onNumberChange('furniture_theme.popular_products.limit', event.target.value)}
            />
          </label>
        </div>

        <TabFields
          label="Tab"
          values={furniture?.popular_products?.tabs || []}
          basePath="furniture_theme.popular_products.tabs"
          onTextChange={onTextChange}
        />
      </BuilderSection>

      <BuilderSection
        title="Marketplace News"
        description="Control the article/news section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.news?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.news.enabled', event.target.checked)}
            />
            <span>Enable news section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.news?.title || ''}
              onChange={(event) => onTextChange('furniture_theme.news.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Article Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="24"
              value={furniture?.news?.limit || 3}
              onChange={(event) => onNumberChange('furniture_theme.news.limit', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Brand Row"
        description="Edit the six brand labels shown above the newsletter."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.brand_row?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.brand_row.enabled', event.target.checked)}
            />
            <span>Enable brand row</span>
          </label>
        </div>

        <div className="affiliate-design-form-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <label key={`brand-title-${index}`} className="affiliate-design-field">
              <span>Brand {index + 1}</span>
              <input
                className="affiliate-design-input"
                type="text"
                value={furniture?.brand_row?.titles?.[index] || ''}
                onChange={(event) =>
                  onTextChange(`furniture_theme.brand_row.titles.${index}`, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </BuilderSection>

      <BuilderSection
        title="Newsletter"
        description="Edit the newsletter section content."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.newsletter?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.newsletter.enabled', event.target.checked)}
            />
            <span>Enable newsletter</span>
          </label>

          <label className="affiliate-design-field">
            <span>Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.newsletter?.title || ''}
              onChange={(event) => onTextChange('furniture_theme.newsletter.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.newsletter?.subtitle || ''}
              onChange={(event) => onTextChange('furniture_theme.newsletter.subtitle', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Input Placeholder</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.newsletter?.placeholder || ''}
              onChange={(event) => onTextChange('furniture_theme.newsletter.placeholder', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.newsletter?.button_label || ''}
              onChange={(event) => onTextChange('furniture_theme.newsletter.button_label', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Footer"
        description="Edit the footer contact and copyright text."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={furniture?.footer?.enabled !== false}
              onChange={(event) => onToggleChange('furniture_theme.footer.enabled', event.target.checked)}
            />
            <span>Enable footer</span>
          </label>

          <label className="affiliate-design-field">
            <span>About Text</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={furniture?.footer?.about_text || ''}
              onChange={(event) => onTextChange('furniture_theme.footer.about_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Phone</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.footer?.phone || ''}
              onChange={(event) => onTextChange('furniture_theme.footer.phone', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Email</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.footer?.email || ''}
              onChange={(event) => onTextChange('furniture_theme.footer.email', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Address</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.footer?.address || ''}
              onChange={(event) => onTextChange('furniture_theme.footer.address', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Copyright</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={furniture?.footer?.copyright || ''}
              onChange={(event) => onTextChange('furniture_theme.footer.copyright', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>
    </div>
  );
}