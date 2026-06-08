import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { toast } from 'sonner';
import { 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    FileText, 
    Clock, 
    Printer,
    Download,
    CheckSquare,
    AlertCircle,
    UserSquare2,
    Send
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function TreasurerShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, roles } = useSelector(state => state.auth);

    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState('approve'); // 'approve', 'reject'
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [note, setNote] = useState('');

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['treasurer', id],
        queryFn: async () => {
            const res = await axios.get(`/treasurer/${id}`);
            return res.data;
        }
    });

    const change = responseData?.data;
    const approvalMeta = responseData?.approval_meta;

    const submitMutation = useMutation({
        mutationFn: async () => {
            return await axios.post(`/treasurer/${id}/submit`);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            queryClient.invalidateQueries(['treasurer', id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mengirim pengajuan.');
        }
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, payload }) => {
            return await axios.post(`/treasurer/${id}/${action}`, payload);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            setIsActionModalOpen(false);
            setNote('');
            queryClient.invalidateQueries(['treasurer', id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan.');
        }
    });

    const handleActionSubmit = (e) => {
        e.preventDefault();
        actionMutation.mutate({
            action: actionType,
            payload: { note }
        });
    };

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            const response = await axios.get(`/treasurer/${id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rekomendasi_Bendahara_${change.institution?.name || 'Sekolah'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Refetch since status becomes completed after download
            queryClient.invalidateQueries(['treasurer', id]);
        } catch (error) {
            toast.error('Gagal mengunduh dokumen PDF');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full pb-10 animate-pulse">
                {/* Header Actions Skeleton */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div className="h-7 bg-slate-300 rounded w-64"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 bg-slate-200 rounded w-28"></div>
                        <div className="h-9 bg-slate-200 rounded w-36"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
                            <div className="h-4 bg-slate-300 rounded w-1/4 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-10 bg-slate-100 rounded w-full"></div>
                                <div className="h-10 bg-slate-100 rounded w-full"></div>
                                <div className="h-10 bg-slate-100 rounded w-full"></div>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
                            <div className="h-4 bg-slate-300 rounded w-1/4 mb-4"></div>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="h-20 bg-slate-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
                            <div className="h-4 bg-slate-300 rounded w-1/3 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-12 bg-slate-100 rounded w-full"></div>
                                <div className="h-12 bg-slate-100 rounded w-full"></div>
                                <div className="h-12 bg-slate-100 rounded w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!change) return <div className="p-8 text-center text-red-500">Data tidak ditemukan.</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Draft</span>;
            case 'submitted': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">Submitted</span>;
            case 'verifikasi': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Verifikasi</span>;
            case 'revisi': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Revisi</span>;
            case 'approved': return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Approved</span>;
            case 'ready_to_print': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Siap Cetak</span>;
            case 'completed': return <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold">Completed</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Ditolak</span>;
            default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold capitalize">{status}</span>;
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <button 
                        onClick={() => navigate('/treasurer')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center transition-colors mb-2"
                    >
                        <ArrowLeft size={14} className="mr-1" />
                        Kembali ke Daftar
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Detail Pengajuan #{change.reference_number}</h1>
                    <p className="text-xs text-slate-500 mt-1">{change.institution?.name} • Diajukan pada {change.submitted_at ? new Date(change.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                </div>
                <div>
                    {getStatusBadge(change.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Perbandingan Data Bendahara */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center">
                                <UserSquare2 size={16} className="mr-2 text-slate-500" />
                                Perbandingan Data Bendahara & Rekening
                            </h3>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                                        <th className="px-6 py-3">FIELD</th>
                                        <th className="px-6 py-3">DATA LAMA</th>
                                        <th className="px-6 py-3">DATA BARU</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(change.change_type === 'bendahara' || change.change_type === 'both') && (
                                        <>
                                            <tr>
                                                <td className="px-6 py-3.5 font-semibold text-slate-500">Nama Bendahara</td>
                                                <td className="px-6 py-3.5 text-slate-600 line-through">{change.old_treasurer_name}</td>
                                                <td className="px-6 py-3.5 font-semibold text-emerald-700">{change.new_treasurer_name} <span className="text-[10px] text-emerald-600">✓</span></td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3.5 font-semibold text-slate-500">NPWP Bendahara</td>
                                                <td className="px-6 py-3.5 text-slate-600">{change.old_npwp}</td>
                                                <td className="px-6 py-3.5 font-semibold text-slate-800">{change.new_npwp}</td>
                                            </tr>
                                        </>
                                    )}
                                    {(change.change_type === 'rekening' || change.change_type === 'both') && (
                                        <>
                                            <tr>
                                                <td className="px-6 py-3.5 font-semibold text-slate-500">Nama Pemegang Rekening</td>
                                                <td className="px-6 py-3.5 text-slate-600">{change.old_treasurer_name}</td>
                                                <td className="px-6 py-3.5 font-semibold text-emerald-700">{change.new_treasurer_name}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3.5 font-semibold text-slate-500">Nomor Rekening</td>
                                                <td className="px-6 py-3.5 text-slate-600">{change.old_bank_account}</td>
                                                <td className="px-6 py-3.5 font-semibold text-emerald-700">{change.new_bank_account}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-3.5 font-semibold text-slate-500">Bank / Cabang</td>
                                                <td className="px-6 py-3.5 text-slate-600" colSpan="2">{change.bank_name} / {change.bank_branch}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Dokumen Pendukung */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center">
                                <FileText size={16} className="mr-2 text-slate-500" />
                                Dokumen Pendukung
                            </h3>
                            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                {[change.file_sk_kepsek, change.file_ktp_npwp, change.file_additional].filter(Boolean).length} File Terlampir
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'SK Kepsek Bendahara', path: change.file_sk_kepsek },
                                    { label: 'KTP & NPWP Bendahara', path: change.file_ktp_npwp },
                                    { label: 'Buku Rekening / Lampiran', path: change.file_additional },
                                ].map((file, idx) => {
                                    if (!file.path) return null;
                                    return (
                                        <div 
                                            key={idx} 
                                            className="border border-slate-200 rounded p-4 hover:border-emerald-500 transition-colors flex items-center justify-between cursor-pointer bg-slate-50/30 group"
                                            onClick={() => window.open(`/storage/${file.path}`, '_blank')}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText size={28} className="text-red-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800 truncate">{file.label}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">PDF / Image</p>
                                                </div>
                                            </div>
                                            <Download size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Process & Actions */}
                <div className="space-y-6">
                    
                    {/* Tindakan Diperlukan */}
                    {change.status === 'draft' && (user?.id === change.submitted_by?.id || user?.id === change.submitted_by || roles?.includes('super-admin')) && (
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 text-center">
                            <Send className="mx-auto mb-2 text-slate-400" size={32} />
                            <h3 className="font-bold text-slate-800 text-sm mb-1">Ajukan Pengajuan?</h3>
                            <p className="text-xs text-slate-500 mb-4">Pastikan data yang dimasukkan sudah benar sebelum mengajukan ke alur verifikasi.</p>
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isLoading}
                                className="w-full flex justify-center items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded transition-colors"
                            >
                                Kirim Pengajuan
                            </button>
                        </div>
                    )}

                    {approvalMeta?.can_approve && ['submitted', 'verifikasi'].includes(change.status) && (
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Tindakan Diperlukan</h3>
                            <p className="text-xs text-slate-500 mb-4">Silakan tinjau berkas pengajuan di sebelah kiri sebelum mengambil keputusan.</p>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => { setActionType('approve'); setIsActionModalOpen(true); }}
                                    className="w-full flex justify-center items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors"
                                >
                                    <CheckCircle2 size={14} className="mr-2" />
                                    Setujui Berkas
                                </button>
                                <button 
                                    onClick={() => { setActionType('reject'); setIsActionModalOpen(true); }}
                                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50 transition-colors"
                                >
                                    <XCircle size={14} className="mr-2" />
                                    Tolak / Minta Revisi
                                </button>
                            </div>
                        </div>
                    )}

                    {(change.status === 'ready_to_print' || change.status === 'completed') && (
                        <div className="bg-[#f0fdf4] border border-emerald-200 rounded shadow-sm p-6 text-center">
                            <Printer className="mx-auto mb-2 text-emerald-600" size={32} />
                            <h3 className="font-bold text-emerald-800 text-sm mb-1">Cetak Dokumen Rekomendasi</h3>
                            <p className="text-xs text-emerald-600 mb-4">Pengajuan telah disetujui. Silakan cetak Surat Rekomendasi untuk diserahkan ke Bank Jatim.</p>
                            <button 
                                className="w-full flex justify-center items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded transition-colors shadow-sm"
                                onClick={handleDownloadPdf}
                                disabled={isDownloadingPdf}
                            >
                                <FileText size={14} className={isDownloadingPdf ? 'hidden' : 'mr-2'} />
                                {isDownloadingPdf ? 'Memproses...' : 'Cetak Surat Rekomendasi (PDF)'}
                            </button>
                        </div>
                    )}

                    {/* Status Alur (Timeline) */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-6 border-b border-slate-100 pb-3 flex items-center">
                            <CheckSquare size={14} className="mr-2 text-slate-500" />
                            Status Alur
                        </h3>
                        
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                            {/* Step: Submitted */}
                            <div className="relative pl-6">
                                <div className="absolute w-4 h-4 bg-emerald-600 rounded-full -left-[9px] top-1 ring-4 ring-white flex items-center justify-center text-white">
                                    <CheckCircle2 size={10} />
                                </div>
                                <h4 className="text-xs font-bold text-slate-800">Pengajuan Baru</h4>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Oleh: {change.submitted_by ? change.submitted_by.name : 'Operator Sekolah'}<br/>
                                    {change.submitted_at ? new Date(change.submitted_at).toLocaleString('id-ID') : '-'}
                                </p>
                            </div>

                            {/* Approvals history */}
                            {change.approvals?.map((appr, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white flex items-center justify-center text-white ${appr.action_taken === 'rejected' ? 'bg-red-500' : 'bg-emerald-600'}`}>
                                        {appr.action_taken === 'rejected' ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
                                    </div>
                                    <h4 className={`text-xs font-bold ${appr.action_taken === 'rejected' ? 'text-red-600' : 'text-slate-800'}`}>
                                        {appr.step_label || `Langkah ${appr.step_order}`} 
                                        ({appr.action_taken === 'rejected' ? 'Ditolak' : 'Disetujui'})
                                    </h4>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Oleh: {appr.approver?.name}<br/>
                                        {new Date(appr.created_at).toLocaleString('id-ID')}
                                    </p>
                                    {appr.notes && (
                                        <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-600 italic">
                                            "{appr.notes}"
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Next step prediction */}
                            {change.status === 'verifikasi' && approvalMeta?.next_step && (
                                <div className="relative pl-6 opacity-60">
                                    <div className="absolute w-4 h-4 bg-white border-2 border-slate-300 rounded-full -left-[9px] top-1 ring-4 ring-white"></div>
                                    <h4 className="text-xs font-bold text-slate-500">{approvalMeta.next_step.step_label}</h4>
                                    <p className="text-[10px] text-slate-400 mt-1">Menunggu tindakan petugas...</p>
                                </div>
                            )}

                            {/* Final printing step */}
                            <div className="relative pl-6">
                                <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white ${change.status === 'ready_to_print' || change.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-400'} flex items-center justify-center`}>
                                    <Printer size={10} />
                                </div>
                                <h4 className={`text-xs font-bold ${change.status === 'ready_to_print' || change.status === 'completed' ? 'text-slate-800' : 'text-slate-400'}`}>Siap Cetak</h4>
                                <p className="text-[10px] text-slate-400 mt-1">Surat rekomendasi bank diterbitkan oleh dinas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {isActionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`p-4 ${actionType === 'approve' ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-red-50 border-b border-red-100'}`}>
                            <h3 className={`font-bold text-sm ${actionType === 'approve' ? 'text-emerald-800' : 'text-red-800'}`}>
                                {actionType === 'approve' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
                            </h3>
                        </div>
                        <form onSubmit={handleActionSubmit} className="p-4">
                            <label className="block text-xs font-semibold text-slate-600 mb-2">
                                Catatan {actionType === 'reject' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                required={actionType === 'reject'}
                                rows={3}
                                className="w-full border-slate-200 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-xs p-2 border"
                                placeholder={actionType === 'approve' ? 'Catatan opsional...' : 'Alasan penolakan (wajib)...'}
                            ></textarea>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsActionModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionMutation.isLoading}
                                    className={`px-4 py-2 text-white rounded text-xs font-semibold disabled:opacity-50 ${actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                                >
                                    {actionMutation.isLoading ? 'Memproses...' : 'Konfirmasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
