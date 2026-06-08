import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'sonner';
import { clearAuth, setRolesAndPermissions } from '@/store/slices/authSlice';
import authService from '@/services/authService';
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
const ApprovalFlowConfig = React.lazy(() => import('@/pages/approval-flows/ApprovalFlowConfig'));

// Institutions
const InstitutionList = React.lazy(() => import('@/pages/institutions/InstitutionList'));

// Divisions
const DivisionList    = React.lazy(() => import('@/pages/divisions/DivisionList'));

// Guest Book
const GuestBookList   = React.lazy(() => import('@/pages/guest-book/GuestBookList'));
const GuestBookReport = React.lazy(() => import('@/pages/guest-book/GuestBookReport'));

// SPPD
const SppdList = React.lazy(() => import('@/pages/sppd/SppdList'));
const SppdCreate = React.lazy(() => import('@/pages/sppd/SppdCreate'));
const SppdShow = React.lazy(() => import('@/pages/sppd/SppdShow'));

// Ijazah Revisions
const IjazahList = React.lazy(() => import('@/pages/ijazah/IjazahList'));
const IjazahCreate = React.lazy(() => import('@/pages/ijazah/IjazahCreate'));
const IjazahShow = React.lazy(() => import('@/pages/ijazah/IjazahShow'));
const IjazahTrack = React.lazy(() => import('@/pages/public/IjazahTrack'));

// Treasurer Changes
const TreasurerList = React.lazy(() => import('@/pages/treasurer/TreasurerList'));
const TreasurerCreate = React.lazy(() => import('@/pages/treasurer/TreasurerCreate'));
const TreasurerShow = React.lazy(() => import('@/pages/treasurer/TreasurerShow'));

// School Transfers
const SchoolTransferList = React.lazy(() => import('@/pages/school-transfers/SchoolTransferList'));
const SchoolTransferCreate = React.lazy(() => import('@/pages/school-transfers/SchoolTransferCreate'));
const SchoolTransferShow = React.lazy(() => import('@/pages/school-transfers/SchoolTransferShow'));

// Portal Berita CMS (Admin)
const ArticleList = React.lazy(() => import('@/pages/articles/ArticleList'));
const ArticleForm = React.lazy(() => import('@/pages/articles/ArticleForm'));
const ArticleShow = React.lazy(() => import('@/pages/articles/ArticleShow'));

// Public Portal Layout & Pages
const PublicLayout = React.lazy(() => import('@/layouts/PublicLayout'));
const LandingPage = React.lazy(() => import('@/pages/public/LandingPage'));
const NewsPage = React.lazy(() => import('@/pages/public/NewsPage'));
const NewsDetail = React.lazy(() => import('@/pages/public/NewsDetail'));
const DocumentVerify = React.lazy(() => import('@/pages/public/DocumentVerify'));

// Settings
const SignatureVault = React.lazy(() => import('@/pages/settings/SignatureVault'));
const SystemSettings = React.lazy(() => import('@/pages/settings/SystemSettings'));
const ProfilePage    = React.lazy(() => import('@/pages/profile/ProfilePage'));
const DocumentVerificationQueue = React.lazy(() => import('@/pages/verifikasi/DocumentVerificationQueue'));
const UserManual      = React.lazy(() => import('@/pages/manual/UserManual'));

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
    const { token } = useAuth();

    // Sync roles and permissions from backend if token exists
    useEffect(() => {
        if (token) {
            authService.me()
                .then(data => {
                    if (data.success) {
                        dispatch(setRolesAndPermissions({
                            roles: data.roles,
                            permissions: data.permissions
                        }));
                    }
                })
                .catch(err => {
                    console.error('Failed to sync profile on boot:', err);
                });
        }
    }, [token, dispatch]);

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
                    {/* Public Layout and Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/news/:slug" element={<NewsDetail />} />
                        <Route path="/track-ijazah" element={<IjazahTrack />} />
                        <Route path="/verify-document" element={<DocumentVerify />} />
                    </Route>

                    {/* Authentication Route */}
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

                        {/* Approval Flows */}
                        <Route path="/approval-flows" element={<ApprovalFlowConfig />} />

                        {/* Institutions */}
                        <Route path="/institutions" element={<InstitutionList />} />

                        {/* Divisions */}
                        <Route path="/divisions" element={<DivisionList />} />

                        {/* Guest Book */}
                        <Route path="/guest-book" element={<GuestBookList />} />
                        <Route path="/guest-book/report" element={<GuestBookReport />} />

                        {/* SPPD */}
                        <Route path="/sppd" element={<SppdList />} />
                        <Route path="/sppd/create" element={<SppdCreate />} />
                        <Route path="/sppd/:id" element={<SppdShow />} />

                        {/* Ijazah Revisions */}
                        <Route path="/ijazah" element={<IjazahList />} />
                        <Route path="/ijazah/create" element={<IjazahCreate />} />
                        <Route path="/ijazah/:id" element={<IjazahShow />} />

                        {/* Treasurer Changes */}
                        <Route path="/treasurer" element={<TreasurerList />} />
                        <Route path="/treasurer/create" element={<TreasurerCreate />} />
                        <Route path="/treasurer/:id" element={<TreasurerShow />} />

                        {/* School Transfers */}
                        <Route path="/school-transfers" element={<SchoolTransferList />} />
                        <Route path="/school-transfers/create" element={<SchoolTransferCreate />} />
                        <Route path="/school-transfers/:id" element={<SchoolTransferShow />} />

                        {/* Portal Berita (CMS Admin) */}
                        <Route path="/articles" element={<ArticleList />} />
                        <Route path="/articles/create" element={<ArticleForm />} />
                        <Route path="/articles/:id/edit" element={<ArticleForm />} />
                        <Route path="/articles/:id" element={<ArticleShow />} />

                        {/* Verifikasi Dokumen */}
                        <Route path="/verifikasi" element={<DocumentVerificationQueue />} />

                        {/* User Manual */}
                        <Route path="/user-manual" element={<UserManual />} />

                        {/* Settings */}
                        <Route path="/settings/signatures" element={<SignatureVault />} />
                        <Route path="/settings" element={<SystemSettings />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </React.Suspense>
        </>
    );
}
