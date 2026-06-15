'use client';

import { useEffect, useRef } from 'react';
import { readStoredAttribution } from '@/lib/attribution';

const GIS_SCRIPT_ID = 'google-gsi-client';
const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const REGISTERED_STORAGE_KEY = 'acesso_cookie_lead_registered';

function shouldSkipOneTapThisSession() {
  return window.sessionStorage.getItem(REGISTERED_STORAGE_KEY) === '1';
}

function markOneTapHandledThisSession() {
  window.sessionStorage.setItem(REGISTERED_STORAGE_KEY, '1');
}

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GIS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('GIS load failed')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GIS load failed'));
    document.head.appendChild(script);
  });
}

/**
 * After analytics consent, prompts Google One Tap and registers a lightweight lead.
 */
export function CookieConsentGoogleLead() {
  const startedRef = useRef(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    if (!clientId || startedRef.current) {
      return;
    }

    if (shouldSkipOneTapThisSession()) {
      return;
    }

    startedRef.current = true;
    let cancelled = false;

    const registerLead = async (credential: string) => {
      const attribution = readStoredAttribution();
      const response = await fetch('/api/leads/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          attribution: attribution ?? undefined,
        }),
      });

      if (!response.ok) {
        return;
      }

      const body = (await response.json()) as {
        ok?: boolean;
        created?: boolean;
        updated?: boolean;
        skipped?: string;
        id?: number;
      };
      if (body.ok && (body.created || body.updated)) {
        markOneTapHandledThisSession();
      }
    };

    void (async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            void registerLead(response.credential);
          },
          auto_select: true,
          cancel_on_tap_outside: false,
          context: 'signin',
        });

        window.google.accounts.id.prompt();
      } catch {
        // One Tap unavailable — no lead is created.
      }
    })();

    return () => {
      cancelled = true;
      window.google?.accounts?.id?.cancel();
    };
  }, []);

  return null;
}
