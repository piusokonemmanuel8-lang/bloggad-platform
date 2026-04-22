import { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Save,
  LayoutTemplate,
  Settings2,
  Layers3,
} from 'lucide-react';
import api from '../../api/axios';
import '../../components/design/design.css';
import TemplateLibraryPanel from '../../components/design/TemplateLibraryPanel';
import TemplateBuilderRouter from '../../components/design/TemplateBuilderRouter';
import GeneralSettingsPanel from '../../components/design/GeneralSettingsPanel';

function getDefaultTemplateSettings() {
  return {
    premium_brand: {
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
        image_url: '',
      },
      promo_block_main: {
        enabled: true,
        title: 'Aurora Headset',
        button_label: 'Buy Now',
        countdown_days: '255',
        countdown_hours: '21',
        countdown_minutes: '11',
        countdown_seconds: '25',
        image_url: '',
      },
      promo_block_small_1: {
        enabled: true,
        title: 'New Dual Sense',
        subtitle: 'For PlayStation 5',
        button_label: 'View Details',
        image_url: '',
      },
      promo_block_small_2: {
        enabled: true,
        title: 'Instant Cameras',
        subtitle: 'Get photo paper as a gift',
        button_label: 'View Details',
        image_url: '',
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
    },
    mega_electronics: {
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
        image_url: '',
      },
      promo_block_main: {
        enabled: true,
        title: 'Featured Electronics',
        button_label: 'Buy Now',
        countdown_days: '120',
        countdown_hours: '12',
        countdown_minutes: '30',
        countdown_seconds: '45',
        image_url: '',
      },
      promo_block_small_1: {
        enabled: true,
        title: 'Gaming Gear',
        subtitle: 'Hot accessories',
        button_label: 'View Details',
        image_url: '',
      },
      promo_block_small_2: {
        enabled: true,
        title: 'Camera Deals',
        subtitle: 'Save on selected kits',
        button_label: 'View Details',
        image_url: '',
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
    },
    supplement_theme: {
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
    },
    furniture_theme: {
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
    },
    grocery_theme: {
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
    },
    multi_product: {
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
    },
    mextro: {
      top_strip: {
        enabled: true,
        message: 'FREE SHIPPING ON ORDERS $50+',
      },
      header: {
        search_placeholder: 'Search for products',
        categories_button_label: 'All Departments',
        account_label: 'Account',
        cart_label: 'Cart',
        track_order_label: 'Track Order',
        logo_text: 'Bloggad',
        logo_image_url: '',
        support_label: '+1 212-334-0212',
      },
      theme_mode: {
        enabled: true,
        default_mode: 'light',
        light_label: 'Light',
        dark_label: 'Dark',
      },
      hero_slider: {
        enabled: true,
        slides: [
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
        ],
      },
      hero_side_banner: {
        enabled: true,
        eyebrow: 'Weekend Discount',
        title: 'Gaming Accessories',
        subtitle: 'Save more on selected products and add-ons this week.',
        button_label: 'Shop Now',
        image_url: '',
        bg: '#f5f1e9',
      },
      category_icons: {
        enabled: true,
        title: 'Top Categories',
        limit: 8,
      },
      promo_banners: {
        enabled: true,
        items: [
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
        ],
      },
      featured_products: {
        enabled: true,
        title: 'Handpicked Items For You',
        limit: 8,
        products_per_row: 4,
      },
      dark_promos: {
        enabled: true,
        left_title: 'Cameras, Audio & Tech',
        left_subtitle: 'Strong weekly savings on selected gadgets.',
        left_button_label: 'Shop Now',
        left_image_url: '',
        right_title: 'Laptops & Accessories',
        right_subtitle: 'Premium products with standout performance.',
        right_button_label: 'Shop Now',
        right_image_url: '',
      },
      brand_row: {
        enabled: true,
        titles: ['TECHCOM', 'GADIX', 'NEXSO', 'DIGIT', 'ELECTRA', 'MAXON'],
      },
      news: {
        enabled: true,
        title: 'Recent Posts',
        limit: 3,
      },
      footer: {
        enabled: true,
        about_text:
          'Mextro is the Electro-style storefront inside Bloggad with fixed structure and editable content only.',
        phone: '+1 212-334-0212',
        email: 'support@bloggad.com',
        address: '27 Division St, New York, NY 10002, USA',
        copyright: '© 2026 Bloggad. All rights reserved.',
      },
    },
    xxam: {
      announcement_bar: {
        enabled: false,
        message: '',
      },
      header: {
        logo_text: 'Bloggad',
        logo_image_url: '',
        nav_links: ['Elements', 'Shop', 'Track Order', 'Blog', 'About us', 'Contacts'],
        show_search_icon: true,
        show_compare_icon: true,
        show_wishlist_icon: true,
        show_account_icon: true,
        sign_in_label: 'Sign In',
        cart_label: 'Cart',
        cart_amount_label: '$0.00',
      },
      theme_mode: {
        enabled: true,
        default_mode: 'light',
        light_label: 'Light',
        dark_label: 'Dark',
      },
      hero: {
        enabled: true,
        eyebrow: 'THE NEXT GENERATION',
        title: 'Innovation That Drives You',
        subtitle:
          'Discover modern electronics, premium accessories, and minimal design built to stand out.',
        button_label: 'Buy Now - $320',
        image_url: '',
        background_color: '#f3f3f5',
        floating_black_badge: '140+\nWebsites',
        floating_green_badge: 'Buy Now',
      },
      category_cards: {
        enabled: true,
        title: 'Shop by Category',
        limit: 4,
      },
      featured_products: {
        enabled: true,
        title: 'Featured Products',
        limit: 8,
        products_per_row: 4,
        show_quick_view: true,
      },
      promo_banners: {
        enabled: true,
        items: [
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
        ],
      },
      testimonials: {
        enabled: true,
        title: 'What Customers Say',
        item_one_name: 'Daniel M.',
        item_one_quote:
          'Clean, premium and exactly the kind of minimal electronics layout I wanted.',
        item_two_name: 'Sarah K.',
        item_two_quote: 'The product cards look modern and the shopping flow feels polished.',
        item_three_name: 'James T.',
        item_three_quote:
          'Strong premium feel without clutter. Very sharp storefront presentation.',
      },
      news: {
        enabled: true,
        title: 'Latest Articles',
        limit: 3,
      },
      services_strip: {
        enabled: true,
        item_one_title: 'Free Shipping',
        item_one_subtitle: 'For all orders over $99',
        item_two_title: '30 Days Return',
        item_two_subtitle: 'Money back guarantee',
        item_three_title: 'Secure Payment',
        item_three_subtitle: '100% protected checkout',
        item_four_title: '24/7 Support',
        item_four_subtitle: 'Dedicated live support',
      },
      footer: {
        enabled: true,
        about_text:
          'Xxam is the XStore-inspired minimal electronics storefront inside Bloggad with a fixed structure and editable content.',
        phone: '+1 212-334-0212',
        email: 'support@bloggad.com',
        address: '27 Division St, New York, NY 10002, USA',
        copyright: '© 2026 Bloggad. All rights reserved.',
      },
    },
  };
}

