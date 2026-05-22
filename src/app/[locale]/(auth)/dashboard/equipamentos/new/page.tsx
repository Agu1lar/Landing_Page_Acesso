import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { saveEquipmentAction } from '@/app/actions/equipment-admin';
import { EquipmentAdminForm } from '@/components/admin/EquipmentAdminForm';
import { requireAdminAccess } from '@/lib/auth-roles';
import { resolveAppLocale } from '@/utils/locale';

type NewEquipmentPageProps = {
  params: Promise<{ locale: string }>;
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
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipmentAdminPage',
  });

  const access = await requireAdminAccess();
  if (!access.ok) {
    return <p className="py-8 text-sm text-neutral-600">{t('no_permission')}</p>;
  }

  return (
    <div className="space-y-6 py-6">
      <h1 className="font-heading text-2xl font-bold text-neutral-900">{t('new_title')}</h1>
      <EquipmentAdminForm action={saveEquipmentAction} />
    </div>
  );
}
