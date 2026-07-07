import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { getDashboardSession } from '@/lib/dashboard-session';
import { getI18nPath } from '@/utils/Helpers';
import { resolveAppLocale } from '@/utils/locale';

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ForgotPasswordPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'ForgotPassword',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ForgotPasswordPage(props: ForgotPasswordPageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  const dashboardRedirectUrl = getI18nPath('/dashboard/leads', locale);
  const signInUrl = getI18nPath('/sign-in', locale);
  const session = await getDashboardSession();

  if (session) {
    redirect(dashboardRedirectUrl);
  }

  return <ForgotPasswordForm signInUrl={signInUrl} />;
}
