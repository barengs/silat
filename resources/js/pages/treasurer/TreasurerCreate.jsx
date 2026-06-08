import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileUp, Send, CheckCircle2, UserSquare2, AlertCircle, FileText, Landmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from '@/bootstrap';

export default function TreasurerCreate() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDefaults, setIsLoadingDefaults] = useState(true);
    const [isFetchingInfo, setIsFetchingInfo] = useState(false);

    const { user } = useSelector(state => state.auth);

    const [form, setForm] = useState({
        institution_id: user?.institution_id || '',
        change_type: 'both', // 'bendahara', 'rekening', 'both'
        old_treasurer_name: '',
        old_bank_account: '',
        old_npwp: '',
        new_treasurer_name: '',
        new_bank_account: '',
        new_npwp: '',
        bank_name: 'Bank Jatim',
        bank_branch: '',
    });

    useEffect(() => {
        if (user?.institution_id) {
            setForm(prev => ({ ...prev, institution_id: user.institution_id }));
        }
    }, [user]);

    const [files, setFiles] = useState({
        file_sk_kepsek: null,
        file_ktp_npwp: null,
        file_additional: null,
    });

    // Fetch current info to populate Old Data
    useEffect(() => {
        if (!form.institution_id) {
            setForm(prev => ({
                ...prev,
                old_treasurer_name: '',
                old_bank_account: '',
                old_npwp: '',
                bank_name: 'Bank Jatim',
                bank_branch: '',
                new_treasurer_name: '',
                new_bank_account: '',
                new_npwp: '',
            }));
            setIsLoadingDefaults(false);
            return;
        }

        const fetchCurrentInfo = async () => {
            setIsFetchingInfo(true);
            try {
                const res = await axios.get('/treasurer/current-info', {
                    params: { institution_id: form.institution_id }
                });
                setForm(prev => ({
                    ...prev,
                    old_treasurer_name: res.data.treasurer_name,
                    old_bank_account: res.data.bank_account,
                    old_npwp: res.data.npwp,
                    bank_name: res.data.bank_name,
                    bank_branch: res.data.bank_branch,
                    // Pre-fill new values with old values to make editing easier
                    new_treasurer_name: res.data.treasurer_name,
                    new_bank_account: res.data.bank_account,
                    new_npwp: res.data.npwp,
                }));
            } catch (err) {
                console.error('Failed to fetch current treasurer info:', err);
                toast.error('Gagal mengambil data bendahara saat ini.');
            } finally {
                setIsFetchingInfo(false);
                setIsLoadingDefaults(false);
            }
        };
        fetchCurrentInfo();
    }, [form.institution_id]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const { data: institutionsRes } = useQuery({
        queryKey: ['institutions-options'],
        queryFn: async () => {
            const res = await axios.get('/institutions?per_page=1000');
            return res.data;
        },
        enabled: !user?.institution_id,
    });
    const institutions = institutionsRes?.data?.data || [];

    const handleFileChange = (e, key) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran file maksimal adalah 2MB.');
                return;
            }
            setFiles({ ...files, [key]: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (form[key] !== null && form[key] !== undefined) {
                    formData.append(key, form[key]);
                }
            });
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formData.append(key, files[key]);
                }
            });

            const res = await axios.post('/treasurer', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Pengajuan berhasil disimpan sebagai draft.');
            navigate(`/treasurer/${res.data.data.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        // Simple client-side step validation
        if (currentStep === 1) {
            if (!user?.institution_id && !form.institution_id) {
                toast.error('Asal sekolah wajib dipilih.');
                return;
            }
            if (form.change_type !== 'rekening' && !form.new_treasurer_name) {
                toast.error('Nama bendahara baru wajib diisi.');
                return;
            }
        } else if (currentStep === 2) {
            if (form.change_type !== 'bendahara' && !form.new_bank_account) {
                toast.error('Nomor rekening baru wajib diisi.');
                return;
            }
            if (!form.bank_branch) {
                toast.error('Cabang bank wajib diisi.');
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const FileUploadCard = ({ label, desc, fieldName, required }) => (
        <div className="border border-dashed border-slate-300 rounded p-6 text-center hover:border-emerald-600 transition-colors bg-white shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <FileText size={24} className="text-slate-400" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">{label} {required && <span className="text-red-500">*</span>}</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">{desc}</p>
            <div className="relative">
                <input 
                    type="file" 
                    onChange={(e) => handleFileChange(e, fieldName)}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button type="button" className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors w-full sm:w-auto">
                    {files[fieldName] ? files[fieldName].name : 'Pilih File'}
                </button>
            </div>
        </div>
    );

    if (isLoadingDefaults && user?.institution_id) {
        return <div className="p-8 text-center text-slate-500">Memuat data acuan...</div>;
    }

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Formulir Perubahan Data</h1>
                <p className="text-sm text-slate-500 mt-1">Lengkapi formulir di bawah ini untuk mengajukan perubahan data Bendahara dan Rekening Sekolah BOSP. Pastikan dokumen pendukung valid.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Sidebar - Steps Progress */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-6 sticky top-6">
                        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 uppercase tracking-wider">Progres Pengisian</h3>
                        
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                            {[
                                { number: 1, title: 'Data Bendahara', desc: 'Informasi identitas' },
                                { number: 2, title: 'Data Rekening', desc: 'Detail akun bank' },
                                { number: 3, title: 'Unggah Syarat', desc: 'Dokumen legalitas' }
                            ].map(step => (
                                <div key={step.number} className="relative pl-6">
                                    <div className={`absolute w-6 h-6 rounded-full -left-[13px] top-0 flex items-center justify-center font-bold text-xs ring-4 ring-white transition-colors ${
                                        currentStep === step.number 
                                            ? 'bg-emerald-600 text-white' 
                                            : currentStep > step.number 
                                                ? 'bg-emerald-200 text-emerald-800' 
                                                : 'bg-slate-200 text-slate-500'
                                    }`}>
                                        {step.number}
                                    </div>
                                    <h4 className={`text-xs font-bold leading-tight ${currentStep === step.number ? 'text-slate-800 font-extrabold' : 'text-slate-500'}`}>{step.title}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Area - Form Content */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Selector Jenis Perubahan (Langkah 1 saja) */}
                        {currentStep === 1 && (
                            <>
                                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4">Asal Sekolah</h3>
                                    <div className="md:col-span-2">
                                        {user?.institution_id ? (
                                            <input
                                                type="text"
                                                value={user?.institution?.name || ''}
                                                disabled
                                                className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-100 text-slate-500 text-sm"
                                            />
                                        ) : (
                                            <>
                                                <select
                                                    name="institution_id"
                                                    value={form.institution_id}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-amber-50"
                                                >
                                                    <option value="">-- Pilih Sekolah --</option>
                                                    {institutions.filter(i => i.type.startsWith('sekolah')).map(inst => (
                                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-amber-600 mt-2 font-medium">Sebagai admin, Anda harus memilih asal sekolah untuk pengajuan ini.</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4">Pilih Jenis Pengajuan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { val: 'bendahara', label: 'Pergantian Bendahara', desc: 'Mengajukan penggantian nama pejabat bendahara.' },
                                        { val: 'rekening', label: 'Perubahan Nama Rekening', desc: 'Mengajukan perubahan nama pemegang rekening.' },
                                        { val: 'both', label: 'Keduanya', desc: 'Pergantian bendahara sekaligus nama rekening.' }
                                    ].map(type => (
                                        <label key={type.val} className={`border rounded p-4 cursor-pointer flex flex-col justify-between transition-colors ${
                                            form.change_type === type.val 
                                                ? 'border-emerald-600 bg-emerald-50/20' 
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="radio" 
                                                    name="change_type" 
                                                    value={type.val} 
                                                    checked={form.change_type === type.val}
                                                    onChange={handleInputChange}
                                                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                                />
                                                <span className="font-bold text-xs text-slate-800">{type.label}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-2">{type.desc}</p>
                                        </label>
                                    ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 1: Data Bendahara */}
                        {currentStep === 1 && (
                            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                                <h3 className="flex items-center text-sm font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
                                    <UserSquare2 size={18} className="mr-2 text-emerald-600" />
                                    Data Bendahara
                                </h3>
                                
                                {form.change_type === 'rekening' ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 flex items-center gap-2 mb-4">
                                        <AlertCircle size={16} className="text-slate-500 shrink-0" />
                                        <span>Perubahan nama pemegang rekening tidak mengubah pejabat bendahara utama. Langkah ini akan dilewati.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Bendahara Lama */}
                                        <div className="bg-slate-50/50 border border-slate-200 rounded p-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Bendahara Lama {isFetchingInfo && <span className="text-[10px] text-emerald-600 lowercase font-normal ml-2">(memuat...)</span>}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Bendahara</label>
                                                    <input 
                                                        type="text" 
                                                        name="old_treasurer_name"
                                                        value={form.old_treasurer_name} 
                                                        onChange={handleInputChange}
                                                        placeholder="Masukkan nama bendahara lama"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" 
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">NPWP Bendahara</label>
                                                    <input 
                                                        type="text" 
                                                        name="old_npwp"
                                                        value={form.old_npwp} 
                                                        onChange={handleInputChange}
                                                        placeholder="Contoh: 01.234.567.8-901.000"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" 
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bendahara Baru */}
                                        <div className="border border-slate-200 rounded p-4">
                                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Bendahara Baru</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Nama Bendahara Baru <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        name="new_treasurer_name"
                                                        value={form.new_treasurer_name} 
                                                        onChange={handleInputChange}
                                                        placeholder="Masukkan nama lengkap beserta gelar"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        required={form.change_type !== 'rekening'}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">NPWP Bendahara Baru <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        name="new_npwp"
                                                        value={form.new_npwp} 
                                                        onChange={handleInputChange}
                                                        placeholder="Contoh: 01.234.567.8-901.000"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        required={form.change_type !== 'rekening'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Data Rekening */}
                        {currentStep === 2 && (
                            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                                <h3 className="flex items-center text-sm font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
                                    <Landmark size={18} className="mr-2 text-emerald-600" />
                                    Data Rekening Bank
                                </h3>

                                <div className="space-y-6">
                                    {/* Nama Bank */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Nama Bank Pilihan <span className="text-red-500">*</span></label>
                                            <select
                                                name="bank_name"
                                                value={form.bank_name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                                                required
                                            >
                                                <option value="Bank Jatim">Bank Jatim</option>
                                                <option value="BRI">BRI</option>
                                                <option value="BNI">BNI</option>
                                                <option value="Mandiri">Bank Mandiri</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Kantor Cabang Bank <span className="text-red-500">*</span></label>
                                            <input 
                                                type="text" 
                                                name="bank_branch"
                                                value={form.bank_branch} 
                                                onChange={handleInputChange}
                                                placeholder="Contoh: Cabang Pamekasan"
                                                className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Rekening Lama */}
                                    <div className="bg-slate-50/50 border border-slate-200 rounded p-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Data Rekening Lama {isFetchingInfo && <span className="text-[10px] text-emerald-600 lowercase font-normal ml-2">(memuat...)</span>}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Nomor Rekening Lama</label>
                                                <input 
                                                    type="text" 
                                                    name="old_bank_account"
                                                    value={form.old_bank_account} 
                                                    onChange={handleInputChange}
                                                    placeholder="Masukkan nomor rekening lama"
                                                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Nama Pemegang Rekening</label>
                                                <input 
                                                    type="text" 
                                                    value={form.old_treasurer_name} 
                                                    disabled 
                                                    className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded text-xs text-slate-500" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rekening Baru */}
                                    {form.change_type === 'bendahara' ? (
                                        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-600 flex items-center gap-2">
                                            <AlertCircle size={16} className="text-slate-500 shrink-0" />
                                            <span>Nomor rekening tidak berubah (hanya pergantian nama pejabat bendahara). Langkah ini akan menggunakan nomor rekening yang sama.</span>
                                        </div>
                                    ) : (
                                        <div className="border border-slate-200 rounded p-4">
                                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Data Rekening Baru / Nama Pemegang Baru</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Nomor Rekening Baru <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        name="new_bank_account"
                                                        value={form.new_bank_account} 
                                                        onChange={handleInputChange}
                                                        placeholder="Masukkan nomor rekening baru"
                                                        className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                                                        required={form.change_type !== 'bendahara'}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Nama Pemegang Rekening Baru <span className="text-red-500">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        name={form.change_type === 'rekening' ? "new_treasurer_name" : undefined}
                                                        value={form.new_treasurer_name} 
                                                        onChange={form.change_type === 'rekening' ? handleInputChange : undefined}
                                                        disabled={form.change_type !== 'rekening'}
                                                        className={`w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 ${form.change_type !== 'rekening' ? 'bg-slate-100 text-slate-500' : ''}`}
                                                        placeholder="Masukkan nama pemegang rekening baru"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Unggah Syarat */}
                        {currentStep === 3 && (
                            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                                <h3 className="flex items-center text-sm font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
                                    <FileUp size={18} className="mr-2 text-emerald-600" />
                                    Unggah Berkas Persyaratan
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(form.change_type === 'bendahara' || form.change_type === 'both') && (
                                        <>
                                            <FileUploadCard 
                                                label="SK Kepala Sekolah"
                                                desc="SK Penunjukan Bendahara Baru. Format PDF, Maks 2MB"
                                                fieldName="file_sk_kepsek"
                                                required={true}
                                            />
                                            <FileUploadCard 
                                                label="KTP & NPWP Bendahara"
                                                desc="Scan KTP dan NPWP Bendahara Baru. Format PDF/JPG, Maks 2MB"
                                                fieldName="file_ktp_npwp"
                                                required={true}
                                            />
                                        </>
                                    )}
                                    <FileUploadCard 
                                        label="Buku Rekening Lama"
                                        desc="Scan Halaman Depan Buku Rekening. Format PDF/JPG, Maks 2MB"
                                        fieldName="file_additional"
                                        required={form.change_type === 'rekening'}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Actions */}
                        <div className="flex justify-between items-center pt-4">
                            {currentStep > 1 ? (
                                <button 
                                    type="button" 
                                    onClick={prevStep}
                                    className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded transition-colors"
                                >
                                    Kembali
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/treasurer')}
                                    className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded transition-colors"
                                >
                                    Batal
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button 
                                    type="button" 
                                    onClick={nextStep}
                                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors"
                                >
                                    Selanjutnya
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-spin border-2 border-white/20 border-t-white h-4 w-4 rounded-full mr-2" />
                                    ) : (
                                        <Send size={14} className="mr-2" />
                                    )}
                                    Simpan Draft Pengajuan
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
