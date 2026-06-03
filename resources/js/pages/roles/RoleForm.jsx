import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, CheckSquare, Square } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormGroup from '@/components/ui/FormGroup';
import Checkbox from '@/components/ui/Checkbox';
import Badge from '@/components/ui/Badge';

const roleSchema = z.object({
    name: z.string().min(1, 'Nama role wajib diisi').regex(/^[a-z0-9\-]+$/, 'Gunakan huruf kecil, angka, dan strip (contoh: admin-sekolah)'),
});

export default function RoleForm() {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isLoadingInit, setIsLoadingInit] = useState(isEditMode);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: '' },
    });

    // 1. Fetch the Permission Matrix
    const { data: matrixData, isLoading: isLoadingMatrix } = useQuery({
        queryKey: ['permissions-matrix'],
        queryFn: async () => {
            const res = await axios.get('/roles/permissions-matrix');
            return res.data.data;
        }
    });

    // 2. Fetch Existing Role (if edit mode)
    useEffect(() => {
        if (isEditMode) {
            axios.get(`/roles/${id}`).then((res) => {
                const role = res.data.data;
                reset({ name: role.name });
                // Set initial selected permissions
                const currentPerms = role.permissions.map(p => p.name);
                setSelectedPermissions(currentPerms);
                setIsLoadingInit(false);
            }).catch(() => {
                toast.error('Gagal memuat data role');
                navigate('/roles');
            });
        }
    }, [id, isEditMode, reset, navigate]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                name: data.name,
                permissions: selectedPermissions
            };
            if (isEditMode) {
                return await axios.put(`/roles/${id}`, payload);
            }
            return await axios.post('/roles', payload);
        },
        onSuccess: () => {
            toast.success(isEditMode ? 'Role & Hak Akses berhasil diperbarui' : 'Role baru berhasil disimpan');
            queryClient.invalidateQueries(['roles']);
            navigate('/roles');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    // Toggle a single permission
    const togglePermission = (permName) => {
        setSelectedPermissions(prev => 
            prev.includes(permName) 
                ? prev.filter(p => p !== permName)
                : [...prev, permName]
        );
    };

    // Toggle an entire module
    const toggleModule = (moduleName, permissionsList) => {
        const modulePermNames = permissionsList.map(p => p.name);
        const allSelected = modulePermNames.every(name => selectedPermissions.includes(name));

        if (allSelected) {
            // Deselect all in module
            setSelectedPermissions(prev => prev.filter(p => !modulePermNames.includes(p)));
        } else {
            // Select all in module
            const toAdd = modulePermNames.filter(name => !selectedPermissions.includes(name));
            setSelectedPermissions(prev => [...prev, ...toAdd]);
        }
    };

    if (isLoadingInit || isLoadingMatrix) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => navigate('/roles')}
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditMode ? 'Konfigurasi Hak Akses Role' : 'Buat Role Baru'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        Atur wewenang (permissions) secara detail melalui matriks modul di bawah ini.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Role Name Section */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <FormGroup label="Identifier Nama Role" error={errors.name?.message}>
                        <Input
                            type="text"
                            className="max-w-md"
                            placeholder="contoh: kepala-bidang"
                            error={errors.name}
                            {...register('name')}
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Gunakan format huruf kecil dan tanda hubung (-). Identifier ini digunakan oleh sistem inti.
                        </p>
                    </FormGroup>
                </div>

                {/* Permission Matrix Section */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">Matriks Hak Akses (Permission Matrix)</h2>
                        <Badge variant="info">
                            {selectedPermissions.length} Dipilih
                        </Badge>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-600 w-1/4">Modul / Menu</th>
                                    <th scope="col" className="px-3 py-2 text-left font-semibold text-slate-600">Hak Akses (Permissions)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {matrixData && Object.entries(matrixData).map(([moduleName, perms]) => {
                                    const modulePermNames = perms.map(p => p.name);
                                    const selectedInModule = modulePermNames.filter(name => selectedPermissions.includes(name)).length;
                                    const isAllSelected = selectedInModule === perms.length && perms.length > 0;
                                    const isIndeterminate = selectedInModule > 0 && selectedInModule < perms.length;

                                    return (
                                        <tr key={moduleName} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-3 py-1.5 align-middle border-r border-slate-100 w-1/4">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-bold text-slate-800 capitalize text-[13px]">
                                                        {moduleName.replace('-', ' ')}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleModule(moduleName, perms)}
                                                        className="inline-flex items-center text-[10px] font-medium text-teal-600 hover:text-teal-700"
                                                    >
                                                        {isAllSelected ? (
                                                            <><CheckSquare size={12} className="mr-0.5"/> Batal</>
                                                        ) : isIndeterminate ? (
                                                            <><Square size={12} className="mr-0.5 opacity-50 bg-teal-200" /> Pilih</>
                                                        ) : (
                                                            <><Square size={12} className="mr-0.5"/> Pilih</>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-3 py-1.5 align-middle">
                                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                    {perms.map((perm) => {
                                                        const isChecked = selectedPermissions.includes(perm.name);
                                                        return (
                                                            <label 
                                                                key={perm.id} 
                                                                className="inline-flex items-center cursor-pointer group py-0.5"
                                                            >
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onChange={() => togglePermission(perm.name)}
                                                                />
                                                                <span className={`ml-1.5 text-[12px] transition-colors ${isChecked ? 'font-medium text-teal-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                                    {perm.action}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pb-8">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/roles')}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        icon={Save}
                    >
                        Simpan Konfigurasi Role
                    </Button>
                </div>

            </form>
        </div>
    );
}
