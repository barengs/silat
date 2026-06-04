import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
    CheckSquare, 
    Search, 
    Filter, 
    ChevronRight, 
    Loader2, 
    Plane, 
    FileSignature, 
    Briefcase,
    Building2,
    Calendar,
    Inbox
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function DocumentVerificationQueue() {
    const navigate = useNavigate();
    const [moduleFilter, setModuleFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Fetch Verification Queue
    const { data: queueData, isLoading } = useQuery({
        queryKey: ['verification-queue', { module: moduleFilter, search, page }],
        queryFn: async () => {
            const res = await axios.get('/verifikasi/antrean', {
                params: {
                    module: moduleFilter,
                    q: search,
                    page
                }
            });
            return res.data;
        },
        keepPreviousData: true
    });

    const handleRowClick = (item) => {
        if (item.module === 'sppd') {
            navigate(`/sppd/${item.id}`);
        } else if (item.module === 'ijazah') {
            navigate(`/ijazah/${item.id}`);
        } else if (item.module === 'bendahara') {
            navigate(`/treasurer/${item.id}`);
        }
    };

    const getModuleIcon = (module) => {
        switch (module) {
            case 'sppd':
                return (
                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Plane size={16} />
                    </div>
                );
            case 'ijazah':
                return (
                    <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <FileSignature size={16} />
                    </div>
                );
            case 'bendahara':
                return (
                    <div className="w-8 h-8 rounded bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Briefcase size={16} />
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                        <CheckSquare size={16} />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="text-teal-600" size={24} />
                    Verifikasi Dokumen
                </h1>
                <p className="text-slate-500 text-sm mt-1">Daftar berkas pengajuan masuk yang membutuhkan verifikasi dan persetujuan Anda.</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Tabs Filter */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    <button
                        onClick={() => { setModuleFilter('all'); setPage(1); }}
                        className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                            moduleFilter === 'all' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Semua Modul
                    </button>
                    <button
                        onClick={() => { setModuleFilter('sppd'); setPage(1); }}
                        className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                            moduleFilter === 'sppd' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Manajemen SPPD
                    </button>
                    <button
                        onClick={() => { setModuleFilter('ijazah'); setPage(1); }}
                        className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                            moduleFilter === 'ijazah' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Revisi Ijazah
                    </button>
                    <button
                        onClick={() => { setModuleFilter('bendahara'); setPage(1); }}
                        className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                            moduleFilter === 'bendahara' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Perubahan Bendahara
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 border-b border-slate-100">
                    <div className="relative w-full sm:w-96">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari No. Dokumen, Tiket, Nama Pemohon..." 
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button className="inline-flex items-center px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded text-sm hover:bg-slate-50 transition-colors shadow-sm">
                            <Filter size={16} className="mr-2" />
                            Filter Lanjutan
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                <th className="px-6 py-3.5">Dokumen / Tiket</th>
                                <th className="px-6 py-3.5">Jenis Layanan</th>
                                <th className="px-6 py-3.5">Pemohon & Instansi</th>
                                <th className="px-6 py-3.5">Tanggal</th>
                                <th className="px-6 py-3.5">Status Alur</th>
                                <th className="px-6 py-3.5 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                                            <div className="h-3 bg-slate-100 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 rounded w-28"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-36 mb-1"></div>
                                            <div className="h-3 bg-slate-100 rounded w-48"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 rounded w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 bg-slate-100 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="h-4 bg-slate-200 rounded w-4 ml-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : queueData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                        <Inbox size={36} className="mx-auto mb-3 text-slate-300" />
                                        Tidak ada berkas pengajuan menunggu verifikasi saat ini.
                                    </td>
                                </tr>
                            ) : (
                                queueData?.data?.map((item) => (
                                    <tr 
                                        key={`${item.module}-${item.id}`} 
                                        className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                                        onClick={() => handleRowClick(item)}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
                                                {item.reference}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getModuleIcon(item.module)}
                                                <span className="text-slate-600 text-sm font-medium">{item.module_label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-800">{item.title.split(' - ')[1] || item.title}</div>
                                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                <Building2 size={12} />
                                                {item.institution}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-600 text-sm flex items-center gap-1.5">
                                                <Calendar size={13} className="text-slate-400" />
                                                {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 capitalize">
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-all" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {queueData?.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">
                            Menampilkan {queueData.from} - {queueData.to} dari {queueData.total} data
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white transition-colors bg-white font-medium text-slate-700 shadow-sm"
                            >
                                Prev
                            </button>
                            <button
                                disabled={page === queueData.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white transition-colors bg-white font-medium text-slate-700 shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
