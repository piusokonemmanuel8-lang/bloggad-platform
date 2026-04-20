import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';
import TemplatePremiumBrand from './templates/TemplatePremiumBrand';
import TemplateFreeSimple from './templates/TemplateFreeSimple';
import TemplateSupplementTheme from './templates/TemplateSupplementTheme';
import TemplateFurnitureTheme from './templates/TemplateFurnitureTheme';
import TemplateGroceryTheme from './templates/TemplateGroceryTheme';
import TemplateMultiProduct from './templates/TemplateMultiProduct';

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

function resolveBuyNowUrl(product) {
  return product?.affiliate_buy_url || product?.website_url || '#';
}

function resolveVisitWebsiteUrl(product, fallbackWebsiteSlug = '') {
  if (product?.website_url) return product.website_url;
  const websiteSlug = resolveWebsiteSlug(product, fallbackWebsiteSlug);
  return websiteSlug ? `/${websiteSlug}` : '#';
}

function resolveTrackingEndpoint(product, fallbackWebsiteSlug = '') {
  const websiteSlug = resolveWebsiteSlug(product, fallbackWebsiteSlug);
  const productSlug = product?.slug || '';
  if (!websiteSlug || !productSlug) return '';
  return `/api/public/products/${websiteSlug}/product/${productSlug}/click`;
}

function getTemplateSettings(websiteData = null) {
  const raw =
    websiteData?.website?.template_settings ||
    websiteData?.website?.storefront_template_settings ||
    websiteData?.template_settings ||
    {};

  const templateSettingsJson =
    websiteData?.website?.template_settings_json ||
    websiteData?.design_settings?.template_settings_json ||
    websiteData?.template_settings_json ||
    {};

  const num = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    allowProductQuickView:
      raw?.allow_product_quick_view !== undefined
        ? Boolean(raw.allow_product_quick_view)
        : true,
    offersPerRow: Math.min(6, Math.max(1, num(raw?.offers_per_row, 4))),
    offersLimit: Math.max(1, num(raw?.offers_limit, 8)),
    categoriesPerRow: Math.min(8, Math.max(1, num(raw?.categories_per_row, 4))),
    categoriesLimit: Math.max(1, num(raw?.categories_limit, 8)),
    articlePerRow: Math.min(4, Math.max(1, num(raw?.articles_per_row, 4))),
    articleLimit: Math.max(1, num(raw?.articles_limit, 4)),
    productImageFit: raw?.product_image_fit || 'cover',
    productImageRatio: raw?.product_image_ratio || '4 / 4',
    template_settings_json: templateSettingsJson,
  };
}

function normalizeTemplateKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
}

function getTemplateCodeKey(websiteData = null) {
  return (
    websiteData?.website?.template_code_key ||
    websiteData?.website?.selected_template_code_key ||
    websiteData?.website?.active_template_code_key ||
    websiteData?.website?.template?.template_code_key ||
    websiteData?.website?.template?.code_key ||
    websiteData?.selected_template?.template_code_key ||
    websiteData?.selected_template?.code_key ||
    websiteData?.template?.template_code_key ||
    websiteData?.template?.code_key ||
    'free_simple'
  );
}

function makeDummyMenus(websiteSlug) {
  return [
    {
      id: 'header-menu',
      name: 'Header Menu',
      location: 'header',
      items: [
        { id: 'm1', label: 'Home', resolved_url: `/${websiteSlug}` },
        { id: 'm2', label: 'Shop', resolved_url: `/${websiteSlug}` },
        { id: 'm3', label: 'Pages', resolved_url: `/${websiteSlug}` },
        { id: 'm4', label: 'Blog', resolved_url: `/${websiteSlug}` },
        { id: 'm5', label: 'Contact', resolved_url: `/${websiteSlug}` },
      ],
    },
  ];
}

function makeDummyCategories(websiteSlug) {
  return [
    { id: 'c1', name: 'Grocery', slug: 'grocery', total_products: 8 },
    { id: 'c2', name: 'Foods & Drinks', slug: 'foods-and-drinks', total_products: 7 },
    { id: 'c3', name: 'Fruits', slug: 'fruits', total_products: 8 },
    { id: 'c4', name: 'Vegetables', slug: 'vegetables', total_products: 8 },
    { id: 'c5', name: 'Home Appliance', slug: 'home-appliance', total_products: 8 },
    { id: 'c6', name: 'Beauty Products', slug: 'beauty-products', total_products: 8 },
    { id: 'c7', name: 'Snacks', slug: 'snacks', total_products: 8 },
    { id: 'c8', name: 'Organic', slug: 'organic', total_products: 8 },
  ].map((item) => ({
    ...item,
    children: [
      { name: `${item.name} Deals`, slug: item.slug },
      { name: `${item.name} New Arrivals`, slug: item.slug },
      { name: `${item.name} Essentials`, slug: item.slug },
    ],
    url: `/${websiteSlug}/category/${item.slug}`,
  }));
}

