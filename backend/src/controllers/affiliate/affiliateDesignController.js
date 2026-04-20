const pool = require('../../config/db');

const BUILT_IN_WEBSITE_TEMPLATES = [
  {
    name: 'Free Simple',
    slug: 'free-simple',
    preview_image: '',
    template_code_key: 'free_simple',
    description: 'Simple free website storefront template.',
    is_premium: 0,
    status: 'active',
  },
  {
    name: 'Premium Brand',
    slug: 'premium-brand',
    preview_image: '',
    template_code_key: 'premium_brand',
    description: 'Premium visual storefront template.',
    is_premium: 1,
    status: 'active',
  },
  {
    name: 'Mega Electronics',
    slug: 'mega-electronics',
    preview_image: '',
    template_code_key: 'mega_electronics',
    description: 'Electronics premium storefront template.',
    is_premium: 1,
    status: 'active',
  },
  {
    name: 'Supplement Theme',
    slug: 'supplement-theme',
    preview_image: '',
    template_code_key: 'supplement_theme',
    description: 'Supplement and nutrition storefront template.',
    is_premium: 1,
    status: 'active',
  },
  {
    name: 'Furniture Theme',
    slug: 'furniture-theme',
    preview_image: '',
    template_code_key: 'furniture_theme',
    description: 'Furniture storefront template.',
    is_premium: 1,
    status: 'active',
  },
  {
    name: 'Grocery Theme',
    slug: 'grocery-theme',
    preview_image: '',
    template_code_key: 'grocery_theme',
    description: 'Grocery storefront template.',
    is_premium: 1,
    status: 'active',
  },
  {
    name: 'Multi Product',
    slug: 'multi-product',
    preview_image: '',
    template_code_key: 'multi_product',
    description: 'Multi product premium storefront template.',
    is_premium: 1,
    status: 'active',
  },
];

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeBooleanFlag(value, fallback = 0) {
  if (value === undefined) return fallback;
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return fallback;
}

