'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EquipmentCard } from '@/components/marketing/EquipmentCard';
import {
  matchesPlatformKindFilter,
  type PlatformKindFilter,
} from '@/lib/platform-kind';
import type { Equipment } from '@/types/equipment';

type CategoryEquipmentGridProps = {
  equipment: Equipment[];
  imageBySlug: Record<string, string>;
  showPlatformKindFilter?: boolean;
};

const PLATFORM_KIND_FILTERS: PlatformKindFilter[] = ['all', 'aerea', 'articulada'];

export function CategoryEquipmentGrid({
  equipment,
  imageBySlug,
  showPlatformKindFilter = false,
}: CategoryEquipmentGridProps) {
  const t = useTranslations('Categoria');
  const [platformKind, setPlatformKind] = useState<PlatformKindFilter>('all');

  const filtered = useMemo(() => {
    if (!showPlatformKindFilter) {
      return equipment;
    }
    return equipment.filter((item) => matchesPlatformKindFilter(item, platformKind));
  }, [equipment, platformKind, showPlatformKindFilter]);

  const filterLabel: Record<PlatformKindFilter, string> = {
    all: t('filter_all_platforms'),
    aerea: t('filter_aerial'),
    articulada: t('filter_articulated'),
  };

  return (
    <>
      {showPlatformKindFilter ? (
        <div
          aria-label={t('filter_platform_kind_label')}
          className="mt-4 flex flex-wrap gap-2"
          role="group"
        >
          {PLATFORM_KIND_FILTERS.map((kind) => {
            const active = platformKind === kind;
            return (
              <button
                aria-pressed={active}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                key={kind}
                onClick={() => setPlatformKind(kind)}
                type="button"
              >
                {filterLabel[kind]}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className={`text-sm text-neutral-600 ${showPlatformKindFilter ? 'mt-4' : 'mt-1'}`}>
        {t('results_count', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-neutral-600">{t('empty')}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, index) => (
            <EquipmentCard
              equipment={item}
              imagePriority={index < 4}
              imageSrc={imageBySlug[item.slug]}
              key={item.slug}
            />
          ))}
        </div>
      )}
    </>
  );
}
