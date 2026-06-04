import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import axios from '@/bootstrap';
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Code
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Tulis konten di sini...' }) => {
    const fileInputRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800'
                }
            }),
            ImageExtension.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4 shadow-md mx-auto block'
                }
            })
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-blue focus:outline-none min-h-[300px] max-h-[600px] overflow-y-auto px-4 py-3 bg-white text-gray-800 rounded-b-lg border-x border-b border-gray-200'
            }
        }
    });

    // Update content when value changes externally (e.g. on edit fetch load)
    React.useEffect(() => {
        if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor || editor.isDestroyed) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Masukkan URL link:', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('/articles/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.url) {
                editor.chain().focus().setImage({ src: response.data.url }).run();
            }
        } catch (error) {
            console.error('Gagal mengunggah gambar:', error);
            alert('Gagal mengunggah gambar. Pastikan format file adalah gambar dan ukuran maksimal 5MB.');
        } finally {
            // Reset input file value
            e.target.value = '';
        }
    };

    const ToolbarButton = ({ onClick, isActive, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-gray-600'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-col border border-gray-200 rounded-lg shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Tebal (Bold)"
                >
                    <Bold size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Miring (Italic)"
                >
                    <Italic size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Coret (Strikethrough)"
                >
                    <Strikethrough size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Kode"
                >
                    <Code size={16} />
                </ToolbarButton>

                <div className="h-6 w-[1px] bg-gray-200 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 size={16} />
                </ToolbarButton>

                <div className="h-6 w-[1px] bg-gray-200 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Daftar Bulatan (Bullet List)"
                >
                    <List size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Daftar Angka (Ordered List)"
                >
                    <ListOrdered size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Kutipan (Blockquote)"
                >
                    <Quote size={16} />
                </ToolbarButton>

                <div className="h-6 w-[1px] bg-gray-200 mx-1" />

                <ToolbarButton
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    title="Tambah Link"
                >
                    <LinkIcon size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={triggerImageUpload}
                    title="Unggah Gambar"
                >
                    <ImageIcon size={16} />
                </ToolbarButton>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                />

                <div className="h-6 w-[1px] bg-gray-200 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo size={16} />
                </ToolbarButton>
            </div>

            {/* Editor Content Area */}
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
