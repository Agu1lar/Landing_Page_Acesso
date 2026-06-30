import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CampaignPerformanceSection } from '@/components/admin/CampaignPerformanceSection';
import { AnalyticsLoadFailure } from '@/components/admin/AnalyticsLoadFailure';
import { AnalyticsBarTable } from '@/components/admin/AnalyticsBarTable';
import { AnalyticsEquipmentConversionTable } from '@/components/admin/AnalyticsEquipmentConversionTable';
import { AnalyticsPeriodFilters } from '@/components/admin/AnalyticsPeriodFilters';
import { AnalyticsTopPagesTable } from '@/components/admin/AnalyticsTopPagesTable';
import { AnalyticsWhatsappHero } from '@/components/admin/AnalyticsWhatsappHero';
import { AdminCallout } from '@/components/admin/AdminCallout';
import { AdminKpiCard } from '@/components/admin/AdminKpiCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getOperationalDashboard, percentChange, probeAnalyticsDashboard } from '@/lib/analytics-admin';
import { parseAnalyticsDashboardFailure } from '@/lib/analytics-dashboard-errors';
import { resolveAppLocale } from '@/utils/locale';
import { logger } from '@/libs/Logger';

type AnalyticsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    dateFrom?: string;
    dateTo?: string;
    compareDateFrom?: string;
    compareDateTo?: string;
  }>;
};

export const dynamic = 'force-dynamic';

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

  const filters = {
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    compareDateFrom: searchParams.compareDateFrom,
    compareDateTo: searchParams.compareDateTo,
  };

  let dashboard;
  try {
    dashboard = await getOperationalDashboard(filters);
  } catch (error) {
    const failure = parseAnalyticsDashboardFailure(error);
    logger.error('Analytics dashboard page load failed', failure);

    let probe;
    try {
      probe = await probeAnalyticsDashboard(filters);
    } catch (probeError) {
      logger.warn('Analytics probe failed after page load error', {
        message: probeError instanceof Error ? probeError.message : String(probeError),
      });
    }

    return (
      <AnalyticsLoadFailure
        debugToggle={t('load_error_debug_toggle')}
        description={t('meta_description')}
        failure={failure}
        loadError={t('load_error')}
        loadErrorStep={
          failure.stepId
            ? t('load_error_step', { step: failure.stepLabel ?? failure.stepId })
            : undefined
        }
        probe={probe}
        probeOkHint={t('load_error_probe_ok_hint')}
        smokeTestHint={t('smoke_test_hint')}
        title={t('title')}
      />
    );
  }

  const visitsDelta = percentChange(dashboard.pageViews, dashboard.pageViewsPrevious);
  const whatsappDelta = percentChange(
    dashboard.whatsappClicks,
    dashboard.whatsappClicksPrevious,
  );
  const phoneDelta = percentChange(dashboard.phoneClicks, dashboard.phoneClicksPrevious);
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
  const deltaLabel =
    dashboard.comparisonMode === 'custom'
      ? t('delta_vs_custom_period', {
          from: dashboard.comparisonPeriod.dateFrom,
          to: dashboard.comparisonPeriod.dateTo,
        })
      : t('delta_vs_auto_previous', {
          from: dashboard.comparisonPeriod.dateFrom,
          to: dashboard.comparisonPeriod.dateTo,
        });
  const headerDescription =
    dashboard.comparisonMode === 'custom'
      ? t('period_comparison_summary', {
          from: dashboard.period.dateFrom,
          to: dashboard.period.dateTo,
          compareFrom: dashboard.comparisonPeriod.dateFrom,
          compareTo: dashboard.comparisonPeriod.dateTo,
        })
      : t('period_summary_with_auto_compare', {
          from: dashboard.period.dateFrom,
          to: dashboard.period.dateTo,
          compareFrom: dashboard.comparisonPeriod.dateFrom,
          compareTo: dashboard.comparisonPeriod.dateTo,
        });

  return (
    <div className="space-y-8">
      <AdminPageHeader description={headerDescription} title={t('title')} />

      {dashboard.schemaIncomplete ? (
        <AdminCallout variant="warning">{t('schema_pending_hint')}</AdminCallout>
      ) : null}

      <div className="space-y-3">
        {dashboard.posthogHint ? <AdminCallout>{t('posthog_visits_hint')}</AdminCallout> : null}
        <AdminCallout variant="tip">{t('page_time_hint')}</AdminCallout>
        {dashboard.whatsappClicks === 0 ? (
          <AdminCallout variant="tip">{t('whatsapp_tracking_hint')}</AdminCallout>
        ) : null}
      </div>

      <AnalyticsPeriodFilters
        compareDateFrom={searchParams.compareDateFrom}
        compareDateTo={searchParams.compareDateTo}
        comparisonMode={dashboard.comparisonMode}
        dateFrom={searchParams.dateFrom ?? dashboard.period.dateFrom}
        dateTo={searchParams.dateTo ?? dashboard.period.dateTo}
      />

      <AnalyticsWhatsappHero
        clicks={dashboard.whatsappClicks}
        clicksLabel={t('whatsapp_hero_clicks_label', { count: dashboard.whatsappClicks })}
        clicksPrevious={dashboard.whatsappClicksPrevious}
        delta={whatsappDelta}
        deltaLabel={deltaLabel}
        emptyHint={t('whatsapp_hero_empty_hint')}
        helpLabel={helpLabel}
        helpText={t('hint_kpi_whatsapp')}
        pageViews={dashboard.pageViews}
        periodLabel={t('whatsapp_hero_period', {
          from: dashboard.period.dateFrom,
          to: dashboard.period.dateTo,
        })}
        previousPeriodLabel={t('whatsapp_hero_previous_period', {
          count: dashboard.whatsappClicksPrevious,
        })}
        rateLabel={
          dashboard.pageViews > 0
            ? t('whatsapp_hero_rate', { rate: whatsappRate })
            : undefined
        }
        title={t('whatsapp_hero_title')}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          delta={visitsDelta}
          deltaLabel={deltaLabel}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_page_views')}
          label={t('kpi_page_views')}
          value={dashboard.pageViews}
        />
        <AdminKpiCard
          accent="neutral"
          delta={activeTimeDelta}
          deltaLabel={deltaLabel}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_active_time')}
          label={t('kpi_active_time')}
          value={dashboard.totalActiveSeconds}
        />
        <AdminKpiCard
          accent="whatsapp"
          delta={whatsappDelta}
          deltaLabel={deltaLabel}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_whatsapp')}
          label={t('kpi_whatsapp')}
          value={dashboard.whatsappClicks}
        />
        <AdminKpiCard
          accent="primary"
          delta={leadsDelta}
          deltaLabel={deltaLabel}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_leads')}
          label={t('kpi_leads')}
          value={dashboard.quoteSubmits}
        />
        <AdminKpiCard
          accent="neutral"
          delta={phoneDelta}
          deltaLabel={deltaLabel}
          helpLabel={helpLabel}
          helpText={t('hint_kpi_phone')}
          label={t('kpi_phone')}
          value={dashboard.phoneClicks}
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
          comparePrevious: t('campaign_compare_previous'),
          statusNew: t('status_new_short'),
          statusContacted: t('status_contacted_short'),
          statusQuoted: t('status_quoted_short'),
          statusWon: t('status_won_short'),
          statusLost: t('status_lost_short'),
          statusArchived: t('status_archived_short'),
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
          hint={t('hint_chart_phone_origin')}
          rows={dashboard.phoneByOrigin}
          title={t('chart_phone_origin')}
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
