import { getTranslations } from 'next-intl/server';
import { LEAD_STATUSES } from '@/lib/lead-status';
import type { LeadStatus } from '@/lib/lead-status';
import type { LeadRecord } from '@/lib/leads-admin';
import { formatLeadCartItems } from '@/lib/leads-admin';
import { AdminCard } from '@/components/admin/AdminCard';
import { Link } from '@/libs/I18nNavigation';

type LeadContactHistoryProps = {
  currentLeadId: number;
  relatedLeads: LeadRecord[];
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function activityDate(lead: LeadRecord) {
  return lead.lastActivityAt ?? lead.createdAt;
}

export async function LeadContactHistory(props: LeadContactHistoryProps) {
  const { currentLeadId, relatedLeads } = props;
  const t = await getTranslations('LeadsAdminPage');

  if (relatedLeads.length <= 1) {
    return null;
  }

  return (
    <AdminCard description={t('contact_history_hint')} title={t('section_contact_history')}>
      <ul className="divide-y divide-neutral-100 text-sm">
        {relatedLeads.map((row) => {
          const statusKey = LEAD_STATUSES.includes(row.status as LeadStatus)
            ? (`status_${row.status}` as 'status_new')
            : 'status_new';
          const kindKey =
            row.leadKind === 'cookie_consent' ? 'lead_kind_cookie_consent' : 'lead_kind_quote';
          const summary = (formatLeadCartItems(row.itemsJson) || row.equipmentName) ?? '—';
          const isCurrent = row.id === currentLeadId;

          return (
            <li className="flex flex-wrap items-start justify-between gap-3 py-3" key={row.id}>
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-neutral-900">
                  {isCurrent ? t('contact_history_current') : t('contact_history_entry', { id: row.id })}
                  {' · '}
                  {formatDateTime(activityDate(row))}
                </p>
                <p className="text-xs text-neutral-500">
                  {t(kindKey)} · {t(statusKey)} · {row.origin}
                </p>
                <p className="truncate text-neutral-700">{summary}</p>
              </div>
              {!isCurrent ? (
                <Link
                  className="shrink-0 font-medium text-primary hover:underline"
                  href={`/dashboard/leads/${row.id}`}
                >
                  {t('view_detail')}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}
