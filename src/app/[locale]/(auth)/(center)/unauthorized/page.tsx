import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { resolveAppLocale } from '@/utils/locale';

type UnauthorizedPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: UnauthorizedPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'UnauthorizedPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function UnauthorizedPage(props: UnauthorizedPageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'UnauthorizedPage',
  });

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-12 text-center">
      <h1 className="font-heading text-2xl font-bold text-neutral-900">{t('title')}</h1>
      <p className="text-sm text-neutral-600">{t('description')}</p>
      <p className="text-xs text-neutral-500">{t('hint')}</p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button href="/" size="sm" variant="outline">
          {t('back_home')}
        </Button>
        <Button href="/sign-in" size="sm">
          {t('sign_in_again')}
        </Button>
      </div>
    </div>
  );
}
