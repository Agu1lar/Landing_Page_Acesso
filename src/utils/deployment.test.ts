import { describe, expect, it, vi } from 'vitest';

vi.mock('@/libs/Env', () => ({
  Env: {
    VERCEL_ENV: undefined as 'development' | 'preview' | 'production' | undefined,
    NEXT_PUBLIC_APP_URL: '',
  },
}));

import { Env } from '@/libs/Env';
import { isPreviewDeployment } from '@/utils/deployment';

describe('isPreviewDeployment', () => {
  it('returns true for Vercel preview env', () => {
    Env.VERCEL_ENV = 'preview';
    Env.NEXT_PUBLIC_APP_URL = 'https://landing-page-acesso-git-main-user.vercel.app';
    expect(isPreviewDeployment()).toBe(true);
  });

  it('returns false for production on vercel.app domain', () => {
    Env.VERCEL_ENV = 'production';
    Env.NEXT_PUBLIC_APP_URL = 'https://landing-page-acesso.vercel.app';
    expect(isPreviewDeployment()).toBe(false);
  });

  it('returns false for local development', () => {
    Env.VERCEL_ENV = undefined;
    Env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    expect(isPreviewDeployment()).toBe(false);
  });
});
