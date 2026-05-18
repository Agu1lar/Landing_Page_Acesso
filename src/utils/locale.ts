import { hasLocale } from 'next-intl';
import { routing } from '@/libs/I18nRouting';

export type AppLocale = (typeof routing.locales)[number];

export function resolveAppLocale(locale: string): AppLocale {
  if (hasLocale(routing.locales, locale)) {
    return locale;
  }
  return routing.defaultLocale;
}
