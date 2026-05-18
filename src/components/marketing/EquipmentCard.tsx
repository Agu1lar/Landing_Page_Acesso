import { useTranslations } from 'next-intl';
import { Link } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { Equipment } from '@/types/equipment';

type EquipmentCardProps = {
  equipment: Equipment;
};

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const t = useTranslations('Index');

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-36 items-center justify-center bg-neutral-100 text-neutral-400">
        <svg
          aria-hidden
          className="h-12 w-12 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {CATEGORY_LABELS[equipment.category]}
        </p>
        <h3 className="mt-1 font-heading text-lg font-semibold text-neutral-900 group-hover:text-primary">
          <Link href={`/equipamentos/${equipment.slug}`}>{equipment.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600">
          {equipment.shortDescription}
        </p>
        <p className="mt-3 text-xs font-medium text-neutral-500">{t('pricing_hint')}</p>
      </div>
    </article>
  );
}
