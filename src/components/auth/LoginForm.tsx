'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { mapAuthApiError, validatePasswordField } from '@/lib/dashboard-auth-errors';
import { DASHBOARD_PASSWORD_MIN_LENGTH } from '@/lib/dashboard-password-policy';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordField } from '@/components/ui/PasswordField';

type LoginFormProps = {
  redirectUrl: string;
  forgotPasswordUrl: string;
};

export function LoginForm(props: LoginFormProps) {
  const t = useTranslations('SignIn');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorLabels = {
    invalidCredentials: t('error_invalid_credentials'),
    invalidEmail: t('error_invalid_email'),
    passwordTooShort: t('error_password_too_short', { min: DASHBOARD_PASSWORD_MIN_LENGTH }),
    passwordTooLong: t('error_password_too_long'),
    passwordMismatch: t('error_password_mismatch'),
    rateLimited: t('error_rate_limited'),
    network: t('error_network'),
    userNotFound: t('error_user_not_found'),
    invalidCode: t('error_invalid_code'),
    codeExpired: t('error_code_expired'),
    noActiveCode: t('error_no_active_code'),
    tooManyAttempts: t('error_too_many_attempts'),
    emailSendFailed: t('error_email_send_failed'),
    generic: t('error_generic'),
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="font-heading text-2xl font-bold text-neutral-900">{t('title')}</h1>
      <p className="mt-1 text-sm text-neutral-600">{t('subtitle')}</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setEmailError(null);
          setPasswordError(null);
          setFormError(null);

          const nextPasswordError = validatePasswordField(password, errorLabels);
          if (!email.trim()) {
            setEmailError(t('error_invalid_email'));
            return;
          }
          if (nextPasswordError) {
            setPasswordError(nextPasswordError);
            return;
          }

          setIsSubmitting(true);

          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            const payload = (await response.json().catch(() => ({}))) as { error?: string };

            if (!response.ok) {
              const message = mapAuthApiError(payload.error, errorLabels);
              if (payload.error === 'invalid_email') {
                setEmailError(message);
              } else if (payload.error === 'password_too_short') {
                setPasswordError(message);
              } else {
                setFormError(message);
              }
              return;
            }

            router.push(props.redirectUrl);
            router.refresh();
          } catch {
            setFormError(t('error_network'));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <Input
          autoComplete="email"
          disabled={isSubmitting}
          error={emailError ?? undefined}
          inputMode="email"
          label={t('field_email')}
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError(null);
          }}
          required
          spellCheck={false}
          type="email"
          value={email}
        />
        <PasswordField
          autoComplete="current-password"
          disabled={isSubmitting}
          error={passwordError ?? undefined}
          hideLabel={t('hide_password')}
          hint={t('password_hint', { min: DASHBOARD_PASSWORD_MIN_LENGTH })}
          label={t('field_password')}
          name="password"
          onChange={(event) => {
            setPassword(event.target.value);
            setPasswordError(null);
          }}
          required
          showLabel={t('show_password')}
          value={password}
        />

        <div className="flex justify-end">
          <Link className="text-sm font-medium text-primary hover:underline" href={props.forgotPasswordUrl}>
            {t('forgot_password_link')}
          </Link>
        </div>

        {formError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        ) : null}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  );
}
