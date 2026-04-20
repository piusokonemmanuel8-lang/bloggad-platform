import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShoppingBag,
  SquarePen,
  Tag,
  Trash2,
  User2,
  Wallet,
  XCircle,
} from 'lucide-react';
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

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function cardStyle(extra = {}) {
  return {
    background: '#ffffff',
    border: '1px solid #dcdcde',
    borderRadius: 0,
    boxShadow: 'none',
    ...extra,
  };
}

function badgeStyle(status) {
  const clean = String(status || '').toLowerCase();

  if (clean === 'published') {
    return {
      border: '1px solid #b7e4c7',
      background: '#ecfdf3',
      color: '#166534',
    };
  }

  if (clean === 'draft') {
    return {
      border: '1px solid #f3d28b',
      background: '#fff7e6',
      color: '#9a6700',
    };
  }

  if (clean === 'inactive') {
    return {
      border: '1px solid #f1b5b8',
      background: '#fff1f2',
      color: '#b42318',
    };
  }

  return {
    border: '1px solid #dcdcde',
    background: '#f6f7f7',
    color: '#50575e',
  };
}

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const iconTone =
    tone === 'primary'
      ? { background: '#2271b1', color: '#fff', border: '1px solid #2271b1' }
      : tone === 'success'
      ? { background: '#ecfdf3', color: '#166534', border: '1px solid #b7e4c7' }
      : tone === 'warning'
      ? { background: '#fff7e6', color: '#9a6700', border: '1px solid #f3d28b' }
      : { background: '#f6f7f7', color: '#1d2327', border: '1px solid #dcdcde' };

  return (
    <div style={cardStyle({ padding: 20 })}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#646970', marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: 34, lineHeight: 1, fontWeight: 700, color: '#1d2327' }}>
            {value}
          </div>
        </div>

        <div
          style={{
            width: 44,
            height: 44,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...iconTone,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = async () => {
    const { data } = await api.get('/api/admin/products');
    setProducts(data?.products || []);
  };

  const fetchSingleProduct = async (productId) => {
    const { data } = await api.get(`/api/admin/products/${productId}`);
    setProductDetails(data?.product || null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchProducts();
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSelectProduct = async (product) => {
    try {
      setDetailsLoading(true);
      setSelectedProductId(String(product.id));
      setError('');
      setSuccess('');
      await fetchSingleProduct(product.id);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load product details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshAll = async (targetId = null) => {
    await fetchProducts();

    const chosenId = targetId || selectedProductId;
    if (chosenId) {
      await fetchSingleProduct(chosenId);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      setSuccess('');
      await refreshAll();
      setSuccess('Products refreshed successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to refresh products');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedProductId) return;

    try {
      setStatusSaving(true);
      setError('');
      setSuccess('');

      const { data } = await api.put(`/api/admin/products/${selectedProductId}/status`, {
        status,
      });

      await refreshAll(selectedProductId);
      setSuccess(data?.message || 'Product status updated successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update product status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProductId) return;

    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      const { data } = await api.delete(`/api/admin/products/${selectedProductId}`);
      setSelectedProductId('');
      setProductDetails(null);
      await fetchProducts();
      setSuccess(data?.message || 'Product deleted successfully');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((product) => {
      const title = String(product?.title || '').toLowerCase();
      const affiliate = String(product?.affiliate?.name || '').toLowerCase();
      const website = String(product?.website?.website_name || '').toLowerCase();
      const status = String(product?.status || '').toLowerCase();

      return (
        title.includes(keyword) ||
        affiliate.includes(keyword) ||
        website.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [products, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter(
      (item) => String(item?.status || '').toLowerCase() === 'published'
    ).length;
    const draft = products.filter(
      (item) => String(item?.status || '').toLowerCase() === 'draft'
    ).length;
    const inactive = products.filter(
      (item) => String(item?.status || '').toLowerCase() === 'inactive'
    ).length;

    return { total, published, draft, inactive };
  }, [products]);

  if (loading) {
    return (
      <div style={cardStyle({ padding: 20 })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
          <Loader2 size={18} className="spin-soft" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        .admin-product-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .admin-product-main-grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 20px;
        }
        .admin-product-split-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 20px;
        }
        .admin-product-two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .spin-soft {
          animation: spinSoft 0.9s linear infinite;
        }
        @keyframes spinSoft {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1200px) {
          .admin-product-grid-4,
          .admin-product-main-grid,
          .admin-product-split-grid,
          .admin-product-two-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 10,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: 1.2,
                fontWeight: 700,
                color: '#1d2327',
              }}
            >
              Products
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#646970' }}>
              Review affiliate products, inspect details, change status, and delete records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              border: '1px solid #2271b1',
              background: refreshing ? '#f6f7f7' : '#ffffff',
              color: '#2271b1',
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin-soft' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #d63638',
              color: '#b42318',
              marginBottom: 20,
            }),
          }}
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          style={{
            ...cardStyle({
              padding: 14,
              borderLeft: '4px solid #00a32a',
              color: '#166534',
              marginBottom: 20,
            }),
          }}
        >
          {success}
        </div>
      ) : null}

      <div style={{ ...cardStyle({ padding: 16, marginBottom: 20, borderLeft: '4px solid #72aee6' }) }}>
        Product records control affiliate storefront items, pricing, CTA labels, and connected posts.
      </div>

      <div className="admin-product-grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Products" value={stats.total} icon={ShoppingBag} tone="primary" />
        <StatCard label="Published" value={stats.published} icon={BadgeCheck} tone="success" />
        <StatCard label="Draft" value={stats.draft} icon={SquarePen} tone="warning" />
        <StatCard label="Inactive" value={stats.inactive} icon={ShieldAlert} />
      </div>

      <div className="admin-product-main-grid">
        <section style={cardStyle()}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                  Product List
                </div>
                <div style={{ fontSize: 13, color: '#646970' }}>
                  Select a product to inspect full details.
                </div>
              </div>

              <div
                style={{
                  padding: '6px 10px',
                  background: '#f6f7f7',
                  border: '1px solid #dcdcde',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#50575e',
                }}
              >
                {filteredProducts.length} shown
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#646970',
                }}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, affiliate, website, status..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  border: '1px solid #8c8f94',
                  background: '#fff',
                  color: '#1d2327',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ maxHeight: 900, overflowY: 'auto', padding: 18 }}>
            {filteredProducts.length ? (
              filteredProducts.map((product) => {
                const selected = String(selectedProductId) === String(product.id);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: 12,
                      padding: 16,
                      cursor: 'pointer',
                      background: selected ? '#f0f6fc' : '#ffffff',
                      border: selected ? '1px solid #72aee6' : '1px solid #dcdcde',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f6f7f7',
                            border: '1px solid #dcdcde',
                            color: '#1d2327',
                            flexShrink: 0,
                          }}
                        >
                          <ShoppingBag size={18} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: '#1d2327',
                              marginBottom: 4,
                              wordBreak: 'break-word',
                            }}
                          >
                            {product.title}
                          </div>
                          <div style={{ fontSize: 13, color: '#646970', wordBreak: 'break-word' }}>
                            Affiliate: {product.affiliate?.name || '-'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '5px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...badgeStyle(product.status),
                        }}
                      >
                        {product.status || '-'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 8, fontSize: 13, color: '#646970' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <span>Website</span>
                        <strong style={{ color: '#1d2327' }}>
                          {product.website?.website_name || '-'}
                        </strong>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 18, color: '#646970' }}>No products found.</div>
            )}
          </div>
        </section>

        <section>
          {detailsLoading ? (
            <div style={cardStyle({ padding: 20 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#646970' }}>
                <Loader2 size={18} className="spin-soft" />
                <span>Loading product details...</span>
              </div>
            </div>
          ) : productDetails ? (
            <>
              <div style={{ ...cardStyle(), marginBottom: 20, overflow: 'hidden' }}>
                {productDetails.product_image ? (
                  <div style={{ borderBottom: '1px solid #dcdcde', background: '#f6f7f7' }}>
                    <img
                      src={productDetails.product_image}
                      alt={productDetails.title}
                      style={{
                        width: '100%',
                        height: 260,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f6f7f7',
                      borderBottom: '1px solid #dcdcde',
                      color: '#646970',
                    }}
                  >
                    <ImageIcon size={28} />
                  </div>
                )}

                <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327', marginBottom: 6 }}>
                    Product Details
                  </div>
                  <div style={{ fontSize: 13, color: '#646970' }}>
                    Product identity, pricing, CTA, category, and connected content details.
                  </div>
                </div>

                <div className="admin-product-two-grid" style={{ padding: 18 }}>
                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7', gridColumn: '1 / -1' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Title</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>{productDetails.title || '-'}</div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Slug</div>
                    <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                      {productDetails.slug || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Status</div>
                    <div
                      style={{
                        display: 'inline-flex',
                        padding: '5px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        ...badgeStyle(productDetails.status),
                      }}
                    >
                      {productDetails.status || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Pricing Type</div>
                    <div style={{ fontWeight: 600, color: '#1d2327', textTransform: 'capitalize' }}>
                      {productDetails.pricing_type || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Price</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {renderPrice(productDetails)}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Homepage CTA</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {productDetails.homepage_cta_label || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Storefront CTA</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {productDetails.storefront_cta_label || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7', gridColumn: '1 / -1' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Buy URL</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontWeight: 600, color: '#1d2327', wordBreak: 'break-word' }}>
                        {productDetails.affiliate_buy_url || '-'}
                      </div>
                      {productDetails.affiliate_buy_url ? (
                        <a
                          href={productDetails.affiliate_buy_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            border: '1px solid #dcdcde',
                            background: '#ffffff',
                            color: '#1d2327',
                            padding: '6px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          <ExternalLink size={12} />
                          Open
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Category</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {productDetails.category?.name || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Website</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {productDetails.website?.website_name || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Affiliate</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {productDetails.affiliate?.name || '-'}
                    </div>
                  </div>

                  <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                    <div style={{ fontSize: 12, color: '#646970', marginBottom: 8 }}>Total Posts</div>
                    <div style={{ fontWeight: 600, color: '#1d2327' }}>
                      {productDetails.stats?.total_posts || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-product-split-grid">
                <div>
                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Short Description
                      </div>
                    </div>
                    <div style={{ padding: 18, fontSize: 14, lineHeight: 1.7, color: '#1d2327' }}>
                      {productDetails.short_description || 'No description'}
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Connected Posts
                      </div>
                    </div>

                    <div style={{ padding: 18 }}>
                      {(productDetails.posts || []).length ? (
                        productDetails.posts.map((post) => (
                          <div
                            key={post.id}
                            style={{
                              border: '1px solid #dcdcde',
                              background: '#ffffff',
                              padding: 14,
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: 12,
                                marginBottom: 8,
                              }}
                            >
                              <div style={{ fontSize: 15, fontWeight: 600, color: '#1d2327' }}>
                                {post.title || '-'}
                              </div>

                              <div
                                style={{
                                  padding: '5px 10px',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                  ...badgeStyle(post.status),
                                }}
                              >
                                {post.status || '-'}
                              </div>
                            </div>

                            <div style={{ fontSize: 13, color: '#646970' }}>
                              Published: {formatDateTime(post.published_at)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#646970' }}>No posts connected to this product.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ ...cardStyle(), marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Quick Summary
                      </div>
                    </div>

                    <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <User2 size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Affiliate</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {productDetails.affiliate?.name || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <Globe size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Website</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {productDetails.website?.website_name || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <Tag size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Category</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {productDetails.category?.name || '-'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ ...cardStyle({ padding: 14, background: '#f6f7f7' }) }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ffffff',
                              border: '1px solid #dcdcde',
                              color: '#1d2327',
                            }}
                          >
                            <Wallet size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: '#646970', marginBottom: 4 }}>Price</div>
                            <div style={{ fontWeight: 600, color: '#1d2327' }}>
                              {renderPrice(productDetails)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #dcdcde' }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#1d2327' }}>
                        Actions
                      </div>
                    </div>

                    <div style={{ padding: 18, display: 'grid', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange('published')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #00a32a',
                          background: '#ffffff',
                          color: '#00a32a',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <BadgeCheck size={16} />
                        Publish
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange('draft')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #dba617',
                          background: '#ffffff',
                          color: '#9a6700',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <SquarePen size={16} />
                        Set Draft
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange('inactive')}
                        disabled={statusSaving}
                        style={{
                          border: '1px solid #d63638',
                          background: '#ffffff',
                          color: '#d63638',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <XCircle size={16} />
                        Set Inactive
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                          border: '1px solid #d63638',
                          background: '#fff1f2',
                          color: '#d63638',
                          padding: '10px 14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <Trash2 size={16} />
                        {deleting ? 'Deleting...' : 'Delete Product'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={cardStyle({ padding: 40, textAlign: 'center', color: '#646970' })}>
              Choose a product from the left panel to inspect details and manage its status.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}