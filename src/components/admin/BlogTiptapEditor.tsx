'use client';

import type { JSONContent } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

type BlogTiptapEditorProps = {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  uploadSlug: string;
};

function ToolbarButton(props: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={props.label}
      aria-pressed={props.active}
      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        props.active
          ? 'bg-neutral-900 text-white'
          : 'bg-white text-neutral-700 hover:bg-neutral-100'
      }`}
      onClick={props.onClick}
      title={props.label}
      type="button"
    >
      {props.label}
    </button>
  );
}

/**
 * Rich text editor for blog articles (TipTap).
 */
export function BlogTiptapEditor(props: BlogTiptapEditorProps) {
  const t = useTranslations('BlogArticleForm');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full h-auto' },
      }),
      Placeholder.configure({
        placeholder: t('editor_placeholder'),
      }),
    ],
    content: props.content,
    onUpdate: ({ editor: current }) => {
      props.onChange(current.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-neutral max-w-none min-h-[280px] px-4 py-3 focus:outline-none prose-headings:font-heading',
      },
    },
  });

  const insertImage = async (file: File) => {
    if (!editor) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', props.uploadSlug || 'rascunho');

    const response = await fetch('/api/admin/blog/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as { url?: string };
    if (data.url) {
      editor.chain().focus().setImage({ src: data.url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(t('link_prompt'), previous ?? 'https://');
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-neutral-200 bg-neutral-50 p-2">
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          label="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          label="H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          active={editor.isActive('bold')}
          label={t('toolbar_bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          active={editor.isActive('italic')}
          label={t('toolbar_italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          active={editor.isActive('bulletList')}
          label={t('toolbar_bullet_list')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          active={editor.isActive('orderedList')}
          label={t('toolbar_ordered_list')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          active={editor.isActive('blockquote')}
          label={t('toolbar_quote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton label={t('toolbar_link')} onClick={setLink} />
        <ToolbarButton
          label={t('toolbar_image')}
          onClick={() => fileInputRef.current?.click()}
        />
        <ToolbarButton
          label={t('toolbar_undo')}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          label={t('toolbar_redo')}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <EditorContent editor={editor} />
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void insertImage(file);
          }
          event.target.value = '';
        }}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
