import { getTranslations } from 'next-intl/server';
import { AdminCard } from '@/components/admin/AdminCard';

type GoogleOneTapActiveCalloutProps = {
  googleClientIdConfigured: boolean;
};

export async function GoogleOneTapActiveCallout(props: GoogleOneTapActiveCalloutProps) {
  if (!props.googleClientIdConfigured) {
    return null;
  }

  const t = await getTranslations('LeadsAdminPage');

  return (
    <AdminCard title={t('one_tap_active_title')}>
      <ul className="list-inside list-disc space-y-1 text-sm text-neutral-700">
        <li>{t('one_tap_active_item_test')}</li>
        <li>{t('one_tap_active_item_origins')}</li>
        <li>{t('one_tap_active_item_telemetry')}</li>
        <li>{t('one_tap_active_item_doc')}</li>
      </ul>
    </AdminCard>
  );
}
