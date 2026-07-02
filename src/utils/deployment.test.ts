import { describe, expect, it, vi } from 'vitest';

vi.mock('@/libs/Env', () => ({
  Env: {
    VERCEL_ENV: undefined as 'development' | 'preview' | 'production' | undefined,
    NEXT_PUBLIC_APP_URL: '',
  },
}));

import { Env } from '@/libs/Env';
import {
  isPreLaunchVercelAppProduction,
  isPreviewDeployment,
  shouldBlockSearchIndexing,
} from '@/utils/deployment';

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

describe('isPreLaunchVercelAppProduction', () => {
  it('returns true when production uses vercel.app URL', () => {
    Env.VERCEL_ENV = 'production';
    Env.NEXT_PUBLIC_APP_URL = 'https://landing-page-acesso.vercel.app';
    expect(isPreLaunchVercelAppProduction()).toBe(true);
  });

  it('returns false when production uses the official domain', () => {
    Env.VERCEL_ENV = 'production';
    Env.NEXT_PUBLIC_APP_URL = 'https://acessoequipamentos.com.br';
    expect(isPreLaunchVercelAppProduction()).toBe(false);
  });
});

describe('shouldBlockSearchIndexing', () => {
  it('blocks preview and pre-launch vercel.app production', () => {
    Env.VERCEL_ENV = 'preview';
    Env.NEXT_PUBLIC_APP_URL = 'https://landing-page-acesso.vercel.app';
    expect(shouldBlockSearchIndexing()).toBe(true);

    Env.VERCEL_ENV = 'production';
    expect(shouldBlockSearchIndexing()).toBe(true);
  });

  it('allows indexing on production with official domain', () => {
    Env.VERCEL_ENV = 'production';
    Env.NEXT_PUBLIC_APP_URL = 'https://acessoequipamentos.com.br';
    expect(shouldBlockSearchIndexing()).toBe(false);
  });
});
