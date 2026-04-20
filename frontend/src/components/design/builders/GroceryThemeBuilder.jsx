import BuilderSection from '../BuilderSection';
import ImageField from '../ImageField';

function getSlides(settings) {
  const slides = settings?.grocery_theme?.hero_slider?.slides;
  if (Array.isArray(slides) && slides.length) {
    return slides.slice(0, 5);
  }

  return [
    {
      id: 'grocery-slide-1',
      eyebrow: 'Grocery at home',
      title: 'Your daily needs',
      subtitle:
        'Organic food is food produced by methods that comply with the standards of organic farming.',
      button_label: 'Go to Shop',
      secondary_button_label: 'Learn More',
      image_url: '',
      badge: 'Fresh Delivery',
      accent: '#f4fff2',
      text_color: '#18351f',
    },
    {
      id: 'grocery-slide-2',
      eyebrow: 'Grocery at home',
      title: 'Healthy food market',
      subtitle: 'Shop fresh produce, drinks, snacks and home essentials in one place.',
      button_label: 'Go to Shop',
      secondary_button_label: 'Learn More',
      image_url: '',
      badge: 'Organic Picks',
      accent: '#fff9ef',
      text_color: '#25311f',
    },
    {
      id: 'grocery-slide-3',
      eyebrow: 'Grocery at home',
      title: 'Delivered fresh daily',
      subtitle: 'Your favorite groceries, fruits and vegetables delivered to your door.',
      button_label: 'Go to Shop',
      secondary_button_label: 'Learn More',
      image_url: '',
      badge: 'Today Deal',
      accent: '#eef8ff',
      text_color: '#18312a',
    },
  ];
}

function getBanners(settings) {
  const items = settings?.grocery_theme?.hero_banners?.items;
  if (Array.isArray(items) && items.length) {
    return items.slice(0, 2);
  }

  return [
    {
      title: 'Fresh vegetables',
      subtitle: 'Everyday low price',
      image_url: '',
      bg: '#fff4df',
    },
    {
      title: 'Healthy snacks',
      subtitle: 'Shop groceries now',
      image_url: '',
      bg: '#ecfff1',
    },
  ];
}

