import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: '',
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
      const data = await register(form);

      if (data?.user?.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }

      navigate('/affiliate/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="page-shell">
      <div className="container section-space">
        <div
          className="surface-card surface-card-padding"
          style={{ maxWidth: 520, margin: '40px auto' }}
        >
          <h1 className="page-title">Create Account</h1>
          <p className="page-subtitle">Start your Bloggad affiliate website.</p>

          <form className="form-stack" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
            <input
              className="input-control"
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />

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
              {loading ? 'Please wait...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 18 }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}