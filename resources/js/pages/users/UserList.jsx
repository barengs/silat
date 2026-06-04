import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import axios from '@/bootstrap';
import { Plus, Edit, Trash2, Shield, CheckCircle, XCircle, FileDown, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import ImportUserModal from '@/components/ImportUserModal';
import DataTable from '@/components/DataTable/DataTable';

export default function UserList() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    
    // Pagination & Search State
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Fetch Users
    const { data, isLoading } = useQuery({
        queryKey: ['users', pageIndex, pageSize, searchTerm],
        queryFn: async () => {
            const res = await axios.get('/users', {
                params: {
                    page: pageIndex + 1,
                    per_page: pageSize,
                    search: searchTerm || undefined,
                },
            });
            return res.data.data;
        },
        keepPreviousData: true,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axios.delete(`/users/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Pengguna berhasil dihapus');
            queryClient.invalidateQueries(['users']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus pengguna');
        },
    });

    const handleDelete = (id) => {
        if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
            deleteMutation.mutate(id);
        }
    };

    // Table Columns
    const columns = React.useMemo(() => [
        {
            header: 'Nama / NIP',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-slate-900">{row.original.name}</div>
                    <div className="text-xs text-slate-500">{row.original.nip}</div>
                </div>
            )
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <span className="text-slate-600">{row.original.email}</span>
        },
        {
            header: 'Roles',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles?.map(role => (
                        <span key={role.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <Shield size={10} className="mr-1" />
                            {role.name}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: 'Instansi',
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.institution ? (
                        <span className="text-teal-700 font-medium">{row.original.institution.name}</span>
                    ) : (
                        <span className="text-slate-400 italic">Dinas Pendidikan</span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                row.original.is_active 
                    ? <span className="inline-flex items-center text-emerald-600 text-sm font-medium"><CheckCircle size={14} className="mr-1"/> Aktif</span>
                    : <span className="inline-flex items-center text-rose-600 text-sm font-medium"><XCircle size={14} className="mr-1"/> Nonaktif</span>
            )
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={() => navigate(`/users/${row.original.id}/edit`)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit User"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Hapus User"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ], [navigate]);

    const table = useReactTable({
        data: data?.data || [],
        columns,
        pageCount: data?.last_page ?? -1,
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
                    <p className="text-slate-500 text-sm">Kelola daftar pegawai, admin, dan operator sekolah.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => window.location.href = '/api/users/export'}
                        className="flex items-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-sm font-medium shadow-sm transition-colors"
                    >
                        <FileDown size={18} className="mr-2 text-slate-400" />
                        Export Excel
                    </button>
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-sm font-medium shadow-sm transition-colors"
                    >
                        <FileUp size={18} className="mr-2 text-slate-400" />
                        Import Excel
                    </button>
                    <button 
                        onClick={() => navigate('/users/create')}
                        className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm font-medium shadow-sm transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Tambah Pengguna
                    </button>
                </div>
            </div>

            <DataTable
                table={table}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={(val) => { setSearchTerm(val); setPageIndex(0); }}
                pageSize={pageSize}
                onPageSizeChange={(val) => { setPageSize(val); setPageIndex(0); }}
                searchPlaceholder="Cari nama, NIP, atau email..."
            />

            <ImportUserModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    queryClient.invalidateQueries(['users']);
                }}
            />
        </div>
    );
}
