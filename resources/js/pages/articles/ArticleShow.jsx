import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '@/bootstrap';
import { 
    Calendar, 
    Eye, 
    FileText, 
    ArrowLeft, 
    Edit2, 
    CheckCircle, 
    Globe, 
    Clock,
    User,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

// Components
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ArticleShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/articles/${id}`);
            setArticle(res.data);
        } catch (error) {
            console.error('Gagal memuat detail berita:', error);
            toast.error('Gagal memuat detail berita.');
            navigate('/articles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const handlePublish = async () => {
        setPublishing(true);
        try {
            await axios.post(`/articles/${id}/publish`);
            toast.success('Berita berhasil dipublikasikan!');
            fetchArticle();
        } catch (error) {
            console.error('Gagal mempublikasikan berita:', error);
            toast.error('Gagal mempublikasikan berita.');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
                <span className="text-xs text-slate-400 font-semibold">Memuat data berita...</span>
            </div>
        );
    }

    if (!article) return null;

    return (
        <div className="pt-2 pb-6 px-6 w-full space-y-6">
            {/* Navigation & Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Link to="/articles" className="hover:text-slate-800 transition-colors">Portal Berita</Link>
                        <span>›</span>
                        <span className="text-slate-800 font-medium">Detail Berita</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Detail & Preview Berita
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Link to="/articles">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <ArrowLeft size={16} />
                            Kembali
                        </Button>
                    </Link>
                    <Link to={`/articles/${article.id}/edit`}>
                        <Button variant="primary" className="flex items-center gap-2 bg-[#166534] hover:bg-[#14532d] text-white border-transparent">
                            <Edit2 size={16} />
                            Edit Berita
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Panel: Preview Berita */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
                        {/* Thumbnail */}
                        {article.thumbnail_path ? (
                            <div className="h-64 sm:h-96 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                                <img
                                    src={`/storage/${article.thumbnail_path}`}
                                    alt={article.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-48 w-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 border-b border-slate-100 gap-2">
                                <FileText size={48} />
                                <span className="text-xs text-slate-400">Tidak ada gambar sampul/thumbnail</span>
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
                                <span
                                    className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                                    style={{
                                        backgroundColor: `${article.category?.color || '#3b82f6'}15`,
                                        color: article.category?.color || '#3b82f6'
                                    }}
                                >
                                    {article.category?.name || 'Umum'}
                                </span>
                                <span className="text-slate-200">|</span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={13} />
                                    {article.published_at
                                        ? format(new Date(article.published_at), 'dd MMMM yyyy HH:mm', { locale: localeId })
                                        : 'Belum diterbitkan'}
                                </span>
                                <span className="text-slate-200">|</span>
                                <span className="flex items-center gap-1">
                                    <Eye size={13} />
                                    {article.view_count || 0} kali dibaca
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight mb-6">
                                {article.title}
                            </h2>

                            {/* Author Row */}
                            <div className="flex items-center gap-3 border-y border-slate-100 py-4 mb-6">
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 border border-slate-200">
                                    {article.author?.photo_path ? (
                                        <img
                                            src={`/storage/${article.author.photo_path}`}
                                            alt={article.author.name}
                                            className="h-full w-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User size={16} />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-sm">{article.author?.name || 'Staf Dinas'}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Penulis Dinas</span>
                                </div>
                            </div>

                            {/* Excerpt */}
                            {article.excerpt && (
                                <div className="bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r mb-6 text-sm text-slate-600 leading-relaxed italic">
                                    {article.excerpt}
                                </div>
                            )}

                            {/* Content Body */}
                            <div
                                className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-emerald-600 prose-a:underline hover:prose-a:text-emerald-800"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Sidebar Status & Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Status Publikasi
                        </h3>
                        
                        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded border border-slate-100">
                            <Badge
                                type={
                                    article.status === 'published'
                                        ? 'success'
                                        : article.status === 'draft'
                                        ? 'warning'
                                        : 'danger'
                                }
                            >
                                {article.status === 'published' ? 'Published' : article.status === 'draft' ? 'Draft' : 'Archived'}
                            </Badge>
                            <span className="text-xs font-semibold text-slate-500">
                                {article.is_public ? 'Terlihat Publik' : 'Terbatas'}
                            </span>
                        </div>

                        <div className="space-y-2 pt-2">
                            {article.status === 'draft' && (
                                <Button
                                    className="w-full bg-[#166534] hover:bg-[#14532d] text-white flex items-center justify-center gap-2"
                                    onClick={handlePublish}
                                    isLoading={publishing}
                                >
                                    <CheckCircle size={16} />
                                    Publikasikan Berita
                                </Button>
                            )}

                            {article.status === 'published' && (
                                <a
                                    href={`/news/${article.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full inline-flex items-center justify-center font-semibold rounded shadow-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 px-4 py-2.5 text-xs bg-[#166534] hover:bg-[#14532d] text-white border-transparent"
                                >
                                    <Globe size={16} className="mr-2" />
                                    Buka Halaman Publik
                                </a>
                            )}

                            <Link to={`/articles/${article.id}/edit`} className="block w-full">
                                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                    <Edit2 size={16} />
                                    Edit Berita
                                </Button>
                            </Link>

                            <Link to="/articles" className="block w-full">
                                <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                                    <ArrowLeft size={16} />
                                    Kembali ke Daftar
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Informasi Tambahan
                        </h3>
                        <div className="divide-y divide-slate-100 text-xs">
                            <div className="py-2.5 flex justify-between">
                                <span className="text-slate-500 font-semibold">Tipe Konten</span>
                                <span className="font-bold text-slate-700">Dinas Pendidikan</span>
                            </div>
                            <div className="py-2.5 flex justify-between">
                                <span className="text-slate-500 font-semibold">Di-pin di Atas</span>
                                <span className="font-bold text-slate-700">{article.is_pinned ? 'Ya' : 'Tidak'}</span>
                            </div>
                            <div className="py-2.5 flex justify-between">
                                <span className="text-slate-500 font-semibold">Dibuat Pada</span>
                                <span className="font-bold text-slate-700">
                                    {article.created_at ? format(new Date(article.created_at), 'dd MMM yyyy', { locale: localeId }) : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
