import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { GitBranch, Plus, Search, ChevronRight, Filter, Folder, FileText, Printer, Download } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function SchoolTransferList() {
    const { roles, permissions } = useSelector(state => state.auth);
    const canCreate = permissions?.includes('school-transfers.create') || roles?.includes('super-admin');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['school-transfers', { search, status: statusFilter, page }],
        queryFn: async () => {
            const res = await axios.get('/school-transfers', {
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

    const transfers = responseData?.data || [];
    const totalCount = responseData?.total || 0;

    // Calculate quick stats from current page context
    const pendingCount = responseData?.data?.filter(i => i.status === 'submitted' || i.status === 'verifikasi').length || 0;
    const approvedCount = responseData?.data?.filter(i => i.status === 'approved').length || 0;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">Draft</span>;
            case 'submitted':
                return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold">Submitted</span>;
            case 'verifikasi':
                return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Verifikasi</span>;
            case 'approved':
                return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Disetujui (TTE)</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded text-xs font-semibold">Ditolak</span>;
            default:
                return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold capitalize">{status}</span>;
        }
    };

    const handleDownloadPdf = async (e, id, transferNumber) => {
        e.stopPropagation();
        try {
            const response = await axios.get(`/school-transfers/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rekomendasi_Pindah_Sekolah_${transferNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Gagal mengunduh surat rekomendasi. Pastikan surat sudah disahkan.');
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Top Title & Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Pengajuan Mutasi Sekolah</h1>
                    <p className="text-sm text-slate-500">Layanan pengajuan rekomendasi mutasi siswa antar sekolah/wilayah.</p>
                </div>
                {canCreate && (
                    <Link
                        to="/school-transfers/create"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded transition-colors whitespace-nowrap shadow-sm"
                    >
                        <Plus size={16} className="mr-2" />
                        Ajukan Mutasi Sekolah
                    </Link>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengajuan</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalCount}</h3>
                        <span className="inline-block mt-2 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Keseluruhan
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Folder className="text-slate-400" size={24} />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Diproses</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                            {isLoading ? '...' : pendingCount}
                        </h3>
                        <span className="inline-block mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            Menunggu verifikasi
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center border border-blue-100">
                        <FileText className="text-blue-500" size={24} />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disetujui & Selesai</p>
                        <h3 className="text-3xl font-extrabold text-slate-800 mt-2">
                            {isLoading ? '...' : approvedCount}
                        </h3>
                        <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Rekomendasi Terbit
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
                    <h3 className="font-bold text-slate-800 text-base">Daftar Pengajuan Mutasi</h3>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Cari Siswa, NISN, Sekolah..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none cursor-pointer"
                            >
                                <option value="all">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="verifikasi">Verifikasi</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                            <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-slate-500">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-4">Nomor & Tanggal</th>
                                <th scope="col" className="px-6 py-4">Sekolah Asal</th>
                                <th scope="col" className="px-6 py-4">Siswa</th>
                                <th scope="col" className="px-6 py-4">Sekolah Tujuan</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                        Memuat data pengajuan...
                                    </td>
                                </tr>
                            ) : transfers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <GitBranch className="mx-auto mb-3 opacity-20" size={40} />
                                        <p className="text-sm font-semibold text-slate-500">Tidak ada pengajuan mutasi</p>
                                        <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih filter yang berbeda.</p>
                                    </td>
                                </tr>
                            ) : (
                                transfers.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => navigate(`/school-transfers/${item.id}`)}
                                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{item.transfer_number}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draf'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {item.institution?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{item.student_name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">NISN: {item.nisn} | Kelas {item.grade}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{item.target_school}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5" title={item.target_school_address}>
                                                {item.target_school_address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                {item.status === 'approved' && (
                                                    <button
                                                        onClick={(e) => handleDownloadPdf(e, item.id, item.transfer_number)}
                                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
                                                        title="Cetak Surat Rekomendasi"
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                )}
                                                <Link
                                                    to={`/school-transfers/${item.id}`}
                                                    className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors"
                                                >
                                                    <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simple) */}
                {responseData?.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                            Menampilkan {transfers.length} dari {totalCount} data
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 border border-slate-200 bg-white rounded text-xs font-semibold disabled:opacity-50 hover:bg-slate-50"
                            >
                                Sebelumnya
                            </button>
                            <button
                                disabled={page === responseData?.last_page}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 border border-slate-200 bg-white rounded text-xs font-semibold disabled:opacity-50 hover:bg-slate-50"
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
