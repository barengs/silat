import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '@/bootstrap';
import {
    FileSignature,
    Plus,
    Search,
    ChevronRight,
    Filter,
    Folder,
    FileText,
    Printer,
    Download
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function TreasurerList() {
    const { roles } = useSelector(state => state.auth);
    const isSekolah = roles?.includes('sekolah');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['treasurer', { search, status: statusFilter, page }],
        queryFn: async () => {
            const res = await axios.get('/api/treasurer', {
                params: {
                    q: search,
                    status: statusFilter,
                    page
                }
            });
            return res.data;
        },
        keepPreviousData: true
    });

    const changes = responseData?.data || [];
    const totalCount = responseData?.total || 0;

    // Calculate count stats based on query or overall if all is loaded
    // Since paginated, we'll fetch stats dynamically or mock them if we don't have a separate stats endpoint.
    // Let's calculate from current page or show overall defaults if empty.
    const pendingCount = responseData?.data?.filter(i => i.status === 'verifikasi' || i.status === 'submitted').length || 0;
    const readyToPrintCount = responseData?.data?.filter(i => i.status === 'ready_to_print').length || 0;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">Draft</span>;
            case 'submitted':
                return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold">Submitted</span>;
            case 'verifikasi':
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Verifikasi</span>;
            case 'revisi':
                return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Revisi</span>;
            case 'approved':
                return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">Approved</span>;
            case 'ready_to_print':
                return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Ready to Print</span>;
            case 'completed':
                return <span className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold">Completed</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">Ditolak</span>;
            default:
                return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold capitalize">{status}</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Top Title & Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard Rekening</h1>
                    <p className="text-sm text-slate-500 mt-1">Ringkasan pengajuan perubahan bendahara dan rekening sekolah aktif.</p>
                </div>
                {isSekolah && (
                    <Link
                        to="/treasurer/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded transition-colors whitespace-nowrap shadow-sm"
                    >
                        <Plus size={16} className="mr-2" />
                        Buat Pengajuan Baru
                    </Link>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stat 1 */}
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengajuan</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalCount}</h3>
                        <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            +12 bulan ini
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Folder className="text-slate-400" size={24} />
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Verifikasi</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                            {isLoading ? '...' : pendingCount}
                        </h3>
                        <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            Butuh tinjauan
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center border border-blue-100">
                        <FileText className="text-blue-500" size={24} />
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Siap Cetak</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                            {isLoading ? '...' : readyToPrintCount}
                        </h3>
                        <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Aksi diperlukan
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Printer className="text-emerald-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                {/* Search & Filters */}
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-base">Pengajuan Terbaru</h3>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Cari Sekolah, Bendahara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white transition-colors"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-600"
                        >
                            <option value="all">Semua Status</option>
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="verifikasi">Verifikasi</option>
                            <option value="revisi">Revisi</option>
                            <option value="ready_to_print">Ready to Print</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase text-slate-500 tracking-wider">
                                <th className="px-6 py-3.5">Nama Sekolah</th>
                                <th className="px-6 py-3.5">Perubahan Bendahara</th>
                                <th className="px-6 py-3.5">Tanggal</th>
                                <th className="px-6 py-3.5">Status</th>
                                <th className="px-6 py-3.5 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : changes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                                        <FileSignature size={36} className="mx-auto mb-3 text-slate-300" />
                                        Belum ada pengajuan perubahan bendahara/rekening.
                                    </td>
                                </tr>
                            ) : (
                                changes.map((item) => (
                                    <tr 
                                        key={item.id} 
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/treasurer/${item.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800 text-sm">{item.institution?.name}</div>
                                            <div className="text-xs text-slate-500 mt-1">NPSN: {item.institution?.npsn_code || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.change_type === 'rekening' ? (
                                                <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                                                    Perubahan Rekening Saja
                                                </span>
                                            ) : (
                                                <div className="text-xs text-slate-700 flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-slate-400 line-through truncate max-w-[120px]">{item.old_treasurer_name}</span>
                                                    <span>→</span>
                                                    <span className="font-semibold text-slate-800">{item.new_treasurer_name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600">
                                            {item.submitted_at 
                                                ? new Date(item.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={18} className="text-slate-400" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {responseData?.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-xs text-slate-500 font-medium">
                            Menampilkan {responseData.from} - {responseData.to} dari {responseData.total} data
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 border border-slate-200 rounded text-xs font-semibold bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                            >
                                Prev
                            </button>
                            <button
                                disabled={page === responseData.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 border border-slate-200 rounded text-xs font-semibold bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
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
