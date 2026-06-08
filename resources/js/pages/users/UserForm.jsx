import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { Save, ArrowLeft, User, Shield } from 'lucide-react';

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
    const location = useLocation();
    const queryClient = useQueryClient();

    // Try to get user data passed via navigation state (instant — no loading needed)
    const navUser = location.state?.user;

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

    // Fetch master data: Roles (will be instant if prefetched on hover)
    const { data: rolesData } = useQuery({
        queryKey: ['roles-master'],
        queryFn: async () => {
            const res = await axios.get('/roles');
            return res.data.data.map(r => ({ value: r.name, label: r.name }));
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch master data: Institutions (will be instant if prefetched on hover)
    const { data: institutionsData } = useQuery({
        queryKey: ['institutions-master'],
        queryFn: async () => {
            const res = await axios.get('/institutions?per_page=100');
            return res.data.data.data.map(i => ({ value: String(i.id), label: i.name }));
        },
        staleTime: 5 * 60 * 1000,
    });

    // Populate form as soon as master data is ready
    // If navUser exists (clicked from list), use it immediately — no extra API call needed
    // If opened directly via URL, fetch the user data as fallback
    useEffect(() => {
        if (!isEditMode) return;

        const populateForm = (user) => {
            reset({
                name: user.name,
                nip: user.nip,
                email: user.email,
                institution_id: user.institution_id ? String(user.institution_id) : '',
                division_id: user.division_id ? String(user.division_id) : '',
                roles: user.roles?.map(r => r.name) ?? [],
                is_active: user.is_active,
            });
        };

        if (navUser && rolesData && institutionsData) {
            // Instant path: data came from navigation state
            populateForm(navUser);
        } else if (!navUser && rolesData && institutionsData) {
            // Fallback path: opened directly via URL, fetch from API
            axios.get(`/users/${id}`)
                .then((res) => populateForm(res.data.data))
                .catch(() => {
                    toast.error('Gagal memuat data pengguna');
                    navigate('/users');
                });
        }
    }, [id, isEditMode, navUser, rolesData, institutionsData, reset, navigate]);

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


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-4">
                <button 
                    onClick={() => navigate('/users')}
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                    </h1>
                </div>
            </div>

            <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-6">
                    
                    {/* Data Diri Section */}
                    <div className="space-y-3">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                            <User className="text-teal-600" size={18} />
                            Informasi Profil
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-3 pt-2">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                            <Shield className="text-teal-600" size={18} />
                            Penempatan & Hak Akses
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="pt-2 border-t border-slate-100 mt-2">
                        <div className="flex items-center">
                            <Checkbox id="is_active" {...register('is_active')} />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-slate-900 font-medium cursor-pointer">
                                Akun Aktif (Dapat Login)
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/users')}
                            className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            isLoading={isSubmitting}
                            icon={Save}
                            className="bg-[#0f172a] hover:bg-slate-800 text-white"
                        >
                            Simpan Data
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
