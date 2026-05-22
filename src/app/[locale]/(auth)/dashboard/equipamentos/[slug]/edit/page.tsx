import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  archiveEquipmentFormAction,
  duplicateEquipmentFormAction,
  saveEquipmentAction,
} from '@/app/actions/equipment-admin';
import { EquipmentAdminForm } from '@/components/admin/EquipmentAdminForm';
import { requireAdminAccess } from '@/lib/auth-roles';
import { getEquipmentRowBySlug, listEquipmentImages } from '@/lib/equipment-db';
import { resolveAppLocale } from '@/utils/locale';

type EditEquipmentPageProps = {
  params: Promise<{ locale: string; slug: string }>;
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
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipmentAdminPage',
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

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-neutral-900">{row.name}</h1>
        <div className="flex flex-wrap gap-2">
          <form action={duplicateEquipmentFormAction}>
            <input name="slug" type="hidden" value={slug} />
            <button
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100"
              type="submit"
            >
              {t('duplicate')}
            </button>
          </form>
          <form action={archiveEquipmentFormAction}>
            <input name="slug" type="hidden" value={slug} />
            <button
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              type="submit"
            >
              {t('archive')}
            </button>
          </form>
        </div>
      </div>
      <EquipmentAdminForm action={saveEquipmentAction} images={images} row={row} />
    </div>
  );
}
