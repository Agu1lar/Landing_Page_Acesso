import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { saveBlogArticleAction } from '@/app/actions/blog-admin';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlogArticleForm } from '@/components/admin/BlogArticleForm';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { resolveAppLocale } from '@/utils/locale';

type BlogAdminNewProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: BlogAdminNewProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'BlogAdminPage',
  });
  return { title: t('new_meta_title') };
}

export default async function BlogAdminNewPage(props: BlogAdminNewProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'BlogAdminPage',
  });

  const access = await requireDashboardAccess();
  if (!access.ok) {
    return <p className="py-8 text-sm text-neutral-600">{t('no_permission')}</p>;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader description={t('new_description')} title={t('new_title')} />
      <BlogArticleForm action={saveBlogArticleAction} />
    </div>
  );
}
