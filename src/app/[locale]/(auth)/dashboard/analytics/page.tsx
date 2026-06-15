import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AnalyticsBarTable } from '@/components/admin/AnalyticsBarTable';
import { AnalyticsEquipmentConversionTable } from '@/components/admin/AnalyticsEquipmentConversionTable';
import { AnalyticsPeriodFilters } from '@/components/admin/AnalyticsPeriodFilters';
import { AnalyticsTopPagesTable } from '@/components/admin/AnalyticsTopPagesTable';
import { AdminCallout } from '@/components/admin/AdminCallout';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminKpiCard } from '@/components/admin/AdminKpiCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
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
  const whatsappDelta = percentChange(
    dashboard.whatsappClicks,
    dashboard.whatsappClicksPrevious,
  );
  const leadsDelta = percentChange(dashboard.quoteSubmits, dashboard.quoteSubmitsPrevious);
  const activeTimeDelta = percentChange(
    dashboard.totalActiveSeconds,
    dashboard.totalActiveSecondsPrevious,
  );
  const whatsappRate =
    dashboard.pageViews > 0
      ? Math.round((dashboard.whatsappClicks / dashboard.pageViews) * 100)
      : 0;
  const helpLabel = t('help_button_label');

  return (
    <div className="space-y-8">
      <AdminPageHeader
        description={t('period_summary', {
          from: dashboard.period.dateFrom,
          to: dashboard.period.dateTo,
        })}
        title={t('title')}
      />

      <div className="space-y-3">
        {dashboard.posthogHint ? <AdminCallout>{t('posthog_visits_hint')}</AdminCallout> : null}
        <AdminCallout variant="tip">{t('page_time_hint')}</AdminCallout>
      </div>

      <AnalyticsPeriodFilters
        dateFrom={searchParams.dateFrom ?? dashboard.period.dateFrom}
        dateTo={searchParams.dateTo ?? dashboard.period.dateTo}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          delta={visitsDelta}
          deltaLabel={t('delta_vs_previous')}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_page_views')}
          label={t('kpi_page_views')}
          value={dashboard.pageViews}
        />
        <AdminKpiCard
          accent="neutral"
          delta={activeTimeDelta}
          deltaLabel={t('delta_vs_previous')}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_active_time')}
          label={t('kpi_active_time')}
          value={dashboard.totalActiveSeconds}
        />
        <AdminKpiCard
          accent="whatsapp"
          delta={whatsappDelta}
          deltaLabel={t('delta_vs_previous')}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_whatsapp')}
          label={t('kpi_whatsapp')}
          value={dashboard.whatsappClicks}
        />
        <AdminKpiCard
          accent="primary"
          delta={leadsDelta}
          deltaLabel={t('delta_vs_previous')}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_leads')}
          label={t('kpi_leads')}
          value={dashboard.quoteSubmits}
        />
      </div>

      {(dashboard.cookieConsentLeads > 0 || dashboard.pageViews > 0) && (
        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          {dashboard.cookieConsentLeads > 0 ? (
            <span>{t('kpi_cookie_consent_leads', { count: dashboard.cookieConsentLeads })}</span>
          ) : null}
          {dashboard.pageViews > 0 ? (
            <span>{t('kpi_whatsapp_rate', { rate: whatsappRate })}</span>
          ) : null}
        </div>
      )}

      <AnalyticsTopPagesTable
        colAvgTime={t('col_avg_active_time')}
        colPage={t('col_page')}
        colViews={t('col_views')}
        emptyLabel={t('empty_data')}
        helpLabel={helpLabel}
        hint={t('hint_chart_top_pages')}
        rows={dashboard.topPages}
        title={t('chart_top_pages')}
      />

      <AnalyticsEquipmentConversionTable
        colEngagementRate={t('col_engagement_rate')}
        colEquipment={t('col_equipment')}
        colLeadRate={t('col_lead_rate')}
        colLeads={t('col_leads')}
        colViews={t('col_views')}
        colWhatsapp={t('col_whatsapp')}
        emptyLabel={t('empty_data')}
        helpLabel={helpLabel}
        hint={t('chart_equipment_conversion_hint')}
        rows={dashboard.equipmentConversion}
        title={t('chart_equipment_conversion')}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          helpLabel={helpLabel}
          hint={t('hint_chart_whatsapp_origin')}
          rows={dashboard.whatsappByOrigin}
          title={t('chart_whatsapp_origin')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          helpLabel={helpLabel}
          hint={t('hint_chart_traffic_source')}
          rows={dashboard.trafficBySource}
          title={t('chart_traffic_source')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          helpLabel={helpLabel}
          hint={t('hint_chart_top_equipment_whatsapp')}
          rows={dashboard.topEquipmentWhatsapp}
          title={t('chart_top_equipment_whatsapp')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          helpLabel={helpLabel}
          hint={t('hint_chart_top_equipment_leads')}
          rows={dashboard.topEquipmentLeads}
          title={t('chart_top_equipment_leads')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          helpLabel={helpLabel}
          hint={t('hint_chart_landing_pages')}
          rows={dashboard.landingPages}
          title={t('chart_landing_pages')}
        />
        <AnalyticsBarTable
          emptyLabel={t('empty_data')}
          helpLabel={helpLabel}
          hint={t('hint_chart_device')}
          rows={dashboard.deviceSplit}
          title={t('chart_device')}
        />
      </div>

      <AdminCard helpLabel={helpLabel} helpText={t('hint_chart_campaigns')} title={t('chart_campaigns')}>
        {dashboard.campaigns.length === 0 ? (
          <p className="text-sm text-neutral-500">{t('empty_data')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2.5 pr-4 font-medium">{t('col_campaign')}</th>
                  <th className="py-2.5 pr-4 font-medium">{t('col_whatsapp')}</th>
                  <th className="py-2.5 font-medium">{t('col_leads')}</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.campaigns.map((row) => (
                  <tr className="border-b border-neutral-100 last:border-0" key={row.campaign}>
                    <td className="py-2.5 pr-4 font-medium text-neutral-900">{row.campaign}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.whatsapp}</td>
                    <td className="py-2.5 tabular-nums text-neutral-700">{row.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
