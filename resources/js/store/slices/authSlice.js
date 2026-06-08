import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth slice — manages JWT token, user data, roles, and permissions.
 * Token is also persisted in localStorage for page refresh persistence.
 */

const storedToken = localStorage.getItem('auth_token');
const storedUser  = localStorage.getItem('auth_user');
const storedLocked = localStorage.getItem('auth_locked') === 'true';
const storedRoles = localStorage.getItem('auth_roles');
const storedPermissions = localStorage.getItem('auth_permissions');

const initialState = {
    token:       storedToken || null,
    user:        storedUser ? JSON.parse(storedUser) : null,
    isLocked:    storedLocked,
    roles:       storedRoles ? JSON.parse(storedRoles) : [],
    permissions: storedPermissions ? JSON.parse(storedPermissions) : [],
    isLoading:   false,
    error:       null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { token, user, roles, permissions } = action.payload;
            state.token       = token;
            state.user        = user;
            state.roles       = roles || [];
            state.permissions = permissions || [];
            state.error       = null;

            // Persist to localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_roles', JSON.stringify(roles || []));
            localStorage.setItem('auth_permissions', JSON.stringify(permissions || []));
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('auth_user', JSON.stringify(state.user));
        },
        setRolesAndPermissions: (state, action) => {
            state.roles       = action.payload.roles || [];
            state.permissions = action.payload.permissions || [];
            localStorage.setItem('auth_roles', JSON.stringify(action.payload.roles || []));
            localStorage.setItem('auth_permissions', JSON.stringify(action.payload.permissions || []));
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error     = action.payload;
            state.isLoading = false;
        },
        lockSession: (state) => {
            state.isLocked = true;
            localStorage.setItem('auth_locked', 'true');
        },
        unlockSession: (state) => {
            state.isLocked = false;
            localStorage.removeItem('auth_locked');
        },
        clearAuth: (state) => {
            state.token       = null;
            state.user        = null;
            state.isLocked    = false;
            state.roles       = [];
            state.permissions = [];
            state.error       = null;
            state.isLoading   = false;

            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_locked');
            localStorage.removeItem('auth_roles');
            localStorage.removeItem('auth_permissions');
        },
    },
});

export const {
    setCredentials,
    updateUser,
    setRolesAndPermissions,
    setLoading,
    setError,
    lockSession,
    unlockSession,
    clearAuth,
} = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCurrentUser    = (state) => state.auth.user;
export const selectToken          = (state) => state.auth.token;
export const selectIsAuthenticated= (state) => !!state.auth.token && !!state.auth.user;
export const selectIsLocked       = (state) => state.auth.isLocked;
export const selectRoles          = (state) => state.auth.roles;
export const selectPermissions    = (state) => state.auth.permissions;
export const selectAuthLoading    = (state) => state.auth.isLoading;
export const selectAuthError      = (state) => state.auth.error;

export default authSlice.reducer;
