import { setRequestLocale } from 'next-intl/server';
import { resolveAppLocale } from '@/utils/locale';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  return props.children;
}
