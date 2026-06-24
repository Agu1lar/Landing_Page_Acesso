'use client';

import Image from 'next/image';
import { AddToQuoteButton } from '@/components/quote-cart/AddToQuoteButton';
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
};

/**
 * Catalog card — sync render (no per-card server/DB round-trips).
 */
export function EquipmentCard(props: EquipmentCardProps) {
  const src = props.imageSrc ?? getManifestImageSrc(props.equipment.slug);
  const cardDescription = getEquipmentCardDescription(props.equipment);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-36 w-full overflow-hidden bg-neutral-100">
        {src ? (
          <Image
            alt={props.equipment.name}
            className="object-contain object-center p-1"
            fetchPriority={props.imagePriority ? 'high' : 'low'}
            fill
            loading={props.imagePriority ? undefined : 'lazy'}
            priority={props.imagePriority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {CATEGORY_LABELS[props.equipment.category]}
        </p>
        <h3 className="mt-1 font-heading text-lg font-semibold text-neutral-900 group-hover:text-primary">
          <Link href={`/equipamentos/${props.equipment.slug}`}>{props.equipment.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600">
          {cardDescription}
        </p>
        <div className="mt-3">
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
