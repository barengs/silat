import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Plus, Edit, Trash2, Building2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DataTable from '@/components/DataTable/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import FormGroup from '@/components/ui/FormGroup';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';

const institutionSchema = z.object({
    name: z.string().min(1, 'Nama instansi wajib diisi'),
    type: z.enum(['dinas', 'cabdin', 'sekolah_sma', 'sekolah_smk', 'sekolah_pkplk', 'other']),
    npsn: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
});

export default function InstitutionList() {
    const queryClient = useQueryClient();

    // Table State
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(institutionSchema),
        defaultValues: {
            name: '', type: 'sekolah_sma', npsn: '', city: '', is_active: true
        }
    });

    // Fetch Data
    const { data, isLoading } = useQuery({
        queryKey: ['institutions', pageIndex, pageSize, searchTerm],
        queryFn: async () => {
            const res = await axios.get('/institutions', {
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

    // Mutations
    const mutation = useMutation({
        mutationFn: async (formData) => {
            if (editingId) {
                return await axios.put(`/institutions/${editingId}`, formData);
            }
            return await axios.post('/institutions', formData);
        },
        onSuccess: () => {
            toast.success(editingId ? 'Data instansi diperbarui' : 'Instansi berhasil ditambahkan');
            queryClient.invalidateQueries(['institutions']);
            closeModal();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menyimpan data');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`/institutions/${id}`);
        },
        onSuccess: () => {
            toast.success('Instansi berhasil dihapus');
            queryClient.invalidateQueries(['institutions']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus instansi');
        }
    });

    const openModal = (inst = null) => {
        if (inst) {
            setEditingId(inst.id);
            setValue('name', inst.name);
            setValue('type', inst.type);
            setValue('npsn', inst.npsn || '');
            setValue('city', inst.city || '');
            setValue('is_active', inst.is_active);
        } else {
            setEditingId(null);
            reset({ name: '', type: 'sekolah_sma', npsn: '', city: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset();
    };

    const handleDelete = (id) => {
        if (window.confirm('Yakin ingin menghapus instansi ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    const getTypeLabel = (type) => {
        const types = {
            'dinas': 'Dinas Pendidikan',
            'cabdin': 'Cabang Dinas',
            'sekolah_sma': 'SMA',
            'sekolah_smk': 'SMK',
            'sekolah_pkplk': 'PKPLK',
            'other': 'Lainnya'
        };
        return types[type] || type;
    };

    const columns = useMemo(() => [
        {
            header: 'Nama Instansi',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center">
                    <Building2 size={16} className="text-teal-600 mr-2" />
                    <span className="font-medium text-slate-900">{row.original.name}</span>
                </div>
            )
        },
        {
            header: 'NPSN',
            accessorKey: 'npsn',
            cell: ({ getValue }) => <span className="text-slate-600 font-mono text-sm">{getValue() || '-'}</span>
        },
        {
            header: 'Tipe',
            accessorKey: 'type',
            cell: ({ getValue }) => (
                <Badge variant="primary">
                    {getTypeLabel(getValue())}
                </Badge>
            )
        },
        {
            header: 'Kota/Kab',
            accessorKey: 'city',
            cell: ({ getValue }) => <span className="text-slate-600">{getValue() || '-'}</span>
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ getValue }) => (
                getValue() 
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
                        onClick={() => openModal(row.original)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                        <Edit size={16} />
                    </button>
                    {row.original.type !== 'dinas' && (
                        <button 
                            onClick={() => handleDelete(row.original.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ], []);

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
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Instansi</h1>
                    <p className="text-slate-500 text-sm">Kelola data sekolah dan cabang dinas.</p>
                </div>
                <Button 
                    onClick={() => openModal()}
                    icon={Plus}
                >
                    Tambah Instansi
                </Button>
            </div>

            <DataTable
                table={table}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={(val) => { setSearchTerm(val); setPageIndex(0); }}
                pageSize={pageSize}
                onPageSizeChange={(val) => { setPageSize(val); setPageIndex(0); }}
                searchPlaceholder="Cari instansi atau NPSN..."
            />

            {/* Modal Form */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title={editingId ? 'Edit Instansi' : 'Tambah Instansi Baru'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <FormGroup label="Nama Instansi/Sekolah" error={errors.name?.message}>
                        <Input
                            type="text"
                            {...register('name')}
                            error={errors.name}
                        />
                    </FormGroup>

                    <div className="grid grid-cols-2 gap-4">
                        <FormGroup label="Tipe">
                            <Select {...register('type')}>
                                <option value="dinas">Dinas Pendidikan</option>
                                <option value="cabdin">Cabang Dinas</option>
                                <option value="sekolah_sma">SMA</option>
                                <option value="sekolah_smk">SMK</option>
                                <option value="sekolah_pkplk">PKPLK</option>
                                <option value="other">Lainnya</option>
                            </Select>
                        </FormGroup>
                        <FormGroup label="NPSN (Khusus Sekolah)" error={errors.npsn?.message}>
                            <Input
                                type="text"
                                {...register('npsn')}
                                error={errors.npsn}
                            />
                        </FormGroup>
                    </div>

                    <FormGroup label="Kota / Kabupaten">
                        <Input
                            type="text"
                            {...register('city')}
                        />
                    </FormGroup>

                    <div className="flex items-center pt-2">
                        <Checkbox
                            id="is_active"
                            {...register('is_active')}
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900 font-medium cursor-pointer">
                            Instansi Aktif
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button
                            variant="secondary"
                            onClick={closeModal}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
