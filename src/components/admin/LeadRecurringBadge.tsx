type LeadRecurringBadgeProps = {
  label: string;
  count: number;
};

export function LeadRecurringBadge(props: LeadRecurringBadgeProps) {
  if (props.count <= 1) {
    return null;
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200/80 ring-inset">
      {props.label}
    </span>
  );
}
