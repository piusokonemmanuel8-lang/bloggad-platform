import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const {
    login,
    logout,
    loading,
  } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const data = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (data?.user?.role !== 'admin') {
        logout();
        throw new Error('This account does not have Admin access.');
      }

      navigate('/admin/dashboard', {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError?.response?.data?.message ||
          loginError?.message ||
          'Admin login failed.'
      );
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-brand">
          <div className="admin-login-mark" aria-hidden="true">
            B
          </div>
          <div>
            <span>Bloggad</span>
            <small>Administration</small>
          </div>
        </div>

        <div className="admin-login-heading">
          <h1 id="admin-login-title">Admin sign in</h1>
          <p>Use your Bloggad administrator account to continue.</p>
        </div>

        <form onSubmit={submit} className="admin-login-form">
          <label>
            <span>Email address</span>
            <div className="admin-login-input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={form.email}
                onChange={updateField}
                placeholder="admin@example.com"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="admin-login-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={updateField}
                placeholder="Enter your password"
                required
              />
              <button
                className="admin-login-password-toggle"
                type="button"
                onClick={() =>
                  setPasswordVisible((current) => !current)
                }
                aria-label={
                  passwordVisible ? 'Hide password' : 'Show password'
                }
              >
                {passwordVisible ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </label>

          {error ? (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          ) : null}

          <button
            className="admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in to Admin'}
          </button>
        </form>
      </section>
    </main>
  );
}