function normalizeCodeKey(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeInteger(value, fallback, min = 1, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function parseJsonSafe(value, fallback = {}) {
  if (!value) return fallback;

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function buildDefaultPremiumBrandSettings() {
  return {
    top_header: {
      enabled: true,
      support_title: '24 Support',
      support_text: '+1 212-334-0212',
      shipping_title: 'Worldwide',
      shipping_text: 'Free Shipping',
      country_label: 'USA',
      currency_label: 'USD',
    },
    hero_slider: {
      enabled: true,
      title: 'Apple Shopping Event',
      subtitle: 'Shop great deals on MacBook, iPad, iPhone and more.',
      primary_button_label: 'Shop Now',
    },
    promo_block_main: {
      enabled: true,
      title: 'Aurora Headset',
      button_label: 'Buy Now',
      countdown_days: '255',
      countdown_hours: '21',
      countdown_minutes: '11',
      countdown_seconds: '25',
    },
    promo_block_small_1: {
      enabled: true,
      title: 'New Dual Sense',
      subtitle: 'For PlayStation 5',
      button_label: 'View Details',
    },
    promo_block_small_2: {
      enabled: true,
      title: 'Instant Cameras',
      subtitle: 'Get photo paper as a gift',
      button_label: 'View Details',
    },
    sections: {
      popular_categories: true,
      best_offers: true,
      big_promo_strip: true,
      promo_band: true,
      articles: true,
    },
    limits: {
      offers_per_row: 4,
      offers_limit: 8,
      categories_per_row: 4,
      categories_limit: 8,
      articles_per_row: 4,
      articles_limit: 4,
    },
  };
}

function buildDefaultMegaElectronicsSettings() {
  return {
    top_header: {
      enabled: true,
      support_title: '24 Support',
      support_text: '+1 212-334-0212',
      shipping_title: 'Worldwide',
      shipping_text: 'Free Shipping',
      country_label: 'USA',
      currency_label: 'USD',
    },
    hero_slider: {
      enabled: true,
      title: 'Mega Electronics Deals',
      subtitle: 'Premium gadgets, accessories and top device offers.',
      primary_button_label: 'Shop Now',
    },
    promo_block_main: {
      enabled: true,
      title: 'Featured Electronics',
      button_label: 'Buy Now',
      countdown_days: '120',
      countdown_hours: '12',
      countdown_minutes: '30',
      countdown_seconds: '45',
    },
    promo_block_small_1: {
      enabled: true,
      title: 'Gaming Gear',
      subtitle: 'Hot accessories',
      button_label: 'View Details',
    },
    promo_block_small_2: {
      enabled: true,
      title: 'Camera Deals',
      subtitle: 'Save on selected kits',
      button_label: 'View Details',
    },
    sections: {
      popular_categories: true,
      best_offers: true,
      big_promo_strip: true,
      promo_band: true,
      articles: true,
    },
    limits: {
      offers_per_row: 4,
      offers_limit: 8,
      categories_per_row: 4,
      categories_limit: 8,
      articles_per_row: 4,
      articles_limit: 4,
    },
  };
}

function buildDefaultSupplementThemeSettings() {
  return {
    top_strip: {
      enabled: true,
      message: 'Free delivery worldwide • 30-day returns policy • Support available daily',
    },
    header: {
      search_placeholder: 'Search for products',
    },
    hero: {
      enabled: true,
      eyebrow: 'STRONG SUPPLEMENTS',
      title: 'YOUR BEST FITNESS PARTNERS',
      subtitle: 'Hardcore mass gainer perfect for bodybuilders.',
      button_label: 'Shop Now',
      image_url: '',
    },
    hero_promo_one: {
      enabled: true,
      title: '20% OFF',
      subtitle: 'ALL GYM SUPPLEMENTS',
      image_url: '',
    },
    hero_promo_two: {
      enabled: true,
      title: 'BOOST ENERGY',
      subtitle: 'BUILD YOUR DREAM BODY',
      image_url: '',
    },
    goals: {
      enabled: true,
      title: 'SHOP BY GOALS',
    },
    services: {
      enabled: true,
      item_one_title: 'FAST DELIVERY',
      item_one_subtitle: 'View all Europe dispatch',
      item_two_title: 'FREE GIFT WITH ORDER $150+',
      item_two_subtitle: 'Multiple premium bonuses',
      item_three_title: 'CLICK & COLLECT',
      item_three_subtitle: 'Collect your local store',
      item_four_title: '2M+ HAPPY CUSTOMERS',
      item_four_subtitle: 'Have supported your journey',
    },
    featured_products: {
      enabled: true,
      title: 'TOP PICKS FOR YOU',
      limit: 8,
    },
    large_promo: {
      enabled: true,
      title: 'DEPENDABLE PRODUCTS EXCEPTIONAL SERVICE',
      subtitle:
        'For 20 years, we have helped individuals like you achieve various health and fitness goals by offering top-quality dietary and nutritional supplements.',
      image_url: '',
    },
    testimonials: {
      enabled: true,
      title: 'FEATURED REVIEWS',
      item_one_name: 'Michael T.',
      item_one_quote:
        'The layout feels premium and the product display is clear, clean, and easy to shop.',
      item_two_name: 'Sandra A.',
      item_two_quote:
        'I found exactly what I needed for recovery and daily wellness. Checkout felt very easy.',
      item_three_name: 'David P.',
      item_three_quote:
        'Strong design, sharp product cards, and a store structure that looks like a real premium supplement shop.',
    },
    articles: {
      enabled: true,
      title: 'LATEST ARTICLES',
      limit: 3,
    },
    newsletter: {
      enabled: true,
      title: 'GET UPDATES ON NEW SUPPLEMENTS',
      placeholder: 'Enter your email address',
      button_label: 'Subscribe',
    },
    footer: {
      about_text:
        'Premium supplement storefront layout with editable content and locked structure.',
      phone: '+1 000 000 0000',
      email: 'support@example.com',
      address: 'Premium wellness store address',
    },
  };
}

function buildDefaultFurnitureThemeSettings() {
  return {
    topbar: {
      enabled: true,
      left_text: 'Welcome to Bloggad furniture store',
      center_text: 'Free shipping on orders over $99',
      right_text: 'Need help? Call +1 212-334-0212',
    },
    header: {
      search_placeholder: 'Search products...',
      phone_label: '+1 212-334-0212',
      note_label: 'Support 24/7',
    },
    hero_slider: {
      enabled: true,
      slides: [
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
      ],
    },
    new_arrivals: {
      enabled: true,
      title: 'New Arrivals',
      tabs: ['All', 'Featured', 'Best Seller', 'Sale'],
      limit: 8,
    },
    features_strip: {
      enabled: true,
      item_one_title: 'Free Delivery',
      item_one_subtitle: 'Orders over $120',
      item_two_title: 'Money Guarantee',
      item_two_subtitle: '30 day back',
      item_three_title: 'Safe Payment',
      item_three_subtitle: 'Secure checkout',
      item_four_title: 'Online Support',
      item_four_subtitle: '24/7 assistance',
    },
    recently_added: {
      enabled: true,
      title: 'Recently Added',
      limit: 6,
    },
    top_categories: {
      enabled: true,
      title: 'Top Categories This Week',
      limit: 6,
    },
    popular_products: {
      enabled: true,
      title: 'Popular Products',
      tabs: ['Featured', 'Top Rated', 'Best Seller', 'Latest'],
      limit: 8,
    },
    news: {
      enabled: true,
      title: 'Marketplace News',
      limit: 3,
    },
    brand_row: {
      enabled: true,
      titles: ['FURNI', 'WOODO', 'NEST', 'LIVORA', 'MODEN', 'ROOMIX'],
    },
    newsletter: {
      enabled: true,
      title: 'Join our newsletter',
      subtitle:
        'Subscribe to get furniture trends, offers, and new collection updates from Bloggad.',
      placeholder: 'Enter your email address',
      button_label: 'Subscribe',
    },
    footer: {
      about_text: 'Bloggad furniture storefront with editable content and fixed premium layout.',
      phone: '+1 212-334-0212',
      email: 'support@bloggad.com',
      address: '27 Division St, New York, NY 10002, USA',
      copyright: '© 2026 Bloggad. All rights reserved.',
    },
  };
}

function buildDefaultGroceryThemeSettings() {
  return {
    topbar: {
      enabled: true,
      left_text: 'Free Delivery',
      center_text: 'Returns Policy',
      right_text: 'Follow Us',
    },
    header: {
      search_placeholder: 'Search products...',
      phone_label: '+1 212-334-0212',
      note_label: 'Support 24/7',
      today_deals_label: "Today's Deals",
    },
    hero_slider: {
      enabled: true,
      slides: [
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
      ],
    },
    hero_banners: {
      enabled: true,
      items: [
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
      ],
    },
    category_chips: {
      enabled: true,
      title: 'Shop by category',
      limit: 6,
    },
    featured_products: {
      enabled: true,
      title: 'Featured Products',
      tabs: ['Featured', 'Popular', 'Latest', 'Sale'],
      limit: 8,
    },
    features_strip: {
      enabled: true,
      item_one_title: 'Free Delivery',
      item_one_subtitle: 'Orders over $30',
      item_two_title: 'Money Guarantee',
      item_two_subtitle: '7 day return',
      item_three_title: 'Safe Payment',
      item_three_subtitle: 'Secure checkout',
      item_four_title: 'Online Support',
      item_four_subtitle: '24/7 assistance',
    },
    top_categories: {
      enabled: true,
      title: 'Top Categories',
      limit: 6,
    },
    latest_products: {
      enabled: true,
      title: 'Latest Products',
      limit: 6,
    },
    news: {
      enabled: true,
      title: 'Marketplace News',
      limit: 3,
    },
    newsletter: {
      enabled: true,
      title: 'Join our newsletter',
      subtitle: 'Subscribe to get grocery trends, offers, and new collection updates.',
      placeholder: 'Enter your email address',
      button_label: 'Subscribe',
    },
    footer: {
      about_text: 'Premium grocery storefront with editable content and fixed layout.',
      phone: '+1 212-334-0212',
      email: 'support@bloggad.com',
      address: '27 Division St, New York, NY 10002, USA',
      copyright: '© 2026 Bloggad. All rights reserved.',
    },
  };
}

function buildDefaultMultiProductSettings() {
  return {
    announcement_bar: {
      enabled: true,
      left_text: 'Free shipping on orders over $99',
      center_text: '30 days easy returns',
      right_text: 'Support available 24/7',
    },
    header: {
      search_placeholder: 'Search for products',
      account_label: 'My Account',
      cart_label: 'Cart',
      support_label: '+1 212-334-0212',
      categories_button_label: 'Shop By Categories',
      deals_label: 'Hot Deals',
      logo_text: 'Blogguard',
      logo_image_url: '',
    },
    hero_slider: {
      enabled: true,
      slides: [
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
      ],
      products_per_row: 1,
      total_products: 3,
    },
    hero_banner: {
      enabled: true,
      eyebrow: 'Big Saving',
      title: 'Sale 30% Off On Selected Items',
      subtitle: 'Strong promo area beside slider, exactly for this template.',
      button_label: 'Shop Now',
      image_url: '',
      bg: '#ffe9d8',
    },
    services_strip: {
      enabled: true,
      item_one_title: 'Free Delivery',
      item_one_subtitle: 'For all orders above $99',
      item_two_title: 'Money Back',
      item_two_subtitle: 'Safe and easy return',
      item_three_title: 'Secure Payment',
      item_three_subtitle: 'Protected checkout flow',
      item_four_title: 'Online Support',
      item_four_subtitle: 'Dedicated 24/7 help',
    },
    top_categories: {
      enabled: true,
      title: 'Top Categories',
      limit: 8,
      products_per_row: 8,
    },
    featured_products: {
      enabled: true,
      title: 'Featured Products',
      tabs: ['Featured', 'Best Sellers', 'New Arrivals', 'Deals'],
      limit: 8,
      products_per_row: 4,
    },
    promo_tiles: {
      enabled: true,
      items: [
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
      ],
    },
    best_sellers: {
      enabled: true,
      title: 'Best Sellers',
      limit: 6,
      products_per_row: 3,
    },
    deal_banner: {
      enabled: true,
      eyebrow: 'Big Deal',
      title: 'Premium picks with better pricing',
      subtitle:
        'A strong full-width banner section for the Multi Product storefront layout.',
      button_label: 'Shop Collection',
      image_url: '',
      bg: '#101828',
    },
    latest_products: {
      enabled: true,
      title: 'Latest Products',
      limit: 8,
      products_per_row: 4,
    },
    news: {
      enabled: true,
      title: 'Latest Articles',
      limit: 3,
    },
    newsletter: {
      enabled: true,
      title: 'Subscribe to our newsletter',
      subtitle: 'Get updates on new products, trending offers, and premium storefront deals.',
      placeholder: 'Enter your email address',
      button_label: 'Subscribe',
    },
    footer: {
      enabled: true,
      about_text:
        'Multi Product is a premium locked-structure storefront with editable content, logo, images, colors and product counts.',
      phone: '+1 212-334-0212',
      email: 'support@blogguard.com',
      address: '27 Division St, New York, NY 10002, USA',
      copyright: '© 2026 Blogguard. All rights reserved.',
    },
  };
}

function buildDefaultTemplateSettingsJson() {
  return {
    premium_brand: buildDefaultPremiumBrandSettings(),
    mega_electronics: buildDefaultMegaElectronicsSettings(),
    supplement_theme: buildDefaultSupplementThemeSettings(),
    furniture_theme: buildDefaultFurnitureThemeSettings(),
    grocery_theme: buildDefaultGroceryThemeSettings(),
    multi_product: buildDefaultMultiProductSettings(),
  };
}

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

  return {
    premium_brand: premiumBrand,
    mega_electronics: megaElectronics,
    supplement_theme: supplementTheme,
    furniture_theme: furnitureTheme,
    grocery_theme: groceryTheme,
    multi_product: multiProduct,
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
  };

  const premiumInput = input?.premium_brand || {};
  const megaInput = input?.mega_electronics || {};
  const supplementInput = input?.supplement_theme || {};
  const furnitureInput = input?.furniture_theme || {};
  const groceryInput = input?.grocery_theme || {};
  const multiInput = input?.multi_product || {};

  payload.premium_brand = {
    ...payload.premium_brand,
    ...(premiumInput || {}),
    top_header: {
      ...payload.premium_brand.top_header,
      ...((premiumInput && premiumInput.top_header) || {}),
    },
    hero_slider: {
      ...payload.premium_brand.hero_slider,
      ...((premiumInput && premiumInput.hero_slider) || {}),
    },
    promo_block_main: {
      ...payload.premium_brand.promo_block_main,
      ...((premiumInput && premiumInput.promo_block_main) || {}),
    },
    promo_block_small_1: {
      ...payload.premium_brand.promo_block_small_1,
      ...((premiumInput && premiumInput.promo_block_small_1) || {}),
    },
    promo_block_small_2: {
      ...payload.premium_brand.promo_block_small_2,
      ...((premiumInput && premiumInput.promo_block_small_2) || {}),
    },
    sections: {
      ...payload.premium_brand.sections,
      ...((premiumInput && premiumInput.sections) || {}),
    },
    limits: {
      offers_per_row: normalizeInteger(
        premiumInput?.limits?.offers_per_row,
        payload.premium_brand.limits.offers_per_row,
        1,
        6
      ),
      offers_limit: normalizeInteger(
        premiumInput?.limits?.offers_limit,
        payload.premium_brand.limits.offers_limit,
        1,
        48
      ),
      categories_per_row: normalizeInteger(
        premiumInput?.limits?.categories_per_row,
        payload.premium_brand.limits.categories_per_row,
        1,
        8
      ),
      categories_limit: normalizeInteger(
        premiumInput?.limits?.categories_limit,
        payload.premium_brand.limits.categories_limit,
        1,
        48
      ),
      articles_per_row: normalizeInteger(
        premiumInput?.limits?.articles_per_row,
        payload.premium_brand.limits.articles_per_row,
        1,
        6
      ),
      articles_limit: normalizeInteger(
        premiumInput?.limits?.articles_limit,
        payload.premium_brand.limits.articles_limit,
        1,
        24
      ),
    },
  };

  payload.mega_electronics = {
    ...payload.mega_electronics,
    ...(megaInput || {}),
    top_header: {
      ...payload.mega_electronics.top_header,
      ...((megaInput && megaInput.top_header) || {}),
    },
    hero_slider: {
      ...payload.mega_electronics.hero_slider,
      ...((megaInput && megaInput.hero_slider) || {}),
    },
    promo_block_main: {
      ...payload.mega_electronics.promo_block_main,
      ...((megaInput && megaInput.promo_block_main) || {}),
    },
    promo_block_small_1: {
      ...payload.mega_electronics.promo_block_small_1,
      ...((megaInput && megaInput.promo_block_small_1) || {}),
    },
    promo_block_small_2: {
      ...payload.mega_electronics.promo_block_small_2,
      ...((megaInput && megaInput.promo_block_small_2) || {}),
    },
    sections: {
      ...payload.mega_electronics.sections,
      ...((megaInput && megaInput.sections) || {}),
    },
    limits: {
      offers_per_row: normalizeInteger(
        megaInput?.limits?.offers_per_row,
        payload.mega_electronics.limits.offers_per_row,
        1,
        6
      ),
      offers_limit: normalizeInteger(
        megaInput?.limits?.offers_limit,
        payload.mega_electronics.limits.offers_limit,
        1,
        48
      ),
      categories_per_row: normalizeInteger(
        megaInput?.limits?.categories_per_row,
        payload.mega_electronics.limits.categories_per_row,
        1,
        8
      ),
      categories_limit: normalizeInteger(
        megaInput?.limits?.categories_limit,
        payload.mega_electronics.limits.categories_limit,
        1,
        48
      ),
      articles_per_row: normalizeInteger(
        megaInput?.limits?.articles_per_row,
        payload.mega_electronics.limits.articles_per_row,
        1,
        6
      ),
      articles_limit: normalizeInteger(
        megaInput?.limits?.articles_limit,
        payload.mega_electronics.limits.articles_limit,
        1,
        24
      ),
    },
  };

  payload.supplement_theme = {
    ...payload.supplement_theme,
    ...(supplementInput || {}),
    top_strip: {
      ...payload.supplement_theme.top_strip,
      ...((supplementInput && supplementInput.top_strip) || {}),
    },
    header: {
      ...payload.supplement_theme.header,
      ...((supplementInput && supplementInput.header) || {}),
    },
    hero: {
      ...payload.supplement_theme.hero,
      ...((supplementInput && supplementInput.hero) || {}),
    },
    hero_promo_one: {
      ...payload.supplement_theme.hero_promo_one,
      ...((supplementInput && supplementInput.hero_promo_one) || {}),
    },
    hero_promo_two: {
      ...payload.supplement_theme.hero_promo_two,
      ...((supplementInput && supplementInput.hero_promo_two) || {}),
    },
    goals: {
      ...payload.supplement_theme.goals,
      ...((supplementInput && supplementInput.goals) || {}),
    },
    services: {
      ...payload.supplement_theme.services,
      ...((supplementInput && supplementInput.services) || {}),
    },
    featured_products: {
      ...payload.supplement_theme.featured_products,
      ...((supplementInput && supplementInput.featured_products) || {}),
      limit: normalizeInteger(
        supplementInput?.featured_products?.limit,
        payload.supplement_theme.featured_products.limit,
        1,
        48
      ),
    },
    large_promo: {
      ...payload.supplement_theme.large_promo,
      ...((supplementInput && supplementInput.large_promo) || {}),
    },
    testimonials: {
      ...payload.supplement_theme.testimonials,
      ...((supplementInput && supplementInput.testimonials) || {}),
    },
    articles: {
      ...payload.supplement_theme.articles,
      ...((supplementInput && supplementInput.articles) || {}),
      limit: normalizeInteger(
        supplementInput?.articles?.limit,
        payload.supplement_theme.articles.limit,
        1,
        24
      ),
    },
    newsletter: {
      ...payload.supplement_theme.newsletter,
      ...((supplementInput && supplementInput.newsletter) || {}),
    },
    footer: {
      ...payload.supplement_theme.footer,
      ...((supplementInput && supplementInput.footer) || {}),
    },
  };

  payload.furniture_theme = {
    ...payload.furniture_theme,
    ...(furnitureInput || {}),
    topbar: {
      ...payload.furniture_theme.topbar,
      ...((furnitureInput && furnitureInput.topbar) || {}),
    },
    header: {
      ...payload.furniture_theme.header,
      ...((furnitureInput && furnitureInput.header) || {}),
    },
    hero_slider: {
      ...payload.furniture_theme.hero_slider,
      ...((furnitureInput && furnitureInput.hero_slider) || {}),
      slides:
        Array.isArray(furnitureInput?.hero_slider?.slides) && furnitureInput.hero_slider.slides.length
          ? furnitureInput.hero_slider.slides.slice(0, 5).map((slide, index) => ({
              id: slide?.id || `furniture-slide-${index + 1}`,
              title: normalizeNullable(slide?.title) || '',
              subtitle: normalizeNullable(slide?.subtitle) || '',
              button_label: normalizeNullable(slide?.button_label) || 'Shop Now',
              image_url: normalizeNullable(slide?.image_url) || '',
              badge: normalizeNullable(slide?.badge) || '',
              accent: normalizeNullable(slide?.accent) || '#f3ece4',
              text_color: normalizeNullable(slide?.text_color) || '#2a211b',
            }))
          : payload.furniture_theme.hero_slider.slides,
    },
    new_arrivals: {
      ...payload.furniture_theme.new_arrivals,
      ...((furnitureInput && furnitureInput.new_arrivals) || {}),
      tabs:
        Array.isArray(furnitureInput?.new_arrivals?.tabs) && furnitureInput.new_arrivals.tabs.length
          ? furnitureInput.new_arrivals.tabs.slice(0, 4)
          : payload.furniture_theme.new_arrivals.tabs,
      limit: normalizeInteger(
        furnitureInput?.new_arrivals?.limit,
        payload.furniture_theme.new_arrivals.limit,
        1,
        48
      ),
    },
    features_strip: {
      ...payload.furniture_theme.features_strip,
      ...((furnitureInput && furnitureInput.features_strip) || {}),
    },
    recently_added: {
      ...payload.furniture_theme.recently_added,
      ...((furnitureInput && furnitureInput.recently_added) || {}),
      limit: normalizeInteger(
        furnitureInput?.recently_added?.limit,
        payload.furniture_theme.recently_added.limit,
        1,
        48
      ),
    },
    top_categories: {
      ...payload.furniture_theme.top_categories,
      ...((furnitureInput && furnitureInput.top_categories) || {}),
      limit: normalizeInteger(
        furnitureInput?.top_categories?.limit,
        payload.furniture_theme.top_categories.limit,
        1,
        24
      ),
    },
    popular_products: {
      ...payload.furniture_theme.popular_products,
      ...((furnitureInput && furnitureInput.popular_products) || {}),
      tabs:
        Array.isArray(furnitureInput?.popular_products?.tabs) &&
        furnitureInput.popular_products.tabs.length
          ? furnitureInput.popular_products.tabs.slice(0, 4)
          : payload.furniture_theme.popular_products.tabs,
      limit: normalizeInteger(
        furnitureInput?.popular_products?.limit,
        payload.furniture_theme.popular_products.limit,
        1,
        48
      ),
    },
    news: {
      ...payload.furniture_theme.news,
      ...((furnitureInput && furnitureInput.news) || {}),
      limit: normalizeInteger(
        furnitureInput?.news?.limit,
        payload.furniture_theme.news.limit,
        1,
        24
      ),
    },
    brand_row: {
      ...payload.furniture_theme.brand_row,
      ...((furnitureInput && furnitureInput.brand_row) || {}),
      titles:
        Array.isArray(furnitureInput?.brand_row?.titles) && furnitureInput.brand_row.titles.length
          ? furnitureInput.brand_row.titles.slice(0, 6)
          : payload.furniture_theme.brand_row.titles,
    },
    newsletter: {
      ...payload.furniture_theme.newsletter,
      ...((furnitureInput && furnitureInput.newsletter) || {}),
    },
    footer: {
      ...payload.furniture_theme.footer,
      ...((furnitureInput && furnitureInput.footer) || {}),
    },
  };

  payload.grocery_theme = {
    ...payload.grocery_theme,
    ...(groceryInput || {}),
    topbar: {
      ...payload.grocery_theme.topbar,
      ...((groceryInput && groceryInput.topbar) || {}),
    },
    header: {
      ...payload.grocery_theme.header,
      ...((groceryInput && groceryInput.header) || {}),
    },
    hero_slider: {
      ...payload.grocery_theme.hero_slider,
      ...((groceryInput && groceryInput.hero_slider) || {}),
      slides:
        Array.isArray(groceryInput?.hero_slider?.slides) && groceryInput.hero_slider.slides.length
          ? groceryInput.hero_slider.slides.slice(0, 5).map((slide, index) => ({
              id: slide?.id || `grocery-slide-${index + 1}`,
              eyebrow: normalizeNullable(slide?.eyebrow) || '',
              title: normalizeNullable(slide?.title) || '',
              subtitle: normalizeNullable(slide?.subtitle) || '',
              button_label: normalizeNullable(slide?.button_label) || 'Go to Shop',
              secondary_button_label:
                normalizeNullable(slide?.secondary_button_label) || 'Learn More',
              image_url: normalizeNullable(slide?.image_url) || '',
              badge: normalizeNullable(slide?.badge) || '',
              accent: normalizeNullable(slide?.accent) || '#f4fff2',
              text_color: normalizeNullable(slide?.text_color) || '#18351f',
            }))
          : payload.grocery_theme.hero_slider.slides,
    },
    hero_banners: {
      ...payload.grocery_theme.hero_banners,
      ...((groceryInput && groceryInput.hero_banners) || {}),
      items:
        Array.isArray(groceryInput?.hero_banners?.items) && groceryInput.hero_banners.items.length
          ? groceryInput.hero_banners.items.slice(0, 2).map((item, index) => ({
              title: normalizeNullable(item?.title) || '',
              subtitle: normalizeNullable(item?.subtitle) || '',
              image_url: normalizeNullable(item?.image_url) || '',
              bg: normalizeNullable(item?.bg) || '#fff4df',
            }))
          : payload.grocery_theme.hero_banners.items,
    },
    category_chips: {
      ...payload.grocery_theme.category_chips,
      ...((groceryInput && groceryInput.category_chips) || {}),
      limit: normalizeInteger(
        groceryInput?.category_chips?.limit,
        payload.grocery_theme.category_chips.limit,
        1,
        24
      ),
    },
    featured_products: {
      ...payload.grocery_theme.featured_products,
      ...((groceryInput && groceryInput.featured_products) || {}),
      tabs:
        Array.isArray(groceryInput?.featured_products?.tabs) &&
        groceryInput.featured_products.tabs.length
          ? groceryInput.featured_products.tabs.slice(0, 4)
          : payload.grocery_theme.featured_products.tabs,
      limit: normalizeInteger(
        groceryInput?.featured_products?.limit,
        payload.grocery_theme.featured_products.limit,
        1,
        48
      ),
    },
    features_strip: {
      ...payload.grocery_theme.features_strip,
      ...((groceryInput && groceryInput.features_strip) || {}),
    },
    top_categories: {
      ...payload.grocery_theme.top_categories,
      ...((groceryInput && groceryInput.top_categories) || {}),
      limit: normalizeInteger(
        groceryInput?.top_categories?.limit,
        payload.grocery_theme.top_categories.limit,
        1,
        24
      ),
    },
    latest_products: {
      ...payload.grocery_theme.latest_products,
      ...((groceryInput && groceryInput.latest_products) || {}),
      limit: normalizeInteger(
        groceryInput?.latest_products?.limit,
        payload.grocery_theme.latest_products.limit,
        1,
        48
      ),
    },
    news: {
      ...payload.grocery_theme.news,
      ...((groceryInput && groceryInput.news) || {}),
      limit: normalizeInteger(
        groceryInput?.news?.limit,
        payload.grocery_theme.news.limit,
        1,
        24
      ),
    },
    newsletter: {
      ...payload.grocery_theme.newsletter,
      ...((groceryInput && groceryInput.newsletter) || {}),
    },
    footer: {
      ...payload.grocery_theme.footer,
      ...((groceryInput && groceryInput.footer) || {}),
    },
  };

  payload.multi_product = {
    ...payload.multi_product,
    ...(multiInput || {}),
    announcement_bar: {
      ...payload.multi_product.announcement_bar,
      ...((multiInput && multiInput.announcement_bar) || {}),
    },
    header: {
      ...payload.multi_product.header,
      ...((multiInput && multiInput.header) || {}),
      logo_text:
        normalizeNullable(multiInput?.header?.logo_text) || payload.multi_product.header.logo_text,
      logo_image_url:
        normalizeNullable(multiInput?.header?.logo_image_url) || payload.multi_product.header.logo_image_url,
    },
    hero_slider: {
      ...payload.multi_product.hero_slider,
      ...((multiInput && multiInput.hero_slider) || {}),
      products_per_row: normalizeInteger(
        multiInput?.hero_slider?.products_per_row,
        payload.multi_product.hero_slider.products_per_row,
        1,
        6
      ),
      total_products: normalizeInteger(
        multiInput?.hero_slider?.total_products,
        payload.multi_product.hero_slider.total_products,
        1,
        15
      ),
      slides:
        Array.isArray(multiInput?.hero_slider?.slides) && multiInput.hero_slider.slides.length
          ? multiInput.hero_slider.slides.slice(0, 5).map((slide, index) => ({
              id: slide?.id || `multi-slide-${index + 1}`,
              eyebrow: normalizeNullable(slide?.eyebrow) || '',
              title: normalizeNullable(slide?.title) || '',
              subtitle: normalizeNullable(slide?.subtitle) || '',
              button_label: normalizeNullable(slide?.button_label) || 'Shop Now',
              secondary_button_label:
                normalizeNullable(slide?.secondary_button_label) || 'Explore Deals',
              image_url: normalizeNullable(slide?.image_url) || '',
              badge: normalizeNullable(slide?.badge) || '',
              accent: normalizeNullable(slide?.accent) || '#f2f3f7',
              text_color: normalizeNullable(slide?.text_color) || '#0f172a',
            }))
          : payload.multi_product.hero_slider.slides,
    },
    hero_banner: {
      ...payload.multi_product.hero_banner,
      ...((multiInput && multiInput.hero_banner) || {}),
      image_url:
        normalizeNullable(multiInput?.hero_banner?.image_url) ||
        payload.multi_product.hero_banner.image_url,
    },
    services_strip: {
      ...payload.multi_product.services_strip,
      ...((multiInput && multiInput.services_strip) || {}),
    },
    top_categories: {
      ...payload.multi_product.top_categories,
      ...((multiInput && multiInput.top_categories) || {}),
      limit: normalizeInteger(
        multiInput?.top_categories?.limit,
        payload.multi_product.top_categories.limit,
        1,
        12
      ),
      products_per_row: normalizeInteger(
        multiInput?.top_categories?.products_per_row,
        payload.multi_product.top_categories.products_per_row,
        1,
        8
      ),
    },
    featured_products: {
      ...payload.multi_product.featured_products,
      ...((multiInput && multiInput.featured_products) || {}),
      tabs:
        Array.isArray(multiInput?.featured_products?.tabs) &&
        multiInput.featured_products.tabs.length
          ? multiInput.featured_products.tabs.slice(0, 4)
          : payload.multi_product.featured_products.tabs,
      limit: normalizeInteger(
        multiInput?.featured_products?.limit,
        payload.multi_product.featured_products.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        multiInput?.featured_products?.products_per_row,
        payload.multi_product.featured_products.products_per_row,
        1,
        6
      ),
    },
    promo_tiles: {
      ...payload.multi_product.promo_tiles,
      ...((multiInput && multiInput.promo_tiles) || {}),
      items:
        Array.isArray(multiInput?.promo_tiles?.items) && multiInput.promo_tiles.items.length
          ? multiInput.promo_tiles.items.slice(0, 3).map((item) => ({
              title: normalizeNullable(item?.title) || '',
              subtitle: normalizeNullable(item?.subtitle) || '',
              button_label: normalizeNullable(item?.button_label) || '',
              image_url: normalizeNullable(item?.image_url) || '',
              bg: normalizeNullable(item?.bg) || '#f4f7ff',
            }))
          : payload.multi_product.promo_tiles.items,
    },
    best_sellers: {
      ...payload.multi_product.best_sellers,
      ...((multiInput && multiInput.best_sellers) || {}),
      limit: normalizeInteger(
        multiInput?.best_sellers?.limit,
        payload.multi_product.best_sellers.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        multiInput?.best_sellers?.products_per_row,
        payload.multi_product.best_sellers.products_per_row,
        1,
        6
      ),
    },
    deal_banner: {
      ...payload.multi_product.deal_banner,
      ...((multiInput && multiInput.deal_banner) || {}),
      image_url:
        normalizeNullable(multiInput?.deal_banner?.image_url) ||
        payload.multi_product.deal_banner.image_url,
    },
    latest_products: {
      ...payload.multi_product.latest_products,
      ...((multiInput && multiInput.latest_products) || {}),
      limit: normalizeInteger(
        multiInput?.latest_products?.limit,
        payload.multi_product.latest_products.limit,
        1,
        15
      ),
      products_per_row: normalizeInteger(
        multiInput?.latest_products?.products_per_row,
        payload.multi_product.latest_products.products_per_row,
        1,
        6
      ),
    },
    news: {
      ...payload.multi_product.news,
      ...((multiInput && multiInput.news) || {}),
      limit: normalizeInteger(
        multiInput?.news?.limit,
        payload.multi_product.news.limit,
        1,
        6
      ),
    },
    newsletter: {
      ...payload.multi_product.newsletter,
      ...((multiInput && multiInput.newsletter) || {}),
    },
    footer: {
      ...payload.multi_product.footer,
      ...((multiInput && multiInput.footer) || {}),
    },
  };

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

async function getWebsiteTemplateById(templateId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      slug,
      preview_image,
      template_code_key,
      description,
      is_premium,
      status,
      created_at,
      updated_at
    FROM website_templates
    WHERE id = ?
    LIMIT 1
    `,
    [templateId]
  );

  return rows[0] || null;
}

async function ensureBuiltInWebsiteTemplates() {
  for (const template of BUILT_IN_WEBSITE_TEMPLATES) {
    const [existingRows] = await pool.query(
      `
      SELECT id
      FROM website_templates
      WHERE LOWER(slug) = LOWER(?) OR LOWER(template_code_key) = LOWER(?)
      LIMIT 1
      `,
      [template.slug, template.template_code_key]
    );

    if (!existingRows.length) {
      await pool.query(
        `
        INSERT INTO website_templates
        (
          name,
          slug,
          preview_image,
          template_code_key,
          description,
          is_premium,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          template.name,
          template.slug,
          template.preview_image,
          normalizeCodeKey(template.template_code_key),
          template.description,
          template.is_premium,
          template.status,
        ]
      );
    }
  }
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      website_name,
      slug,
      status,
      created_at,
      updated_at
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getWebsiteDesignSettings(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      wds.id,
      wds.website_id,
      wds.website_template_id,
      wds.header_layout,
      wds.footer_layout,
      wds.mobile_menu_style,
      wds.color_scheme,
      wds.primary_color,
      wds.secondary_color,
      wds.accent_color,
      wds.font_family,
      wds.button_style,
      wds.card_style,
      wds.show_search,
      wds.show_categories_menu,
      wds.show_featured_slider,
      wds.custom_css,
      wds.template_settings_json,
      wds.created_at,
      wds.updated_at,

      wt.name AS template_name,
      wt.slug AS template_slug,
      wt.preview_image AS template_preview_image,
      wt.template_code_key,
      wt.is_premium AS template_is_premium,
      wt.status AS template_status

    FROM website_design_settings wds
    LEFT JOIN website_templates wt
      ON wt.id = wds.website_template_id
    WHERE wds.website_id = ?
    LIMIT 1
    `,
    [websiteId]
  );

  return rows[0] || null;
}

async function getMyDesignSettings(req, res) {
  try {
    await ensureBuiltInWebsiteTemplates();

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(404).json({
        ok: false,
        message: 'Affiliate website not found',
      });
    }

    const settings = await getWebsiteDesignSettings(website.id);

    return res.status(200).json({
      ok: true,
      settings: settings ? sanitizeDesignSettings(settings) : null,
    });
  } catch (error) {
    console.error('getMyDesignSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch design settings',
      error: error.message,
    });
  }
}

async function saveMyDesignSettings(req, res) {
  try {
    await ensureBuiltInWebsiteTemplates();

    const website = await getAffiliateWebsite(req.user.id);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before saving design settings',
      });
    }

    const existingSettings = await getWebsiteDesignSettings(website.id);

    const {
      website_template_id,
      header_layout,
      footer_layout,
      mobile_menu_style,
      color_scheme,
      primary_color,
      secondary_color,
      accent_color,
      font_family,
      button_style,
      card_style,
      show_search,
      show_categories_menu,
      show_featured_slider,
      custom_css,
      template_settings_json,
    } = req.body;

    let cleanWebsiteTemplateId = existingSettings?.website_template_id || null;

    if (website_template_id !== undefined) {
      if (website_template_id === null || website_template_id === '') {
        cleanWebsiteTemplateId = null;
      } else {
        cleanWebsiteTemplateId = Number(website_template_id);

        if (!Number.isInteger(cleanWebsiteTemplateId) || cleanWebsiteTemplateId <= 0) {
          return res.status(400).json({
            ok: false,
            message: 'Invalid website template id',
          });
        }

        const template = await getWebsiteTemplateById(cleanWebsiteTemplateId);

        if (!template || template.status !== 'active') {
          return res.status(400).json({
            ok: false,
            message: 'Selected website template is invalid or inactive',
          });
        }
      }
    }

    const mergedTemplateSettingsJson = buildTemplateSettingsJsonPayload(
      template_settings_json || {},
      existingSettings?.template_settings_json || {}
    );

    const payload = {
      website_template_id: cleanWebsiteTemplateId,
      header_layout: normalizeNullable(header_layout),
      footer_layout: normalizeNullable(footer_layout),
      mobile_menu_style: normalizeNullable(mobile_menu_style),
      color_scheme: normalizeNullable(color_scheme),
      primary_color: normalizeNullable(primary_color),
      secondary_color: normalizeNullable(secondary_color),
      accent_color: normalizeNullable(accent_color),
      font_family: normalizeNullable(font_family),
      button_style: normalizeNullable(button_style),
      card_style: normalizeNullable(card_style),
      show_search: normalizeBooleanFlag(
        show_search,
        existingSettings ? Number(existingSettings.show_search) : 1
      ),
      show_categories_menu: normalizeBooleanFlag(
        show_categories_menu,
        existingSettings ? Number(existingSettings.show_categories_menu) : 1
      ),
      show_featured_slider: normalizeBooleanFlag(
        show_featured_slider,
        existingSettings ? Number(existingSettings.show_featured_slider) : 1
      ),
      custom_css: normalizeNullable(custom_css),
      template_settings_json: JSON.stringify(mergedTemplateSettingsJson),
    };

    if (!existingSettings) {
      await pool.query(
        `
        INSERT INTO website_design_settings
        (
          website_id,
          website_template_id,
          header_layout,
          footer_layout,
          mobile_menu_style,
          color_scheme,
          primary_color,
          secondary_color,
          accent_color,
          font_family,
          button_style,
          card_style,
          show_search,
          show_categories_menu,
          show_featured_slider,
          custom_css,
          template_settings_json,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          website.id,
          payload.website_template_id,
          payload.header_layout,
          payload.footer_layout,
          payload.mobile_menu_style,
          payload.color_scheme,
          payload.primary_color,
          payload.secondary_color,
          payload.accent_color,
          payload.font_family,
          payload.button_style,
          payload.card_style,
          payload.show_search,
          payload.show_categories_menu,
          payload.show_featured_slider,
          payload.custom_css,
          payload.template_settings_json,
        ]
      );
    } else {
      await pool.query(
        `
        UPDATE website_design_settings
        SET
          website_template_id = ?,
          header_layout = ?,
          footer_layout = ?,
          mobile_menu_style = ?,
          color_scheme = ?,
          primary_color = ?,
          secondary_color = ?,
          accent_color = ?,
          font_family = ?,
          button_style = ?,
          card_style = ?,
          show_search = ?,
          show_categories_menu = ?,
          show_featured_slider = ?,
          custom_css = ?,
          template_settings_json = ?,
          updated_at = NOW()
        WHERE website_id = ?
        `,
        [
          payload.website_template_id,
          payload.header_layout,
          payload.footer_layout,
          payload.mobile_menu_style,
          payload.color_scheme,
          payload.primary_color,
          payload.secondary_color,
          payload.accent_color,
          payload.font_family,
          payload.button_style,
          payload.card_style,
          payload.show_search,
          payload.show_categories_menu,
          payload.show_featured_slider,
          payload.custom_css,
          payload.template_settings_json,
          website.id,
        ]
      );
    }

    const savedSettings = await getWebsiteDesignSettings(website.id);

    return res.status(200).json({
      ok: true,
      message: existingSettings
        ? 'Design settings updated successfully'
        : 'Design settings created successfully',
      settings: sanitizeDesignSettings(savedSettings),
    });
  } catch (error) {
    console.error('saveMyDesignSettings error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to save design settings',
      error: error.message,
    });
  }
}

async function getAvailableWebsiteTemplates(req, res) {
  try {
    await ensureBuiltInWebsiteTemplates();

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        slug,
        preview_image,
        template_code_key,
        description,
        is_premium,
        status,
        created_at,
        updated_at
      FROM website_templates
      WHERE status = 'active'
      ORDER BY is_premium ASC, id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      templates: rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        preview_image: row.preview_image,
        template_code_key: row.template_code_key,
        description: row.description,
        is_premium: !!row.is_premium,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('getAvailableWebsiteTemplates error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch website templates',
      error: error.message,
    });
  }
}

module.exports = {
  getMyDesignSettings,
  saveMyDesignSettings,
  getAvailableWebsiteTemplates,
};