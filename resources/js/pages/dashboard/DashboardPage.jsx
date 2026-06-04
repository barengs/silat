import React from 'react';
import { 
    Users, 
    ClipboardList, 
    GraduationCap, 
    Plane,
    FileSignature,
    Megaphone,
    Loader2,
    Calendar,
    ChevronRight,
    Building2,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
    const navigate = useNavigate();

    // Fetch Dashboard Data
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const res = await axios.get('/dashboard');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    const stats = dashboardData?.stats || [];
    const antrianPending = dashboardData?.antrian_pending || [];
    const tamuBulanan = dashboardData?.tamu_bulanan || [];
    const aktivitasTerbaru = dashboardData?.aktivitas_terbaru || [];
    const newsFeed = dashboardData?.news_feed || [];
    const userRole = dashboardData?.user?.role || 'Staff';
    const isSekolah = dashboardData?.user?.is_sekolah;

    // Map string icon names to Lucide components
    const iconMap = {
        'Users': Users,
        'ClipboardList': ClipboardList,
        'GraduationCap': GraduationCap,
        'Plane': Plane,
        'FileSignature': FileSignature
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Selamat Datang, {dashboardData?.user?.name || 'User'}!</h1>
                    <p className="text-slate-500 text-sm mt-1">Anda login sebagai <span className="font-semibold text-teal-700 capitalize">{userRole.replace('-', ' ')}</span>. Berikut ringkasan tata kelola hari ini.</p>
                </div>
                <div className="flex gap-2">
                    {isSekolah ? (
                        <Link to="/sppd/create" className="px-4 py-2 bg-teal-600 text-white rounded font-semibold text-sm hover:bg-teal-700 transition-colors shadow-sm">
                            Buat Pengajuan SPPD
                        </Link>
                    ) : (
                        <Link to="/guest-book" className="px-4 py-2 bg-teal-600 text-white rounded font-semibold text-sm hover:bg-teal-700 transition-colors shadow-sm">
                            Buka Buku Tamu
                        </Link>
                    )}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const StatIcon = iconMap[stat.icon] || ClipboardList;
                    return (
                        <div key={idx} className="bg-white rounded border border-slate-200 p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded ${stat.iconBg}`}>
                                    <StatIcon size={20} className={stat.iconColor} />
                                </div>
                                {stat.badge && (
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stat.badge.color}`}>
                                        {stat.badge.text}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-4xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left side (2 columns) */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* Antrian Pending Action (Menunggu Approval) */}
                    {antrianPending.length > 0 && (
                        <div className="bg-white rounded border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
                                <AlertCircle className="text-rose-600 shrink-0" size={20} />
                                <h2 className="text-lg font-bold text-slate-900">Perlu Tindakan Anda</h2>
                                <span className="ml-auto bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">{antrianPending.length} Dokumen</span>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                                {antrianPending.map((item) => (
                                    <div 
                                        key={`${item.module}-${item.id}`}
                                        onClick={() => navigate(item.module === 'bendahara' ? `/treasurer/${item.id}` : `/${item.module}/${item.id}`)}
                                        className="py-3 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer rounded px-2 transition-colors group"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{item.title}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Building2 size={12} /> {item.institution}
                                                <span className="mx-1.5">•</span>
                                                {item.detail}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded capitalize">
                                                {item.status}
                                            </span>
                                            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tamu Bulanan Chart (Only for Dinas/Resepsionis/Admin) */}
                    {!isSekolah && tamuBulanan.length > 0 && (
                        <div className="bg-white rounded border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Tren Kunjungan Tamu</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={tamuBulanan} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTamu" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px' }} />
                                        <Area type="monotone" dataKey="tamu" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorTamu)" name="Jumlah Tamu" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Aktivitas Terbaru */}
                    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900">Aktivitas Pengajuan Terbaru</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Pengajuan / Pemohon</th>
                                        <th className="px-6 py-4 font-semibold">Jenis Layanan</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Tanggal Pengajuan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {aktivitasTerbaru.length > 0 ? (
                                        aktivitasTerbaru.map((act, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-800">{act.title}</td>
                                                <td className="px-6 py-4 text-slate-500">{act.type}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${act.statusColor}`}>
                                                        {act.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">{act.time}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                                                Belum ada aktivitas pengajuan tercatat.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right side (1 column) */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/50">
                            <Megaphone className="text-teal-600" size={24} />
                            <h2 className="text-lg font-bold text-slate-900">Portal Pengumuman</h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[500px]">
                            {newsFeed.length > 0 ? (
                                newsFeed.map((news, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex items-center text-xs font-medium text-slate-500 mb-1.5">
                                            <span className="text-teal-600 font-semibold">{news.category}</span>
                                            <span className="mx-2">•</span>
                                            <span>{news.date}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-tight mb-2">
                                            <Link to={`/news`}>{news.title}</Link>
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {news.excerpt}
                                        </p>
                                        
                                        {idx !== newsFeed.length - 1 && (
                                            <hr className="mt-6 border-slate-100" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 py-12 italic text-sm">
                                    Tidak ada pengumuman terbaru.
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                            <Link to="/news" className="block w-full text-sm font-semibold text-slate-700 hover:text-teal-600 transition-colors py-2 text-center border border-slate-200 rounded bg-white hover:bg-slate-50">
                                Lihat Semua Berita & Pengumuman
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
