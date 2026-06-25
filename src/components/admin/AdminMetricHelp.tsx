'use client';

import { useEffect, useId, useRef, useState } from 'react';

type AdminMetricHelpProps = {
  text: string;
  label: string;
};

const PANEL_WIDTH = 288;
const VIEWPORT_PADDING = 12;
const GAP = 8;

/**
 * Compact "?" help control for dashboard metric cards.
 */
export function AdminMetricHelp(props: AdminMetricHelpProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number } | null>(null);

  const positionPanel = () => {
    const button = buttonRef.current;
    const panel = panelRef.current;
    if (!button || !panel) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const panelHeight = panel.offsetHeight || 160;
    let left = rect.right - PANEL_WIDTH;
    let top = rect.bottom + GAP;

    left = Math.max(
      VIEWPORT_PADDING,
      Math.min(left, window.innerWidth - PANEL_WIDTH - VIEWPORT_PADDING),
    );

    if (top + panelHeight > window.innerHeight - VIEWPORT_PADDING) {
      top = rect.top - panelHeight - GAP;
    }

    top = Math.max(VIEWPORT_PADDING, top);

    setPanelStyle({ top, left });
  };

  const close = () => {
    setOpen(false);
    setPanelStyle(null);
    buttonRef.current?.focus();
  };

  const toggle = () => {
    if (open) {
      close();
      return;
    }

    setOpen(true);
    requestAnimationFrame(positionPanel);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    const onLayoutChange = () => positionPanel();

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onLayoutChange);
    window.addEventListener('scroll', onLayoutChange, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onLayoutChange);
      window.removeEventListener('scroll', onLayoutChange, true);
    };
  }, [open]);

  return (
    <span className="relative inline-flex">
      <button
        ref={buttonRef}
        aria-controls={open ? titleId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={props.label}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={toggle}
        type="button"
      >
        ?
      </button>

      {open ? (
        <>
          <button
            aria-label={props.label}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={close}
            tabIndex={-1}
            type="button"
          />
          <div
            ref={panelRef}
            aria-labelledby={titleId}
            className="fixed z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-600 shadow-lg ring-1 ring-black/5"
            role="dialog"
            style={panelStyle ? { top: panelStyle.top, left: panelStyle.left } : { visibility: 'hidden' }}
          >
            <p id={titleId}>{props.text}</p>
          </div>
        </>
      ) : null}
    </span>
  );
}
