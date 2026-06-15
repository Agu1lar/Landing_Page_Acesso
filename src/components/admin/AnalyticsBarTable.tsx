import { AdminCard } from '@/components/admin/AdminCard';

type AnalyticsBarTableProps = {
  title: string;
  hint?: string;
  helpLabel?: string;
  rows: { label: string; count: number }[];
  emptyLabel: string;
};

/**
 * Simple horizontal bar table for dashboard breakdowns.
 */
export function AnalyticsBarTable(props: AnalyticsBarTableProps) {
  const max = Math.max(1, ...props.rows.map((row) => row.count));

  return (
    <AdminCard helpLabel={props.helpLabel} helpText={props.hint} title={props.title}>
      {props.rows.length === 0 ? (
        <p className="text-sm text-neutral-500">{props.emptyLabel}</p>
      ) : (
        <ul className="space-y-4">
          {props.rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-neutral-800">{row.label}</span>
                <span className="shrink-0 tabular-nums font-semibold text-neutral-600">
                  {row.count}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((row.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}
