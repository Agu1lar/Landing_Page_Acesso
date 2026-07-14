import type { LeadWhatsAppStatus } from '@/lib/lead-whatsapp-status';

type LeadWhatsAppBadgeProps = {
  status: LeadWhatsAppStatus;
  label: string;
  compact?: boolean;
};

const styles: Record<LeadWhatsAppStatus, string> = {
  replied: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  opened: 'border-green-200 bg-green-50 text-green-800',
  blocked: 'border-amber-200 bg-amber-50 text-amber-900',
  unknown: 'border-neutral-200 bg-neutral-100 text-neutral-700',
  not_applicable: 'border-neutral-200 bg-neutral-50 text-neutral-500',
};

export function LeadWhatsAppBadge(props: LeadWhatsAppBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${
        props.compact ? 'text-[11px]' : 'text-xs'
      } ${styles[props.status]}`}
    >
      {props.label}
    </span>
  );
}
