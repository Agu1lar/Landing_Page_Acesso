import Image from 'next/image';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { AddToQuoteButton } from '@/components/quote-cart/AddToQuoteButton';
import { getEquipmentQuoteCartKind } from '@/lib/equipment-quote-cart';
import { Link } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { Equipment } from '@/types/equipment';

type EquipmentCardProps = {
  equipment: Equipment;
};

export function EquipmentCard(props: EquipmentCardProps) {
  const { equipment } = props;
  const imageSrc = getManifestImageSrc(equipment.slug);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-36 w-full overflow-hidden bg-neutral-100">
        {imageSrc ? (
          <Image
            alt={equipment.name}
            className="object-contain object-center p-1"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            src={imageSrc}
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
          {CATEGORY_LABELS[equipment.category]}
        </p>
        <h3 className="mt-1 font-heading text-lg font-semibold text-neutral-900 group-hover:text-primary">
          <Link href={`/equipamentos/${equipment.slug}`}>{equipment.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600">
          {equipment.shortDescription}
        </p>
        <div className="mt-3">
          <AddToQuoteButton
            className="w-full"
            item={{
              slug: equipment.slug,
              name: equipment.name,
              kind: getEquipmentQuoteCartKind(equipment),
            }}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}
