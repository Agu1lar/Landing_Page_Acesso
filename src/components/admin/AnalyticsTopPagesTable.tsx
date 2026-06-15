import { AdminCard } from '@/components/admin/AdminCard';

type AnalyticsTopPagesTableProps = {
  title: string;
  hint?: string;
  helpLabel?: string;
  emptyLabel: string;
  colPage: string;
  colViews: string;
  colAvgTime: string;
  rows: {
    pathname: string;
    pathnameDetail?: string;
    views: number;
    avgActiveSeconds: number;
  }[];
};

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

/**
 * Table of top pages by views with average active time.
 */
export function AnalyticsTopPagesTable(props: AnalyticsTopPagesTableProps) {
  return (
    <AdminCard helpLabel={props.helpLabel} helpText={props.hint} title={props.title}>
      {props.rows.length === 0 ? (
        <p className="text-sm text-neutral-500">{props.emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2.5 pr-4 font-medium">{props.colPage}</th>
                <th className="py-2.5 pr-4 font-medium">{props.colViews}</th>
                <th className="py-2.5 font-medium">{props.colAvgTime}</th>
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row) => (
                <tr className="border-b border-neutral-100 last:border-0" key={row.pathname}>
                  <td
                    className="max-w-md truncate py-2.5 pr-4 font-medium text-neutral-900"
                    title={row.pathnameDetail ?? row.pathname}
                  >
                    {row.pathname}
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums text-neutral-700">{row.views}</td>
                  <td className="py-2.5 tabular-nums text-neutral-700">
                    {formatDuration(row.avgActiveSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}
