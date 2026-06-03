import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from '@/bootstrap';
import { Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import DataTable from '@/components/DataTable/DataTable';

export default function RoleList() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: roles, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const res = await axios.get('/roles');
            return res.data.data;
        }
    });

    // Client-side filtering
    const filteredData = useMemo(() => {
        if (!roles) return [];
        if (!searchTerm) return roles;
        return roles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [roles, searchTerm]);

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axios.delete(`/roles/${id}`);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Role berhasil dihapus');
            queryClient.invalidateQueries(['roles']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus role');
        },
    });

    const handleDelete = (id, name) => {
        if (['super-admin', 'admin-dinas', 'verifikator'].includes(name)) {
            toast.error('Role inti sistem tidak dapat dihapus.');
            return;
        }

        if (window.confirm(`Yakin ingin menghapus role "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const columns = useMemo(() => [
        {
            header: 'No',
            accessorKey: 'id',
            cell: (info) => <span className="text-slate-500">{info.row.index + 1}</span>,
            size: 60,
        },
        {
            header: 'Nama Role (Identifier)',
            accessorKey: 'name',
            cell: (info) => (
                <div className="flex items-center">
                    <ShieldAlert size={16} className="text-teal-600 mr-2" />
                    <span className="font-medium text-slate-800 capitalize">
                        {info.getValue().replace('-', ' ')}
                    </span>
                    <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {info.getValue()}
                    </span>
                </div>
            ),
        },
        {
            header: 'Total Hak Akses',
            accessorKey: 'permissions',
            cell: (info) => {
                const perms = info.getValue() || [];
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {perms.length} Permissions
                    </span>
                );
            },
        },
        {
            header: 'Aksi',
            id: 'actions',
            cell: (info) => {
                const role = info.row.original;
                const isCoreRole = ['super-admin', 'admin-dinas', 'verifikator'].includes(role.name);

                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/roles/${role.id}/edit`)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                        >
                            <Edit size={14} className="mr-1" /> Konfigurasi
                        </button>
                        {!isCoreRole && (
                            <button
                                onClick={() => handleDelete(role.id, role.name)}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors border border-rose-200"
                                title="Hapus Role"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                );
            },
        }
    ], [navigate]);

    const table = useReactTable({
        data: filteredData || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            pagination: { pageIndex, pageSize },
        },
        onPaginationChange: (updater) => {
            const nextState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
            setPageIndex(nextState.pageIndex);
            setPageSize(nextState.pageSize);
        },
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Peran (Roles)</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola daftar hak akses dan wewenang pengguna sistem.</p>
                </div>
                <button
                    onClick={() => navigate('/roles/create')}
                    className="flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                    <Plus size={18} className="mr-2" />
                    Tambah Role Baru
                </button>
            </div>

            <DataTable
                table={table}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={(val) => setSearchTerm(val)}
                pageSize={pageSize}
                onPageSizeChange={(val) => setPageSize(val)}
                searchPlaceholder="Cari role..."
            />
        </div>
    );
}
