import { useEffect, useMemo, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import EditorialAuthScreen from '../../components/auth/EditorialAuthScreen';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '';

function getApiUrl(path) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

function readStorefrontContext(location, searchParams) {
  const state = location.state || {};

  return {
    website_id:
      state.website_id ||
      searchParams.get('website_id') ||
      '',
    website_slug:
      state.website_slug ||
      searchParams.get('website_slug') ||
      '',
    affiliate_id:
      state.affiliate_id ||
      searchParams.get('affiliate_id') ||
      '',
  };
}

function getInitialRole(location, searchParams) {
  const queryRole = String(searchParams.get('role') || '')
    .trim()
    .toLowerCase();

  if (queryRole === 'writer' || queryRole === 'reader') {
    return queryRole;
  }

  if (
    location.pathname.includes('/reader/') ||
    location.pathname.includes('/customer/')
  ) {
    return 'reader';
  }

  return 'writer';
}

function buildLoginLink(role, storefrontContext) {
  const params = new URLSearchParams();
  params.set('role', role);

  if (role === 'reader') {
    if (storefrontContext.website_id) {
      params.set('website_id', storefrontContext.website_id);
    }

    if (storefrontContext.website_slug) {
      params.set('website_slug', storefrontContext.website_slug);
    }

    if (storefrontContext.affiliate_id) {
      params.set('affiliate_id', storefrontContext.affiliate_id);
    }
  }

  return `/login?${params.toString()}`;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, loading: writerLoading } = useAuth();

  const storefrontContext = useMemo(
    () => readStorefrontContext(location, searchParams),
    [location, searchParams]
  );

  const [role, setRole] = useState(() =>
    getInitialRole(location, searchParams)
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [readerLoading, setReaderLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (location.pathname === '/register') return;

    const params = new URLSearchParams(location.search);
    params.set('role', getInitialRole(location, searchParams));

    navigate(`/register?${params.toString()}`, {
      replace: true,
      state: location.state,
    });
  }, [
    location.pathname,
    location.search,
    location.state,
    navigate,
    searchParams,
  ]);

  function handleRoleChange(nextRole) {
    if (nextRole !== 'writer' && nextRole !== 'reader') return;

    setRole(nextRole);
    setError('');
    setSuccess('');

    const params = new URLSearchParams(searchParams);
    params.set('role', nextRole);

    setSearchParams(params, {
      replace: true,
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submitWriterRegister() {
    const data = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (data?.user?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    navigate('/affiliate/dashboard');
  }

  async function submitReaderRegister() {
    setReaderLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirm_password: form.password,
      };

      if (storefrontContext.website_id) {
        payload.website_id = Number(storefrontContext.website_id);
      }

      if (storefrontContext.website_slug) {
        payload.website_slug = storefrontContext.website_slug.trim();
      }

      const response = await fetch(
        getApiUrl('/api/customer-auth/register'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.message || 'Failed to create account.'
        );
      }

      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('customerToken', data.token);
      }

      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem(
          'customerUser',
          JSON.stringify(data.user)
        );
      }

      setSuccess(
        data?.message || 'Reader account created successfully.'
      );

      navigate('/reader/onboarding', {
        replace: true,
      });
    } finally {
      setReaderLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    try {
      if (role === 'reader') {
        await submitReaderRegister();
      } else {
        await submitWriterRegister();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Registration failed'
      );
    }
  }

  const storefrontNote =
    role === 'reader' &&
    (storefrontContext.website_slug || storefrontContext.website_id)
      ? `You are creating your Reader account from this Storefront${
          storefrontContext.website_slug
            ? ` (${storefrontContext.website_slug})`
            : ''
        }.`
      : '';

  return (
    <EditorialAuthScreen
      role={role}
      mode="register"
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onRoleChange={handleRoleChange}
      loading={role === 'reader' ? readerLoading : writerLoading}
      error={error}
      success={success}
      storefrontNote={storefrontNote}
      switchTo={buildLoginLink(role, storefrontContext)}
      passwordVisible={passwordVisible}
      onTogglePassword={() =>
        setPasswordVisible((visible) => !visible)
      }
    />
  );
}