import React, { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Calendar, MapPin, Building, Info, Send, Users, Car, Wallet } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

const sppdSchema = z.object({
    purpose: z.string().min(5, 'Maksud perjalanan dinas wajib diisi'),
    destination_city: z.string().min(3, 'Kota/Tempat tujuan wajib diisi'),
    destination_agency: z.string().min(3, 'Instansi tujuan wajib diisi'),
    start_date: z.string().min(1, 'Tanggal berangkat wajib diisi'),
    end_date: z.string().min(1, 'Tanggal kembali wajib diisi'),
    transport_type_id: z.string().min(1, 'Pilih moda transportasi utama'),
    budget_source_type: z.string().optional(),
    members: z.array(z.object({
        name: z.string().min(1, 'Nama pegawai wajib diisi'),
        nip: z.string().nullable().optional(),
        role_in_trip: z.string().nullable().optional()
    })).optional()
}).refine(data => new Date(data.start_date) <= new Date(data.end_date), {
    message: "Tanggal kembali tidak boleh lebih awal dari tanggal berangkat",
    path: ['end_date']
});

export default function SppdCreate() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: transportTypes } = useQuery({
        queryKey: ['transport-types'],
        queryFn: async () => {
            try {
                const res = await axios.get('/sppd/reference-data');
                return res.data.transport_types || [];
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
            members: []
        }
    });

    const { control, handleSubmit, watch, formState: { errors } } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "members" });

    const startDate = watch('start_date');
    const endDate = watch('end_date');

    const durationDays = useMemo(() => {
        if (!startDate || !endDate) return '';
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return '0';
        return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
    }, [startDate, endDate]);

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const payload = {
                purpose: data.purpose,
                destination: `${data.destination_agency}, ${data.destination_city}`,
                start_date: data.start_date,
                end_date: data.end_date,
                transport_type_id: data.transport_type_id,
                budget_source: data.budget_source_type || null,
                members: (data.members || []).map(m => ({
                    name: m.name,
                    nip: m.nip || null,
                    role_in_trip: m.role_in_trip || null
                }))
            };
            return await axios.post('/sppd', payload);
        },
        onSuccess: () => {
            toast.success('Pengajuan SPPD berhasil disimpan sebagai Draft');
            queryClient.invalidateQueries(['sppds']);
            navigate('/sppd');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan SPPD');
        }
    });

    const onSubmit = (data) => createMutation.mutate(data);

    const inputCls = (hasErr) => `w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${hasErr ? 'border-red-500' : 'border-slate-200'}`;

    return (
        <div className="w-full pb-8">
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
                            <input {...form.register('purpose')} type="text" placeholder="Contoh: Rapat Koordinasi Kurikulum Tingkat Provinsi" className={inputCls(errors.purpose)} />
                            {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kota/Tempat Tujuan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input {...form.register('destination_city')} type="text" placeholder="Contoh: Surabaya" className={`pl-8 ${inputCls(errors.destination_city)}`} />
                                </div>
                                {errors.destination_city && <p className="text-red-500 text-xs mt-1">{errors.destination_city.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Instansi Tujuan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input {...form.register('destination_agency')} type="text" placeholder="Contoh: Dinas Pendidikan Provinsi" className={`pl-8 ${inputCls(errors.destination_agency)}`} />
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
                            <input {...form.register('start_date')} type="date" className={inputCls(errors.start_date)} />
                            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Kembali <span className="text-red-500">*</span></label>
                            <input {...form.register('end_date')} type="date" className={inputCls(errors.end_date)} />
                            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Lama Perjalanan</label>
                            <input type="text" value={durationDays ? `${durationDays} Hari` : 'Dihitung otomatis'} readOnly className="w-full px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-500 rounded text-sm cursor-not-allowed" />
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
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Moda Transportasi <span className="text-red-500">*</span></label>
                            <select {...form.register('transport_type_id')} className={inputCls(errors.transport_type_id)}>
                                <option value="">Pilih Moda Transportasi</option>
                                {transportTypes?.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                            {errors.transport_type_id && <p className="text-red-500 text-xs mt-1">{errors.transport_type_id.message}</p>}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                <Wallet className="text-emerald-600" size={18} />
                                Sumber Dana
                            </h2>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Beban Anggaran / Sumber Dana</label>
                            <input {...form.register('budget_source_type')} type="text" placeholder="Opsional (misal: BOS, APBD, dsb)" className={inputCls(false)} />
                        </div>
                    </div>
                </section>

                {/* Pengikut */}
                <section>
                    <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                        <div>
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Users className="text-emerald-600" size={18} />
                                Pengikut
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">Isi nama pegawai secara manual. Tidak harus terdaftar di sistem.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" icon={Plus} onClick={() => append({ name: '', nip: '', role_in_trip: '' })} className="h-7 text-xs py-0">
                            Tambah Baris
                        </Button>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-2 w-10 text-center">NO</th>
                                    <th className="px-3 py-2">NAMA PEGAWAI <span className="text-red-400 normal-case font-normal">*</span></th>
                                    <th className="px-3 py-2 w-44">NIP</th>
                                    <th className="px-3 py-2 w-44">JABATAN / PERAN</th>
                                    <th className="px-3 py-2 w-12 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-6 text-center text-slate-400 text-xs">
                                            Tidak ada pengikut. Klik "+ Tambah Baris" untuk menambahkan.
                                        </td>
                                    </tr>
                                ) : fields.map((item, index) => (
                                    <tr key={item.id} className="border-b border-slate-100 last:border-0">
                                        <td className="px-3 py-2 text-center text-slate-500 font-medium text-xs">{index + 1}</td>
                                        <td className="px-3 py-2 min-w-[200px]">
                                            <input
                                                {...form.register(`members.${index}.name`)}
                                                type="text"
                                                placeholder="Nama lengkap pegawai"
                                                className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${errors?.members?.[index]?.name ? 'border-red-400' : 'border-slate-200'}`}
                                            />
                                            {errors?.members?.[index]?.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.members[index].name.message}</p>}
                                        </td>
                                        <td className="px-3 py-2">
                                            <input {...form.register(`members.${index}.nip`)} type="text" placeholder="NIP (opsional)" className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input {...form.register(`members.${index}.role_in_trip`)} type="text" placeholder="Jabatan / peran" className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button type="button" onClick={() => remove(index)} className="text-red-400 hover:text-red-600 p-1">
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
                    <Button type="button" variant="outline" size="sm" onClick={() => navigate('/sppd')} className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50">
                        Batal
                    </Button>
                    <Button type="submit" size="sm" icon={Send} isLoading={createMutation.isPending} className="bg-[#0f172a] hover:bg-slate-800 text-white">
                        Simpan Draft
                    </Button>
                </div>
            </form>
        </div>
    );
}
