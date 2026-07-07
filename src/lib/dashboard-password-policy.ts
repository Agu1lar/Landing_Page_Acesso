export const DASHBOARD_PASSWORD_MIN_LENGTH = 8;
export const DASHBOARD_PASSWORD_MAX_LENGTH = 200;

export type DashboardPasswordIssue = 'too_short' | 'too_long';

/**
 * Validates dashboard password length (server and client).
 */
export function validateDashboardPassword(password: string): DashboardPasswordIssue | null {
  if (password.length < DASHBOARD_PASSWORD_MIN_LENGTH) {
    return 'too_short';
  }
  if (password.length > DASHBOARD_PASSWORD_MAX_LENGTH) {
    return 'too_long';
  }
  return null;
}

/**
 * Normalizes a 6-digit reset code (digits only).
 */
export function normalizeResetCode(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 6);
}

/**
 * Returns true when the code has exactly six digits.
 */
export function isValidResetCodeFormat(code: string) {
  return /^\d{6}$/u.test(code);
}
