import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LeadsFiltersForm } from '@/components/admin/LeadsFiltersForm';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { buildLeadsFilterQuery, buildContactOrderCounts, listLeads } from '@/lib/leads-admin';
import type { LeadListFilters } from '@/lib/leads-admin';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type LeadsConsultaPageProps = {
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

export async function generateMetadata(props: LeadsConsultaPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'LeadsConsultaPage',
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

export default async function LeadsConsultaPage(props: LeadsConsultaPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'LeadsConsultaPage',
  });

  const filters = parseFilters(searchParams);
  const { leads, total, page, totalPages } = await listLeads(filters);
  const contactOrderCounts = await buildContactOrderCounts(leads);
  const query = buildLeadsFilterQuery(filters);
  const exportHref = `/api/admin/leads/export${query}`;
  const basePath = '/dashboard/leads/consulta';

  const prevPage = page > 1 ? buildLeadsFilterQuery({ ...filters, page: page - 1 }) : null;
  const nextPage = page < totalPages ? buildLeadsFilterQuery({ ...filters, page: page + 1 }) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button href="/dashboard/leads" size="sm" variant="outline">
          {t('back_to_week')}
        </Button>
      </div>

      <AdminPageHeader
        actions={
          <Button href={exportHref} size="sm" variant="outline">
            {t('export_csv')}
          </Button>
        }
        description={t('summary', { count: total })}
        title={t('title')}
      />

      <LeadsFiltersForm basePath={basePath} filters={filters} />
      <LeadsTable contactOrderCounts={contactOrderCounts} leads={leads} />

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
                href={`${basePath}${prevPage}`}
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
                href={`${basePath}${nextPage}`}
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
