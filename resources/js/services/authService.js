import axios from '@/bootstrap';

/**
 * Auth Service — handles all authentication API calls.
 */
const authService = {
    /**
     * Login with email and password.
     * Returns: { token, user, roles, permissions }
     */
    login: async (credentials) => {
        const response = await axios.post('/auth/login', credentials);
        return response.data;
    },

    /**
     * Logout — invalidates JWT on server side.
     */
    logout: async () => {
        const response = await axios.post('/auth/logout');
        return response.data;
    },

    /**
     * Refresh JWT token before it expires.
     */
    refresh: async () => {
        const response = await axios.post('/auth/refresh');
        return response.data;
    },

    /**
     * Get current authenticated user profile with roles/permissions.
     */
    me: async () => {
        const response = await axios.get('/auth/me');
        return response.data;
    },

    /**
     * Send forgot password email.
     */
    forgotPassword: async (email) => {
        const response = await axios.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with token from email.
     */
    resetPassword: async (data) => {
        const response = await axios.post('/auth/reset-password', data);
        return response.data;
    },
};

export default authService;
