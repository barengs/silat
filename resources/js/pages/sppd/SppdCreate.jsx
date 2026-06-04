import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, MapPin, Building, Info, FileText, Send, Users, Car, Wallet } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import AsyncSelect from 'react-select/async';

const sppdSchema = z.object({
    purpose: z.string().min(5, 'Maksud perjalanan dinas wajib diisi'),
    destination_city: z.string().min(3, 'Kota/Tempat tujuan wajib diisi'),
    destination_agency: z.string().min(3, 'Instansi tujuan wajib diisi'),
    start_date: z.string().min(1, 'Tanggal berangkat wajib diisi'),
    end_date: z.string().min(1, 'Tanggal kembali wajib diisi'),
    transport_type_id: z.string().min(1, 'Pilih moda transportasi utama'),
    budget_source_type: z.string().min(1, 'Pilih beban anggaran'),
    budget_code: z.string().optional(),
    members: z.array(z.object({
        user_id: z.number().min(1, 'Pilih pegawai'),
        name: z.string(),
        nip: z.string().nullable(),
        role_in_trip: z.string().nullable()
    })).optional()
}).refine(data => new Date(data.start_date) <= new Date(data.end_date), {
    message: "Tanggal kembali tidak boleh lebih awal dari tanggal berangkat",
    path: ['end_date']
});

