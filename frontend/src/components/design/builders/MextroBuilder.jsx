import BuilderSection from '../BuilderSection';
import ImageField from '../ImageField';

function getSlides(settings) {
  const slides = settings?.mextro?.hero_slider?.slides;
  if (Array.isArray(slides) && slides.length) {
    return slides.slice(0, 5);
  }

  return [
    {
      id: 'mextro-slide-1',
      eyebrow: 'Catch Big Deals',
      title: 'Home Speakers',
      subtitle: 'Enjoy room-filling sound with premium electronics and weekly offers.',
      button_label: 'Shop Now',
      image_url: '',
      badge: 'Starting at $99',
      accent: '#fed700',
      text_color: '#111111',
    },
    {
      id: 'mextro-slide-2',
      eyebrow: 'Best Seller',
      title: 'Smart Gadgets',
      subtitle: 'Upgrade your home, office and lifestyle with sharper electronics.',
      button_label: 'Shop Now',
      image_url: '',
      badge: 'Hot Offer',
      accent: '#fed700',
      text_color: '#111111',
    },
    {
      id: 'mextro-slide-3',
      eyebrow: 'New Arrival',
      title: 'Laptops & Accessories',
      subtitle: 'Discover practical devices and accessories with strong value.',
      button_label: 'Shop Now',
      image_url: '',
      badge: 'Daily Deal',
      accent: '#fed700',
      text_color: '#111111',
    },
  ];
}

function getPromoBanners(settings) {
  const items = settings?.mextro?.promo_banners?.items;
  if (Array.isArray(items) && items.length) {
    return items.slice(0, 3);
  }

  return [
    {
      title: 'Catch Big Deals',
      subtitle: 'On cameras and photography',
      button_label: 'Shop Now',
      image_url: '',
      bg: '#f7f7f7',
    },
    {
      title: 'Tablets & iPads',
      subtitle: 'Latest performance picks',
      button_label: 'Shop Now',
      image_url: '',
      bg: '#f5f5f5',
    },
    {
      title: 'Smart Speakers',
      subtitle: 'Premium audio offers',
      button_label: 'Shop Now',
      image_url: '',
      bg: '#f8f8f8',
    },
  ];
}

