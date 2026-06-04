import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '@/bootstrap';
import { Search, Calendar, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const NewsPage = () => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch categories and articles
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/public/categories');
                setCategories(res.data);
            } catch (error) {
                console.error('Gagal memuat kategori:', error);
            }
        };

        fetchCategories();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/public/articles', {
                params: {
                    q: searchQuery,
                    category_id: selectedCategory,
                    page: page
                }
            });
            setArticles(response.data.data || []);
            setTotalPages(response.data.last_page || 1);
        } catch (error) {
            console.error('Gagal memuat berita:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [selectedCategory, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchArticles();
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                        Portal Berita
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                        Berita & Pengumuman Dinas
                    </h1>
                    <p className="text-slate-500 text-sm max-w-2xl mx-auto mt-2">
                        Dapatkan informasi terbaru mengenai regulasi, kebijakan, info BOS, agenda kegiatan, dan berita lainnya seputar dunia pendidikan di Kabupaten Pamekasan.
                    </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
                    {/* Search form */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                        <input
                            type="text"
                            placeholder="Cari judul berita..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
                        />
                        <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                        <button type="submit" className="hidden">Cari</button>
                    </form>

                    {/* Category filters */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                        <button
                            onClick={() => { setSelectedCategory('all'); setPage(1); }}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                selectedCategory === 'all'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                    selectedCategory === cat.id
                                        ? 'text-white border-transparent shadow-md shadow-slate-900/10'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                                style={
                                    selectedCategory === cat.id
                                        ? { backgroundColor: cat.color }
                                        : {}
                                }
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* News Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="animate-pulse flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                                <div className="bg-slate-200 h-44 rounded-xl w-full" />
                                <div className="h-4 bg-slate-200 rounded w-1/4" />
                                <div className="h-6 bg-slate-200 rounded w-3/4" />
                                <div className="h-4 bg-slate-200 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : articles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            {articles.map((article) => (
                                <article
                                    key={article.id}
                                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                                            {article.thumbnail_path ? (
                                                <img
                                                    src={`/storage/${article.thumbnail_path}`}
                                                    alt={article.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300">
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
                                            <h3 className="font-bold text-slate-800 text-base leading-snug mb-2 hover:text-blue-600 transition-colors">
                                                <Link to={`/news/${article.slug}`}>
                                                    {article.title}
                                                </Link>
                                            </h3>
                                            <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs text-slate-600 font-semibold px-3">
                                    Halaman {page} dari {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">
                        Tidak ada berita atau pengumuman yang sesuai dengan pencarian Anda.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsPage;
