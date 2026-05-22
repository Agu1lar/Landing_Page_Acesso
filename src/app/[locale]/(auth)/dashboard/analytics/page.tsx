import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AnalyticsBarTable } from '@/components/admin/AnalyticsBarTable';
import { AnalyticsPeriodFilters } from '@/components/admin/AnalyticsPeriodFilters';
import { getOperationalDashboard, percentChange } from '@/lib/analytics-admin';
import { resolveAppLocale } from '@/utils/locale';

type AnalyticsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
};

export async function generateMetadata(props: AnalyticsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'AnalyticsAdminPage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

type KpiCardProps = {
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
};

function KpiCard(props: KpiCardProps) {
  const deltaPositive = props.delta >= 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-surface p-4">
      <p className="text-sm text-neutral-600">{props.label}</p>
      <p className="mt-1 font-heading text-3xl font-bold tabular-nums text-neutral-900">
        {props.value}
      </p>
      <p className={`mt-1 text-sm ${deltaPositive ? 'text-emerald-700' : 'text-red-700'}`}>
        {deltaPositive ? '+' : ''}
        {props.delta}% {props.deltaLabel}
      </p>
    </div>
  );
}

export default async function AnalyticsAdminPage(props: AnalyticsPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'AnalyticsAdminPage',
  });

  const dashboard = await getOperationalDashboard({
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
  });

  const visitsDelta = percentChange(dashboard.pageViews, dashboard.pageViewsPrevious);
  const sessionsDelta = percentChange(
    dashboard.uniqueSessions,
    dashboard.uniqueSessionsPrevious,
  );
  const whatsappDelta = percentChange(
    dashboard.whatsappClicks,
    dashboard.whatsappClicksPrevious,
  );
  const leadsDelta = percentChange(dashboard.quoteSubmits, dashboard.quoteSubmitsPrevious);
  const whatsappRate =
    dashboard.pageViews > 0
      ? Math.round((dashboard.whatsappClicks / dashboard.pageViews) * 100)
      : 0;

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {t('period_summary', {
            from: dashboard.period.dateFrom,
            to: dashboard.period.dateTo,
          })}
        </p>
      </div>

      {dashboard.posthogHint ? (
        <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {t('posthog_visits_hint')}
        </p>
      ) : null}

      <AnalyticsPeriodFilters
        dateFrom={searchParams.dateFrom ?? dashboard.period.dateFrom}
        dateTo={searchParams.dateTo ?? dashboard.period.dateTo}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          delta={visitsDelta}
          deltaLabel={t('delta_vs_previous')}
          label={t('kpi_page_views')}
          value={dashboard.pageViews}
        />
        <KpiCard
          delta={sessionsDelta}
          deltaLabel={t('delta_vs_previous')}
          label={t('kpi_sessions')}
          value={dashboard.uniqueSessions}
        />
        <KpiCard
          delta={whatsappDelta}
          deltaLabel={t('delta_vs_previous')}
          label={t('kpi_whatsapp')}
          value={dashboard.whatsappClicks}
        />
        <KpiCard
          delta={leadsDelta}
          deltaLabel={t('delta_vs_previous')}
          label={t('kpi_leads')}
          value={dashboard.quoteSubmits}
        />
      </div>

      {dashboard.pageViews > 0 ? (
        <p className="text-sm text-neutral-600">
          {t('kpi_whatsapp_rate', { rate: whatsappRate })}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          rows={dashboard.whatsappByOrigin}
          title={t('chart_whatsapp_origin')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          rows={dashboard.trafficBySource}
          title={t('chart_traffic_source')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          rows={dashboard.topEquipmentWhatsapp}
          title={t('chart_top_equipment_whatsapp')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          rows={dashboard.topEquipmentLeads}
          title={t('chart_top_equipment_leads')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          rows={dashboard.landingPages}
          title={t('chart_landing_pages')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          rows={dashboard.deviceSplit}
          title={t('chart_device')}
        />
      </div>

      <section className="rounded-lg border border-neutral-200 bg-surface p-4">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">
          {t('chart_campaigns')}
        </h2>
        {dashboard.campaigns.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">{t('empty_data')}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-600">
                  <th className="py-2 pr-4 font-medium">{t('col_campaign')}</th>
                  <th className="py-2 pr-4 font-medium">{t('col_whatsapp')}</th>
                  <th className="py-2 font-medium">{t('col_leads')}</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.campaigns.map((row) => (
                  <tr className="border-b border-neutral-100" key={row.campaign}>
                    <td className="py-2 pr-4 font-medium text-neutral-900">{row.campaign}</td>
                    <td className="py-2 pr-4 tabular-nums">{row.whatsapp}</td>
                    <td className="py-2 tabular-nums">{row.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
