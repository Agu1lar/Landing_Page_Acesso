'use client';

import { useFormStatus } from 'react-dom';

type AdminPendingButtonVariant = 'default' | 'danger' | 'primary' | 'outline' | 'link' | 'linkDanger' | 'linkSuccess';

type AdminPendingButtonProps = {
  label: string;
  pendingLabel: string;
  className?: string;
  name?: string;
  value?: string;
  formAction?: string | ((formData: FormData) => void);
  variant?: AdminPendingButtonVariant;
  disabled?: boolean;
  title?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const variantClasses: Record<AdminPendingButtonVariant, string> = {
  default: 'rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50',
  danger: 'rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50',
  primary: 'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover',
  outline:
    'rounded-lg border border-neutral-200 bg-surface px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50',
  link: 'text-sm font-medium text-primary hover:underline',
  linkDanger: 'text-sm font-medium text-red-700 hover:underline',
  linkSuccess: 'text-sm font-medium text-emerald-700 hover:underline',
};

/**
 * Submit button that reflects server action pending state.
 */
export function AdminPendingButton(props: AdminPendingButtonProps) {
  const { pending } = useFormStatus();
  const disabled = props.disabled || pending;
  const variant = props.variant ?? 'default';

  return (
    <button
      aria-busy={pending}
      className={`${variantClasses[variant]} disabled:cursor-wait disabled:opacity-60 ${props.className ?? ''}`}
      disabled={disabled}
      formAction={props.formAction}
      name={props.name}
      onClick={props.onClick}
      title={props.title}
      type="submit"
      value={props.value}
    >
      {pending ? props.pendingLabel : props.label}
    </button>
  );
}