export default function MextroBuilder({
  settings,
  onTextChange,
  onToggleChange,
  onNumberChange,
  onImageUpload,
  uploadState,
}) {
  const mextro = settings?.mextro || {};
  const slides = getSlides(settings);
  const promoBanners = getPromoBanners(settings);

  return (
    <div className="affiliate-design-builder-stack">
      <BuilderSection
        title="Top Strip"
        description="Edit the top strip above the header."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.top_strip?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.top_strip.enabled', event.target.checked)
              }
            />
            <span>Enable top strip</span>
          </label>

          <label className="affiliate-design-field">
            <span>Message</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.top_strip?.message || ''}
              onChange={(event) =>
                onTextChange('mextro.top_strip.message', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Header"
        description="Edit logo, search, account, cart and nav support labels."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span>Logo Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.header?.logo_text || ''}
              onChange={(event) => onTextChange('mextro.header.logo_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Search Placeholder</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.header?.search_placeholder || ''}
              onChange={(event) =>
                onTextChange('mextro.header.search_placeholder', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Categories Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.header?.categories_button_label || ''}
              onChange={(event) =>
                onTextChange('mextro.header.categories_button_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Account Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.header?.account_label || ''}
              onChange={(event) =>
                onTextChange('mextro.header.account_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Cart Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.header?.cart_label || ''}
              onChange={(event) =>
                onTextChange('mextro.header.cart_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Track Order Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.header?.track_order_label || ''}
              onChange={(event) =>
                onTextChange('mextro.header.track_order_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Support Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.header?.support_label || ''}
              onChange={(event) =>
                onTextChange('mextro.header.support_label', event.target.value)
              }
            />
          </label>
        </div>

        <ImageField
          label="Logo Image"
          value={mextro?.header?.logo_image_url || ''}
          onUpload={(event) =>
            onImageUpload(event, 'mextro.header.logo_image_url', 'mextro_logo')
          }
          uploading={!!uploadState?.mextro_logo}
        />
      </BuilderSection>

      <BuilderSection
        title="Theme Mode Toggle"
        description="Control the frontend white and dark toggle labels and default mode."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.theme_mode?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.theme_mode.enabled', event.target.checked)
              }
            />
            <span>Enable white and dark toggle</span>
          </label>

          <label className="affiliate-design-field">
            <span>Default Mode</span>
            <select
              className="affiliate-design-input"
              value={mextro?.theme_mode?.default_mode || 'light'}
              onChange={(event) =>
                onTextChange('mextro.theme_mode.default_mode', event.target.value)
              }
            >
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </label>

          <label className="affiliate-design-field">
            <span>Light Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.theme_mode?.light_label || ''}
              onChange={(event) =>
                onTextChange('mextro.theme_mode.light_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Dark Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.theme_mode?.dark_label || ''}
              onChange={(event) =>
                onTextChange('mextro.theme_mode.dark_label', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Hero Slider"
        description="Edit the main hero slider content and images."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.hero_slider?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.hero_slider.enabled', event.target.checked)
              }
            />
            <span>Enable hero slider</span>
          </label>
        </div>

        {Array.from({ length: 5 }, (_, index) => {
          const slide = slides[index] || {
            id: `mextro-slide-${index + 1}`,
            eyebrow: '',
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
                  <span>Eyebrow</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.eyebrow || ''}
                    onChange={(event) =>
                      onTextChange(`mextro.hero_slider.slides.${index}.eyebrow`, event.target.value)
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
                      onTextChange(`mextro.hero_slider.slides.${index}.title`, event.target.value)
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
                      onTextChange(
                        `mextro.hero_slider.slides.${index}.subtitle`,
                        event.target.value
                      )
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
                      onTextChange(
                        `mextro.hero_slider.slides.${index}.button_label`,
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
                      onTextChange(`mextro.hero_slider.slides.${index}.badge`, event.target.value)
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
                      onTextChange(`mextro.hero_slider.slides.${index}.accent`, event.target.value)
                    }
                    placeholder="#fed700"
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Text Color</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={slide.text_color || ''}
                    onChange={(event) =>
                      onTextChange(
                        `mextro.hero_slider.slides.${index}.text_color`,
                        event.target.value
                      )
                    }
                    placeholder="#111111"
                  />
                </label>
              </div>

              <ImageField
                label={`Slide ${index + 1} Image`}
                value={slide.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `mextro.hero_slider.slides.${index}.image_url`,
                    `mextro_slide_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`mextro_slide_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection
        title="Hero Side Banner"
        description="Edit the right-side hero banner."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.hero_side_banner?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.hero_side_banner.enabled', event.target.checked)
              }
            />
            <span>Enable hero side banner</span>
          </label>

          <label className="affiliate-design-field">
            <span>Eyebrow</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.hero_side_banner?.eyebrow || ''}
              onChange={(event) =>
                onTextChange('mextro.hero_side_banner.eyebrow', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.hero_side_banner?.title || ''}
              onChange={(event) =>
                onTextChange('mextro.hero_side_banner.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.hero_side_banner?.subtitle || ''}
              onChange={(event) =>
                onTextChange('mextro.hero_side_banner.subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.hero_side_banner?.button_label || ''}
              onChange={(event) =>
                onTextChange('mextro.hero_side_banner.button_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Background Color</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.hero_side_banner?.bg || ''}
              onChange={(event) =>
                onTextChange('mextro.hero_side_banner.bg', event.target.value)
              }
              placeholder="#f5f1e9"
            />
          </label>
        </div>

        <ImageField
          label="Hero Side Banner Image"
          value={mextro?.hero_side_banner?.image_url || ''}
          onUpload={(event) =>
            onImageUpload(
              event,
              'mextro.hero_side_banner.image_url',
              'mextro_hero_side_banner'
            )
          }
          uploading={!!uploadState?.mextro_hero_side_banner}
        />
      </BuilderSection>

      <BuilderSection
        title="Category Icons"
        description="Control the centered icon category row."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.category_icons?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.category_icons.enabled', event.target.checked)
              }
            />
            <span>Enable category icons</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.category_icons?.title || ''}
              onChange={(event) =>
                onTextChange('mextro.category_icons.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Category Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="12"
              value={mextro?.category_icons?.limit || 8}
              onChange={(event) =>
                onNumberChange('mextro.category_icons.limit', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Promo Banners"
        description="Edit the 3 promo banners below the category icons."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.promo_banners?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.promo_banners.enabled', event.target.checked)
              }
            />
            <span>Enable promo banners</span>
          </label>
        </div>

        {Array.from({ length: 3 }, (_, index) => {
          const item = promoBanners[index] || {
            title: '',
            subtitle: '',
            button_label: '',
            image_url: '',
            bg: '',
          };

          return (
            <div key={`mextro-promo-banner-${index}`} className="affiliate-design-subsection">
              <div className="affiliate-design-subsection-title">Promo Banner {index + 1}</div>

              <div className="affiliate-design-form-grid">
                <label className="affiliate-design-field">
                  <span>Title</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={item.title || ''}
                    onChange={(event) =>
                      onTextChange(`mextro.promo_banners.items.${index}.title`, event.target.value)
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Subtitle</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={item.subtitle || ''}
                    onChange={(event) =>
                      onTextChange(
                        `mextro.promo_banners.items.${index}.subtitle`,
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Button Label</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={item.button_label || ''}
                    onChange={(event) =>
                      onTextChange(
                        `mextro.promo_banners.items.${index}.button_label`,
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="affiliate-design-field">
                  <span>Background Color</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={item.bg || ''}
                    onChange={(event) =>
                      onTextChange(`mextro.promo_banners.items.${index}.bg`, event.target.value)
                    }
                    placeholder="#f7f7f7"
                  />
                </label>
              </div>

              <ImageField
                label={`Promo Banner ${index + 1} Image`}
                value={item.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `mextro.promo_banners.items.${index}.image_url`,
                    `mextro_promo_banner_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`mextro_promo_banner_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection
        title="Featured Products"
        description="Control the handpicked products section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.featured_products?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.featured_products.enabled', event.target.checked)
              }
            />
            <span>Enable featured products</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.featured_products?.title || ''}
              onChange={(event) =>
                onTextChange('mextro.featured_products.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Total Products</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="15"
              value={mextro?.featured_products?.limit || 8}
              onChange={(event) =>
                onNumberChange('mextro.featured_products.limit', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Products Per Row</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={mextro?.featured_products?.products_per_row || 4}
              onChange={(event) =>
                onNumberChange(
                  'mextro.featured_products.products_per_row',
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Dark Promo Row"
        description="Edit the 2 dark promotional banners."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.dark_promos?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.dark_promos.enabled', event.target.checked)
              }
            />
            <span>Enable dark promo row</span>
          </label>

          <label className="affiliate-design-field">
            <span>Left Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.dark_promos?.left_title || ''}
              onChange={(event) =>
                onTextChange('mextro.dark_promos.left_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Left Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.dark_promos?.left_subtitle || ''}
              onChange={(event) =>
                onTextChange('mextro.dark_promos.left_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Left Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.dark_promos?.left_button_label || ''}
              onChange={(event) =>
                onTextChange('mextro.dark_promos.left_button_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Right Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.dark_promos?.right_title || ''}
              onChange={(event) =>
                onTextChange('mextro.dark_promos.right_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Right Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.dark_promos?.right_subtitle || ''}
              onChange={(event) =>
                onTextChange('mextro.dark_promos.right_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Right Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.dark_promos?.right_button_label || ''}
              onChange={(event) =>
                onTextChange('mextro.dark_promos.right_button_label', event.target.value)
              }
            />
          </label>
        </div>

        <ImageField
          label="Left Dark Promo Image"
          value={mextro?.dark_promos?.left_image_url || ''}
          onUpload={(event) =>
            onImageUpload(event, 'mextro.dark_promos.left_image_url', 'mextro_dark_promo_left')
          }
          uploading={!!uploadState?.mextro_dark_promo_left}
        />

        <ImageField
          label="Right Dark Promo Image"
          value={mextro?.dark_promos?.right_image_url || ''}
          onUpload={(event) =>
            onImageUpload(event, 'mextro.dark_promos.right_image_url', 'mextro_dark_promo_right')
          }
          uploading={!!uploadState?.mextro_dark_promo_right}
        />
      </BuilderSection>

      <BuilderSection
        title="Brand Row"
        description="Edit the brand/logo row text placeholders."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.brand_row?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.brand_row.enabled', event.target.checked)
              }
            />
            <span>Enable brand row</span>
          </label>

          {Array.from({ length: 6 }, (_, index) => (
            <label key={`mextro-brand-${index}`} className="affiliate-design-field">
              <span>Brand {index + 1}</span>
              <input
                className="affiliate-design-input"
                type="text"
                value={mextro?.brand_row?.titles?.[index] || ''}
                onChange={(event) =>
                  onTextChange(`mextro.brand_row.titles.${index}`, event.target.value)
                }
              />
            </label>
          ))}
        </div>
      </BuilderSection>

      <BuilderSection
        title="Recent Posts"
        description="Control the news/blog section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.news?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.news.enabled', event.target.checked)
              }
            />
            <span>Enable recent posts</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.news?.title || ''}
              onChange={(event) =>
                onTextChange('mextro.news.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Post Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={mextro?.news?.limit || 3}
              onChange={(event) =>
                onNumberChange('mextro.news.limit', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Footer"
        description="Edit the footer contact and copyright details."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={mextro?.footer?.enabled !== false}
              onChange={(event) =>
                onToggleChange('mextro.footer.enabled', event.target.checked)
              }
            />
            <span>Enable footer</span>
          </label>

          <label className="affiliate-design-field">
            <span>About Text</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={mextro?.footer?.about_text || ''}
              onChange={(event) =>
                onTextChange('mextro.footer.about_text', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Phone</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.footer?.phone || ''}
              onChange={(event) =>
                onTextChange('mextro.footer.phone', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Email</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.footer?.email || ''}
              onChange={(event) =>
                onTextChange('mextro.footer.email', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Address</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.footer?.address || ''}
              onChange={(event) =>
                onTextChange('mextro.footer.address', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Copyright</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={mextro?.footer?.copyright || ''}
              onChange={(event) =>
                onTextChange('mextro.footer.copyright', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>
    </div>
  );
}