import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { withSiteOpenGraph } from '@/lib/site-metadata';
import { routing } from '@/libs/I18nRouting';
import { resolveAppLocale } from '@/utils/locale';
import '@/styles/global.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = withSiteOpenGraph({
  title: {
    default: 'Acesso Equipamentos — Locação em Belo Horizonte',
    template: '%s | Acesso Equipamentos',
  },
  description:
    'Locação de plataformas elevatórias, andaimes e equipamentos para construção civil na região metropolitana de BH.',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveAppLocale((await props.params)?.locale ?? routing.defaultLocale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html className={`${plusJakarta.variable} ${inter.variable}`} lang={locale}>
      <body>
        <NextIntlClientProvider>{props.children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
