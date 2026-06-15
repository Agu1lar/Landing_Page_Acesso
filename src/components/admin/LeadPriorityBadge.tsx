import type { LeadIntentTier } from '@/lib/lead-intent-score';

const tierClasses: Record<LeadIntentTier, string> = {
  hot: 'bg-red-50 text-red-800 ring-1 ring-red-200',
  warm: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200',
  cold: 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200',
};

type LeadPriorityBadgeProps = {
  tier: LeadIntentTier;
  label: string;
  score?: number;
};

/**
 * Visual badge for lead commercial priority tier.
 */
export function LeadPriorityBadge(props: LeadPriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tierClasses[props.tier]}`}
      title={props.score !== undefined ? `Score: ${props.score}` : undefined}
    >
      {props.label}
    </span>
  );
}
