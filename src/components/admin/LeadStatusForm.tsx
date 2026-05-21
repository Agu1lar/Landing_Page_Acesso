'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LEAD_STATUSES } from '@/lib/lead-status';
import type { LeadStatus } from '@/lib/lead-status';

type LeadStatusFormProps = {
  leadId: number;
  currentStatus: string;
  labels: Record<LeadStatus, string>;
  fieldLabel: string;
  saveLabel: string;
  errorMessage: string;
};

export function LeadStatusForm(props: LeadStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(
    LEAD_STATUSES.includes(props.currentStatus as LeadStatus)
      ? (props.currentStatus as LeadStatus)
      : 'new',
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-3 flex flex-wrap items-end gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsSaving(true);

        const response = await fetch(`/api/admin/leads/${props.leadId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        const body = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(body.error ?? props.errorMessage);
          setIsSaving(false);
          return;
        }

        router.refresh();
        setIsSaving(false);
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="leadStatus">
          {props.fieldLabel}
        </label>
        <select
          className="rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
          disabled={isSaving}
          id="leadStatus"
          onChange={(event) => {
            setStatus(event.target.value as LeadStatus);
          }}
          value={status}
        >
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {props.labels[value]}
            </option>
          ))}
        </select>
      </div>
      <Button disabled={isSaving} size="sm" type="submit">
        {props.saveLabel}
      </Button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
