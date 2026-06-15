import { getTranslations } from 'next-intl/server';
import { LEAD_STATUSES } from '@/lib/lead-status';
import type { LeadStatus } from '@/lib/lead-status';
import { scoreLeadIntent } from '@/lib/lead-intent-score';
import type { LeadRecord } from '@/lib/leads-admin';
import { formatLeadCartItems } from '@/lib/leads-admin';
import { AdminCard } from '@/components/admin/AdminCard';
import { LeadPriorityBadge } from '@/components/admin/LeadPriorityBadge';
import { Link } from '@/libs/I18nNavigation';

type LeadsTableProps = {
  leads: LeadRecord[];
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export async function LeadsTable(props: LeadsTableProps) {
  const { leads } = props;
  const t = await getTranslations('LeadsAdminPage');

  if (leads.length === 0) {
    return (
      <AdminCard>
        <p className="py-6 text-center text-sm text-neutral-500">{t('empty_list')}</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard padding={false}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('col_date')}</th>
              <th className="px-4 py-3 font-semibold">{t('col_name')}</th>
              <th className="px-4 py-3 font-semibold">{t('col_priority')}</th>
              <th className="px-4 py-3 font-semibold">{t('col_city')}</th>
              <th className="px-4 py-3 font-semibold">{t('col_items')}</th>
              <th className="px-4 py-3 font-semibold">{t('col_origin')}</th>
              <th className="px-4 py-3 font-semibold">{t('col_kind')}</th>
              <th className="px-4 py-3 font-semibold">{t('col_status')}</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {leads.map((lead) => {
              const itemsSummary = (formatLeadCartItems(lead.itemsJson) || lead.equipmentName) ?? '—';
              const statusKey = LEAD_STATUSES.includes(lead.status as LeadStatus)
                ? (`status_${lead.status}` as 'status_new')
                : 'status_new';
              const kindKey =
                lead.leadKind === 'cookie_consent'
                  ? 'lead_kind_cookie_consent'
                  : 'lead_kind_quote';
              const intent = scoreLeadIntent(lead);
              const priorityKey =
                intent.tier === 'hot'
                  ? 'priority_hot'
                  : intent.tier === 'warm'
                    ? 'priority_warm'
                    : 'priority_cold';
              return (
                <tr className="transition-colors hover:bg-neutral-50/80" key={lead.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                    {formatDateTime(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{lead.name}</p>
                    <p className="text-xs text-neutral-500">{lead.phone ?? lead.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <LeadPriorityBadge
                      label={t(priorityKey)}
                      score={intent.score}
                      tier={intent.tier}
                    />
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{lead.city ?? '—'}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-neutral-700" title={itemsSummary}>
                    {itemsSummary}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="text-neutral-700">{lead.origin}</p>
                    {lead.utmSource ? (
                      <p className="mt-0.5 text-neutral-500">utm: {lead.utmSource}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{t(kindKey)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                      {t(statusKey)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium text-primary hover:underline"
                      href={`/dashboard/leads/${lead.id}`}
                    >
                      {t('view_detail')}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}
