import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import {
  publishBlogArticleAction,
  unpublishBlogArticleAction,
} from '@/app/actions/blog-admin';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BlogPublishForm } from '@/components/admin/BlogPublishForm';
import { BlogUnpublishForm } from '@/components/admin/BlogUnpublishForm';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { blogAdminListPath, buildAdminListQuery } from '@/lib/admin-return-path';
import { listBlogArticlesAdmin } from '@/lib/blog-articles-db';
import { resolveAppLocale } from '@/utils/locale';

type BlogAdminListProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
};

export async function generateMetadata(props: BlogAdminListProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'BlogAdminPage',
  });
  return { title: t('meta_title') };
}

export default async function BlogAdminListPage(props: BlogAdminListProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'BlogAdminPage',
  });

  const access = await requireDashboardAccess();
  if (!access.ok) {
    return <p className="py-8 text-sm text-neutral-600">{t('no_permission')}</p>;
  }

  const listFilters = {
    q: searchParams.q,
    status: searchParams.status,
  };
  const listPath = blogAdminListPath(listFilters);
  const listQuery = buildAdminListQuery(listFilters);

  const rows = await listBlogArticlesAdmin({
    q: searchParams.q,
    status: (searchParams.status as 'all' | 'draft' | 'published') ?? 'all',
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        actions={
          <Link
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
            href={`/dashboard/dicas/new${listQuery}`}
          >
            {t('new_article')}
          </Link>
        }
        description={t('summary', { count: rows.length })}
        title={t('title')}
      />

      <form
        className="grid gap-3 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:grid-cols-3"
        method="get"
      >
        <input
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
          defaultValue={searchParams.q ?? ''}
          name="q"
          placeholder={t('search_placeholder')}
        />
        <select
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          defaultValue={searchParams.status ?? 'all'}
          name="status"
        >
          <option value="all">{t('status_all')}</option>
          <option value="published">{t('status_published')}</option>
          <option value="draft">{t('status_draft')}</option>
        </select>
        <button
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium sm:col-span-3 sm:max-w-xs"
          type="submit"
        >
          {t('filter_apply')}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            <tr>
              <th className="px-4 py-3">{t('col_title')}</th>
              <th className="px-4 py-3">{t('col_status')}</th>
              <th className="px-4 py-3">{t('col_updated')}</th>
              <th className="px-4 py-3">{t('col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-neutral-100 last:border-0" key={row.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{row.title}</p>
                  <p className="text-xs text-neutral-500">{row.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {row.status === 'published' ? t('badge_published') : t('badge_draft')}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(row.updatedAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="text-sm font-medium text-primary hover:underline"
                      href={`/dashboard/dicas/${row.slug}/edit${listQuery}`}
                    >
                      {t('edit')}
                    </Link>
                    {row.status === 'published' ? (
                      <>
                        <a
                          className="text-sm font-medium text-neutral-600 hover:underline"
                          href={`/dicas/${row.slug}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {t('view')}
                        </a>
                        <BlogUnpublishForm
                          action={unpublishBlogArticleAction}
                          returnTo={listPath}
                          slug={row.slug}
                        />
                      </>
                    ) : (
                      <BlogPublishForm
                        action={publishBlogArticleAction}
                        returnTo={listPath}
                        slug={row.slug}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-neutral-500">{t('empty')}</p>
        ) : null}
      </div>
    </div>
  );
}