export default function SppdCreate() {
    const navigate = useNavigate();

    // Fetch transport types
    const { data: transportTypes } = useQuery({
        queryKey: ['transport-types'],
        queryFn: async () => {
            try {
                const res = await axios.get('/sppd/reference-data').catch(() => ({ data: { transport_types: [
                    { id: 1, name: 'Kendaraan Dinas' },
                    { id: 2, name: 'Kendaraan Umum (Bus/Kereta/Pesawat)' },
                    { id: 3, name: 'Kendaraan Pribadi' }
                ]}}));
                return res.data.transport_types || res.data;
            } catch {
                return [
                    { id: 1, name: 'Kendaraan Dinas' },
                    { id: 2, name: 'Kendaraan Umum (Bus/Kereta/Pesawat)' },
                    { id: 3, name: 'Kendaraan Pribadi' }
                ];
            }
        }
    });

    const form = useForm({
        resolver: zodResolver(sppdSchema),
        defaultValues: {
            purpose: '',
            destination_city: '',
            destination_agency: '',
            start_date: '',
            end_date: '',
            transport_type_id: '',
            budget_source_type: '',
            budget_code: '',
            members: []
        }
    });

    const { control, handleSubmit, watch, formState: { errors } } = form;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "members"
    });

    const startDate = watch('start_date');
    const endDate = watch('end_date');

    const durationDays = useMemo(() => {
        if (!startDate || !endDate) return '';
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return '0';
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        return diffDays;
    }, [startDate, endDate]);

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                purpose: data.purpose,
                destination: `${data.destination_agency}, ${data.destination_city}`,
                start_date: data.start_date,
                end_date: data.end_date,
                transport_type_id: data.transport_type_id,
                budget_source: data.budget_code ? `${data.budget_source_type} - ${data.budget_code}` : data.budget_source_type,
                members: data.members.map(m => ({ user_id: m.user_id, role_in_trip: m.role_in_trip }))
            };
            return await axios.post('/sppd', payload);
        },
        onSuccess: () => {
            toast.success('Pengajuan SPPD berhasil disimpan sebagai Draft');
            navigate('/sppd');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan SPPD');
        }
    });

    const loadUsers = async (inputValue) => {
        if (!inputValue) return [];
        const res = await axios.get('/sppd/search-members', { params: { q: inputValue } });
        return res.data.map(user => ({
            value: user.id,
            label: `${user.name} ${user.nip ? `(${user.nip})` : ''}`,
            user: user
        }));
    };

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    return (
        <div className="max-w-4xl mx-auto pb-8">
            <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/sppd')}>Manajemen SPPD</span>
                    <span>›</span>
                    <span className="text-slate-800 font-medium">Pengajuan Baru</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Formulir Pengajuan SPPD</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-5 rounded shadow-sm border border-slate-200 space-y-6">
                
                {/* Informasi Dasar */}
                <section>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                        <Info className="text-emerald-600" size={18} />
                        Informasi Dasar
                    </h2>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Maksud Perjalanan Dinas <span className="text-red-500">*</span></label>
                            <input 
                                {...form.register('purpose')}
                                type="text"
                                placeholder="Contoh: Rapat Koordinasi Kurikulum Tingkat Provinsi"
                                className={`w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-emerald-500 ${errors.purpose ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kota/Tempat Tujuan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        {...form.register('destination_city')}
                                        type="text"
                                        placeholder="Contoh: Surabaya"
                                        className={`w-full pl-8 pr-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-emerald-500 ${errors.destination_city ? 'border-red-500' : 'border-slate-200'}`}
                                    />
                                </div>
                                {errors.destination_city && <p className="text-red-500 text-xs mt-1">{errors.destination_city.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Instansi Tujuan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        {...form.register('destination_agency')}
                                        type="text"
                                        placeholder="Contoh: Dinas Pendidikan Provinsi"
                                        className={`w-full pl-8 pr-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-emerald-500 ${errors.destination_agency ? 'border-red-500' : 'border-slate-200'}`}
                                    />
                                </div>
                                {errors.destination_agency && <p className="text-red-500 text-xs mt-1">{errors.destination_agency.message}</p>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Waktu Pelaksanaan */}
                <section>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                        <Calendar className="text-emerald-600" size={18} />
                        Waktu Pelaksanaan
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Berangkat <span className="text-red-500">*</span></label>
                            <input 
                                {...form.register('start_date')}
                                type="date"
                                className={`w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-emerald-500 ${errors.start_date ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Kembali <span className="text-red-500">*</span></label>
                            <input 
                                {...form.register('end_date')}
                                type="date"
                                className={`w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-emerald-500 ${errors.end_date ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Lama Perjalanan</label>
                            <input 
                                type="text"
                                value={durationDays ? `${durationDays} Hari` : 'Dihitung otomatis'}
                                readOnly
                                className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-500 rounded text-sm cursor-not-allowed"
                            />
                        </div>
                    </div>
                </section>

                {/* Transportasi & Sumber Dana */}
                <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                <Car className="text-emerald-600" size={18} />
                                Transportasi
                            </h2>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Moda Transportasi <span className="text-red-500">*</span></label>
                                <div className="space-y-1">
                                    {transportTypes?.map(type => (
                                        <label key={type.id} className="flex items-center gap-2 px-2 py-1.5 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                                            <input 
                                                type="radio" 
                                                value={type.id} 
                                                {...form.register('transport_type_id')}
                                                className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-slate-700">{type.name}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.transport_type_id && <p className="text-red-500 text-xs mt-1">{errors.transport_type_id.message}</p>}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                <Wallet className="text-emerald-600" size={18} />
                                Sumber Dana
                            </h2>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Beban Anggaran <span className="text-red-500">*</span></label>
                                    <select 
                                        {...form.register('budget_source_type')}
                                        className={`w-full px-3 py-1.5 border rounded text-sm focus:ring-1 focus:ring-emerald-500 ${errors.budget_source_type ? 'border-red-500' : 'border-slate-200'}`}
                                    >
                                        <option value="">Pilih Sumber Dana</option>
                                        <option value="APBD">APBD</option>
                                        <option value="BOS">BOS (Bantuan Operasional Sekolah)</option>
                                        <option value="DIPA">DIPA</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    {errors.budget_source_type && <p className="text-red-500 text-xs mt-1">{errors.budget_source_type.message}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Rekening</label>
                                    <input 
                                        {...form.register('budget_code')}
                                        type="text"
                                        placeholder="Opsional"
                                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Anggota Tim */}
                <section>
                    <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <Users className="text-emerald-600" size={18} />
                            Pengikut
                        </h2>
                        <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            icon={Plus}
                            onClick={() => append({ user_id: 0, name: '', nip: '', role_in_trip: '' })}
                            className="h-7 text-xs py-0"
                        >
                            Tambah Baris
                        </Button>
                    </div>
                    
                    <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-2 w-10 text-center">NO</th>
                                    <th className="px-3 py-2">NAMA PEGAWAI</th>
                                    <th className="px-3 py-2 w-48">NIP</th>
                                    <th className="px-3 py-2 w-48">JABATAN</th>
                                    <th className="px-3 py-2 w-12 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-6 text-center text-slate-400 text-xs">
                                            Tidak ada pengikut.
                                        </td>
                                    </tr>
                                ) : fields.map((item, index) => (
                                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                                        <td className="px-3 py-2 text-center text-slate-500 font-medium text-xs">{index + 1}</td>
                                        <td className="px-3 py-2 min-w-[200px]">
                                            <Controller
                                                control={control}
                                                name={`members.${index}.user_id`}
                                                render={({ field }) => (
                                                    <AsyncSelect
                                                        cacheOptions
                                                        loadOptions={loadUsers}
                                                        defaultOptions={false}
                                                        placeholder="Cari nama/NIP..."
                                                        noOptionsMessage={() => "Tidak ditemukan"}
                                                        loadingMessage={() => "Mencari..."}
                                                        onChange={(selected) => {
                                                            field.onChange(selected?.value || 0);
                                                            if (selected) {
                                                                form.setValue(`members.${index}.name`, selected.user.name);
                                                                form.setValue(`members.${index}.nip`, selected.user.nip);
                                                                form.setValue(`members.${index}.role_in_trip`, selected.user.division?.name || 'Staff');
                                                            }
                                                        }}
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                minHeight: '32px',
                                                                borderColor: errors?.members?.[index]?.user_id ? '#ef4444' : '#e2e8f0',
                                                                borderRadius: '0.25rem',
                                                                fontSize: '0.875rem'
                                                            }),
                                                            valueContainer: (base) => ({ ...base, padding: '0 8px' }),
                                                            dropdownIndicator: (base) => ({ ...base, padding: '4px' }),
                                                            clearIndicator: (base) => ({ ...base, padding: '4px' }),
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors?.members?.[index]?.user_id && <p className="text-red-500 text-[10px] mt-0.5">{errors.members[index].user_id.message}</p>}
                                        </td>
                                        <td className="px-3 py-2">
                                            <input 
                                                {...form.register(`members.${index}.nip`)}
                                                readOnly
                                                placeholder="NIP"
                                                className="w-full px-2 py-1.5 border border-slate-200 bg-slate-50 text-slate-500 rounded text-xs cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input 
                                                {...form.register(`members.${index}.role_in_trip`)}
                                                placeholder="Jabatan"
                                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button 
                                                type="button" 
                                                onClick={() => remove(index)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/sppd')}
                        className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                    >
                        Batal
                    </Button>
                    <Button 
                        type="submit" 
                        size="sm"
                        icon={Send}
                        isLoading={createMutation.isPending}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white"
                    >
                        Simpan Draft
                    </Button>
                </div>
            </form>
        </div>
    );
}
