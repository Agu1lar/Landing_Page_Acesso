import { useId, type ComponentPropsWithoutRef } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-neutral-900 transition-colors placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${
          error ? 'border-red-500' : 'border-neutral-200'
        } ${className}`}
        id={inputId}
        {...props}
      />
      {hint && !error ? (
        <p className="mt-1 text-xs text-neutral-500" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-red-600" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
