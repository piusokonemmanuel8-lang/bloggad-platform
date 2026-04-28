import axios from 'axios';

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim();

  if (!raw) return 'http://localhost:5001/api';

  const clean = raw.replace(/\/+$/, '');

  if (clean.endsWith('/api')) return clean;

  return `${clean}/api`;
}

function getStoredToken() {
  return (
    localStorage.getItem('bloggad_token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('adminToken') ||
    localStorage.getItem('affiliateToken') ||
    ''
  );
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    'http://localhost:5001'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;