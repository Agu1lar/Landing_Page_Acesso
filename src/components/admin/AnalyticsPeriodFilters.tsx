import { getTranslations } from 'next-intl/server';
import {
  buildAnalyticsFilterQuery,
  currentCalendarMonthRange,
  previousCalendarMonthRange,
} from '@/lib/analytics-period';
import { currentWeekRange, lastDaysRange, previousWeekRange } from '@/lib/leads-date-presets';
import { Link } from '@/libs/I18nNavigation';
import { AdminFilterPanel } from '@/components/admin/AdminFilterPanel';

type AnalyticsPeriodFiltersProps = {
  dateFrom?: string;
  dateTo?: string;
  compareDateFrom?: string;
  compareDateTo?: string;
  comparisonMode?: 'auto' | 'custom';
};

/**
 * Date range form and quick presets for the analytics dashboard.
 */
export async function AnalyticsPeriodFilters(props: AnalyticsPeriodFiltersProps) {
  const t = await getTranslations('AnalyticsAdminPage');
  const range7 = lastDaysRange(7);
  const range30 = lastDaysRange(30);
  const thisMonth = currentCalendarMonthRange();
  const lastMonth = previousCalendarMonthRange();
  const thisWeek = currentWeekRange();
  const lastWeek = previousWeekRange();

  const href7 = `/dashboard/analytics${buildAnalyticsFilterQuery(range7)}`;
  const href30 = `/dashboard/analytics${buildAnalyticsFilterQuery(range30)}`;
  const hrefMonthCompare = `/dashboard/analytics${buildAnalyticsFilterQuery({
    ...thisMonth,
    compareDateFrom: lastMonth.dateFrom,
    compareDateTo: lastMonth.dateTo,
  })}`;
  const hrefWeekCompare = `/dashboard/analytics${buildAnalyticsFilterQuery({
    ...thisWeek,
    compareDateFrom: lastWeek.dateFrom,
    compareDateTo: lastWeek.dateTo,
  })}`;

  const presetClassName =
    'rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-primary/30 hover:text-primary';

  return (
    <AdminFilterPanel>
      <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
          <span className="text-sm font-medium text-neutral-600">{t('filter_period_label')}</span>
          <Link className={presetClassName} href={href7}>
            {t('filter_last_7_days')}
          </Link>
          <Link className={presetClassName} href={href30}>
            {t('filter_last_30_days')}
          </Link>
          <Link className={presetClassName} href={hrefMonthCompare}>
            {t('filter_this_month_vs_last')}
          </Link>
          <Link className={presetClassName} href={hrefWeekCompare}>
            {t('filter_this_week_vs_last')}
          </Link>
        </div>

        <p className="text-sm text-neutral-600 sm:col-span-2 lg:col-span-4">{t('filter_period_primary')}</p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700" htmlFor="dateFrom">
            {t('filter_date_from')}
          </label>
          <input
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            defaultValue={props.dateFrom ?? ''}
            id="dateFrom"
            name="dateFrom"
            type="date"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700" htmlFor="dateTo">
            {t('filter_date_to')}
          </label>
          <input
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            defaultValue={props.dateTo ?? ''}
            id="dateTo"
            name="dateTo"
            type="date"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <p className="text-sm font-medium text-neutral-700">{t('filter_compare_section')}</p>
          <p className="mt-1 text-sm text-neutral-600">
            {props.comparisonMode === 'custom'
              ? t('filter_compare_custom_active')
              : t('filter_compare_auto_hint')}
          </p>
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-neutral-700"
            htmlFor="compareDateFrom"
          >
            {t('filter_compare_date_from')}
          </label>
          <input
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            defaultValue={props.compareDateFrom ?? ''}
            id="compareDateFrom"
            name="compareDateFrom"
            type="date"
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-neutral-700"
            htmlFor="compareDateTo"
          >
            {t('filter_compare_date_to')}
          </label>
          <input
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            defaultValue={props.compareDateTo ?? ''}
            id="compareDateTo"
            name="compareDateTo"
            type="date"
          />
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-2">
          <button
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            type="submit"
          >
            {t('filter_apply')}
          </button>
        </div>
      </form>
    </AdminFilterPanel>
  );
}
