'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { EquipmentCard } from '@/components/marketing/EquipmentCard';
import {
  matchesPlatformHeightFilter,
  type PlatformHeightFilter,
} from '@/lib/platform-height';
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
const PLATFORM_HEIGHT_FILTERS: PlatformHeightFilter[] = [
  'all',
  'up-to-10',
  'from-10-to-16',
  'from-16-to-26',
  'above-26',
];

export function CategoryEquipmentGrid(props: CategoryEquipmentGridProps) {
  const t = useTranslations('Categoria');
  const [platformKind, setPlatformKind] = useState<PlatformKindFilter>('all');
  const [platformHeight, setPlatformHeight] = useState<PlatformHeightFilter>('all');
  const showPlatformFilters = props.showPlatformKindFilter ?? false;

  const filtered = showPlatformFilters
    ? props.equipment.filter(
        (item) =>
          matchesPlatformKindFilter(item, platformKind) &&
          matchesPlatformHeightFilter(item, platformHeight),
      )
    : props.equipment;

  const filterLabel: Record<PlatformKindFilter, string> = {
    all: t('filter_all_platforms'),
    aerea: t('filter_aerial'),
    articulada: t('filter_articulated'),
  };
  const heightFilterLabel: Record<PlatformHeightFilter, string> = {
    all: t('filter_all_heights'),
    'up-to-10': t('filter_height_up_to_10'),
    'from-10-to-16': t('filter_height_10_to_16'),
    'from-16-to-26': t('filter_height_16_to_26'),
    'above-26': t('filter_height_above_26'),
  };

  return (
    <>
      {showPlatformFilters ? (
        <div className="mt-4 space-y-3">
          <div
            aria-label={t('filter_platform_kind_label')}
            className="flex flex-wrap gap-2"
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
          <div
            aria-label={t('filter_platform_height_label')}
            className="flex flex-wrap gap-2"
            role="group"
          >
            {PLATFORM_HEIGHT_FILTERS.map((height) => {
              const active = platformHeight === height;
              return (
                <button
                  aria-pressed={active}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                  key={height}
                  onClick={() => setPlatformHeight(height)}
                  type="button"
                >
                  {heightFilterLabel[height]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className={`text-sm text-neutral-600 ${showPlatformFilters ? 'mt-4' : 'mt-1'}`}>
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
              imageSrc={props.imageBySlug[item.slug]}
              key={item.slug}
            />
          ))}
        </div>
      )}
    </>
  );
}
