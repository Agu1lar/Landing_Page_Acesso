import { describe, expect, it } from 'vitest';
import {
  ONE_TAP_MAX_PROMPTS_PER_SESSION,
  ONE_TAP_PROMPT_ATTEMPTS_SESSION_KEY,
  ONE_TAP_REGISTERED_SESSION_KEY,
  canAttemptOneTapPrompt,
  getOneTapPromptAttempts,
  incrementOneTapPromptAttempts,
  markOneTapLeadRegistered,
  markOptionalPhonePromptDismissed,
  markOptionalPhonePromptSaved,
  shouldAutoSelectOneTap,
  shouldRetryOneTapAfterSkip,
  shouldShowOneTapFallback,
  shouldShowOptionalPhonePrompt,
  shouldSkipOneTapAfterLeadRegistered,
  shouldUseFedcmForOneTap,
} from '@/lib/google-one-tap-client';

function memoryStorage(initial: Record<string, string> = {}) {
  const store = { ...initial };
  return {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
  };
}

describe('google-one-tap-client', () => {
  it('blocks further prompts after a lead is registered in the session', () => {
    const storage = memoryStorage();
    expect(shouldSkipOneTapAfterLeadRegistered(storage)).toBe(false);
    markOneTapLeadRegistered(storage);
    expect(shouldSkipOneTapAfterLeadRegistered(storage)).toBe(true);
    expect(storage.getItem(ONE_TAP_REGISTERED_SESSION_KEY)).toBe('1');
  });

  it('limits prompt attempts per session', () => {
    const storage = memoryStorage();
    expect(canAttemptOneTapPrompt(storage)).toBe(true);

    for (let i = 0; i < ONE_TAP_MAX_PROMPTS_PER_SESSION; i += 1) {
      incrementOneTapPromptAttempts(storage);
    }

    expect(getOneTapPromptAttempts(storage)).toBe(ONE_TAP_MAX_PROMPTS_PER_SESSION);
    expect(canAttemptOneTapPrompt(storage)).toBe(false);
    expect(storage.getItem(ONE_TAP_PROMPT_ATTEMPTS_SESSION_KEY)).toBe(String(ONE_TAP_MAX_PROMPTS_PER_SESSION));
  });

  it('retries only for transient skip reasons', () => {
    expect(shouldRetryOneTapAfterSkip('issuing_failed')).toBe(true);
    expect(shouldRetryOneTapAfterSkip('auto_cancel')).toBe(true);
    expect(shouldRetryOneTapAfterSkip('user_cancel')).toBe(false);
  });

  it('shows fallback for recoverable prompt failures', () => {
    expect(shouldShowOneTapFallback('not_displayed', 'unregistered_origin')).toBe(true);
    expect(shouldShowOneTapFallback('not_displayed', 'opt_out_or_no_session')).toBe(false);
    expect(shouldShowOneTapFallback('dismissed', 'credential_returned')).toBe(false);
    expect(shouldShowOneTapFallback('skipped', 'user_cancel')).toBe(true);
  });

  it('shows optional phone prompt once per session unless saved or dismissed', () => {
    const storage = memoryStorage();
    expect(shouldShowOptionalPhonePrompt(storage)).toBe(true);
    markOptionalPhonePromptDismissed(storage);
    expect(shouldShowOptionalPhonePrompt(storage)).toBe(false);

    const savedStorage = memoryStorage();
    markOptionalPhonePromptSaved(savedStorage);
    expect(shouldShowOptionalPhonePrompt(savedStorage)).toBe(false);
  });

  it('disables FedCM on mobile and in-app browsers', () => {
    expect(
      shouldUseFedcmForOneTap(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe(false);
    expect(
      shouldUseFedcmForOneTap(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      ),
    ).toBe(false);
    expect(
      shouldUseFedcmForOneTap(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      ),
    ).toBe(false);
    expect(
      shouldUseFedcmForOneTap(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      ),
    ).toBe(true);
    expect(
      shouldUseFedcmForOneTap(
        'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36 Instagram 312.0.0.0',
      ),
    ).toBe(false);
  });

  it('disables auto_select on phones', () => {
    expect(
      shouldAutoSelectOneTap(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      ),
    ).toBe(false);
    expect(
      shouldAutoSelectOneTap(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      ),
    ).toBe(true);
  });
});
