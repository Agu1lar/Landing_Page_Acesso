import { getTranslations } from 'next-intl/server';
import { buildAnalyticsFilterQuery } from '@/lib/analytics-period';
import { lastDaysRange } from '@/lib/leads-date-presets';
import { Link } from '@/libs/I18nNavigation';
import { AdminFilterPanel } from '@/components/admin/AdminFilterPanel';

type AnalyticsPeriodFiltersProps = {
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Date range form and quick presets for the analytics dashboard.
 */
export async function AnalyticsPeriodFilters(props: AnalyticsPeriodFiltersProps) {
  const t = await getTranslations('AnalyticsAdminPage');
  const range7 = lastDaysRange(7);
  const range30 = lastDaysRange(30);
  const href7 = `/dashboard/analytics${buildAnalyticsFilterQuery(range7)}`;
  const href30 = `/dashboard/analytics${buildAnalyticsFilterQuery(range30)}`;

  return (
    <AdminFilterPanel>
      <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
          <span className="text-sm font-medium text-neutral-600">{t('filter_period_label')}</span>
          <Link
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
            href={href7}
          >
            {t('filter_last_7_days')}
          </Link>
          <Link
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-primary/30 hover:text-primary"
            href={href30}
          >
            {t('filter_last_30_days')}
          </Link>
        </div>
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
