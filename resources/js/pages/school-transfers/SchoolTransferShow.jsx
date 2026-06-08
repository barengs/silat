import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    User,
    Send
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function SchoolTransferShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, roles } = useSelector(state => state.auth);

    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState('approve'); // 'approve', 'reject'
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [note, setNote] = useState('');

    const { data: responseData, isLoading } = useQuery({
        queryKey: ['school-transfers', id],
        queryFn: async () => {
            const res = await axios.get(`/school-transfers/${id}`);
            return res.data;
        }
    });

    const transfer = responseData?.data;
    const approvalMeta = responseData?.approval_meta;

    const submitMutation = useMutation({
        mutationFn: async () => {
            return await axios.post(`/school-transfers/${id}/submit`);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            queryClient.invalidateQueries(['school-transfers', id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Gagal mengirim pengajuan.');
        }
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, payload }) => {
            return await axios.post(`/school-transfers/${id}/${action}`, payload);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            setIsActionModalOpen(false);
            setNote('');
            queryClient.invalidateQueries(['school-transfers', id]);
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
            const response = await axios.get(`/school-transfers/${id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rekomendasi_Pindah_${transfer.student_name || 'Siswa'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            queryClient.invalidateQueries(['schoolTransfer', id]);
        } catch (error) {
            toast.error('Gagal mengunduh dokumen PDF');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full pb-10 animate-pulse">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div className="h-7 bg-slate-300 rounded w-64"></div>
                    </div>
                    <div className="h-9 bg-slate-200 rounded w-28"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-48 bg-white border border-slate-200 rounded"></div>
                        <div className="h-32 bg-white border border-slate-200 rounded"></div>
                    </div>
                    <div className="h-64 bg-white border border-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!transfer) return <div className="p-8 text-center text-red-500">Data tidak ditemukan.</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Draft</span>;
            case 'submitted': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">Submitted</span>;
            case 'verifikasi': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Verifikasi</span>;
            case 'approved': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Disetujui (TTE)</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Ditolak</span>;
            default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold capitalize">{status}</span>;
        }
    };

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <button 
                        onClick={() => navigate('/school-transfers')}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center transition-colors mb-2"
                    >
                        <ArrowLeft size={14} className="mr-1" />
                        Kembali ke Daftar
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Detail Pengajuan #{transfer.transfer_number}</h1>
                    <p className="text-xs text-slate-500 mt-1">{transfer.institution?.name} • Diajukan oleh {transfer.submitted_by === user?.id ? 'Anda' : transfer.submitted_by?.name || 'Operator'}</p>
                </div>
                <div className="flex gap-2">
                    {getStatusBadge(transfer.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Detail Siswa & Mutasi */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center">
                                <User size={16} className="mr-2 text-slate-500" />
                                Informasi Mutasi Siswa
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Siswa</p>
                                    <p className="font-bold text-slate-800 mt-1">{transfer.student_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">NISN</p>
                                    <p className="font-semibold text-slate-700 mt-1">{transfer.nisn}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jenis Kelamin</p>
                                    <p className="text-slate-700 mt-1">{transfer.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas / Tingkat</p>
                                    <p className="text-slate-700 mt-1">Kelas {transfer.grade}</p>
                                </div>
                                <div className="md:col-span-2 border-t border-slate-100 pt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sekolah Asal</p>
                                    <p className="font-semibold text-slate-800 mt-1">{transfer.institution?.name} (NPSN: {transfer.institution?.npsn_code || '-'})</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sekolah Tujuan</p>
                                    <p className="font-bold text-slate-800 mt-1">{transfer.target_school}</p>
                                    <p className="text-xs text-slate-500 mt-1">{transfer.target_school_address}</p>
                                </div>
                                <div className="md:col-span-2 border-t border-slate-100 pt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alasan Mutasi</p>
                                    <p className="text-slate-700 mt-1 bg-slate-50 p-3 rounded italic border-l-2 border-slate-300">{transfer.reason}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dokumen Lampiran */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-sm">Dokumen Syarat & Lampiran</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Surat Permohonan Ortu', path: transfer.file_request_letter },
                                { label: 'Scan Raport Terakhir', path: transfer.file_report_card },
                                { label: 'Surat Mutasi Sekolah Asal', path: transfer.file_mutation_letter },
                                { label: 'Berkas Tambahan', path: transfer.file_additional, optional: true },
                            ].map((doc, idx) => {
                                if (doc.optional && !doc.path) return null;
                                return (
                                    <div key={idx} className="border border-slate-200 rounded p-4 flex items-center justify-between bg-white shadow-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
                                                <FileText size={20} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xs text-slate-800">{doc.label}</h4>
                                                <p className="text-[10px] text-slate-400">Tersedia untuk ditinjau</p>
                                            </div>
                                        </div>
                                        {doc.path ? (
                                            <a 
                                                href={`/storage/${doc.path}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded transition-colors"
                                            >
                                                Buka
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Tidak ada file</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column - Status & Workflow Timeline */}
                <div className="space-y-6">
                    {/* Panel Aksi Operator / Submitter */}
                    {((transfer.status === 'draft' || transfer.status === 'rejected') && (user?.id === transfer.submitted_by?.id || user?.id === transfer.submitted_by || roles?.includes('super-admin'))) && (
                        <div className="bg-slate-900 border border-slate-800 text-white rounded p-6 shadow-md">
                            <h3 className="font-bold text-sm mb-2 flex items-center">
                                <Send size={16} className="mr-2 text-slate-300" />
                                Kirim Pengajuan
                            </h3>
                            <p className="text-xs text-slate-300 mb-6">
                                Pengajuan Anda saat ini berstatus {transfer.status === 'rejected' ? 'ditolak (revisi)' : 'draft'}. Kirimkan sekarang agar Kepala Sekolah dan Dinas Pendidikan dapat segera menindaklanjutinya.
                            </p>
                            <button
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isLoading}
                                className="w-full py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded transition-colors shadow-sm disabled:opacity-50"
                            >
                                {submitMutation.isLoading ? 'Mengirim...' : 'Kirim Sekarang'}
                            </button>
                        </div>
                    )}

                    {/* Cetak PDF */}
                    {transfer.status === 'approved' && (
                        <div className="bg-emerald-600 border border-emerald-500 text-white rounded p-6 shadow-md">
                            <h3 className="font-bold text-sm mb-2 flex items-center">
                                <Printer size={16} className="mr-2 text-emerald-100" />
                                Surat Rekomendasi Terbit
                            </h3>
                            <p className="text-xs text-emerald-100 mb-6">
                                Surat rekomendasi resmi mutasi sekolah telah disahkan oleh Kepala Dinas Pendidikan dan ditandatangani secara elektronik (TTE). Unduh surat di bawah ini.
                            </p>
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloadingPdf}
                                className="w-full py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                                <Download size={14} />
                                {isDownloadingPdf ? 'Mengunduh...' : 'Unduh Rekomendasi (PDF)'}
                            </button>
                        </div>
                    )}

                    {/* Tombol Aksi Verifikator/Approver */}
                    {approvalMeta?.can_approve && ['submitted', 'verifikasi'].includes(transfer.status) && (
                        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center">
                                <CheckSquare size={16} className="mr-2 text-slate-500" />
                                Tindakan Diperlukan
                            </h3>
                            <p className="text-xs text-slate-500">
                                Anda memiliki wewenang untuk meninjau dan memproses langkah ini: <strong>{approvalMeta.next_step?.step_label}</strong>.
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => { setActionType('approve'); setIsActionModalOpen(true); }}
                                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition-colors shadow-xs"
                                >
                                    Setujui
                                </button>
                                <button
                                    onClick={() => { setActionType('reject'); setIsActionModalOpen(true); }}
                                    className="py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition-colors shadow-xs"
                                >
                                    Tolak / Kembalikan
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Workflow Timeline */}
                    <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 mb-6 flex items-center">
                            <Clock size={16} className="mr-2 text-slate-400" />
                            Alur Persetujuan
                        </h3>

                        <div className="relative border-l border-slate-200 ml-2 space-y-6">
                            {/* Draft / Submitted Step */}
                            <div className="relative pl-6">
                                <div className="absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white bg-emerald-500 flex items-center justify-center">
                                    <CheckCircle2 size={10} className="text-white" />
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 leading-tight">Pengajuan Dibuat</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">Oleh Operator Sekolah</p>
                            </div>

                            {/* Approval Flow Steps from DB */}
                            {transfer.approvals?.map((appr, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white flex items-center justify-center ${
                                        appr.status === 'approved' 
                                            ? 'bg-emerald-500' 
                                            : appr.status === 'rejected' 
                                                ? 'bg-rose-500' 
                                                : 'bg-slate-300'
                                    }`}>
                                        {appr.status === 'approved' ? (
                                            <CheckCircle2 size={10} className="text-white" />
                                        ) : (
                                            <XCircle size={10} className="text-white" />
                                        )}
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                                        {appr.step?.step_label || 'Persetujuan'}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {appr.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh: {appr.approver?.name || 'Staff'}<br />
                                        Pada {new Date(appr.acted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    {appr.note && (
                                        <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded mt-1 border-l border-amber-400 italic">
                                            "{appr.note}"
                                        </p>
                                    )}
                                </div>
                            ))}

                            {/* Next steps indicator */}
                            {transfer.status !== 'approved' && transfer.status !== 'rejected' && (
                                <div className="relative pl-6">
                                    <div className="absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white bg-slate-200"></div>
                                    <h4 className="text-xs font-bold text-slate-400 leading-tight">
                                        {approvalMeta?.next_step?.step_label || 'Langkah Berikutnya'}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Menunggu tinjauan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal (Approve / Reject) */}
            {isActionModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-slate-200 rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className={`p-4 ${actionType === 'approve' ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-rose-50 border-b border-rose-100'}`}>
                            <h3 className={`font-bold text-sm ${actionType === 'approve' ? 'text-emerald-800' : 'text-rose-800'}`}>
                                {actionType === 'approve' ? 'Setujui Pengajuan Mutasi' : 'Tolak / Kembalikan Pengajuan'}
                            </h3>
                        </div>
                        <form onSubmit={handleActionSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan Tindakan</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder={actionType === 'approve' ? 'Catatan opsional...' : 'Alasan penolakan / revisi wajib diisi...'}
                                        required={actionType === 'reject'}
                                        rows="4"
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 resize-none bg-slate-50 focus:bg-white transition-colors"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                                <button
                                    type="button"
                                    onClick={() => { setIsActionModalOpen(false); setNote(''); }}
                                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionMutation.isLoading}
                                    className={`px-4 py-2 text-white rounded text-xs font-bold transition-colors ${actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
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
