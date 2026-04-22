import BuilderSection from '../BuilderSection';
import ImageField from '../ImageField';

function getPromoItems(settings) {
  const items = settings?.xxam?.promo_banners?.items;
  if (Array.isArray(items) && items.length) {
    return items.slice(0, 2);
  }

  return [
    {
      title: 'Minimal Audio',
      subtitle: 'Clean design with premium sound',
      button_label: 'Shop Now',
      image_url: '',
      bg: '#f3f3f5',
    },
    {
      title: 'Smart Accessories',
      subtitle: 'Modern electronics for daily use',
      button_label: 'Explore',
      image_url: '',
      bg: '#f5f6fb',
    },
  ];
}

export default function XxamBuilder({
  settings,
  onTextChange,
  onToggleChange,
  onNumberChange,
  onImageUpload,
  uploadState,
}) {
  const xxam = settings?.xxam || {};
  const promoItems = getPromoItems(settings);

  return (
    <div className="affiliate-design-builder-stack">
      <BuilderSection
        title="Header"
        description="Edit the one full minimal header layout content."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field">
            <span>Logo Text</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.header?.logo_text || ''}
              onChange={(event) => onTextChange('xxam.header.logo_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Sign In Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.header?.sign_in_label || ''}
              onChange={(event) => onTextChange('xxam.header.sign_in_label', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Cart Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.header?.cart_label || ''}
              onChange={(event) => onTextChange('xxam.header.cart_label', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Cart Amount Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.header?.cart_amount_label || ''}
              onChange={(event) =>
                onTextChange('xxam.header.cart_amount_label', event.target.value)
              }
            />
          </label>

          {Array.from({ length: 6 }, (_, index) => (
            <label key={`xxam-nav-${index}`} className="affiliate-design-field">
              <span>Nav Link {index + 1}</span>
              <input
                className="affiliate-design-input"
                type="text"
                value={xxam?.header?.nav_links?.[index] || ''}
                onChange={(event) =>
                  onTextChange(`xxam.header.nav_links.${index}`, event.target.value)
                }
              />
            </label>
          ))}

          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.header?.show_search_icon !== false}
              onChange={(event) =>
                onToggleChange('xxam.header.show_search_icon', event.target.checked)
              }
            />
            <span>Show search icon</span>
          </label>

          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.header?.show_compare_icon !== false}
              onChange={(event) =>
                onToggleChange('xxam.header.show_compare_icon', event.target.checked)
              }
            />
            <span>Show compare icon</span>
          </label>

          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.header?.show_wishlist_icon !== false}
              onChange={(event) =>
                onToggleChange('xxam.header.show_wishlist_icon', event.target.checked)
              }
            />
            <span>Show wishlist icon</span>
          </label>

          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.header?.show_account_icon !== false}
              onChange={(event) =>
                onToggleChange('xxam.header.show_account_icon', event.target.checked)
              }
            />
            <span>Show account icon</span>
          </label>
        </div>

        <ImageField
          label="Logo Image"
          value={xxam?.header?.logo_image_url || ''}
          onUpload={(event) => onImageUpload(event, 'xxam.header.logo_image_url', 'xxam_logo')}
          uploading={!!uploadState?.xxam_logo}
        />
      </BuilderSection>

      <BuilderSection
        title="Theme Mode"
        description="Control the white and dark mode toggle."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.theme_mode?.enabled !== false}
              onChange={(event) =>
                onToggleChange('xxam.theme_mode.enabled', event.target.checked)
              }
            />
            <span>Enable theme toggle</span>
          </label>

          <label className="affiliate-design-field">
            <span>Default Mode</span>
            <select
              className="affiliate-design-input"
              value={xxam?.theme_mode?.default_mode || 'light'}
              onChange={(event) =>
                onTextChange('xxam.theme_mode.default_mode', event.target.value)
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
              value={xxam?.theme_mode?.light_label || ''}
              onChange={(event) => onTextChange('xxam.theme_mode.light_label', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Dark Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.theme_mode?.dark_label || ''}
              onChange={(event) => onTextChange('xxam.theme_mode.dark_label', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Hero Banner"
        description="Edit the large minimal electronics hero section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.hero?.enabled !== false}
              onChange={(event) => onToggleChange('xxam.hero.enabled', event.target.checked)}
            />
            <span>Enable hero banner</span>
          </label>

          <label className="affiliate-design-field">
            <span>Eyebrow</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.hero?.eyebrow || ''}
              onChange={(event) => onTextChange('xxam.hero.eyebrow', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.hero?.title || ''}
              onChange={(event) => onTextChange('xxam.hero.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Subtitle</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={xxam?.hero?.subtitle || ''}
              onChange={(event) => onTextChange('xxam.hero.subtitle', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Button Label</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.hero?.button_label || ''}
              onChange={(event) => onTextChange('xxam.hero.button_label', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Background Color</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.hero?.background_color || ''}
              onChange={(event) =>
                onTextChange('xxam.hero.background_color', event.target.value)
              }
              placeholder="#f3f3f5"
            />
          </label>

          <label className="affiliate-design-field">
            <span>Black Floating Badge</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.hero?.floating_black_badge || ''}
              onChange={(event) =>
                onTextChange('xxam.hero.floating_black_badge', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Green Floating Badge</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.hero?.floating_green_badge || ''}
              onChange={(event) =>
                onTextChange('xxam.hero.floating_green_badge', event.target.value)
              }
            />
          </label>
        </div>

        <ImageField
          label="Hero Image"
          value={xxam?.hero?.image_url || ''}
          onUpload={(event) => onImageUpload(event, 'xxam.hero.image_url', 'xxam_hero_image')}
          uploading={!!uploadState?.xxam_hero_image}
        />
      </BuilderSection>

      <BuilderSection
        title="Category Cards"
        description="Control the category card row under the hero."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.category_cards?.enabled !== false}
              onChange={(event) =>
                onToggleChange('xxam.category_cards.enabled', event.target.checked)
              }
            />
            <span>Enable category cards</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.category_cards?.title || ''}
              onChange={(event) => onTextChange('xxam.category_cards.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Category Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="8"
              value={xxam?.category_cards?.limit || 4}
              onChange={(event) =>
                onNumberChange('xxam.category_cards.limit', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Featured Products"
        description="Control the featured product section and max products per row."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.featured_products?.enabled !== false}
              onChange={(event) =>
                onToggleChange('xxam.featured_products.enabled', event.target.checked)
              }
            />
            <span>Enable featured products</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.featured_products?.title || ''}
              onChange={(event) =>
                onTextChange('xxam.featured_products.title', event.target.value)
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
              value={xxam?.featured_products?.limit || 8}
              onChange={(event) =>
                onNumberChange('xxam.featured_products.limit', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Max Products Per Row</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={xxam?.featured_products?.products_per_row || 4}
              onChange={(event) =>
                onNumberChange('xxam.featured_products.products_per_row', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.featured_products?.show_quick_view !== false}
              onChange={(event) =>
                onToggleChange('xxam.featured_products.show_quick_view', event.target.checked)
              }
            />
            <span>Enable quick view</span>
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Promo Banners"
        description="Edit the two minimal promo banners."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.promo_banners?.enabled !== false}
              onChange={(event) =>
                onToggleChange('xxam.promo_banners.enabled', event.target.checked)
              }
            />
            <span>Enable promo banners</span>
          </label>
        </div>

        {Array.from({ length: 2 }, (_, index) => {
          const item = promoItems[index] || {
            title: '',
            subtitle: '',
            button_label: '',
            image_url: '',
            bg: '',
          };

          return (
            <div key={`xxam-promo-${index}`} className="affiliate-design-subsection">
              <div className="affiliate-design-subsection-title">Promo Banner {index + 1}</div>

              <div className="affiliate-design-form-grid">
                <label className="affiliate-design-field">
                  <span>Title</span>
                  <input
                    className="affiliate-design-input"
                    type="text"
                    value={item.title || ''}
                    onChange={(event) =>
                      onTextChange(`xxam.promo_banners.items.${index}.title`, event.target.value)
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
                        `xxam.promo_banners.items.${index}.subtitle`,
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
                        `xxam.promo_banners.items.${index}.button_label`,
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
                      onTextChange(`xxam.promo_banners.items.${index}.bg`, event.target.value)
                    }
                    placeholder="#f3f3f5"
                  />
                </label>
              </div>

              <ImageField
                label={`Promo Banner ${index + 1} Image`}
                value={item.image_url || ''}
                onUpload={(event) =>
                  onImageUpload(
                    event,
                    `xxam.promo_banners.items.${index}.image_url`,
                    `xxam_promo_banner_${index + 1}`
                  )
                }
                uploading={!!uploadState?.[`xxam_promo_banner_${index + 1}`]}
              />
            </div>
          );
        })}
      </BuilderSection>

      <BuilderSection
        title="Testimonials"
        description="Edit the testimonial content section."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.testimonials?.enabled !== false}
              onChange={(event) =>
                onToggleChange('xxam.testimonials.enabled', event.target.checked)
              }
            />
            <span>Enable testimonials</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.testimonials?.title || ''}
              onChange={(event) => onTextChange('xxam.testimonials.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Name</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.testimonials?.item_one_name || ''}
              onChange={(event) =>
                onTextChange('xxam.testimonials.item_one_name', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Quote</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={xxam?.testimonials?.item_one_quote || ''}
              onChange={(event) =>
                onTextChange('xxam.testimonials.item_one_quote', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Name</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.testimonials?.item_two_name || ''}
              onChange={(event) =>
                onTextChange('xxam.testimonials.item_two_name', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Quote</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={xxam?.testimonials?.item_two_quote || ''}
              onChange={(event) =>
                onTextChange('xxam.testimonials.item_two_quote', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Name</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.testimonials?.item_three_name || ''}
              onChange={(event) =>
                onTextChange('xxam.testimonials.item_three_name', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Quote</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={xxam?.testimonials?.item_three_quote || ''}
              onChange={(event) =>
                onTextChange('xxam.testimonials.item_three_quote', event.target.value)
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
              checked={xxam?.news?.enabled !== false}
              onChange={(event) => onToggleChange('xxam.news.enabled', event.target.checked)}
            />
            <span>Enable latest articles</span>
          </label>

          <label className="affiliate-design-field">
            <span>Section Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.news?.title || ''}
              onChange={(event) => onTextChange('xxam.news.title', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Article Limit</span>
            <input
              className="affiliate-design-input"
              type="number"
              min="1"
              max="6"
              value={xxam?.news?.limit || 3}
              onChange={(event) => onNumberChange('xxam.news.limit', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Services Strip"
        description="Edit the service cards shown before the footer."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.services_strip?.enabled !== false}
              onChange={(event) =>
                onToggleChange('xxam.services_strip.enabled', event.target.checked)
              }
            />
            <span>Enable services strip</span>
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_one_title || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_one_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 1 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_one_subtitle || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_one_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_two_title || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_two_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 2 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_two_subtitle || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_two_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_three_title || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_three_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 3 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_three_subtitle || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_three_subtitle', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Title</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_four_title || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_four_title', event.target.value)
              }
            />
          </label>

          <label className="affiliate-design-field">
            <span>Item 4 Subtitle</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.services_strip?.item_four_subtitle || ''}
              onChange={(event) =>
                onTextChange('xxam.services_strip.item_four_subtitle', event.target.value)
              }
            />
          </label>
        </div>
      </BuilderSection>

      <BuilderSection
        title="Footer"
        description="Edit the footer details."
      >
        <div className="affiliate-design-form-grid">
          <label className="affiliate-design-field checkbox">
            <input
              type="checkbox"
              checked={xxam?.footer?.enabled !== false}
              onChange={(event) => onToggleChange('xxam.footer.enabled', event.target.checked)}
            />
            <span>Enable footer</span>
          </label>

          <label className="affiliate-design-field">
            <span>About Text</span>
            <textarea
              className="affiliate-design-textarea"
              rows="4"
              value={xxam?.footer?.about_text || ''}
              onChange={(event) => onTextChange('xxam.footer.about_text', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Phone</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.footer?.phone || ''}
              onChange={(event) => onTextChange('xxam.footer.phone', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Email</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.footer?.email || ''}
              onChange={(event) => onTextChange('xxam.footer.email', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Address</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.footer?.address || ''}
              onChange={(event) => onTextChange('xxam.footer.address', event.target.value)}
            />
          </label>

          <label className="affiliate-design-field">
            <span>Copyright</span>
            <input
              className="affiliate-design-input"
              type="text"
              value={xxam?.footer?.copyright || ''}
              onChange={(event) => onTextChange('xxam.footer.copyright', event.target.value)}
            />
          </label>
        </div>
      </BuilderSection>
    </div>
  );
}