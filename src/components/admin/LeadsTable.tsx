import { getTranslations } from 'next-intl/server';
import { LEAD_STATUSES } from '@/lib/lead-status';
import type { LeadStatus } from '@/lib/lead-status';
import type { LeadRecord } from '@/lib/leads-admin';
import { formatLeadCartItems } from '@/lib/leads-admin';
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
      <p className="rounded-lg border border-dashed border-neutral-300 bg-background-muted px-4 py-8 text-center text-neutral-600">
        {t('empty_list')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
        <thead className="bg-background-muted text-neutral-700">
          <tr>
            <th className="px-3 py-2 font-semibold">{t('col_date')}</th>
            <th className="px-3 py-2 font-semibold">{t('col_name')}</th>
            <th className="px-3 py-2 font-semibold">{t('col_city')}</th>
            <th className="px-3 py-2 font-semibold">{t('col_items')}</th>
            <th className="px-3 py-2 font-semibold">{t('col_origin')}</th>
            <th className="px-3 py-2 font-semibold">{t('col_status')}</th>
            <th className="px-3 py-2 font-semibold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 bg-surface">
          {leads.map((lead) => {
            const itemsSummary = (formatLeadCartItems(lead.itemsJson) || lead.equipmentName) ?? '—';
            const statusKey = LEAD_STATUSES.includes(lead.status as LeadStatus)
              ? (`status_${lead.status}` as 'status_new')
              : 'status_new';
            return (
              <tr className="hover:bg-background-muted/60" key={lead.id}>
                <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(lead.createdAt)}</td>
                <td className="px-3 py-2">
                  <p className="font-medium text-neutral-900">{lead.name}</p>
                  <p className="text-xs text-neutral-500">{lead.phone}</p>
                </td>
                <td className="px-3 py-2">{lead.city}</td>
                <td className="max-w-xs truncate px-3 py-2" title={itemsSummary}>
                  {itemsSummary}
                </td>
                <td className="px-3 py-2 text-xs">
                  <p>{lead.origin}</p>
                  {lead.utmSource ? (
                    <p className="mt-0.5 text-neutral-500">utm: {lead.utmSource}</p>
                  ) : null}
                </td>
                <td className="px-3 py-2">{t(statusKey)}</td>
                <td className="px-3 py-2">
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
  );
}
