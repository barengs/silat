import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    lockSession, 
    unlockSession, 
    clearAuth, 
    setCredentials 
} from '@/store/slices/authSlice';
import authService from '@/services/authService';
import { Lock, Unlock, Eye, EyeOff, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LockScreenManager() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLocked, token } = useSelector((state) => state.auth);

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const lastActivityRef = useRef(Date.now());
    const lastRefreshRef = useRef(Date.now());
    const passwordInputRef = useRef(null);

    // Timeout limits
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const LOGOUT_TIMEOUT = 58 * 60 * 1000; // 58 minutes (approaching 60 minutes)
    const REFRESH_TIMEOUT = 45 * 60 * 1000; // 45 minutes of active time
    const CHECK_INTERVAL = 10000; // Check every 10 seconds

    // Reset idle timer on user activity
    const handleUserActivity = () => {
        if (!isLocked) {
            lastActivityRef.current = Date.now();
        }
    };

    // Auto-focus password input when locked
    useEffect(() => {
        if (isLocked && passwordInputRef.current) {
            passwordInputRef.current.focus();
        }
    }, [isLocked]);

    // Handle Logout / Sign out as other user
    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            dispatch(clearAuth());
            navigate('/login');
            toast.info('Sesi Anda berakhir.');
        }
    };

    useEffect(() => {
        if (!token) return;

        // Event listeners for activity tracking
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, handleUserActivity));

        // Periodic timer to check inactivity and background refresh
        const intervalId = setInterval(async () => {
            const now = Date.now();
            const idleTime = now - lastActivityRef.current;

            // 1. Check Inactivity / Auto Logout
            if (idleTime >= LOGOUT_TIMEOUT) {
                handleLogout();
                toast.error('Sesi Anda telah berakhir karena tidak ada aktivitas selama 60 menit.');
                return;
            }

            if (!isLocked && idleTime >= INACTIVITY_TIMEOUT) {
                dispatch(lockSession());
                toast.warning('Sesi Anda dikunci karena tidak ada aktivitas selama 30 menit.');
            }

            // 2. Background Token Refresh (Only when active and not locked)
            if (!isLocked) {
                const timeSinceRefresh = now - lastRefreshRef.current;
                if (timeSinceRefresh >= REFRESH_TIMEOUT) {
                    try {
                        const data = await authService.refresh();
                        if (data.token) {
                            dispatch(setCredentials({
                                token: data.token,
                                user: user, // Keep current user
                            }));
                            lastRefreshRef.current = Date.now();
                            console.log('JWT Token successfully refreshed in background.');
                        }
                    } catch (err) {
                        console.error('Failed to refresh token in background:', err);
                        // If refresh fails due to expiration, trigger lock screen
                        dispatch(lockSession());
                    }
                }
            }
        }, CHECK_INTERVAL);

        // Listen for global auth:lock event (e.g. from axios 401 interceptor)
        const handleGlobalLock = () => {
            if (!isLocked) {
                dispatch(lockSession());
                toast.warning('Sesi Anda kedaluwarsa. Masukkan kata sandi untuk melanjutkan.');
            }
        };
        window.addEventListener('auth:lock', handleGlobalLock);

        return () => {
            events.forEach(event => window.removeEventListener(event, handleUserActivity));
            clearInterval(intervalId);
            window.removeEventListener('auth:lock', handleGlobalLock);
        };
    }, [token, isLocked, dispatch, user]);

    // Handle Unlock submit
    const handleUnlock = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Kata sandi harus diisi.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Authenticate user with current email or nip and password
            const data = await authService.login({
                username: user?.email || user?.nip,
                password: password,
            });

            if (data.success && data.token) {
                dispatch(setCredentials({
                    token: data.token,
                    user: data.user,
                    roles: data.roles,
                    permissions: data.permissions
                }));
                dispatch(unlockSession());
                setPassword('');
                toast.success('Layar berhasil dibuka kunci.');
                lastActivityRef.current = Date.now();
                lastRefreshRef.current = Date.now();
            } else {
                setError(data.message || 'Gagal membuka kunci.');
            }
        } catch (err) {
            console.error('Unlock error:', err);
            setError(err.response?.data?.message || 'Kata sandi salah atau tidak valid.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLocked) return null;

    // Default avatar fallback
    const avatarUrl = user?.photo_path || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=166534&color=fff`;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md p-8 bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-center text-white m-4 animate-in zoom-in-95 duration-300">
                
                {/* Lock icon badge */}
                <div className="mx-auto w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <Lock size={22} className="animate-pulse" />
                </div>

                <h2 className="text-xl font-bold mb-1">Layar Terkunci</h2>
                <p className="text-sm text-slate-300 mb-6">Sesi Anda sedang diamankan. Masukkan kata sandi.</p>

                {/* Profile Section */}
                <div className="flex flex-col items-center mb-6">
                    <img 
                        src={avatarUrl} 
                        alt="Profile avatar" 
                        className="w-20 h-20 rounded-full border-2 border-emerald-500 object-cover shadow-lg mb-3"
                    />
                    <h3 className="text-lg font-semibold truncate max-w-xs">{user?.name || 'User'}</h3>
                    <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mt-1">
                        {user?.nip ? `NIP. ${user.nip}` : 'Staff'}
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="relative">
                        <input
                            ref={passwordInputRef}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Kata sandi akun Anda"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10 text-center"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400 font-medium animate-in shake duration-300">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md hover:shadow-emerald-500/20 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Memverifikasi...</span>
                            </>
                        ) : (
                            <>
                                <Unlock size={18} />
                                <span>Buka Kunci</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Switch Account / Sign Out */}
                <div className="mt-8 pt-4 border-t border-white/10 flex justify-center">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <LogOut size={16} />
                        <span>Masuk sebagai akun lain</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
