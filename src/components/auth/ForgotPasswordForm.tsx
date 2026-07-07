'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { mapAuthApiError, validatePasswordField } from '@/lib/dashboard-auth-errors';
import {
  DASHBOARD_PASSWORD_MIN_LENGTH,
  normalizeResetCode,
} from '@/lib/dashboard-password-policy';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordField } from '@/components/ui/PasswordField';

type ForgotPasswordFormProps = {
  signInUrl: string;
};

type Step = 'request' | 'reset';

export function ForgotPasswordForm(props: ForgotPasswordFormProps) {
  const t = useTranslations('ForgotPassword');
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
      <p className="mt-1 text-sm text-neutral-600">
        {step === 'request' ? t('subtitle_request') : t('subtitle_reset')}
      </p>

      {step === 'request' ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setEmailError(null);
            setFormError(null);
            setSuccess(null);

            if (!email.trim()) {
              setEmailError(t('error_invalid_email'));
              return;
            }

            setIsSubmitting(true);
            try {
              const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
              const payload = (await response.json().catch(() => ({}))) as { error?: string };

              if (!response.ok) {
                const message = mapAuthApiError(payload.error, errorLabels);
                if (payload.error === 'user_not_found') {
                  setEmailError(message);
                } else {
                  setFormError(message);
                }
                return;
              }

              setSuccess(t('success_code_sent'));
              setStep('reset');
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

          {formError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {formError}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? t('submitting_request') : t('submit_request')}
          </Button>
        </form>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setCodeError(null);
            setPasswordError(null);
            setConfirmPasswordError(null);
            setFormError(null);
            setSuccess(null);

            const normalizedCode = normalizeResetCode(code);
            if (normalizedCode.length !== 6) {
              setCodeError(t('error_invalid_code'));
              return;
            }

            const nextPasswordError = validatePasswordField(password, errorLabels);
            if (nextPasswordError) {
              setPasswordError(nextPasswordError);
              return;
            }

            if (password !== confirmPassword) {
              setConfirmPasswordError(t('error_password_mismatch'));
              return;
            }

            setIsSubmitting(true);
            try {
              const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  code: normalizedCode,
                  password,
                }),
              });
              const payload = (await response.json().catch(() => ({}))) as { error?: string };

              if (!response.ok) {
                const message = mapAuthApiError(payload.error, errorLabels);
                if (payload.error === 'invalid_code' || payload.error === 'no_active_code') {
                  setCodeError(message);
                } else if (payload.error === 'password_too_short') {
                  setPasswordError(message);
                } else {
                  setFormError(message);
                }
                return;
              }

              setSuccess(t('success_password_reset'));
              router.push(props.signInUrl);
              router.refresh();
            } catch {
              setFormError(t('error_network'));
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <Input
            autoComplete="one-time-code"
            disabled={isSubmitting}
            error={codeError ?? undefined}
            hint={t('code_hint')}
            inputMode="numeric"
            label={t('field_code')}
            maxLength={6}
            name="code"
            onChange={(event) => {
              setCode(normalizeResetCode(event.target.value));
              setCodeError(null);
            }}
            pattern="\d{6}"
            required
            type="text"
            value={code}
          />
          <PasswordField
            autoComplete="new-password"
            disabled={isSubmitting}
            error={passwordError ?? undefined}
            hideLabel={t('hide_password')}
            hint={t('password_hint', { min: DASHBOARD_PASSWORD_MIN_LENGTH })}
            label={t('field_new_password')}
            name="password"
            onChange={(event) => {
              setPassword(event.target.value);
              setPasswordError(null);
            }}
            required
            showLabel={t('show_password')}
            value={password}
          />
          <PasswordField
            autoComplete="new-password"
            disabled={isSubmitting}
            error={confirmPasswordError ?? undefined}
            hideLabel={t('hide_password')}
            label={t('field_confirm_password')}
            name="confirmPassword"
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setConfirmPasswordError(null);
            }}
            required
            showLabel={t('show_password')}
            value={confirmPassword}
          />

          {success ? (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800" role="status">
              {success}
            </p>
          ) : null}

          {formError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {formError}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? t('submitting_reset') : t('submit_reset')}
          </Button>

          <Button
            className="w-full"
            disabled={isSubmitting}
            onClick={() => {
              setStep('request');
              setCode('');
              setPassword('');
              setConfirmPassword('');
            }}
            type="button"
            variant="outline"
          >
            {t('back_to_request')}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-neutral-600">
        <Link className="font-medium text-primary hover:underline" href={props.signInUrl}>
          {t('back_to_sign_in')}
        </Link>
      </p>
    </div>
  );
}
