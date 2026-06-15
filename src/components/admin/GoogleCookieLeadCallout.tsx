import { getTranslations } from 'next-intl/server';
import { AdminCard } from '@/components/admin/AdminCard';

type GoogleCookieLeadCalloutProps = {
  googleClientIdConfigured: boolean;
};

export async function GoogleCookieLeadCallout(props: GoogleCookieLeadCalloutProps) {
  if (props.googleClientIdConfigured) {
    return null;
  }

  const t = await getTranslations('LeadsAdminPage');

  return (
    <AdminCard title={t('cookie_lead_callout_title')}>
      <p className="text-sm text-neutral-700">{t('cookie_lead_callout_body')}</p>
    </AdminCard>
  );
}
