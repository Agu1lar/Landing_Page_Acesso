import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  saveBlogArticleAction,
  unpublishBlogArticleAction,
} from '@/app/actions/blog-admin';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlogArticleForm } from '@/components/admin/BlogArticleForm';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { getBlogArticleAdminBySlug } from '@/lib/blog-articles-db';
import { resolveAppLocale } from '@/utils/locale';

type BlogAdminEditProps = {
  params: Promise<{ locale: string; slug: string }>;
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
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'BlogAdminPage',
  });

  const access = await requireDashboardAccess();
  if (!access.ok) {
    return <p className="py-8 text-sm text-neutral-600">{t('no_permission')}</p>;
  }

  const article = await getBlogArticleAdminBySlug(slug);
  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        description={t('edit_description', { title: article.title })}
        title={t('edit_title')}
      />
      <BlogArticleForm
        action={saveBlogArticleAction}
        article={article}
        unpublishAction={unpublishBlogArticleAction}
      />
    </div>
  );
}
