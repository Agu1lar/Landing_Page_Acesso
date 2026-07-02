import { AnalyticsBarChart } from '@/components/admin/AnalyticsBarChart';
import { AnalyticsMetricSection } from '@/components/admin/AnalyticsMetricSection';
import type { AnalyticsDataType } from '@/lib/analytics-sections';

type AnalyticsBarTableProps = {
  title: string;
  meaning: string;
  dataType: AnalyticsDataType;
  dataTypeLabel: string;
  meaningToggleLabel: string;
  meaningHideLabel: string;
  rows: { label: string; count: number }[];
  emptyLabel: string;
};

/**
 * Ranking block with separated meaning panel and data type badge.
 */
export function AnalyticsBarTable(props: AnalyticsBarTableProps) {
  return (
    <AnalyticsMetricSection
      dataType={props.dataType}
      dataTypeLabel={props.dataTypeLabel}
      meaning={props.meaning}
      meaningHideLabel={props.meaningHideLabel}
      meaningToggleLabel={props.meaningToggleLabel}
      title={props.title}
    >
      <AnalyticsBarChart emptyLabel={props.emptyLabel} rows={props.rows} />
    </AnalyticsMetricSection>
  );
}
