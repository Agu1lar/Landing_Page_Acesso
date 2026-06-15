'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { dismissOptionalPhonePrompt, saveCookieConsentPhone } from '@/lib/register-cookie-consent-phone';
import { CookieConsentPhoneSchema } from '@/validations/cookie-consent-contact';

type GoogleOneTapPhonePromptProps = {
  credential: string;
  onClose: () => void;
};

/**
 * Optional WhatsApp/phone capture right after Google One Tap registration.
 */
export function GoogleOneTapPhonePrompt(props: GoogleOneTapPhonePromptProps) {
  const t = useTranslations('GoogleOneTap');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDismiss = () => {
    dismissOptionalPhonePrompt();
    props.onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = CookieConsentPhoneSchema.safeParse({ phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t('phone_invalid'));
      return;
    }

    setSaving(true);
    try {
      const result = await saveCookieConsentPhone(props.credential, parsed.data.phone);
      if (!result.ok) {
        setError(t('phone_save_error'));
        return;
      }
      props.onClose();
    } catch {
      setError(t('phone_save_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      aria-labelledby="google-one-tap-phone-title"
      className="fixed right-4 bottom-20 z-30 w-[min(100%,20rem)] rounded-xl border border-neutral-700 bg-neutral-900/95 px-4 py-3 text-neutral-200 shadow-lg backdrop-blur-sm sm:bottom-6"
      role="dialog"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white" id="google-one-tap-phone-title">
            {t('phone_title')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">{t('phone_description')}</p>
        </div>
        <button
          aria-label={t('phone_skip')}
          className="shrink-0 text-neutral-500 transition-colors hover:text-neutral-300"
          onClick={handleDismiss}
          type="button"
        >
          ×
        </button>
      </div>

      <form className="mt-3 space-y-2" onSubmit={(event) => void handleSubmit(event)}>
        <input
          autoComplete="tel"
          className="w-full rounded-lg border border-neutral-600 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none"
          inputMode="tel"
          name="phone"
          onChange={(event) => {
            setPhone(event.target.value);
            setError(null);
          }}
          placeholder={t('phone_placeholder')}
          type="tel"
          value={phone}
        />
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        <div className="flex items-center gap-2">
          <Button
            className="!bg-emerald-600 !text-white hover:!bg-emerald-500"
            disabled={saving}
            size="sm"
            type="submit"
            variant="secondary"
          >
            {saving ? t('phone_saving') : t('phone_save')}
          </Button>
          <button
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            onClick={handleDismiss}
            type="button"
          >
            {t('phone_skip')}
          </button>
        </div>
      </form>
    </div>
  );
}
