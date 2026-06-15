import type { ReactNode } from 'react';

type AdminCalloutVariant = 'info' | 'warning' | 'tip';

type AdminCalloutProps = {
  children: ReactNode;
  variant?: AdminCalloutVariant;
  title?: string;
};

const variantClasses: Record<AdminCalloutVariant, string> = {
  info: 'border-neutral-200 bg-neutral-50 text-neutral-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  tip: 'border-sky-200 bg-sky-50 text-sky-950',
};

/**
 * Inline notice for hints and alerts inside dashboard pages.
 */
export function AdminCallout(props: AdminCalloutProps) {
  const variant = props.variant ?? 'info';

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${variantClasses[variant]}`}>
      {props.title ? <p className="mb-1 font-semibold">{props.title}</p> : null}
      {props.children}
    </div>
  );
}
