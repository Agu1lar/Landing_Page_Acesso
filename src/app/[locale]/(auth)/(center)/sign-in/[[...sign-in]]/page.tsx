import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getI18nPath } from '@/utils/Helpers';
import { resolveAppLocale } from '@/utils/locale';

type SignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: SignInPageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  const signInPath = getI18nPath('/sign-in', locale);

  return (
    <SignIn
      appearance={{
        elements: {
          dividerRow: { display: 'none' },
          socialButtonsRoot: { display: 'none' },
        },
      }}
      path={signInPath}
      routing="path"
      signUpUrl={signInPath}
    />
  );
}
