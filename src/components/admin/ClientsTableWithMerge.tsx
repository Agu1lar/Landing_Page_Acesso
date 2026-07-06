'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ClientListItem } from '@/lib/clients-admin';
import { ClientsAdminToolbar } from '@/components/admin/ClientsAdminToolbar';
import { ClientsMergeDialog } from '@/components/admin/ClientsMergeDialog';
import { ClientsTable } from '@/components/admin/ClientsTable';

type ClientsTableWithMergeProps = {
  clients: ClientListItem[];
  canManage: boolean;
  labels: {
    empty: string;
    colName: string;
    colContact: string;
    colCompany: string;
    colHistory: string;
    colLastActivity: string;
    colFirstSeen: string;
    colSelect: string;
    viewDetail: string;
    formatLeadCount: (count: number) => string;
    googleAccount: string;
    mergeSelectAll: string;
    mergeSelectedCount: (count: number) => string;
    mergeButton: string;
    mergeConfirmTitle: string;
    mergeConfirmBody: string;
    mergeConfirmButton: string;
    mergeCancelButton: string;
    mergeSuccess: string;
    mergeError: string;
    mergeViewResult: string;
    deleteButton: string;
    deleteConfirmTitle: string;
    deleteConfirmBody: string;
    deleteConfirmButton: string;
    deleteSuccess: (count: number) => string;
    deleteError: string;
  };
};

export function ClientsTableWithMerge(props: ClientsTableWithMergeProps) {
  const { clients, canManage, labels } = props;
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState<{ primaryClientId: number } | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<number | null>(null);

  const selectedClients = clients.filter((client) => selectedIds.includes(client.id));
  const allSelected = clients.length > 0 && selectedIds.length === clients.length;
  const isBusy = isMerging || isDeleting;

  const toggleOne = (clientId: number, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...new Set([...current, clientId])] : current.filter((id) => id !== clientId),
    );
    setError(null);
    setMergeSuccess(null);
    setDeleteSuccess(null);
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? clients.map((client) => client.id) : []);
    setError(null);
    setMergeSuccess(null);
    setDeleteSuccess(null);
  };

  const runMerge = async () => {
    setIsMerging(true);
    setError(null);

    const response = await fetch('/api/admin/clients/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientIds: selectedIds }),
    });

    const body = (await response.json()) as {
      error?: string;
      primaryClientId?: number;
    };

    if (!response.ok) {
      setError(body.error ?? labels.mergeError);
      setIsMerging(false);
      return;
    }

    setMergeDialogOpen(false);
    setSelectedIds([]);
    setMergeSuccess({ primaryClientId: body.primaryClientId! });
    setDeleteSuccess(null);
    setIsMerging(false);
    router.refresh();
  };

  const runDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const response = await fetch('/api/admin/clients/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientIds: selectedIds }),
    });

    const body = (await response.json()) as { error?: string; deletedCount?: number };

    if (!response.ok) {
      setError(body.error ?? labels.deleteError);
      setIsDeleting(false);
      return;
    }

    setDeleteDialogOpen(false);
    setSelectedIds([]);
    setDeleteSuccess(body.deletedCount ?? selectedIds.length);
    setMergeSuccess(null);
    setIsDeleting(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {canManage && selectedIds.length >= 1 ? (
        <ClientsAdminToolbar
          canMerge={selectedIds.length >= 2}
          deleteLabel={labels.deleteButton}
          label={labels.mergeSelectedCount(selectedIds.length)}
          mergeLabel={labels.mergeButton}
          onDelete={() => {
            setDeleteDialogOpen(true);
            setError(null);
          }}
          onMerge={() => {
            setMergeDialogOpen(true);
            setError(null);
          }}
        />
      ) : null}

      {mergeSuccess ? (
        <div className="rounded-[var(--radius-card)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <p>{labels.mergeSuccess}</p>
          <button
            className="mt-1 font-medium text-primary hover:underline"
            onClick={() => router.push(`/dashboard/clientes/${mergeSuccess.primaryClientId}`)}
            type="button"
          >
            {labels.mergeViewResult}
          </button>
        </div>
      ) : null}

      {deleteSuccess !== null ? (
        <div className="rounded-[var(--radius-card)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {labels.deleteSuccess(deleteSuccess)}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ClientsTable
        allSelected={allSelected}
        canMerge={canManage}
        clients={clients}
        labels={labels}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        selectedIds={selectedIds}
      />

      {canManage ? (
        <>
          <ClientsMergeDialog
            cancelLabel={labels.mergeCancelButton}
            clients={selectedClients}
            confirmLabel={labels.mergeConfirmButton}
            description={labels.mergeConfirmBody}
            error={mergeDialogOpen ? error : null}
            isBusy={isMerging}
            onClose={() => {
              if (!isBusy) {
                setMergeDialogOpen(false);
              }
            }}
            onConfirm={runMerge}
            open={mergeDialogOpen}
            title={labels.mergeConfirmTitle}
          />
          <ClientsMergeDialog
            cancelLabel={labels.mergeCancelButton}
            clients={selectedClients}
            confirmLabel={labels.deleteConfirmButton}
            confirmVariant="danger"
            description={labels.deleteConfirmBody}
            error={deleteDialogOpen ? error : null}
            isBusy={isDeleting}
            onClose={() => {
              if (!isBusy) {
                setDeleteDialogOpen(false);
              }
            }}
            onConfirm={runDelete}
            open={deleteDialogOpen}
            title={labels.deleteConfirmTitle}
          />
        </>
      ) : null}
    </div>
  );
}
