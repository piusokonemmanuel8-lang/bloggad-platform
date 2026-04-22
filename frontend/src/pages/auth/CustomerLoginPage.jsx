import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function normalizeStorefrontFromLocation(location, searchParams) {
  const websiteId = searchParams.get('website_id') || '';
  const websiteSlug = searchParams.get('website_slug') || '';
  const affiliateId = searchParams.get('affiliate_id') || '';

  const state = location.state || {};

  return {
    website_id: state.website_id || websiteId || '',
    website_slug: state.website_slug || websiteSlug || '',
    affiliate_id: state.affiliate_id || affiliateId || '',
  };
}

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const storefrontContext = useMemo(
    () => normalizeStorefrontFromLocation(location, searchParams),
    [location, searchParams]
  );

  const [form, setForm] = useState({
    email: '',
    password: '',
    website_id: storefrontContext.website_id,
    website_slug: storefrontContext.website_slug,
    affiliate_id: storefrontContext.affiliate_id,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      if (form.website_id) payload.website_id = Number(form.website_id);
      if (form.website_slug) payload.website_slug = form.website_slug.trim();

      const response = await fetch(getApiUrl('/api/customer-auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to login.');
      }

      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('customerToken', data.token);
      }

      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('customerUser', JSON.stringify(data.user));
      }

      if (data?.login_context) {
        localStorage.setItem('customerLoginContext', JSON.stringify(data.login_context));
      }

      setSuccess(data?.message || 'Customer login successful.');

      navigate('/customer/dashboard', {
        replace: true,
      });
    } catch (err) {
      setError(err.message || 'Failed to login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="customer-auth-page">
      <div className="customer-auth-shell">
        <div className="customer-auth-card">
          <div className="customer-auth-head">
            <div className="customer-auth-badge">Customer Login</div>
            <h1>Sign in to your account</h1>
            <p>
              Continue reading saved posts, manage bookmarks, request coupons, and message affiliates.
            </p>
          </div>

          <div className="customer-auth-body">
            {storefrontContext.website_slug || storefrontContext.website_id ? (
              <div className="customer-auth-alert customer-auth-alert-success">
                You are signing in from this storefront
                {storefrontContext.website_slug ? ` (${storefrontContext.website_slug})` : ''}.
              </div>
            ) : null}

            {error ? (
              <div className="customer-auth-alert customer-auth-alert-error">{error}</div>
            ) : null}

            {success ? (
              <div className="customer-auth-alert customer-auth-alert-success">{success}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="customer-auth-form">
              <div className="customer-auth-field">
                <label htmlFor="customer-login-email">Email</label>
                <input
                  id="customer-login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="customer-auth-field">
                <label htmlFor="customer-login-password">Password</label>
                <input
                  id="customer-login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="customer-auth-submit"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="customer-auth-foot">
              Do not have an account?{' '}
              <Link
                to={
                  storefrontContext.website_slug
                    ? `/customer/register?website_slug=${encodeURIComponent(
                        storefrontContext.website_slug
                      )}`
                    : storefrontContext.website_id
                    ? `/customer/register?website_id=${encodeURIComponent(
                        storefrontContext.website_id
                      )}`
                    : '/customer/register'
                }
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}