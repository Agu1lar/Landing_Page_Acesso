import { getTranslations } from 'next-intl/server';
import { AdminCard } from '@/components/admin/AdminCard';
import { LeadPriorityBadge } from '@/components/admin/LeadPriorityBadge';
import type { LeadIntentTier } from '@/lib/lead-intent-score';
import { formatLeadCartItems, type LeadWithIntent } from '@/lib/leads-admin';
import { Link } from '@/libs/I18nNavigation';

type CommercialQueueSectionProps = {
  leads: LeadWithIntent[];
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
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
 * Highlights new leads the sales team should contact first.
 */
export async function CommercialQueueSection(props: CommercialQueueSectionProps) {
  const t = await getTranslations('LeadsAdminPage');
  const { leads } = props;

  return (
    <AdminCard description={t('queue_hint')} title={t('queue_title')}>
      {leads.length === 0 ? (
        <p className="text-sm text-neutral-500">{t('queue_empty')}</p>
      ) : (
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
                    {formatDateTime(lead.createdAt)}
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
      )}
    </AdminCard>
  );
}
