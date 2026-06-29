import { Link } from '@/libs/I18nNavigation';
import type { CampaignDailyLeadsRow, CampaignPerformanceRow } from '@/lib/campaign-analytics';
import { buildLeadsFilterQuery } from '@/lib/leads-admin';
import type { LeadStatus } from '@/lib/lead-status';

type CampaignPerformanceSectionProps = {
  campaigns: CampaignPerformanceRow[];
  dailyLeads: CampaignDailyLeadsRow[];
  dateFrom: string;
  dateTo: string;
  labels: {
    title: string;
    hint: string;
    dailyTitle: string;
    dailyHint: string;
    empty: string;
    colCampaign: string;
    colSource: string;
    colMedium: string;
    colWhatsapp: string;
    colTotalLeads: string;
    colQuoteLeads: string;
    colGoogleLeads: string;
    colGclid: string;
    colDate: string;
    colLeads: string;
    viewLeads: string;
    statusNew: string;
    statusContacted: string;
    statusQuoted: string;
    statusWon: string;
    statusLost: string;
    statusArchived: string;
    statusOther: string;
  };
};

const STATUS_COLUMNS: Array<{ key: LeadStatus | 'other'; labelKey: keyof CampaignPerformanceSectionProps['labels'] }> = [
  { key: 'new', labelKey: 'statusNew' },
  { key: 'contacted', labelKey: 'statusContacted' },
  { key: 'quoted', labelKey: 'statusQuoted' },
  { key: 'won', labelKey: 'statusWon' },
  { key: 'lost', labelKey: 'statusLost' },
  { key: 'archived', labelKey: 'statusArchived' },
  { key: 'other', labelKey: 'statusOther' },
];

function campaignConsultaHref(campaignKey: string, dateFrom: string, dateTo: string) {
  return `/dashboard/leads/consulta${buildLeadsFilterQuery({
    dateFrom,
    dateTo,
    campaignKey,
  })}`;
}

export function CampaignPerformanceSection(props: CampaignPerformanceSectionProps) {
  const { campaigns, dailyLeads, dateFrom, dateTo, labels } = props;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-heading text-lg font-bold text-neutral-900">{labels.title}</h2>
          <p className="mt-1 text-sm text-neutral-600">{labels.hint}</p>
        </div>

        {campaigns.length === 0 ? (
          <p className="text-sm text-neutral-500">{labels.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2.5 pr-4 font-medium">{labels.colCampaign}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colSource}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colMedium}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colWhatsapp}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colTotalLeads}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colQuoteLeads}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colGoogleLeads}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colGclid}</th>
                  {STATUS_COLUMNS.map((column) => (
                    <th className="py-2.5 pr-3 font-medium" key={column.key}>
                      {labels[column.labelKey]}
                    </th>
                  ))}
                  <th className="py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((row) => (
                  <tr className="border-b border-neutral-100 last:border-0" key={row.campaignKey}>
                    <td className="py-2.5 pr-4 font-medium text-neutral-900">{row.campaignLabel}</td>
                    <td className="py-2.5 pr-4 text-neutral-700">{row.utmSource}</td>
                    <td className="py-2.5 pr-4 text-neutral-700">{row.utmMedium}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.whatsappClicks}</td>
                    <td className="py-2.5 pr-4 tabular-nums font-semibold text-neutral-900">
                      {row.totalLeads}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.quoteLeads}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.cookieLeads}</td>
                    <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.withGclid}</td>
                    {STATUS_COLUMNS.map((column) => (
                      <td className="py-2.5 pr-3 tabular-nums text-neutral-700" key={column.key}>
                        {row.statusCounts[column.key]}
                      </td>
                    ))}
                    <td className="py-2.5 text-right">
                      <Link
                        className="text-xs font-medium text-primary hover:underline"
                        href={campaignConsultaHref(row.campaignKey, dateFrom, dateTo)}
                      >
                        {labels.viewLeads}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-heading text-lg font-bold text-neutral-900">{labels.dailyTitle}</h2>
          <p className="mt-1 text-sm text-neutral-600">{labels.dailyHint}</p>
        </div>

        {dailyLeads.length === 0 ? (
          <p className="text-sm text-neutral-500">{labels.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2.5 pr-4 font-medium">{labels.colDate}</th>
                  <th className="py-2.5 pr-4 font-medium">{labels.colCampaign}</th>
                  <th className="py-2.5 font-medium">{labels.colLeads}</th>
                </tr>
              </thead>
              <tbody>
                {dailyLeads.map((row) => (
                  <tr
                    className="border-b border-neutral-100 last:border-0"
                    key={`${row.date}-${row.campaignKey}`}
                  >
                    <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.date}</td>
                    <td className="py-2.5 pr-4 font-medium text-neutral-900">{row.campaignLabel}</td>
                    <td className="py-2.5 tabular-nums text-neutral-700">{row.totalLeads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
