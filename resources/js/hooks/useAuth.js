import { useSelector } from 'react-redux';
import {
    selectCurrentUser,
    selectIsAuthenticated,
    selectRoles,
    selectPermissions,
    selectToken,
} from '@/store/slices/authSlice';

/**
 * Custom hook for accessing authentication state.
 * Provides user, roles, permissions, and helper methods.
 */
export const useAuth = () => {
    const user            = useSelector(selectCurrentUser);
    const token           = useSelector(selectToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const roles           = useSelector(selectRoles);
    const permissions     = useSelector(selectPermissions);

    return {
        user,
        token,
        isAuthenticated,
        roles,
        permissions,

        // Role checkers
        isSuperAdmin: () => roles.includes('super-admin'),
        isResepsionis: () => roles.includes('resepsionis'),
        isVerifikator: () => roles.includes('verifikator'),
        isApprover: () => roles.includes('approver'),
        isHumas: () => roles.includes('humas'),
        isOperatorSekolah: () => roles.includes('operator-sekolah'),
        isKepalaSekolah: () => roles.includes('kepala-sekolah'),
        isAdminDinas: () => roles.includes('admin-dinas'),

        // Check if user has any of the given roles
        hasRole: (...checkRoles) => checkRoles.some((role) => roles.includes(role)),

        // Check if user has specific permission
        can: (permission) => {
            if (roles.includes('super-admin')) return true; // super admin bypasses all
            return permissions.includes(permission);
        },

        // Check if user has any of the given permissions
        canAny: (...perms) => {
            if (roles.includes('super-admin')) return true;
            return perms.some((p) => permissions.includes(p));
        },
    };
};

export default useAuth;
