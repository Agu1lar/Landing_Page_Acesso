import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { importEquipmentCatalogAction } from '@/app/actions/equipment-admin';
import { requireAdminAccess } from '@/lib/auth-roles';
import { countEquipmentInDb, listEquipmentForAdmin } from '@/lib/equipment-db';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { EquipmentCategory } from '@/types/equipment';
import { resolveAppLocale } from '@/utils/locale';

type EquipmentAdminListProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; status?: string }>;
};

export async function generateMetadata(props: EquipmentAdminListProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipmentAdminPage',
  });
  return { title: t('meta_title') };
}

export default async function EquipmentAdminListPage(props: EquipmentAdminListProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipmentAdminPage',
  });

  const access = await requireAdminAccess();
  if (!access.ok) {
    return <p className="py-8 text-sm text-neutral-600">{t('no_permission')}</p>;
  }

  const dbCount = await countEquipmentInDb();
  const rows = await listEquipmentForAdmin({
    q: searchParams.q,
    category: searchParams.category,
    status: (searchParams.status as 'all' | 'active' | 'draft' | 'archived') ?? 'all',
  });

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-neutral-600">{t('summary', { count: rows.length })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dbCount === 0 ? (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-neutral-600 hover:text-neutral-900">
                {t('import_advanced_label')}
              </summary>
              <form action={importEquipmentCatalogAction} className="mt-2">
                <p className="mb-2 text-xs text-neutral-500">{t('import_json_hint')}</p>
                <button
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
                  type="submit"
                >
                  {t('import_json')}
                </button>
              </form>
            </details>
          ) : null}
          <Link
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            href="/dashboard/equipamentos/new"
          >
            {t('new_equipment')}
          </Link>
        </div>
      </div>

      <form className="grid gap-3 rounded-lg border border-neutral-200 bg-surface p-4 sm:grid-cols-4" method="get">
        <input
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm sm:col-span-2"
          defaultValue={searchParams.q ?? ''}
          name="q"
          placeholder={t('search_placeholder')}
        />
        <select
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          defaultValue={searchParams.category ?? ''}
          name="category"
        >
          <option value="">{t('filter_all_categories')}</option>
          {Object.keys(CATEGORY_LABELS).map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category as EquipmentCategory]}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          defaultValue={searchParams.status ?? 'all'}
          name="status"
        >
          <option value="all">{t('status_all')}</option>
          <option value="active">{t('status_active')}</option>
          <option value="draft">{t('status_draft')}</option>
          <option value="archived">{t('status_archived')}</option>
        </select>
        <button className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white sm:col-span-4" type="submit">
          {t('filter_apply')}
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="px-4 py-3 font-medium">{t('col_name')}</th>
              <th className="px-4 py-3 font-medium">{t('col_category')}</th>
              <th className="px-4 py-3 font-medium">{t('col_status')}</th>
              <th className="px-4 py-3 font-medium">{t('col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-neutral-100" key={row.id}>
                <td className="px-4 py-3 font-medium text-neutral-900">{row.name}</td>
                <td className="px-4 py-3">{CATEGORY_LABELS[row.category as EquipmentCategory]}</td>
                <td className="px-4 py-3">
                  {!row.published ? t('badge_draft') : !row.available ? t('badge_archived') : t('badge_active')}
                </td>
                <td className="px-4 py-3">
                  <Link className="text-primary hover:underline" href={`/dashboard/equipamentos/${row.slug}/edit`}>
                    {t('edit')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
