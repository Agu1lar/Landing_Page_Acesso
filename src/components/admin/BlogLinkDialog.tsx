'use client';

import type { Editor } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { BlogLinkKind } from '@/lib/blog-tiptap-extensions';
import { blogLinkAttributes } from '@/lib/blog-tiptap-extensions';

type BlogLinkDialogProps = {
  editor: Editor;
  onClose: () => void;
};

/**
 * Dialog for inserting redirect, new-tab or download links in blog content.
 */
export function BlogLinkDialog(props: BlogLinkDialogProps) {
  const t = useTranslations('BlogArticleForm');
  const previous = props.editor.getAttributes('link');
  const [href, setHref] = useState(String(previous.href ?? 'https://'));
  const [kind, setKind] = useState<BlogLinkKind>(
    previous.download ? 'download' : previous.target === '_blank' ? 'new_tab' : 'redirect',
  );

  const applyLink = () => {
    const attrs = blogLinkAttributes({ href, kind });
    if (!attrs) {
      props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
      props.onClose();
      return;
    }

    props.editor.chain().focus().extendMarkRange('link').setLink(attrs).run();
    props.onClose();
  };

  const removeLink = () => {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    props.onClose();
  };

  return (
    <div
      aria-labelledby="blog-link-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-5 shadow-lg">
        <h3 className="font-heading text-base font-semibold text-neutral-900" id="blog-link-dialog-title">
          {t('link_dialog_title')}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{t('link_dialog_hint')}</p>

        <label className="mt-4 block text-sm font-medium text-neutral-700" htmlFor="blog-link-href">
          {t('link_dialog_url')}
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          id="blog-link-href"
          onChange={(event) => setHref(event.target.value)}
          placeholder="/orcamento"
          value={href}
        />

        <fieldset className="mt-4 space-y-2">
          <legend className="text-sm font-medium text-neutral-700">{t('link_dialog_kind_label')}</legend>
          <label className="flex items-start gap-2 text-sm text-neutral-700">
            <input
              checked={kind === 'redirect'}
              name="link-kind"
              onChange={() => setKind('redirect')}
              type="radio"
            />
            <span>
              <span className="font-medium">{t('link_kind_redirect')}</span>
              <span className="block text-xs text-neutral-500">{t('link_kind_redirect_hint')}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-neutral-700">
            <input
              checked={kind === 'new_tab'}
              name="link-kind"
              onChange={() => setKind('new_tab')}
              type="radio"
            />
            <span>
              <span className="font-medium">{t('link_kind_new_tab')}</span>
              <span className="block text-xs text-neutral-500">{t('link_kind_new_tab_hint')}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-neutral-700">
            <input
              checked={kind === 'download'}
              name="link-kind"
              onChange={() => setKind('download')}
              type="radio"
            />
            <span>
              <span className="font-medium">{t('link_kind_download')}</span>
              <span className="block text-xs text-neutral-500">{t('link_kind_download_hint')}</span>
            </span>
          </label>
        </fieldset>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={removeLink}
            type="button"
          >
            {t('link_dialog_remove')}
          </button>
          <button
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={props.onClose}
            type="button"
          >
            {t('link_dialog_cancel')}
          </button>
          <button
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            onClick={applyLink}
            type="button"
          >
            {t('link_dialog_apply')}
          </button>
        </div>
      </div>
    </div>
  );
}
