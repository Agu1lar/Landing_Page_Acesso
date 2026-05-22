type AnalyticsBarTableProps = {
  title: string;
  rows: { label: string; count: number }[];
  emptyLabel: string;
};

/**
 * Simple horizontal bar table for dashboard breakdowns.
 */
export function AnalyticsBarTable(props: AnalyticsBarTableProps) {
  const max = Math.max(1, ...props.rows.map((row) => row.count));

  return (
    <section className="rounded-lg border border-neutral-200 bg-surface p-4">
      <h2 className="font-heading text-lg font-semibold text-neutral-900">{props.title}</h2>
      {props.rows.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">{props.emptyLabel}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {props.rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-neutral-800">{row.label}</span>
                <span className="shrink-0 tabular-nums text-neutral-600">{row.count}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((row.count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
