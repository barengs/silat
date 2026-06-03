import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
    Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, roles, permissions } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

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
        { path: '/verifikasi', label: 'Verifikasi Dokumen', icon: CheckSquare, permission: 'verifikasi.view' },
        { path: '/users', label: 'Pengguna', icon: Users, permission: 'users.view' },
        { path: '/roles', label: 'Roles & Akses', icon: ShieldAlert, permission: 'roles.view' },
        { path: '/institutions', label: 'Instansi / Sekolah', icon: Building2, permission: 'institutions.view' },
        { path: '/divisions', label: 'Divisi / Bidang', icon: Network, permission: 'divisions.view' },
        { path: '/settings', label: 'Pengaturan', icon: Settings, permission: 'settings.view' },
    ];

    // Check if user has permission (super-admin bypasses all)
    const hasPermission = (permissionRequired) => {
        if (!permissionRequired) return true; // No specific permission needed
        if (roles?.includes('super-admin')) return true; // Super admin sees all
        return permissions?.includes(permissionRequired);
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

                {/* Create New Button */}
                <div className={`mb-6 ${isCollapsed ? 'px-3' : 'px-4'}`}>
                    <button 
                        className={`bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center ${isCollapsed ? 'w-full py-3' : 'w-full py-2.5 px-4'}`}
                        title="Buat Laporan Baru"
                    >
                        {isCollapsed ? <Plus size={20} /> : 'Buat Laporan Baru'}
                    </button>
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
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Right utilities */}
                    <div className="flex items-center space-x-4">
                        <button className="text-slate-500 hover:text-slate-700 relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>
                        <button className="text-slate-500 hover:text-slate-700 hidden sm:block">
                            <HelpCircle size={20} />
                        </button>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                        <button className="flex items-center">
                            <img 
                                src={user?.photo_path || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=166534&color=fff`} 
                                alt="Profile" 
                                className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                            />
                        </button>
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
