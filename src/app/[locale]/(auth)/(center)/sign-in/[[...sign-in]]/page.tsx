import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getDashboardSession } from '@/lib/dashboard-session';
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

  const dashboardRedirectUrl = getI18nPath('/dashboard/leads', locale);
  const session = await getDashboardSession();

  if (session) {
    redirect(dashboardRedirectUrl);
  }

  return <LoginForm redirectUrl={dashboardRedirectUrl} />;
}
