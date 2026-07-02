'use client';

import { useState } from 'react';
import {
  addAllowlistEmailAction,
  removeAllowlistEmailAction,
} from '@/app/actions/access-admin';
import type { AllowlistEntry } from '@/lib/dashboard-allowlist-email';
import { normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

type AccessAllowlistPanelProps = {
  entries: AllowlistEntry[];
  allowlistEnforced: boolean;
  currentEmail: string;
  labels: {
    addTitle: string;
    addHint: string;
    emailLabel: string;
    emailPlaceholder: string;
    roleLabel: string;
    roleAdmin: string;
    roleComercial: string;
    addButton: string;
    listTitle: string;
    emptyList: string;
    colEmail: string;
    colRole: string;
    colAdded: string;
    colActions: string;
    removeButton: string;
    youBadge: string;
    errorInvalid: string;
    errorDuplicate: string;
    errorLastAdmin: string;
    errorGeneric: string;
    errorNetwork: string;
    legacyModeHint: string;
    addingLabel: string;
    successAdded: string;
  };
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function mapAllowlistError(
  code: 'unauthorized' | 'invalid' | 'duplicate' | 'last_admin' | 'not_found' | 'generic',
  labels: AccessAllowlistPanelProps['labels'],
) {
  switch (code) {
    case 'duplicate':
      return labels.errorDuplicate;
    case 'invalid':
      return labels.errorInvalid;
    case 'last_admin':
      return labels.errorLastAdmin;
  }

  return labels.errorGeneric;
}

export function AccessAllowlistPanel(props: AccessAllowlistPanelProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'comercial'>('comercial');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {!props.allowlistEnforced ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {props.labels.legacyModeHint}
        </p>
      ) : null}

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-neutral-900">{props.labels.addTitle}</h2>
        <p className="mt-1 text-sm text-neutral-600">{props.labels.addHint}</p>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setSuccess(null);
            setIsAdding(true);

            const normalizedEmail = normalizeAllowlistEmail(email);

            try {
              const result = await addAllowlistEmailAction({
                email: normalizedEmail,
                role,
              });

              if (!result.ok) {
                setError(mapAllowlistError(result.code, props.labels));
                return;
              }

              setEmail('');
              setRole('comercial');
              setSuccess(
                props.labels.successAdded.replace('{email}', result.email ?? normalizedEmail),
              );
            } catch {
              setError(props.labels.errorNetwork);
            } finally {
              setIsAdding(false);
            }
          }}
        >
          <Input
            disabled={isAdding}
            label={props.labels.emailLabel}
            name="allowlistEmail"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            placeholder={props.labels.emailPlaceholder}
            required
            type="text"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            value={email}
          />
          <Select
            disabled={isAdding}
            label={props.labels.roleLabel}
            name="allowlistRole"
            onChange={(event) => {
              setRole(event.target.value as 'admin' | 'comercial');
            }}
            value={role}
          >
            <option value="comercial">{props.labels.roleComercial}</option>
            <option value="admin">{props.labels.roleAdmin}</option>
          </Select>
          <div className="flex items-end">
            <Button disabled={isAdding} type="submit">
              {isAdding ? props.labels.addingLabel : props.labels.addButton}
            </Button>
          </div>
        </form>
        {success ? <p className="mt-3 text-sm text-green-700">{success}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-neutral-900">{props.labels.listTitle}</h2>
        </div>
        {props.entries.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">{props.labels.emptyList}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">{props.labels.colEmail}</th>
                  <th className="px-4 py-3 font-semibold">{props.labels.colRole}</th>
                  <th className="px-4 py-3 font-semibold">{props.labels.colAdded}</th>
                  <th className="px-4 py-3 font-semibold">{props.labels.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {props.entries.map((entry) => {
                  const isSelf = entry.email === props.currentEmail;
                  const roleLabel =
                    entry.role === 'admin' ? props.labels.roleAdmin : props.labels.roleComercial;

                  return (
                    <tr className="hover:bg-neutral-50/80" key={entry.id}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900">{entry.email}</span>
                        {isSelf ? (
                          <span className="ml-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {props.labels.youBadge}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-neutral-700">{roleLabel}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          disabled={removingId === entry.id}
                          onClick={async () => {
                            setError(null);
                            setSuccess(null);
                            setRemovingId(entry.id);

                            try {
                              const result = await removeAllowlistEmailAction(entry.id);

                              if (!result.ok) {
                                setError(mapAllowlistError(result.code, props.labels));
                                return;
                              }
                            } catch {
                              setError(props.labels.errorNetwork);
                            } finally {
                              setRemovingId(null);
                            }
                          }}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          {props.labels.removeButton}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {error && props.entries.length > 0 ? (
          <p className="border-t border-neutral-100 px-5 py-3 text-sm text-red-600">{error}</p>
        ) : null}
      </section>
    </div>
  );
}
