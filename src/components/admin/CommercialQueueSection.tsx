import { formatDateTimeBrasilia } from '@/lib/app-datetime';
import { getTranslations } from 'next-intl/server';
import { AdminCard } from '@/components/admin/AdminCard';
import { LeadPriorityBadge } from '@/components/admin/LeadPriorityBadge';
import type { LeadIntentTier } from '@/lib/lead-intent-score';
import { COMMERCIAL_QUEUE_MAX, formatLeadCartItems, type LeadWithIntent } from '@/lib/leads-admin';
import { formatWeekRangeLabel } from '@/lib/leads-date-presets';
import { Link } from '@/libs/I18nNavigation';

type CommercialQueueSectionProps = {
  leads: LeadWithIntent[];
  total: number;
  weekRange: { dateFrom: string; dateTo: string };
};
function activityAt(lead: LeadWithIntent) {
  return lead.lastActivityAt ?? lead.createdAt;
}

function tierLabelKey(tier: LeadIntentTier) {
  if (tier === 'hot') {
    return 'priority_hot' as const;
  }
  if (tier === 'warm') {
    return 'priority_warm' as const;
  }
  return 'priority_cold' as const;
}

/**
 * Highlights new leads from the current week the sales team should contact first.
 */
export async function CommercialQueueSection(props: CommercialQueueSectionProps) {
  const t = await getTranslations('LeadsAdminPage');
  const { leads, total } = props;
  const overflow = Math.max(0, total - leads.length);
  const weekLabel = formatWeekRangeLabel(props.weekRange);

  return (
    <AdminCard
      description={t('queue_hint_week', { week: weekLabel, max: COMMERCIAL_QUEUE_MAX })}
      title={t('queue_title')}
    >
      {leads.length === 0 ? (
        <p className="text-sm text-neutral-500">{t('queue_empty_week')}</p>
      ) : (
        <>
          <div className="max-h-[28rem] overflow-y-auto pr-1">
            <ul className="divide-y divide-neutral-100">
              {leads.map((lead) => {
                const itemsSummary = (formatLeadCartItems(lead.itemsJson) || lead.equipmentName) ?? '—';
                return (
                  <li
                    className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    key={lead.id}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-neutral-900">{lead.name}</p>
                        <LeadPriorityBadge
                          label={t(tierLabelKey(lead.tier))}
                          score={lead.score}
                          tier={lead.tier}
                        />
                        {lead.leadKind === 'cookie_consent' ? (
                          <span className="text-xs text-neutral-500">{t('lead_kind_cookie_consent')}</span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-neutral-600">
                        {lead.city ?? '—'} · {itemsSummary}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDateTimeBrasilia(activityAt(lead))}
                        {lead.utmSource ? ` · utm: ${lead.utmSource}` : ''}
                      </p>
                    </div>
                    <Link
                      className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-primary shadow-sm hover:border-primary/30 hover:bg-primary-light/30"
                      href={`/dashboard/leads/${lead.id}`}
                    >
                      {t('view_detail')}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {overflow > 0 ? (
            <p className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-600">
              {t('queue_overflow', { shown: leads.length, total })}{' '}
              <Link className="font-medium text-primary hover:underline" href="/dashboard/leads/consulta">
                {t('open_consulta_link')}
              </Link>
            </p>
          ) : null}
        </>
      )}
    </AdminCard>
  );
}
