'use client';

import { useEffect, useRef } from 'react';
import type { ClientListItem } from '@/types/client-admin';

type ClientsMergeDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  clients: ClientListItem[];
  isBusy: boolean;
  confirmVariant?: 'primary' | 'danger';
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ClientsMergeDialog(props: ClientsMergeDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmClass =
    props.confirmVariant === 'danger'
      ? 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50'
      : 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50';

  useEffect(() => {
    if (!props.open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !props.isBusy) {
        props.onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [props.open, props.isBusy]);

  if (!props.open) {
    return null;
  }

  return (
    <div
      aria-labelledby="clients-merge-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-card)] bg-surface p-6 shadow-xl"
        ref={panelRef}
      >
        <h2 className="text-lg font-semibold text-neutral-900" id="clients-merge-title">
          {props.title}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">{props.description}</p>

        <ul className="mt-4 space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
          {props.clients.map((client) => (
            <li className="text-neutral-800" key={client.id}>
              <span className="font-medium">{client.displayName}</span>
              {client.email ? <span className="text-neutral-500"> · {client.email}</span> : null}
              {client.phone ? <span className="text-neutral-500"> · {client.phone}</span> : null}
            </li>
          ))}
        </ul>

        {props.error ? <p className="mt-3 text-sm text-red-600">{props.error}</p> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            disabled={props.isBusy}
            onClick={props.onClose}
            type="button"
          >
            {props.cancelLabel}
          </button>
          <button
            className={confirmClass}
            disabled={props.isBusy}
            onClick={props.onConfirm}
            type="button"
          >
            {props.isBusy ? '…' : props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
