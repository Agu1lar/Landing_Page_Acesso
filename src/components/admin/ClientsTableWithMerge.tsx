'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ClientListItem } from '@/lib/clients-admin';
import { ClientsAdminToolbar } from '@/components/admin/ClientsAdminToolbar';
import { ClientsMergeDialog } from '@/components/admin/ClientsMergeDialog';
import { ClientsTable } from '@/components/admin/ClientsTable';

type ClientsTableWithMergeProps = {
  clients: ClientListItem[];
  canManage: boolean;
};

export function ClientsTableWithMerge(props: ClientsTableWithMergeProps) {
  const { clients, canManage } = props;
  const t = useTranslations('ClientsPage');
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
      setError(body.error ?? t('merge_error'));
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
      setError(body.error ?? t('delete_error'));
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
          deleteLabel={t('delete_button')}
          label={t('merge_selected_count', { count: selectedIds.length })}
          mergeLabel={t('merge_button')}
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
          <p>{t('merge_success')}</p>
          <button
            className="mt-1 font-medium text-primary hover:underline"
            onClick={() => router.push(`/dashboard/clientes/${mergeSuccess.primaryClientId}`)}
            type="button"
          >
            {t('merge_view_result')}
          </button>
        </div>
      ) : null}

      {deleteSuccess !== null ? (
        <div className="rounded-[var(--radius-card)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {t('delete_success', { count: deleteSuccess })}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-[var(--radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ClientsTable
        allSelected={allSelected}
        canManage={canManage}
        clients={clients}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        selectedIds={selectedIds}
      />

      {canManage ? (
        <>
          <ClientsMergeDialog
            cancelLabel={t('merge_cancel_button')}
            clients={selectedClients}
            confirmLabel={t('merge_confirm_button')}
            description={t('merge_confirm_body')}
            error={mergeDialogOpen ? error : null}
            isBusy={isMerging}
            onClose={() => {
              if (!isBusy) {
                setMergeDialogOpen(false);
              }
            }}
            onConfirm={runMerge}
            open={mergeDialogOpen}
            title={t('merge_confirm_title')}
          />
          <ClientsMergeDialog
            cancelLabel={t('merge_cancel_button')}
            clients={selectedClients}
            confirmLabel={t('delete_confirm_button')}
            confirmVariant="danger"
            description={t('delete_confirm_body')}
            error={deleteDialogOpen ? error : null}
            isBusy={isDeleting}
            onClose={() => {
              if (!isBusy) {
                setDeleteDialogOpen(false);
              }
            }}
            onConfirm={runDelete}
            open={deleteDialogOpen}
            title={t('delete_confirm_title')}
          />
        </>
      ) : null}
    </div>
  );
}
