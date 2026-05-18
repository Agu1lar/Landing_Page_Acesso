import type { ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor={inputId}>
        {label}
      </label>
      <input
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-neutral-900 transition-colors placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${
          error ? 'border-red-500' : 'border-neutral-200'
        } ${className}`}
        id={inputId}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
