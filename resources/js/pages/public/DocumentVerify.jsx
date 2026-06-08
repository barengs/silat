import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldX, Search, FileText, Building2, User, Calendar, Loader2, Info } from 'lucide-react';
import axios from 'axios';

export default function DocumentVerify() {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    // Auto-verify if token is in URL
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
            handleVerify(urlToken);
        }
    }, []);

    const handleVerify = async (verifyToken) => {
        const tokenToVerify = verifyToken || token;
        if (!tokenToVerify.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setSearched(true);

        try {
            const res = await axios.get(`/verify/doc/${tokenToVerify.trim()}`);
            setResult(res.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Token verifikasi tidak ditemukan. Dokumen tidak terdaftar dalam sistem.');
            } else {
                setError('Terjadi kesalahan saat memverifikasi. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleVerify();
    };

    return (
        <div className="min-h-[70vh] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} className="text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Verifikasi Dokumen Elektronik</h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                        Verifikasi keaslian dokumen yang diterbitkan oleh Dinas Pendidikan Kabupaten Pamekasan melalui kode QR atau token verifikasi.
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Token Verifikasi
                        </label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Masukkan token atau scan QR Code..."
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !token.trim()}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Search size={16} />
                                )}
                                Verifikasi
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                            <Info size={12} />
                            Token dapat ditemukan pada QR Code di dokumen resmi yang diterbitkan.
                        </p>
                    </div>
                </form>

                {/* Results */}
                {loading && (
                    <div className="text-center py-12">
                        <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Memverifikasi dokumen...</p>
                    </div>
                )}

                {/* Success Result */}
                {result && result.valid && (
                    <div className="bg-white border border-emerald-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in duration-500">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Dokumen Terverifikasi</h2>
                                <p className="text-emerald-100 text-xs mt-0.5">{result.message}</p>
                            </div>
                        </div>

                        {/* Document Info */}
                        <div className="p-6 space-y-5">
                            {/* Document Type & Number */}
                            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Dokumen</p>
                                    <p className="text-sm font-bold text-slate-800 mt-0.5">{result.data.document_type}</p>
                                    <p className="text-xs text-slate-500 mt-1">Nomor: <span className="font-semibold text-slate-700">{result.data.document_number || '-'}</span></p>
                                </div>
                            </div>

                            {/* Institution */}
                            {result.data.institution && (
                                <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                        <Building2 size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instansi</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{result.data.institution}</p>
                                    </div>
                                </div>
                            )}

                            {/* Approver & Date */}
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                        <User size={20} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disetujui Oleh</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{result.data.approved_by}</p>
                                        <p className="text-xs text-slate-500">NIP: {result.data.approved_by_nip}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                        <Calendar size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Persetujuan</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{result.data.issued_at || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Fields */}
                            {result.data.details && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Detail Dokumen</p>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                        {Object.entries(result.data.details).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                                <span className="font-semibold text-slate-700 text-right max-w-[60%]">{value || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] text-slate-400">Status Dokumen</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    result.data.status === 'approved' || result.data.status === 'completed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {result.data.status}
                                </span>
                            </div>

                            {/* Verification Timestamp */}
                            <div className="text-center pt-3 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400">
                                    Diverifikasi pada: {result.data.verification_at}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Result */}
                {error && searched && !loading && (
                    <div className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in duration-500">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                <ShieldX size={24} />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Dokumen Tidak Ditemukan</h2>
                                <p className="text-red-100 text-xs mt-0.5">{error}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                <p className="text-xs text-red-700 leading-relaxed">
                                    Token verifikasi yang Anda masukkan tidak terdaftar dalam sistem kami. 
                                    Hal ini bisa berarti:
                                </p>
                                <ul className="text-xs text-red-600 mt-2 space-y-1 list-disc list-inside">
                                    <li>Token yang dimasukkan salah atau tidak lengkap</li>
                                    <li>Dokumen belum melewati proses persetujuan final</li>
                                    <li>Dokumen bukan diterbitkan oleh Dinas Pendidikan Kab. Pamekasan</li>
                                </ul>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 text-center">
                                Jika Anda yakin dokumen ini asli, silakan hubungi Dinas Pendidikan Kabupaten Pamekasan untuk konfirmasi.
                            </p>
                        </div>
                    </div>
                )}

                {/* Initial state - no search yet */}
                {!searched && !loading && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                            <Info size={14} className="text-slate-400" />
                            <p className="text-xs text-slate-500">
                                Masukkan token verifikasi dari dokumen resmi atau scan QR Code pada surat yang diterbitkan.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
