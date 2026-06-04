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
    PackageCheck,
    MessageSquare,
    AlertCircle,
    User
} from 'lucide-react';
import { useSelector } from 'react-redux';

export default function IjazahShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useSelector(state => state.auth);

    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState('approve'); // 'approve', 'reject'
    const [note, setNote] = useState('');

    const { data: ijazahRes, isLoading } = useQuery({
        queryKey: ['ijazah', id],
        queryFn: async () => {
            const res = await axios.get(`/api/ijazah-revisions/${id}`);
            return res.data;
        }
    });

    const ijazah = ijazahRes?.data;
    const approvalMeta = ijazahRes?.approval_meta;

    const actionMutation = useMutation({
        mutationFn: async ({ action, payload }) => {
            return await axios.post(`/api/ijazah-revisions/${id}/${action}`, payload);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            setIsActionModalOpen(false);
            setNote('');
            queryClient.invalidateQueries(['ijazah', id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan.');
        }
    });

    const markStatusMutation = useMutation({
        mutationFn: async (action) => {
            return await axios.post(`/api/ijazah-revisions/${id}/${action}`);
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            queryClient.invalidateQueries(['ijazah', id]);
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

    if (isLoading) {
        return (
            <div className="space-y-6 pb-10 animate-pulse">
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

                {/* Ticket Summary Card Skeleton */}
                <div className="bg-white border border-slate-200 rounded p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-slate-100 shrink-0"></div>
                        <div>
                            <div className="h-3 bg-slate-100 rounded w-16 mb-2"></div>
                            <div className="h-6 bg-slate-200 rounded w-36"></div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                        <div className="h-6 bg-slate-200 rounded w-20"></div>
                        <div className="h-3 bg-slate-100 rounded w-32"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
                            <div className="h-4 bg-slate-300 rounded w-1/4 mb-4"></div>
                            <div className="h-10 bg-slate-100 rounded w-full"></div>
                            <div className="h-20 bg-slate-100 rounded w-full"></div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-4">
                            <div className="h-4 bg-slate-300 rounded w-1/4 mb-4"></div>
                            <div className="grid grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="h-24 bg-slate-100 rounded"></div>
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
    if (!ijazah) return <div className="p-8 text-center text-red-500">Data tidak ditemukan.</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Draft</span>;
            case 'verifikasi': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Verifikasi</span>;
            case 'approved': return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Approved</span>;
            case 'ready_for_pickup': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Siap Diambil</span>;
            case 'completed': return <span className="px-3 py-1 bg-slate-800 text-white rounded-full text-xs font-bold">Selesai</span>;
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Ditolak</span>;
            default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold capitalize">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <button 
                        onClick={() => navigate('/ijazah')}
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center transition-colors mb-2"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Kembali ke Daftar
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">Detail Pengajuan Revisi Ijazah</h1>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded flex items-center hover:bg-slate-50 transition-colors">
                        <MessageSquare size={16} className="mr-2" />
                        Hubungi Admin
                    </button>
                    <button className="px-4 py-2 bg-[#0f172a] text-white text-sm font-medium rounded flex items-center hover:bg-slate-800 transition-colors">
                        <Printer size={16} className="mr-2" />
                        Cetak Tanda Terima
                    </button>
                </div>
            </div>

            {/* Ticket Summary Card */}
            <div className="bg-white border border-slate-200 rounded p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <FileText size={24} className="text-slate-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-medium mb-0.5">Nomor Tiket</div>
                        <div className="text-lg font-bold text-slate-800 tracking-tight">{ijazah.ticket_number}</div>
                    </div>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5">
                    {getStatusBadge(ijazah.status)}
                    <div className="text-xs text-slate-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        Diajukan: {new Date(ijazah.submitted_at).toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Data Pemohon */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center">
                                <User size={16} className="mr-2 text-slate-500" />
                                Data Pemohon & Koreksi
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className="w-12 h-12 rounded bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-lg">
                                    {ijazah.student_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-lg">{ijazah.student_name}</h4>
                                    <p className="text-sm text-slate-500 mt-0.5">NISN: {ijazah.nisn} • Lulusan {ijazah.graduation_year}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-medium mb-1">Asal Sekolah</p>
                                    <p className="text-sm font-bold text-slate-800">{ijazah.institution?.name}</p>
                                </div>
                            </div>

                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Detail Perubahan Yang Diajukan</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-red-200 bg-red-50/50 rounded-lg relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                    <p className="text-xs font-bold text-red-600 mb-1 flex items-center">
                                        <XCircle size={14} className="mr-1.5" />
                                        Data Tercetak (Salah)
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800 line-through decoration-red-400 decoration-2">{ijazah.wrong_data_description}</p>
                                </div>
                                <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-lg relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center">
                                        <CheckCircle2 size={14} className="mr-1.5" />
                                        Data Seharusnya (Benar)
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">{ijazah.correct_data_description}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dokumen Terlampir */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm flex items-center">
                                <FileText size={16} className="mr-2 text-slate-500" />
                                Dokumen Terlampir
                            </h3>
                            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">4 File</span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Scan Ijazah Asli', path: ijazah.file_ijazah_wrong },
                                    { label: 'Akte Kelahiran', path: ijazah.file_akte },
                                    { label: 'Kartu Keluarga', path: ijazah.file_kk },
                                    { label: 'SPTJM', path: ijazah.file_sptjm },
                                    ...(ijazah.file_additional ? [{ label: 'Lampiran Tambahan', path: ijazah.file_additional }] : [])
                                ].map((file, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded p-3 hover:border-emerald-400 transition-colors group cursor-pointer" onClick={() => window.open(`/storage/${file.path}`, '_blank')}>
                                        <div className="w-full aspect-[4/3] bg-slate-50 rounded mb-2 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                            <FileText size={24} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 truncate text-center">{file.label}</p>
                                        <p className="text-[10px] text-slate-400 text-center mt-0.5 group-hover:text-emerald-600 transition-colors flex items-center justify-center gap-1">
                                            Lihat File <Download size={10} />
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Process & Actions */}
                <div className="space-y-6">
                    {/* Alur Proses */}
                    <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center border-b border-slate-100 pb-3">
                            <CheckSquare size={16} className="mr-2 text-slate-500" />
                            Alur Proses
                        </h3>
                        
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                            {/* Created Step */}
                            <div className="relative pl-6">
                                <div className="absolute w-4 h-4 bg-emerald-500 rounded-full -left-[9px] top-1 ring-4 ring-white"></div>
                                <h4 className="text-sm font-bold text-slate-800">Pengajuan Diterima</h4>
                                <p className="text-xs text-slate-500 mt-1">Oleh Sistem<br/>{new Date(ijazah.submitted_at).toLocaleString('id-ID')}</p>
                            </div>

                            {/* Approval Steps */}
                            {ijazah.approvals?.map((appr, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white ${appr.action_taken === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                    <h4 className={`text-sm font-bold ${appr.action_taken === 'rejected' ? 'text-red-600' : 'text-slate-800'}`}>
                                        {appr.step_label || `Tahap ${appr.step_order}`} 
                                        ({appr.action_taken === 'rejected' ? 'Ditolak' : 'Disetujui'})
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Oleh: {appr.approver?.name}<br/>
                                        {new Date(appr.created_at).toLocaleString('id-ID')}
                                    </p>
                                    {appr.notes && (
                                        <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded text-xs text-slate-600 italic">
                                            "{appr.notes}"
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Next Step Prediction */}
                            {ijazah.status === 'verifikasi' && approvalMeta?.next_step && (
                                <div className="relative pl-6 opacity-60">
                                    <div className="absolute w-4 h-4 bg-white border-2 border-slate-300 rounded-full -left-[9px] top-1 ring-4 ring-white"></div>
                                    <h4 className="text-sm font-bold text-slate-600">{approvalMeta.next_step.step_label}</h4>
                                    <p className="text-xs text-slate-400 mt-1">Sedang menunggu proses...</p>
                                </div>
                            )}

                            {/* Ready for Pickup Step */}
                            {(ijazah.status === 'approved' || ijazah.status === 'ready_for_pickup' || ijazah.status === 'completed') && (
                                <div className="relative pl-6">
                                    <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white ${ijazah.status !== 'approved' ? 'bg-emerald-500' : 'bg-white border-2 border-slate-300'}`}></div>
                                    <h4 className={`text-sm font-bold ${ijazah.status !== 'approved' ? 'text-slate-800' : 'text-slate-600'}`}>Siap Diambil</h4>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {ijazah.pickup_notified_at ? new Date(ijazah.pickup_notified_at).toLocaleString('id-ID') : 'Menunggu tahap sebelumnya.'}
                                    </p>
                                </div>
                            )}

                            {/* Completed Step */}
                            {(ijazah.status === 'ready_for_pickup' || ijazah.status === 'completed') && (
                                <div className="relative pl-6">
                                    <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-white ${ijazah.status === 'completed' ? 'bg-emerald-500' : 'bg-white border-2 border-slate-300'}`}></div>
                                    <h4 className={`text-sm font-bold ${ijazah.status === 'completed' ? 'text-slate-800' : 'text-slate-600'}`}>Selesai</h4>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tindakan Verifikator */}
                    {approvalMeta?.can_approve && ijazah.status === 'verifikasi' && (
                        <div className="bg-white border border-slate-200 rounded shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 text-sm mb-4">Tindakan Verifikator</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => { setActionType('approve'); setIsActionModalOpen(true); }}
                                    className="w-full flex justify-center items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition-colors"
                                >
                                    <CheckCircle2 size={16} className="mr-2" />
                                    Setujui Berkas
                                </button>
                                <button 
                                    onClick={() => { setActionType('reject'); setIsActionModalOpen(true); }}
                                    className="w-full flex justify-center items-center px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded hover:bg-red-50 transition-colors"
                                >
                                    <XCircle size={16} className="mr-2" />
                                    Kembalikan / Tolak
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Admin Actions (Ready for pickup / Complete) */}
                    {user?.roles?.includes('admin') && (
                        <>
                            {ijazah.status === 'approved' && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded shadow-sm p-6 text-center">
                                    <AlertCircle size={32} className="mx-auto mb-2 text-emerald-600" />
                                    <h3 className="font-bold text-emerald-800 text-sm mb-1">Dokumen Siap?</h3>
                                    <p className="text-xs text-emerald-600 mb-4">Beritahu sekolah bahwa ijazah pengganti fisik telah selesai dan siap diambil.</p>
                                    <button 
                                        onClick={() => markStatusMutation.mutate('mark-ready')}
                                        disabled={markStatusMutation.isLoading}
                                        className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                    >
                                        Tandai "Siap Diambil"
                                    </button>
                                </div>
                            )}

                            {ijazah.status === 'ready_for_pickup' && (
                                <div className="bg-blue-50 border border-blue-200 rounded shadow-sm p-6 text-center">
                                    <PackageCheck size={32} className="mx-auto mb-2 text-blue-600" />
                                    <h3 className="font-bold text-blue-800 text-sm mb-1">Sudah Diambil?</h3>
                                    <p className="text-xs text-blue-600 mb-4">Tandai tiket ini selesai jika pihak sekolah telah mengambil fisik ijazah.</p>
                                    <button 
                                        onClick={() => markStatusMutation.mutate('mark-completed')}
                                        disabled={markStatusMutation.isLoading}
                                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Selesaikan Tiket
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Action Modal */}
            {isActionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className={`p-4 ${actionType === 'approve' ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-red-50 border-b border-red-100'}`}>
                            <h3 className={`font-bold ${actionType === 'approve' ? 'text-emerald-800' : 'text-red-800'}`}>
                                {actionType === 'approve' ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
                            </h3>
                        </div>
                        <form onSubmit={handleActionSubmit} className="p-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Catatan {actionType === 'reject' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                required={actionType === 'reject'}
                                rows={3}
                                className="w-full border-slate-200 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-sm p-2 border"
                                placeholder={actionType === 'approve' ? 'Catatan opsional...' : 'Alasan penolakan (wajib)...'}
                            ></textarea>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsActionModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-sm hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionMutation.isLoading}
                                    className={`px-4 py-2 text-white rounded text-sm disabled:opacity-50 ${actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
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