function mergeTemplateSettings(raw) {
  const defaults = getDefaultTemplateSettings();
  const parsed = raw && typeof raw === 'object' ? raw : {};

  return {
    premium_brand: {
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
    },
    mega_electronics: {
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
    },
    supplement_theme: {
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
      },
      newsletter: {
        ...defaults.supplement_theme.newsletter,
        ...((parsed.supplement_theme && parsed.supplement_theme.newsletter) || {}),
      },
      footer: {
        ...defaults.supplement_theme.footer,
        ...((parsed.supplement_theme && parsed.supplement_theme.footer) || {}),
      },
    },
    furniture_theme: {
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
                  slide?.title ||
                  defaults.furniture_theme.hero_slider.slides[index]?.title ||
                  '',
                subtitle:
                  slide?.subtitle ||
                  defaults.furniture_theme.hero_slider.slides[index]?.subtitle ||
                  '',
                button_label:
                  slide?.button_label ||
                  defaults.furniture_theme.hero_slider.slides[index]?.button_label ||
                  'Shop Now',
                image_url: slide?.image_url || '',
                badge:
                  slide?.badge ||
                  defaults.furniture_theme.hero_slider.slides[index]?.badge ||
                  '',
                accent:
                  slide?.accent ||
                  defaults.furniture_theme.hero_slider.slides[index]?.accent ||
                  '#f3ece4',
                text_color:
                  slide?.text_color ||
                  defaults.furniture_theme.hero_slider.slides[index]?.text_color ||
                  '#2a211b',
              }))
            : defaults.furniture_theme.hero_slider.slides,
      },
      new_arrivals: {
        ...defaults.furniture_theme.new_arrivals,
        ...((parsed.furniture_theme && parsed.furniture_theme.new_arrivals) || {}),
      },
      features_strip: {
        ...defaults.furniture_theme.features_strip,
        ...((parsed.furniture_theme && parsed.furniture_theme.features_strip) || {}),
      },
      recently_added: {
        ...defaults.furniture_theme.recently_added,
        ...((parsed.furniture_theme && parsed.furniture_theme.recently_added) || {}),
      },
      top_categories: {
        ...defaults.furniture_theme.top_categories,
        ...((parsed.furniture_theme && parsed.furniture_theme.top_categories) || {}),
      },
      popular_products: {
        ...defaults.furniture_theme.popular_products,
        ...((parsed.furniture_theme && parsed.furniture_theme.popular_products) || {}),
      },
      news: {
        ...defaults.furniture_theme.news,
        ...((parsed.furniture_theme && parsed.furniture_theme.news) || {}),
      },
      brand_row: {
        ...defaults.furniture_theme.brand_row,
        ...((parsed.furniture_theme && parsed.furniture_theme.brand_row) || {}),
      },
      newsletter: {
        ...defaults.furniture_theme.newsletter,
        ...((parsed.furniture_theme && parsed.furniture_theme.newsletter) || {}),
      },
      footer: {
        ...defaults.furniture_theme.footer,
        ...((parsed.furniture_theme && parsed.furniture_theme.footer) || {}),
      },
    },
    grocery_theme: {
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
                  slide?.eyebrow ||
                  defaults.grocery_theme.hero_slider.slides[index]?.eyebrow ||
                  '',
                title:
                  slide?.title ||
                  defaults.grocery_theme.hero_slider.slides[index]?.title ||
                  '',
                subtitle:
                  slide?.subtitle ||
                  defaults.grocery_theme.hero_slider.slides[index]?.subtitle ||
                  '',
                button_label:
                  slide?.button_label ||
                  defaults.grocery_theme.hero_slider.slides[index]?.button_label ||
                  'Go to Shop',
                secondary_button_label:
                  slide?.secondary_button_label ||
                  defaults.grocery_theme.hero_slider.slides[index]?.secondary_button_label ||
                  'Learn More',
                image_url: slide?.image_url || '',
                badge:
                  slide?.badge || defaults.grocery_theme.hero_slider.slides[index]?.badge || '',
                accent:
                  slide?.accent ||
                  defaults.grocery_theme.hero_slider.slides[index]?.accent ||
                  '#f4fff2',
                text_color:
                  slide?.text_color ||
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
                  item?.title || defaults.grocery_theme.hero_banners.items[index]?.title || '',
                subtitle:
                  item?.subtitle ||
                  defaults.grocery_theme.hero_banners.items[index]?.subtitle ||
                  '',
                image_url: item?.image_url || '',
                bg:
                  item?.bg ||
                  defaults.grocery_theme.hero_banners.items[index]?.bg ||
                  '#fff4df',
              }))
            : defaults.grocery_theme.hero_banners.items,
      },
      category_chips: {
        ...defaults.grocery_theme.category_chips,
        ...((parsed.grocery_theme && parsed.grocery_theme.category_chips) || {}),
      },
      featured_products: {
        ...defaults.grocery_theme.featured_products,
        ...((parsed.grocery_theme && parsed.grocery_theme.featured_products) || {}),
      },
      features_strip: {
        ...defaults.grocery_theme.features_strip,
        ...((parsed.grocery_theme && parsed.grocery_theme.features_strip) || {}),
      },
      top_categories: {
        ...defaults.grocery_theme.top_categories,
        ...((parsed.grocery_theme && parsed.grocery_theme.top_categories) || {}),
      },
      latest_products: {
        ...defaults.grocery_theme.latest_products,
        ...((parsed.grocery_theme && parsed.grocery_theme.latest_products) || {}),
      },
      news: {
        ...defaults.grocery_theme.news,
        ...((parsed.grocery_theme && parsed.grocery_theme.news) || {}),
      },
      newsletter: {
        ...defaults.grocery_theme.newsletter,
        ...((parsed.grocery_theme && parsed.grocery_theme.newsletter) || {}),
      },
      footer: {
        ...defaults.grocery_theme.footer,
        ...((parsed.grocery_theme && parsed.grocery_theme.footer) || {}),
      },
    },
    multi_product: {
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
        slides:
          Array.isArray(parsed?.multi_product?.hero_slider?.slides) &&
          parsed.multi_product.hero_slider.slides.length
            ? parsed.multi_product.hero_slider.slides.slice(0, 5).map((slide, index) => ({
                id: slide?.id || `multi-slide-${index + 1}`,
                eyebrow:
                  slide?.eyebrow ||
                  defaults.multi_product.hero_slider.slides[index]?.eyebrow ||
                  '',
                title:
                  slide?.title ||
                  defaults.multi_product.hero_slider.slides[index]?.title ||
                  '',
                subtitle:
                  slide?.subtitle ||
                  defaults.multi_product.hero_slider.slides[index]?.subtitle ||
                  '',
                button_label:
                  slide?.button_label ||
                  defaults.multi_product.hero_slider.slides[index]?.button_label ||
                  'Shop Now',
                secondary_button_label:
                  slide?.secondary_button_label ||
                  defaults.multi_product.hero_slider.slides[index]?.secondary_button_label ||
                  'Explore Deals',
                image_url: slide?.image_url || '',
                badge:
                  slide?.badge || defaults.multi_product.hero_slider.slides[index]?.badge || '',
                accent:
                  slide?.accent ||
                  defaults.multi_product.hero_slider.slides[index]?.accent ||
                  '#f2f3f7',
                text_color:
                  slide?.text_color ||
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
      },
      featured_products: {
        ...defaults.multi_product.featured_products,
        ...((parsed.multi_product && parsed.multi_product.featured_products) || {}),
        tabs:
          Array.isArray(parsed?.multi_product?.featured_products?.tabs) &&
          parsed.multi_product.featured_products.tabs.length
            ? parsed.multi_product.featured_products.tabs.slice(0, 4)
            : defaults.multi_product.featured_products.tabs,
      },
      promo_tiles: {
        ...defaults.multi_product.promo_tiles,
        ...((parsed.multi_product && parsed.multi_product.promo_tiles) || {}),
        items:
          Array.isArray(parsed?.multi_product?.promo_tiles?.items) &&
          parsed.multi_product.promo_tiles.items.length
            ? parsed.multi_product.promo_tiles.items.slice(0, 3).map((item, index) => ({
                title:
                  item?.title || defaults.multi_product.promo_tiles.items[index]?.title || '',
                subtitle:
                  item?.subtitle ||
                  defaults.multi_product.promo_tiles.items[index]?.subtitle ||
                  '',
                button_label:
                  item?.button_label ||
                  defaults.multi_product.promo_tiles.items[index]?.button_label ||
                  '',
                image_url: item?.image_url || '',
                bg:
                  item?.bg ||
                  defaults.multi_product.promo_tiles.items[index]?.bg ||
                  '#f4f7ff',
              }))
            : defaults.multi_product.promo_tiles.items,
      },
      best_sellers: {
        ...defaults.multi_product.best_sellers,
        ...((parsed.multi_product && parsed.multi_product.best_sellers) || {}),
      },
      deal_banner: {
        ...defaults.multi_product.deal_banner,
        ...((parsed.multi_product && parsed.multi_product.deal_banner) || {}),
      },
      latest_products: {
        ...defaults.multi_product.latest_products,
        ...((parsed.multi_product && parsed.multi_product.latest_products) || {}),
      },
      news: {
        ...defaults.multi_product.news,
        ...((parsed.multi_product && parsed.multi_product.news) || {}),
      },
      newsletter: {
        ...defaults.multi_product.newsletter,
        ...((parsed.multi_product && parsed.multi_product.newsletter) || {}),
      },
      footer: {
        ...defaults.multi_product.footer,
        ...((parsed.multi_product && parsed.multi_product.footer) || {}),
      },
    },
    mextro: {
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
                  slide?.eyebrow ||
                  defaults.mextro.hero_slider.slides[index]?.eyebrow ||
                  '',
                title: slide?.title || defaults.mextro.hero_slider.slides[index]?.title || '',
                subtitle:
                  slide?.subtitle ||
                  defaults.mextro.hero_slider.slides[index]?.subtitle ||
                  '',
                button_label:
                  slide?.button_label ||
                  defaults.mextro.hero_slider.slides[index]?.button_label ||
                  'Shop Now',
                image_url: slide?.image_url || '',
                badge:
                  slide?.badge || defaults.mextro.hero_slider.slides[index]?.badge || '',
                accent:
                  slide?.accent ||
                  defaults.mextro.hero_slider.slides[index]?.accent ||
                  '#fed700',
                text_color:
                  slide?.text_color ||
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
      },
      promo_banners: {
        ...defaults.mextro.promo_banners,
        ...((parsed.mextro && parsed.mextro.promo_banners) || {}),
        items:
          Array.isArray(parsed?.mextro?.promo_banners?.items) &&
          parsed.mextro.promo_banners.items.length
            ? parsed.mextro.promo_banners.items.slice(0, 3).map((item, index) => ({
                title: item?.title || defaults.mextro.promo_banners.items[index]?.title || '',
                subtitle:
                  item?.subtitle || defaults.mextro.promo_banners.items[index]?.subtitle || '',
                button_label:
                  item?.button_label ||
                  defaults.mextro.promo_banners.items[index]?.button_label ||
                  'Shop Now',
                image_url: item?.image_url || '',
                bg: item?.bg || defaults.mextro.promo_banners.items[index]?.bg || '#f7f7f7',
              }))
            : defaults.mextro.promo_banners.items,
      },
      featured_products: {
        ...defaults.mextro.featured_products,
        ...((parsed.mextro && parsed.mextro.featured_products) || {}),
      },
      dark_promos: {
        ...defaults.mextro.dark_promos,
        ...((parsed.mextro && parsed.mextro.dark_promos) || {}),
      },
      brand_row: {
        ...defaults.mextro.brand_row,
        ...((parsed.mextro && parsed.mextro.brand_row) || {}),
      },
      news: {
        ...defaults.mextro.news,
        ...((parsed.mextro && parsed.mextro.news) || {}),
      },
      footer: {
        ...defaults.mextro.footer,
        ...((parsed.mextro && parsed.mextro.footer) || {}),
      },
    },
    xxam: {
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
          Array.isArray(parsed?.xxam?.header?.nav_links) &&
          parsed.xxam.header.nav_links.length
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
      },
      featured_products: {
        ...defaults.xxam.featured_products,
        ...((parsed.xxam && parsed.xxam.featured_products) || {}),
      },
      promo_banners: {
        ...defaults.xxam.promo_banners,
        ...((parsed.xxam && parsed.xxam.promo_banners) || {}),
        items:
          Array.isArray(parsed?.xxam?.promo_banners?.items) &&
          parsed.xxam.promo_banners.items.length
            ? parsed.xxam.promo_banners.items.slice(0, 2).map((item, index) => ({
                title: item?.title || defaults.xxam.promo_banners.items[index]?.title || '',
                subtitle:
                  item?.subtitle || defaults.xxam.promo_banners.items[index]?.subtitle || '',
                button_label:
                  item?.button_label ||
                  defaults.xxam.promo_banners.items[index]?.button_label ||
                  'Shop Now',
                image_url: item?.image_url || '',
                bg: item?.bg || defaults.xxam.promo_banners.items[index]?.bg || '#f3f3f5',
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
      },
      services_strip: {
        ...defaults.xxam.services_strip,
        ...((parsed.xxam && parsed.xxam.services_strip) || {}),
      },
      footer: {
        ...defaults.xxam.footer,
        ...((parsed.xxam && parsed.xxam.footer) || {}),
      },
    },
  };
}

function getEmptyForm() {
  return {
    website_template_id: '',
    header_layout: '',
    footer_layout: '',
    mobile_menu_style: '',
    color_scheme: '',
    primary_color: '',
    secondary_color: '',
    accent_color: '',
    font_family: '',
    button_style: '',
    card_style: '',
    show_search: true,
    show_categories_menu: true,
    show_featured_slider: true,
    custom_css: '',
    template_settings_json: getDefaultTemplateSettings(),
  };
}

function isTemplateWithBuilder(codeKey = '') {
  return [
    'premium_brand',
    'mega_electronics',
    'supplement_theme',
    'furniture_theme',
    'grocery_theme',
    'multi_product',
    'mextro',
    'mextro_theme',
    'mextro_store',
    'mextro_template',
    'xxam',
    'xxam_theme',
    'xxam_store',
    'xxam_template',
  ].includes(String(codeKey || '').trim().toLowerCase());
}

function setDeepValue(object, path, value) {
  const next =
    typeof structuredClone === 'function'
      ? structuredClone(object)
      : JSON.parse(JSON.stringify(object));

  const keys = path.split('.');
  let cursor = next;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = /^\d+$/.test(keys[i]) ? Number(keys[i]) : keys[i];
    const nextKey = /^\d+$/.test(keys[i + 1]) ? [] : {};

    if (cursor[key] === undefined || cursor[key] === null || typeof cursor[key] !== 'object') {
      cursor[key] = nextKey;
    }

    cursor = cursor[key];
  }

  const finalKey = /^\d+$/.test(keys[keys.length - 1])
    ? Number(keys[keys.length - 1])
    : keys[keys.length - 1];
  cursor[finalKey] = value;

  return next;
}

