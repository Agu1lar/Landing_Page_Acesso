'use client';

import { AddToQuoteButton } from '@/components/quote-cart/AddToQuoteButton';
import { EquipmentCatalogImage } from '@/components/marketing/EquipmentCatalogImage';
import { getEquipmentCardDescription } from '@/lib/equipment-card-description';
import { getEquipmentQuoteCartKind } from '@/lib/equipment-quote-cart';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { Link } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { Equipment } from '@/types/equipment';

type EquipmentCardProps = {
  equipment: Equipment;
  imagePriority?: boolean;
  /** Pre-resolved URL from server cache; falls back to manifest. */
  imageSrc?: string;
  hideCategoryLabel?: boolean;
};

/**
 * Catalog card — sync render (no per-card server/DB round-trips).
 */
export function EquipmentCard(props: EquipmentCardProps) {
  const src = props.imageSrc ?? getManifestImageSrc(props.equipment.slug);
  const cardDescription = getEquipmentCardDescription(props.equipment);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="pointer-events-none relative h-36 w-full overflow-hidden bg-neutral-100">
        {src ? (
          <EquipmentCatalogImage
            alt={props.equipment.name}
            className="object-contain object-center p-1"
            fill
            key={src}
            priority={props.imagePriority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            slug={props.equipment.slug}
            src={src}
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center text-neutral-400"
          >
            <span className="text-xs">Sem foto</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {props.hideCategoryLabel ? null : (
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {CATEGORY_LABELS[props.equipment.category]}
          </p>
        )}
        <h3
          className={`font-heading text-lg font-semibold text-neutral-900 group-hover:text-primary ${props.hideCategoryLabel ? '' : 'mt-1'}`}
        >
          <Link
            className="rounded-sm after:absolute after:inset-0 after:rounded-[var(--radius-card)] after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            href={`/equipamentos/${props.equipment.slug}`}
          >
            {props.equipment.name}
          </Link>
        </h3>
        <p className="pointer-events-none mt-2 line-clamp-2 flex-1 text-sm text-neutral-600">
          {cardDescription}
        </p>
        <div className="relative z-10 mt-3">
          <AddToQuoteButton
            className="w-full"
            item={{
              slug: props.equipment.slug,
              name: props.equipment.name,
              kind: getEquipmentQuoteCartKind(props.equipment),
            }}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}
