import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  Menu,
  Minus,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  User,
  X,
  Plus,
  RefreshCcw,
  BadgePercent,
  Mail,
  MapPin,
} from 'lucide-react';

function renderPrice(product, formatCurrency) {
  if (!product) return '-';

  if (product?.pricing_type === 'simple') {
    return product?.price !== null && product?.price !== undefined
      ? formatCurrency(product.price)
      : '-';
  }

  const min = product?.min_price ?? product?.price ?? 0;
  const max = product?.max_price ?? product?.price ?? 0;
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

function resolveMenuUrl(item, websiteSlug = '') {
  return item?.resolved_url || item?.custom_url || `/${websiteSlug}`;
}

function resolveWebsiteSlug(product, fallbackWebsiteSlug = '') {
  return (
    product?.website_slug ||
    product?.website?.slug ||
    product?.affiliate?.website_slug ||
    product?.affiliate?.website?.slug ||
    fallbackWebsiteSlug
  );
}

function resolveReadMoreUrl(product, fallbackWebsiteSlug = '') {
  if (product?.read_more_url) return product.read_more_url;
  if (product?.review_url) return product.review_url;

  const websiteSlug = resolveWebsiteSlug(product, fallbackWebsiteSlug);
  if (websiteSlug && product?.slug) return `/${websiteSlug}/product/${product.slug}`;
  if (product?.slug) return `/product/${product.slug}`;
  return '#';
}

function resolveReviewUrl(product, fallbackWebsiteSlug = '') {
  return (
    product?.review_url ||
    product?.review_site_url ||
    product?.external_review_url ||
    resolveReadMoreUrl(product, fallbackWebsiteSlug)
  );
}

function getSafeImage(customUrl, fallbackUrl) {
  return customUrl || fallbackUrl || '';
}

function fallbackCategories(websiteSlug = '') {
  return [
    {
      id: 'mp-cat-1',
      name: 'Electronics',
      slug: 'electronics',
      total_products: 18,
      url: `/${websiteSlug}/category/electronics`,
      children: [
        { name: 'Smart Watches', slug: 'smart-watches' },
        { name: 'Wireless Audio', slug: 'wireless-audio' },
        { name: 'Gaming Gear', slug: 'gaming-gear' },
      ],
    },
    {
      id: 'mp-cat-2',
      name: 'Home Appliances',
      slug: 'home-appliances',
      total_products: 14,
      url: `/${websiteSlug}/category/home-appliances`,
      children: [
        { name: 'Kitchen Tools', slug: 'kitchen-tools' },
        { name: 'Smart Home', slug: 'smart-home' },
        { name: 'Cleaning', slug: 'cleaning' },
      ],
    },
    {
      id: 'mp-cat-3',
      name: 'Fashion',
      slug: 'fashion',
      total_products: 12,
      url: `/${websiteSlug}/category/fashion`,
      children: [
        { name: 'Trending Wear', slug: 'trending-wear' },
        { name: 'Sneakers', slug: 'sneakers' },
        { name: 'Accessories', slug: 'accessories' },
      ],
    },
    {
      id: 'mp-cat-4',
      name: 'Health & Beauty',
      slug: 'health-beauty',
      total_products: 11,
      url: `/${websiteSlug}/category/health-beauty`,
      children: [
        { name: 'Skincare', slug: 'skincare' },
        { name: 'Wellness', slug: 'wellness' },
        { name: 'Hair Care', slug: 'hair-care' },
      ],
    },
    {
      id: 'mp-cat-5',
      name: 'Office',
      slug: 'office',
      total_products: 10,
      url: `/${websiteSlug}/category/office`,
      children: [
        { name: 'Laptops', slug: 'laptops' },
        { name: 'Accessories', slug: 'office-accessories' },
        { name: 'Printers', slug: 'printers' },
      ],
    },
    {
      id: 'mp-cat-6',
      name: 'Sports',
      slug: 'sports',
      total_products: 9,
      url: `/${websiteSlug}/category/sports`,
      children: [
        { name: 'Outdoor', slug: 'outdoor' },
        { name: 'Fitness', slug: 'fitness' },
        { name: 'Recovery', slug: 'recovery' },
      ],
    },
    {
      id: 'mp-cat-7',
      name: 'Toys & Games',
      slug: 'toys-games',
      total_products: 8,
      url: `/${websiteSlug}/category/toys-games`,
      children: [
        { name: 'Family Games', slug: 'family-games' },
        { name: 'Kids Picks', slug: 'kids-picks' },
        { name: 'Fun Deals', slug: 'fun-deals' },
      ],
    },
    {
      id: 'mp-cat-8',
      name: 'Automotive',
      slug: 'automotive',
      total_products: 7,
      url: `/${websiteSlug}/category/automotive`,
      children: [
        { name: 'Car Care', slug: 'car-care' },
        { name: 'Accessories', slug: 'auto-accessories' },
        { name: 'Maintenance', slug: 'maintenance' },
      ],
    },
  ];
}

function fallbackProducts(websiteSlug = '') {
  const imagePool = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80',
  ];

  const categories = [
    'Electronics',
    'Home Appliances',
    'Fashion',
    'Health & Beauty',
    'Office',
    'Sports',
    'Toys & Games',
    'Automotive',
  ];

  const titles = [
    'Premium Smart Watch',
    'Wireless Headphones',
    'Minimal Laptop Stand',
    'Portable Bluetooth Speaker',
    'Ultra HD Camera',
    'Smartphone Pro Max',
    'Gaming Controller',
    'Noise Cancelling Earbuds',
    'Compact Espresso Maker',
    'Designer Sunglasses',
    'Running Sneakers',
    'Fitness Smart Band',
    'Travel Backpack',
    'Portable Vacuum Cleaner',
    'Digital Office Keyboard',
  ];

  return Array.from({ length: 15 }, (_, index) => ({
    id: `multi-product-${index + 1}`,
    slug: `multi-product-${index + 1}`,
    title: titles[index] || `Multi Product ${index + 1}`,
    product_image: imagePool[index % imagePool.length],
    pricing_type: index % 4 === 0 ? 'variable' : 'simple',
    price: 35 + index * 6,
    min_price: 35 + index * 6,
    max_price: 55 + index * 8,
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    short_description:
      'Multi Product template demo product with premium storefront styling and editable content fields.',
    category: {
      id: `mp-category-${index + 1}`,
      name: categories[index % categories.length],
      slug: categories[index % categories.length].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    affiliate: {
      website_name: 'Blogguard Store',
      website_slug: websiteSlug,
      name: 'Blogguard',
    },
    website_slug: websiteSlug,
    website_url: `/${websiteSlug}`,
    read_more_url: `/${websiteSlug}/post/article-${(index % 4) + 1}`,
    affiliate_buy_url: '#',
    review_url: `/${websiteSlug}/post/article-${(index % 4) + 1}`,
    status: 'published',
    badge:
      index % 5 === 0 ? 'HOT' : index % 4 === 0 ? 'NEW' : index % 3 === 0 ? '-20%' : null,
  }));
}

function fallbackArticles(websiteSlug = '') {
  const images = [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
  ];

  return Array.from({ length: 3 }, (_, i) => ({
    id: `mp-article-${i + 1}`,
    title:
      i === 0
        ? 'How to choose the right gadgets for daily productivity'
        : i === 1
        ? 'Top multi-category shopping trends this season'
        : 'Best smart accessories buyers are saving right now',
    excerpt:
      'Discover product trends, buyer tips, and the best ways to structure a premium affiliate storefront.',
    featured_image: images[i],
    category: {
      name: i === 0 ? 'Guides' : i === 1 ? 'Trends' : 'Deals',
    },
    slug: `article-${i + 1}`,
    url: `/${websiteSlug}/post/article-${i + 1}`,
    published_at: '2026-04-20',
    author_name: 'Blogguard',
  }));
}

function getTemplateConfig(settings, website, products) {
  const raw = settings?.template_settings_json?.multi_product || settings?.multi_product || {};
  const fallbackLogoText =
    website?.website_name || website?.name || website?.title || 'Blogguard';

  const defaultSlides = [
    {
      id: 'multi-slide-1',
      eyebrow: 'Best multi-store deals',
      title: 'The best home \nand accessories',
      subtitle:
        'Shop premium electronics, fashion, home appliances and accessories from one clean storefront.',
      button_label: 'Shop Now',
      secondary_button_label: 'Explore Deals',
      image_url:
        products?.[0]?.product_image ||
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
      badge: 'Daily Deal',
      accent: '#f2f3f7',
      text_color: '#0f172a',
    },
    {
      id: 'multi-slide-2',
      eyebrow: 'Premium picks',
      title: 'Trending products \nfor every room',
      subtitle:
        'Get sharp product visuals, smart categories, and premium multi-product shopping sections.',
      button_label: 'Shop Now',
      secondary_button_label: 'View Offers',
      image_url:
        products?.[1]?.product_image ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80',
      badge: 'Top Rated',
      accent: '#edf3ff',
      text_color: '#0f172a',
    },
    {
      id: 'multi-slide-3',
      eyebrow: 'New arrivals',
      title: 'Simple shopping \nwith big value',
      subtitle:
        'Give your storefront the full multi-product structure with banners, tabs, icons and cards.',
      button_label: 'Shop Now',
      secondary_button_label: 'Read More',
      image_url:
        products?.[2]?.product_image ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
      badge: 'Fresh Drop',
      accent: '#f5f7ec',
      text_color: '#0f172a',
    },
  ];

  const slides =
    Array.isArray(raw?.hero_slider?.slides) && raw.hero_slider.slides.length
      ? raw.hero_slider.slides.slice(0, 5).map((slide, index) => ({
          id: slide?.id || `multi-slide-${index + 1}`,
          eyebrow: slide?.eyebrow || defaultSlides[index]?.eyebrow || '',
          title: slide?.title || defaultSlides[index]?.title || '',
          subtitle: slide?.subtitle || defaultSlides[index]?.subtitle || '',
          button_label: slide?.button_label || defaultSlides[index]?.button_label || 'Shop Now',
          secondary_button_label:
            slide?.secondary_button_label ||
            defaultSlides[index]?.secondary_button_label ||
            'Explore Deals',
          image_url: slide?.image_url || defaultSlides[index]?.image_url || '',
          badge: slide?.badge || defaultSlides[index]?.badge || '',
          accent: slide?.accent || defaultSlides[index]?.accent || '#f2f3f7',
          text_color: slide?.text_color || defaultSlides[index]?.text_color || '#0f172a',
        }))
      : defaultSlides;

  const rightBanner = {
    enabled: raw?.hero_banner?.enabled !== false,
    eyebrow: raw?.hero_banner?.eyebrow || 'Big Saving',
    title: raw?.hero_banner?.title || 'Sale 30% Off On Selected Items',
    subtitle:
      raw?.hero_banner?.subtitle || 'Strong promo area beside slider, exactly for this template.',
    button_label: raw?.hero_banner?.button_label || 'Shop Now',
    image_url:
      raw?.hero_banner?.image_url ||
      products?.[3]?.product_image ||
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    bg: raw?.hero_banner?.bg || '#ffe9d8',
  };

  const promoTiles =
    Array.isArray(raw?.promo_tiles?.items) && raw.promo_tiles.items.length
      ? raw.promo_tiles.items.slice(0, 3)
      : [
          {
            title: 'Free Delivery',
            subtitle: 'For eligible orders',
            button_label: 'More Info',
            image_url:
              products?.[4]?.product_image ||
              'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80',
            bg: '#f4f7ff',
          },
          {
            title: 'Latest Gadgets',
            subtitle: 'Shop smart devices',
            button_label: 'See Deals',
            image_url:
              products?.[5]?.product_image ||
              'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
            bg: '#fff8eb',
          },
          {
            title: 'Top Fashion Picks',
            subtitle: 'Sharp daily offers',
            button_label: 'Browse',
            image_url:
              products?.[6]?.product_image ||
              'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
            bg: '#eef9f2',
          },
        ];

  return {
    announcement_bar: {
      enabled: raw?.announcement_bar?.enabled !== false,
      left_text: raw?.announcement_bar?.left_text || 'Free shipping on orders over $99',
      center_text: raw?.announcement_bar?.center_text || '30 days easy returns',
      right_text: raw?.announcement_bar?.right_text || 'Support available 24/7',
    },
    header: {
      search_placeholder: raw?.header?.search_placeholder || 'Search for products',
      account_label: raw?.header?.account_label || 'My Account',
      cart_label: raw?.header?.cart_label || 'Cart',
      support_label: raw?.header?.support_label || '+1 212-334-0212',
      categories_button_label: raw?.header?.categories_button_label || 'Shop By Categories',
      deals_label: raw?.header?.deals_label || 'Hot Deals',
      logo_text: raw?.header?.logo_text || fallbackLogoText,
      logo_image_url: raw?.header?.logo_image_url || '',
    },
    hero_slider: {
      enabled: raw?.hero_slider?.enabled !== false,
      slides,
      products_per_row:
        Number(raw?.hero_slider?.products_per_row) > 0
          ? Math.min(6, Math.max(1, Number(raw.hero_slider.products_per_row)))
          : 1,
      total_products:
        Number(raw?.hero_slider?.total_products) > 0
          ? Math.min(15, Math.max(1, Number(raw.hero_slider.total_products)))
          : 3,
    },
    hero_banner: rightBanner,
    services_strip: {
      enabled: raw?.services_strip?.enabled !== false,
      item_one_title: raw?.services_strip?.item_one_title || 'Free Delivery',
      item_one_subtitle: raw?.services_strip?.item_one_subtitle || 'For all orders above $99',
      item_two_title: raw?.services_strip?.item_two_title || 'Money Back',
      item_two_subtitle: raw?.services_strip?.item_two_subtitle || 'Safe and easy return',
      item_three_title: raw?.services_strip?.item_three_title || 'Secure Payment',
      item_three_subtitle: raw?.services_strip?.item_three_subtitle || 'Protected checkout flow',
      item_four_title: raw?.services_strip?.item_four_title || 'Online Support',
      item_four_subtitle: raw?.services_strip?.item_four_subtitle || 'Dedicated 24/7 help',
    },
    top_categories: {
      enabled: raw?.top_categories?.enabled !== false,
      title: raw?.top_categories?.title || 'Top Categories',
      limit:
        Number(raw?.top_categories?.limit) > 0
          ? Math.min(12, Math.max(1, Number(raw.top_categories.limit)))
          : 8,
      products_per_row:
        Number(raw?.top_categories?.products_per_row) > 0
          ? Math.min(8, Math.max(1, Number(raw.top_categories.products_per_row)))
          : 8,
    },
    featured_products: {
      enabled: raw?.featured_products?.enabled !== false,
      title: raw?.featured_products?.title || 'Featured Products',
      tabs:
        Array.isArray(raw?.featured_products?.tabs) && raw.featured_products.tabs.length
          ? raw.featured_products.tabs.slice(0, 4)
          : ['Featured', 'Best Sellers', 'New Arrivals', 'Deals'],
      limit:
        Number(raw?.featured_products?.limit) > 0
          ? Math.min(15, Math.max(1, Number(raw.featured_products.limit)))
          : 8,
      products_per_row:
        Number(raw?.featured_products?.products_per_row) > 0
          ? Math.min(6, Math.max(1, Number(raw.featured_products.products_per_row)))
          : 4,
    },
    promo_tiles: {
      enabled: raw?.promo_tiles?.enabled !== false,
      items: promoTiles,
    },
    best_sellers: {
      enabled: raw?.best_sellers?.enabled !== false,
      title: raw?.best_sellers?.title || 'Best Sellers',
      limit:
        Number(raw?.best_sellers?.limit) > 0
          ? Math.min(15, Math.max(1, Number(raw.best_sellers.limit)))
          : 6,
      products_per_row:
        Number(raw?.best_sellers?.products_per_row) > 0
          ? Math.min(6, Math.max(1, Number(raw.best_sellers.products_per_row)))
          : 3,
    },
    deal_banner: {
      enabled: raw?.deal_banner?.enabled !== false,
      eyebrow: raw?.deal_banner?.eyebrow || 'Big Deal',
      title: raw?.deal_banner?.title || 'Premium picks with better pricing',
      subtitle:
        raw?.deal_banner?.subtitle ||
        'A strong full-width banner section for the Multi Product storefront layout.',
      button_label: raw?.deal_banner?.button_label || 'Shop Collection',
      image_url:
        raw?.deal_banner?.image_url ||
        products?.[7]?.product_image ||
        'https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=1400&q=80',
      bg: raw?.deal_banner?.bg || '#101828',
    },
    latest_products: {
      enabled: raw?.latest_products?.enabled !== false,
      title: raw?.latest_products?.title || 'Latest Products',
      limit:
        Number(raw?.latest_products?.limit) > 0
          ? Math.min(15, Math.max(1, Number(raw.latest_products.limit)))
          : 8,
      products_per_row:
        Number(raw?.latest_products?.products_per_row) > 0
          ? Math.min(6, Math.max(1, Number(raw.latest_products.products_per_row)))
          : 4,
    },
    news: {
      enabled: raw?.news?.enabled !== false,
      title: raw?.news?.title || 'Latest Articles',
      limit:
        Number(raw?.news?.limit) > 0 ? Math.min(6, Math.max(1, Number(raw.news.limit))) : 3,
    },
    newsletter: {
      enabled: raw?.newsletter?.enabled !== false,
      title: raw?.newsletter?.title || 'Subscribe to our newsletter',
      subtitle:
        raw?.newsletter?.subtitle ||
        'Get updates on new products, trending offers, and premium storefront deals.',
      placeholder: raw?.newsletter?.placeholder || 'Enter your email address',
      button_label: raw?.newsletter?.button_label || 'Subscribe',
    },
    footer: {
      enabled: raw?.footer?.enabled !== false,
      about_text:
        raw?.footer?.about_text ||
        'Multi Product is a premium locked-structure storefront with editable content, logo, images, colors and product counts.',
      phone: raw?.footer?.phone || '+1 212-334-0212',
      email: raw?.footer?.email || 'support@blogguard.com',
      address: raw?.footer?.address || '27 Division St, New York, NY 10002, USA',
      copyright:
        raw?.footer?.copyright || `© ${new Date().getFullYear()} Blogguard. All rights reserved.`,
    },
  };
}

function AnnouncementBar({ config }) {
  if (!config?.enabled) return null;

  return (
    <div style={{ background: '#0f172a', color: '#e5e7eb', borderBottom: '1px solid #1e293b' }}>
      <div
        className="multi-product-container"
        style={{
          minHeight: 40,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 16,
          alignItems: 'center',
          fontSize: 13,
        }}
      >
        <div>{config.left_text}</div>
        <div style={{ fontWeight: 700 }}>{config.center_text}</div>
        <div style={{ textAlign: 'right' }}>{config.right_text}</div>
      </div>
    </div>
  );
}

function OffCanvasPanel({ open, title, children, onClose, side = 'left' }) {
  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.58)',
          zIndex: 500,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [side]: 0,
          width: 'min(420px, calc(100% - 20px))',
          background: '#fff',
          zIndex: 501,
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.26)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            minHeight: 72,
            padding: '0 18px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{title}</div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>{children}</div>
      </div>
    </>
  );
}

