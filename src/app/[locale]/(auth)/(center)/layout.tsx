import { setRequestLocale } from 'next-intl/server';
import { resolveAppLocale } from '@/utils/locale';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  return <div className="flex min-h-screen items-center justify-center">{props.children}</div>;
}
