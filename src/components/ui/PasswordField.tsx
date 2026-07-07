'use client';

import { useId, useState, type ComponentPropsWithoutRef } from 'react';

type PasswordFieldProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label: string;
  error?: string;
  hint?: string;
  showLabel: string;
  hideLabel: string;
};

export function PasswordField({
  label,
  error,
  hint,
  showLabel,
  hideLabel,
  className = '',
  id,
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [visible, setVisible] = useState(false);

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-lg border bg-surface py-2 pr-11 pl-3 text-sm text-neutral-900 transition-colors placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${
            error ? 'border-red-500' : 'border-neutral-200'
          } ${className}`}
          id={inputId}
          type={visible ? 'text' : 'password'}
          {...props}
        />
        <button
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          onClick={() => {
            setVisible((current) => !current);
          }}
          type="button"
        >
          {visible ? hideLabel : showLabel}
        </button>
      </div>
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
