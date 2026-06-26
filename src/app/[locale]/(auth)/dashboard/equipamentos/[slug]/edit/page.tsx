import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  archiveEquipmentFormAction,
  duplicateEquipmentFormAction,
  saveEquipmentAction,
} from '@/app/actions/equipment-admin';
import { AdminBackLink } from '@/components/admin/AdminBackLink';
import { EquipmentAdminForm } from '@/components/admin/EquipmentAdminForm';
import { EquipmentEditToolbar } from '@/components/admin/EquipmentEditToolbar';
import { requireAdminAccess } from '@/lib/auth-roles';
import { equipmentAdminListPath } from '@/lib/admin-return-path';
import { getEquipmentRowBySlug, listEquipmentImages } from '@/lib/equipment-db';
import { resolveAppLocale } from '@/utils/locale';

type EditEquipmentPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
};

export async function generateMetadata(props: EditEquipmentPageProps): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipmentAdminPage',
  });
  return { title: t('edit_meta_title', { slug }) };
}

export default async function EditEquipmentPage(props: EditEquipmentPageProps) {
  const { locale, slug } = await props.params;
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

  const row = await getEquipmentRowBySlug(slug);
  if (!row) {
    notFound();
  }

  const images = await listEquipmentImages(row.id);
  const listPath = equipmentAdminListPath({
    q: searchParams.q,
    category: searchParams.category,
    status: searchParams.status,
  });

  return (
    <div className="space-y-6 py-6">
      <AdminBackLink href={listPath} label={tCommon('back_to_list')} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">{row.name}</h1>
        <EquipmentEditToolbar
          archiveAction={archiveEquipmentFormAction}
          duplicateAction={duplicateEquipmentFormAction}
          returnTo={listPath}
          slug={slug}
        />
      </div>

      <EquipmentAdminForm
        action={saveEquipmentAction}
        images={images}
        key={row.id}
        returnTo={listPath}
        row={row}
      />
    </div>
  );
}
