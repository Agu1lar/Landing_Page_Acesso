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
 * Uses a native dialog (top layer) so card overflow cannot clip the explanation.
 */
export function AdminMetricHelp(props: AdminMetricHelpProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const positionDialog = () => {
    const button = buttonRef.current;
    const dialog = dialogRef.current;
    if (!button || !dialog) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const panelHeight = dialog.offsetHeight || 160;
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

    dialog.style.top = `${top}px`;
    dialog.style.left = `${left}px`;
  };

  const close = () => {
    dialogRef.current?.close();
    setOpen(false);
  };

  const toggle = () => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (dialog.open) {
      close();
      return;
    }

    dialog.showModal();
    setOpen(true);
    requestAnimationFrame(positionDialog);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const onClose = () => setOpen(false);
    dialog.addEventListener('close', onClose);

    return () => {
      dialog.removeEventListener('close', onClose);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onLayoutChange = () => positionDialog();
    window.addEventListener('resize', onLayoutChange);
    window.addEventListener('scroll', onLayoutChange, true);

    return () => {
      window.removeEventListener('resize', onLayoutChange);
      window.removeEventListener('scroll', onLayoutChange, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        aria-controls={panelId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={props.label}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary-light/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={toggle}
        type="button"
      >
        ?
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={panelId}
        className="fixed m-0 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-600 shadow-lg ring-1 ring-black/5 backdrop:bg-transparent open:flex open:flex-col"
        id={panelId}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            close();
          }
        }}
      >
        <p>{props.text}</p>
      </dialog>
    </>
  );
}
