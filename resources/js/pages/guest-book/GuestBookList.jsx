import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import { Plus, Users, Building2, Network, Download, BarChart2, Calendar } from 'lucide-react';
import axios from '@/bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CheckinModal from './CheckinModal';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import FormGroup from '@/components/ui/FormGroup';

export default function GuestBookList() {
    const { user, roles, permissions } = useSelector(state => state.auth);
    const canCreate = permissions.includes('guest-book.create') || roles.includes('super-admin');
    const canEdit = permissions.includes('guest-book.edit') || roles.includes('super-admin');
    const canDelete = permissions.includes('guest-book.delete') || roles.includes('super-admin');

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [editingGuest, setEditingGuest] = useState(null);

    const visitMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axios.patch(`/guest-book/${id}/visit`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['guest-books']);
            toast.success('Tamu mulai melakukan kunjungan.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal merubah status kunjungan.');
        }
    });

    const checkoutMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axios.patch(`/guest-book/${id}/checkout`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['guest-books']);
            toast.success('Tamu berhasil check-out.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal melakukan check-out.');
        }
    });

    const [deleteId, setDeleteId] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: async ({ id, password }) => {
            const res = await axios.delete(`/guest-book/${id}`, {
                data: { password },
                headers: { 'X-Confirm-Password': password }
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['guest-books']);
            toast.success('Data tamu berhasil dihapus.');
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            setDeletePassword('');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus data tamu.');
        }
    });

    const handleDelete = (id) => {
        setDeleteId(id);
        setDeletePassword('');
        setIsDeleteModalOpen(true);
    };

    // Fetch Guest Books with Stats
    const { data, isLoading } = useQuery({
        queryKey: ['guest-books', pageIndex, pageSize, searchTerm, startDate, endDate],
        queryFn: async () => {
            const res = await axios.get('/guest-book', {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: searchTerm || undefined,
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                },
            });
            return res.data;
        },
        keepPreviousData: true,
        refetchInterval: 5000, // Refresh data automatically every 5 seconds for real-time updates
    });

    const guests = data?.data?.data || [];
    const stats = data?.stats || { total_today: 0, total_month: 0, main_target_division: '-' };

    const columns = useMemo(() => [
        {
            header: 'WAKTU',
            accessorKey: 'check_in_time',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">{row.original.check_in_time} WIB</span>
                    <span className="text-[11px] text-slate-400 font-normal leading-normal">{row.original.time_ago}</span>
                </div>
            )
        },
        {
            header: 'NAMA TAMU',
            accessorKey: 'guest_name',
            cell: ({ getValue }) => <span className="font-semibold text-slate-900">{getValue()}</span>
        },
        {
            header: 'ASAL',
            accessorKey: 'agency.name',
            cell: ({ row }) => <span className="text-slate-600">{row.original.agency?.name || '-'}</span>
        },
        {
            header: 'TUJUAN',
            accessorKey: 'target_division.name',
            cell: ({ row }) => <span className="text-slate-600">{row.original.target_division?.name || '-'}</span>
        },
        {
            header: 'KEPERLUAN',
            accessorKey: 'purpose',
            cell: ({ getValue }) => <span className="text-sm text-slate-500 line-clamp-1" title={getValue()}>{getValue()}</span>
        },
        {
            header: 'STATUS / AKSI',
            id: 'status',
            cell: ({ row }) => {
                const rawStatus = row.original.status || (row.original.check_out_time ? 'selesai' : 'berkunjung');
                const status = rawStatus === 'berkunjung' ? 'proses' : rawStatus;
                
                const isWaiting = status === 'menunggu';
                const isProcessing = status === 'proses';
                const isCompleted = status === 'selesai';

                const isTargetDivision = !roles.includes('resepsionis') && (roles.includes('super-admin') || (user?.division_id && Number(user.division_id) === Number(row.original.target_division_id)));
                
                return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {isWaiting && (
                            <Badge variant="warning" className="bg-orange-100 text-orange-700 border-orange-200">
                                Menunggu
                            </Badge>
                        )}
                        {isProcessing && (
                            <Badge variant="info" className="bg-blue-100 text-blue-700 border-blue-200">
                                Proses
                            </Badge>
                        )}
                        {isCompleted && (
                            <Badge variant="success">Selesai</Badge>
                        )}
                        
                        {isWaiting && isTargetDivision && (
                            <Button 
                                size="xs" 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-2 text-xs font-semibold rounded shrink-0"
                                onClick={() => visitMutation.mutate(row.original.id)}
                                isLoading={visitMutation.isPending && visitMutation.variables === row.original.id}
                            >
                                Proses
                            </Button>
                        )}
                        
                        {isProcessing && isTargetDivision && (
                            <Button 
                                size="xs" 
                                className="bg-rose-600 hover:bg-rose-700 text-white py-1 px-2 text-xs font-semibold rounded shrink-0"
                                onClick={() => checkoutMutation.mutate(row.original.id)}
                                isLoading={checkoutMutation.isPending && checkoutMutation.variables === row.original.id}
                            >
                                Selesai
                            </Button>
                        )}

                        {canEdit && isWaiting && (
                            <Button 
                                size="xs" 
                                variant="outline"
                                className="border-slate-200 text-slate-700 hover:bg-slate-50 py-1 px-2 text-xs font-semibold rounded shrink-0"
                                onClick={() => {
                                    setEditingGuest(row.original);
                                    setIsCheckinOpen(true);
                                }}
                            >
                                Edit
                            </Button>
                        )}

                        {canDelete && isWaiting && (
                            <Button 
                                size="xs" 
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1 px-2 text-xs font-semibold rounded shrink-0"
                                onClick={() => handleDelete(row.original.id)}
                                isLoading={deleteMutation.isPending && deleteMutation.variables === row.original.id}
                            >
                                Hapus
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ], [user, canCreate, canEdit, canDelete, checkoutMutation, visitMutation, deleteMutation, setEditingGuest, setIsCheckinOpen, handleDelete]);

    const table = useReactTable({
        data: guests,
        columns,
        pageCount: data?.data?.last_page ?? -1,
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) => {
            const nextState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(nextState.pageIndex);
            setPageSize(nextState.pageSize);
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const handleExport = async () => {
        try {
            const res = await axios.get('/guest-book/export', {
                params: {
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `buku_tamu_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const dateFilters = (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Dari:</span>
                <div className="relative w-full sm:w-44">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPageIndex(0); }}
                        className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm text-slate-600 focus:outline-none"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Sampai:</span>
                <div className="relative w-full sm:w-44">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPageIndex(0); }}
                        className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:ring-teal-500 focus:border-teal-500 bg-white shadow-sm text-slate-600 focus:outline-none"
                    />
                </div>
            </div>
            {(startDate || endDate) && (
                <button
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors self-center sm:self-auto px-2"
                    onClick={() => { setStartDate(''); setEndDate(''); setPageIndex(0); }}
                >
                    Reset Filter
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Buku Tamu</h1>
                    <p className="text-slate-500 text-sm">Kelola daftar kunjungan dan tamu instansi.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        onClick={() => navigate('/guest-book/report')}
                        icon={BarChart2}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    >
                        Grafik Laporan
                    </Button>
                    <Button
                        onClick={handleExport}
                        icon={Download}
                        variant="outline"
                        className="bg-white hover:bg-slate-50 text-emerald-600 border-emerald-200"
                    >
                        Export Excel
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingGuest(null);
                            setIsCheckinOpen(true);
                        }}
                        icon={Plus}
                        className="bg-[#0F172A] hover:bg-slate-800"
                    >
                        Catat Tamu Baru
                    </Button>
                </div>
            </div>



            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded p-6 flex items-center shadow-sm">
                    <div className="w-14 h-14 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-4 shrink-0">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tamu Hari Ini</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.total_today}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded p-6 flex items-center shadow-sm">
                    <div className="w-14 h-14 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4 shrink-0">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tamu Bulan Ini</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.total_month}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded p-6 flex items-center shadow-sm">
                    <div className="w-14 h-14 rounded bg-orange-100 text-orange-600 flex items-center justify-center mr-4 shrink-0">
                        <Network size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bidang Tujuan Utama</p>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">{stats.main_target_division}</h3>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-slate-50 border border-slate-200 rounded shadow-sm p-1">
                <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Kunjungan Terbaru</h3>
                </div>
                <div className="bg-white rounded-b-xl">
                    <DataTable
                        table={table}
                        isLoading={isLoading}
                        searchTerm={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); setPageIndex(0); }}
                        pageSize={pageSize}
                        onPageSizeChange={(val) => { setPageSize(val); setPageIndex(0); }}
                        searchPlaceholder="Cari nama tamu atau instansi..."
                        filters={dateFilters}
                        hideTitle
                    />
                </div>
            </div>

            {/* Check-in Fullscreen Modal */}
            <CheckinModal
                isOpen={isCheckinOpen}
                guest={editingGuest}
                onClose={() => {
                    setIsCheckinOpen(false);
                    setEditingGuest(null);
                }}
            />

            {/* Delete Confirmation Password Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                    setDeletePassword('');
                }}
                title="Konfirmasi Penghapusan Tamu"
                maxWidth="max-w-md"
            >
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!deletePassword) {
                            toast.error('Password konfirmasi wajib diisi.');
                            return;
                        }
                        deleteMutation.mutate({ id: deleteId, password: deletePassword });
                    }} 
                    className="space-y-4"
                >
                    <p className="text-sm text-slate-600">
                        Untuk menghapus data tamu ini, silakan masukkan password akun Anda untuk verifikasi keamanan.
                    </p>
                    <FormGroup label="Password Akun Anda">
                        <Input
                            type="password"
                            placeholder="Masukkan password Anda"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setDeleteId(null);
                                setDeletePassword('');
                            }}
                            className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            isLoading={deleteMutation.isPending}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            Konfirmasi Hapus
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
