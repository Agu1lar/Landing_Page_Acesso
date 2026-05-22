import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { resolveAppLocale } from '@/utils/locale';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const access = await requireDashboardAccess();

  if (!access.ok) {
    redirect('/sign-in');
  }

  if (access.role === 'admin') {
    redirect('/dashboard/equipamentos');
  }

  redirect('/dashboard/leads');
}
