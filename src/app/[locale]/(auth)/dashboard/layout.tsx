import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminShell } from '@/components/admin/AdminShell';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { redirect } from 'next/navigation';
import { resolveAppLocale } from '@/utils/locale';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'DashboardLayout',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  const access = await requireDashboardAccess();
  if (!access.ok) {
    redirect(access.status === 403 ? '/unauthorized' : '/sign-in');
  }

  return <AdminShell role={access.role}>{props.children}</AdminShell>;
}
