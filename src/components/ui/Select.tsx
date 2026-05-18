import type { ComponentPropsWithoutRef } from 'react';

type SelectProps = ComponentPropsWithoutRef<'select'> & {
  label: string;
  error?: string;
};

export function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor={selectId}>
        {label}
      </label>
      <select
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${
          error ? 'border-red-500' : 'border-neutral-200'
        } ${className}`}
        id={selectId}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
