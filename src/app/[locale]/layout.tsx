import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { withSiteOpenGraph } from '@/lib/site-metadata';
import { Env } from '@/libs/Env';
import { routing } from '@/libs/I18nRouting';
import { resolveAppLocale } from '@/utils/locale';
import '@/styles/global.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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

  const widgetApiUrl = Env.NEXT_PUBLIC_WHATSAPPOS_API_URL?.trim().replace(/\/$/, '');
  const widgetKey = Env.NEXT_PUBLIC_WHATSAPPOS_WIDGET_KEY?.trim();

  return (
    <html className={`${plusJakarta.variable} ${inter.variable}`} lang={locale}>
      <body>
        {widgetApiUrl && widgetKey ? (
          <Script async src={`${widgetApiUrl}/widgets/${widgetKey}.js`} strategy="afterInteractive" />
        ) : null}
        <NextIntlClientProvider>{props.children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
