import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '@/bootstrap';
import { Search, ShieldAlert, CheckCircle2, Clock, FileSignature } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function IjazahTrack() {
    const [ticketNumber, setTicketNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: trackData, isLoading, isError, error } = useQuery({
        queryKey: ['track-ijazah', searchQuery],
        queryFn: async () => {
            if (!searchQuery) return null;
            const res = await axios.get(`/track/ijazah/${searchQuery}`);
            return res.data;
        },
        enabled: !!searchQuery,
        retry: false
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (ticketNumber.trim()) {
            setSearchQuery(ticketNumber.trim().toUpperCase());
        }
    };

    const ijazah = trackData?.data;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-white rounded shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-200">
                        <FileSignature size={32} className="text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Lacak Pengajuan Ijazah</h1>
                    <p className="text-slate-500 mt-2">Masukkan nomor tiket pengajuan untuk melihat status saat ini.</p>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="relative mb-8">
                    <div className="flex bg-white rounded shadow-sm border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
                        <div className="flex items-center pl-4 pr-2 text-slate-400">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            value={ticketNumber}
                            onChange={(e) => setTicketNumber(e.target.value)}
                            placeholder="Contoh: IJZ-20261012-001"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400 px-2 uppercase"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition-colors flex items-center disabled:opacity-50"
                        >
                            {isLoading ? 'Mencari...' : 'Lacak'}
                        </button>
                    </div>
                </form>

                {/* Results */}
                {isError && (
                    <div className="bg-red-50 border border-red-200 rounded p-6 text-center animate-in fade-in slide-in-from-bottom-2">
                        <ShieldAlert size={32} className="text-red-500 mx-auto mb-3" />
                        <h3 className="font-bold text-red-800 mb-1">Tiket Tidak Ditemukan</h3>
                        <p className="text-sm text-red-600">Pastikan nomor tiket yang Anda masukkan sudah benar.</p>
                    </div>
                )}

                {ijazah && (
                    <div className="bg-white border border-slate-200 rounded p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Tiket</p>
                                <h2 className="text-xl font-bold text-slate-800">{ijazah.ticket_number}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Diajukan</p>
                                <p className="text-sm font-medium text-slate-700">{new Date(ijazah.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Nama Siswa</p>
                                <p className="font-semibold text-slate-800">{ijazah.student_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">NISN</p>
                                <p className="font-semibold text-slate-800">{ijazah.nisn}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-slate-500 mb-0.5">Asal Sekolah</p>
                                <p className="font-semibold text-slate-800">{ijazah.institution?.name}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded p-5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Status Pengajuan</h3>
                            
                            <div className="flex items-start gap-4">
                                {ijazah.status === 'completed' || ijazah.status === 'ready_for_pickup' ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">Dokumen Siap Diambil</h4>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Revisi ijazah Anda telah selesai dan fisik dokumen sudah dapat diambil di Loket Pelayanan Dinas.
                                            </p>
                                        </div>
                                    </>
                                ) : ijazah.status === 'rejected' ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">Pengajuan Ditolak</h4>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Maaf, pengajuan ini ditolak oleh verifikator. Silakan hubungi sekolah terkait atau periksa kembali dokumen Anda.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">Dalam Proses</h4>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Pengajuan sedang diproses dan diverifikasi oleh petugas Cabang Dinas. Mohon menunggu informasi selanjutnya.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="text-center mt-8">
                    <Link to="/login" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">
                        &larr; Kembali ke halaman login
                    </Link>
                </div>
            </div>
        </div>
    );
}
