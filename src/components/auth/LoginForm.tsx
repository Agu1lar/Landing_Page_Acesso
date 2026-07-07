'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type LoginFormProps = {
  redirectUrl: string;
};

export function LoginForm(props: LoginFormProps) {
  const t = useTranslations('SignIn');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="font-heading text-2xl font-bold text-neutral-900">{t('title')}</h1>
      <p className="mt-1 text-sm text-neutral-600">{t('subtitle')}</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setIsSubmitting(true);

          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              setError(t('error_invalid_credentials'));
              return;
            }

            router.push(props.redirectUrl);
            router.refresh();
          } catch {
            setError(t('error_network'));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <Input
          autoComplete="email"
          disabled={isSubmitting}
          inputMode="email"
          label={t('field_email')}
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          required
          spellCheck={false}
          type="email"
          value={email}
        />
        <Input
          autoComplete="current-password"
          disabled={isSubmitting}
          label={t('field_password')}
          name="password"
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          required
          type="password"
          value={password}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </div>
  );
}
