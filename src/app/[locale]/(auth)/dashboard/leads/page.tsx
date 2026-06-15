import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CommercialQueueSection } from '@/components/admin/CommercialQueueSection';
import { LeadsFiltersForm } from '@/components/admin/LeadsFiltersForm';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { StaleLeadsAlert } from '@/components/admin/StaleLeadsAlert';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { buildLeadsFilterQuery, listCommercialQueue, listLeads } from '@/lib/leads-admin';
import { listStaleNewLeads } from '@/lib/leads-stale-alert';
import type { LeadListFilters } from '@/lib/leads-admin';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type LeadsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    city?: string;
    origin?: string;
    q?: string;
    page?: string;
  }>;
};

export async function generateMetadata(props: LeadsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'LeadsAdminPage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

type LeadsSearchParams = {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  city?: string;
  origin?: string;
  q?: string;
  page?: string;
};

function parseFilters(searchParams: LeadsSearchParams): LeadListFilters {
  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1;
  return {
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    status: searchParams.status,
    city: searchParams.city,
    origin: searchParams.origin,
    q: searchParams.q,
    page: Number.isNaN(page) ? 1 : page,
  };
}

export default async function LeadsAdminPage(props: LeadsPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'LeadsAdminPage',
  });

  const filters = parseFilters(searchParams);
  const [{ leads, total, page, totalPages }, queueLeads, staleLeads] = await Promise.all([
    listLeads(filters),
    listCommercialQueue(),
    listStaleNewLeads(),
  ]);
  const query = buildLeadsFilterQuery(filters);
  const exportHref = `/api/admin/leads/export${query}`;

  const prevPage = page > 1 ? buildLeadsFilterQuery({ ...filters, page: page - 1 }) : null;
  const nextPage = page < totalPages ? buildLeadsFilterQuery({ ...filters, page: page + 1 }) : null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        actions={
          <Button href={exportHref} size="sm" variant="outline">
            {t('export_csv')}
          </Button>
        }
        description={t('summary', { count: total })}
        title={t('title')}
      />

      <StaleLeadsAlert summary={staleLeads} />

      <CommercialQueueSection leads={queueLeads} />

      <LeadsFiltersForm filters={filters} />
      <LeadsTable leads={leads} />

      {totalPages > 1 ? (
        <nav
          aria-label={t('pagination_label')}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <p className="text-neutral-600">{t('pagination_info', { page, totalPages })}</p>
          <div className="flex gap-2">
            {prevPage ? (
              <Link
                className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-background-muted"
                href={`/dashboard/leads${prevPage}`}
              >
                {t('pagination_prev')}
              </Link>
            ) : (
              <span className="rounded-lg border border-neutral-100 px-3 py-1.5 text-neutral-400">
                {t('pagination_prev')}
              </span>
            )}
            {nextPage ? (
              <Link
                className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-background-muted"
                href={`/dashboard/leads${nextPage}`}
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
