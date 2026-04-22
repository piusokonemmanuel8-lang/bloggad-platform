const { buildDefaultTemplateSettingsJson } = require('./designDefaults');
const { normalizeNullable, normalizeInteger, parseJsonSafe } = require('./designUtils');

function sanitizeTemplateSettingsJson(rawValue) {
  const parsed = parseJsonSafe(rawValue, {});
  const defaults = buildDefaultTemplateSettingsJson();

  const premiumBrand = {
    ...defaults.premium_brand,
    ...(parsed.premium_brand || {}),
    top_header: {
      ...defaults.premium_brand.top_header,
      ...((parsed.premium_brand && parsed.premium_brand.top_header) || {}),
    },
    hero_slider: {
      ...defaults.premium_brand.hero_slider,
      ...((parsed.premium_brand && parsed.premium_brand.hero_slider) || {}),
    },
    promo_block_main: {
      ...defaults.premium_brand.promo_block_main,
      ...((parsed.premium_brand && parsed.premium_brand.promo_block_main) || {}),
    },
    promo_block_small_1: {
      ...defaults.premium_brand.promo_block_small_1,
      ...((parsed.premium_brand && parsed.premium_brand.promo_block_small_1) || {}),
    },
    promo_block_small_2: {
      ...defaults.premium_brand.promo_block_small_2,
      ...((parsed.premium_brand && parsed.premium_brand.promo_block_small_2) || {}),
    },
    sections: {
      ...defaults.premium_brand.sections,
      ...((parsed.premium_brand && parsed.premium_brand.sections) || {}),
    },
    limits: {
      ...defaults.premium_brand.limits,
      ...((parsed.premium_brand && parsed.premium_brand.limits) || {}),
    },
  };

  const megaElectronics = {
    ...defaults.mega_electronics,
    ...(parsed.mega_electronics || {}),
    top_header: {
      ...defaults.mega_electronics.top_header,
      ...((parsed.mega_electronics && parsed.mega_electronics.top_header) || {}),
    },
    hero_slider: {
      ...defaults.mega_electronics.hero_slider,
      ...((parsed.mega_electronics && parsed.mega_electronics.hero_slider) || {}),
    },
    promo_block_main: {
      ...defaults.mega_electronics.promo_block_main,
      ...((parsed.mega_electronics && parsed.mega_electronics.promo_block_main) || {}),
    },
    promo_block_small_1: {
      ...defaults.mega_electronics.promo_block_small_1,
      ...((parsed.mega_electronics && parsed.mega_electronics.promo_block_small_1) || {}),
    },
    promo_block_small_2: {
      ...defaults.mega_electronics.promo_block_small_2,
      ...((parsed.mega_electronics && parsed.mega_electronics.promo_block_small_2) || {}),
    },
    sections: {
      ...defaults.mega_electronics.sections,
      ...((parsed.mega_electronics && parsed.mega_electronics.sections) || {}),
    },
    limits: {
      ...defaults.mega_electronics.limits,
      ...((parsed.mega_electronics && parsed.mega_electronics.limits) || {}),
    },
  };

  const supplementTheme = {
    ...defaults.supplement_theme,
    ...(parsed.supplement_theme || {}),
    top_strip: {
      ...defaults.supplement_theme.top_strip,
      ...((parsed.supplement_theme && parsed.supplement_theme.top_strip) || {}),
    },
    header: {
      ...defaults.supplement_theme.header,
      ...((parsed.supplement_theme && parsed.supplement_theme.header) || {}),
    },
    hero: {
      ...defaults.supplement_theme.hero,
      ...((parsed.supplement_theme && parsed.supplement_theme.hero) || {}),
    },
    hero_promo_one: {
      ...defaults.supplement_theme.hero_promo_one,
      ...((parsed.supplement_theme && parsed.supplement_theme.hero_promo_one) || {}),
    },
    hero_promo_two: {
      ...defaults.supplement_theme.hero_promo_two,
      ...((parsed.supplement_theme && parsed.supplement_theme.hero_promo_two) || {}),
    },
    goals: {
      ...defaults.supplement_theme.goals,
      ...((parsed.supplement_theme && parsed.supplement_theme.goals) || {}),
    },
    services: {
      ...defaults.supplement_theme.services,
      ...((parsed.supplement_theme && parsed.supplement_theme.services) || {}),
    },
    featured_products: {
      ...defaults.supplement_theme.featured_products,
      ...((parsed.supplement_theme && parsed.supplement_theme.featured_products) || {}),
      limit: normalizeInteger(
        parsed?.supplement_theme?.featured_products?.limit,
        defaults.supplement_theme.featured_products.limit,
        1,
        48
      ),
    },
    large_promo: {
      ...defaults.supplement_theme.large_promo,
      ...((parsed.supplement_theme && parsed.supplement_theme.large_promo) || {}),
    },
    testimonials: {
      ...defaults.supplement_theme.testimonials,
      ...((parsed.supplement_theme && parsed.supplement_theme.testimonials) || {}),
    },
    articles: {
      ...defaults.supplement_theme.articles,
      ...((parsed.supplement_theme && parsed.supplement_theme.articles) || {}),
      limit: normalizeInteger(
        parsed?.supplement_theme?.articles?.limit,
        defaults.supplement_theme.articles.limit,
        1,
        24
      ),
    },
    newsletter: {
      ...defaults.supplement_theme.newsletter,
      ...((parsed.supplement_theme && parsed.supplement_theme.newsletter) || {}),
    },
    footer: {
      ...defaults.supplement_theme.footer,
      ...((parsed.supplement_theme && parsed.supplement_theme.footer) || {}),
    },
  };

  const furnitureTheme = {
    ...defaults.furniture_theme,
    ...(parsed.furniture_theme || {}),
    topbar: {
      ...defaults.furniture_theme.topbar,
      ...((parsed.furniture_theme && parsed.furniture_theme.topbar) || {}),
    },
    header: {
      ...defaults.furniture_theme.header,
      ...((parsed.furniture_theme && parsed.furniture_theme.header) || {}),
    },
    hero_slider: {
      ...defaults.furniture_theme.hero_slider,
      ...((parsed.furniture_theme && parsed.furniture_theme.hero_slider) || {}),
      slides:
        Array.isArray(parsed?.furniture_theme?.hero_slider?.slides) &&
        parsed.furniture_theme.hero_slider.slides.length
          ? parsed.furniture_theme.hero_slider.slides.slice(0, 5).map((slide, index) => ({
              id: slide?.id || `furniture-slide-${index + 1}`,
              title:
                normalizeNullable(slide?.title) ||
                defaults.furniture_theme.hero_slider.slides[index]?.title ||
                '',
              subtitle:
                normalizeNullable(slide?.subtitle) ||
                defaults.furniture_theme.hero_slider.slides[index]?.subtitle ||
                '',
              button_label:
                normalizeNullable(slide?.button_label) ||
                defaults.furniture_theme.hero_slider.slides[index]?.button_label ||
                'Shop Now',
              image_url: normalizeNullable(slide?.image_url) || '',
              badge:
                normalizeNullable(slide?.badge) ||
                defaults.furniture_theme.hero_slider.slides[index]?.badge ||
                '',
              accent:
                normalizeNullable(slide?.accent) ||
                defaults.furniture_theme.hero_slider.slides[index]?.accent ||
                '#f3ece4',
              text_color:
                normalizeNullable(slide?.text_color) ||
                defaults.furniture_theme.hero_slider.slides[index]?.text_color ||
                '#2a211b',
            }))
          : defaults.furniture_theme.hero_slider.slides,
    },
    new_arrivals: {
      ...defaults.furniture_theme.new_arrivals,
      ...((parsed.furniture_theme && parsed.furniture_theme.new_arrivals) || {}),
      tabs:
        Array.isArray(parsed?.furniture_theme?.new_arrivals?.tabs) &&
        parsed.furniture_theme.new_arrivals.tabs.length
          ? parsed.furniture_theme.new_arrivals.tabs.slice(0, 4)
          : defaults.furniture_theme.new_arrivals.tabs,
      limit: normalizeInteger(
        parsed?.furniture_theme?.new_arrivals?.limit,
        defaults.furniture_theme.new_arrivals.limit,
        1,
        48
      ),
    },
    features_strip: {
      ...defaults.furniture_theme.features_strip,
      ...((parsed.furniture_theme && parsed.furniture_theme.features_strip) || {}),
    },
    recently_added: {
      ...defaults.furniture_theme.recently_added,
      ...((parsed.furniture_theme && parsed.furniture_theme.recently_added) || {}),
      limit: normalizeInteger(
        parsed?.furniture_theme?.recently_added?.limit,
        defaults.furniture_theme.recently_added.limit,
        1,
        48
      ),
    },
    top_categories: {
      ...defaults.furniture_theme.top_categories,
      ...((parsed.furniture_theme && parsed.furniture_theme.top_categories) || {}),
      limit: normalizeInteger(
        parsed?.furniture_theme?.top_categories?.limit,
        defaults.furniture_theme.top_categories.limit,
        1,
        24
      ),
    },
    popular_products: {
      ...defaults.furniture_theme.popular_products,
      ...((parsed.furniture_theme && parsed.furniture_theme.popular_products) || {}),
      tabs:
        Array.isArray(parsed?.furniture_theme?.popular_products?.tabs) &&
        parsed.furniture_theme.popular_products.tabs.length
          ? parsed.furniture_theme.popular_products.tabs.slice(0, 4)
          : defaults.furniture_theme.popular_products.tabs,
      limit: normalizeInteger(
        parsed?.furniture_theme?.popular_products?.limit,
        defaults.furniture_theme.popular_products.limit,
        1,
        48
      ),
    },
    news: {
      ...defaults.furniture_theme.news,
      ...((parsed.furniture_theme && parsed.furniture_theme.news) || {}),
      limit: normalizeInteger(
        parsed?.furniture_theme?.news?.limit,
        defaults.furniture_theme.news.limit,
        1,
        24
      ),
    },
    brand_row: {
      ...defaults.furniture_theme.brand_row,
      ...((parsed.furniture_theme && parsed.furniture_theme.brand_row) || {}),
      titles:
        Array.isArray(parsed?.furniture_theme?.brand_row?.titles) &&
        parsed.furniture_theme.brand_row.titles.length
          ? parsed.furniture_theme.brand_row.titles.slice(0, 6)
          : defaults.furniture_theme.brand_row.titles,
    },
    newsletter: {
      ...defaults.furniture_theme.newsletter,
      ...((parsed.furniture_theme && parsed.furniture_theme.newsletter) || {}),
    },
    footer: {
      ...defaults.furniture_theme.footer,
      ...((parsed.furniture_theme && parsed.furniture_theme.footer) || {}),
    },
  };

  const groceryTheme = {
    ...defaults.grocery_theme,
    ...(parsed.grocery_theme || {}),
    topbar: {
      ...defaults.grocery_theme.topbar,
      ...((parsed.grocery_theme && parsed.grocery_theme.topbar) || {}),
    },
    header: {
      ...defaults.grocery_theme.header,
      ...((parsed.grocery_theme && parsed.grocery_theme.header) || {}),
    },
    hero_slider: {
      ...defaults.grocery_theme.hero_slider,
      ...((parsed.grocery_theme && parsed.grocery_theme.hero_slider) || {}),
      slides:
        Array.isArray(parsed?.grocery_theme?.hero_slider?.slides) &&
        parsed.grocery_theme.hero_slider.slides.length
          ? parsed.grocery_theme.hero_slider.slides.slice(0, 5).map((slide, index) => ({
              id: slide?.id || `grocery-slide-${index + 1}`,
              eyebrow:
                normalizeNullable(slide?.eyebrow) ||
                defaults.grocery_theme.hero_slider.slides[index]?.eyebrow ||
                '',
              title:
                normalizeNullable(slide?.title) ||
                defaults.grocery_theme.hero_slider.slides[index]?.title ||
                '',
              subtitle:
                normalizeNullable(slide?.subtitle) ||
                defaults.grocery_theme.hero_slider.slides[index]?.subtitle ||
                '',
              button_label:
                normalizeNullable(slide?.button_label) ||
                defaults.grocery_theme.hero_slider.slides[index]?.button_label ||
                'Go to Shop',
              secondary_button_label:
                normalizeNullable(slide?.secondary_button_label) ||
                defaults.grocery_theme.hero_slider.slides[index]?.secondary_button_label ||
                'Learn More',
              image_url: normalizeNullable(slide?.image_url) || '',
              badge:
                normalizeNullable(slide?.badge) ||
                defaults.grocery_theme.hero_slider.slides[index]?.badge ||
                '',
              accent:
                normalizeNullable(slide?.accent) ||
                defaults.grocery_theme.hero_slider.slides[index]?.accent ||
                '#f4fff2',
              text_color:
                normalizeNullable(slide?.text_color) ||
                defaults.grocery_theme.hero_slider.slides[index]?.text_color ||
                '#18351f',
            }))
          : defaults.grocery_theme.hero_slider.slides,
    },
    hero_banners: {
      ...defaults.grocery_theme.hero_banners,
      ...((parsed.grocery_theme && parsed.grocery_theme.hero_banners) || {}),
      items:
        Array.isArray(parsed?.grocery_theme?.hero_banners?.items) &&
        parsed.grocery_theme.hero_banners.items.length
          ? parsed.grocery_theme.hero_banners.items.slice(0, 2).map((item, index) => ({
              title:
                normalizeNullable(item?.title) ||
                defaults.grocery_theme.hero_banners.items[index]?.title ||
                '',
              subtitle:
                normalizeNullable(item?.subtitle) ||
                defaults.grocery_theme.hero_banners.items[index]?.subtitle ||
                '',
              image_url: normalizeNullable(item?.image_url) || '',
              bg:
                normalizeNullable(item?.bg) ||
                defaults.grocery_theme.hero_banners.items[index]?.bg ||
                '#fff4df',
            }))
          : defaults.grocery_theme.hero_banners.items,
    },
    category_chips: {
      ...defaults.grocery_theme.category_chips,
      ...((parsed.grocery_theme && parsed.grocery_theme.category_chips) || {}),
      limit: normalizeInteger(
        parsed?.grocery_theme?.category_chips?.limit,
        defaults.grocery_theme.category_chips.limit,
        1,
        24
      ),
    },
    featured_products: {
      ...defaults.grocery_theme.featured_products,
      ...((parsed.grocery_theme && parsed.grocery_theme.featured_products) || {}),
      tabs:
        Array.isArray(parsed?.grocery_theme?.featured_products?.tabs) &&
        parsed.grocery_theme.featured_products.tabs.length
          ? parsed.grocery_theme.featured_products.tabs.slice(0, 4)
          : defaults.grocery_theme.featured_products.tabs,
      limit: normalizeInteger(
        parsed?.grocery_theme?.featured_products?.limit,
        defaults.grocery_theme.featured_products.limit,
        1,
        48
      ),
    },
    features_strip: {
      ...defaults.grocery_theme.features_strip,
      ...((parsed.grocery_theme && parsed.grocery_theme.features_strip) || {}),
    },
    top_categories: {
      ...defaults.grocery_theme.top_categories,
      ...((parsed.grocery_theme && parsed.grocery_theme.top_categories) || {}),
      limit: normalizeInteger(
        parsed?.grocery_theme?.top_categories?.limit,
        defaults.grocery_theme.top_categories.limit,
        1,
        24
      ),
    },
    latest_products: {
      ...defaults.grocery_theme.latest_products,
      ...((parsed.grocery_theme && parsed.grocery_theme.latest_products) || {}),
      limit: normalizeInteger(
        parsed?.grocery_theme?.latest_products?.limit,
        defaults.grocery_theme.latest_products.limit,
        1,
        48
      ),
    },
    news: {
      ...defaults.grocery_theme.news,
      ...((parsed.grocery_theme && parsed.grocery_theme.news) || {}),
      limit: normalizeInteger(
        parsed?.grocery_theme?.news?.limit,
        defaults.grocery_theme.news.limit,
        1,
        24
      ),
    },
    newsletter: {
      ...defaults.grocery_theme.newsletter,
      ...((parsed.grocery_theme && parsed.grocery_theme.newsletter) || {}),
    },
    footer: {
      ...defaults.grocery_theme.footer,
      ...((parsed.grocery_theme && parsed.grocery_theme.footer) || {}),
    },
  };

  const multiProduct = {
    ...defaults.multi_product,
    ...(parsed.multi_product || {}),
    announcement_bar: {
      ...defaults.multi_product.announcement_bar,
      ...((parsed.multi_product && parsed.multi_product.announcement_bar) || {}),
    },
    header: {
      ...defaults.multi_product.header,
      ...((parsed.multi_product && parsed.multi_product.header) || {}),
    },
    hero_slider: {
      ...defaults.multi_product.hero_slider,
      ...((parsed.multi_product && parsed.multi_product.hero_slider) || {}),
      products_per_row: normalizeInteger(
        parsed?.multi_product?.hero_slider?.products_per_row,
        defaults.multi_product.hero_slider.products_per_row,
        1,
        6
      ),
      total_products: normalizeInteger(
        parsed?.multi_product?.hero_slider?.total_products,
        defaults.multi_product.hero_slider.total_products,
        1,
        15
      ),
      slides:
        Array.isArray(parsed?.multi_product?.hero_slider?.slides) &&
        parsed.multi_product.hero_slider.slides.length
          ? parsed.multi_product.hero_slider.slides.slice(0, 5).map((slide, index) => ({
              id: slide?.id || `multi-slide-${index + 1}`,
              eyebrow:
                normalizeNullable(slide?.eyebrow) ||
                defaults.multi_product.hero_slider.slides[index]?.eyebrow ||
                '',
              title:
                normalizeNullable(slide?.title) ||
                defaults.multi_product.hero_slider.slides[index]?.title ||
                '',
              subtitle:
                normalizeNullable(slide?.subtitle) ||
                defaults.multi_product.hero_slider.slides[index]?.subtitle ||
                '',
              button_label:
                normalizeNullable(slide?.button_label) ||
                defaults.multi_product.hero_slider.slides[index]?.button_label ||
                'Shop Now',
              secondary_button_label:
                normalizeNullable(slide?.secondary_button_label) ||
                defaults.multi_product.hero_slider.slides[index]?.secondary_button_label ||
                'Explore Deals',
              image_url: normalizeNullable(slide?.image_url) || '',
              badge:
                normalizeNullable(slide?.badge) ||
                defaults.multi_product.hero_slider.slides[index]?.badge ||
                '',
              accent:
                normalizeNullable(slide?.accent) ||
                defaults.multi_product.hero_slider.slides[index]?.accent ||
                '#f2f3f7',
              text_color:
                normalizeNullable(slide?.text_color) ||
                defaults.multi_product.hero_slider.slides[index]?.text_color ||
                '#0f172a',
            }))
          : defaults.multi_product.hero_slider.slides,
    },
    hero_banner: {
      ...defaults.multi_product.hero_banner,
      ...((parsed.multi_product && parsed.multi_product.hero_banner) || {}),
    },
    services_strip: {
      ...defaults.multi_product.services_strip,
      ...((parsed.multi_product && parsed.multi_product.services_strip) || {}),
    },
    top_categories: {
      ...defaults.multi_product.top_categories,
      ...((parsed.multi_product && parsed.multi_product.top_categories) || {}),
      limit: normalizeInteger(
        parsed?.multi_product?.top_categories?.limit,
        defaults.multi_product.top_categories.limit,
        1,
        12
      ),
      products_per_row: normalizeInteger(
        parsed?.multi_product?.top_categories?.products_per_row,
        defaults.multi_product.top_categories.products_per_row,
        1,
        8
      ),
    },
    featured_products: {
      ...defaults.multi_product.featured_products,
      ...((parsed.multi_product && parsed.multi_product.featured_products) || {}),
      tabs:
        Array.isArray(parsed?.multi_product?.featured_products?.tabs) &&
        parsed.multi_product.featured_products.tabs.length
          ? parsed.multi_product.featured_products.tabs.slice(0, 4)
          : defaults.multi_product.featured_products.tabs,
      limit: normalizeInteger(
        parsed?.multi_product?.featured_products?.limit,
        defaults.multi_product.featured_products.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        parsed?.multi_product?.featured_products?.products_per_row,
        defaults.multi_product.featured_products.products_per_row,
        1,
        6
      ),
    },
    promo_tiles: {
      ...defaults.multi_product.promo_tiles,
      ...((parsed.multi_product && parsed.multi_product.promo_tiles) || {}),
      items:
        Array.isArray(parsed?.multi_product?.promo_tiles?.items) &&
        parsed.multi_product.promo_tiles.items.length
          ? parsed.multi_product.promo_tiles.items.slice(0, 3).map((item, index) => ({
              title:
                normalizeNullable(item?.title) ||
                defaults.multi_product.promo_tiles.items[index]?.title ||
                '',
              subtitle:
                normalizeNullable(item?.subtitle) ||
                defaults.multi_product.promo_tiles.items[index]?.subtitle ||
                '',
              button_label:
                normalizeNullable(item?.button_label) ||
                defaults.multi_product.promo_tiles.items[index]?.button_label ||
                '',
              image_url: normalizeNullable(item?.image_url) || '',
              bg:
                normalizeNullable(item?.bg) ||
                defaults.multi_product.promo_tiles.items[index]?.bg ||
                '#f4f7ff',
            }))
          : defaults.multi_product.promo_tiles.items,
    },
    best_sellers: {
      ...defaults.multi_product.best_sellers,
      ...((parsed.multi_product && parsed.multi_product.best_sellers) || {}),
      limit: normalizeInteger(
        parsed?.multi_product?.best_sellers?.limit,
        defaults.multi_product.best_sellers.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        parsed?.multi_product?.best_sellers?.products_per_row,
        defaults.multi_product.best_sellers.products_per_row,
        1,
        6
      ),
    },
    deal_banner: {
      ...defaults.multi_product.deal_banner,
      ...((parsed.multi_product && parsed.multi_product.deal_banner) || {}),
    },
    latest_products: {
      ...defaults.multi_product.latest_products,
      ...((parsed.multi_product && parsed.multi_product.latest_products) || {}),
      limit: normalizeInteger(
        parsed?.multi_product?.latest_products?.limit,
        defaults.multi_product.latest_products.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        parsed?.multi_product?.latest_products?.products_per_row,
        defaults.multi_product.latest_products.products_per_row,
        1,
        6
      ),
    },
    news: {
      ...defaults.multi_product.news,
      ...((parsed.multi_product && parsed.multi_product.news) || {}),
      limit: normalizeInteger(
        parsed?.multi_product?.news?.limit,
        defaults.multi_product.news.limit,
        1,
        6
      ),
    },
    newsletter: {
      ...defaults.multi_product.newsletter,
      ...((parsed.multi_product && parsed.multi_product.newsletter) || {}),
    },
    footer: {
      ...defaults.multi_product.footer,
      ...((parsed.multi_product && parsed.multi_product.footer) || {}),
    },
  };

  const mextro = {
    ...defaults.mextro,
    ...(parsed.mextro || {}),
    top_strip: {
      ...defaults.mextro.top_strip,
      ...((parsed.mextro && parsed.mextro.top_strip) || {}),
    },
    header: {
      ...defaults.mextro.header,
      ...((parsed.mextro && parsed.mextro.header) || {}),
    },
    theme_mode: {
      ...defaults.mextro.theme_mode,
      ...((parsed.mextro && parsed.mextro.theme_mode) || {}),
    },
    hero_slider: {
      ...defaults.mextro.hero_slider,
      ...((parsed.mextro && parsed.mextro.hero_slider) || {}),
      slides:
        Array.isArray(parsed?.mextro?.hero_slider?.slides) &&
        parsed.mextro.hero_slider.slides.length
          ? parsed.mextro.hero_slider.slides.slice(0, 5).map((slide, index) => ({
              id: slide?.id || `mextro-slide-${index + 1}`,
              eyebrow:
                normalizeNullable(slide?.eyebrow) ||
                defaults.mextro.hero_slider.slides[index]?.eyebrow ||
                '',
              title:
                normalizeNullable(slide?.title) ||
                defaults.mextro.hero_slider.slides[index]?.title ||
                '',
              subtitle:
                normalizeNullable(slide?.subtitle) ||
                defaults.mextro.hero_slider.slides[index]?.subtitle ||
                '',
              button_label:
                normalizeNullable(slide?.button_label) ||
                defaults.mextro.hero_slider.slides[index]?.button_label ||
                'Shop Now',
              image_url: normalizeNullable(slide?.image_url) || '',
              badge:
                normalizeNullable(slide?.badge) ||
                defaults.mextro.hero_slider.slides[index]?.badge ||
                '',
              accent:
                normalizeNullable(slide?.accent) ||
                defaults.mextro.hero_slider.slides[index]?.accent ||
                '#fed700',
              text_color:
                normalizeNullable(slide?.text_color) ||
                defaults.mextro.hero_slider.slides[index]?.text_color ||
                '#111111',
            }))
          : defaults.mextro.hero_slider.slides,
    },
    hero_side_banner: {
      ...defaults.mextro.hero_side_banner,
      ...((parsed.mextro && parsed.mextro.hero_side_banner) || {}),
    },
    category_icons: {
      ...defaults.mextro.category_icons,
      ...((parsed.mextro && parsed.mextro.category_icons) || {}),
      limit: normalizeInteger(
        parsed?.mextro?.category_icons?.limit,
        defaults.mextro.category_icons.limit,
        1,
        12
      ),
    },
    promo_banners: {
      ...defaults.mextro.promo_banners,
      ...((parsed.mextro && parsed.mextro.promo_banners) || {}),
      items:
        Array.isArray(parsed?.mextro?.promo_banners?.items) &&
        parsed.mextro.promo_banners.items.length
          ? parsed.mextro.promo_banners.items.slice(0, 3).map((item, index) => ({
              title:
                normalizeNullable(item?.title) ||
                defaults.mextro.promo_banners.items[index]?.title ||
                '',
              subtitle:
                normalizeNullable(item?.subtitle) ||
                defaults.mextro.promo_banners.items[index]?.subtitle ||
                '',
              button_label:
                normalizeNullable(item?.button_label) ||
                defaults.mextro.promo_banners.items[index]?.button_label ||
                'Shop Now',
              image_url: normalizeNullable(item?.image_url) || '',
              bg:
                normalizeNullable(item?.bg) ||
                defaults.mextro.promo_banners.items[index]?.bg ||
                '#f7f7f7',
            }))
          : defaults.mextro.promo_banners.items,
    },
    featured_products: {
      ...defaults.mextro.featured_products,
      ...((parsed.mextro && parsed.mextro.featured_products) || {}),
      limit: normalizeInteger(
        parsed?.mextro?.featured_products?.limit,
        defaults.mextro.featured_products.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        parsed?.mextro?.featured_products?.products_per_row,
        defaults.mextro.featured_products.products_per_row,
        1,
        6
      ),
    },
    dark_promos: {
      ...defaults.mextro.dark_promos,
      ...((parsed.mextro && parsed.mextro.dark_promos) || {}),
    },
    brand_row: {
      ...defaults.mextro.brand_row,
      ...((parsed.mextro && parsed.mextro.brand_row) || {}),
      titles:
        Array.isArray(parsed?.mextro?.brand_row?.titles) &&
        parsed.mextro.brand_row.titles.length
          ? parsed.mextro.brand_row.titles.slice(0, 6)
          : defaults.mextro.brand_row.titles,
    },
    news: {
      ...defaults.mextro.news,
      ...((parsed.mextro && parsed.mextro.news) || {}),
      limit: normalizeInteger(
        parsed?.mextro?.news?.limit,
        defaults.mextro.news.limit,
        1,
        6
      ),
    },
    footer: {
      ...defaults.mextro.footer,
      ...((parsed.mextro && parsed.mextro.footer) || {}),
    },
  };

  const xxam = {
    ...defaults.xxam,
    ...(parsed.xxam || {}),
    announcement_bar: {
      ...defaults.xxam.announcement_bar,
      ...((parsed.xxam && parsed.xxam.announcement_bar) || {}),
    },
    header: {
      ...defaults.xxam.header,
      ...((parsed.xxam && parsed.xxam.header) || {}),
      nav_links:
        Array.isArray(parsed?.xxam?.header?.nav_links) && parsed.xxam.header.nav_links.length
          ? parsed.xxam.header.nav_links.slice(0, 8)
          : defaults.xxam.header.nav_links,
    },
    theme_mode: {
      ...defaults.xxam.theme_mode,
      ...((parsed.xxam && parsed.xxam.theme_mode) || {}),
    },
    hero: {
      ...defaults.xxam.hero,
      ...((parsed.xxam && parsed.xxam.hero) || {}),
    },
    category_cards: {
      ...defaults.xxam.category_cards,
      ...((parsed.xxam && parsed.xxam.category_cards) || {}),
      limit: normalizeInteger(
        parsed?.xxam?.category_cards?.limit,
        defaults.xxam.category_cards.limit,
        1,
        8
      ),
    },
    featured_products: {
      ...defaults.xxam.featured_products,
      ...((parsed.xxam && parsed.xxam.featured_products) || {}),
      limit: normalizeInteger(
        parsed?.xxam?.featured_products?.limit,
        defaults.xxam.featured_products.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        parsed?.xxam?.featured_products?.products_per_row,
        defaults.xxam.featured_products.products_per_row,
        1,
        6
      ),
    },
    promo_banners: {
      ...defaults.xxam.promo_banners,
      ...((parsed.xxam && parsed.xxam.promo_banners) || {}),
      items:
        Array.isArray(parsed?.xxam?.promo_banners?.items) &&
        parsed.xxam.promo_banners.items.length
          ? parsed.xxam.promo_banners.items.slice(0, 2).map((item, index) => ({
              title:
                normalizeNullable(item?.title) ||
                defaults.xxam.promo_banners.items[index]?.title ||
                '',
              subtitle:
                normalizeNullable(item?.subtitle) ||
                defaults.xxam.promo_banners.items[index]?.subtitle ||
                '',
              button_label:
                normalizeNullable(item?.button_label) ||
                defaults.xxam.promo_banners.items[index]?.button_label ||
                'Shop Now',
              image_url: normalizeNullable(item?.image_url) || '',
              bg:
                normalizeNullable(item?.bg) ||
                defaults.xxam.promo_banners.items[index]?.bg ||
                '#f3f3f5',
            }))
          : defaults.xxam.promo_banners.items,
    },
    testimonials: {
      ...defaults.xxam.testimonials,
      ...((parsed.xxam && parsed.xxam.testimonials) || {}),
    },
    news: {
      ...defaults.xxam.news,
      ...((parsed.xxam && parsed.xxam.news) || {}),
      limit: normalizeInteger(
        parsed?.xxam?.news?.limit,
        defaults.xxam.news.limit,
        1,
        6
      ),
    },
    services_strip: {
      ...defaults.xxam.services_strip,
      ...((parsed.xxam && parsed.xxam.services_strip) || {}),
    },
    footer: {
      ...defaults.xxam.footer,
      ...((parsed.xxam && parsed.xxam.footer) || {}),
    },
  };

  return {
    premium_brand: premiumBrand,
    mega_electronics: megaElectronics,
    supplement_theme: supplementTheme,
    furniture_theme: furnitureTheme,
    grocery_theme: groceryTheme,
    multi_product: multiProduct,
    mextro,
    xxam,
  };
}

