import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '@/bootstrap';
import { Calendar, Eye, FileText, ArrowLeft, User, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const NewsDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [latestArticles, setLatestArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticleData = async () => {
            setLoading(true);
            try {
                // Fetch current article
                const response = await axios.get(`/public/articles/${slug}`);
                setArticle(response.data);

                // Fetch other latest articles to show in the sidebar
                const latestRes = await axios.get('/public/articles');
                const filtered = latestRes.data.data
                    ? latestRes.data.data.filter((a) => a.slug !== slug).slice(0, 4)
                    : [];
                setLatestArticles(filtered);
            } catch (error) {
                console.error('Gagal memuat berita detail:', error);
                // Redirect to 404 if not found
                if (error.response?.status === 404) {
                    navigate('/not-found', { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchArticleData();
    }, [slug, navigate]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
                <span className="text-sm text-slate-500 font-semibold">Memuat halaman berita...</span>
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back button */}
                <Link
                    to="/news"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-8 transition-colors group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Portal Berita
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
                        {/* Meta information */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <span
                                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                style={{
                                    backgroundColor: `${article.category?.color || '#3b82f6'}15`,
                                    color: article.category?.color || '#3b82f6'
                                }}
                            >
                                {article.category?.name || 'Umum'}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {article.published_at
                                    ? format(new Date(article.published_at), 'dd MMMM yyyy HH:mm', { locale: id })
                                    : 'Draf'}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Eye size={12} />
                                {article.view_count || 0} kali dibaca
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                            {article.title}
                        </h1>

                        {/* Author Info */}
                        <div className="flex items-center gap-3 border-y border-slate-100 py-4 mb-8">
                            <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                                {article.author?.photo_path ? (
                                    <img
                                        src={`/storage/${article.author.photo_path}`}
                                        alt={article.author.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User size={18} className="text-slate-400" />
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">{article.author?.name || 'Humas Dinas'}</span>
                                <span className="text-xs text-slate-500 font-semibold">Penulis Dinas</span>
                            </div>
                        </div>

                        {/* Thumbnail image */}
                        {article.thumbnail_path && (
                            <div className="rounded-2xl overflow-hidden mb-8 border border-slate-100 shadow-sm max-h-[400px]">
                                <img
                                    src={`/storage/${article.thumbnail_path}`}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Article body HTML */}
                        <div
                            className="prose prose-blue prose-slate max-w-none text-slate-700 leading-relaxed text-base prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="flex flex-col gap-6">
                        {/* Other news card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 mb-4">
                                Berita Terkini Lainnya
                            </h3>
                            {latestArticles.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {latestArticles.map((latest) => (
                                        <div key={latest.id} className="flex gap-3 group">
                                            <div className="h-16 w-16 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                                                {latest.thumbnail_path ? (
                                                    <img
                                                        src={`/storage/${latest.thumbnail_path}`}
                                                        alt={latest.title}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                        <FileText size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h4 className="font-semibold text-slate-800 text-xs leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                                                    <Link to={`/news/${latest.slug}`}>
                                                        {latest.title}
                                                    </Link>
                                                </h4>
                                                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {latest.published_at
                                                        ? format(new Date(latest.published_at), 'd MMM yyyy', { locale: id })
                                                        : 'Draf'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">Belum ada berita lainnya.</p>
                            )}
                        </div>

                        {/* Virtual Loket Info */}
                        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
                            <h3 className="font-extrabold text-sm tracking-wider uppercase text-blue-300 mb-2">
                                Layanan Virtual Loket
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                Ajukan perbaikan ijazah Anda yang salah ketik atau salah data dengan mudah secara digital melalui SIMTAG virtual loket.
                            </p>
                            <Link
                                to="/track-ijazah"
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-center font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                Lacak Layanan Sekarang
                                <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
