'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ClientListItem } from '@/lib/clients-admin';
import { ClientsMergeDialog } from '@/components/admin/ClientsMergeDialog';
import { ClientsMergeToolbar } from '@/components/admin/ClientsMergeToolbar';
import { ClientsTable } from '@/components/admin/ClientsTable';

type ClientsTableWithMergeProps = {
  clients: ClientListItem[];
  canMerge: boolean;
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
  };
};

export function ClientsTableWithMerge(props: ClientsTableWithMergeProps) {
  const { clients, canMerge, labels } = props;
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ primaryClientId: number; mergedCount: number } | null>(
    null,
  );

  const selectedClients = clients.filter((client) => selectedIds.includes(client.id));
  const allSelected = clients.length > 0 && selectedIds.length === clients.length;

  const toggleOne = (clientId: number, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...new Set([...current, clientId])] : current.filter((id) => id !== clientId),
    );
    setError(null);
    setSuccess(null);
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? clients.map((client) => client.id) : []);
    setError(null);
    setSuccess(null);
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
      mergedCount?: number;
    };

    if (!response.ok) {
      setError(body.error ?? labels.mergeError);
      setIsMerging(false);
      return;
    }

    setDialogOpen(false);
    setSelectedIds([]);
    setSuccess({
      primaryClientId: body.primaryClientId!,
      mergedCount: body.mergedCount ?? 0,
    });
    setIsMerging(false);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {canMerge && selectedIds.length >= 2 ? (
        <ClientsMergeToolbar
          count={selectedIds.length}
          label={labels.mergeSelectedCount(selectedIds.length)}
          mergeLabel={labels.mergeButton}
          onMerge={() => {
            setDialogOpen(true);
            setError(null);
          }}
        />
      ) : null}

      {success ? (
        <div className="rounded-[var(--radius-card)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <p>{labels.mergeSuccess}</p>
          <button
            className="mt-1 font-medium text-primary hover:underline"
            onClick={() => router.push(`/dashboard/clientes/${success.primaryClientId}`)}
            type="button"
          >
            {labels.mergeViewResult}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ClientsTable
        allSelected={allSelected}
        canMerge={canMerge}
        clients={clients}
        labels={labels}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        selectedIds={selectedIds}
      />

      {canMerge ? (
        <ClientsMergeDialog
          clients={selectedClients}
          confirmLabel={labels.mergeConfirmButton}
          cancelLabel={labels.mergeCancelButton}
          description={labels.mergeConfirmBody}
          error={error}
          isMerging={isMerging}
          onClose={() => {
            if (!isMerging) {
              setDialogOpen(false);
            }
          }}
          onConfirm={runMerge}
          open={dialogOpen}
          title={labels.mergeConfirmTitle}
        />
      ) : null}
    </div>
  );
}
