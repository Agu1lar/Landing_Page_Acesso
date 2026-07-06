import { formatDateTimeBrasilia } from '@/lib/app-datetime';
import { formatLeadCartItems, type LeadRecord } from '@/lib/leads-admin';
import { AdminCard } from '@/components/admin/AdminCard';
import { Link } from '@/libs/I18nNavigation';

type ClientHistoryTimelineProps = {
  leads: LeadRecord[];
  labels: {
    title: string;
    hint: string;
    kindQuote: string;
    kindCookie: string;
    viewLead: string;
    empty: string;
    statusLabels: Record<string, string>;
  };
};

function activityDate(lead: LeadRecord) {
  return lead.lastActivityAt ?? lead.createdAt;
}

export function ClientHistoryTimeline(props: ClientHistoryTimelineProps) {
  const { leads, labels } = props;

  if (leads.length === 0) {
    return (
      <AdminCard description={labels.hint} title={labels.title}>
        <p className="text-sm text-neutral-600">{labels.empty}</p>
      </AdminCard>
    );
  }

  return (
    <AdminCard description={labels.hint} title={labels.title}>
      <ul className="divide-y divide-neutral-100 text-sm">
        {leads.map((lead) => {
          const statusLabel =
            labels.statusLabels[lead.status] ?? labels.statusLabels.new ?? lead.status;
          const kindLabel =
            lead.leadKind === 'cookie_consent' ? labels.kindCookie : labels.kindQuote;
          const summary = formatLeadCartItems(lead.itemsJson) || lead.equipmentName || lead.origin;

          return (
            <li className="flex flex-wrap items-start justify-between gap-3 py-3" key={lead.id}>
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-neutral-900">
                  #{lead.id} · {formatDateTimeBrasilia(activityDate(lead))}
                </p>
                <p className="text-xs text-neutral-500">
                  {kindLabel} · {statusLabel} · {lead.origin}
                </p>
                <p className="truncate text-neutral-700">{summary}</p>
              </div>
              <Link
                className="shrink-0 font-medium text-primary hover:underline"
                href={`/dashboard/leads/${lead.id}`}
              >
                {labels.viewLead}
              </Link>
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}
