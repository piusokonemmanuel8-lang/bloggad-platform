import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerPageShell from '../../components/customer/CustomerPageShell';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function getStoredToken() {
  return (
    localStorage.getItem('customerToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    ''
  );
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '-';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CustomerSavedProductsPage() {
  const navigate = useNavigate();
  const token = useMemo(() => getStoredToken(), []);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/customer/login', { replace: true });
      return;
    }

    let active = true;

    async function fetchSavedProducts() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(getApiUrl('/api/customer/saved/products'), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const data = await safeJson(response);

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to fetch saved products.');
        }

        if (!active) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to fetch saved products.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchSavedProducts();

    return () => {
      active = false;
    };
  }, [navigate, token]);

  async function handleRemove(productId) {
    setBusyId(productId);
    setError('');

    try {
      const response = await fetch(getApiUrl(`/api/customer/saved/products/${productId}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to remove saved product.');
      }

      setItems((prev) => prev.filter((item) => item?.product?.id !== productId));
    } catch (err) {
      setError(err.message || 'Failed to remove saved product.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <CustomerPageShell
      currentPath="/customer/saved-products"
      badge="Saved Wishlist"
      title="Your saved products"
      subtitle="Products you bookmarked will stay here so you can come back anytime and continue from where you stopped."
      headerRight={
        <div
          style={{
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '12px 16px',
            fontSize: 14,
            color: '#6b7280',
            fontWeight: 600,
          }}
        >
          Total: <span style={{ color: '#111827', fontWeight: 800 }}>{items.length}</span>
        </div>
      }
    >
      {error ? (
        <div
          style={{
            borderRadius: 20,
            border: '1px solid #fecaca',
            background: '#fff1f2',
            padding: '16px 18px',
            fontSize: 14,
            color: '#be123c',
          }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div
          style={{
            borderRadius: 20,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            padding: '18px 20px',
            fontSize: 14,
            color: '#6b7280',
          }}
        >
          Loading saved products...
        </div>
      ) : null}

      {!loading && !items.length ? (
        <div
          style={{
            borderRadius: 24,
            border: '1px dashed #d1d5db',
            background: '#ffffff',
            padding: 40,
            textAlign: 'center',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#111827',
            }}
          >
            No saved products yet
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.7,
              color: '#6b7280',
            }}
          >
            When you bookmark a product from any storefront, it will appear here.
          </div>

          <Link
            to="/"
            style={{
              marginTop: 20,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              padding: '0 18px',
              borderRadius: 16,
              background: '#111827',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Go to marketplace
          </Link>
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        {items.map((item) => {
          const price =
            item?.product?.sale_price !== null &&
            item?.product?.sale_price !== undefined &&
            Number(item.product.sale_price) > 0
              ? item.product.sale_price
              : item?.product?.price;

          return (
            <article
              key={item.saved_id}
              style={{
                overflow: 'hidden',
                borderRadius: 24,
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
              }}
            >
              <div
                style={{
                  aspectRatio: '1 / 1',
                  width: '100%',
                  overflow: 'hidden',
                  background: '#f8fafc',
                }}
              >
                {item?.product?.featured_image ? (
                  <img
                    src={item.product.featured_image}
                    alt={item?.product?.name || 'Product'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: '#94a3b8',
                    }}
                  >
                    No image
                  </div>
                )}
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span
                    style={{
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      padding: '6px 10px',
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#6b7280',
                    }}
                  >
                    {item?.website?.website_name || 'Storefront'}
                  </span>

                  <span
                    style={{
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      padding: '6px 10px',
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#6b7280',
                    }}
                  >
                    {item?.affiliate?.name || 'Affiliate'}
                  </span>
                </div>

                <h2
                  style={{
                    margin: '16px 0 0',
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.2,
                    color: '#111827',
                  }}
                >
                  {item?.product?.name || 'Untitled product'}
                </h2>

                <div
                  style={{
                    marginTop: 14,
                    fontSize: 24,
                    fontWeight: 800,
                    color: '#111827',
                  }}
                >
                  {formatMoney(price)}
                </div>

                {item?.product?.sale_price !== null &&
                item?.product?.sale_price !== undefined &&
                Number(item.product.sale_price) > 0 &&
                Number(item?.product?.price) > Number(item.product.sale_price) ? (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      color: '#9ca3af',
                      textDecoration: 'line-through',
                    }}
                  >
                    {formatMoney(item.product.price)}
                  </div>
                ) : null}

                <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <Link
                    to={item?.product?.slug ? `/products/${item.product.slug}` : '#'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 46,
                      padding: '0 16px',
                      borderRadius: 16,
                      background: '#111827',
                      color: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    View Product
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(item?.product?.id)}
                    disabled={busyId === item?.product?.id}
                    style={{
                      minHeight: 46,
                      padding: '0 16px',
                      borderRadius: 16,
                      border: '1px solid #fecaca',
                      background: '#fff1f2',
                      color: '#be123c',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: busyId === item?.product?.id ? 'not-allowed' : 'pointer',
                      opacity: busyId === item?.product?.id ? 0.65 : 1,
                    }}
                  >
                    {busyId === item?.product?.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </CustomerPageShell>
  );
}