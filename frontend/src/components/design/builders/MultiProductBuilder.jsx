import BuilderSection from '../BuilderSection';
import ImageField from '../ImageField';

function getSlides(settings) {
  const slides = settings?.multi_product?.hero_slider?.slides;
  if (Array.isArray(slides) && slides.length) {
    return slides.slice(0, 5);
  }

  return [
    {
      id: 'multi-slide-1',
      eyebrow: 'Best multi-store deals',
      title: 'The best home and accessories',
      subtitle:
        'Shop premium electronics, fashion, home appliances and accessories from one clean storefront.',
      button_label: 'Shop Now',
      secondary_button_label: 'Explore Deals',
      image_url: '',
      badge: 'Daily Deal',
      accent: '#f2f3f7',
      text_color: '#0f172a',
    },
    {
      id: 'multi-slide-2',
      eyebrow: 'Premium picks',
      title: 'Trending products for every room',
      subtitle:
        'Get sharp product visuals, smart categories, and premium multi-product shopping sections.',
      button_label: 'Shop Now',
      secondary_button_label: 'View Offers',
      image_url: '',
      badge: 'Top Rated',
      accent: '#edf3ff',
      text_color: '#0f172a',
    },
    {
      id: 'multi-slide-3',
      eyebrow: 'New arrivals',
      title: 'Simple shopping with big value',
      subtitle:
        'Give your storefront the full multi-product structure with banners, tabs, icons and cards.',
      button_label: 'Shop Now',
      secondary_button_label: 'Read More',
      image_url: '',
      badge: 'Fresh Drop',
      accent: '#f5f7ec',
      text_color: '#0f172a',
    },
  ];
}

