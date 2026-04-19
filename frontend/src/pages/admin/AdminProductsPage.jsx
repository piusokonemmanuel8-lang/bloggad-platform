import { useEffect, useState } from 'react';
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productDetails, setProductDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container section-space">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div className="surface-card surface-card-padding" style={{ marginBottom: 20 }}>
          <h1 className="page-title">Admin Products</h1>
          <p className="page-subtitle">
            Review affiliate products, inspect details, change status, and delete records.
          </p>
        </div>

        <div className="grid-2">
          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Product List</h2>

            <div className="form-stack">
              {products.length ? (
                products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="surface-card surface-card-padding"
                    onClick={() => handleSelectProduct(product)}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border:
                        String(selectedProductId) === String(product.id)
                          ? '1px solid rgba(122, 92, 255, 0.9)'
                          : '1px solid rgba(255,255,255,0.08)',
                      background:
                        String(selectedProductId) === String(product.id)
                          ? 'rgba(122, 92, 255, 0.12)'
                          : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{product.title}</div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Affiliate: {product.affiliate?.name || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Website: {product.website?.website_name || '-'}
                    </div>
                    <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                      Status: {product.status}
                    </div>
                  </button>
                ))
              ) : (
                <div>No products found.</div>
              )}
            </div>
          </div>

          <div className="surface-card surface-card-padding">
            <h2 className="section-title">Product Details</h2>

            {detailsLoading ? (
              <div>Loading product details...</div>
            ) : productDetails ? (
              <div className="form-stack">
                <div className="surface-card surface-card-padding">
                  {productDetails.product_image ? (
                    <img
                      src={productDetails.product_image}
                      alt={productDetails.title}
                      style={{
                        width: '100%',
                        height: 240,
                        objectFit: 'cover',
                        borderRadius: 16,
                        marginBottom: 14,
                      }}
                    />
                  ) : null}

                  <div><strong>Title:</strong> {productDetails.title}</div>
                  <div><strong>Slug:</strong> {productDetails.slug}</div>
                  <div><strong>Status:</strong> {productDetails.status}</div>
                  <div><strong>Pricing Type:</strong> {productDetails.pricing_type}</div>
                  <div><strong>Price:</strong> {renderPrice(productDetails)}</div>
                  <div><strong>Homepage CTA:</strong> {productDetails.homepage_cta_label || '-'}</div>
                  <div><strong>Storefront CTA:</strong> {productDetails.storefront_cta_label || '-'}</div>
                  <div><strong>Buy URL:</strong> {productDetails.affiliate_buy_url || '-'}</div>
                  <div><strong>Category:</strong> {productDetails.category?.name || '-'}</div>
                  <div><strong>Website:</strong> {productDetails.website?.website_name || '-'}</div>
                  <div><strong>Affiliate:</strong> {productDetails.affiliate?.name || '-'}</div>
                  <div><strong>Total Posts:</strong> {productDetails.stats?.total_posts || 0}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Short Description</h3>
                  <div>{productDetails.short_description || 'No description'}</div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Product Posts</h3>

                  <div className="form-stack">
                    {(productDetails.posts || []).length ? (
                      productDetails.posts.map((post) => (
                        <div key={post.id} className="surface-card surface-card-padding">
                          <div style={{ fontWeight: 700 }}>{post.title}</div>
                          <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                            Status: {post.status}
                          </div>
                          <div style={{ color: 'rgba(245,247,251,0.72)' }}>
                            Published: {post.published_at || '-'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>No posts connected to this product.</div>
                    )}
                  </div>
                </div>

                <div className="surface-card surface-card-padding">
                  <h3 className="section-title">Actions</h3>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleStatusChange('published')}
                      disabled={statusSaving}
                    >
                      Publish
                    </button>

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleStatusChange('draft')}
                      disabled={statusSaving}
                    >
                      Set Draft
                    </button>

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => handleStatusChange('inactive')}
                      disabled={statusSaving}
                    >
                      Set Inactive
                    </button>

                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete Product'}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255, 80, 80, 0.12)',
                      border: '1px solid rgba(255, 80, 80, 0.22)',
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(80, 200, 120, 0.12)',
                      border: '1px solid rgba(80, 200, 120, 0.22)',
                    }}
                  >
                    {success}
                  </div>
                ) : null}
              </div>
            ) : (
              <div>Select a product to view details.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}