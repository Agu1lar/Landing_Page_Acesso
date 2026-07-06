'use client';

import { useTranslations } from 'next-intl';
import { formatDateTimeBrasilia } from '@/lib/app-datetime';
import type { ClientListItem } from '@/lib/clients-admin';
import { Link } from '@/libs/I18nNavigation';

type ClientsTableProps = {
  clients: ClientListItem[];
  canManage?: boolean;
  selectedIds?: number[];
  allSelected?: boolean;
  onToggleOne?: (clientId: number, checked: boolean) => void;
  onToggleAll?: (checked: boolean) => void;
};

export function ClientsTable(props: ClientsTableProps) {
  const {
    clients,
    canManage = false,
    selectedIds = [],
    allSelected = false,
    onToggleOne,
    onToggleAll,
  } = props;
  const t = useTranslations('ClientsPage');

  if (clients.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-dashed border-neutral-300 bg-background-muted px-6 py-10 text-center text-sm text-neutral-600">
        {t('empty')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-neutral-200 bg-surface shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold tracking-wide text-neutral-600 uppercase">
          <tr>
            {canManage ? (
              <th className="px-4 py-3">
                <input
                  aria-label={t('merge_select_all')}
                  checked={allSelected}
                  className="h-4 w-4 rounded border-neutral-300"
                  onChange={(event) => onToggleAll?.(event.target.checked)}
                  type="checkbox"
                />
              </th>
            ) : null}
            <th className="px-4 py-3">{t('col_name')}</th>
            <th className="px-4 py-3">{t('col_contact')}</th>
            <th className="px-4 py-3">{t('col_company')}</th>
            <th className="px-4 py-3">{t('col_history')}</th>
            <th className="px-4 py-3">{t('col_last_activity')}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {clients.map((client) => (
            <tr className="hover:bg-background-muted/60" key={client.id}>
              {canManage ? (
                <td className="px-4 py-3">
                  <input
                    aria-label={`${t('col_select')} ${client.displayName}`}
                    checked={selectedIds.includes(client.id)}
                    className="h-4 w-4 rounded border-neutral-300"
                    onChange={(event) => onToggleOne?.(client.id, event.target.checked)}
                    type="checkbox"
                  />
                </td>
              ) : null}
              <td className="px-4 py-3 font-medium text-neutral-900">{client.displayName}</td>
              <td className="px-4 py-3 text-neutral-700">
                <div className="space-y-0.5">
                  {client.email ? <p>{client.email}</p> : null}
                  {client.phone ? <p>{client.phone}</p> : null}
                  {client.googleSub ? (
                    <p className="text-xs text-neutral-500">{t('google_account')}</p>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 text-neutral-700">{client.company ?? '—'}</td>
              <td className="px-4 py-3 text-neutral-700">
                {t('lead_count', { count: client.leadCount })}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                <p>{formatDateTimeBrasilia(new Date(client.lastActivityAt))}</p>
                <p className="text-xs text-neutral-500">
                  {t('col_first_seen')}: {formatDateTimeBrasilia(new Date(client.firstSeenAt))}
                </p>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  className="font-medium text-primary hover:underline"
                  href={`/dashboard/clientes/${client.id}`}
                >
                  {t('view_detail')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