function makeDummySliders() {
  return [
    {
      id: 's1',
      image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80',
      title: 'Your daily needs',
      subtitle: 'Fresh grocery delivered to your doorstep.',
      accent: '#f4fff2',
    },
    {
      id: 's2',
      image:
        'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1800&q=80',
      title: 'Healthy food market',
      subtitle: 'Shop fresh produce, snacks and drinks.',
      accent: '#fff9ef',
    },
    {
      id: 's3',
      image:
        'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1800&q=80',
      title: 'Delivered fresh daily',
      subtitle: 'Everything you need in one grocery store.',
      accent: '#eef8ff',
    },
  ];
}

function makeDummyProducts(websiteSlug) {
  const imagePool = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1571680322279-a226e6a4cc2a?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80',
  ];

  const categories = [
    'Grocery',
    'Foods & Drinks',
    'Fruits',
    'Vegetables',
    'Home Appliance',
    'Beauty Products',
    'Snacks',
    'Organic',
  ];

  return Array.from({ length: 20 }, (_, index) => ({
    id: `dummy-product-${index + 1}`,
    slug: `dummy-product-${index + 1}`,
    title: categories[index % categories.length],
    product_image: imagePool[index % imagePool.length],
    pricing_type: index % 4 === 0 ? 'variable' : 'simple',
    price: 20 + index * 3,
    min_price: 20 + index * 3,
    max_price: 35 + index * 5,
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    short_description: 'Fresh grocery product card ready for your real storefront products.',
    category: {
      id: `cat-${index + 1}`,
      name: categories[index % categories.length],
      slug: categories[index % categories.length].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
    affiliate: {
      website_name: 'Bloggad Store',
      website_slug: websiteSlug,
      name: 'Bloggad',
    },
    website_slug: websiteSlug,
    website_url: `/${websiteSlug}`,
    read_more_url: `/${websiteSlug}/post/article-${(index % 4) + 1}`,
    affiliate_buy_url: '#',
    review_url: `/${websiteSlug}/post/article-${(index % 4) + 1}`,
    status: 'published',
    badge:
      index % 5 === 0 ? 'HOT' : index % 4 === 0 ? 'NEW' : index % 3 === 0 ? '-15%' : null,
  }));
}

function makeDummyArticles(websiteSlug) {
  const images = [
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1400&q=80',
  ];

  return Array.from({ length: 4 }, (_, i) => ({
    id: `article-${i + 1}`,
    title:
      i === 0
        ? 'How to choose fresh vegetables'
        : i === 1
        ? 'Healthy grocery shopping tips'
        : i === 2
        ? 'Why organic foods matter'
        : 'Best fruits for everyday nutrition',
    excerpt:
      'Fresh grocery ideas, healthy food guides, and everyday home shopping inspiration.',
    featured_image: images[i],
    category: {
      name:
        i === 0
          ? 'Vegetables'
          : i === 1
          ? 'Grocery'
          : i === 2
          ? 'Organic'
          : 'Fruits',
    },
    slug: `article-${i + 1}`,
    url: `/${websiteSlug}/post/article-${i + 1}`,
    published_at: '2026-04-20',
    author_name: 'Bloggad',
  }));
}

function buildCategoryTree(categories = [], websiteSlug = '') {
  const list =
    Array.isArray(categories) && categories.length
      ? categories
      : makeDummyCategories(websiteSlug);

  return list.map((category) => ({
    ...category,
    children:
      Array.isArray(category.children) && category.children.length
        ? category.children.slice(0, 6)
        : [
            { name: `${category.name} Deals`, slug: category.slug },
            { name: `${category.name} New Arrivals`, slug: category.slug },
            { name: `${category.name} Essentials`, slug: category.slug },
          ],
    url: category.url || `/${websiteSlug}/category/${category.slug}`,
  }));
}

function TemplateErrorState({ message }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#ffffff',
          border: '1px solid #fecaca',
          borderRadius: 16,
          padding: 22,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        <AlertCircle size={20} color="#dc2626" style={{ marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
            Storefront failed to load
          </div>
          <div style={{ marginTop: 6, color: '#6b7280', lineHeight: 1.6 }}>
            {message || 'Unable to load storefront.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateLoadingState() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <style>{`
        .storefront-spin {
          animation: storefrontSpin 0.85s linear infinite;
        }
        @keyframes storefrontSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '16px 20px',
          background: '#ffffff',
          borderRadius: 16,
          color: '#374151',
          border: '1px solid #e5e7eb',
        }}
      >
        <Loader2 size={18} className="storefront-spin" />
        <span>Loading storefront.</span>
      </div>
    </div>
  );
}

