import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInPanel } from '@/components/auth/SignInPanel';
import { requireDashboardAccess } from '@/lib/auth-roles';
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
  const dashboardRedirectUrl = getI18nPath('/dashboard/leads', locale);
  const unauthorizedUrl = getI18nPath('/unauthorized', locale);

  const { userId } = await auth();
  if (userId) {
    const access = await requireDashboardAccess();
    if (access.ok) {
      redirect(dashboardRedirectUrl);
    }
    redirect(unauthorizedUrl);
  }

  return <SignInPanel dashboardRedirectUrl={dashboardRedirectUrl} signInPath={signInPath} />;
}
