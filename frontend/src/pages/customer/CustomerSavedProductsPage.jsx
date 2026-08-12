import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  CircleDollarSign,
  Crown,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  ShoppingBag,
  Sparkles,
  Tags,
  UserRoundCheck,
  X,
} from 'lucide-react';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import ReaderUnifiedShell from '../../components/reader/ReaderUnifiedShell';
import './CustomerSavedPostsApproved.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

const readerGroups = [
  {
    label: 'Discover',
    items: [
      { label: 'Overview', to: '/reader/dashboard', icon: Home },
      { label: 'For You', to: '/reader/feed', icon: Sparkles },
      { label: 'Interests', to: '/reader/interests', icon: Tags },
    ],
  },
  {
    label: 'Library',
    items: [
      { label: 'Saved Posts', to: '/reader/saved-posts', icon: Bookmark },
      { label: 'Saved Products', to: '/reader/saved-products', icon: ShoppingBag },
      { label: 'Following', to: '/reader/following', icon: UserRoundCheck },
      { label: 'Courses', to: '/reader/courses', icon: GraduationCap },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Credits', to: '/reader/credits', icon: CircleDollarSign },
      { label: 'Premium', to: '/reader/premium', icon: Crown },
      { label: 'Notifications', to: '/reader/notifications', icon: Bell },
      { label: 'Messages', to: '/reader/messages', icon: MessageCircle },
      { label: 'Settings', to: '/reader/settings', icon: Settings },
    ],
  },
];

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

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem('customerUser') ||
      localStorage.getItem('user') ||
      '';

    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

function displayName(user) {
  return (
    user?.display_name ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    'Reader'
  );
}

