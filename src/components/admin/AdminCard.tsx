import type { ReactNode } from 'react';

type AdminCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  padding?: boolean;
  headerAction?: ReactNode;
};

/**
 * Standard elevated card for dashboard content blocks.
 */
export function AdminCard(props: AdminCardProps) {
  const padding = props.padding !== false;

  return (
    <section
      className={`overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm ${props.className ?? ''}`}
    >
      {props.title || props.description ? (
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/50 px-5 py-4">
          <div className="min-w-0">
            {props.title ? (
              <h2 className="font-heading text-base font-semibold text-neutral-900">{props.title}</h2>
            ) : null}
            {props.description ? (
              <p className="mt-1 text-sm text-neutral-500">{props.description}</p>
            ) : null}
          </div>
          {props.headerAction ? <div className="shrink-0">{props.headerAction}</div> : null}
        </div>
      ) : null}
      <div className={padding ? 'p-5' : undefined}>{props.children}</div>
    </section>
  );
}
