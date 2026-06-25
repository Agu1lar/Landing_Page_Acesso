'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { BlogTiptapEditor } from '@/components/admin/BlogTiptapEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { slugifyEquipmentName } from '@/lib/equipment-slug';
import { emptyTiptapDoc } from '@/lib/blog-tiptap';
import type { BlogArticleAdminRow } from '@/types/blog-article';
import type { JSONContent } from '@tiptap/core';

type RelatedLinkRow = {
  label: string;
  href: string;
};

type BlogArticleFormProps = {
  action: (formData: FormData) => void;
  unpublishAction?: (formData: FormData) => void;
  article?: BlogArticleAdminRow;
};

function initialRelatedLinks(links: RelatedLinkRow[] | undefined): RelatedLinkRow[] {
  if (!links?.length) {
    return [{ label: '', href: '' }];
  }
  return links;
}

/**
 * Admin form for creating or editing blog articles.
 */
export function BlogArticleForm(props: BlogArticleFormProps) {
  const t = useTranslations('BlogArticleForm');
  const article = props.article;
  const [title, setTitle] = useState(article?.title ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugManual, setSlugManual] = useState(Boolean(article?.slug));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? '');
  const [content, setContent] = useState<JSONContent>(article?.content ?? emptyTiptapDoc());
  const [relatedLinks, setRelatedLinks] = useState(() =>
    initialRelatedLinks(article?.relatedLinks),
  );
  const [uploadingCover, setUploadingCover] = useState(false);

  const contentJson = useMemo(() => JSON.stringify(content), [content]);
  const relatedLinksJson = useMemo(
    () =>
      JSON.stringify(
        relatedLinks.filter((link) => link.label.trim() && link.href.trim()),
      ),
    [relatedLinks],
  );

  const updateTitle = (value: string) => {
    setTitle(value);
    if (!slugManual) {
      setSlug(slugifyEquipmentName(value));
    }
    if (!metaTitle.trim()) {
      setMetaTitle(value ? `${value} | Dicas Acesso` : '');
    }
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slug', slug || 'rascunho');
      const response = await fetch('/api/admin/blog/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = (await response.json()) as { url?: string };
        if (data.url) {
          setCoverImageUrl(data.url);
        }
      }
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <form action={props.action} className="space-y-8">
      {article ? <input name="articleId" type="hidden" value={article.id} /> : null}
      <input name="contentJson" type="hidden" value={contentJson} />
      <input name="relatedLinksJson" type="hidden" value={relatedLinksJson} />
      <input name="slug" type="hidden" value={slug} />
      <input name="coverImageUrl" type="hidden" value={coverImageUrl} />

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_main')}</h2>

        <Input
          id="title"
          label={t('field_title')}
          name="title"
          onChange={(event) => updateTitle(event.target.value)}
          required
          value={title}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="slug-visible">
            {t('field_slug')}
          </label>
          <input
            className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
            id="slug-visible"
            onChange={(event) => {
              setSlugManual(true);
              setSlug(event.target.value);
            }}
            value={slug}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="excerpt">
            {t('field_excerpt')}
          </label>
          <textarea
            className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
            id="excerpt"
            name="excerpt"
            onChange={(event) => setExcerpt(event.target.value)}
            required
            rows={3}
            value={excerpt}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_seo')}</h2>

        <Input
          id="metaTitle"
          label={t('field_meta_title')}
          name="metaTitle"
          onChange={(event) => setMetaTitle(event.target.value)}
          required
          value={metaTitle}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="metaDescription">
            {t('field_meta_description')}
          </label>
          <textarea
            className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
            id="metaDescription"
            name="metaDescription"
            onChange={(event) => setMetaDescription(event.target.value)}
            required
            rows={3}
            value={metaDescription}
          />
          <p className="mt-1 text-xs text-neutral-500">
            {t('meta_description_count', { count: metaDescription.length })}
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_cover')}</h2>

        {coverImageUrl ? (
          <div className="relative h-48 w-full max-w-md overflow-hidden rounded-lg bg-neutral-100">
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="400px"
              src={coverImageUrl}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <span className="inline-flex rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">
              {uploadingCover ? t('cover_uploading') : t('cover_upload')}
            </span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadCover(file);
                }
                event.target.value = '';
              }}
              type="file"
            />
          </label>
          {coverImageUrl ? (
            <Button
              onClick={() => setCoverImageUrl('')}
              type="button"
              variant="secondary"
            >
              {t('cover_remove')}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_content')}</h2>
        <BlogTiptapEditor content={content} onChange={setContent} uploadSlug={slug || 'rascunho'} />
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_related')}</h2>
        {relatedLinks.map((link, index) => (
          <div className="grid gap-2 sm:grid-cols-2" key={index}>
            <Input
              id={`related-label-${index}`}
              label={t('field_related_label')}
              onChange={(event) => {
                const next = [...relatedLinks];
                next[index] = { ...next[index]!, label: event.target.value };
                setRelatedLinks(next);
              }}
              value={link.label}
            />
            <Input
              id={`related-href-${index}`}
              label={t('field_related_href')}
              onChange={(event) => {
                const next = [...relatedLinks];
                next[index] = { ...next[index]!, href: event.target.value };
                setRelatedLinks(next);
              }}
              value={link.href}
            />
          </div>
        ))}
        <Button
          onClick={() => setRelatedLinks((rows) => [...rows, { label: '', href: '' }])}
          type="button"
          variant="secondary"
        >
          {t('add_related_link')}
        </Button>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button name="intent" type="submit" value="save">
          {article?.status === 'published' ? t('save_changes') : t('save_draft')}
        </Button>
        <Button name="intent" type="submit" value="publish" variant="primary">
          {t('publish')}
        </Button>
        {article?.status === 'published' && props.unpublishAction ? (
          <Button
            formAction={props.unpublishAction}
            name="intent"
            onClick={(event) => {
              if (!window.confirm(t('unpublish_confirm'))) {
                event.preventDefault();
              }
            }}
            type="submit"
            value="unpublish"
            variant="secondary"
          >
            {t('unpublish')}
          </Button>
        ) : null}
        {article?.status === 'published' ? (
          <a
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            href={`/dicas/${article.slug}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('view_public')}
          </a>
        ) : null}
      </div>
    </form>
  );
}
