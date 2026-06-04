import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import {
    PenTool,
    Upload,
    Trash2,
    User,
    Shield,
    Image as ImageIcon,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import SkeletonCard from '@/components/ui/SkeletonCard';

export default function SignatureVault() {
    const queryClient = useQueryClient();
    const [uploadModal, setUploadModal] = useState(null); // userId or null
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch signers list
    const { data: signers, isLoading } = useQuery({
        queryKey: ['signatures'],
        queryFn: async () => {
            const res = await axios.get('/api/signatures');
            return res.data.data;
        },
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async ({ userId, file }) => {
            const formData = new FormData();
            formData.append('signature', file);
            return await axios.post(`/api/signatures/${userId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            toast.success('Tanda tangan berhasil diunggah.');
            queryClient.invalidateQueries(['signatures']);
            closeModal();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mengunggah tanda tangan.');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (userId) => {
            return await axios.delete(`/api/signatures/${userId}`);
        },
        onSuccess: () => {
            toast.success('Tanda tangan berhasil dihapus.');
            queryClient.invalidateQueries(['signatures']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal menghapus tanda tangan.');
        },
    });

    const openUploadModal = (userId) => {
        setUploadModal(userId);
        setPreviewFile(null);
        setPreviewUrl(null);
    };

    const closeModal = () => {
        setUploadModal(null);
        setPreviewFile(null);
        setPreviewUrl(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/png') {
            toast.error('Hanya file PNG yang diperbolehkan.');
            return;
        }
        if (file.size > 1024 * 1024) {
            toast.error('Ukuran file maksimal 1MB.');
            return;
        }

        setPreviewFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUploadSubmit = () => {
        if (!previewFile || !uploadModal) return;
        uploadMutation.mutate({ userId: uploadModal, file: previewFile });
    };

    const handleDelete = (userId, name) => {
        if (window.confirm(`Hapus tanda tangan ${name}?`)) {
            deleteMutation.mutate(userId);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'kadis': return <Shield size={14} className="text-emerald-600" />;
            case 'sekretaris': return <User size={14} className="text-blue-600" />;
            case 'kabid': return <User size={14} className="text-indigo-600" />;
            default: return <User size={14} className="text-slate-600" />;
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'kadis': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'sekretaris': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'kabid': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tanda Tangan Pejabat</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Kelola tanda tangan elektronik (TTE) pejabat yang digunakan pada dokumen resmi.
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4 mb-8 flex items-start gap-3">
                <AlertCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-semibold text-emerald-800">Tentang Tanda Tangan Elektronik (TTE)</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        Gambar tanda tangan yang diunggah akan disematkan secara otomatis pada dokumen PDF yang diterbitkan melalui sistem ini 
                        (SPPD, Surat Rekomendasi, dll). Gunakan file PNG dengan background transparan untuk hasil terbaik. Maksimal ukuran file: 1MB.
                    </p>
                </div>
            </div>

            {/* Signers Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
                            <SkeletonCard width="60%" height="1rem" />
                            <SkeletonCard width="40%" height="0.75rem" />
                            <SkeletonCard width="100%" height="6rem" />
                            <SkeletonCard width="50%" height="2rem" />
                        </div>
                    ))}
                </div>
            ) : signers?.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
                    <PenTool size={36} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-500">Belum ada pejabat yang terdaftar dengan hak tanda tangan.</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Pastikan pengguna sudah ditambahkan dengan role <strong>Kadis</strong>, <strong>Sekretaris</strong>, atau <strong>Kabid</strong>.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {signers?.map(signer => (
                        <div key={signer.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            {/* Card Header */}
                            <div className="p-5 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                                        {signer.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-slate-800 truncate">{signer.name}</h3>
                                        <p className="text-xs text-slate-500">NIP: {signer.nip || '-'}</p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeColor(signer.role)}`}>
                                        {getRoleIcon(signer.role)}
                                        {signer.role_label}
                                    </span>
                                </div>
                            </div>

                            {/* Signature Preview */}
                            <div className="p-5">
                                {signer.has_signature ? (
                                    <div className="space-y-3">
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-center min-h-[100px]"
                                            style={{ backgroundImage: 'repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' }}
                                        >
                                            <img
                                                src={signer.signature_url}
                                                alt={`Tanda tangan ${signer.name}`}
                                                className="max-h-20 max-w-full object-contain"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                            <span className="text-[10px] font-semibold text-emerald-600">Tanda tangan aktif</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openUploadModal(signer.id)}
                                                className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <Upload size={12} />
                                                Ganti
                                            </button>
                                            <button
                                                onClick={() => handleDelete(signer.id, signer.name)}
                                                disabled={deleteMutation.isLoading}
                                                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Trash2 size={12} />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center min-h-[100px]">
                                            <ImageIcon size={24} className="text-slate-300 mb-2" />
                                            <p className="text-xs text-slate-400 text-center">Belum ada tanda tangan</p>
                                        </div>
                                        <button
                                            onClick={() => openUploadModal(signer.id)}
                                            className="w-full px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Upload size={12} />
                                            Unggah Tanda Tangan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {uploadModal && (
                <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 text-sm">Unggah Tanda Tangan</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="text-xs text-slate-500 space-y-1">
                                <p>• Format file: <strong>PNG</strong> (background transparan)</p>
                                <p>• Ukuran maksimal: <strong>1MB</strong></p>
                                <p>• Resolusi yang disarankan: <strong>300x150 px</strong></p>
                            </div>

                            {/* Preview Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors min-h-[120px] flex flex-col items-center justify-center"
                                style={previewUrl ? { backgroundImage: 'repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%)', backgroundSize: '16px 16px' } : {}}
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-h-24 max-w-full object-contain"
                                    />
                                ) : (
                                    <>
                                        <Upload size={24} className="text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-500 font-medium">Klik untuk memilih file</p>
                                        <p className="text-[10px] text-slate-400 mt-1">atau seret file ke area ini</p>
                                    </>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {previewFile && (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded px-3 py-2">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <span className="text-xs text-emerald-700 font-medium truncate flex-1">{previewFile.name}</span>
                                    <span className="text-[10px] text-emerald-500">{(previewFile.size / 1024).toFixed(0)} KB</span>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                disabled={!previewFile || uploadMutation.isLoading}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploadMutation.isLoading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Upload size={14} />
                                )}
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
