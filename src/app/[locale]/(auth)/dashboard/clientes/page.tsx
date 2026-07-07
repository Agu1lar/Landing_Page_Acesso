import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClientsSearchForm } from '@/components/admin/ClientsSearchForm';
import { ClientsTableWithMerge } from '@/components/admin/ClientsTableWithMerge';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { buildClientsFilterQuery, listClients } from '@/lib/clients-admin';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type ClientsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata(props: ClientsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'ClientsPage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ClientsPage(props: ClientsPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));

  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'ClientsPage',
  });

  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1;
  const filters = {
    q: searchParams.q,
    page: Number.isNaN(page) ? 1 : page,
  };

  const listResult = await listClients(filters).catch((error: unknown) => {
    console.error('Clients page load failed', error);
    return null;
  });

  if (!listResult) {
    return (
      <div className="space-y-8">
        <AdminPageHeader description={t('summary', { count: 0 })} title={t('title')} />
        <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-medium">{t('load_error_title')}</p>
          <p className="mt-2">{t('load_error_body')}</p>
        </div>
      </div>
    );
  }

  const { clients, total, totalPages } = listResult;
  const access = await requireDashboardAccess();
  const canManage = access.ok && access.role === 'admin';
  const basePath = '/dashboard/clientes';
  const prevQuery =
    filters.page > 1 ? buildClientsFilterQuery({ ...filters, page: filters.page - 1 }) : null;
  const nextQuery =
    filters.page < totalPages ? buildClientsFilterQuery({ ...filters, page: filters.page + 1 }) : null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        description={t('summary', { count: total })}
        title={t('title')}
      />

      <ClientsSearchForm
        initialQuery={filters.q}
        placeholder={t('search_placeholder')}
        searchLabel={t('search_label')}
        submitLabel={t('search_submit')}
      />

      <ClientsTableWithMerge canManage={canManage} clients={clients} />

      {totalPages > 1 ? (
        <nav
          aria-label={t('pagination_label')}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <p className="text-neutral-600">
            {t('pagination_info', { page: filters.page, totalPages })}
          </p>
          <div className="flex gap-2">
            {prevQuery ? (
              <Link
                className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-background-muted"
                href={`${basePath}${prevQuery}`}
              >
                {t('pagination_prev')}
              </Link>
            ) : (
              <span className="rounded-lg border border-neutral-100 px-3 py-1.5 text-neutral-400">
                {t('pagination_prev')}
              </span>
            )}
            {nextQuery ? (
              <Link
                className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-background-muted"
                href={`${basePath}${nextQuery}`}
              >
                {t('pagination_next')}
              </Link>
            ) : (
              <span className="rounded-lg border border-neutral-100 px-3 py-1.5 text-neutral-400">
                {t('pagination_next')}
              </span>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
