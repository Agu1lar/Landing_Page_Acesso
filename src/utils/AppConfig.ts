import { ptBR } from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/shared/types';
import type { LocalePrefixMode } from 'next-intl/routing';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'Acesso Equipamentos',
  i18n: {
    locales: ['pt-BR'] as const,
    defaultLocale: 'pt-BR' as const,
    localePrefix,
  },
};

const supportedLocales: Record<string, LocalizationResource> = {
  'pt-BR': ptBR,
};

export const ClerkLocalizations = {
  defaultLocale: ptBR,
  supportedLocales,
};
