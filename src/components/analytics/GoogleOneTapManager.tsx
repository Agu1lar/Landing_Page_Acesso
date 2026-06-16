'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ONE_TAP_INITIAL_DELAY_MS,
  ONE_TAP_RETRY_DELAY_MS,
  canAttemptOneTapPrompt,
  incrementOneTapPromptAttempts,
  shouldRetryOneTapAfterSkip,
  shouldShowOneTapFallback,
  shouldShowOptionalPhonePrompt,
  shouldSkipOneTapAfterLeadRegistered,
  shouldUseFedcmForOneTap,
} from '@/lib/google-one-tap-client';
import { loadGoogleGsiScript } from '@/lib/load-google-gsi';
import { recordOneTapPrompt } from '@/lib/record-one-tap-prompt';
import { registerCookieConsentLead } from '@/lib/register-cookie-consent-lead';
import { GoogleOneTapPhonePrompt } from '@/components/analytics/GoogleOneTapPhonePrompt';

/**
 * After analytics consent, prompts Google One Tap (with retries and fallback button).
 */
export function GoogleOneTapManager() {
  const t = useTranslations('GoogleOneTap');
  const pathname = usePathname();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';

  const initializedRef = useRef(false);
  const retryTimerRef = useRef<number | null>(null);
  const fallbackRenderedRef = useRef(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const pendingCredentialRef = useRef<string | null>(null);

  const [showFallback, setShowFallback] = useState(false);
  const [leadRegistered, setLeadRegistered] = useState(false);
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);

  useEffect(() => {
    setLeadRegistered(shouldSkipOneTapAfterLeadRegistered(window.sessionStorage));
  }, [pathname]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const handleCredential = useCallback(async (credential: string) => {
    const result = await registerCookieConsentLead(credential);
    if (result.ok) {
      setShowFallback(false);
      setLeadRegistered(true);
      void recordOneTapPrompt('registered', result.reason);
      if (shouldShowOptionalPhonePrompt(window.sessionStorage)) {
        pendingCredentialRef.current = credential;
        setShowPhonePrompt(true);
      }
      return;
    }

    void recordOneTapPrompt('dismissed', 'registration_failed');
  }, []);

  const ensureInitialized = useCallback(() => {
    if (!clientId || !window.google?.accounts?.id || initializedRef.current) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        void handleCredential(response.credential);
      },
      auto_select: true,
      cancel_on_tap_outside: false,
      context: 'signin',
      use_fedcm_for_prompt: shouldUseFedcmForOneTap(window.navigator.userAgent),
      itp_support: true,
    });
    initializedRef.current = true;
  }, [clientId, handleCredential]);

  const runPrompt = useCallback(async () => {
    if (!clientId || shouldSkipOneTapAfterLeadRegistered(window.sessionStorage)) {
      return;
    }

    if (!canAttemptOneTapPrompt(window.sessionStorage)) {
      setShowFallback(true);
      return;
    }

    incrementOneTapPromptAttempts(window.sessionStorage);

    try {
      await loadGoogleGsiScript();
      ensureInitialized();

      if (!window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          void recordOneTapPrompt('not_displayed', reason);
          if (shouldShowOneTapFallback('not_displayed', reason)) {
            setShowFallback(true);
          }
          return;
        }

        if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason();
          void recordOneTapPrompt('skipped', reason);
          if (shouldShowOneTapFallback('skipped', reason)) {
            setShowFallback(true);
          }
          if (shouldRetryOneTapAfterSkip(reason) && canAttemptOneTapPrompt(window.sessionStorage)) {
            clearRetryTimer();
            retryTimerRef.current = window.setTimeout(() => {
              void runPrompt();
            }, ONE_TAP_RETRY_DELAY_MS);
          }
          return;
        }

        if (notification.isDismissedMoment()) {
          const reason = notification.getDismissedReason();
          void recordOneTapPrompt('dismissed', reason);
          if (shouldShowOneTapFallback('dismissed', reason)) {
            setShowFallback(true);
          }
        }
      });
    } catch {
      setShowFallback(true);
    }
  }, [clearRetryTimer, clientId, ensureInitialized]);

  useEffect(() => {
    if (!clientId || leadRegistered || shouldSkipOneTapAfterLeadRegistered(window.sessionStorage)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void runPrompt();
    }, ONE_TAP_INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      clearRetryTimer();
      window.google?.accounts?.id?.cancel();
    };
  }, [clearRetryTimer, clientId, leadRegistered, pathname, runPrompt]);

  useEffect(() => {
    if (!showFallback || !clientId || leadRegistered) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await loadGoogleGsiScript();
        ensureInitialized();

        if (cancelled || !window.google?.accounts?.id || !buttonContainerRef.current) {
          return;
        }

        if (fallbackRenderedRef.current) {
          return;
        }

        buttonContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 280,
          locale: 'pt-BR',
        });
        fallbackRenderedRef.current = true;
      } catch {
        // Fallback button unavailable.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, ensureInitialized, leadRegistered, showFallback]);

  if (!clientId) {
    return null;
  }

  const phonePrompt =
    showPhonePrompt && pendingCredentialRef.current ? (
      <GoogleOneTapPhonePrompt
        credential={pendingCredentialRef.current}
        onClose={() => {
          pendingCredentialRef.current = null;
          setShowPhonePrompt(false);
        }}
      />
    ) : null;

  if (!showFallback || leadRegistered) {
    return phonePrompt;
  }

  return (
    <>
      <div
        aria-labelledby="google-one-tap-fallback-title"
        className="fixed bottom-20 left-4 z-30 max-w-xs rounded-xl border border-neutral-700 bg-neutral-900/95 px-4 py-3 text-neutral-200 shadow-lg backdrop-blur-sm sm:bottom-6"
        role="complementary"
      >
        <p className="text-sm font-medium text-white" id="google-one-tap-fallback-title">
          {t('fallback_title')}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-400">{t('fallback_description')}</p>
        <div className="mt-3 flex justify-center" ref={buttonContainerRef} />
      </div>
      {phonePrompt}
    </>
  );
}
