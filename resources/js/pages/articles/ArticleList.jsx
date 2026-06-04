import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '@/bootstrap';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Globe,
    FolderPlus,
    Eye,
    CheckCircle,
    Calendar,
    Pin,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Components
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import FormGroup from '@/components/ui/FormGroup';

const ArticleList = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Category Modal CRUD states
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [catFormName, setCatFormName] = useState('');
    const [catFormColor, setCatFormColor] = useState('#3b82f6');
    const [editingCatId, setEditingCatId] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/article-categories');
            setCategories(res.data);
            setCategoriesList(res.data);
        } catch (error) {
            console.error('Gagal memuat kategori:', error);
        }
    };

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/articles', {
                params: {
                    q: searchQuery,
                    status: statusFilter,
                    category_id: categoryFilter,
                    page: page
                }
            });
            setArticles(res.data.data || []);
            setTotalPages(res.data.last_page || 1);
        } catch (error) {
            console.error('Gagal memuat daftar berita:', error);
            toast.error('Gagal memuat daftar berita.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [statusFilter, categoryFilter, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchArticles();
    };

    const handlePublish = async (articleId) => {
        try {
            await axios.post(`/articles/${articleId}/publish`);
            toast.success('Berita berhasil dipublikasikan!');
            fetchArticles();
        } catch (error) {
            console.error('Gagal mempublikasikan berita:', error);
            toast.error('Gagal mempublikasikan berita.');
        }
    };

    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus berita ini secara permanen?')) return;

        try {
            await axios.delete(`/articles/${articleId}`);
            toast.success('Berita berhasil dihapus.');
            fetchArticles();
        } catch (error) {
            console.error('Gagal menghapus berita:', error);
            toast.error('Gagal menghapus berita.');
        }
    };

    // Category CRUD helpers
    const handleSaveCategory = async (e) => {
        e.preventDefault();
        if (!catFormName.trim()) return;

        try {
            const data = { name: catFormName, color: catFormColor };

            if (editingCatId) {
                await axios.put(`/article-categories/${editingCatId}`, data);
                toast.success('Kategori berhasil diperbarui.');
            } else {
                await axios.post('/article-categories', data);
                toast.success('Kategori berhasil ditambahkan.');
            }

            setCatFormName('');
            setCatFormColor('#3b82f6');
            setEditingCatId(null);
            fetchCategories();
        } catch (error) {
            console.error('Gagal menyimpan kategori:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan kategori.');
        }
    };

    const handleDeleteCategory = async (catId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

        try {
            await axios.delete(`/article-categories/${catId}`);
            toast.success('Kategori berhasil dihapus.');
            fetchCategories();
        } catch (error) {
            console.error('Gagal menghapus kategori:', error);
            toast.error(error.response?.data?.message || 'Gagal menghapus kategori.');
        }
    };

    return (
        <div className="pt-2 pb-6 px-6 w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Portal Berita & Pengumuman
                    </h1>
                    <p className="text-sm text-slate-500 font-semibold mt-1">
                        Tulis dan kelola artikel, berita utama, serta pengumuman penting dinas.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setCategoryModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <FolderPlus size={16} />
                        Kelola Kategori
                    </Button>
                    <Link to="/articles/create">
                        <Button variant="primary" className="flex items-center gap-2">
                            <Plus size={16} />
                            Tulis Berita
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Articles Table Card (Unified with Filters) */}
            <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
                
                {/* Search & Filter Header */}
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                        <Input
                            type="text"
                            placeholder="Cari judul berita..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                        <button type="submit" className="hidden">Cari</button>
                    </form>

                    <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
                        <FormGroup label="Kategori" className="w-full sm:w-44 mb-0">
                            <Select
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                            >
                                <option value="all">Semua Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup label="Status" className="w-full sm:w-44 mb-0">
                            <Select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            >
                                <option value="all">Semua Status</option>
                                <option value="draft">Draft</option>
                                <option value="published">Diterbitkan</option>
                                <option value="archived">Diarsipkan</option>
                            </Select>
                        </FormGroup>
                    </div>
                </div>
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                        <span className="text-xs text-slate-400 font-semibold">Memuat data berita...</span>
                    </div>
                ) : articles.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                                    <th className="px-6 py-4">Judul Berita</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Publikasi</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-slate-50/40 transition-colors">
                                        <td className="px-6 py-4 max-w-sm">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 font-bold text-slate-900 line-clamp-2">
                                                    {article.is_pinned === 1 && (
                                                        <Pin size={14} className="text-amber-500 shrink-0 fill-amber-500" />
                                                    )}
                                                    {article.title}
                                                </div>
                                                <span className="text-slate-400 text-xs mt-1 truncate">
                                                    {article.excerpt || 'Tidak ada kutipan singkat.'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: `${article.category?.color || '#3b82f6'}15`,
                                                    color: article.category?.color || '#3b82f6'
                                                }}
                                            >
                                                {article.category?.name || 'Umum'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={13} className="text-slate-400" />
                                                {article.published_at
                                                    ? format(new Date(article.published_at), 'dd MMM yyyy HH:mm', { locale: id })
                                                    : 'Belum dijadwalkan'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
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
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-1.5">
                                                <Link to={`/articles/${article.id}`}>
                                                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors" title="Preview & Detail Berita">
                                                        <Eye size={15} />
                                                    </button>
                                                </Link>
                                                {article.status === 'draft' && (
                                                    <button
                                                        onClick={() => handlePublish(article.id)}
                                                        className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600 hover:text-emerald-800 transition-colors"
                                                        title="Publikasikan Sekarang"
                                                    >
                                                        <CheckCircle size={15} />
                                                    </button>
                                                )}
                                                <Link to={`/articles/${article.id}/edit`}>
                                                    <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-800 transition-colors" title="Edit">
                                                        <Edit2 size={15} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteArticle(article.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded text-red-600 hover:text-red-800 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={36} className="text-slate-300" />
                        <span className="font-semibold text-sm">Belum ada berita terdaftar.</span>
                        <span className="text-xs text-slate-400">Gunakan tombol "Tulis Berita" di atas untuk menambahkan berita pertama.</span>
                    </div>
                )}
            </div>

            {/* Category Management Modal */}
            <Modal
                isOpen={categoryModalOpen}
                onClose={() => {
                    setCategoryModalOpen(false);
                    setCatFormName('');
                    setCatFormColor('#3b82f6');
                    setEditingCatId(null);
                }}
                title="Kelola Kategori Berita"
            >
                <div className="space-y-6">
                    {/* Add/Edit Form */}
                    <form onSubmit={handleSaveCategory} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-4">
                        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                            {editingCatId ? 'Edit Kategori' : 'Kategori Baru'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <FormGroup label="Nama Kategori" className="sm:col-span-2 mb-0">
                                <Input
                                    type="text"
                                    placeholder="Contoh: Info BOS, Prestasi"
                                    value={catFormName}
                                    onChange={(e) => setCatFormName(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup label="Warna Label" className="mb-0">
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="color"
                                        value={catFormColor}
                                        onChange={(e) => setCatFormColor(e.target.value)}
                                        className="h-10 p-0 cursor-pointer w-14 shrink-0 rounded"
                                    />
                                    <span className="text-xs font-semibold text-slate-500 font-mono">
                                        {catFormColor}
                                    </span>
                                </div>
                            </FormGroup>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            {editingCatId && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setEditingCatId(null);
                                        setCatFormName('');
                                        setCatFormColor('#3b82f6');
                                    }}
                                >
                                    Batal
                                </Button>
                            )}
                            <Button variant="primary" size="sm" type="submit">
                                {editingCatId ? 'Simpan' : 'Tambah'}
                            </Button>
                        </div>
                    </form>

                    {/* Category List */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">
                            Daftar Kategori Terdaftar
                        </h4>
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded">
                            {categoriesList.length > 0 ? (
                                categoriesList.map((cat) => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="h-3.5 w-3.5 rounded-full shrink-0"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <span className="font-bold text-slate-800 text-sm">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingCatId(cat.id);
                                                    setCatFormName(cat.name);
                                                    setCatFormColor(cat.color || '#3b82f6');
                                                }}
                                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-1 hover:bg-red-50 rounded text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-xs text-slate-400">Belum ada kategori ditambahkan.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ArticleList;
