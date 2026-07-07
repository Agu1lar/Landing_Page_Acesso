import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AccessAllowlistPanel } from '@/components/admin/AccessAllowlistPanel';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getDashboardUserEmail, requireAdminAccess } from '@/lib/auth-roles';
import { listAllowlistEntries } from '@/lib/dashboard-allowlist';
import { DASHBOARD_PASSWORD_MIN_LENGTH } from '@/lib/dashboard-password-policy';
import { resolveAppLocale } from '@/utils/locale';

type AccessAdminPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: AccessAdminPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'AccessAdminPage',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function AccessAdminPage(props: AccessAdminPageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'AccessAdminPage',
  });

  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const [entries, currentEmail] = await Promise.all([
    listAllowlistEntries(),
    getDashboardUserEmail(access.userId),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader description={t('description')} title={t('title')} />

      <AccessAllowlistPanel
        currentEmail={currentEmail ?? ''}
        entries={entries}
        labels={{
          addTitle: t('add_title'),
          addHint: t('add_hint'),
          emailLabel: t('field_email'),
          emailPlaceholder: t('email_placeholder'),
          passwordLabel: t('field_password'),
          passwordPlaceholder: t('password_placeholder'),
          passwordHint: t('password_hint', { min: DASHBOARD_PASSWORD_MIN_LENGTH }),
          showPassword: t('show_password'),
          hidePassword: t('hide_password'),
          errorPasswordTooShort: t('error_password_too_short', { min: DASHBOARD_PASSWORD_MIN_LENGTH }),
          errorPasswordTooLong: t('error_password_too_long'),
          roleLabel: t('field_role'),
          roleAdmin: t('role_admin'),
          roleComercial: t('role_comercial'),
          addButton: t('add_button'),
          listTitle: t('list_title'),
          emptyList: t('empty_list'),
          colEmail: t('col_email'),
          colRole: t('col_role'),
          colPassword: t('col_password'),
          colAdded: t('col_added'),
          colActions: t('col_actions'),
          removeButton: t('remove_button'),
          resetPasswordButton: t('reset_password_button'),
          passwordMissingBadge: t('password_missing_badge'),
          youBadge: t('you_badge'),
          errorInvalid: t('error_invalid'),
          errorDuplicate: t('error_duplicate'),
          errorLastAdmin: t('error_last_admin'),
          errorGeneric: t('error_generic'),
          errorNetwork: t('error_network'),
          addingLabel: t('adding_label'),
          successAdded: t('success_added'),
          successPasswordReset: t('success_password_reset'),
        }}
      />
    </div>
  );
}
