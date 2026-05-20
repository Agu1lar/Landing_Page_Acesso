import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hello } from '@/components/Hello';
import { Button } from '@/components/ui/Button';
import { resolveAppLocale } from '@/utils/locale';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'DashboardLayout',
  });

  return (
    <div className="space-y-6 py-5 [&_p]:my-6">
      <Hello />
      <div className="rounded-lg border border-neutral-200 bg-surface p-4">
        <h2 className="font-semibold text-neutral-900">{t('leads_card_title')}</h2>
        <p className="mt-1 text-sm text-neutral-600">{t('leads_card_description')}</p>
        <Button className="mt-4" href="/dashboard/leads" size="sm">
          {t('leads_link')}
        </Button>
      </div>
    </div>
  );
}
