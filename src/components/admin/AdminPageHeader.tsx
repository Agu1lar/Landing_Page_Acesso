import type { ReactNode } from 'react';

type AdminPageHeaderProps = {
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
};

/**
 * Consistent page title block for dashboard modules.
 */
export function AdminPageHeader(props: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-neutral-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {props.title}
        </h1>
        {props.description ? (
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-neutral-600">
            {props.description}
          </p>
        ) : null}
      </div>
      {props.actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{props.actions}</div>
      ) : null}
    </div>
  );
}
