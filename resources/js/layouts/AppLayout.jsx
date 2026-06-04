import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '@/store/slices/authSlice';
import authService from '@/services/authService';
import {
    LayoutDashboard,
    BookOpen,
    Plane,
    FileSignature,
    CheckSquare,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
    HelpCircle,
    Users,
    ShieldAlert,
    Building2,
    Network,
    Plus,
    Check,
    Newspaper,
    GitBranch,
    PenTool
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user, roles, permissions } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Fetch Notifications
    const { data: notifData } = useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: async () => {
            const res = await axios.get('/notifications/unread');
            return res.data;
        },
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.post(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications', 'unread']);
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            return await axios.post(`/notifications/read-all`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications', 'unread']);
            setShowNotifications(false);
        }
    });

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(clearAuth());
            navigate('/login');
            toast.success('Berhasil keluar dari sistem');
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout on frontend anyway
            dispatch(clearAuth());
            navigate('/login');
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // Always visible
        { path: '/guest-book', label: 'Buku Tamu', icon: BookOpen, permission: 'guest-book.view' },
        { path: '/sppd', label: 'Manajemen SPPD', icon: Plane, permission: 'sppd.view' },
        { path: '/ijazah', label: 'Revisi Ijazah', icon: FileSignature, permission: 'ijazah.view' },
        { path: '/treasurer', label: 'Perubahan Bendahara', icon: FileSignature, permission: 'treasurer.view' },
        { path: '/articles', label: 'Portal Berita', icon: Newspaper, permission: 'articles.view' },
        { path: '/verifikasi', label: 'Verifikasi Dokumen', icon: CheckSquare, permission: 'verifikasi.view' },
        { path: '/users', label: 'Pengguna', icon: Users, permission: 'users.view' },
        { path: '/roles', label: 'Roles & Akses', icon: ShieldAlert, permission: 'roles.view' },
        { path: '/approval-flows', label: 'Alur Persetujuan', icon: GitBranch, permission: 'approval-flows.view' },
        { path: '/institutions', label: 'Instansi / Sekolah', icon: Building2, permission: 'institutions.view' },
        { path: '/divisions', label: 'Divisi / Bidang', icon: Network, permission: 'divisions.view' },
        { path: '/settings/signatures', label: 'Tanda Tangan Pejabat', icon: PenTool, permission: 'settings.manage' },
        { path: '/settings', label: 'Pengaturan', icon: Settings, permission: 'settings.view' },
    ];

    // Check if user has permission (super-admin bypasses all)
    const hasPermission = (permissionRequired) => {
        if (!permissionRequired) return true; // No specific permission needed
        if (roles?.includes('super-admin')) return true; // Super admin sees all
        return permissions?.some(p => p === permissionRequired || p.startsWith(permissionRequired + '-'));
    };

    // Filter items based on permissions
    const filteredNavItems = navItems.filter(item => hasPermission(item.permission));

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-64'} bg-[#166534] text-slate-300 transform transition-all duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className={`h-16 flex items-center mt-4 mb-4 ${isCollapsed ? 'justify-center px-0' : 'px-6 justify-between'}`}>
                    <div className="flex items-center space-x-3">
                        <img src="/images/logo-pamekasan.png" alt="Logo" className={`${isCollapsed ? 'w-10 h-10' : 'w-14 h-14'} object-contain shrink-0 transition-all duration-300`} onError={(e) => e.target.src='https://upload.wikimedia.org/wikipedia/commons/e/e0/Lambang_Kabupaten_Pamekasan.png'} />
                        {!isCollapsed && (
                            <div className="animate-in fade-in duration-300">
                                <h1 className="text-white font-bold text-sm leading-tight truncate">Disdik Pamekasan</h1>
                                <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider font-semibold">Sistem Tata Kelola</p>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* User Profile Info */}
                <div className={`mb-6 ${isCollapsed ? 'px-3' : 'px-4'}`}>
                    <div 
                        className={`bg-[#14532d] border border-emerald-800 text-white rounded-lg flex items-center ${isCollapsed ? 'justify-center w-full py-3' : 'py-2 px-3 gap-3'}`}
                        title={isCollapsed ? user?.name : undefined}
                    >
                        <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate capitalize">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-emerald-200/70 truncate uppercase tracking-wider mt-0.5">
                                    {roles?.[0]?.replace('-', ' ') || 'Staff'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'} rounded-md text-sm font-medium transition-colors relative group ${
                                    isActive
                                        ? 'bg-[#14532d] text-white shadow-sm'
                                        : 'text-emerald-100/70 hover:bg-[#14532d]/50 hover:text-white'
                                }`}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon size={18} className={`${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-teal-500' : ''}`} />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-[#14532d]">
                    <button 
                        onClick={handleLogout}
                        title={isCollapsed ? "Keluar" : undefined}
                        className={`flex items-center w-full ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'} text-sm font-medium text-emerald-100/70 rounded-md hover:bg-[#14532d]/50 hover:text-white transition-colors group`}
                    >
                        <LogOut size={18} className={isCollapsed ? '' : 'mr-3'} />
                        {!isCollapsed && <span>Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0">
                    <div className="flex items-center flex-1">
                        {/* Mobile Menu Toggle */}
                        <button 
                            className="lg:hidden text-slate-500 hover:text-slate-700 mr-4"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        {/* Desktop Sidebar Toggle */}
                        <button 
                            className="hidden lg:flex text-slate-500 hover:text-slate-700 mr-4 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            <Menu size={20} />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="hidden sm:flex items-center max-w-md w-full relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari layanan, dokumen..." 
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Right utilities */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button 
                                className="text-slate-500 hover:text-slate-700 relative p-1"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {notifData?.count > 0 && (
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                )}
                            </button>
                            
                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg border border-slate-200 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                        <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
                                        {notifData?.count > 0 && (
                                            <button 
                                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                                onClick={() => markAllAsReadMutation.mutate()}
                                            >
                                                Tandai semua dibaca
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifData?.data?.length > 0 ? (
                                            notifData.data.map(notif => (
                                                <div key={notif.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer" onClick={() => markAsReadMutation.mutate(notif.id)}>
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <BookOpen size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 mb-0.5">{notif.data.title || 'Notifikasi'}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-2">{notif.data.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.created_at).toLocaleString('id-ID')}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                                Tidak ada notifikasi baru.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="text-slate-500 hover:text-slate-700 hidden sm:block">
                            <HelpCircle size={20} />
                        </button>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                        <Link to="/profile" className="flex items-center hover:opacity-80 transition-opacity">
                            <img 
                                src={user?.photo_path ? (user.photo_path.startsWith('http') ? user.photo_path : `/storage/${user.photo_path}`) : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=166534&color=fff`} 
                                alt="Profile" 
                                className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                            />
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
