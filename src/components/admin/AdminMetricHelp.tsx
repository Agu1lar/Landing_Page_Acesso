'use client';

import { useEffect, useId, useRef, useState } from 'react';

type AdminMetricHelpProps = {
  text: string;
  label: string;
};

/**
 * Compact "?" help control for dashboard metric cards.
 */
export function AdminMetricHelp(props: AdminMetricHelpProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={props.label}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        ?
      </button>

      {open ? (
        <div
          className="absolute top-full right-0 z-30 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-600 shadow-lg ring-1 ring-black/5"
          id={panelId}
          role="tooltip"
        >
          {props.text}
        </div>
      ) : null}
    </div>
  );
}
