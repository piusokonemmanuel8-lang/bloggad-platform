import axios from 'axios';

function getStoredToken() {
  return (
    localStorage.getItem('bloggad_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('customerToken') ||
    ''
  );
}

function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (envUrl) return envUrl;

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  return '';
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);


let bloggadGlobalPendingRequests = 0;

function emitBloggadGlobalLoading() {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('bloggad:global-loading', {
      detail: { pending: bloggadGlobalPendingRequests },
    })
  );
}

function beginBloggadGlobalLoading(config) {
  const method = String(config?.method || 'get').toLowerCase();
  const shouldTrack =
    method === 'get' &&
    config?.skipGlobalLoader !== true &&
    config?.headers?.['x-bloggad-skip-global-loader'] !== '1';

  if (!shouldTrack) return config;

  bloggadGlobalPendingRequests += 1;
  config.__bloggadGlobalLoaderTracked = true;
  emitBloggadGlobalLoading();

  return config;
}

function endBloggadGlobalLoading(config) {
  if (!config?.__bloggadGlobalLoaderTracked) return;

  bloggadGlobalPendingRequests = Math.max(0, bloggadGlobalPendingRequests - 1);
  emitBloggadGlobalLoading();
}

api.interceptors.request.use(
  (config) => beginBloggadGlobalLoading(config),
  (error) => {
    endBloggadGlobalLoading(error?.config);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    endBloggadGlobalLoading(response?.config);
    return response;
  },
  (error) => {
    endBloggadGlobalLoading(error?.config);
    return Promise.reject(error);
  }
);
export default api;