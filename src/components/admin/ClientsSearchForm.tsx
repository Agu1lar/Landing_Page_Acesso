'use client';

import { useRouter } from 'next/navigation';
import { useId } from 'react';

type ClientsSearchFormProps = {
  initialQuery?: string;
  searchLabel: string;
  placeholder: string;
  submitLabel: string;
};

/**
 * Smart search for clients (name, e-mail, phone, company).
 */
export function ClientsSearchForm(props: ClientsSearchFormProps) {
  const router = useRouter();
  const inputId = useId();

  return (
    <form
      className="rounded-[var(--radius-card)] border border-neutral-200 bg-surface p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const q = String(formData.get('q') ?? '').trim();
        router.push(q ? `/dashboard/clientes?q=${encodeURIComponent(q)}` : '/dashboard/clientes');
      }}
    >
      <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor={inputId}>
        {props.searchLabel}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          defaultValue={props.initialQuery ?? ''}
          id={inputId}
          name="q"
          placeholder={props.placeholder}
          type="search"
        />
        <button
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          type="submit"
        >
          {props.submitLabel}
        </button>
      </div>
    </form>
  );
}
