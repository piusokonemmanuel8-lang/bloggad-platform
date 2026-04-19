import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const data = await login(form);

      if (data?.user?.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }

      navigate('/affiliate/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div
          className="surface-card surface-card-padding"
          style={{ maxWidth: 520, margin: '40px auto' }}
        >
          <h1 className="page-title">Login</h1>
          <p className="page-subtitle">Access your Bloggad account.</p>

          <form className="form-stack" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <input
              className="input-control"
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
            />

            <input
              className="input-control"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />

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

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: 18 }}>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}