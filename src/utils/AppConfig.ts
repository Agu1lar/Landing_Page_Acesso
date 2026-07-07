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