function initialFor(value) {
  const clean = String(value || '').trim();
  return clean ? clean.charAt(0).toUpperCase() : 'R';
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

function getSavedPrice(item) {
  return item?.product?.sale_price !== null &&
    item?.product?.sale_price !== undefined &&
    Number(item.product.sale_price) > 0
    ? item.product.sale_price
    : item?.product?.price;
}

function hasSavedSale(item) {
  return (
    item?.product?.sale_price !== null &&
    item?.product?.sale_price !== undefined &&
    Number(item.product.sale_price) > 0 &&
    Number(item?.product?.price) > Number(item.product.sale_price)
  );
}

function ReaderNavigation({ onNavigate }) {
  return (
    <nav className="reader-saved-nav" aria-label="Reader navigation">
      {readerGroups.map((group) => (
        <div className="reader-saved-nav-group" key={group.label}>
          <div className="reader-saved-nav-label">{group.label}</div>
          <div className="reader-saved-nav-list">
            {group.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `reader-saved-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="reader-saved-nav-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={1.9} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function CustomerSavedProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useMemo(() => getStoredToken(), []);
  const customer = useMemo(() => getStoredUser(), []);
  const readerName = useMemo(() => displayName(customer), [customer]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isReaderRoute = location.pathname === '/reader/saved-products';

  useEffect(() => {
    if (!token) {
      navigate(isReaderRoute ? '/reader/login' : '/customer/login', { replace: true });
      return undefined;
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
  }, [isReaderRoute, navigate, token]);

  async function handleRemove(productId) {
    if (!productId || busyId) return;

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

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('supgad_token');
    localStorage.removeItem('user');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('customerLoginContext');
    navigate('/reader/login', { replace: true });
  }

  if (isReaderRoute) {
    return (
      <ReaderUnifiedShell title="Saved Products" subtitle="Your Reader library">
        <style>{readerSavedProductsContentCss}</style>
<main className="reader-saved-page">
            <section className="reader-saved-hero">
              <div>
                <h2 className="reader-saved-desktop-heading">Saved products</h2>
                <h2 className="reader-saved-mobile-heading">Saved Products</h2>
                <p className="reader-saved-desktop-subtitle">
                  Keep the products you want to revisit in one clean list.
                </p>
                <p className="reader-saved-mobile-subtitle">
                  Products you saved to view again.
                </p>
              </div>
              <span className="reader-saved-count">
                {items.length} saved {items.length === 1 ? 'product' : 'products'}
              </span>
            </section>

            <div className="reader-saved-info">
              <ShoppingBag size={15} aria-hidden="true" />
              <span>
                Saved products stay here until you remove them. Open any card to view the product.
              </span>
            </div>

            {error ? (
              <div className="reader-saved-alert error" role="alert">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="reader-saved-loading" role="status">
                <span className="reader-saved-loading-dot" />
                Loading saved products...
              </div>
            ) : null}

            {!loading && !error && items.length === 0 ? (
              <section className="reader-saved-empty">
                <div className="reader-saved-empty-icon" aria-hidden="true">P</div>
                <h3>No saved products yet</h3>
                <p>When you save a product, it will be kept here until you remove it.</p>
                <Link className="reader-saved-product-marketplace" to="/">
                  Go to marketplace
                </Link>
              </section>
            ) : null}

            {!loading && items.length > 0 ? (
              <section className="reader-saved-grid" aria-label="Saved products">
                {items.map((item) => {
                  const product = item?.product || {};
                  const price = getSavedPrice(item);
                  const writer = item?.affiliate?.name || 'Writer';
                  const storefront = item?.website?.website_name || 'Storefront';
                  const viewPath = product?.slug ? `/products/${product.slug}` : '#';

                  return (
                    <article className="reader-saved-card" key={item.saved_id || product.id}>
                      <Link
                        to={viewPath}
                        className="reader-saved-card-media"
                        aria-label={`View ${product.name || 'saved product'}`}
                      >
                        {product.featured_image ? (
                          <img
                            src={product.featured_image}
                            alt={product.name || 'Saved product'}
                          />
                        ) : (
                          <span className="reader-saved-no-image">
                            <ShoppingBag size={24} aria-hidden="true" />
                            <span>No image</span>
                          </span>
                        )}
                      </Link>

                      <div className="reader-saved-card-body">
                        <div className="reader-saved-card-meta">
                          <span className="reader-saved-date">{storefront}</span>
                          <span className="reader-saved-writer">{writer}</span>
                        </div>

                        <h3>{product.name || 'Untitled product'}</h3>

                        <div className="reader-saved-product-prices">
                          <strong>{formatMoney(price)}</strong>
                          {hasSavedSale(item) ? (
                            <span>{formatMoney(product.price)}</span>
                          ) : null}
                        </div>

                        <div className="reader-saved-card-actions">
                          <Link to={viewPath} className="reader-saved-read-button">
                            View Product
                          </Link>
                          <button
                            type="button"
                            className="reader-saved-remove-button"
                            onClick={() => handleRemove(product.id)}
                            disabled={busyId === product.id}
                          >
                            {busyId === product.id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            ) : null}
          </main>
      </ReaderUnifiedShell>
    );
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
          const price = getSavedPrice(item);

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
                    {item?.affiliate?.name || 'Writer'}
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

                {hasSavedSale(item) ? (
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

const readerSavedProductsContentCss = `
  .reader-saved-product-prices {
    margin: 38px 0 0;
    min-width: 0;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }

  .reader-saved-product-prices strong {
    color: #111827;
    font-size: 18px;
    line-height: 1.25;
    font-weight: 780;
    letter-spacing: -0.02em;
    overflow-wrap: anywhere;
  }

  .reader-saved-product-prices span {
    color: #8a96a8;
    font-size: 11px;
    line-height: 1.25;
    text-decoration: line-through;
    overflow-wrap: anywhere;
  }

  .reader-saved-product-marketplace {
    min-height: 34px;
    margin-top: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    border-radius: 9px;
    border: 1px solid #111827;
    background: #111827;
    color: #ffffff;
    font-size: 12px;
    line-height: 1;
    font-weight: 700;
    text-decoration: none;
  }

  @media (max-width: 767px) {
    .reader-saved-product-prices {
      margin-top: 24px;
    }

    .reader-saved-product-prices strong {
      font-size: 17px;
    }
  }
`;
