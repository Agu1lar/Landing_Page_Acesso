import { getTranslations } from 'next-intl/server';
import { brand } from '@/lib/brand';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

export async function SiteFooter() {
  const t = await getTranslations('Footer');

  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-heading text-lg font-semibold text-white">{AppConfig.name}</p>
          <p className="mt-2 text-sm leading-relaxed">
            Locação de equipamentos para construção civil na {brand.seoRegion}. Empresa desde{' '}
            {brand.foundedYear}.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">{t('links')}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/equipamentos">
                Equipamentos
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/faq">
                Perguntas frequentes
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/sobre">
                Sobre
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/orcamento">
                Orçamento
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">{t('contact')}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="hover:text-white" href={`tel:+${brand.phone}`}>
                {brand.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`mailto:${brand.email}`}>
                {brand.email}
              </a>
            </li>
            <li>
              <a
                className="hover:text-white"
                href={`https://instagram.com/${brand.instagram}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                @{brand.instagram}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">{t('address')}</p>
          <p className="mt-3 text-sm leading-relaxed">{brand.address.full}</p>
          <p className="mt-4 font-semibold text-white">{t('hours')}</p>
          <p className="mt-1 text-sm">{brand.hours}</p>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        {t('rights', { year: new Date().getFullYear(), name: AppConfig.name })}
      </div>
    </footer>
  );
}
