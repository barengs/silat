import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { LogIn, LayoutDashboard, Phone, Mail, MapPin, Globe } from 'lucide-react';

const PublicLayout = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            {/* Top Bar Info (Optional styling but adds premium feel) */}
            <div className="bg-blue-900 text-white text-xs py-2 px-4 sm:px-8 flex flex-wrap justify-between items-center gap-2 border-b border-blue-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Phone size={12} />
                        (0324) 321234
                    </span>
                    <span className="flex items-center gap-1">
                        <Mail size={12} />
                        cabdin.pamekasan@jatimprov.go.id
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <a href="https://pamekasankab.go.id" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        <Globe size={12} />
                        PamekasanKab
                    </a>
                </div>
            </div>

            {/* Main Header / Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
                    {/* Brand Logo & Name */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/images/logo-pamekasan.png"
                            alt="Logo Kabupaten Pamekasan"
                            className="h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-base leading-tight tracking-wide group-hover:text-blue-900 transition-colors">
                                CABANG DINAS PENDIDIKAN
                            </span>
                            <span className="text-xs text-slate-500 font-medium leading-normal">
                                Wilayah Kabupaten Pamekasan
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className={`font-semibold text-sm transition-colors relative py-2 ${
                                isActive('/')
                                    ? 'text-blue-600'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Beranda
                            {isActive('/') && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
                            )}
                        </Link>
                        <Link
                            to="/news"
                            className={`font-semibold text-sm transition-colors relative py-2 ${
                                isActive('/news')
                                    ? 'text-blue-600'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Portal Berita
                            {isActive('/news') && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
                            )}
                        </Link>
                        <Link
                            to="/track-ijazah"
                            className={`font-semibold text-sm transition-colors relative py-2 ${
                                isActive('/track-ijazah')
                                    ? 'text-blue-600'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Lacak Ijazah
                            {isActive('/track-ijazah') && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
                            )}
                        </Link>
                    </nav>

                    {/* Portal Actions */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all"
                            >
                                <LayoutDashboard size={16} />
                                Ke Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:text-slate-900 shadow-sm active:scale-[0.98] transition-all"
                            >
                                <LogIn size={16} />
                                Login Portal
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Column 1: Info Dinas */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo-pamekasan.png"
                                    alt="Logo Kabupaten Pamekasan"
                                    className="h-10 w-auto brightness-90"
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-sm tracking-wider">
                                        CABANG DINAS PENDIDIKAN
                                    </span>
                                    <span className="text-xs text-slate-500 font-semibold">
                                        Wilayah Kabupaten Pamekasan
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mt-2">
                                Menyediakan pelayanan terpadu bagi satuan pendidikan menengah SMA, SMK, dan SLB di wilayah Kabupaten Pamekasan dengan transparansi, akuntabilitas, dan efisiensi.
                            </p>
                        </div>

                        {/* Column 2: Kontak & Alamat */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-semibold text-sm tracking-wide">
                                Hubungi Kami
                            </h3>
                            <ul className="flex flex-col gap-3 text-xs">
                                <li className="flex items-start gap-2">
                                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span>Jl. Jokotole No. 117, Pamekasan, Jawa Timur 69321</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone size={16} className="text-blue-500 shrink-0" />
                                    <span>(0324) 321234</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail size={16} className="text-blue-500 shrink-0" />
                                    <span>cabdin.pamekasan@jatimprov.go.id</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Tautan Terkait */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white font-semibold text-sm tracking-wide">
                                Layanan Terkait
                            </h3>
                            <ul className="flex flex-col gap-2 text-xs">
                                <li>
                                    <a
                                        href="https://dindik.jatimprov.go.id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        Dinas Pendidikan Provinsi Jawa Timur
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://pamekasankab.go.id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        Pemerintah Kabupaten Pamekasan
                                    </a>
                                </li>
                                <li>
                                    <Link to="/track-ijazah" className="hover:text-white transition-colors">
                                        Virtual Loket Lacak Ijazah
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                        <p>&copy; {new Date().getFullYear()} Cabang Dinas Pendidikan Wilayah Pamekasan. Hak Cipta Dilindungi.</p>
                        <p className="text-slate-500">SIMTAG Disdik Pamekasan v1.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
