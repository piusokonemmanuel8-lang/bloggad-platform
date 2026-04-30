import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import LocalizedPrice from '../../components/common/LocalizedPrice';
import TemplatePremiumBrand from './templates/TemplatePremiumBrand';
import TemplateFreeSimple from './templates/TemplateFreeSimple';
import TemplateSupplementTheme from './templates/TemplateSupplementTheme';
import TemplateFurnitureTheme from './templates/TemplateFurnitureTheme';
import TemplateGroceryTheme from './templates/TemplateGroceryTheme';
import TemplateMultiProduct from './templates/TemplateMultiProduct';
import TemplateMextro from './templates/TemplateMextro';
import TemplateXxam from './templates/TemplateXxam';

function formatCurrency(amount) {
  return <LocalizedPrice amount={amount || 0} />;
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
    { id: 'c1', name: 'Electronics', slug: 'electronics', total_products: 8 },
    { id: 'c2', name: 'Audio', slug: 'audio', total_products: 7 },
    { id: 'c3', name: 'Phones', slug: 'phones', total_products: 8 },
    { id: 'c4', name: 'Laptops', slug: 'laptops', total_products: 8 },
    { id: 'c5', name: 'Accessories', slug: 'accessories', total_products: 8 },
    { id: 'c6', name: 'Wearables', slug: 'wearables', total_products: 8 },
    { id: 'c7', name: 'Gaming', slug: 'gaming', total_products: 8 },
    { id: 'c8', name: 'Tablets', slug: 'tablets', total_products: 8 },
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
        'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1800&q=80',
      title: 'Minimal electronics',
      subtitle: 'Modern devices with premium clean design.',
      accent: '#f4f5f7',
    },
    {
      id: 's2',
      image:
        'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=1800&q=80',
      title: 'Smart audio picks',
      subtitle: 'Wireless gear and minimal accessories.',
      accent: '#f7f7fa',
    },
    {
      id: 's3',
      image:
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1800&q=80',
      title: 'Daily tech upgrades',
      subtitle: 'Premium design for modern users.',
      accent: '#f2f4f8',
    },
  ];
}

function makeDummyProducts(websiteSlug) {
  const imagePool = [
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
  ];

  const categories = [
    'Electronics',
    'Audio',
    'Phones',
    'Laptops',
    'Accessories',
    'Wearables',
    'Gaming',
    'Tablets',
  ];

  return Array.from({ length: 20 }, (_, index) => ({
    id: `dummy-product-${index + 1}`,
    slug: `dummy-product-${index + 1}`,
    title: `Minimal ${categories[index % categories.length]}`,
    product_image: imagePool[index % imagePool.length],
    pricing_type: index % 4 === 0 ? 'variable' : 'simple',
    price: 120 + index * 15,
    min_price: 120 + index * 15,
    max_price: 180 + index * 20,
    homepage_cta_label: 'Buy Now',
    storefront_cta_label: 'Read More',
    short_description: 'Clean minimal electronics product card ready for your real storefront items.',
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
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=1400&q=80',
  ];

  return Array.from({ length: 4 }, (_, i) => ({
    id: `article-${i + 1}`,
    title:
      i === 0
        ? 'How to choose modern tech for your desk'
        : i === 1
        ? 'Minimal electronics that still feel premium'
        : i === 2
        ? 'Best clean setup ideas for home tech'
        : 'Smart accessories that improve daily use',
    excerpt:
      'Minimal electronics ideas, clean setup inspiration, and premium design guides.',
    featured_image: images[i],
    category: {
      name:
        i === 0 ? 'Workspace' : i === 1 ? 'Electronics' : i === 2 ? 'Setup' : 'Accessories',
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

      case 'mextro':
      case 'mextro_theme':
      case 'mextro_store':
      case 'mextro_template':
        return <TemplateMextro {...sharedTemplateProps} />;

      case 'xxam':
      case 'xxam_theme':
      case 'xxam_store':
      case 'xxam_template':
        return <TemplateXxam {...sharedTemplateProps} />;

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