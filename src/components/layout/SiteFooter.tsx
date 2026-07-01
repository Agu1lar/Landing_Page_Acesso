import { getTranslations } from 'next-intl/server';
import { CookiePreferencesLink } from '@/components/analytics/CookiePreferencesLink';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';
import { TrackedWhatsAppLink } from '@/components/analytics/TrackedWhatsAppLink';
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from '@/components/layout/SocialIcons';
import { brand, buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

export async function SiteFooter() {
  const t = await getTranslations('Footer');
  const whatsappFooter = buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-footer' }));

  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-heading text-lg font-semibold text-white">{AppConfig.name}</p>
          <p className="mt-2 text-sm leading-relaxed">{brand.footerTagline}</p>
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
              <Link className="hover:text-white" href="/treinamento-plataformas-aereas">
                Treinamento — plataformas elevatórias
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/faq">
                Perguntas frequentes
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/dicas">
                {t('dicas_link')}
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
            <li>
              <Link className="hover:text-white" href="/privacidade">
                {t('privacy_link')}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/sign-in">
                {t('admin_area_link')}
              </Link>
            </li>
            <li>
              <CookiePreferencesLink />
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">{t('contact')}</p>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <TrackedPhoneLink className="hover:text-white" href={`tel:+55${brand.phone}`} origin="site-footer-ligar">
                {brand.phoneDisplay}
              </TrackedPhoneLink>
            </li>
            <li>
              <TrackedWhatsAppLink
                className="inline-flex items-center gap-2 hover:text-white"
                href={whatsappFooter}
                origin="site-footer"
                rel="noopener noreferrer"
                target="_blank"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-cta-whatsapp" />
                {brand.whatsappDisplay}
              </TrackedWhatsAppLink>
            </li>
            <li>
              <a className="hover:text-white" href={`mailto:${brand.email}`}>
                {brand.email}
              </a>
            </li>
            <li className="flex flex-wrap gap-4 pt-1">
              <a
                aria-label={`Instagram @${brand.instagram}`}
                className="inline-flex items-center gap-2 hover:text-white"
                href={brand.instagramUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <InstagramIcon className="h-5 w-5 shrink-0" />
                <span className="sr-only sm:not-sr-only">@{brand.instagram}</span>
              </a>
              <a
                aria-label="LinkedIn Acesso Equipamentos"
                className="inline-flex items-center gap-2 hover:text-white"
                href={brand.linkedinUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <LinkedInIcon className="h-5 w-5 shrink-0" />
                <span className="sr-only sm:not-sr-only">LinkedIn</span>
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
