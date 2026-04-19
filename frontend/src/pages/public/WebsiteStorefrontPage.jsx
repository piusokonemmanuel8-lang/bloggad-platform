import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import formatCurrency from '../../utils/formatCurrency';

function renderPrice(product) {
  if (product.pricing_type === 'simple') {
    return product.price !== null && product.price !== undefined
      ? formatCurrency(product.price)
      : '-';
  }

  return `${formatCurrency(product.min_price || 0)} - ${formatCurrency(product.max_price || 0)}`;
}

function resolveMenuUrl(item) {
  return item?.resolved_url || item?.custom_url || '#';
}

export default function WebsiteStorefrontPage() {
  const { websiteSlug } = useParams();

  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading storefront...</div>
      </div>
    );
  }

  const website = websiteData?.website;
  const design = websiteData?.design_settings;
  const sliders = websiteData?.sliders || [];
  const menus = websiteData?.menus || [];
  const categories = websiteData?.categories || [];
  const products = websiteData?.products || [];

  const headerMenu = menus.find((menu) => menu.location === 'header') || menus[0] || null;

  return (
    <div
      className="page-shell"
      style={{
        background:
          design?.primary_color && design?.secondary_color
            ? `linear-gradient(180deg, ${design.primary_color}10 0%, ${design.secondary_color}10 100%)`
            : undefined,
      }}
    >
      <div className="container section-space">
        {error ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            {error}
          </div>
        ) : null}

        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">{website?.website_name || 'Storefront'}</h1>
          <p className="page-subtitle">{website?.meta_description || 'Affiliate storefront page.'}</p>

          {headerMenu?.items?.length ? (
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 20,
              }}
            >
              {headerMenu.items.map((item) => (
                <Link key={item.id} className="btn btn-secondary" to={resolveMenuUrl(item)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {design?.show_featured_slider && sliders.length ? (
          <div className="grid-2" style={{ marginBottom: 20 }}>
            {sliders.map((slider) => {
              let linkTo = '#';

              if (slider.link_type === 'internal_post' && slider.linked_post?.url) {
                linkTo = slider.linked_post.url;
              } else if (slider.link_type === 'product' && slider.linked_product?.url) {
                linkTo = slider.linked_product.url;
              } else if (slider.link_type === 'external_url' && slider.external_url) {
                linkTo = slider.external_url;
              }

              return (
                <Link
                  key={slider.id}
                  to={linkTo}
                  className="surface-card surface-card-padding"
                  style={{ overflow: 'hidden' }}
                >
                  {slider.image ? (
                    <img
                      src={slider.image}
                      alt={slider.title || 'Slider'}
                      style={{
                        width: '100%',
                        height: 260,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontSize: '1.12rem', fontWeight: 700 }}>
                      {slider.title || 'Featured Slide'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      {slider.subtitle || ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}

        {design?.show_categories_menu && categories.length ? (
          <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
            <h2 className="section-title">Categories</h2>

            <div className="grid-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/${website?.slug}/category/${category.slug}`}
                  className="surface-card surface-card-padding"
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{category.name}</div>
                  <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                    Products: {category.total_products || 0}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="surface-card surface-card-padding">
          <h2 className="section-title">Products</h2>

          <div className="grid-3">
            {products.length ? (
              products.map((product) => (
                <div key={product.id} className="surface-card surface-card-padding">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontSize: '1.08rem', fontWeight: 700 }}>{product.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Category: {product.category?.name || '-'}
                    </div>
                    <div style={{ fontWeight: 700 }}>{renderPrice(product)}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      {product.short_description || ''}
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                      <Link
                        className="btn btn-primary"
                        to={`/${website?.slug}/product/${product.slug}`}
                      >
                        {product.storefront_cta_label || 'Read More'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div>No products available on this storefront.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}