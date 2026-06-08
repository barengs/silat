import axios from 'axios';

/**
 * Bootstrap the Axios HTTP client.
 * Sets base URL and default headers for all API requests.
 */
window.axios = axios;

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = false; // JWT is stateless, no cookies needed

// ── JWT Token Interceptor ──────────────────────────────────────────────────────

/**
 * Request interceptor: attach JWT token from localStorage to every request.
 */
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor: handle 401 (token expired/invalid) globally.
 * Clears auth data and redirects to login page.
 */
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const errorCode = error.response.data?.error;
            // Don't redirect for explicit login attempts
            if (errorCode !== 'invalid_credentials') {
                // Trigger lock screen instead of logging out immediately
                window.dispatchEvent(new CustomEvent('auth:lock'));
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
