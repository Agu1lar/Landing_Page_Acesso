import { getTranslations } from 'next-intl/server';
import { buildAnalyticsFilterQuery } from '@/lib/analytics-period';
import { lastDaysRange } from '@/lib/leads-date-presets';
import { Link } from '@/libs/I18nNavigation';

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
    <form
      className="grid gap-4 rounded-lg border border-neutral-200 bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
      method="get"
    >
      <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
        <span className="text-sm text-neutral-600">{t('filter_period_label')}</span>
        <Link
          className="rounded-full border border-neutral-200 px-3 py-1 text-sm hover:bg-background-muted"
          href={href7}
        >
          {t('filter_last_7_days')}
        </Link>
        <Link
          className="rounded-full border border-neutral-200 px-3 py-1 text-sm hover:bg-background-muted"
          href={href30}
        >
          {t('filter_last_30_days')}
        </Link>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="dateFrom">
          {t('filter_date_from')}
        </label>
        <input
          className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
          defaultValue={props.dateFrom ?? ''}
          id="dateFrom"
          name="dateFrom"
          type="date"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="dateTo">
          {t('filter_date_to')}
        </label>
        <input
          className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
          defaultValue={props.dateTo ?? ''}
          id="dateTo"
          name="dateTo"
          type="date"
        />
      </div>
      <div className="flex items-end sm:col-span-2">
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          type="submit"
        >
          {t('filter_apply')}
        </button>
      </div>
    </form>
  );
}
