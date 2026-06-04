import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileUp, Save, Send, UserSquare2, AlertCircle, FileText } from 'lucide-react';
import axios from '@/bootstrap';
import { useSelector } from 'react-redux';

export default function IjazahCreate() {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        student_name: '',
        nisn: '',
        graduation_year: '',
        education_level: 'SMA',
        wrong_data_description: '',
        correct_data_description: '',
    });

    const [files, setFiles] = useState({
        file_ijazah_wrong: null,
        file_akte: null,
        file_kk: null,
        file_sptjm: null,
    });

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, key) => {
        if (e.target.files && e.target.files[0]) {
            setFiles({ ...files, [key]: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formData.append(key, files[key]);
                }
            });

            await axios.post('/api/ijazah-revisions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success('Pengajuan revisi ijazah berhasil dikirim.');
            navigate('/ijazah');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengirim pengajuan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const FileUploadCard = ({ label, desc, fieldName, accept }) => (
        <div className="border border-dashed border-slate-300 rounded p-6 text-center hover:border-emerald-500 transition-colors bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <FileText size={24} className="text-slate-400" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">{label}</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">{desc}</p>
            <div className="relative">
                <input 
                    type="file" 
                    onChange={(e) => handleFileChange(e, fieldName)}
                    accept={accept}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={fieldName !== 'file_additional'}
                />
                <button type="button" className="px-4 py-2 bg-white border border-emerald-600 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-50 transition-colors w-full sm:w-auto">
                    {files[fieldName] ? files[fieldName].name : 'Pilih File'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Form Pengajuan Revisi Ijazah</h1>
                <p className="text-sm text-slate-500 mt-1">Lengkapi data berikut untuk mengajukan permohonan revisi kesalahan data pada Ijazah.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Data Siswa */}
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                    <h3 className="flex items-center text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                        <UserSquare2 size={18} className="mr-2 text-emerald-600" />
                        Data Siswa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap (Sesuai Ijazah)</label>
                            <input 
                                type="text"
                                name="student_name"
                                value={form.student_name}
                                onChange={handleInputChange}
                                placeholder="Masukkan nama lengkap"
                                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">NISN</label>
                            <input 
                                type="text"
                                name="nisn"
                                value={form.nisn}
                                onChange={handleInputChange}
                                placeholder="Masukkan Nomor Induk Siswa Nasional"
                                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Tahun Lulus</label>
                            <select
                                name="graduation_year"
                                value={form.graduation_year}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                required
                            >
                                <option value="">Pilih tahun lulus</option>
                                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Tingkat Pendidikan</label>
                            <select
                                name="education_level"
                                value={form.education_level}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                required
                            >
                                <option value="SMA">SMA</option>
                                <option value="SMK">SMK</option>
                                <option value="PKBM">PKBM / Kesetaraan</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Detail Kesalahan Data */}
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                    <h3 className="flex items-center text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                        <AlertCircle size={18} className="mr-2 text-emerald-600" />
                        Detail Kesalahan Data
                    </h3>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
                            <div>
                                <label className="block text-xs font-medium text-red-600 mb-1">Data Salah (Tertulis di Ijazah)</label>
                                <input 
                                    type="text"
                                    name="wrong_data_description"
                                    value={form.wrong_data_description}
                                    onChange={handleInputChange}
                                    placeholder="Misal: Budi Santoso"
                                    className="w-full px-3 py-2 border border-red-200 bg-red-50/30 rounded text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                            </div>
                            <div className="hidden md:flex justify-center text-slate-400 pt-5">
                                →
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-emerald-700 mb-1">Data Benar (Seharusnya)</label>
                                <input 
                                    type="text"
                                    name="correct_data_description"
                                    value={form.correct_data_description}
                                    onChange={handleInputChange}
                                    placeholder="Misal: Budi Santoso, S.Pd"
                                    className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50/30 rounded text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Berkas Pendukung */}
                <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                    <h3 className="flex items-center text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                        <FileUp size={18} className="mr-2 text-emerald-600" />
                        Unggah Berkas Pendukung
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileUploadCard 
                            label="Scan Ijazah Asli" 
                            desc="Format PDF/JPG, Maks 2MB"
                            fieldName="file_ijazah_wrong"
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <FileUploadCard 
                            label="Akte Kelahiran" 
                            desc="Format PDF/JPG, Maks 2MB"
                            fieldName="file_akte"
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <FileUploadCard 
                            label="Kartu Keluarga (KK)" 
                            desc="Format PDF/JPG, Maks 2MB"
                            fieldName="file_kk"
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <FileUploadCard 
                            label="Surat Pernyataan (SPTJM)" 
                            desc="Bermaterai 10.000. Format PDF, Maks 2MB"
                            fieldName="file_sptjm"
                            accept=".pdf"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button 
                        type="button" 
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="inline-flex items-center px-6 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="animate-spin border-2 border-white/20 border-t-white h-4 w-4 rounded-full mr-2" />
                        ) : (
                            <Send size={16} className="mr-2" />
                        )}
                        Kirim Pengajuan
                    </button>
                </div>
            </form>
        </div>
    );
}
