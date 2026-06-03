import React from 'react';
import { 
    Users, 
    ClipboardList, 
    GraduationCap, 
    Car, 
    PlaneTakeoff, 
    UserCheck, 
    FileSignature,
    Megaphone
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function DashboardPage() {
    const { user } = useSelector(state => state.auth);

    // Mock data based on the UI design
    const stats = [
        {
            title: 'Tamu Hari Ini',
            value: '42',
            badge: { text: '+12%', color: 'text-emerald-700 bg-emerald-100' },
            icon: Users,
            iconBg: 'bg-slate-100',
            iconColor: 'text-slate-600'
        },
        {
            title: 'SPPD Menunggu',
            value: '15',
            badge: { text: 'Butuh Perhatian', color: 'text-rose-700 bg-rose-100' },
            icon: ClipboardList,
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600'
        },
        {
            title: 'Revisi Ijazah Baru',
            value: '8',
            badge: null,
            icon: GraduationCap,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600'
        },
        {
            title: 'Perjalanan Dinas Aktif',
            value: '24',
            badge: { text: 'Aktif', color: 'text-blue-700 bg-blue-100' },
            icon: Car,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        }
    ];

    const activities = [
        { title: 'SPPD - Budi Santoso', type: 'Manajemen SPPD', status: 'Disetujui', statusColor: 'bg-emerald-100 text-emerald-700', time: '10 mnt lalu' },
        { title: 'Revisi Ijazah - SMPN 1', type: 'Revisi Ijazah', status: 'Menunggu', statusColor: 'bg-rose-100 text-rose-700', time: '1 jam lalu' },
        { title: 'Tamu: Perwakilan Komite', type: 'Buku Tamu', status: 'Selesai', statusColor: 'bg-slate-100 text-slate-700', time: '2 jam lalu' }
    ];

    const newsFeed = [
        {
            category: 'Pengumuman Internal',
            date: 'Hari Ini',
            title: 'Pembaruan Sistem Verifikasi Dokumen Digital Tahap 2',
            excerpt: 'Seluruh staf diwajibkan mengikuti panduan baru terkait alur persetujuan...'
        },
        {
            category: 'Berita Daerah',
            date: 'Kemarin',
            title: 'Rapat Koordinasi Persiapan Tahun Ajaran Baru di...',
            excerpt: 'Kadisdik memimpin rapat evaluasi fasilitas sekolah dan distribusi tenaga...'
        },
        {
            category: 'SOP Baru',
            date: '3 Hari Lalu',
            title: 'Standar Pelayanan Penerimaan Tamu Dinas...',
            excerpt: 'Penerapan sistem QR code untuk buku tamu mulai diujicobakan di lobi utama.'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Ringkasan Hari Ini</h1>
                <p className="text-slate-500 text-sm mt-1">Tinjauan cepat aktivitas administrasi Dinas Pendidikan.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                                <stat.icon size={20} className={stat.iconColor} />
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
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column (Main Content) */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* Quick Actions / Layanan Terpadu */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Layanan Terpadu</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all group">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-4 text-teal-600 group-hover:scale-110 transition-transform">
                                    <PlaneTakeoff size={24} />
                                </div>
                                <span className="font-semibold text-slate-800">Buat SPPD</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all group">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                                    <UserCheck size={24} />
                                </div>
                                <span className="font-semibold text-slate-800">Catat Tamu</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all group">
                                <div className="bg-white p-3 rounded-full shadow-sm mb-4 text-orange-600 group-hover:scale-110 transition-transform">
                                    <FileSignature size={24} />
                                </div>
                                <span className="font-semibold text-slate-800">Revisi Ijazah</span>
                            </button>
                        </div>
                    </div>

                    {/* Aktivitas Terbaru */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Aktivitas Terbaru</h2>
                            <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700">Lihat Semua</a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Dokumen/Tamu</th>
                                        <th className="px-6 py-4 font-medium">Jenis Layanan</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activities.map((act, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{act.title}</td>
                                            <td className="px-6 py-4 text-slate-500">{act.type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${act.statusColor}`}>
                                                    {act.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 whitespace-nowrap">{act.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar Content) */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                            <Megaphone className="text-teal-600" size={24} />
                            <h2 className="text-lg font-bold text-slate-900">Informasi & Berita</h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {newsFeed.map((news, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex items-center text-xs font-medium text-slate-500 mb-1.5">
                                        <span className="text-teal-600">{news.category}</span>
                                        <span className="mx-2">•</span>
                                        <span>{news.date}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-tight mb-2">
                                        <a href="#">{news.title}</a>
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">
                                        {news.excerpt}
                                    </p>
                                    
                                    {idx !== newsFeed.length - 1 && (
                                        <hr className="mt-6 border-slate-100" />
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto rounded-b-xl">
                            <button className="w-full text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors py-2 text-center">
                                Lihat Papan Buletin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
