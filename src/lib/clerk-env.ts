/**
 * Detects whether Clerk publishable key is test or live.
 */
export function clerkKeyMode(publishableKey: string | undefined) {
  if (!publishableKey) {
    return 'unknown' as const;
  }
  if (publishableKey.startsWith('pk_live_')) {
    return 'live' as const;
  }
  if (publishableKey.startsWith('pk_test_')) {
    return 'test' as const;
  }
  return 'unknown' as const;
}

/**
 * True when Vercel Production runs Clerk test keys (blocks admin login on official domain).
 */
export function isClerkProductionKeyMismatch(options: {
  vercelEnv?: string;
  publishableKey: string | undefined;
}) {
  return options.vercelEnv === 'production' && clerkKeyMode(options.publishableKey) === 'test';
}

/**
 * Logs a startup warning when Production uses Clerk test keys.
 */
export function logClerkEnvironmentWarnings() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const vercelEnv = process.env.VERCEL_ENV;
  const mode = clerkKeyMode(publishableKey);

  if (isClerkProductionKeyMismatch({ vercelEnv, publishableKey })) {
    console.warn(
      '[go-live] Clerk: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is pk_test_ in Vercel Production. ' +
        'Troque para pk_live_ / sk_live_ antes de apontar acessoequipamentos.com.br — ' +
        'caso contrário o painel /dashboard/leads pode ficar inacessível.',
    );
    return;
  }

  if (vercelEnv === 'production' && mode === 'live') {
    console.info('[go-live] Clerk: chaves live detectadas em Production.');
  }
}
