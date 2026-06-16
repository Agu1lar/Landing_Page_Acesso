export const ONE_TAP_REGISTERED_SESSION_KEY = 'acesso_cookie_lead_registered';
export const ONE_TAP_PROMPT_ATTEMPTS_SESSION_KEY = 'acesso_one_tap_prompt_attempts';
export const ONE_TAP_PHONE_DISMISSED_SESSION_KEY = 'acesso_cookie_lead_phone_dismissed';
export const ONE_TAP_PHONE_SAVED_SESSION_KEY = 'acesso_cookie_lead_phone_saved';

export const ONE_TAP_MAX_PROMPTS_PER_SESSION = 4;
export const ONE_TAP_INITIAL_DELAY_MS = 600;
export const ONE_TAP_RETRY_DELAY_MS = 2500;

export function shouldUseFedcmForOneTap(userAgent: string) {
  const ua = userAgent.toLowerCase();
  // iOS WebKit (Safari, Chrome, etc.) — FedCM One Tap is unreliable.
  if (/iphone|ipad|ipod/.test(ua)) {
    return false;
  }
  // Desktop Safari without Chromium engine.
  if (/safari/.test(ua) && !/chrome|chromium|crios|fxios|edgios|edg\//.test(ua)) {
    return false;
  }
  // In-app browsers often break Google Identity / FedCM.
  if (/instagram|fbav|fb_iab|line\/|twitter|linkedinapp|wv\)/.test(ua)) {
    return false;
  }
  return true;
}

export function shouldSkipOneTapAfterLeadRegistered(sessionStorage: Pick<Storage, 'getItem'> | undefined) {
  return sessionStorage?.getItem(ONE_TAP_REGISTERED_SESSION_KEY) === '1';
}

export function markOneTapLeadRegistered(sessionStorage: Pick<Storage, 'setItem'>) {
  sessionStorage.setItem(ONE_TAP_REGISTERED_SESSION_KEY, '1');
}

export function getOneTapPromptAttempts(sessionStorage: Pick<Storage, 'getItem'> | undefined) {
  if (!sessionStorage) {
    return 0;
  }
  const parsed = Number.parseInt(sessionStorage.getItem(ONE_TAP_PROMPT_ATTEMPTS_SESSION_KEY) ?? '0', 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function canAttemptOneTapPrompt(sessionStorage: Pick<Storage, 'getItem'> | undefined) {
  return getOneTapPromptAttempts(sessionStorage) < ONE_TAP_MAX_PROMPTS_PER_SESSION;
}

export function incrementOneTapPromptAttempts(sessionStorage: Pick<Storage, 'getItem' | 'setItem'>) {
  const next = getOneTapPromptAttempts(sessionStorage) + 1;
  sessionStorage.setItem(ONE_TAP_PROMPT_ATTEMPTS_SESSION_KEY, String(next));
}

export function shouldRetryOneTapAfterSkip(reason: string) {
  return reason === 'issuing_failed' || reason === 'auto_cancel';
}

export function shouldShowOneTapFallback(
  outcome: 'not_displayed' | 'skipped' | 'dismissed',
  reason: string,
) {
  if (outcome === 'not_displayed') {
    return reason !== 'opt_out_or_no_session';
  }
  if (outcome === 'dismissed') {
    return reason !== 'credential_returned' && reason !== 'flow_restarted';
  }
  return reason === 'user_cancel' || reason === 'tap_outside';
}

export function shouldShowOptionalPhonePrompt(sessionStorage: Pick<Storage, 'getItem'> | undefined) {
  if (!sessionStorage) {
    return true;
  }
  if (sessionStorage.getItem(ONE_TAP_PHONE_SAVED_SESSION_KEY) === '1') {
    return false;
  }
  if (sessionStorage.getItem(ONE_TAP_PHONE_DISMISSED_SESSION_KEY) === '1') {
    return false;
  }
  return true;
}

export function markOptionalPhonePromptDismissed(sessionStorage: Pick<Storage, 'setItem'>) {
  sessionStorage.setItem(ONE_TAP_PHONE_DISMISSED_SESSION_KEY, '1');
}

export function markOptionalPhonePromptSaved(sessionStorage: Pick<Storage, 'setItem'>) {
  sessionStorage.setItem(ONE_TAP_PHONE_SAVED_SESSION_KEY, '1');
}
