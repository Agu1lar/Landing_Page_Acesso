'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EquipmentPhotoGallery, type GalleryItem } from '@/components/admin/EquipmentPhotoGallery';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminPendingButton } from '@/components/admin/AdminPendingButton';
import { resolveAdminGalleryImageSrc } from '@/lib/admin-gallery-image';
import { ALL_EQUIPMENT_CATEGORIES } from '@/lib/categories-seo';
import { slugifyEquipmentName } from '@/lib/equipment-slug';
import { formatEquipmentName } from '@/lib/equipment-name';
import {
  getPlatformHeightFilterKey,
  parseWorkHeightMeters,
  platformHeightFilterLocaleKey,
  readWorkHeightMetersFromSpecs,
} from '@/lib/platform-height-admin';
import type { PlatformKind } from '@/lib/platform-kind';
import {
  isPlatformKind,
  PLATFORM_KIND_OPTIONS,
  readPlatformKindFromSpecs,
} from '@/lib/platform-kind-admin';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { EquipmentCategory, EquipmentSpec } from '@/types/equipment';
import type { EquipmentImageRow, EquipmentRow } from '@/lib/equipment-db';

type EquipmentAdminFormProps = {
  action: (formData: FormData) => void;
  row?: EquipmentRow;
  images?: EquipmentImageRow[];
  returnTo?: string;
};

function initialGallery(images: EquipmentImageRow[] | undefined, slug: string): GalleryItem[] {
  if (!images || images.length === 0) {
    return [];
  }
  return images.map((image) => ({
    url: resolveAdminGalleryImageSrc({ url: image.url, slug }),
    alt: image.alt ?? '',
    isPrimary: image.isPrimary,
  }));
}

function initialSpecs(specs: EquipmentSpec[] | undefined): EquipmentSpec[] {
  if (!specs || specs.length === 0) {
    return [{ label: '', value: '' }];
  }
  return specs;
}

function galleryToJson(items: GalleryItem[]) {
  return JSON.stringify(
    items
      .filter((item) => item.url.trim())
      .map((item, index) => ({
        url: item.url.trim(),
        alt: item.alt.trim() || undefined,
        sortOrder: index,
        isPrimary: item.isPrimary,
      })),
  );
}

function specsToJson(rows: EquipmentSpec[]) {
  return JSON.stringify(rows.filter((row) => row.label.trim() && row.value.trim()));
}

/**
 * Admin form for creating or editing equipment (commercial-friendly UI).
 */
