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
    Bell
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function IjazahList() {
    const { user, roles } = useSelector(state => state.auth);
    const isSekolah = roles?.includes('sekolah');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const { data: ijazahs, isLoading } = useQuery({
        queryKey: ['ijazah', { search, status: statusFilter, page }],
        queryFn: async () => {
            const res = await axios.get('/api/ijazah-revisions', {
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">Draft</span>;
            case 'verifikasi':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Verifikasi</span>;
            case 'approved':
                return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">Menunggu Approval</span>;
            case 'ready_for_pickup':
                return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Siap Diambil</span>;
            case 'completed':
                return <span className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-medium">Selesai</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Ditolak</span>;
            default:
                return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium capitalize">{status}</span>;
        }
    };

    const readyForPickupCount = ijazahs?.data?.filter(i => i.status === 'ready_for_pickup').length || 0;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    Revisi Ijazah – Loket Virtual
                </h1>
            </div>

            {/* Banner */}
            <div className="bg-white border border-slate-200 rounded p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-1">Pantau Status Pengajuan</h2>
                    <p className="text-sm text-slate-500">
                        Lacak proses revisi ijazah, perbaikan data, atau penggantian ijazah hilang/rusak.
                    </p>
                </div>
                {isSekolah && (
                    <Link
                        to="/ijazah/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-medium rounded transition-colors whitespace-nowrap"
                    >
                        <FileSignature size={16} className="mr-2" />
                        Form Pengajuan Baru
                    </Link>
                )}
            </div>

            {/* Daftar Antrean */}
            <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Antrean</h3>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Cari No. Tiket, Nama Siswa..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <button className="inline-flex items-center px-3 py-2 border border-slate-200 bg-white text-slate-600 rounded text-sm hover:bg-slate-50 transition-colors">
                            <Filter size={16} className="mr-2" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                <th className="px-6 py-3">No. Tiket</th>
                                <th className="px-6 py-3">Nama Siswa</th>
                                <th className="px-6 py-3">Asal Sekolah</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((n) => (
                                    <tr key={n} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                            <div className="h-3 bg-slate-100 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-slate-100 rounded w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-40"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 bg-slate-100 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="h-4 bg-slate-200 rounded w-4 ml-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : ijazahs?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm">
                                        <FileSignature size={32} className="mx-auto mb-3 text-slate-300" />
                                        Belum ada pengajuan revisi ijazah.
                                    </td>
                                </tr>
                            ) : (
                                ijazahs?.data?.map((ijazah) => (
                                    <tr 
                                        key={ijazah.id} 
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/ijazah/${ijazah.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{ijazah.ticket_number}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{new Date(ijazah.created_at).toLocaleDateString('id-ID')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700 font-medium">{ijazah.student_name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">NISN: {ijazah.nisn}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700">{ijazah.institution?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(ijazah.status)}
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
                {ijazahs?.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">
                            Menampilkan {ijazahs.from} - {ijazahs.to} dari {ijazahs.total} data
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white"
                            >
                                Prev
                            </button>
                            <button
                                disabled={page === ijazahs.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-white"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifikasi Pengambilan */}
            {readyForPickupCount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Bell size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-emerald-800">Notifikasi Pengambilan</h3>
                        <p className="text-sm text-emerald-600 mt-0.5">
                            Terdapat {readyForPickupCount} dokumen revisi ijazah yang telah selesai dan siap diambil di Loket Pelayanan 1.
                        </p>
                    </div>
                    <button 
                        onClick={() => setStatusFilter('ready_for_pickup')}
                        className="px-4 py-2 bg-white border border-emerald-300 text-emerald-700 text-sm font-medium rounded hover:bg-emerald-50 transition-colors whitespace-nowrap"
                    >
                        Lihat Daftar
                    </button>
                </div>
            )}
        </div>
    );
}
