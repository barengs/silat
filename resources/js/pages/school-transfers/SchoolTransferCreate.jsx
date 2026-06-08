import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileUp, Send, CheckCircle2, UserCircle, AlertCircle, FileText, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from '@/bootstrap';

export default function SchoolTransferCreate() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useSelector(state => state.auth);

    const [form, setForm] = useState({
        institution_id: user?.institution_id || '',
        student_name: '',
        nisn: '',
        gender: 'Laki-laki',
        grade: '',
        target_school: '',
        target_school_address: '',
        reason: '',
    });

    useEffect(() => {
        if (user?.institution_id) {
            setForm(prev => ({ ...prev, institution_id: user.institution_id }));
        }
    }, [user]);

    const [files, setFiles] = useState({
        file_request_letter: null,
        file_report_card: null,
        file_mutation_letter: null,
        file_additional: null,
    });

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
                formData.append(key, form[key]);
            });
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formData.append(key, files[key]);
                }
            });

            const res = await axios.post('/school-transfers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Pengajuan berhasil disimpan sebagai draft.');
            navigate(`/school-transfers/${res.data.data.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!user?.institution_id && !form.institution_id) {
                toast.error('Asal sekolah wajib dipilih.');
                return;
            }
            if (!form.student_name.trim()) {
                toast.error('Nama siswa wajib diisi.');
                return;
            }
            if (!form.nisn.trim()) {
                toast.error('NISN siswa wajib diisi.');
                return;
            }
            if (!form.grade.trim()) {
                toast.error('Kelas / tingkat siswa wajib diisi.');
                return;
            }
            if (!form.target_school.trim()) {
                toast.error('Sekolah tujuan wajib diisi.');
                return;
            }
            if (!form.target_school_address.trim()) {
                toast.error('Alamat sekolah tujuan wajib diisi.');
                return;
            }
            if (!form.reason.trim()) {
                toast.error('Alasan mutasi sekolah wajib diisi.');
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const FileUploadCard = ({ label, desc, fieldName, required }) => (
        <div className="border border-dashed border-slate-300 rounded p-6 text-center hover:border-slate-800 transition-colors bg-white shadow-sm">
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

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Pengajuan Mutasi Siswa</h1>
                <p className="text-sm text-slate-500 mt-1">Lengkapi formulir di bawah ini untuk mengajukan permohonan mutasi sekolah siswa. Pastikan semua berkas pendukung sudah benar.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Sidebar - Steps Progress */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-6 sticky top-6">
                        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 uppercase tracking-wider">Progres Pengisian</h3>
                        
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                            {[
                                { number: 1, title: 'Biodata & Tujuan', desc: 'Siswa & Sekolah Tujuan' },
                                { number: 2, title: 'Unggah Berkas', desc: 'Dokumen administrasi' }
                            ].map(step => (
                                <div key={step.number} className="relative pl-6">
                                    <div className={`absolute w-6 h-6 rounded-full -left-[13px] top-0 flex items-center justify-center font-bold text-xs ring-4 ring-white transition-colors ${
                                        currentStep === step.number 
                                            ? 'bg-slate-900 text-white' 
                                            : currentStep > step.number 
                                                ? 'bg-slate-200 text-slate-800' 
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
                        
                        {/* Step 1: Biodata & Tujuan */}
                        {currentStep === 1 && (
                            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-6">
                                <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Biodata Siswa & Sekolah Tujuan</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Asal Sekolah <span className="text-red-500">*</span></label>
                                        {user?.institution_id ? (
                                            <input
                                                type="text"
                                                value={user?.institution?.name || ''}
                                                disabled
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded bg-slate-100 text-slate-500"
                                            />
                                        ) : (
                                            <>
                                                <select
                                                    name="institution_id"
                                                    value={form.institution_id}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 bg-amber-50"
                                                >
                                                    <option value="">-- Pilih Sekolah --</option>
                                                    {institutions.filter(i => i.type.startsWith('sekolah')).map(inst => (
                                                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-amber-600 mt-1 font-medium">Sebagai admin, Anda harus memilih asal sekolah untuk pengajuan ini.</p>
                                            </>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Lengkap Siswa <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="student_name"
                                            value={form.student_name}
                                            onChange={handleInputChange}
                                            placeholder="Masukkan nama lengkap siswa"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">NISN Siswa <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="nisn"
                                            value={form.nisn}
                                            onChange={handleInputChange}
                                            placeholder="Masukkan NISN siswa"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jenis Kelamin <span className="text-red-500">*</span></label>
                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                        >
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Kelas / Tingkat <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="grade"
                                            value={form.grade}
                                            onChange={handleInputChange}
                                            placeholder="Contoh: X, XI, XII"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Sekolah Tujuan <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="target_school"
                                            value={form.target_school}
                                            onChange={handleInputChange}
                                            placeholder="Masukkan nama instansi sekolah tujuan pindah"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Alamat Sekolah Tujuan <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="target_school_address"
                                            value={form.target_school_address}
                                            onChange={handleInputChange}
                                            placeholder="Masukkan alamat lengkap sekolah tujuan"
                                            rows="3"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Alasan Mutasi Sekolah <span className="text-red-500">*</span></label>
                                        <textarea
                                            name="reason"
                                            value={form.reason}
                                            onChange={handleInputChange}
                                            placeholder="Sebutkan alasan mutasi siswa tersebut..."
                                            rows="3"
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Unggah Berkas */}
                        {currentStep === 2 && (
                            <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-6">
                                <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Unggah Berkas Pendukung</h3>
                                
                                <div className="bg-amber-50 border border-amber-200 rounded p-4 flex gap-3 text-amber-800">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-xs">Ketentuan Unggah Berkas:</h4>
                                        <p className="text-[11px] mt-1">Format file yang diperbolehkan adalah PDF, JPG, JPEG, atau PNG dengan ukuran maksimal 2MB per berkas. Pastikan dokumen terbaca dengan jelas.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FileUploadCard 
                                        label="Surat Permohonan Ortu" 
                                        desc="Surat permohonan pindah dari orang tua siswa / wali."
                                        fieldName="file_request_letter"
                                        required={true}
                                    />
                                    <FileUploadCard 
                                        label="Scan Raport Terakhir" 
                                        desc="Scan raport terakhir lembar biodata dan nilai terbaru."
                                        fieldName="file_report_card"
                                        required={true}
                                    />
                                    <FileUploadCard 
                                        label="Surat Mutasi Sekolah Asal" 
                                        desc="Surat keterangan mutasi sekolah resmi dari sekolah asal."
                                        fieldName="file_mutation_letter"
                                        required={true}
                                    />
                                    <FileUploadCard 
                                        label="Berkas Tambahan" 
                                        desc="Berkas penunjang lainnya seperti KK / Akte Kelahiran (opsional)."
                                        fieldName="file_additional"
                                        required={false}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded px-6 py-4">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
                                >
                                    Sebelumnya
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => navigate('/school-transfers')}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded transition-colors"
                                >
                                    Batal
                                </button>
                            )}

                            {currentStep < 2 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors"
                                >
                                    Selanjutnya
                                    <ArrowRight size={14} className="ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !files.file_request_letter || !files.file_report_card || !files.file_mutation_letter}
                                    className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                                    <Save size={14} className="ml-2" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