export function EquipmentAdminForm(props: EquipmentAdminFormProps) {
  const t = useTranslations('EquipmentAdminForm');
  const tCategory = useTranslations('Categoria');
  const tCommon = useTranslations('AdminCommon');
  const row = props.row;
  const [name, setName] = useState(() => formatEquipmentName(row?.name ?? ''));
  const [slug, setSlug] = useState(row?.slug ?? '');
  const [slugManual, setSlugManual] = useState(Boolean(row?.slug));
  const [category, setCategory] = useState<EquipmentCategory>(
    (row?.category as EquipmentCategory) ?? 'ferramentas-eletricas',
  );
  const [platformKind, setPlatformKind] = useState<PlatformKind | ''>(() =>
    readPlatformKindFromSpecs({
      specs: row?.specs ?? [],
      tags: row?.tags ?? [],
      name: row?.name,
      slug: row?.slug,
    }),
  );
  const [platformWorkHeight, setPlatformWorkHeight] = useState(() => {
    const meters = readWorkHeightMetersFromSpecs(row?.specs ?? []);
    return meters ? String(meters).replace('.', ',') : '';
  });
  const [gallery, setGallery] = useState(() => initialGallery(props.images, row?.slug ?? ''));
  const [specs, setSpecs] = useState(() => initialSpecs(row?.specs ?? undefined));

  const imagesJson = useMemo(() => galleryToJson(gallery), [gallery]);
  const specsJson = useMemo(() => specsToJson(specs), [specs]);
  const parsedWorkHeight = parseWorkHeightMeters(platformWorkHeight);
  const heightFilterPreview =
    parsedWorkHeight !== null ? getPlatformHeightFilterKey(parsedWorkHeight) : null;

  const updateName = (value: string) => {
    const formatted = formatEquipmentName(value);
    setName(formatted);
    if (!slugManual) {
      setSlug(slugifyEquipmentName(formatted));
    }
  };

  const addSpecRow = () => {
    setSpecs((rows) => [...rows, { label: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecs((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)));
  };

  return (
    <form action={props.action} className="space-y-8">
      {row ? <input name="existingId" type="hidden" value={row.id} /> : null}
      {props.returnTo ? <input name="returnTo" type="hidden" value={props.returnTo} /> : null}
      <input name="imagesJson" type="hidden" value={imagesJson} />
      <input name="specsJson" type="hidden" value={specsJson} />
      <input name="slug" type="hidden" value={slug} />

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_main')}</h2>

        <Input
          id="name"
          label={t('field_name')}
          name="name"
          onChange={(event) => updateName(event.target.value)}
          required
          value={name}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="category">
            {t('field_category')}
          </label>
          <select
            className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
            id="category"
            name="category"
            onChange={(event) => {
              const next = event.target.value as EquipmentCategory;
              setCategory(next);
              if (next !== 'plataformas-elevatorias') {
                setPlatformKind('');
                setPlatformWorkHeight('');
              }
            }}
            value={category}
          >
            {ALL_EQUIPMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category as EquipmentCategory]}
              </option>
            ))}
          </select>
        </div>

        {category === 'plataformas-elevatorias' ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <label className="mb-1 block text-sm font-medium text-neutral-900" htmlFor="platformKind">
              {t('field_platform_kind')}
            </label>
            <select
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              id="platformKind"
              name="platformKind"
              onChange={(event) => {
                const value = event.target.value;
                setPlatformKind(isPlatformKind(value) ? value : '');
              }}
              required
              value={platformKind}
            >
              <option disabled value="">
                {t('field_platform_kind_placeholder')}
              </option>
              {PLATFORM_KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`platform_kind_${option.value}`)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-neutral-600">{t('field_platform_kind_hint')}</p>
            {platformKind && isPlatformKind(platformKind) ? (
              <p className="mt-1 text-xs font-medium text-neutral-700">
                {t('field_platform_kind_preview', {
                  filter: t(`platform_kind_${platformKind}`),
                })}
              </p>
            ) : null}

            <label className="mb-1 mt-4 block text-sm font-medium text-neutral-900" htmlFor="platformWorkHeight">
              {t('field_platform_work_height')}
            </label>
            <input
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              id="platformWorkHeight"
              inputMode="decimal"
              name="platformWorkHeight"
              onChange={(event) => setPlatformWorkHeight(event.target.value)}
              placeholder={t('field_platform_work_height_placeholder')}
              required
              value={platformWorkHeight}
            />
            <p className="mt-2 text-xs text-neutral-600">{t('field_platform_work_height_hint')}</p>
            {heightFilterPreview ? (
              <p className="mt-1 text-xs font-medium text-neutral-700">
                {t('field_platform_work_height_preview', {
                  filter: tCategory(platformHeightFilterLocaleKey(heightFilterPreview)),
                })}
              </p>
            ) : null}
          </div>
        ) : null}

        <Input
          defaultValue={row?.shortDescription ?? ''}
          id="shortDescription"
          label={t('field_short_description')}
          name="shortDescription"
          required
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="longDescription">
            {t('field_long_description')}
          </label>
          <textarea
            className="min-h-28 w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
            defaultValue={row?.longDescription ?? ''}
            id="longDescription"
            name="longDescription"
            placeholder={t('field_long_description_placeholder')}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="tags">
            {t('field_tags')}
          </label>
          <input
            className="w-full rounded-lg border border-neutral-200 bg-surface px-3 py-2 text-sm"
            defaultValue={(row?.tags ?? []).join(', ')}
            id="tags"
            name="tags"
            placeholder={t('field_tags_placeholder')}
          />
          <p className="mt-1 text-xs text-neutral-500">{t('field_tags_hint')}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <div>
          <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_photos')}</h2>
          <p className="mt-1 text-sm text-neutral-600">{t('section_photos_hint')}</p>
        </div>

        <EquipmentPhotoGallery
          defaultAlt={name}
          items={gallery}
          onChange={setGallery}
          slug={slug}
        />
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-200 bg-surface p-5">
        <div>
          <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_specs')}</h2>
          <p className="mt-1 text-sm text-neutral-600">{t('section_specs_hint')}</p>
        </div>

        <ul className="space-y-3">
          {specs.map((spec, index) => (
            <li className="grid gap-3 sm:grid-cols-2" key={`spec-${index}`}>
              <Input
                id={`spec-label-${index}`}
                label={t('field_spec_label')}
                onChange={(event) => {
                  const label = event.target.value;
                  setSpecs((rows) =>
                    rows.map((rowItem, itemIndex) =>
                      itemIndex === index ? { ...rowItem, label } : rowItem,
                    ),
                  );
                }}
                placeholder={t('field_spec_label_placeholder')}
                value={spec.label}
              />
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    id={`spec-value-${index}`}
                    label={t('field_spec_value')}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSpecs((rows) =>
                        rows.map((rowItem, itemIndex) =>
                          itemIndex === index ? { ...rowItem, value } : rowItem,
                        ),
                      );
                    }}
                    placeholder={t('field_spec_value_placeholder')}
                    value={spec.value}
                  />
                </div>
                {specs.length > 1 ? (
                  <button
                    className="mb-2 shrink-0 text-sm text-red-700 hover:underline"
                    onClick={() => removeSpecRow(index)}
                    type="button"
                  >
                    {t('spec_remove')}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <Button onClick={addSpecRow} size="sm" type="button" variant="outline">
          {t('spec_add')}
        </Button>
      </section>

      <section className="space-y-3 rounded-lg border border-neutral-200 bg-surface p-5">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('section_visibility')}</h2>
        <label className="flex items-start gap-3 text-sm">
          <input
            className="mt-0.5"
            defaultChecked={row?.featured ?? false}
            name="featured"
            type="checkbox"
            value="true"
          />
          <span>
            <span className="font-medium text-neutral-900">{t('flag_featured')}</span>
            <span className="mt-0.5 block text-neutral-600">{t('flag_featured_hint')}</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            className="mt-0.5"
            defaultChecked={row?.available ?? true}
            name="available"
            type="checkbox"
            value="true"
          />
          <span>
            <span className="font-medium text-neutral-900">{t('flag_available')}</span>
            <span className="mt-0.5 block text-neutral-600">{t('flag_available_hint')}</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            className="mt-0.5"
            defaultChecked={row?.published ?? true}
            name="published"
            type="checkbox"
            value="true"
          />
          <span>
            <span className="font-medium text-neutral-900">{t('flag_published')}</span>
            <span className="mt-0.5 block text-neutral-600">{t('flag_published_hint')}</span>
          </span>
        </label>
      </section>

      <details className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50/50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-neutral-700">
          {t('section_advanced')}
        </summary>
        <div className="mt-4 space-y-3">
          <p className="text-xs text-neutral-500">{t('section_advanced_hint')}</p>
          <Input
            id="slug-visible"
            label={t('field_slug')}
            onChange={(event) => {
              setSlugManual(true);
              setSlug(slugifyEquipmentName(event.target.value) || event.target.value);
            }}
            value={slug}
          />
          <p className="text-xs text-neutral-600">
            {t('field_slug_preview', { path: slug ? `/equipamentos/${slug}` : '—' })}
          </p>
        </div>
      </details>

      <AdminPendingButton
        label={t('submit')}
        pendingLabel={tCommon('saving')}
        variant="primary"
      />
    </form>
  );
}
