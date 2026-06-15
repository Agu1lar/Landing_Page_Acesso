import type { ReactNode } from 'react';

type AdminFilterPanelProps = {
  children: ReactNode;
  title?: string;
};

/**
 * Wrapper for filter forms with consistent spacing and card styling.
 */
export function AdminFilterPanel(props: AdminFilterPanelProps) {
  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm">
      {props.title ? (
        <p className="mb-4 text-sm font-semibold text-neutral-800">{props.title}</p>
      ) : null}
      {props.children}
    </div>
  );
}
