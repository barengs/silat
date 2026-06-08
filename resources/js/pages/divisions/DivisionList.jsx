import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Plus, Edit, Trash2, Network, CheckCircle, XCircle, Upload, Download } from 'lucide-react';
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
import Textarea from '@/components/ui/Textarea';
import FormGroup from '@/components/ui/FormGroup';
import Modal from '@/components/ui/Modal';

const divisionSchema = z.object({
    name: z.string().min(1, 'Nama divisi wajib diisi'),
    code: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    sort_order: z.number().int().default(0),
    is_active: z.boolean().default(true),
});

export default function DivisionList() {
    const queryClient = useQueryClient();

    // Table State
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(divisionSchema),
        defaultValues: {
            name: '', code: '', description: '', parent_id: '', sort_order: 0, is_active: true
        }
    });

    // Fetch Data
    const { data, isLoading } = useQuery({
        queryKey: ['divisions', pageIndex, pageSize, searchTerm],
        queryFn: async () => {
            const res = await axios.get('/divisions', {
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

    // Fetch Parent Divisions for Dropdown
    const { data: parentDivisions } = useQuery({
        queryKey: ['parent-divisions'],
        queryFn: async () => {
            const res = await axios.get('/divisions?per_page=100');
            return res.data.data.data || [];
        }
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: async (formData) => {
            // format payload
            const payload = {
                ...formData,
                parent_id: formData.parent_id || null,
            };

            if (editingId) {
                return await axios.put(`/divisions/${editingId}`, payload);
            }
            return await axios.post('/divisions', payload);
        },
        onSuccess: () => {
            toast.success(editingId ? 'Data divisi diperbarui' : 'Divisi berhasil ditambahkan');
            queryClient.invalidateQueries(['divisions']);
            queryClient.invalidateQueries(['parent-divisions']);
            closeModal();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menyimpan data');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            return await axios.delete(`/divisions/${id}`);
        },
        onSuccess: () => {
            toast.success('Divisi berhasil dihapus');
            queryClient.invalidateQueries(['divisions']);
            queryClient.invalidateQueries(['parent-divisions']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus divisi');
        }
    });

    const importMutation = useMutation({
        mutationFn: async (formData) => {
            return await axios.post('/divisions/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: (res) => {
            toast.success(res.data.message || 'Import berhasil');
            queryClient.invalidateQueries(['divisions']);
            queryClient.invalidateQueries(['parent-divisions']);
            setIsImportModalOpen(false);
            setImportFile(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mengimpor data');
        }
    });

    const handleImportSubmit = (e) => {
        e.preventDefault();
        if (!importFile) return toast.error('Pilih file Excel/CSV terlebih dahulu');
        const formData = new FormData();
        formData.append('file', importFile);
        importMutation.mutate(formData);
    };

    const openModal = (div = null) => {
        if (div) {
            setEditingId(div.id);
            setValue('name', div.name);
            setValue('code', div.code || '');
            setValue('description', div.description || '');
            setValue('parent_id', div.parent_id ? String(div.parent_id) : '');
            setValue('sort_order', div.sort_order || 0);
            setValue('is_active', div.is_active);
        } else {
            setEditingId(null);
            reset({ name: '', code: '', description: '', parent_id: '', sort_order: 0, is_active: true });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset();
    };

    const handleDelete = (id) => {
        if (window.confirm('Yakin ingin menghapus divisi ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    const columns = useMemo(() => [
        {
            header: 'Nama Divisi/Bidang',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex items-center">
                    <Network size={16} className="text-teal-600 mr-2" />
                    <div>
                        <div className="font-medium text-slate-900">{row.original.name}</div>
                        {row.original.parent && (
                            <div className="text-xs text-slate-500">
                                Sub dari: <span className="font-medium">{row.original.parent.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Kode',
            accessorKey: 'code',
            cell: ({ getValue }) => <span className="text-slate-600 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">{getValue() || '-'}</span>
        },
        {
            header: 'Urutan',
            accessorKey: 'sort_order',
            cell: ({ getValue }) => <span className="text-slate-600">{getValue()}</span>
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
                    <button 
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
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
                    <h1 className="text-2xl font-bold text-slate-900">Manajemen Divisi / Bidang</h1>
                    <p className="text-slate-500 text-sm">Kelola struktur organisasi internal Dinas Pendidikan.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline"
                        onClick={() => setIsImportModalOpen(true)}
                        icon={Upload}
                        className="border-slate-200"
                    >
                        Import Excel/CSV
                    </Button>
                    <Button 
                        onClick={() => openModal()}
                        icon={Plus}
                    >
                        Tambah Divisi
                    </Button>
                </div>
            </div>

            <DataTable
                table={table}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={(val) => { setSearchTerm(val); setPageIndex(0); }}
                pageSize={pageSize}
                onPageSizeChange={(val) => { setPageSize(val); setPageIndex(0); }}
                searchPlaceholder="Cari divisi atau kode..."
            />

            {/* Modal Form */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title={editingId ? 'Edit Divisi/Bidang' : 'Tambah Divisi Baru'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <FormGroup label="Nama Divisi/Bidang" error={errors.name?.message}>
                        <Input
                            type="text"
                            {...register('name')}
                            error={errors.name}
                        />
                    </FormGroup>

                    <div className="grid grid-cols-2 gap-4">
                        <FormGroup label="Kode Divisi">
                            <Input
                                type="text"
                                placeholder="Misal: GTK-01"
                                {...register('code')}
                            />
                        </FormGroup>
                        <FormGroup label="Nomor Urut">
                            <Input
                                type="number"
                                {...register('sort_order', { valueAsNumber: true })}
                            />
                        </FormGroup>
                    </div>

                    <FormGroup label="Sub Dari (Induk Divisi)">
                        <Select {...register('parent_id')}>
                            <option value="">-- Divisi Utama (Tanpa Induk) --</option>
                            {parentDivisions?.map(div => {
                                // prevent selecting self
                                if (editingId && div.id === editingId) return null;
                                return (
                                    <option key={div.id} value={div.id}>{div.name}</option>
                                );
                            })}
                        </Select>
                    </FormGroup>

                    <FormGroup label="Deskripsi Ringkas">
                        <Textarea
                            rows="2"
                            {...register('description')}
                        />
                    </FormGroup>

                    <div className="flex items-center pt-2">
                        <Checkbox
                            id="is_active"
                            {...register('is_active')}
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900 font-medium cursor-pointer">
                            Divisi Aktif
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

            {/* Import Modal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => { setIsImportModalOpen(false); setImportFile(null); }}
                title="Import Data Divisi"
            >
                <form onSubmit={handleImportSubmit} className="space-y-4 pt-2">
                    <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold">Panduan Format Import:</p>
                            <a 
                                href="/api/divisions/template" 
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-xs bg-white text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                                <Download size={14} className="mr-1" />
                                Download Template
                            </a>
                        </div>
                        <p>Format file yang didukung: <strong>.xlsx, .xls, .csv</strong>. Urutan kolom:</p>
                        <ol className="list-decimal ml-4 mt-2 font-mono text-xs">
                            <li>Nama Divisi/Bidang (contoh: Bidang SMA)</li>
                            <li>Kode (opsional, contoh: SMA-01)</li>
                            <li>Deskripsi (opsional)</li>
                            <li>Urutan (angka, opsional)</li>
                        </ol>
                    </div>

                    <FormGroup label="Pilih File Excel/CSV">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                            onChange={(e) => setImportFile(e.target.files[0])} 
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                    </FormGroup>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => { setIsImportModalOpen(false); setImportFile(null); }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            isLoading={importMutation.isPending}
                        >
                            Mulai Import
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
