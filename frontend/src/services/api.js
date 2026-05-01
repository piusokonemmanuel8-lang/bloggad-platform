import axios from 'axios';

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    return isLocalhost ? 'http://localhost:5000/api' : '/api';
  }

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
    localStorage.getItem('customerToken') ||
    ''
  );
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ''
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

export function apiUrl(path = '') {
  if (!path) return API_BASE_URL;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export default api;