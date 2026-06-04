import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { 
    Settings, 
    Building, 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    UserCheck, 
    FileText, 
    Loader2, 
    Upload,
    Save
} from 'lucide-react';

export default function SystemSettings() {
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState('umum');

    // Fetch Settings
    const { data: settingsData, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await axios.get('/settings');
            return res.data.data;
        }
    });

    // Form states
    const [formData, setFormData] = useState({});

    // Populate form data once settings are fetched
    useEffect(() => {
        if (settingsData) {
            const initialForm = {};
            settingsData.forEach(item => {
                initialForm[item.setting_key] = item.setting_value || '';
            });
            setFormData(initialForm);
        }
    }, [settingsData]);

    // Update Settings Mutation
    const updateSettingsMutation = useMutation({
        mutationFn: async (updatedSettings) => {
            const res = await axios.put('/settings', { settings: updatedSettings });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Pengaturan berhasil diperbarui');
            queryClient.invalidateQueries(['settings']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan');
        }
    });

    // Upload Logo Mutation
    const uploadLogoMutation = useMutation({
        mutationFn: async ({ key, file }) => {
            const form = new FormData();
            form.append('key', key);
            form.append('image', file);
            const res = await axios.post('/settings/logo', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Logo berhasil diperbarui');
            queryClient.invalidateQueries(['settings']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mengunggah logo');
        }
    });

    const handleInputChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSettingsMutation.mutate(formData);
    };

    const handleLogoUpload = (key, e) => {
        const file = e.target.files[0];
        if (file) {
            uploadLogoMutation.mutate({ key, file });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    const sections = [
        { id: 'umum', label: 'Umum & Branding', icon: Settings },
        { id: 'dinas', label: 'Info Instansi', icon: Building },
        { id: 'pejabat', label: 'Pejabat Dinas', icon: UserCheck },
        { id: 'sppd', label: 'SPPD & Dokumen', icon: FileText },
    ];

    const getLogoUrl = (key) => {
        const logoPath = settingsData?.find(item => item.setting_key === key)?.setting_value;
        if (!logoPath) return null;
        return logoPath.startsWith('http') ? logoPath : `/storage/${logoPath}`;
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
                <p className="text-slate-500 text-sm mt-1">Konfigurasi parameter global dinas, kepala instansi, logo, dan setelan dokumen resmi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                {/* Left Navigation */}
                <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden flex flex-col md:col-span-1">
                    {sections.map(sec => {
                        const Icon = sec.icon;
                        return (
                            <button
                                key={sec.id}
                                onClick={() => setActiveSection(sec.id)}
                                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-semibold border-l-4 transition-all text-left ${
                                    activeSection === sec.id 
                                        ? 'border-teal-600 bg-teal-50/50 text-teal-800' 
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                            >
                                <Icon size={16} />
                                {sec.label}
                            </button>
                        );
                    })}
                </div>

                {/* Right Form Area */}
                <div className="bg-white rounded border border-slate-200 shadow-sm p-6 md:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* UMUM SECTION */}
                        {activeSection === 'umum' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 border-slate-100">Setelan Umum & Branding</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Nama Aplikasi</label>
                                        <input 
                                            type="text" 
                                            value={formData.app_name || ''} 
                                            onChange={(e) => handleInputChange('app_name', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Tagline Aplikasi</label>
                                        <input 
                                            type="text" 
                                            value={formData.app_tagline || ''} 
                                            onChange={(e) => handleInputChange('app_tagline', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    {/* Logo Aplikasi */}
                                    <div className="space-y-2 border border-slate-100 p-4 rounded bg-slate-50/50 flex flex-col items-center">
                                        <label className="text-xs font-bold text-slate-700 uppercase text-center block mb-2">Logo Aplikasi</label>
                                        <div className="w-20 h-20 bg-white border border-slate-200 rounded flex items-center justify-center p-2 overflow-hidden shadow-inner">
                                            {getLogoUrl('app_logo') ? (
                                                <img src={getLogoUrl('app_logo')} alt="Logo App" className="max-h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-400 text-[10px] italic">No Logo</span>
                                            )}
                                        </div>
                                        <label className="mt-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                                            <Upload size={12} />
                                            Ganti Logo
                                            <input type="file" onChange={(e) => handleLogoUpload('app_logo', e)} className="hidden" accept="image/*" />
                                        </label>
                                    </div>

                                    {/* Logo Dinas */}
                                    <div className="space-y-2 border border-slate-100 p-4 rounded bg-slate-50/50 flex flex-col items-center">
                                        <label className="text-xs font-bold text-slate-700 uppercase text-center block mb-2">Logo Dinas</label>
                                        <div className="w-20 h-20 bg-white border border-slate-200 rounded flex items-center justify-center p-2 overflow-hidden shadow-inner">
                                            {getLogoUrl('dinas_logo') ? (
                                                <img src={getLogoUrl('dinas_logo')} alt="Logo Dinas" className="max-h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-400 text-[10px] italic">No Logo</span>
                                            )}
                                        </div>
                                        <label className="mt-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                                            <Upload size={12} />
                                            Ganti Logo
                                            <input type="file" onChange={(e) => handleLogoUpload('dinas_logo', e)} className="hidden" accept="image/*" />
                                        </label>
                                    </div>

                                    {/* Logo Kabupaten */}
                                    <div className="space-y-2 border border-slate-100 p-4 rounded bg-slate-50/50 flex flex-col items-center">
                                        <label className="text-xs font-bold text-slate-700 uppercase text-center block mb-2">Logo Kabupaten</label>
                                        <div className="w-20 h-20 bg-white border border-slate-200 rounded flex items-center justify-center p-2 overflow-hidden shadow-inner">
                                            {getLogoUrl('kabupaten_logo') ? (
                                                <img src={getLogoUrl('kabupaten_logo')} alt="Logo Kab" className="max-h-full object-contain" />
                                            ) : (
                                                <span className="text-slate-400 text-[10px] italic">No Logo</span>
                                            )}
                                        </div>
                                        <label className="mt-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                                            <Upload size={12} />
                                            Ganti Logo
                                            <input type="file" onChange={(e) => handleLogoUpload('kabupaten_logo', e)} className="hidden" accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* INFO INSTANSI SECTION */}
                        {activeSection === 'dinas' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 border-slate-100">Informasi Kantor Dinas</h3>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Nama Lengkap Dinas</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="text" 
                                            value={formData.dinas_name || ''} 
                                            onChange={(e) => handleInputChange('dinas_name', e.target.value)} 
                                            className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Alamat Kantor Lengkap</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                        <textarea 
                                            rows="3"
                                            value={formData.dinas_address || ''} 
                                            onChange={(e) => handleInputChange('dinas_address', e.target.value)} 
                                            className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Telepon Kantor</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input 
                                                type="text" 
                                                value={formData.dinas_phone || ''} 
                                                onChange={(e) => handleInputChange('dinas_phone', e.target.value)} 
                                                className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Email Resmi</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input 
                                                type="email" 
                                                value={formData.dinas_email || ''} 
                                                onChange={(e) => handleInputChange('dinas_email', e.target.value)} 
                                                className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Website Resmi</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input 
                                                type="text" 
                                                value={formData.dinas_website || ''} 
                                                onChange={(e) => handleInputChange('dinas_website', e.target.value)} 
                                                className="pl-10 w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PEJABAT DINAS SECTION */}
                        {activeSection === 'pejabat' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 border-slate-100">Konfigurasi Kepala Dinas</h3>
                                <p className="text-xs text-slate-500">Nama dan NIP Kepala Dinas di bawah ini akan digunakan secara otomatis pada berkas PDF dinas resmi yang diterbitkan oleh sistem.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Nama Kepala Dinas</label>
                                        <input 
                                            type="text" 
                                            value={formData.kepala_dinas_name || ''} 
                                            onChange={(e) => handleInputChange('kepala_dinas_name', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="Nama lengkap + gelar"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">NIP Kepala Dinas</label>
                                        <input 
                                            type="text" 
                                            value={formData.kepala_dinas_nip || ''} 
                                            onChange={(e) => handleInputChange('kepala_dinas_nip', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="Masukkan NIP resmi"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SPPD & DOKUMEN SECTION */}
                        {activeSection === 'sppd' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2 border-slate-100">Setelan Dokumen & SPPD</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Prefiks Nomor SPPD</label>
                                        <input 
                                            type="text" 
                                            value={formData.sppd_number_prefix || ''} 
                                            onChange={(e) => handleInputChange('sppd_number_prefix', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Kode Kantor Instansi (SPPD)</label>
                                        <input 
                                            type="text" 
                                            value={formData.sppd_office_code || ''} 
                                            onChange={(e) => handleInputChange('sppd_office_code', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Jam Masuk Kantor</label>
                                        <input 
                                            type="text" 
                                            value={formData.office_hours_start || ''} 
                                            onChange={(e) => handleInputChange('office_hours_start', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="Contoh: 07:30"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Jam Pulang Kantor</label>
                                        <input 
                                            type="text" 
                                            value={formData.office_hours_end || ''} 
                                            onChange={(e) => handleInputChange('office_hours_end', e.target.value)} 
                                            className="w-full border border-slate-200 rounded p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="Contoh: 16:00"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end border-t pt-4 border-slate-100">
                            <button
                                type="submit"
                                disabled={updateSettingsMutation.isPending}
                                className="px-6 py-2.5 bg-teal-600 text-white rounded font-semibold text-sm hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm"
                            >
                                {updateSettingsMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Save size={16} />
                                )}
                                Simpan Setelan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
