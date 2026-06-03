import React, { useState } from 'react';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { X, UploadCloud, Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function ImportUserModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/api/users/template';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Silakan pilih file Excel terlebih dahulu');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            await axios.post('/users/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Data pengguna berhasil diimpor');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat mengimpor data');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Import Data Pengguna"
        >
            <form onSubmit={handleSubmit} className="p-2">
                    <div className="mb-6 space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                            <p className="font-medium mb-1">Panduan Import:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700/80 text-xs">
                                <li>Gunakan format file <strong>.xlsx</strong> atau <strong>.xls</strong></li>
                                <li>Pastikan menggunakan template yang telah disediakan</li>
                                <li>NIP akan otomatis digunakan sebagai Password awal</li>
                            </ul>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="mt-3 inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                            >
                                <Download size={14} className="mr-1" /> Unduh Template Excel
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Pilih File Excel</label>
                            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center">
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isUploading}
                                />
                                <UploadCloud size={32} className="text-slate-400 mb-2" />
                                {file ? (
                                    <span className="text-sm font-medium text-teal-600">{file.name}</span>
                                ) : (
                                    <span className="text-sm text-slate-500">Klik atau seret file ke sini</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isUploading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={!file}
                            isLoading={isUploading}
                            icon={UploadCloud}
                        >
                            Import Data
                        </Button>
                    </div>
                </form>
        </Modal>
    );
}