function CategoriesDrawer({ open, onClose, categoryTree }) {
  const [expanded, setExpanded] = useState({});

  return (
    <OffCanvasPanel open={open} onClose={onClose} title="Shop Categories" side="left">
      <div style={{ display: 'grid', gap: 10 }}>
        {(categoryTree || []).slice(0, 10).map((category, index) => {
          const key = `${category?.slug || category?.name || 'cat'}-${index}`;
          const isOpen = !!expanded[key];

          return (
            <div
              key={key}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 18,
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [key]: !prev[key],
                  }))
                }
                style={{
                  width: '100%',
                  border: 'none',
                  background: '#fff',
                  minHeight: 54,
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                <span>{category?.name || 'Category'}</span>
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
              </button>

              {isOpen ? (
                <div
                  style={{
                    display: 'grid',
                    gap: 8,
                    padding: '0 16px 16px',
                    background: '#f8fafc',
                  }}
                >
                  {(category?.children || []).slice(0, 6).map((child, childIndex) => (
                    <Link
                      key={`${key}-${childIndex}`}
                      to={category?.url || '#'}
                      onClick={onClose}
                      style={{
                        color: '#475569',
                        textDecoration: 'none',
                        fontSize: 14,
                      }}
                    >
                      {child?.name || child?.label || 'Sub category'}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </OffCanvasPanel>
  );
}

function UtilityDrawer({ open, onClose, title }) {
  return (
    <OffCanvasPanel open={open} onClose={onClose} title={title} side="right">
      <div style={{ display: 'grid', gap: 14 }}>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            style={{
              display: 'grid',
              gridTemplateColumns: '72px 1fr',
              gap: 14,
              padding: 14,
              borderRadius: 18,
              border: '1px solid #e5e7eb',
              background: '#fff',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: '#f8fafc',
              }}
            />
            <div>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>
                {title === 'Wishlist' ? 'Saved Product' : title === 'Cart' ? 'Cart Product' : 'My Account'}
              </div>
              <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.7, color: '#64748b' }}>
                This panel is included to preserve the slide-out storefront behavior of the Multi Product theme.
              </div>
            </div>
          </div>
        ))}
      </div>
    </OffCanvasPanel>
  );
}

function LogoBlock({ logoText, logoImageUrl }) {
  if (logoImageUrl) {
    return (
      <div
        style={{
          minHeight: 52,
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        <img
          src={logoImageUrl}
          alt={logoText || 'Logo'}
          style={{
            maxHeight: 42,
            maxWidth: 180,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #111827, #334155)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 900,
          fontSize: 18,
        }}
      >
        B
      </span>

      <span
        style={{
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: '-0.05em',
          color: '#0f172a',
          lineHeight: 1,
        }}
      >
        {logoText || 'Blogguard'}
      </span>
    </div>
  );
}

function MainHeader({ config, menus, categoryTree, websiteSlug }) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const headerMenu = menus.find((menu) => menu.location === 'header') || menus?.[0] || { items: [] };

  return (
    <>
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <div className="multi-product-container" style={{ paddingTop: 20, paddingBottom: 20 }}>
          <div
            className="multi-product-header-main"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0, 1fr) auto',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <Link to={`/${websiteSlug || ''}`} style={{ textDecoration: 'none' }}>
              <LogoBlock logoText={config?.logo_text} logoImageUrl={config?.logo_image_url} />
            </Link>

            <div style={{ display: 'grid', gap: 14 }}>
              <div
                className="multi-product-search-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '230px minmax(0, 1fr) auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => setCategoriesOpen(true)}
                  style={{
                    minHeight: 56,
                    borderRadius: 16,
                    border: '1px solid #dbe1ea',
                    background: '#0f172a',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontWeight: 800,
                    padding: '0 18px',
                    cursor: 'pointer',
                  }}
                >
                  <Menu size={18} />
                  {config?.categories_button_label || 'Shop By Categories'}
                </button>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={config?.search_placeholder || 'Search for products'}
                    style={{
                      width: '100%',
                      height: 56,
                      borderRadius: 16,
                      border: '1px solid #dbe1ea',
                      background: '#fff',
                      padding: '0 70px 0 20px',
                      fontSize: 15,
                      outline: 'none',
                    }}
                  />

                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: 'none',
                      background: '#0f172a',
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Search size={18} />
                  </button>
                </div>

                <div
                  className="multi-product-support-box"
                  style={{
                    minHeight: 56,
                    borderRadius: 16,
                    border: '1px solid #dbe1ea',
                    background: '#fff',
                    padding: '0 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Headphones size={20} />
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Support</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                      {config?.support_label}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="multi-product-nav-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div
                  className="multi-product-nav-links"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 28,
                    flexWrap: 'wrap',
                  }}
                >
                  {(headerMenu?.items || []).slice(0, 8).map((item) => (
                    <Link
                      key={item?.id || item?.label}
                      to={resolveMenuUrl(item, websiteSlug)}
                      style={{
                        textDecoration: 'none',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {item?.label || 'Menu'}
                    </Link>
                  ))}
                </div>

                <div
                  className="multi-product-header-icons"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      minHeight: 42,
                      padding: '0 14px',
                      borderRadius: 999,
                      background: '#fff1f2',
                      color: '#be123c',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {config?.deals_label || 'Hot Deals'}
                  </div>

                  <button
                    type="button"
                    onClick={() => setAccountOpen(true)}
                    style={iconButtonStyle}
                  >
                    <User size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setWishlistOpen(true)}
                    style={iconButtonStyle}
                  >
                    <Heart size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    style={iconButtonStyle}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CategoriesDrawer
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        categoryTree={categoryTree}
      />

      <UtilityDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} title="Wishlist" />
      <UtilityDrawer open={cartOpen} onClose={() => setCartOpen(false)} title="Cart" />
      <UtilityDrawer open={accountOpen} onClose={() => setAccountOpen(false)} title="My Account" />
    </>
  );
}

const iconButtonStyle = {
  width: 46,
  height: 46,
  borderRadius: 14,
  border: '1px solid #dbe1ea',
  background: '#fff',
  color: '#0f172a',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function CategorySidebar({ categoryTree }) {
  const [expanded, setExpanded] = useState({});

  return (
    <aside
      className="multi-product-category-sidebar"
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 22,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          minHeight: 58,
          background: '#0f172a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          fontWeight: 900,
        }}
      >
        Browse Categories
      </div>

      {(categoryTree || []).slice(0, 8).map((category, index) => {
        const key = `${category?.slug || category?.name || 'cat'}-${index}`;
        const isOpen = !!expanded[key];

        return (
          <div
            key={key}
            style={{
              borderBottom:
                index === Math.min((categoryTree || []).slice(0, 8).length - 1, 7)
                  ? 'none'
                  : '1px solid #edf2f7',
            }}
          >
            <button
              type="button"
              onClick={() =>
                setExpanded((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
              style={{
                width: '100%',
                border: 'none',
                background: '#fff',
                minHeight: 56,
                padding: '0 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                cursor: 'pointer',
                color: '#0f172a',
                fontWeight: 700,
              }}
            >
              <span>{category?.name || 'Category'}</span>
              {isOpen ? <Minus size={16} /> : <Plus size={16} />}
            </button>

            {isOpen ? (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  padding: '0 18px 16px',
                  background: '#f8fafc',
                }}
              >
                {(category?.children || []).slice(0, 5).map((child, childIndex) => (
                  <Link
                    key={`${key}-${childIndex}`}
                    to={category?.url || '#'}
                    style={{
                      color: '#64748b',
                      textDecoration: 'none',
                      fontSize: 14,
                    }}
                  >
                    {child?.name || child?.label || 'Sub category'}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </aside>
  );
}

function HeroSlider({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!slides?.length) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides]);

  const current = slides?.[activeIndex] || {};

  return (
    <div
      style={{
        minHeight: 480,
        borderRadius: 24,
        background: current?.accent || '#f2f3f7',
        overflow: 'hidden',
        position: 'relative',
        padding: '32px 28px',
      }}
    >
      <div
        className="multi-product-hero-inner"
        style={{
          minHeight: 400,
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 420px) minmax(0, 1fr)',
          gap: 24,
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 34,
              padding: '0 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.86)',
              color: current?.text_color || '#0f172a',
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {current?.badge || 'Daily Deal'}
          </div>

          <div
            style={{
              marginTop: 16,
              color: '#475569',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {current?.eyebrow || 'Best multi-store deals'}
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              lineHeight: 1,
              whiteSpace: 'pre-line',
              fontWeight: 900,
              letterSpacing: '-0.06em',
              color: current?.text_color || '#0f172a',
            }}
          >
            {current?.title || 'The best home and accessories'}
          </div>

          <p
            style={{
              margin: '18px 0 0',
              maxWidth: 440,
              color: '#64748b',
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {current?.subtitle ||
              'Shop premium electronics, fashion, home appliances and accessories from one clean storefront.'}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <button type="button" style={heroPrimaryButtonStyle}>
              {current?.button_label || 'Shop Now'}
            </button>

            <button type="button" style={heroSecondaryButtonStyle}>
              {current?.secondary_button_label || 'Explore Deals'}
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 340,
          }}
        >
          <img
            src={getSafeImage(current?.image_url, '')}
            alt={current?.title || 'Slide'}
            style={{
              width: '100%',
              maxWidth: 540,
              maxHeight: 360,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {(slides || []).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{
                width: activeIndex === index ? 30 : 10,
                height: 10,
                borderRadius: 999,
                border: 'none',
                background: activeIndex === index ? '#0f172a' : 'rgba(15,23,42,0.18)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            style={heroNavButtonStyle}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
            style={heroNavButtonStyle}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

const heroPrimaryButtonStyle = {
  minWidth: 148,
  height: 50,
  borderRadius: 14,
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
};

const heroSecondaryButtonStyle = {
  minWidth: 148,
  height: 50,
  borderRadius: 14,
  border: '1px solid #dbe1ea',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
};

const heroNavButtonStyle = {
  width: 42,
  height: 42,
  borderRadius: 14,
  border: '1px solid rgba(15, 23, 42, 0.12)',
  background: '#fff',
  color: '#0f172a',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function HeroPromoBanner({ config }) {
  if (!config?.enabled) return null;

  return (
    <div
      style={{
        minHeight: 480,
        borderRadius: 24,
        background: config?.bg || '#ffe9d8',
        overflow: 'hidden',
        position: 'relative',
        padding: '26px 24px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 260 }}>
        <div
          style={{
            display: 'inline-flex',
            minHeight: 32,
            alignItems: 'center',
            padding: '0 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.86)',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {config?.eyebrow || 'Big Saving'}
        </div>

        <div
          style={{
            marginTop: 16,
            color: '#0f172a',
            fontSize: 32,
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: '-0.05em',
          }}
        >
          {config?.title || 'Sale 30% Off On Selected Items'}
        </div>

        <div
          style={{
            marginTop: 14,
            color: '#475569',
            fontSize: 15,
            lineHeight: 1.8,
          }}
        >
          {config?.subtitle || 'Strong promo area beside slider.'}
        </div>

        <button
          type="button"
          style={{
            marginTop: 18,
            minWidth: 132,
            height: 46,
            borderRadius: 14,
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {config?.button_label || 'Shop Now'}
        </button>
      </div>

      <img
        src={getSafeImage(config?.image_url, '')}
        alt={config?.title || 'Promo banner'}
        style={{
          position: 'absolute',
          right: 12,
          bottom: 12,
          width: '78%',
          maxHeight: 240,
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

function ServicesStrip({ config }) {
  if (!config?.enabled) return null;

  const items = [
    { icon: Truck, title: config?.item_one_title, subtitle: config?.item_one_subtitle },
    { icon: RefreshCcw, title: config?.item_two_title, subtitle: config?.item_two_subtitle },
    { icon: ShieldCheck, title: config?.item_three_title, subtitle: config?.item_three_subtitle },
    { icon: Headphones, title: config?.item_four_title, subtitle: config?.item_four_subtitle },
  ];

  return (
    <section style={{ marginTop: 26 }}>
      <div
        className="multi-product-services-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              style={{
                padding: '20px 18px',
                borderRadius: 20,
                background: '#fff',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: '#f8fafc',
                  color: '#0f172a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </span>

              <div>
                <div style={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.3 }}>
                  {item.title}
                </div>
                <div style={{ marginTop: 4, color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionTitle({ title, actionLabel = 'View all' }) {
  return (
    <div
      style={{
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          color: '#0f172a',
          fontSize: 'clamp(1.5rem, 2.4vw, 2.1rem)',
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: '-0.04em',
        }}
      >
        {title}
      </h2>

      <button
        type="button"
        style={{
          minHeight: 42,
          borderRadius: 999,
          border: '1px solid #dbe1ea',
          background: '#fff',
          color: '#0f172a',
          padding: '0 16px',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function TopCategories({ title, categories, limit, itemsPerRow = 8, websiteSlug }) {
  const items =
    Array.isArray(categories) && categories.length
      ? categories.slice(0, limit)
      : fallbackCategories(websiteSlug).slice(0, limit);

  return (
    <section style={{ marginTop: 36 }}>
      <SectionTitle title={title} actionLabel="All Categories" />

      <div
        className="multi-product-top-categories-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(1, itemsPerRow)}, minmax(0, 1fr))`,
          gap: 14,
        }}
      >
        {items.map((category, index) => (
          <Link
            key={category?.id || index}
            to={category?.url || '#'}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                minHeight: 122,
                borderRadius: 20,
                background: '#fff',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textAlign: 'center',
                padding: '16px 12px',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: '#f8fafc',
                  color: '#0f172a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                }}
              >
                {String(category?.name || 'C').slice(0, 1)}
              </div>

              <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>
                {category?.name || 'Category'}
              </div>

              <div style={{ color: '#64748b', fontSize: 13 }}>
                {category?.total_products || 0} items
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductQuickViewModal({
  product,
  websiteSlug,
  isSaved,
  actionLoading,
  onClose,
  onToggleSave,
  onShare,
  onTrackedAction,
  formatCurrency,
}) {
  if (!product) return null;

  const reviewUrl = resolveReviewUrl(product, websiteSlug);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.62)',
          backdropFilter: 'blur(6px)',
          zIndex: 600,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1080px, calc(100% - 24px))',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: 28,
          border: '1px solid rgba(226,232,240,0.95)',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.28)',
          zIndex: 601,
        }}
      >
        <style>{`
          .multi-quick-view-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
            gap: 0;
          }

          @media (max-width: 900px) {
            .multi-quick-view-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #eef2f7',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Product Quick View
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              color: '#111827',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="multi-quick-view-grid">
          <div
            style={{
              padding: 22,
              background:
                'radial-gradient(circle at top left, rgba(15,23,42,0.08), transparent 28%), #f8fafc',
              borderRight: '1px solid #eef2f7',
            }}
          >
            <div
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 24,
                padding: 18,
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)',
              }}
            >
              <img
                src={product?.product_image || ''}
                alt={product?.title || 'Product'}
                style={{
                  width: '100%',
                  height: 'min(62vw, 520px)',
                  maxHeight: 520,
                  objectFit: 'cover',
                  borderRadius: 18,
                  background: '#f8fafc',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  top: 30,
                  left: 30,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.96)',
                  border: '1px solid #dbe1ea',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: 12,
                  boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
                }}
              >
                <CheckCircle2 size={14} />
                Verified
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 22,
              display: 'grid',
              gap: 16,
              alignContent: 'start',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 10,
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {product?.category?.name || 'Category'}
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                    lineHeight: 1.1,
                    fontWeight: 900,
                    color: '#111827',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {product?.title || 'Product'}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={onToggleSave}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: isSaved ? '1px solid #fecdd3' : '1px solid #e5e7eb',
                    background: isSaved ? '#fff1f2' : '#ffffff',
                    color: isSaved ? '#e11d48' : '#111827',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Heart size={18} fill={isSaved ? '#e11d48' : 'none'} />
                </button>

                <button
                  type="button"
                  onClick={onShare}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#111827',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 2, color: '#f4b000', alignItems: 'center' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < 4 ? '#f4b000' : 'none'} />
              ))}
              <span style={{ marginLeft: 10, color: '#64748b', fontWeight: 700 }}>
                Top pick
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 700,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Website
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1.3,
                  }}
                >
                  {product?.affiliate?.website_name || 'Blogguard'}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 18,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 700,
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Price
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.1,
                  }}
                >
                  {renderPrice(product, formatCurrency)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 20,
                padding: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  fontWeight: 700,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Short Description
              </div>

              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: '#4b5563',
                }}
              >
                {product?.short_description || 'No description available.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTrackedAction('visit_website')}
              disabled={actionLoading}
              style={quickViewGhostButtonStyle}
            >
              {actionLoading ? 'Please wait...' : 'Visit Website'}
            </button>

            <a
              href={reviewUrl}
              target="_blank"
              rel="noreferrer"
              style={quickViewGhostLinkStyle}
            >
              Review Site
            </a>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => onTrackedAction('buy_now')}
                disabled={actionLoading}
                style={quickViewPrimaryButtonStyle}
              >
                {actionLoading ? 'Please wait...' : product?.homepage_cta_label || 'Buy Now'}
              </button>

              <button
                type="button"
                onClick={() => onTrackedAction('read_more')}
                disabled={actionLoading}
                style={quickViewDarkButtonStyle}
              >
                {actionLoading ? 'Please wait...' : product?.storefront_cta_label || 'Read More'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const quickViewGhostButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 52,
  borderRadius: 12,
  background: '#ffffff',
  border: '1px solid #d1d5db',
  color: '#111827',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
};

const quickViewGhostLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 52,
  borderRadius: 12,
  background: '#ffffff',
  border: '1px solid #d1d5db',
  color: '#111827',
  fontWeight: 800,
  fontSize: 15,
  textDecoration: 'none',
};

const quickViewPrimaryButtonStyle = {
  minHeight: 52,
  borderRadius: 12,
  border: 'none',
  background: '#0f172a',
  color: '#ffffff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
};

const quickViewDarkButtonStyle = {
  minHeight: 52,
  borderRadius: 12,
  border: 'none',
  background: '#111827',
  color: '#ffffff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
};

function ProductCard({
  product,
  websiteSlug,
  settings,
  onQuickView,
  onImpression,
  formatCurrency,
  compact = false,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onImpression(product);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [product, onImpression]);

  return (
    <div
      ref={cardRef}
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: compact ? 18 : 22,
        overflow: 'hidden',
        minHeight: '100%',
      }}
    >
      <button
        type="button"
        onClick={() => settings.allowProductQuickView && onQuickView(product)}
        style={{
          width: '100%',
          border: 'none',
          background: '#fff',
          padding: 0,
          textAlign: 'left',
          cursor: settings.allowProductQuickView ? 'pointer' : 'default',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: compact ? '4 / 3.2' : settings.productImageRatio,
            background: '#f8fafc',
            overflow: 'hidden',
          }}
        >
          <img
            src={product?.product_image}
            alt={product?.title || 'Product'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: settings.productImageFit,
              display: 'block',
            }}
          />

          {product?.badge ? (
            <span
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                minHeight: 28,
                padding: '0 12px',
                borderRadius: 999,
                background:
                  product.badge === 'HOT'
                    ? '#ef4444'
                    : product.badge === 'NEW'
                    ? '#16a34a'
                    : '#0f172a',
                color: '#fff',
                fontSize: 11,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {product.badge}
            </span>
          ) : null}

          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #dbe1ea',
              background: '#ffffff',
              color: '#0f172a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Heart size={16} />
          </button>
        </div>
      </button>

      <div style={{ padding: compact ? '16px 16px 18px' : '18px 18px 20px' }}>
        <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
          {product?.category?.name || 'Category'}
        </div>

        <div
          style={{
            fontSize: compact ? 15 : 17,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.35,
            minHeight: compact ? 42 : 46,
          }}
        >
          {product?.title || 'Product'}
        </div>

        <div style={{ display: 'flex', gap: 2, color: '#f4b000', marginTop: 12 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill="#f4b000" />
          ))}
        </div>

        <div
          style={{
            fontSize: compact ? 17 : 18,
            color: '#0f172a',
            fontWeight: 900,
            marginTop: 12,
          }}
        >
          {renderPrice(product, formatCurrency)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : '1fr 1fr',
            gap: 10,
            marginTop: 16,
          }}
        >
          <a
            href={product?.affiliate_buy_url || product?.website_url || '#'}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              minHeight: 46,
              borderRadius: 14,
              background: '#0f172a',
              color: '#fff',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 14px',
            }}
          >
            Buy Now
          </a>

          {!compact ? (
            <Link
              to={resolveReadMoreUrl(product, websiteSlug)}
              onClick={(e) => e.stopPropagation()}
              style={{
                minHeight: 46,
                borderRadius: 14,
                background: '#fff',
                border: '1px solid #dbe1ea',
                color: '#0f172a',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 14px',
              }}
            >
              Read More
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProductTabsSection({
  title,
  tabs,
  products,
  limit,
  productsPerRow = 4,
  websiteSlug,
  settings,
  onQuickView,
  onImpression,
  formatCurrency,
}) {
  const [activeTab, setActiveTab] = useState(tabs?.[0] || 'Featured');
  const displayProducts = useMemo(() => (products || []).slice(0, limit), [products, limit]);

  return (
    <section style={{ marginTop: 38 }}>
      <SectionTitle title={title} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        {(tabs || []).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              minHeight: 40,
              borderRadius: 999,
              padding: '0 16px',
              border: activeTab === tab ? 'none' : '1px solid #dbe1ea',
              background: activeTab === tab ? '#0f172a' : '#fff',
              color: activeTab === tab ? '#fff' : '#0f172a',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="multi-product-products-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(1, productsPerRow)}, minmax(0, 1fr))`,
          gap: 20,
        }}
      >
        {displayProducts.map((product, index) => (
          <ProductCard
            key={product?.id || `${activeTab}-${index}`}
            product={product}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={onQuickView}
            onImpression={onImpression}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </section>
  );
}

function PromoTiles({ config }) {
  if (!config?.enabled) return null;

  return (
    <section style={{ marginTop: 40 }}>
      <div
        className="multi-product-promo-tiles-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 18,
        }}
      >
        {(config?.items || []).slice(0, 3).map((item, index) => (
          <div
            key={index}
            style={{
              minHeight: 210,
              borderRadius: 24,
              background: item?.bg || '#f4f7ff',
              overflow: 'hidden',
              position: 'relative',
              padding: '22px 20px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 210 }}>
              <div
                style={{
                  color: '#0f172a',
                  fontSize: 26,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                }}
              >
                {item?.title || 'Promo Tile'}
              </div>

              <div
                style={{
                  marginTop: 10,
                  color: '#64748b',
                  lineHeight: 1.7,
                  fontSize: 14,
                }}
              >
                {item?.subtitle || 'Section promo content'}
              </div>

              <button
                type="button"
                style={{
                  marginTop: 16,
                  minWidth: 116,
                  height: 42,
                  borderRadius: 12,
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {item?.button_label || 'Browse'}
              </button>
            </div>

            <img
              src={getSafeImage(item?.image_url, '')}
              alt={item?.title || 'Promo'}
              style={{
                position: 'absolute',
                right: 12,
                bottom: 10,
                width: '42%',
                maxHeight: 140,
                objectFit: 'contain',
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function DealBanner({ config }) {
  if (!config?.enabled) return null;

  return (
    <section style={{ marginTop: 42 }}>
      <div
        style={{
          minHeight: 320,
          borderRadius: 28,
          overflow: 'hidden',
          background: config?.bg || '#101828',
          position: 'relative',
          padding: '34px 28px',
          color: '#fff',
        }}
      >
        <div
          className="multi-product-deal-banner-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 1fr) minmax(260px, 460px)',
            gap: 24,
            alignItems: 'center',
            minHeight: 250,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 34,
                padding: '0 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {config?.eyebrow || 'Big Deal'}
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 'clamp(2rem, 4vw, 3.1rem)',
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: '-0.05em',
              }}
            >
              {config?.title || 'Premium picks with better pricing'}
            </div>

            <div
              style={{
                marginTop: 14,
                maxWidth: 560,
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.8,
                fontSize: 15,
              }}
            >
              {config?.subtitle ||
                'A strong full-width banner section for the Multi Product storefront layout.'}
            </div>

            <button
              type="button"
              style={{
                marginTop: 18,
                minWidth: 150,
                height: 48,
                borderRadius: 14,
                border: 'none',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {config?.button_label || 'Shop Collection'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={getSafeImage(config?.image_url, '')}
              alt={config?.title || 'Deal banner'}
              style={{
                width: '100%',
                maxWidth: 420,
                maxHeight: 260,
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function LatestProductsSection({
  title,
  products,
  limit,
  productsPerRow = 4,
  websiteSlug,
  settings,
  onQuickView,
  onImpression,
  formatCurrency,
}) {
  const items = (products || []).slice(0, limit);

  return (
    <section style={{ marginTop: 42 }}>
      <SectionTitle title={title} actionLabel="More Products" />

      <div
        className="multi-product-latest-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(1, productsPerRow)}, minmax(0, 1fr))`,
          gap: 20,
        }}
      >
        {items.map((product, index) => (
          <ProductCard
            key={product?.id || index}
            product={product}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={onQuickView}
            onImpression={onImpression}
            formatCurrency={formatCurrency}
            compact={productsPerRow <= 3}
          />
        ))}
      </div>
    </section>
  );
}

function NewsSection({ title, articles, limit }) {
  const items = (articles || []).slice(0, limit);

  return (
    <section style={{ marginTop: 46 }}>
      <SectionTitle title={title} actionLabel="All Articles" />

      <div
        className="multi-product-news-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 20,
        }}
      >
        {items.map((article, index) => (
          <article
            key={article?.id || index}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <img
              src={
                article?.featured_image ||
                'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80'
              }
              alt={article?.title || 'Article'}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div style={{ padding: 20 }}>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                {article?.category?.name || 'News'} • {article?.published_at || '2026-04-20'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#0f172a',
                  fontSize: 20,
                  lineHeight: 1.35,
                  fontWeight: 900,
                  minHeight: 54,
                }}
              >
                {article?.title || 'Article title'}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: '#64748b',
                  fontSize: 15,
                  lineHeight: 1.75,
                  minHeight: 82,
                }}
              >
                {article?.excerpt || 'Read the latest product tips and storefront updates.'}
              </div>

              <Link
                to={article?.url || '#'}
                style={{
                  marginTop: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontWeight: 800,
                }}
              >
                Read More
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NewsletterSection({ config }) {
  if (!config?.enabled) return null;

  return (
    <section style={{ marginTop: 48 }}>
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          padding: '34px 26px',
          color: '#fff',
        }}
      >
        <div
          className="multi-product-newsletter-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 460px)',
            gap: 24,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 34,
                padding: '0 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <Mail size={14} />
              Newsletter
            </div>

            <h2
              style={{
                margin: '16px 0 0',
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: '-0.04em',
              }}
            >
              {config?.title}
            </h2>

            <p
              style={{
                margin: '14px 0 0',
                maxWidth: 620,
                color: 'rgba(255,255,255,0.84)',
                lineHeight: 1.8,
              }}
            >
              {config?.subtitle}
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 22,
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 12,
            }}
          >
            <input
              type="email"
              placeholder={config?.placeholder}
              style={{
                width: '100%',
                minHeight: 56,
                borderRadius: 16,
                border: 'none',
                background: '#fff',
                padding: '0 18px',
                fontSize: 15,
                outline: 'none',
              }}
            />

            <button
              type="button"
              style={{
                minWidth: 146,
                minHeight: 56,
                borderRadius: 16,
                border: 'none',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 900,
                cursor: 'pointer',
                padding: '0 18px',
              }}
            >
              {config?.button_label}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection({ config, menus, websiteSlug, logoText, logoImageUrl }) {
  if (!config?.enabled) return null;

  const headerMenu = menus.find((menu) => menu.location === 'header') || menus?.[0] || { items: [] };

  return (
    <footer style={{ marginTop: 56, background: '#0f172a', color: '#f8fafc' }}>
      <div className="multi-product-container" style={{ paddingTop: 46, paddingBottom: 24 }}>
        <div
          className="multi-product-footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 1fr 1fr 1fr',
            gap: 24,
          }}
        >
          <div>
            <LogoBlock logoText={logoText} logoImageUrl={logoImageUrl} />

            <div
              style={{
                marginTop: 16,
                color: 'rgba(248,250,252,0.78)',
                lineHeight: 1.8,
                maxWidth: 360,
              }}
            >
              {config?.about_text}
            </div>

            <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} />
                <span>{config?.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={16} />
                <span>{config?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={16} />
                <span>{config?.address}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Quick Links</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {(headerMenu?.items || []).slice(0, 6).map((item) => (
                <Link
                  key={item?.id || item?.label}
                  to={resolveMenuUrl(item, websiteSlug)}
                  style={{
                    color: 'rgba(248,250,252,0.78)',
                    textDecoration: 'none',
                  }}
                >
                  {item?.label || 'Menu'}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Store Categories</div>
            <div style={{ display: 'grid', gap: 10, color: 'rgba(248,250,252,0.78)' }}>
              <div>Electronics</div>
              <div>Fashion</div>
              <div>Home Appliances</div>
              <div>Sports</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 16 }}>Why Shop Here</div>
            <div style={{ display: 'grid', gap: 12 }}>
              {['Protected Payments', 'Fast Delivery', 'Daily Deals', 'Verified Products'].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      minHeight: 48,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 14px',
                      color: 'rgba(248,250,252,0.82)',
                    }}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(248,250,252,0.68)',
            fontSize: 14,
          }}
        >
          {config?.copyright}
        </div>
      </div>
    </footer>
  );
}

export default function TemplateMultiProduct({
  website,
  websiteSlug,
  menus,
  categories,
  products,
  articles,
  categoryTree,
  settings,
  savedProducts,
  quickViewProduct,
  setQuickViewProduct,
  handleImpression,
  handleToggleSave,
  handleShare,
  handleTrackedPopupAction,
  actionLoading,
  formatCurrency,
}) {
  const safeProducts =
    Array.isArray(products) && products.length ? products.slice(0, 15) : fallbackProducts(websiteSlug);

  const safeArticles =
    Array.isArray(articles) && articles.length ? articles.slice(0, 3) : fallbackArticles(websiteSlug);

  const safeCategories =
    Array.isArray(categories) && categories.length
      ? categories
      : fallbackCategories(websiteSlug);

  const safeCategoryTree =
    Array.isArray(categoryTree) && categoryTree.length
      ? categoryTree
      : fallbackCategories(websiteSlug);

  const config = useMemo(
    () => getTemplateConfig(settings, website, safeProducts),
    [settings, website, safeProducts]
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .multi-product-container {
          width: min(1440px, calc(100% - 28px));
          margin: 0 auto;
        }

        @media (max-width: 1200px) {
          .multi-product-header-main,
          .multi-product-search-row,
          .multi-product-nav-row,
          .multi-product-hero-layout,
          .multi-product-services-grid,
          .multi-product-promo-tiles-grid,
          .multi-product-news-grid,
          .multi-product-footer-grid,
          .multi-product-newsletter-grid,
          .multi-product-deal-banner-grid {
            grid-template-columns: 1fr !important;
          }

          .multi-product-top-categories-grid,
          .multi-product-products-grid,
          .multi-product-latest-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .multi-product-category-sidebar {
            display: none !important;
          }

          .multi-product-support-box {
            display: none !important;
          }
        }

        @media (max-width: 900px) {
          .multi-product-top-categories-grid,
          .multi-product-products-grid,
          .multi-product-latest-grid,
          .multi-product-news-grid,
          .multi-product-promo-tiles-grid,
          .multi-product-services-grid {
            grid-template-columns: 1fr !important;
          }

          .multi-product-nav-links {
            display: none !important;
          }

          .multi-product-header-icons {
            justify-content: flex-start !important;
            flex-wrap: wrap !important;
          }

          .multi-product-hero-inner {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <AnnouncementBar config={config.announcement_bar} />
      <MainHeader
        config={config.header}
        menus={menus}
        categoryTree={safeCategoryTree}
        websiteSlug={websiteSlug}
      />

      <main>
        <div className="multi-product-container" style={{ paddingTop: 24, paddingBottom: 48 }}>
          <section
            className="multi-product-hero-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: '280px minmax(0, 1fr) 320px',
              gap: 18,
              alignItems: 'stretch',
            }}
          >
            <CategorySidebar categoryTree={safeCategoryTree} />
            <HeroSlider slides={config.hero_slider.slides} />
            <HeroPromoBanner config={config.hero_banner} />
          </section>

          <ServicesStrip config={config.services_strip} />

          <TopCategories
            title={config.top_categories.title}
            categories={safeCategories}
            limit={config.top_categories.limit}
            itemsPerRow={config.top_categories.products_per_row}
            websiteSlug={websiteSlug}
          />

          <ProductTabsSection
            title={config.featured_products.title}
            tabs={config.featured_products.tabs}
            products={safeProducts}
            limit={config.featured_products.limit}
            productsPerRow={config.featured_products.products_per_row}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
          />

          <PromoTiles config={config.promo_tiles} />

          <LatestProductsSection
            title={config.best_sellers.title}
            products={safeProducts.slice(0, 15)}
            limit={config.best_sellers.limit}
            productsPerRow={config.best_sellers.products_per_row}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
          />

          <DealBanner config={config.deal_banner} />

          <LatestProductsSection
            title={config.latest_products.title}
            products={safeProducts.slice(0, 15)}
            limit={config.latest_products.limit}
            productsPerRow={config.latest_products.products_per_row}
            websiteSlug={websiteSlug}
            settings={settings}
            onQuickView={setQuickViewProduct}
            onImpression={handleImpression}
            formatCurrency={formatCurrency}
          />

          <NewsSection title={config.news.title} articles={safeArticles} limit={config.news.limit} />
          <NewsletterSection config={config.newsletter} />
        </div>
      </main>

      <FooterSection
        config={config.footer}
        menus={menus}
        websiteSlug={websiteSlug}
        logoText={config.header.logo_text}
        logoImageUrl={config.header.logo_image_url}
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        websiteSlug={websiteSlug}
        isSaved={!!savedProducts?.[quickViewProduct?.id]}
        actionLoading={actionLoading}
        onClose={() => setQuickViewProduct(null)}
        onToggleSave={handleToggleSave}
        onShare={handleShare}
        onTrackedAction={handleTrackedPopupAction}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}