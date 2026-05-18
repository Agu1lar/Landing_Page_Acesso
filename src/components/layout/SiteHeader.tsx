'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { GlobalSearch } from '@/components/marketing/GlobalSearch';
import type { SearchIndexItem } from '@/components/marketing/GlobalSearch';
import { Button } from '@/components/ui/Button';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { Link } from '@/libs/I18nNavigation';

type SiteHeaderProps = {
  searchIndex: SearchIndexItem[];
};

const navLinks = [
  { href: '/', key: 'home_link' as const },
  { href: '/equipamentos', key: 'equipamentos_link' as const },
  { href: '/sobre', key: 'sobre_link' as const },
  { href: '/contato', key: 'contato_link' as const },
];

export function SiteHeader({ searchIndex }: SiteHeaderProps) {
  const t = useTranslations('RootLayout');
  const [mobileOpen, setMobileOpen] = useState(false);
  const whatsappHeader = buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-header' }));

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface/95 shadow-[var(--shadow-header)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex shrink-0 items-center" href="/">
            <Image
              alt="Acesso Equipamentos — locação de plataformas, andaimes e máquinas"
              className="h-11 max-h-12 w-auto object-contain object-left sm:h-12"
              height={48}
              priority
              sizes="(max-width: 768px) 160px, 200px"
              src="/assets/brand/logo-acesso.png"
              width={200}
            />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                className="text-sm font-medium text-neutral-700 transition-colors hover:text-primary"
                href={link.href}
                key={link.href}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button href={whatsappHeader} size="sm" variant="whatsapp">
              {t('whatsapp_link')}
            </Button>
            <Button href="/orcamento" size="sm" variant="outline">
              {t('orcamento_link')}
            </Button>
          </div>

          <button
            aria-expanded={mobileOpen}
            aria-label="Menu"
            className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 md:hidden"
            onClick={() =>{  setMobileOpen((o) => !o); }}
            type="button"
          >
            <svg
              aria-hidden
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeWidth={2} />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeWidth={2} />
              )}
            </svg>
          </button>
        </div>

        <GlobalSearch
          className="w-full max-w-xl md:mx-auto md:max-w-2xl lg:max-w-3xl"
          id="global-search"
          index={searchIndex}
        />
      </div>

      {mobileOpen && (
        <nav className="border-t border-neutral-100 px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className="block rounded-lg px-3 py-2 text-neutral-800 hover:bg-neutral-50"
                  href={link.href}
                  onClick={() =>{  setMobileOpen(false); }}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li>
              <a
                className="block rounded-lg bg-cta-whatsapp px-3 py-2 text-center font-semibold text-white"
                href={whatsappHeader}
                onClick={() =>{  setMobileOpen(false); }}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t('whatsapp_link')}
              </a>
            </li>
            <li>
              <Link
                className="block rounded-lg border border-neutral-200 px-3 py-2 text-center font-semibold text-neutral-800"
                href="/orcamento"
                onClick={() =>{  setMobileOpen(false); }}
              >
                {t('orcamento_link')}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
