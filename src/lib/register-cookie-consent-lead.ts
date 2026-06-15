import { readStoredAttribution } from '@/lib/attribution';
import { markOneTapLeadRegistered } from '@/lib/google-one-tap-client';

export async function registerCookieConsentLead(credential: string) {
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
    return { ok: false as const };
  }

  const body = (await response.json()) as {
    ok?: boolean;
    created?: boolean;
    updated?: boolean;
  };

  if (body.ok && (body.created || body.updated)) {
    markOneTapLeadRegistered(window.sessionStorage);
    return { ok: true as const, registered: true as const };
  }

  return { ok: true as const, registered: false as const };
}
