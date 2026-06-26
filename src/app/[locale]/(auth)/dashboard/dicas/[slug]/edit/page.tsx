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
  searchParams: Promise<{ q?: string; status?: string }>;
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

  return (
    <div className="space-y-8">
      <AdminBackLink href={listPath} label={tCommon('back_to_list')} />
      <AdminPageHeader
        description={t('edit_description', { title: article.title })}
        title={t('edit_title')}
      />
      <BlogArticleForm
        action={saveBlogArticleAction}
        article={article}
        returnTo={listPath}
        unpublishAction={unpublishBlogArticleAction}
      />
    </div>
  );
}
