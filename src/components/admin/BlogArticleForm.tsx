'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { BlogCoverUpload } from '@/components/admin/BlogCoverUpload';
import { BlogTiptapEditor } from '@/components/admin/BlogTiptapEditor';
import { AdminPendingButton } from '@/components/admin/AdminPendingButton';
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
  returnTo?: string;
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
  const tCommon = useTranslations('AdminCommon');
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

  return (
    <form action={props.action} className="space-y-8">
      {article ? <input name="articleId" type="hidden" value={article.id} /> : null}
      {props.returnTo ? <input name="returnTo" type="hidden" value={props.returnTo} /> : null}
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

        <BlogCoverUpload
          coverImageUrl={coverImageUrl}
          onChange={setCoverImageUrl}
          slug={slug || 'rascunho'}
        />
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
        <AdminPendingButton
          label={article?.status === 'published' ? t('save_changes') : t('save_draft')}
          name="intent"
          pendingLabel={tCommon('saving')}
          value="save"
          variant="outline"
        />
        <AdminPendingButton
          label={t('publish')}
          name="intent"
          pendingLabel={tCommon('publishing')}
          value="publish"
          variant="primary"
        />
        {article?.status === 'published' && props.unpublishAction ? (
          <AdminPendingButton
            formAction={props.unpublishAction}
            label={t('unpublish')}
            name="intent"
            onClick={(event) => {
              if (!window.confirm(t('unpublish_confirm'))) {
                event.preventDefault();
              }
            }}
            pendingLabel={tCommon('unpublishing')}
            value="unpublish"
            variant="outline"
          />
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
