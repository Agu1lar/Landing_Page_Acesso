'use client';

import type { Editor } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { parseVideoEmbedUrl } from '@/lib/blog-tiptap-video';

type BlogCtaDialogProps = {
  editor: Editor;
  onClose: () => void;
};

/**
 * Dialog for inserting a call-to-action button block in blog content.
 */
export function BlogCtaDialog(props: BlogCtaDialogProps) {
  const t = useTranslations('BlogArticleForm');
  const [label, setLabel] = useState(t('cta_default_label'));
  const [href, setHref] = useState('/orcamento');
  const [openNewTab, setOpenNewTab] = useState(false);
  const [asDownload, setAsDownload] = useState(false);

  const insertCta = () => {
    const trimmedHref = href.trim();
    const trimmedLabel = label.trim();
    if (!trimmedHref || !trimmedLabel) {
      return;
    }

    props.editor
      .chain()
      .focus()
      .insertContent({
        type: 'ctaButton',
        attrs: {
          href: trimmedHref,
          label: trimmedLabel,
          download: asDownload ? trimmedHref.split('/').pop()?.split('?')[0] || true : null,
          target: openNewTab ? '_blank' : null,
        },
      })
      .run();
    props.onClose();
  };

  return (
    <div
      aria-labelledby="blog-cta-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-5 shadow-lg">
        <h3 className="font-heading text-base font-semibold text-neutral-900" id="blog-cta-dialog-title">
          {t('cta_dialog_title')}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{t('cta_dialog_hint')}</p>

        <label className="mt-4 block text-sm font-medium text-neutral-700" htmlFor="blog-cta-label">
          {t('cta_dialog_label')}
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          id="blog-cta-label"
          onChange={(event) => setLabel(event.target.value)}
          value={label}
        />

        <label className="mt-3 block text-sm font-medium text-neutral-700" htmlFor="blog-cta-href">
          {t('cta_dialog_href')}
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          id="blog-cta-href"
          onChange={(event) => setHref(event.target.value)}
          placeholder="/orcamento"
          value={href}
        />

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input checked={openNewTab} onChange={(event) => setOpenNewTab(event.target.checked)} type="checkbox" />
          {t('cta_dialog_new_tab')}
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
          <input checked={asDownload} onChange={(event) => setAsDownload(event.target.checked)} type="checkbox" />
          {t('cta_dialog_download')}
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={props.onClose}
            type="button"
          >
            {t('link_dialog_cancel')}
          </button>
          <button
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            onClick={insertCta}
            type="button"
          >
            {t('cta_dialog_insert')}
          </button>
        </div>
      </div>
    </div>
  );
}

type BlogVideoDialogProps = {
  editor: Editor;
  onClose: () => void;
  onUploadFile: (file: File) => Promise<void>;
  uploading: boolean;
};

/**
 * Dialog for embedding YouTube/Vimeo URLs or uploading a video file.
 */
export function BlogVideoDialog(props: BlogVideoDialogProps) {
  const t = useTranslations('BlogArticleForm');
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=');
  const [error, setError] = useState<string | null>(null);

  const insertEmbed = () => {
    const parsed = parseVideoEmbedUrl(url);
    if (!parsed) {
      setError(t('video_dialog_invalid'));
      return;
    }

    props.editor
      .chain()
      .focus()
      .insertContent({
        type: 'videoEmbed',
        attrs: {
          embedSrc: parsed.embedSrc,
          provider: parsed.provider,
        },
      })
      .run();
    props.onClose();
  };

  return (
    <div
      aria-labelledby="blog-video-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-5 shadow-lg">
        <h3 className="font-heading text-base font-semibold text-neutral-900" id="blog-video-dialog-title">
          {t('video_dialog_title')}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{t('video_dialog_hint')}</p>

        <label className="mt-4 block text-sm font-medium text-neutral-700" htmlFor="blog-video-url">
          {t('video_dialog_url')}
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          id="blog-video-url"
          onChange={(event) => {
            setUrl(event.target.value);
            setError(null);
          }}
          value={url}
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <p className="mt-4 text-sm font-medium text-neutral-700">{t('video_dialog_or_upload')}</p>
        <input
          accept="video/mp4,video/webm,.mp4,.webm"
          className="mt-2 block w-full text-sm"
          disabled={props.uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void props.onUploadFile(file).then(() => props.onClose());
            }
            event.target.value = '';
          }}
          type="file"
        />
        <p className="mt-1 text-xs text-neutral-500">{t('video_upload_hint')}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            onClick={props.onClose}
            type="button"
          >
            {t('link_dialog_cancel')}
          </button>
          <button
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            disabled={props.uploading}
            onClick={insertEmbed}
            type="button"
          >
            {t('video_dialog_insert')}
          </button>
        </div>
      </div>
    </div>
  );
}