function TabFields({ label, values = [], basePath, onTextChange }) {
  const items = Array.from({ length: 4 }, (_, index) => values[index] || '');

  return (
    <div className="affiliate-design-form-grid">
      {items.map((value, index) => (
        <label key={`${basePath}-${index}`} className="affiliate-design-field">
          <span>
            {label} {index + 1}
          </span>
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

export default function GroceryThemeBuilder({
  settings,
  onTextChange,
  onToggleChange,
  onNumberChange,
  onImageUpload,
  uploadState,
}) {
  const grocery = settings?.grocery_theme || {};
  const slides = getSlides(settings);
  const banners = getBanners(settings);

  return (
    <div className="affiliate-design-builder-stack">
      <BuilderSection title="Top Bar" description="Edit the small top strip above the header.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.topbar?.enabled !== false}
              onChange={(event) => onToggleChange('grocery_theme.topbar.enabled', event.target.checked)}
            />
            <span>Enable top bar</span>
          </label>

          <label className="affiliate-design-field">
            <span>Left Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.topbar?.left_text || ''}
              onChange={(event) => onTextChange('grocery_theme.topbar.left_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Center Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.topbar?.center_text || ''}
              onChange={(event) => onTextChange('grocery_theme.topbar.center_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Right Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.topbar?.right_text || ''}
              onChange={(event) => onTextChange('grocery_theme.topbar.right_text', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection title="Header" description="Edit search, support details, and deals pill.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span>Search Placeholder</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.header?.search_placeholder || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.header.search_placeholder', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Phone Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.header?.phone_label || ''}
              onChange={(event) => onTextChange('grocery_theme.header.phone_label', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Support Note</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.header?.note_label || ''}
              onChange={(event) => onTextChange('grocery_theme.header.note_label', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Today Deals Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.header?.today_deals_label || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.header.today_deals_label', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Hero Slider"
        description="This template uses up to 5 hero slides."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.hero_slider?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.hero_slider.enabled', event.target.checked)
              }
            />
            <span>Enable hero slider</span>
          </label>
        </div>

        {Array.from({ length: 5 }, (_, index) => {
          const slide = slides[index] || {
            id: `grocery-slide-${index + 1}`,
            eyebrow: '',
            title: '',
            subtitle: '',
            button_label: '',
            secondary_button_label: '',
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
                  <span>Eyebrow</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.eyebrow || ''}
                    onChange={(event) =>
                      onTextChange(`grocery_theme.hero_slider.slides.${index}.eyebrow`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Title</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.title || ''}
                    onChange={(event) =>
                      onTextChange(`grocery_theme.hero_slider.slides.${index}.title`, event.target.value)
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
                      onTextChange(`grocery_theme.hero_slider.slides.${index}.subtitle`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Primary Button</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.button_label || ''}
                    onChange={(event) =>
                      onTextChange(`grocery_theme.hero_slider.slides.${index}.button_label`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Secondary Button</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.secondary_button_label || ''}
                    onChange={(event) =>
                      onTextChange(
                        `grocery_theme.hero_slider.slides.${index}.secondary_button_label`,
                        event.target.value
                      )
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
                      onTextChange(`grocery_theme.hero_slider.slides.${index}.badge`, event.target.value)
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
                      onTextChange(`grocery_theme.hero_slider.slides.${index}.accent`, event.target.value)
                    }
                    placeholder="#f4fff2"
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Text Color</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.text_color || ''}
                    onChange={(event) =>
                      onTextChange(`grocery_theme.hero_slider.slides.${index}.text_color`, event.target.value)
                    }
                    placeholder="#18351f"
                  />
                </label>
              </div>

              <ImageField
                label={`Slide ${index + 1} Image`}
                value={slide.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `grocery_theme.hero_slider.slides.${index}.image_url`,
                    `grocery_slide_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`grocery_slide_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection
        title="Right Promo Banners"
        description="Edit the two right-side promo banners beside the hero."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.hero_banners?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.hero_banners.enabled', event.target.checked)
              }
            />
            <span>Enable hero side banners</span>
          </label>
        </div>

        {Array.from({ length: 2 }, (_, index) => {
          const banner = banners[index] || {
            title: '',
            subtitle: '',
            image_url: '',
            bg: '',
          };

          return (
            <div key={`banner-${index}`} className="affiliate-design-subsection">
              <div className="affiliate-design-subsection-title">Banner {index + 1}</div>

              <div className="affiliate-design-form-grid">
                <label className="affiliate-design-field">
                  <span>Title</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={banner.title || ''}
                    onChange={(event) =>
                      onTextChange(`grocery_theme.hero_banners.items.${index}.title`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Subtitle</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={banner.subtitle || ''}
                    onChange={(event) =>
                      onTextChange(`grocery_theme.hero_banners.items.${index}.subtitle`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Background Color</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={banner.bg || ''}
                    onChange={(event) =>
                      onTextChange(`grocery_theme.hero_banners.items.${index}.bg`, event.target.value)
                    }
                    placeholder="#fff4df"
                  />
                </label>
              </div>

              <ImageField
                label={`Banner ${index + 1} Image`}
                value={banner.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `grocery_theme.hero_banners.items.${index}.image_url`,
                    `grocery_banner_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`grocery_banner_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection title="Shop by Category" description="Control the category chips section.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.category_chips?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.category_chips.enabled', event.target.checked)
              }
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.category_chips?.title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.category_chips.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Category Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="24"
              value={grocery?.category_chips?.limit || 6}
              onChange={(event) =>
                onNumberChange('grocery_theme.category_chips.limit', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Featured Products"
        description="Edit title, tabs, and count for featured products."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.featured_products?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.featured_products.enabled', event.target.checked)
              }
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.featured_products?.title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.featured_products.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Product Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={grocery?.featured_products?.limit || 8}
              onChange={(event) =>
                onNumberChange('grocery_theme.featured_products.limit', event.target.value)
              }
            />
          </label>
        </div>

        <TabFields
          label="Tab"
          values={grocery?.featured_products?.tabs || []}
          basePath="grocery_theme.featured_products.tabs"
          onTextChange={onTextChange}
        />
      </BuilderSection>

      <BuilderSection
        title="Features Strip"
        description="Edit the four service/highlight blocks."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.features_strip?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.features_strip.enabled', event.target.checked)
              }
            />
            <span>Enable features strip</span>
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_one_title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_one_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_one_subtitle || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_one_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_two_title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_two_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_two_subtitle || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_two_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_three_title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_three_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_three_subtitle || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_three_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_four_title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_four_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.features_strip?.item_four_subtitle || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.features_strip.item_four_subtitle', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection title="Top Categories" description="Control the top categories section.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.top_categories?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.top_categories.enabled', event.target.checked)
              }
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.top_categories?.title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.top_categories.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Category Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="24"
              value={grocery?.top_categories?.limit || 6}
              onChange={(event) =>
                onNumberChange('grocery_theme.top_categories.limit', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection title="Latest Products" description="Control the latest products section.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.latest_products?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.latest_products.enabled', event.target.checked)
              }
            />
            <span>Enable section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.latest_products?.title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.latest_products.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Product Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="48"
              value={grocery?.latest_products?.limit || 6}
              onChange={(event) =>
                onNumberChange('grocery_theme.latest_products.limit', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection title="Marketplace News" description="Control the article/news section.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.news?.enabled !== false}
              onChange={(event) => onToggleChange('grocery_theme.news.enabled', event.target.checked)}
            />
            <span>Enable news section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.news?.title || ''}
              onChange={(event) => onTextChange('grocery_theme.news.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Article Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="24"
              value={grocery?.news?.limit || 3}
              onChange={(event) => onNumberChange('grocery_theme.news.limit', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection title="Newsletter" description="Edit the newsletter section content.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.newsletter?.enabled !== false}
              onChange={(event) =>
                onToggleChange('grocery_theme.newsletter.enabled', event.target.checked)
              }
            />
            <span>Enable newsletter</span>
          </label>

          <label className="affiliate-design-field">
            <span>Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.newsletter?.title || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.newsletter.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.newsletter?.subtitle || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.newsletter.subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Input Placeholder</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.newsletter?.placeholder || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.newsletter.placeholder', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.newsletter?.button_label || ''}
              onChange={(event) =>
                onTextChange('grocery_theme.newsletter.button_label', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection title="Footer" description="Edit the footer contact and copyright text.">
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={grocery?.footer?.enabled !== false}
              onChange={(event) => onToggleChange('grocery_theme.footer.enabled', event.target.checked)}
            />
            <span>Enable footer</span>
          </label>

          <label className="affiliate-design-field">
            <span>About Text</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={grocery?.footer?.about_text || ''}
              onChange={(event) => onTextChange('grocery_theme.footer.about_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Phone</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.footer?.phone || ''}
              onChange={(event) => onTextChange('grocery_theme.footer.phone', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Email</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.footer?.email || ''}
              onChange={(event) => onTextChange('grocery_theme.footer.email', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Address</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.footer?.address || ''}
              onChange={(event) => onTextChange('grocery_theme.footer.address', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Copyright</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={grocery?.footer?.copyright || ''}
              onChange={(event) => onTextChange('grocery_theme.footer.copyright', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>
    </div>
  );
}