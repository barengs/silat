import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { default as UISelect } from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import FormGroup from '@/components/ui/FormGroup';

const userSchema = z.object({
    name: z.string().min(1, 'Nama lengkap wajib diisi'),
    nip: z.string().min(1, 'NIP/NUPTK wajib diisi'),
    email: z.string().email('Format email tidak valid'),
    institution_id: z.string().nullable().optional(),
    division_id: z.string().nullable().optional(),
    roles: z.array(z.string()).min(1, 'Minimal pilih satu role'),
    is_active: z.boolean().default(true),
});

export default function UserForm() {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isLoadingInit, setIsLoadingInit] = useState(isEditMode);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            nip: '',
            email: '',
            institution_id: '',
            division_id: '',
            roles: [],
            is_active: true,
        },
    });

    // Fetch master data: Roles
    const { data: rolesData } = useQuery({
        queryKey: ['roles-master'],
        queryFn: async () => {
            const res = await axios.get('/roles');
            return res.data.data.map(r => ({ value: r.name, label: r.name }));
        }
    });

    // Fetch master data: Institutions
    const { data: institutionsData } = useQuery({
        queryKey: ['institutions-master'],
        queryFn: async () => {
            // Simplified fetch, ideally we have a specific endpoint or infinite scroll for many schools
            const res = await axios.get('/institutions?per_page=100');
            return res.data.data.data.map(i => ({ value: String(i.id), label: i.name }));
        }
    });

    // Fetch user if edit mode
    useEffect(() => {
        if (isEditMode) {
            axios.get(`/users/${id}`).then((res) => {
                const user = res.data.data;
                reset({
                    name: user.name,
                    nip: user.nip,
                    email: user.email,
                    institution_id: user.institution_id ? String(user.institution_id) : '',
                    division_id: user.division_id ? String(user.division_id) : '',
                    roles: user.roles.map(r => r.name),
                    is_active: user.is_active,
                });
                setIsLoadingInit(false);
            }).catch(() => {
                toast.error('Gagal memuat data pengguna');
                navigate('/users');
            });
        }
    }, [id, isEditMode, reset, navigate]);

    const mutation = useMutation({
        mutationFn: async (data) => {
            // Convert empty strings to null for backend
            const payload = {
                ...data,
                institution_id: data.institution_id || null,
                division_id: data.division_id || null,
            };

            if (isEditMode) {
                return await axios.put(`/users/${id}`, payload);
            }
            return await axios.post('/users', payload);
        },
        onSuccess: () => {
            toast.success(isEditMode ? 'Data pengguna berhasil diperbarui' : 'Pengguna baru berhasil ditambahkan');
            queryClient.invalidateQueries(['users']);
            navigate('/users');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    if (isLoadingInit) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4">
                <button 
                    onClick={() => navigate('/users')}
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        Lengkapi formulir di bawah ini untuk mengatur akun pengguna sistem.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
                    
                    {/* Data Diri Section */}
                    <div className="space-y-4">
                        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Informasi Profil</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup label="Nama Lengkap" error={errors.name?.message} required>
                                <Input
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    error={errors.name}
                                    {...register('name')}
                                />
                            </FormGroup>

                            <FormGroup label="NIP / NUPTK" error={errors.nip?.message} required>
                                <Input
                                    type="text"
                                    placeholder="Nomor Induk Pegawai"
                                    error={errors.nip}
                                    {...register('nip')}
                                />
                                {!isEditMode && <p className="mt-1 text-xs text-slate-500">* NIP akan otomatis dijadikan password awal.</p>}
                            </FormGroup>

                            <FormGroup label="Email Resmi" className="md:col-span-2" error={errors.email?.message}>
                                <Input
                                    type="email"
                                    placeholder="email@disdik.pamekasan.go.id"
                                    error={errors.email}
                                    {...register('email')}
                                />
                            </FormGroup>
                        </div>
                    </div>

                    {/* Pekerjaan & Akses Section */}
                    <div className="space-y-4 pt-4">
                        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">Penempatan & Hak Akses (Multi-Role)</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup label="Instansi (Opsional)">
                                <UISelect {...register('institution_id')}>
                                    <option value="">-- Dinas Pendidikan (Pusat) --</option>
                                    {institutionsData?.map(inst => (
                                        <option key={inst.value} value={inst.value}>{inst.label}</option>
                                    ))}
                                </UISelect>
                            </FormGroup>

                            <FormGroup label="Peran (Roles)" error={errors.roles?.message} required>
                                <Controller
                                    name="roles"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            isMulti
                                            options={rolesData}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Pilih satu atau lebih role..."
                                            value={rolesData?.filter(r => field.value.includes(r.value))}
                                            onChange={(selectedOptions) => {
                                                field.onChange(selectedOptions ? selectedOptions.map(opt => opt.value) : []);
                                            }}
                                        />
                                    )}
                                />
                                <p className="mt-1 text-xs text-slate-500">Anda dapat memilih lebih dari satu peran.</p>
                            </FormGroup>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center">
                            <Checkbox id="is_active" {...register('is_active')} />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900 font-medium cursor-pointer">
                                Akun Aktif (Dapat Login)
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/users')}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            icon={Save}
                        >
                            Simpan Data
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
