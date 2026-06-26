import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { saveEquipmentAction } from '@/app/actions/equipment-admin';
import { AdminBackLink } from '@/components/admin/AdminBackLink';
import { EquipmentAdminForm } from '@/components/admin/EquipmentAdminForm';
import { requireAdminAccess } from '@/lib/auth-roles';
import { equipmentAdminListPath } from '@/lib/admin-return-path';
import { resolveAppLocale } from '@/utils/locale';

type NewEquipmentPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
};

export async function generateMetadata(props: NewEquipmentPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipmentAdminPage',
  });
  return { title: t('new_meta_title') };
}

export default async function NewEquipmentPage(props: NewEquipmentPageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipmentAdminPage',
  });
  const tCommon = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'AdminCommon',
  });

  const access = await requireAdminAccess();
  if (!access.ok) {
    return <p className="py-8 text-sm text-neutral-600">{t('no_permission')}</p>;
  }

  const listPath = equipmentAdminListPath({
    q: searchParams.q,
    category: searchParams.category,
    status: searchParams.status,
  });

  return (
    <div className="space-y-6 py-6">
      <AdminBackLink href={listPath} label={tCommon('back_to_list')} />
      <h1 className="font-heading text-2xl font-bold text-neutral-900">{t('new_title')}</h1>
      <EquipmentAdminForm action={saveEquipmentAction} returnTo={listPath} />
    </div>
  );
}