export default function WebsiteStorefrontPage() {
  const { websiteSlug } = useParams();

  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [savedProducts, setSavedProducts] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const trackedImpressionsRef = useRef(new Set());
  const trackedQuickViewsRef = useRef(new Set());

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await api.get(`/api/public/websites/${websiteSlug}`);
        setWebsiteData(data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load storefront');
      } finally {
        setLoading(false);
      }
    };

    if (websiteSlug) {
      fetchWebsite();
    }
  }, [websiteSlug]);

  const settings = useMemo(() => getTemplateSettings(websiteData), [websiteData]);

  const templateCodeKey = useMemo(
    () => normalizeTemplateKey(getTemplateCodeKey(websiteData)),
    [websiteData]
  );

  const website = websiteData?.website || null;

  const sliders = useMemo(() => {
    const live = websiteData?.sliders || [];
    return live.length ? live : makeDummySliders();
  }, [websiteData?.sliders]);

  const menus = useMemo(() => {
    const live = websiteData?.menus || [];
    return live.length ? live : makeDummyMenus(websiteSlug);
  }, [websiteData?.menus, websiteSlug]);

  const categories = useMemo(() => {
    const live = websiteData?.categories || [];
    return live.length ? live : makeDummyCategories(websiteSlug);
  }, [websiteData?.categories, websiteSlug]);

  const products = useMemo(() => {
    const live = websiteData?.products || [];
    return live.length ? live : makeDummyProducts(websiteSlug);
  }, [websiteData?.products, websiteSlug]);

  const articles = useMemo(() => {
    const live = websiteData?.articles || websiteData?.posts || [];
    return live.length ? live : makeDummyArticles(websiteSlug);
  }, [websiteData?.articles, websiteData?.posts, websiteSlug]);

  const categoryTree = useMemo(
    () => buildCategoryTree(categories, websiteSlug),
    [categories, websiteSlug]
  );

  const trackProductEvent = useCallback(
    async (product, clickType) => {
      const endpoint = resolveTrackingEndpoint(product, websiteSlug);
      if (!endpoint) return null;

      try {
        const { data } = await api.post(endpoint, {
          click_type: clickType,
        });
        return data || null;
      } catch {
        return null;
      }
    },
    [websiteSlug]
  );

  const handleImpression = useCallback(
    async (product) => {
      if (!product?.id || trackedImpressionsRef.current.has(product.id)) return;
      trackedImpressionsRef.current.add(product.id);
      await trackProductEvent(product, 'impression');
    },
    [trackProductEvent]
  );

  useEffect(() => {
    const trackQuickView = async () => {
      if (!quickViewProduct?.id) return;
      if (trackedQuickViewsRef.current.has(quickViewProduct.id)) return;

      trackedQuickViewsRef.current.add(quickViewProduct.id);
      await trackProductEvent(quickViewProduct, 'quick_view');
    };

    trackQuickView();
  }, [quickViewProduct, trackProductEvent]);

  const handleTrackedPopupAction = async (clickType) => {
    if (!quickViewProduct) return;

    const fallbackUrl =
      clickType === 'buy_now'
        ? resolveBuyNowUrl(quickViewProduct)
        : clickType === 'visit_website'
        ? resolveVisitWebsiteUrl(quickViewProduct, websiteSlug)
        : resolveReadMoreUrl(quickViewProduct, websiteSlug);

    try {
      setActionLoading(true);
      const data = await trackProductEvent(quickViewProduct, clickType);
      const targetUrl = data?.redirect_url || fallbackUrl;

      if (targetUrl && targetUrl !== '#') {
        window.location.href = targetUrl;
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!quickViewProduct?.id) return;

    setSavedProducts((prev) => ({
      ...prev,
      [quickViewProduct.id]: !prev[quickViewProduct.id],
    }));

    await trackProductEvent(quickViewProduct, 'save');
  };

  const handleShare = async () => {
    if (!quickViewProduct) return;

    const shareUrl = resolveReadMoreUrl(quickViewProduct, websiteSlug);
    const shareTitle = quickViewProduct?.title || 'Product';

    await trackProductEvent(quickViewProduct, 'share');

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // ignore
    }
  };

  const sharedTemplateProps = {
    website,
    websiteSlug,
    sliders,
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
    templateCodeKey,
  };

  const renderTemplate = () => {
    switch (templateCodeKey) {
      case 'premium_brand':
      case 'premium_storefront':
      case 'mega_electronics':
      case 'electronics_premium':
        return <TemplatePremiumBrand {...sharedTemplateProps} />;

      case 'supplement_theme':
      case 'supplement_template':
        return <TemplateSupplementTheme {...sharedTemplateProps} />;

      case 'furniture_theme':
      case 'furniture_template':
      case 'furniture_store':
        return <TemplateFurnitureTheme {...sharedTemplateProps} />;

      case 'grocery_theme':
      case 'grocery_template':
      case 'grocery_store':
        return <TemplateGroceryTheme {...sharedTemplateProps} />;

      case 'multi_product':
      case 'multi_product_theme':
      case 'multi_product_store':
      case 'multi_product_template':
        return <TemplateMultiProduct {...sharedTemplateProps} />;

      case 'free_simple':
      case 'free_basic':
      case 'simple_free':
      default:
        return <TemplateFreeSimple {...sharedTemplateProps} />;
    }
  };

  if (loading) {
    return <TemplateLoadingState />;
  }

  if (error) {
    return <TemplateErrorState message={error} />;
  }

  return renderTemplate();
}