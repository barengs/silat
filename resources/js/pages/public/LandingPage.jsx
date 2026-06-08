import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '@/bootstrap';
import { FileText, Search, ShieldCheck, ArrowRight, BookOpen, Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const LandingPage = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestArticles = async () => {
            try {
                const response = await axios.get('/public/articles');
                // Taking first 3 articles
                setArticles(response.data.data ? response.data.data.slice(0, 3) : []);
            } catch (error) {
                console.error('Gagal memuat berita terbaru:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestArticles();
    }, []);

    const ServiceCard = ({ icon: Icon, title, description, linkTo, color }) => (
        <div className="bg-white rounded border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
                <div className={`h-12 w-12 rounded flex items-center justify-center ${color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-900 transition-colors">
                    {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {description}
                </p>
            </div>
            <Link
                to={linkTo}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
                Akses Layanan
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white py-24 px-4 sm:px-6 lg:px-8 flex items-center min-h-[500px]">
                {/* Batik background overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                    style={{ backgroundImage: "url('/images/batik.png')" }}
                ></div>
                {/* Background decorative patterns */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_40%)] pointer-events-none" />
                <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="max-w-3xl">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-6 uppercase tracking-wider">
                            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                            Portal Layanan Terintegrasi
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                            Digitalisasi Tata Kelola <br className="hidden sm:inline" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                                Pendidikan Pamekasan
                            </span>
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
                            Selamat datang di SILAT (Sistem Layanan Terpadu) Dinas Pendidikan dan Kebudayan Kabupaten Pamekasan. Kami berkomitmen memberikan layanan virtual yang transparan, mudah, dan akuntabel.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/news"
                                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 font-semibold rounded shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all text-sm flex items-center gap-2"
                            >
                                <BookOpen size={16} />
                                Lihat Portal Berita
                            </Link>
                            <Link
                                to="/track-ijazah"
                                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 font-semibold rounded active:scale-[0.98] transition-all text-sm flex items-center gap-2"
                            >
                                <Search size={16} />
                                Lacak Berkas Ijazah
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Services Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 relative z-20 -mt-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ServiceCard
                            icon={Search}
                            title="Lacak Revisi Ijazah"
                            description="Periksa status pengajuan revisi ijazah Anda secara langsung tanpa login, cukup menggunakan nomor tiket pengajuan Anda."
                            linkTo="/track-ijazah"
                            color="bg-blue-600 shadow-blue-500/10"
                        />
                        <ServiceCard
                            icon={ShieldCheck}
                            title="Verifikasi Dokumen TTE"
                            description="Verifikasi keabsahan dokumen dinas (SPPD / Surat Rekomendasi Bank) hasil tanda tangan elektronik menggunakan scan kode QR."
                            linkTo="/verify-document"
                            color="bg-emerald-600 shadow-emerald-500/10"
                        />
                        <ServiceCard
                            icon={FileText}
                            title="Buku Tamu Digital"
                            description="Formulir buku tamu bagi tamu eksternal yang melakukan kunjungan kerja ke kantor Dinas Pendidikan dan Kebudayaan Kabupaten Pamekasan."
                            linkTo="/login"
                            color="bg-indigo-600 shadow-indigo-500/10"
                        />
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                                Kabar Pendidikan
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                                Berita & Pengumuman Terbaru
                            </h2>
                        </div>
                        <Link
                            to="/news"
                            className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Selengkapnya
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="animate-pulse flex flex-col gap-4">
                                    <div className="bg-slate-200 h-48 rounded w-full" />
                                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                                    <div className="h-4 bg-slate-200 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    ) : articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {articles.map((article) => (
                                <article
                                    key={article.id}
                                    className="bg-white rounded overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                            {article.thumbnail_path ? (
                                                <img
                                                    src={`/storage/${article.thumbnail_path}`}
                                                    alt={article.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-300">
                                                    <FileText size={48} />
                                                </div>
                                            )}
                                            {article.is_pinned === 1 && (
                                                <span className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                    Penting
                                                </span>
                                            )}
                                        </div>

                                        {/* Info Block */}
                                        <div className="p-6">
                                            <span
                                                className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3"
                                                style={{
                                                    backgroundColor: `${article.category?.color || '#3b82f6'}15`,
                                                    color: article.category?.color || '#3b82f6'
                                                }}
                                            >
                                                {article.category?.name || 'Umum'}
                                            </span>
                                            <h3 className="font-bold text-slate-800 text-lg leading-snug mb-2 hover:text-blue-600 transition-colors">
                                                <Link to={`/news/${article.slug}`}>
                                                    {article.title}
                                                </Link>
                                            </h3>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                                                {article.excerpt || 'Tidak ada kutipan singkat.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Author & Footer info */}
                                    <div className="p-6 pt-0 border-t border-slate-50 mt-4 flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {article.published_at
                                                ? format(new Date(article.published_at), 'd MMMM yyyy', { locale: id })
                                                : 'Draf'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} />
                                            {article.view_count || 0} kali dibaca
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            Belum ada berita atau pengumuman yang dipublikasikan.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
