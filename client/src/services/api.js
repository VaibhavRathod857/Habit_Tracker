import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
export const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.replace(/\/+$/, '').endsWith('/api')
      ? rawApiUrl.replace(/\/+$/, '')
      : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('disciplineos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Token expired or invalid
      localStorage.removeItem('disciplineos_token');
      localStorage.removeItem('disciplineos_user');
      if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
