type AdminKpiCardProps = {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  accent?: 'default' | 'primary' | 'whatsapp' | 'neutral';
};

const accentBar: Record<NonNullable<AdminKpiCardProps['accent']>, string> = {
  default: 'bg-primary',
  primary: 'bg-primary',
  whatsapp: 'bg-cta-whatsapp',
  neutral: 'bg-neutral-400',
};

/**
 * KPI metric tile for the analytics dashboard.
 */
export function AdminKpiCard(props: AdminKpiCardProps) {
  const accent = props.accent ?? 'default';
  const delta = props.delta;
  const deltaPositive = delta !== undefined && delta >= 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
      <div className={`absolute top-0 left-0 h-1 w-full ${accentBar[accent]}`} />
      <p className="text-sm font-medium text-neutral-500">{props.label}</p>
      <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
        {props.value}
      </p>
      {delta !== undefined && props.deltaLabel ? (
        <p
          className={`mt-2 text-sm font-medium ${deltaPositive ? 'text-emerald-700' : 'text-red-600'}`}
        >
          {deltaPositive ? '+' : ''}
          {delta}% {props.deltaLabel}
        </p>
      ) : null}
    </div>
  );
}