export default function AffiliateDesignPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(getEmptyForm());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('library');
  const [selectedBuilderTemplateId, setSelectedBuilderTemplateId] = useState('');
  const [uploadState, setUploadState] = useState({
    hero_slider: false,
    promo_block_main: false,
    promo_block_small_1: false,
    promo_block_small_2: false,
    supp_hero: false,
    supp_promo_one: false,
    supp_promo_two: false,
    supp_large_promo: false,
    furniture_slide_1: false,
    furniture_slide_2: false,
    furniture_slide_3: false,
    furniture_slide_4: false,
    furniture_slide_5: false,
    grocery_slide_1: false,
    grocery_slide_2: false,
    grocery_slide_3: false,
    grocery_slide_4: false,
    grocery_slide_5: false,
    grocery_banner_1: false,
    grocery_banner_2: false,
    multi_logo: false,
    multi_slide_1: false,
    multi_slide_2: false,
    multi_slide_3: false,
    multi_slide_4: false,
    multi_slide_5: false,
    multi_hero_banner: false,
    multi_promo_tile_1: false,
    multi_promo_tile_2: false,
    multi_promo_tile_3: false,
    multi_deal_banner: false,
    mextro_logo: false,
    mextro_slide_1: false,
    mextro_slide_2: false,
    mextro_slide_3: false,
    mextro_slide_4: false,
    mextro_slide_5: false,
    mextro_hero_side_banner: false,
    mextro_promo_banner_1: false,
    mextro_promo_banner_2: false,
    mextro_promo_banner_3: false,
    mextro_dark_promo_left: false,
    mextro_dark_promo_right: false,
    xxam_logo: false,
    xxam_hero_image: false,
    xxam_promo_banner_1: false,
    xxam_promo_banner_2: false,
  });

  const fetchData = async (isRefresh = false) => {
    try {
      setError('');
      setSuccess('');

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [settingsRes, templatesRes] = await Promise.all([
        api.get('/api/affiliate/design'),
        api.get('/api/affiliate/design/templates'),
      ]);

      const settings = settingsRes?.data?.settings || null;
      const templateList = templatesRes?.data?.templates || [];

      setTemplates(templateList);

      if (settings) {
        setForm({
          website_template_id: settings.website_template_id || '',
          header_layout: settings.header_layout || '',
          footer_layout: settings.footer_layout || '',
          mobile_menu_style: settings.mobile_menu_style || '',
          color_scheme: settings.color_scheme || '',
          primary_color: settings.primary_color || '',
          secondary_color: settings.secondary_color || '',
          accent_color: settings.accent_color || '',
          font_family: settings.font_family || '',
          button_style: settings.button_style || '',
          card_style: settings.card_style || '',
          show_search: !!settings.show_search,
          show_categories_menu: !!settings.show_categories_menu,
          show_featured_slider: !!settings.show_featured_slider,
          custom_css: settings.custom_css || '',
          template_settings_json: mergeTemplateSettings(settings.template_settings_json || {}),
        });

        if (settings.website_template_id) {
          setSelectedBuilderTemplateId(String(settings.website_template_id));
        }
      } else {
        setForm(getEmptyForm());
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load design settings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTemplateSettingTextChange = (path, value) => {
    setForm((prev) => ({
      ...prev,
      template_settings_json: setDeepValue(prev.template_settings_json, path, value),
    }));
  };

  const handleTemplateSettingToggleChange = (path, checked) => {
    handleTemplateSettingTextChange(path, checked);
  };

  const handleTemplateSettingNumberChange = (path, value) => {
    const parsed = Number(value);
    handleTemplateSettingTextChange(path, Number.isFinite(parsed) ? parsed : value);
  };

  const handleImageUpload = async (event, path, uploadKey) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploadState((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post('/api/uploads/template-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = data?.file?.url || '';
      if (!uploadedUrl) {
        throw new Error('Upload did not return file url');
      }

      handleTemplateSettingTextChange(path, uploadedUrl);
      setSuccess('Image uploaded successfully. Save design settings to apply it.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload image');
    } finally {
      setUploadState((prev) => ({ ...prev, [uploadKey]: false }));
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        website_template_id: form.website_template_id || null,
        header_layout: form.header_layout,
        footer_layout: form.footer_layout,
        mobile_menu_style: form.mobile_menu_style,
        color_scheme: form.color_scheme,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        accent_color: form.accent_color,
        font_family: form.font_family,
        button_style: form.button_style,
        card_style: form.card_style,
        show_search: form.show_search,
        show_categories_menu: form.show_categories_menu,
        show_featured_slider: form.show_featured_slider,
        custom_css: form.custom_css,
        template_settings_json: form.template_settings_json,
      };

      const { data } = await api.put('/api/affiliate/design', payload);

      if (data?.ok) {
        setSuccess(data.message || 'Design settings saved successfully');

        if (data?.settings) {
          setForm((prev) => ({
            ...prev,
            website_template_id: data.settings.website_template_id || prev.website_template_id,
            header_layout: data.settings.header_layout || prev.header_layout,
            footer_layout: data.settings.footer_layout || prev.footer_layout,
            mobile_menu_style: data.settings.mobile_menu_style || prev.mobile_menu_style,
            color_scheme: data.settings.color_scheme || prev.color_scheme,
            primary_color: data.settings.primary_color || prev.primary_color,
            secondary_color: data.settings.secondary_color || prev.secondary_color,
            accent_color: data.settings.accent_color || prev.accent_color,
            font_family: data.settings.font_family || prev.font_family,
            button_style: data.settings.button_style || prev.button_style,
            card_style: data.settings.card_style || prev.card_style,
            show_search: !!data.settings.show_search,
            show_categories_menu: !!data.settings.show_categories_menu,
            show_featured_slider: !!data.settings.show_featured_slider,
            custom_css: data.settings.custom_css || prev.custom_css,
            template_settings_json: mergeTemplateSettings(
              data.settings.template_settings_json || prev.template_settings_json
            ),
          }));
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save design settings');
    } finally {
      setSaving(false);
    }
  };

  const currentTemplate = useMemo(() => {
    return templates.find((item) => String(item.id) === String(form.website_template_id)) || null;
  }, [templates, form.website_template_id]);

  const builderTemplate = useMemo(() => {
    return (
      templates.find((item) => String(item.id) === String(selectedBuilderTemplateId)) ||
      currentTemplate ||
      null
    );
  }, [templates, selectedBuilderTemplateId, currentTemplate]);

  const currentTemplateCodeKey = useMemo(() => {
    return String(currentTemplate?.template_code_key || '').trim().toLowerCase();
  }, [currentTemplate]);

  const builderTemplateCodeKey = useMemo(() => {
    return String(builderTemplate?.template_code_key || '').trim().toLowerCase();
  }, [builderTemplate]);

  const showBuilder = isTemplateWithBuilder(builderTemplateCodeKey);

  const handleSelectTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      website_template_id: String(template.id),
    }));
    setSelectedBuilderTemplateId(String(template.id));
    setSuccess(`Selected ${template.name}. Save design settings to apply it.`);
  };

  const handleOpenBuilder = (template) => {
    setSelectedBuilderTemplateId(String(template.id));
    setActiveTab('builder');
  };

  const tabItems = [
    { key: 'library', label: 'Template Library', icon: LayoutTemplate },
    { key: 'general', label: 'General Settings', icon: Settings2 },
    { key: 'builder', label: 'Template Builder', icon: Layers3 },
  ];

  if (loading) {
    return (
      <div className="affiliate-design-page">
        <div className="affiliate-design-loading-wrap">
          <div className="affiliate-design-loading-card">
            <div className="affiliate-design-spinner" />
            <p>Loading design settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-design-page">
      <section className="affiliate-design-hero">
        <div className="affiliate-design-hero-copy">
          <div className="affiliate-design-badge">Website appearance</div>
          <h1 className="affiliate-design-title">Design Settings</h1>
          <p className="affiliate-design-subtitle">
            One main design page, one template library, and one builder area. Select a template,
            then open its dedicated builder without turning this page into one giant file.
          </p>
        </div>

        <div className="affiliate-design-hero-actions">
          <button
            className="affiliate-design-btn secondary"
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            className="affiliate-design-btn primary"
            type="submit"
            form="affiliate-design-form"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Design'}
          </button>
        </div>
      </section>

      <section className="affiliate-design-stats">
        <div className="affiliate-design-stat-card">
          <div className="affiliate-design-stat-icon">
            <LayoutTemplate size={18} />
          </div>
          <div>
            <div className="affiliate-design-stat-value">{templates.length}</div>
            <div className="affiliate-design-stat-label">Available templates</div>
          </div>
        </div>

        <div className="affiliate-design-stat-card">
          <div className="affiliate-design-stat-icon">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="affiliate-design-stat-value">
              {currentTemplate?.name || 'No template'}
            </div>
            <div className="affiliate-design-stat-label">Selected template</div>
          </div>
        </div>

        <div className="affiliate-design-stat-card">
          <div className="affiliate-design-stat-icon">
            <Layers3 size={18} />
          </div>
          <div>
            <div className="affiliate-design-stat-value">
              {showBuilder ? builderTemplate?.name || 'Builder ready' : 'Not supported'}
            </div>
            <div className="affiliate-design-stat-label">Builder status</div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="affiliate-design-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div className="affiliate-design-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      ) : null}

      <div className="affiliate-design-tabs">
        {tabItems.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              className={`affiliate-design-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form id="affiliate-design-form" onSubmit={handleSubmit} className="affiliate-design-body">
        {activeTab === 'library' ? (
          <TemplateLibraryPanel
            templates={templates}
            currentTemplateId={form.website_template_id}
            selectedBuilderId={selectedBuilderTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onOpenBuilder={handleOpenBuilder}
          />
        ) : null}

        {activeTab === 'general' ? (
          <GeneralSettingsPanel form={form} onChange={handleChange} />
        ) : null}

        {activeTab === 'builder' ? (
          <div className="affiliate-design-builder-wrap">
            {showBuilder ? (
              <TemplateBuilderRouter
                templateCodeKey={builderTemplateCodeKey}
                settings={form.template_settings_json}
                onTextChange={handleTemplateSettingTextChange}
                onToggleChange={handleTemplateSettingToggleChange}
                onNumberChange={handleTemplateSettingNumberChange}
                onImageUpload={handleImageUpload}
                uploadState={uploadState}
              />
            ) : (
              <div className="affiliate-design-empty-builder">
                <div className="affiliate-design-empty-builder-icon">
                  <Layers3 size={20} />
                </div>
                <h3>Builder not available</h3>
                <p>
                  Select a supported template from the library and open its builder. Current code
                  key: {builderTemplateCodeKey || currentTemplateCodeKey || 'none'}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </form>
    </div>
  );
}