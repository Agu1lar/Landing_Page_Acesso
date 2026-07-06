import { useId, type ComponentPropsWithoutRef } from 'react';

type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  label: string;
  error?: string;
};

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? props.name ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-neutral-800" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={`min-h-[100px] w-full resize-y rounded-lg border bg-surface px-3 py-2 text-sm text-neutral-900 transition-colors placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${
          error ? 'border-red-500' : 'border-neutral-200'
        } ${className}`}
        id={textareaId}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