function getPromoTiles(settings) {
  const items = settings?.multi_product?.promo_tiles?.items;
  if (Array.isArray(items) && items.length) {
    return items.slice(0, 3);
  }

  return [
    {
      title: 'Free Delivery',
      subtitle: 'For eligible orders',
      button_label: 'More Info',
      image_url: '',
      bg: '#f4f7ff',
    },
    {
      title: 'Latest Gadgets',
      subtitle: 'Shop smart devices',
      button_label: 'See Deals',
      image_url: '',
      bg: '#fff8eb',
    },
    {
      title: 'Top Fashion Picks',
      subtitle: 'Sharp daily offers',
      button_label: 'Browse',
      image_url: '',
      bg: '#eef9f2',
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

export default function MultiProductBuilder({
  settings,
  onTextChange,
  onToggleChange,
  onNumberChange,
  onImageUpload,
  uploadState,
}) {
  const multi = settings?.multi_product || {};
  const slides = getSlides(settings);
  const promoTiles = getPromoTiles(settings);

  return (
    <div className="affiliate-design-builder-stack">
      <BuilderSection
        title="Announcement Bar"
        description="Edit the top message bar above the header."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.announcement_bar?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.announcement_bar.enabled', event.target.checked)
              }
            />
            <span>Enable announcement bar</span>
          </label>

          <label className="affiliate-design-field">
            <span>Left Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.announcement_bar?.left_text || ''}
              onChange={(event) =>
                onTextChange('multi_product.announcement_bar.left_text', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Center Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.announcement_bar?.center_text || ''}
              onChange={(event) =>
                onTextChange('multi_product.announcement_bar.center_text', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Right Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.announcement_bar?.right_text || ''}
              onChange={(event) =>
                onTextChange('multi_product.announcement_bar.right_text', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Header"
        description="Edit search area, support text, deal label, and logo."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span>Logo Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.header?.logo_text || ''}
              onChange={(event) => onTextChange('multi_product.header.logo_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Search Placeholder</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.header?.search_placeholder || ''}
              onChange={(event) =>
                onTextChange('multi_product.header.search_placeholder', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Account Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.header?.account_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.header.account_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Cart Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.header?.cart_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.header.cart_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Support Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.header?.support_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.header.support_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Categories Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.header?.categories_button_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.header.categories_button_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Deals Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.header?.deals_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.header.deals_label', event.target.value)
              }
            />
          </label>
        </div>

        <ImageField
          label="Logo Image"
          value={multi?.header?.logo_image_url || ''}
          onUpload={(event) =>
            onImageUpload(event, 'multi_product.header.logo_image_url', 'multi_logo')
          }
          uploading={!!uploadState?.multi_logo}
        />
      </BuilderSection>

      <BuilderSection
        title="Hero Slider"
        description="This template supports up to 5 hero slides."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.hero_slider?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.hero_slider.enabled', event.target.checked)
              }
            />
            <span>Enable hero slider</span>
          </label>

          <label className="affiliate-design-field">
            <span>Products Per Row</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={multi?.hero_slider?.products_per_row || 1}
              onChange={(event) =>
                onNumberChange('multi_product.hero_slider.products_per_row', event.target.value)
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
              value={multi?.hero_slider?.total_products || 3}
              onChange={(event) =>
                onNumberChange('multi_product.hero_slider.total_products', event.target.value)
              }
            />
          </label>
        </div>

        {Array.from({ length: 5 }, (_, index) => {
          const slide = slides[index] || {
            id: `multi-slide-${index + 1}`,
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
                      onTextChange(
                        `multi_product.hero_slider.slides.${index}.eyebrow`,
                        event.target.value
                      )
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
                      onTextChange(
                        `multi_product.hero_slider.slides.${index}.title`,
                        event.target.value
                      )
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
                        `multi_product.hero_slider.slides.${index}.subtitle`,
                        event.target.value
                      )
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
                      onTextChange(
                        `multi_product.hero_slider.slides.${index}.button_label`,
                        event.target.value
                      )
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
                        `multi_product.hero_slider.slides.${index}.secondary_button_label`,
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
                      onTextChange(
                        `multi_product.hero_slider.slides.${index}.badge`,
                        event.target.value
                      )
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
                      onTextChange(
                        `multi_product.hero_slider.slides.${index}.accent`,
                        event.target.value
                      )
                    }
                    placeholder="#f2f3f7"
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
                        `multi_product.hero_slider.slides.${index}.text_color`,
                        event.target.value
                      )
                    }
                    placeholder="#0f172a"
                  />
                </label>
              </div>

              <ImageField
                label={`Slide ${index + 1} Image`}
                value={slide.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `multi_product.hero_slider.slides.${index}.image_url`,
                    `multi_slide_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`multi_slide_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection
        title="Right Hero Banner"
        description="Edit the right promo banner beside the hero slider."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.hero_banner?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.hero_banner.enabled', event.target.checked)
              }
            />
            <span>Enable hero banner</span>
          </label>

          <label className="affiliate-design-field">
            <span>Eyebrow</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.hero_banner?.eyebrow || ''}
              onChange={(event) =>
                onTextChange('multi_product.hero_banner.eyebrow', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.hero_banner?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.hero_banner.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.hero_banner?.subtitle || ''}
              onChange={(event) =>
                onTextChange('multi_product.hero_banner.subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.hero_banner?.button_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.hero_banner.button_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Background Color</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.hero_banner?.bg || ''}
              onChange={(event) =>
                onTextChange('multi_product.hero_banner.bg', event.target.value)
              }
              placeholder="#ffe9d8"
            />
          </label>
        </div>

        <ImageField
          label="Hero Banner Image"
          value={multi?.hero_banner?.image_url || ''}
          onUpload={(event) =>
            onImageUpload(event, 'multi_product.hero_banner.image_url', 'multi_hero_banner')
          }
          uploading={!!uploadState?.multi_hero_banner}
        />
      </BuilderSection>

      <BuilderSection
        title="Services Strip"
        description="Edit the 4 support/service blocks."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.services_strip?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.services_strip.enabled', event.target.checked)
              }
            />
            <span>Enable services strip</span>
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_one_title || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_one_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_one_subtitle || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_one_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_two_title || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_two_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_two_subtitle || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_two_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_three_title || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_three_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_three_subtitle || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_three_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_four_title || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_four_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.services_strip?.item_four_subtitle || ''}
              onChange={(event) =>
                onTextChange('multi_product.services_strip.item_four_subtitle', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Top Categories"
        description="Control category count and how many show per row."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.top_categories?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.top_categories.enabled', event.target.checked)
              }
            />
            <span>Enable top categories</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.top_categories?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.top_categories.title', event.target.value)
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
              value={multi?.top_categories?.limit || 8}
              onChange={(event) =>
                onNumberChange('multi_product.top_categories.limit', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Items Per Row</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="8"
              value={multi?.top_categories?.products_per_row || 8}
              onChange={(event) =>
                onNumberChange('multi_product.top_categories.products_per_row', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Featured Products"
        description="Control title, tabs, total products, and products per row."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.featured_products?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.featured_products.enabled', event.target.checked)
              }
            />
            <span>Enable featured products</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.featured_products?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.featured_products.title', event.target.value)
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
              value={multi?.featured_products?.limit || 8}
              onChange={(event) =>
                onNumberChange('multi_product.featured_products.limit', event.target.value)
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
              value={multi?.featured_products?.products_per_row || 4}
              onChange={(event) =>
                onNumberChange(
                  'multi_product.featured_products.products_per_row',
                  event.target.value
                )
              }
            />
          </label>
        </div>

        <TabFields
          label="Tab"
          values={multi?.featured_products?.tabs || []}
          basePath="multi_product.featured_products.tabs"
          onTextChange={onTextChange}
        />
      </BuilderSection>

      <BuilderSection
        title="Promo Tiles"
        description="Edit the 3 promo cards below featured products."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.promo_tiles?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.promo_tiles.enabled', event.target.checked)
              }
            />
            <span>Enable promo tiles</span>
          </label>
        </div>

        {Array.from({ length: 3 }, (_, index) => {
          const item = promoTiles[index] || {
            title: '',
            subtitle: '',
            button_label: '',
            image_url: '',
            bg: '',
          };

          return (
            <div key={`promo-tile-${index}`} className="affiliate-design-subsection">
              <div className="affiliate-design-subsection-title">Promo Tile {index + 1}</div>

              <div className="affiliate-design-form-grid">
                <label className="affiliate-design-field">
                  <span>Title</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={item.title || ''}
                    onChange={(event) =>
                      onTextChange(
                        `multi_product.promo_tiles.items.${index}.title`,
                        event.target.value
                      )
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
                        `multi_product.promo_tiles.items.${index}.subtitle`,
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
                        `multi_product.promo_tiles.items.${index}.button_label`,
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
                      onTextChange(
                        `multi_product.promo_tiles.items.${index}.bg`,
                        event.target.value
                      )
                    }
                    placeholder="#f4f7ff"
                  />
                </label>
              </div>

              <ImageField
                label={`Promo Tile ${index + 1} Image`}
                value={item.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `multi_product.promo_tiles.items.${index}.image_url`,
                    `multi_promo_tile_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`multi_promo_tile_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection
        title="Best Sellers"
        description="Control best sellers count and row layout."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.best_sellers?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.best_sellers.enabled', event.target.checked)
              }
            />
            <span>Enable best sellers</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.best_sellers?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.best_sellers.title', event.target.value)
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
              value={multi?.best_sellers?.limit || 6}
              onChange={(event) =>
                onNumberChange('multi_product.best_sellers.limit', event.target.value)
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
              value={multi?.best_sellers?.products_per_row || 3}
              onChange={(event) =>
                onNumberChange(
                  'multi_product.best_sellers.products_per_row',
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Deal Banner"
        description="Edit the large full-width promo banner."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.deal_banner?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.deal_banner.enabled', event.target.checked)
              }
            />
            <span>Enable deal banner</span>
          </label>

          <label className="affiliate-design-field">
            <span>Eyebrow</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.deal_banner?.eyebrow || ''}
              onChange={(event) =>
                onTextChange('multi_product.deal_banner.eyebrow', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.deal_banner?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.deal_banner.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.deal_banner?.subtitle || ''}
              onChange={(event) =>
                onTextChange('multi_product.deal_banner.subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.deal_banner?.button_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.deal_banner.button_label', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Background Color</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.deal_banner?.bg || ''}
              onChange={(event) =>
                onTextChange('multi_product.deal_banner.bg', event.target.value)
              }
              placeholder="#101828"
            />
          </label>
        </div>

        <ImageField
          label="Deal Banner Image"
          value={multi?.deal_banner?.image_url || ''}
          onUpload={(event) =>
            onImageUpload(event, 'multi_product.deal_banner.image_url', 'multi_deal_banner')
          }
          uploading={!!uploadState?.multi_deal_banner}
        />
      </BuilderSection>

      <BuilderSection
        title="Latest Products"
        description="Control latest products count and row layout."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.latest_products?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.latest_products.enabled', event.target.checked)
              }
            />
            <span>Enable latest products</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.latest_products?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.latest_products.title', event.target.value)
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
              value={multi?.latest_products?.limit || 8}
              onChange={(event) =>
                onNumberChange('multi_product.latest_products.limit', event.target.value)
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
              value={multi?.latest_products?.products_per_row || 4}
              onChange={(event) =>
                onNumberChange(
                  'multi_product.latest_products.products_per_row',
                  event.target.value
                )
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Latest Articles"
        description="Control the article section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.news?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.news.enabled', event.target.checked)
              }
            />
            <span>Enable article section</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.news?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.news.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Article Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={multi?.news?.limit || 3}
              onChange={(event) =>
                onNumberChange('multi_product.news.limit', event.target.value)
              }
            />
          </label>
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
              checked={multi?.newsletter?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.newsletter.enabled', event.target.checked)
              }
            />
            <span>Enable newsletter</span>
          </label>

          <label className="affiliate-design-field">
            <span>Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.newsletter?.title || ''}
              onChange={(event) =>
                onTextChange('multi_product.newsletter.title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.newsletter?.subtitle || ''}
              onChange={(event) =>
                onTextChange('multi_product.newsletter.subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Input Placeholder</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.newsletter?.placeholder || ''}
              onChange={(event) =>
                onTextChange('multi_product.newsletter.placeholder', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.newsletter?.button_label || ''}
              onChange={(event) =>
                onTextChange('multi_product.newsletter.button_label', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Footer"
        description="Edit footer contact and copyright details."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={multi?.footer?.enabled !== false}
              onChange={(event) =>
                onToggleChange('multi_product.footer.enabled', event.target.checked)
              }
            />
            <span>Enable footer</span>
          </label>

          <label className="affiliate-design-field">
            <span>About Text</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={multi?.footer?.about_text || ''}
              onChange={(event) =>
                onTextChange('multi_product.footer.about_text', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Phone</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.footer?.phone || ''}
              onChange={(event) =>
                onTextChange('multi_product.footer.phone', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Email</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.footer?.email || ''}
              onChange={(event) =>
                onTextChange('multi_product.footer.email', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Address</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.footer?.address || ''}
              onChange={(event) =>
                onTextChange('multi_product.footer.address', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Copyright</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={multi?.footer?.copyright || ''}
              onChange={(event) =>
                onTextChange('multi_product.footer.copyright', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>
    </div>
  );
}