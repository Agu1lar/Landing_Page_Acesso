import { getTranslations } from 'next-intl/server';
import { lastDaysRange } from '@/lib/leads-date-presets';
import { buildLeadsFilterQuery, type LeadListFilters } from '@/lib/leads-admin';
import { Link } from '@/libs/I18nNavigation';

type LeadsDatePresetsProps = {
  filters: LeadListFilters;
};

/**
 * Quick links to filter leads by last 7 or 30 days.
 */
export async function LeadsDatePresets(props: LeadsDatePresetsProps) {
  const t = await getTranslations('LeadsAdminPage');
  const range7 = lastDaysRange(7);
  const range30 = lastDaysRange(30);

  const base = {
    status: props.filters.status,
    city: props.filters.city,
    origin: props.filters.origin,
    q: props.filters.q,
  };

  const href7 = `/dashboard/leads${buildLeadsFilterQuery({
    ...base,
    ...range7,
    page: 1,
  })}`;
  const href30 = `/dashboard/leads${buildLeadsFilterQuery({
    ...base,
    ...range30,
    page: 1,
  })}`;

  return (
    <div className="flex flex-wrap gap-2">
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
  );
}
