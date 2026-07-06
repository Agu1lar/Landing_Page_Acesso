'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClientsMergeDialog } from '@/components/admin/ClientsMergeDialog';

type ClientDeleteButtonProps = {
  clientId: number;
  displayName: string;
  email: string | null;
  phone: string | null;
  labels: {
    deleteButton: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    deleteConfirmButton: string;
    mergeCancelButton: string;
    deleteError: string;
  };
};

export function ClientDeleteButton(props: ClientDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientPreview = {
    id: props.clientId,
    displayName: props.displayName,
    email: props.email,
    phone: props.phone,
    phoneNormalized: null,
    googleSub: null,
    company: null,
    firstSeenAt: new Date(),
    lastActivityAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    leadCount: 0,
    quoteCount: 0,
    cookieConsentCount: 0,
  };

  const runDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const response = await fetch('/api/admin/clients/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientIds: [props.clientId] }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(body.error ?? props.labels.deleteError);
      setIsDeleting(false);
      return;
    }

    setOpen(false);
    router.push('/dashboard/clientes');
    router.refresh();
  };

  return (
    <>
      <button
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        type="button"
      >
        {props.labels.deleteButton}
      </button>
      <ClientsMergeDialog
        cancelLabel={props.labels.mergeCancelButton}
        clients={[clientPreview]}
        confirmLabel={props.labels.deleteConfirmButton}
        confirmVariant="danger"
        description={props.labels.deleteConfirmBody}
        error={error}
        isBusy={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setOpen(false);
          }
        }}
        onConfirm={runDelete}
        open={open}
        title={props.labels.deleteConfirmTitle}
      />
    </>
  );
}
