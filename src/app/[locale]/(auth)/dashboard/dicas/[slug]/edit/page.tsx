import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  saveBlogArticleAction,
  unpublishBlogArticleAction,
} from '@/app/actions/blog-admin';
import { AdminBackLink } from '@/components/admin/AdminBackLink';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlogArticleForm } from '@/components/admin/BlogArticleForm';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { blogAdminListPath } from '@/lib/admin-return-path';
import { getBlogArticleAdminBySlug } from '@/lib/blog-articles-db';
import { resolveAppLocale } from '@/utils/locale';

type BlogAdminEditProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string; status?: string; error?: string }>;
};

export async function generateMetadata(props: BlogAdminEditProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'BlogAdminPage',
  });
  return { title: t('edit_meta_title', { slug }) };
}

export default async function BlogAdminEditPage(props: BlogAdminEditProps) {
  const { locale, slug } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'BlogAdminPage',
  });
  const tCommon = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'AdminCommon',
  });

  const access = await requireDashboardAccess();
  if (!access.ok) {
    return <p className="py-8 text-sm text-neutral-600">{t('no_permission')}</p>;
  }

  const article = await getBlogArticleAdminBySlug(slug);
  if (!article) {
    notFound();
  }

  const listPath = blogAdminListPath({
    q: searchParams.q,
    status: searchParams.status,
  });

  const errorMessage =
    searchParams.error === 'seo'
      ? t('error_seo_incomplete')
      : searchParams.error === 'slug'
        ? t('error_slug_taken')
        : searchParams.error === 'validation'
          ? t('error_validation')
          : null;

  return (
    <div className="space-y-8">
      <AdminBackLink href={listPath} label={tCommon('back_to_list')} />
      <AdminPageHeader
        description={t('edit_description', { title: article.title })}
        title={t('edit_title')}
      />
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <BlogArticleForm
        action={saveBlogArticleAction}
        article={article}
        returnTo={listPath}
        unpublishAction={unpublishBlogArticleAction}
      />
    </div>
  );
}
