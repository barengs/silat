import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '@/bootstrap';
import { ArrowLeft, Save, Eye, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Components
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import FormGroup from '@/components/ui/FormGroup';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Modal from '@/components/ui/Modal';

// Helper to extract clean excerpt text from HTML content
const getExcerptFromHtml = (htmlContent) => {
    if (!htmlContent) return '';
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const text = doc.body.textContent || "";
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (cleanText.length <= 160) {
        return cleanText;
    }
    return cleanText.substring(0, 160) + '...';
};

const ArticleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    // Form states
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [isPinned, setIsPinned] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    // Thumbnail upload states
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    // Modal verification states
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [saveModalOpen, setSaveModalOpen] = useState(false);

    // Reference states
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/article-categories');
                setCategories(res.data);
                if (res.data.length > 0 && !isEdit) {
                    setCategoryId(res.data[0].id);
                }
            } catch (error) {
                console.error('Gagal memuat kategori:', error);
            }
        };

        const fetchArticleData = async () => {
            if (!isEdit) return;
            setLoading(true);
            try {
                const res = await axios.get(`/articles/${id}`);
                const art = res.data;
                setTitle(art.title || '');
                setCategoryId(art.category_id || '');
                setContent(art.content || '');
                setStatus(art.status || 'draft');
                setIsPinned(art.is_pinned === 1 || art.is_pinned === true);
                setIsPublic(art.is_public === 1 || art.is_public === true);
                
                if (art.thumbnail_path) {
                    setThumbnailPreview(`/storage/${art.thumbnail_path}`);
                }
            } catch (error) {
                console.error('Gagal memuat detail berita:', error);
                toast.error('Gagal memuat detail berita.');
                navigate('/articles');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        fetchArticleData();
    }, [id, isEdit, navigate]);

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const handleCancelClick = () => {
        setCancelModalOpen(true);
    };

    const handleSaveClick = () => {
        if (!title.trim() || !content.trim() || !categoryId) {
            toast.error('Harap lengkapi judul, kategori, dan konten berita sebelum menyimpan.');
            return;
        }
        setSaveModalOpen(true);
    };

    const submitForm = async () => {
        setSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category_id', categoryId);
        formData.append('excerpt', getExcerptFromHtml(content));
        formData.append('content', content);
        formData.append('status', status);
        formData.append('is_pinned', isPinned ? '1' : '0');
        formData.append('is_public', isPublic ? '1' : '0');

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        try {
            const headers = {
                'Content-Type': 'multipart/form-data'
            };

            if (isEdit) {
                // Laravel multipart form data emulation on PUT/PATCH
                formData.append('_method', 'PUT');
                await axios.post(`/articles/${id}`, formData, { headers });
                toast.success('Berita berhasil diperbarui!');
            } else {
                await axios.post('/articles', formData, { headers });
                toast.success('Berita berhasil ditambahkan!');
            }

            navigate('/articles');
        } catch (error) {
            console.error('Gagal menyimpan berita:', error);
            toast.error(error.response?.data?.message || 'Gagal menyimpan berita.');
        } finally {
            setSubmitting(false);
            setSaveModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <span className="text-xs text-slate-400 font-semibold">Memuat formulir berita...</span>
            </div>
        );
    }

    return (
        <div className="pt-2 pb-6 px-6 w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        className="p-2 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <Sparkles size={20} className="text-blue-500" />
                            {isEdit ? 'Sunting Berita' : 'Tulis Berita Baru'}
                        </h1>
                        <p className="text-sm text-slate-500 font-semibold">
                            {isEdit ? 'Perbarui informasi dan rincian konten berita.' : 'Tulis berita, pengumuman, atau konten edukasi untuk satuan pendidikan.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={handleCancelClick}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        type="button"
                        onClick={handleSaveClick}
                        disabled={submitting}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <Save size={16} />
                        {submitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Berita')}
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Main Content Fields (Left 2 Columns) */}
                <div className="lg:col-span-2 bg-white rounded border border-slate-200 p-5 shadow-sm space-y-5">
                    {/* Title */}
                    <FormGroup label="Judul Berita/Pengumuman" required>
                        <Input
                            type="text"
                            placeholder="Masukkan judul berita yang menarik..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-bold text-lg text-slate-900"
                            required
                        />
                    </FormGroup>



                    {/* Content (Tiptap RichTextEditor) */}
                    <FormGroup label="Konten Berita" required>
                        <RichTextEditor
                            value={content}
                            onChange={(html) => setContent(html)}
                        />
                    </FormGroup>
                </div>

                {/* Sidebar Fields (Right Column) */}
                <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-5">
                    <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3">
                        Pengaturan Publikasi
                    </h3>

                    {/* Category */}
                    <FormGroup label="Kategori Berita" required>
                        <Select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Select>
                    </FormGroup>

                    {/* Thumbnail Upload */}
                    <FormGroup label="Gambar Sampul (Thumbnail)">
                        <div className="flex flex-col gap-3">
                            {thumbnailPreview ? (
                                <div className="relative rounded overflow-hidden border border-slate-200 bg-slate-50 h-40">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Pratinjau Sampul"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setThumbnailFile(null);
                                            setThumbnailPreview('');
                                        }}
                                        className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-1.5 text-xs transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => document.getElementById('thumbnail-input').click()}
                                    className="border-2 border-dashed border-slate-200 rounded h-40 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/50 hover:border-blue-400 transition-all group"
                                >
                                    <ImageIcon size={28} className="text-slate-400 group-hover:scale-105 transition-transform" />
                                    <span className="text-xs font-semibold text-slate-500">Unggah Gambar Sampul</span>
                                    <span className="text-[10px] text-slate-400">Max 2MB (Format: JPG/PNG/WebP)</span>
                                </div>
                            )}
                            <input
                                id="thumbnail-input"
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="hidden"
                            />
                        </div>
                    </FormGroup>

                    {/* Status select */}
                    <FormGroup label="Status Publikasi" required>
                        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="draft">Draf</option>
                            <option value="published">Terbitkan Langsung</option>
                            <option value="archived">Diarsipkan</option>
                        </Select>
                    </FormGroup>



                    {/* Flags Checkboxes */}
                    <div className="flex flex-col gap-3.5 pt-3 border-t border-slate-100">
                        <Checkbox
                            id="pinned-checkbox"
                            checked={isPinned}
                            onChange={(e) => setIsPinned(e.target.checked)}
                            label="Sematkan di Atas (Pin)"
                        />
                        <Checkbox
                            id="public-checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            label="Tampilkan ke Publik"
                        />
                    </div>

                    {/* Actions Spacer */}
                    <div className="pt-2" />
                </div>
            </form>

            {/* Cancel Confirmation Modal */}
            <Modal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                title="Batalkan Tulis Berita"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                        Apakah Anda yakin ingin membatalkan? Semua perubahan atau draf berita yang Anda tulis akan hilang secara permanen.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setCancelModalOpen(false)}
                            className="px-4 py-2"
                        >
                            Tetap di Sini
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                setCancelModalOpen(false);
                                navigate('/articles');
                            }}
                            className="px-4 py-2"
                        >
                            Ya, Batalkan
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Save Confirmation Modal */}
            <Modal
                isOpen={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                title="Konfirmasi Simpan Berita"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                        Apakah Anda yakin data berita yang dimasukkan sudah benar? Berita akan disimpan dengan status <span className="font-extrabold text-teal-600 uppercase">"{status === 'published' ? 'Terbit Langsung' : status}"</span>.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setSaveModalOpen(false)}
                            className="px-4 py-2"
                        >
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            onClick={submitForm}
                            disabled={submitting}
                            className="px-4 py-2"
                        >
                            {submitting ? 'Menyimpan...' : 'Ya, Simpan'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ArticleForm;
