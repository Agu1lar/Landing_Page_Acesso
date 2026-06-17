import { describe, expect, it, vi } from 'vitest';
import { routing } from '@/libs/I18nRouting';

vi.mock('@/libs/Env', () => ({
  Env: {
    NEXT_PUBLIC_APP_URL: undefined as string | undefined,
    VERCEL_ENV: undefined as 'development' | 'preview' | 'production' | undefined,
  },
}));

import { Env } from '@/libs/Env';
import { getBaseUrl, getI18nPath } from './Helpers';

describe('Helpers', () => {
  describe('getBaseUrl', () => {
    it('uses official domain in production when env still points to vercel.app', () => {
      Env.VERCEL_ENV = 'production';
      Env.NEXT_PUBLIC_APP_URL = 'https://landing-page-acesso.vercel.app';
      expect(getBaseUrl()).toBe('https://acessoequipamentos.com.br');
    });

    it('keeps configured custom domain in production', () => {
      Env.VERCEL_ENV = 'production';
      Env.NEXT_PUBLIC_APP_URL = 'https://acessoequipamentos.com.br';
      expect(getBaseUrl()).toBe('https://acessoequipamentos.com.br');
    });

    it('keeps vercel.app on preview deployments', () => {
      Env.VERCEL_ENV = 'preview';
      Env.NEXT_PUBLIC_APP_URL = 'https://landing-page-acesso-git-main.vercel.app';
      expect(getBaseUrl()).toBe('https://landing-page-acesso-git-main.vercel.app');
    });

    it('falls back to localhost without env', () => {
      Env.VERCEL_ENV = undefined;
      Env.NEXT_PUBLIC_APP_URL = undefined;
      expect(getBaseUrl()).toBe('http://localhost:3000');
    });
  });

  describe('I18n path helper', () => {
    it('keeps path unchanged when locale is default', () => {
      const url = '/random-url';
      const locale = routing.defaultLocale;

      expect(getI18nPath(url, locale)).toBe(url);
    });

    it('prefixes path with locale when locale is not default', () => {
      const url = '/random-url';
      const locale = 'fr';

      expect(getI18nPath(url, locale)).toBe(`/fr${url}`);
    });
  });
});
