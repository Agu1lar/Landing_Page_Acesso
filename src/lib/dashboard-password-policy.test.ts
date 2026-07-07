import { describe, expect, it } from 'vitest';
import { mapAuthApiError, validatePasswordField } from '@/lib/dashboard-auth-errors';
import {
  DASHBOARD_PASSWORD_MAX_LENGTH,
  DASHBOARD_PASSWORD_MIN_LENGTH,
  isValidResetCodeFormat,
  normalizeResetCode,
  validateDashboardPassword,
} from '@/lib/dashboard-password-policy';

const labels = {
  invalidCredentials: 'credenciais',
  invalidEmail: 'email',
  passwordTooShort: 'mínimo {min}',
  passwordTooLong: 'muito longa',
  passwordMismatch: 'mismatch',
  rateLimited: 'rate',
  network: 'network',
  userNotFound: 'not found',
  invalidCode: 'invalid code',
  codeExpired: 'expired',
  noActiveCode: 'no code',
  tooManyAttempts: 'attempts',
  emailSendFailed: 'email fail',
  generic: 'generic',
};

describe('validateDashboardPassword', () => {
  it('rejects passwords shorter than minimum', () => {
    expect(validateDashboardPassword('1234567')).toBe('too_short');
  });

  it('accepts passwords at minimum length', () => {
    expect(validateDashboardPassword('a'.repeat(DASHBOARD_PASSWORD_MIN_LENGTH))).toBeNull();
  });

  it('rejects passwords longer than maximum', () => {
    expect(validateDashboardPassword('a'.repeat(DASHBOARD_PASSWORD_MAX_LENGTH + 1))).toBe('too_long');
  });
});

describe('normalizeResetCode', () => {
  it('keeps only digits and limits to six characters', () => {
    expect(normalizeResetCode('12-34 56-78')).toBe('123456');
  });
});

describe('isValidResetCodeFormat', () => {
  it('requires exactly six digits', () => {
    expect(isValidResetCodeFormat('123456')).toBe(true);
    expect(isValidResetCodeFormat('12345')).toBe(false);
    expect(isValidResetCodeFormat('1234567')).toBe(false);
  });
});

describe('validatePasswordField', () => {
  it('returns localized too-short message', () => {
    expect(validatePasswordField('short', labels)).toBe('mínimo 8');
  });
});

describe('mapAuthApiError', () => {
  it('maps user_not_found explicitly', () => {
    expect(mapAuthApiError('user_not_found', labels)).toBe('not found');
  });

  it('falls back to generic for unknown codes', () => {
    expect(mapAuthApiError('unknown', labels)).toBe('generic');
  });
});
