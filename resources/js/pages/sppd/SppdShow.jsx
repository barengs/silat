import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { MapPin, Calendar, Users, FileText, CheckCircle2, XCircle, Clock, Check, Loader2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function SppdShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [actionNotes, setActionNotes] = useState('');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(''); // 'approve' | 'reject' | 'submit'
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState({ real_start_date: '', real_end_date: '', report_text: '', actual_cost: '', attachment: null, notes: '' });
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['sppd', id],
        queryFn: async () => {
            const res = await axios.get(`/sppd/${id}`);
            return res.data;
        }
    });

    const actionMutation = useMutation({
        mutationFn: async ({ action, notes }) => {
            return await axios.post(`/sppd/${id}/${action}`, { notes });
        },
        onSuccess: (res) => {
            toast.success(res.data.message);
            setIsActionModalOpen(false);
            setActionNotes('');
            queryClient.invalidateQueries(['sppd', id]);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat memproses data');
            setIsActionModalOpen(false);
        }
    });

    if (isLoading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-emerald-600" /></div>;
    }

    if (!data) return <div className="p-8 text-center text-slate-500">Data SPPD tidak ditemukan</div>;

    const sppd = data.sppd;
    const approvalFlows = data.approval_flows || [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <Badge variant="outline" className="bg-slate-100 text-slate-700">Draft</Badge>;
            case 'verifikasi': return <Badge variant="warning" className="bg-amber-100 text-amber-700">Menunggu Verifikasi</Badge>;
            case 'approved': return <Badge variant="info" className="bg-blue-100 text-blue-700">Disetujui</Badge>;
            case 'active': return <Badge variant="success" className="bg-emerald-100 text-emerald-700">Sedang Berlangsung</Badge>;
            case 'reported': return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Menunggu Validasi LPP</Badge>;
            case 'closed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Selesai</Badge>;
            case 'rejected': return <Badge variant="danger">Ditolak</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const handleActionClick = (type) => {
        if (type === 'submit') {
            // Submit doesn't necessarily need notes for now
            actionMutation.mutate({ action: 'submit', notes: '' });
        } else {
            setActionType(type);
            setIsActionModalOpen(true);
        }
    };

    const executeAction = () => {
        actionMutation.mutate({ action: actionType, notes: actionNotes });
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingReport(true);
        try {
            const formData = new FormData();
            formData.append('real_start_date', reportData.real_start_date || sppd.start_date);
            formData.append('real_end_date', reportData.real_end_date || sppd.end_date);
            formData.append('report_text', reportData.report_text);
            if (reportData.actual_cost) formData.append('actual_cost', reportData.actual_cost);
            if (reportData.attachment) formData.append('attachment', reportData.attachment);
            if (reportData.notes) formData.append('notes', reportData.notes);

            const res = await axios.post(`/sppd/${id}/report`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(res.data.message);
            setIsReportModalOpen(false);
            queryClient.invalidateQueries(['sppd', id]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengirim laporan');
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            const response = await axios.get(`/sppd/${id}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SPPD_${sppd.user?.name || 'Document'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Gagal mengunduh dokumen PDF');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/sppd')}>Manajemen SPPD</span>
                        <span>›</span>
                        <span className="text-slate-800 font-medium">Detail</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Detail Pengajuan SPPD</h1>
                    <p className="text-slate-500 font-medium mt-1">Nomor Dokumen: {sppd.document_number || 'Belum Diterbitkan'}</p>
                </div>
                <div>
                    {getStatusBadge(sppd.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Panel Kiri: Informasi Perjalanan */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-emerald-600" />
                                Informasi Utama
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Maksud Perjalanan</p>
                                    <p className="font-medium text-slate-900">{sppd.purpose}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Tujuan</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-slate-400" />
                                        <p className="font-medium text-slate-900">{sppd.destination}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Waktu Pelaksanaan</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-slate-400" />
                                        <p className="font-medium text-slate-900">
                                            {formatDate(sppd.start_date)} - {formatDate(sppd.end_date)}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Moda Transportasi</p>
                                    <p className="font-medium text-slate-900">{sppd.transport_type?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Sumber Dana / Anggaran</p>
                                    <p className="font-medium text-slate-900">{sppd.budget_source || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Instansi / Asal Pemohon</p>
                                    <p className="font-medium text-slate-900">{sppd.institution?.name || 'Dinas Pendidikan'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Anggota Tim */}
                    <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Users size={18} className="text-emerald-600" />
                                Daftar Pegawai Yang Ditugaskan
                            </h2>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Nama Lengkap</th>
                                        <th className="px-6 py-3">NIP</th>
                                        <th className="px-6 py-3">Jabatan / Peran</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Main Requester is always first */}
                                    <tr className="border-b border-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                    {sppd.user?.name?.substring(0,2).toUpperCase()}
                                                </div>
                                                {sppd.user?.name}
                                                <Badge variant="outline" className="text-[10px] ml-2">Pemohon Utama</Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{sppd.user?.nip || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600">-</td>
                                    </tr>
                                    {sppd.members?.map(member => (
                                        <tr key={member.id} className="border-b border-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                        {(member.display_name || '').substring(0,2).toUpperCase()}
                                                    </div>
                                                    {member.display_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{member.display_nip || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600">{member.role_in_trip || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Panel Kanan: Alur Persetujuan & Aksi */}
                <div className="space-y-6">
                    {/* Aksi Berdasarkan Status */}
                    <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Tindakan</h3>
                        
                        <div className="space-y-3">
                            {sppd.status === 'draft' && (
                                <Button 
                                    className="w-full bg-[#0f172a] hover:bg-slate-800 text-white" 
                                    onClick={() => handleActionClick('submit')}
                                    isLoading={actionMutation.isPending && actionType === 'submit'}
                                >
                                    Ajukan Untuk Verifikasi
                                </Button>
                            )}

                            {/* Approval Action */}
                            {['submitted', 'verifikasi'].includes(sppd.status) && data.approval_meta?.can_approve && (
                                <>
                                    <Button 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={() => handleActionClick('approve')}
                                    >
                                        Setujui Pengajuan
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => handleActionClick('reject')}
                                    >
                                        Tolak Pengajuan
                                    </Button>
                                </>
                            )}

                            {/* Cetak PDF Button */}
                            {['approved', 'active', 'reported', 'closed'].includes(sppd.status) && (
                                <Button 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                    onClick={handleDownloadPdf}
                                    isLoading={isDownloadingPdf}
                                >
                                    <FileText size={18} className={isDownloadingPdf ? 'hidden' : 'mr-2'} />
                                    Cetak Surat Tugas (PDF)
                                </Button>
                            )}

                            {/* Unggah LPP Button */}
                            {['approved', 'active'].includes(sppd.status) && (
                                <Button 
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => setIsReportModalOpen(true)}
                                >
                                    <Upload size={18} className="mr-2" />
                                    Unggah Laporan (LPP)
                                </Button>
                            )}

                            {sppd.status === 'reported' && (
                                <Button 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleActionClick('validate-report')}
                                >
                                    Validasi Laporan (Selesai)
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Timeline Persetujuan */}
                    <div className="bg-white p-6 rounded shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Lini Masa Persetujuan</h3>
                        
                        <div className="relative border-l border-slate-200 ml-3 space-y-8">
                            
                            {/* Draft Step */}
                            <div className="relative pl-6">
                                <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ${sppd.status !== 'draft' ? 'bg-emerald-500' : 'bg-blue-500 ring-4 ring-blue-50'}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Draft Dibuat</p>
                                    <p className="text-xs text-slate-500 mt-1">{sppd.user?.name}</p>
                                </div>
                            </div>

                            {/* Dynamic Steps based on Approval Flows */}
                            {approvalFlows.length > 0 ? (
                                approvalFlows.map(flow => {
                                    // Find if this step is approved/rejected in sppd.approvals
                                    const approvalRecord = sppd.approvals?.find(a => a.step_order === flow.step_order);
                                    let state = 'pending'; // pending, current, done, rejected
                                    
                                    if (approvalRecord) {
                                        state = approvalRecord.action_taken === 'rejected' ? 'rejected' : 'done';
                                    } else if (sppd.current_step === flow.step_order - 1 && sppd.status === 'verifikasi') {
                                        state = 'current';
                                    }

                                    return (
                                        <div key={flow.id} className="relative pl-6">
                                            <div className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full flex items-center justify-center
                                                ${state === 'done' ? 'bg-emerald-500' : 
                                                  state === 'rejected' ? 'bg-red-500' : 
                                                  state === 'current' ? 'bg-amber-500 ring-4 ring-amber-50' : 
                                                  'bg-slate-200'}`}
                                            >
                                                {state === 'done' && <Check size={10} className="text-white" />}
                                                {state === 'rejected' && <XCircle size={10} className="text-white" />}
                                                {state === 'current' && <Clock size={10} className="text-white" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${state === 'current' ? 'text-amber-700' : state === 'done' ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                    {flow.step_label}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">{flow.role?.name || 'Sistem'}</p>
                                                
                                                {state === 'current' && (
                                                    <p className="text-xs font-semibold text-amber-600 mt-1">Sedang Diverifikasi</p>
                                                )}
                                                
                                                {approvalRecord && (
                                                    <div className="mt-2 p-3 bg-slate-50 rounded border border-slate-100 text-xs text-slate-600">
                                                        <p className="font-semibold">{approvalRecord.action_taken === 'approved' ? 'Disetujui oleh:' : 'Ditolak oleh:'} {approvalRecord.user?.name}</p>
                                                        {approvalRecord.notes && (
                                                            <p className="mt-1 italic">Catatan: "{approvalRecord.notes}"</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                /* Fallback if no dynamic flow defined */
                                <div className="relative pl-6">
                                    <div className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ${['approved', 'active', 'reported', 'closed'].includes(sppd.status) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Menunggu Persetujuan</p>
                                        <p className="text-xs text-slate-500 mt-1">Atasan Terkait</p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal (Approve/Reject) */}
            {isActionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">
                                {actionType === 'approve' ? 'Persetujuan SPPD' : 'Penolakan SPPD'}
                            </h3>
                            <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Silakan tambahkan catatan opsional terkait keputusan Anda.
                            </p>
                            <textarea 
                                className="w-full border border-slate-200 rounded p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                rows={4}
                                placeholder="Masukkan catatan..."
                                value={actionNotes}
                                onChange={e => setActionNotes(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>Batal</Button>
                            <Button 
                                className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
                                onClick={executeAction}
                                isLoading={actionMutation.isPending}
                            >
                                Konfirmasi
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white rounded shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Upload size={20} className="text-purple-600" />
                                Laporan Perjalanan Dinas (LPP)
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit}>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tgl Riil Berangkat</label>
                                        <input 
                                            type="date" 
                                            required 
                                            className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-purple-500 focus:border-purple-500" 
                                            value={reportData.real_start_date || sppd.start_date.split('T')[0]}
                                            onChange={e => setReportData({...reportData, real_start_date: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tgl Riil Kembali</label>
                                        <input 
                                            type="date" 
                                            required 
                                            className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-purple-500 focus:border-purple-500" 
                                            value={reportData.real_end_date || sppd.end_date.split('T')[0]}
                                            onChange={e => setReportData({...reportData, real_end_date: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Biaya Riil (Opsional, Rp)</label>
                                    <input 
                                        type="number" 
                                        className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-purple-500 focus:border-purple-500" 
                                        placeholder="Contoh: 1500000"
                                        value={reportData.actual_cost}
                                        onChange={e => setReportData({...reportData, actual_cost: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Uraian Laporan</label>
                                    <textarea 
                                        required
                                        className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                        rows={3}
                                        placeholder="Tuliskan ringkasan hasil perjalanan dinas..."
                                        value={reportData.report_text}
                                        onChange={e => setReportData({...reportData, report_text: e.target.value})}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Dokumen Bukti (PDF/ZIP)</label>
                                    <input 
                                        type="file" 
                                        accept=".pdf,.zip,.rar"
                                        className="w-full border border-slate-200 rounded p-2 text-sm" 
                                        onChange={e => setReportData({...reportData, attachment: e.target.files[0]})}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Maks. 5MB. Gabungkan bukti (nota, foto) menjadi 1 file PDF/ZIP.</p>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>Batal</Button>
                                <Button 
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    isLoading={isSubmittingReport}
                                >
                                    Submit LPP
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
