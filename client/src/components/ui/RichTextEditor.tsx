'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content if value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg, image/png, image/webp, image/gif';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        // Optionally inform the user uploading has started
        const uploadingToast = document.createElement('div');
        uploadingToast.innerText = 'Uploading image...';
        uploadingToast.style.position = 'fixed';
        uploadingToast.style.bottom = '20px';
        uploadingToast.style.right = '20px';
        uploadingToast.style.background = '#0070f3';
        uploadingToast.style.color = 'white';
        uploadingToast.style.padding = '10px 20px';
        uploadingToast.style.borderRadius = '5px';
        uploadingToast.style.zIndex = '9999';
        document.body.appendChild(uploadingToast);

        const formData = new FormData();
        formData.append('file', file);

        const data = await api.post<any>('/media', undefined, {
          formData,
          auth: true,
        });

        document.body.removeChild(uploadingToast);

        if (data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        } else {
          throw new Error('No URL returned from server');
        }
      } catch (err: any) {
        console.error('Upload error:', err);
        alert(err.message || 'An error occurred during image upload');
      }
    };

    input.click();
  }, [editor]);

  if (!editor) {
    return <div className={styles.editorContainer}>Loading editor...</div>;
  }

  return (
    <div className={styles.editorContainer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={styles.toolbarButton}
          data-active={editor.isActive('bold')}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={styles.toolbarButton}
          data-active={editor.isActive('italic')}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={styles.toolbarButton}
          data-active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={styles.toolbarButton}
          data-active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={styles.toolbarButton}
          data-active={editor.isActive('bulletList')}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={styles.toolbarButton}
          data-active={editor.isActive('orderedList')}
        >
          Numbered List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={styles.toolbarButton}
          data-active={editor.isActive('blockquote')}
        >
          Quote
        </button>
        <button type="button" onClick={setLink} className={styles.toolbarButton} data-active={editor.isActive('link')}>
          Link
        </button>
        <button type="button" onClick={addImage} className={styles.toolbarButton}>
          Image
        </button>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
