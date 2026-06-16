import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CampaignPerformanceSection } from '@/components/admin/CampaignPerformanceSection';
import { AnalyticsBarTable } from '@/components/admin/AnalyticsBarTable';
import { AnalyticsEquipmentConversionTable } from '@/components/admin/AnalyticsEquipmentConversionTable';
import { AnalyticsPeriodFilters } from '@/components/admin/AnalyticsPeriodFilters';
import { AnalyticsTopPagesTable } from '@/components/admin/AnalyticsTopPagesTable';
import { AdminCallout } from '@/components/admin/AdminCallout';
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

      <CampaignPerformanceSection
        campaigns={dashboard.campaignPerformance}
        dailyLeads={dashboard.campaignDailyLeads}
        dateFrom={dashboard.period.dateFrom}
        dateTo={dashboard.period.dateTo}
        labels={{
          title: t('chart_campaign_performance'),
          hint: t('hint_chart_campaign_performance'),
          dailyTitle: t('chart_campaign_daily'),
          dailyHint: t('hint_chart_campaign_daily'),
          empty: t('empty_data'),
          colCampaign: t('col_campaign'),
          colSource: t('col_source'),
          colMedium: t('col_medium'),
          colWhatsapp: t('col_whatsapp'),
          colTotalLeads: t('col_total_leads'),
          colQuoteLeads: t('col_quote_leads'),
          colGoogleLeads: t('col_google_leads'),
          colGclid: t('col_gclid'),
          colDate: t('col_date'),
          colLeads: t('col_leads'),
          viewLeads: t('view_campaign_leads'),
          statusNew: t('status_new_short'),
          statusContacted: t('status_contacted_short'),
          statusQuoted: t('status_quoted_short'),
          statusWon: t('status_won_short'),
          statusLost: t('status_lost_short'),
          statusOther: t('status_other_short'),
        }}
      />

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
    </div>
  );
}