function buildTemplateSettingsJsonPayload(input, existingRawValue) {
  const existing = sanitizeTemplateSettingsJson(existingRawValue);

  const payload = {
    premium_brand: { ...existing.premium_brand },
    mega_electronics: { ...existing.mega_electronics },
    supplement_theme: { ...existing.supplement_theme },
    furniture_theme: { ...existing.furniture_theme },
    grocery_theme: { ...existing.grocery_theme },
    multi_product: { ...existing.multi_product },
    mextro: { ...existing.mextro },
    xxam: { ...existing.xxam },
  };

  const premiumInput = input?.premium_brand || {};
  const megaInput = input?.mega_electronics || {};
  const supplementInput = input?.supplement_theme || {};
  const furnitureInput = input?.furniture_theme || {};
  const groceryInput = input?.grocery_theme || {};
  const multiInput = input?.multi_product || {};
  const mextroInput = input?.mextro || {};
  const xxamInput = input?.xxam || {};

  payload.premium_brand = sanitizeTemplateSettingsJson({
    ...payload,
    premium_brand: {
      ...payload.premium_brand,
      ...premiumInput,
    },
  }).premium_brand;

  payload.mega_electronics = sanitizeTemplateSettingsJson({
    ...payload,
    mega_electronics: {
      ...payload.mega_electronics,
      ...megaInput,
    },
  }).mega_electronics;

  payload.supplement_theme = sanitizeTemplateSettingsJson({
    ...payload,
    supplement_theme: {
      ...payload.supplement_theme,
      ...supplementInput,
    },
  }).supplement_theme;

  payload.furniture_theme = sanitizeTemplateSettingsJson({
    ...payload,
    furniture_theme: {
      ...payload.furniture_theme,
      ...furnitureInput,
    },
  }).furniture_theme;

  payload.grocery_theme = sanitizeTemplateSettingsJson({
    ...payload,
    grocery_theme: {
      ...payload.grocery_theme,
      ...groceryInput,
    },
  }).grocery_theme;

  payload.multi_product = sanitizeTemplateSettingsJson({
    ...payload,
    multi_product: {
      ...payload.multi_product,
      ...multiInput,
    },
  }).multi_product;

  payload.mextro = sanitizeTemplateSettingsJson({
    ...payload,
    mextro: {
      ...payload.mextro,
      ...mextroInput,
    },
  }).mextro;

  payload.xxam = sanitizeTemplateSettingsJson({
    ...payload,
    xxam: {
      ...payload.xxam,
      ...xxamInput,
    },
  }).xxam;

  return payload;
}

