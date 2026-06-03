import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import { clearAuth } from '@/store/slices/authSlice';
import useAuth from '@/hooks/useAuth';
import AppLayout from '@/layouts/AppLayout';

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────
const LoginPage       = React.lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage   = React.lazy(() => import('@/pages/dashboard/DashboardPage'));
const NotFoundPage    = React.lazy(() => import('@/pages/errors/NotFoundPage'));

// Users
const UserList        = React.lazy(() => import('@/pages/users/UserList'));
const UserForm        = React.lazy(() => import('@/pages/users/UserForm'));

// Roles
const RoleList        = React.lazy(() => import('@/pages/roles/RoleList'));
const RoleForm        = React.lazy(() => import('@/pages/roles/RoleForm'));

// Institutions
const InstitutionList = React.lazy(() => import('@/pages/institutions/InstitutionList'));

// Divisions
const DivisionList    = React.lazy(() => import('@/pages/divisions/DivisionList'));

// Guest Book
const GuestBookList   = React.lazy(() => import('@/pages/guest-book/GuestBookList'));
const GuestBookReport = React.lazy(() => import('@/pages/guest-book/GuestBookReport'));

// ── Route Guards ──────────────────────────────────────────────────────────────

/**
 * Protect routes — redirect to login if not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Redirect authenticated users away from login page.
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ── Main App Component ────────────────────────────────────────────────────────

export default function Main() {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();

    // Listen for global unauthorized events (JWT expired)
    useEffect(() => {
        const handleUnauthorized = () => {
            dispatch(clearAuth());
            navigate('/login', { replace: true });
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [dispatch, navigate]);

    return (
        <>
            {/* Global toast notification system */}
            <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
            />

            <React.Suspense
                fallback={
                    <div className="flex h-screen items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    </div>
                }
            >
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    {/* Protected application routes */}
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/dashboard" element={<DashboardPage />} />
                        
                        {/* Users */}
                        <Route path="/users" element={<UserList />} />
                        <Route path="/users/create" element={<UserForm />} />
                        <Route path="/users/:id/edit" element={<UserForm />} />

                        {/* Roles */}
                        <Route path="/roles" element={<RoleList />} />
                        <Route path="/roles/create" element={<RoleForm />} />
                        <Route path="/roles/:id/edit" element={<RoleForm />} />

                        {/* Institutions */}
                        <Route path="/institutions" element={<InstitutionList />} />

                        {/* Divisions */}
                        <Route path="/divisions" element={<DivisionList />} />

                        {/* Guest Book */}
                        <Route path="/guest-book" element={<GuestBookList />} />
                        <Route path="/guest-book/report" element={<GuestBookReport />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </React.Suspense>
        </>
    );
}
