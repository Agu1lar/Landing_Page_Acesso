import { AnalyticsMetricSection } from '@/components/admin/AnalyticsMetricSection';
import type { EquipmentConversionRow } from '@/lib/equipment-conversion-analytics';
import type { AnalyticsDataType } from '@/lib/analytics-sections';

type AnalyticsEquipmentConversionTableProps = {
  title: string;
  meaning: string;
  dataType: AnalyticsDataType;
  dataTypeLabel: string;
  meaningToggleLabel: string;
  meaningHideLabel: string;
  emptyLabel: string;
  colEquipment: string;
  colViews: string;
  colWhatsapp: string;
  colLeads: string;
  colLeadRate: string;
  colEngagementRate: string;
  rows: EquipmentConversionRow[];
};

/**
 * Cross-table of equipment page views, WhatsApp clicks and leads.
 */
export function AnalyticsEquipmentConversionTable(props: AnalyticsEquipmentConversionTableProps) {
  return (
    <AnalyticsMetricSection
      dataType={props.dataType}
      dataTypeLabel={props.dataTypeLabel}
      meaning={props.meaning}
      meaningHideLabel={props.meaningHideLabel}
      meaningToggleLabel={props.meaningToggleLabel}
      title={props.title}
    >
      {props.rows.length === 0 ? (
        <p className="text-sm text-neutral-500">{props.emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2.5 pr-4 font-medium">{props.colEquipment}</th>
                <th className="py-2.5 pr-4 font-medium">{props.colViews}</th>
                <th className="py-2.5 pr-4 font-medium">{props.colWhatsapp}</th>
                <th className="py-2.5 pr-4 font-medium">{props.colLeads}</th>
                <th className="py-2.5 pr-4 font-medium">{props.colLeadRate}</th>
                <th className="py-2.5 font-medium">{props.colEngagementRate}</th>
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row) => (
                <tr className="border-b border-neutral-100 last:border-0" key={row.slug}>
                  <td className="max-w-xs py-2.5 pr-4">
                    <p className="font-medium text-neutral-900">{row.name}</p>
                    <p className="truncate text-xs text-neutral-500">{row.slug}</p>
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.pageViews}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.whatsappClicks}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.leads}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-neutral-700">
                    {row.pageViews > 0 ? `${row.leadConversionRate}%` : '—'}
                  </td>
                  <td className="py-2.5 tabular-nums text-neutral-700">
                    {row.pageViews > 0 ? `${row.engagementRate}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AnalyticsMetricSection>
  );
}