function sanitizeDesignSettings(row) {
  if (!row) return null;

  const templateSettingsJson = sanitizeTemplateSettingsJson(row.template_settings_json);

  return {
    id: row.id,
    website_id: row.website_id,
    website_template_id: row.website_template_id,
    header_layout: row.header_layout,
    footer_layout: row.footer_layout,
    mobile_menu_style: row.mobile_menu_style,
    color_scheme: row.color_scheme,
    primary_color: row.primary_color,
    secondary_color: row.secondary_color,
    accent_color: row.accent_color,
    font_family: row.font_family,
    button_style: row.button_style,
    card_style: row.card_style,
    show_search: !!row.show_search,
    show_categories_menu: !!row.show_categories_menu,
    show_featured_slider: !!row.show_featured_slider,
    custom_css: row.custom_css,
    template_settings_json: templateSettingsJson,
    created_at: row.created_at,
    updated_at: row.updated_at,
    template:
      row.website_template_id && row.template_code_key
        ? {
            id: row.website_template_id,
            name: row.template_name,
            slug: row.template_slug,
            preview_image: row.template_preview_image,
            template_code_key: row.template_code_key,
            is_premium: !!row.template_is_premium,
            status: row.template_status,
          }
        : null,
  };
}

module.exports = {
  sanitizeTemplateSettingsJson,
  buildTemplateSettingsJsonPayload,
  sanitizeDesignSettings,
};