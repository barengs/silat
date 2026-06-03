import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Building2, UserCircle2, Briefcase, Phone } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import FormGroup from '@/components/ui/FormGroup';

const schema = z.object({
    guest_name: z.string().min(1, 'Nama tamu wajib diisi'),
    agency_name: z.string().optional(),
    target_division_id: z.string().min(1, 'Bidang/Divisi wajib dipilih'),
    purpose: z.string().min(5, 'Tuliskan keperluan dengan jelas'),
    guest_contact: z.string().optional(),
});

export default function CheckinModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    
    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            guest_name: '', agency_name: '', target_division_id: '', purpose: '', guest_contact: ''
        }
    });

    const [agencySearch, setAgencySearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch Divisions
    const { data: divisions } = useQuery({
        queryKey: ['divisions', 'all'],
        queryFn: async () => {
            const res = await axios.get('/divisions?per_page=100');
            return res.data.data.data || []; // Adjust based on pagination structure
        }
    });

    // Fetch Recent Guests (last 2)
    const { data: recentGuests } = useQuery({
        queryKey: ['guest-books', 'recent'],
        queryFn: async () => {
            const res = await axios.get('/guest-book', {
                params: { per_page: 2 }
            });
            return res.data.data.data || [];
        }
    });

    // Autocomplete Agencies
    const { data: agencySuggestions } = useQuery({
        queryKey: ['agencies', agencySearch],
        queryFn: async () => {
            if (!agencySearch) return [];
            const res = await axios.get(`/guest-book/agencies/search?search=${agencySearch}`);
            return res.data.data || [];
        },
        enabled: agencySearch.length > 1,
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            return await axios.post('/guest-book', data);
        },
        onSuccess: () => {
            toast.success('Kedatangan tamu berhasil dicatat');
            reset();
            setAgencySearch('');
            queryClient.invalidateQueries(['guest-books']);
            // Do NOT close automatically, so the receptionist is ready for the next guest
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mencatat kedatangan');
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in zoom-in duration-300">
            {/* Hidden close button - Barely visible for operators */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 transition-colors opacity-10 hover:opacity-100"
                title="Tutup (Kembali ke Dasbor)"
            >
                <X size={24} />
            </button>

            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Branding / Info */}
                <div className="md:w-5/12 bg-[#166534] text-white p-10 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-sm">
                            <img src="/images/logo-pamekasan.png" alt="Logo" className="w-16 h-16 object-contain" onError={(e) => e.target.src='https://upload.wikimedia.org/wikipedia/commons/e/e0/Lambang_Kabupaten_Pamekasan.png'} />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Buku Tamu Digital</h2>
                        <p className="text-emerald-100/80 mb-8">Dinas Pendidikan Kabupaten Pamekasan</p>
                        <div className="space-y-4">
                            <div className="flex items-center text-sm text-emerald-100/90">
                                <div className="w-8 h-8 rounded-full bg-emerald-700/50 flex items-center justify-center mr-3">1</div>
                                Lengkapi data diri dengan benar
                            </div>
                            <div className="flex items-center text-sm text-emerald-100/90">
                                <div className="w-8 h-8 rounded-full bg-emerald-700/50 flex items-center justify-center mr-3">2</div>
                                Pilih bidang/divisi tujuan
                            </div>
                            <div className="flex items-center text-sm text-emerald-100/90">
                                <div className="w-8 h-8 rounded-full bg-emerald-700/50 flex items-center justify-center mr-3">3</div>
                                Petugas akan mencatat kedatangan
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="md:w-7/12 p-10 lg:p-12">
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-slate-900">Formulir Kedatangan</h3>
                        <p className="text-slate-500 text-sm mt-1">Silakan isi formulir di bawah ini untuk mencatat tamu.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <FormGroup label="Nama Lengkap Tamu" error={errors.guest_name?.message}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserCircle2 size={18} className="text-slate-400" />
                                </div>
                                <Input
                                    type="text"
                                    className="pl-10"
                                    placeholder="Masukkan nama tamu"
                                    {...register('guest_name')}
                                    error={errors.guest_name}
                                />
                            </div>
                        </FormGroup>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormGroup label="Asal Instansi" error={errors.agency_name?.message}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 size={18} className="text-slate-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        className="pl-10"
                                        placeholder="Ketik nama instansi..."
                                        {...register('agency_name')}
                                        onChange={(e) => {
                                            register('agency_name').onChange(e);
                                            setAgencySearch(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                    
                                    {showSuggestions && agencySuggestions && agencySuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {agencySuggestions.map(agency => (
                                                <button
                                                    key={agency.id}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                                                    onClick={() => {
                                                        setValue('agency_name', agency.name);
                                                        setAgencySearch(agency.name);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    {agency.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </FormGroup>

                            <FormGroup label="Nomor HP (Opsional)" error={errors.guest_contact?.message}>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={18} className="text-slate-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        className="pl-10"
                                        placeholder="Contoh: 08123..."
                                        {...register('guest_contact')}
                                    />
                                </div>
                            </FormGroup>
                        </div>

                        <FormGroup label="Divisi / Bidang Tujuan" error={errors.target_division_id?.message}>
                            <Select {...register('target_division_id')} error={errors.target_division_id}>
                                <option value="">-- Pilih Bidang Tujuan --</option>
                                {divisions?.map(div => (
                                    <option key={div.id} value={div.id}>{div.name}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup label="Keperluan" error={errors.purpose?.message}>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <Briefcase size={18} className="text-slate-400" />
                                </div>
                                <Textarea
                                    rows="3"
                                    className="pl-10"
                                    placeholder="Jelaskan keperluan kunjungan"
                                    {...register('purpose')}
                                    error={errors.purpose}
                                />
                            </div>
                        </FormGroup>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                isLoading={mutation.isPending}
                                className="w-full py-3.5 text-base shadow-sm"
                                icon={Save}
                            >
                                Simpan Kedatangan
                            </Button>
                        </div>
                    </form>

                    {/* Recent Guests Table */}
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Tamu Terakhir Didaftarkan</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-100">
                                        <th className="pb-2 font-medium w-24">Waktu</th>
                                        <th className="pb-2 font-medium">Nama Tamu</th>
                                        <th className="pb-2 font-medium">Instansi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentGuests?.map(guest => (
                                        <tr key={guest.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-2.5 text-slate-500">{guest.check_in_time} WIB</td>
                                            <td className="py-2.5 font-medium text-slate-700">{guest.guest_name}</td>
                                            <td className="py-2.5 text-slate-500">
                                                <span className="line-clamp-1">{guest.agency?.name || '-'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!recentGuests || recentGuests.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="py-4 text-center text-slate-400 italic">Belum ada data tamu</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
