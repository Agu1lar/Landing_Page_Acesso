import { EquipmentCatalogImage } from '@/components/marketing/EquipmentCatalogImage';

type EquipmentDetailImageProps = {
  name: string;
  slug: string;
  src?: string;
};

/**
 * Detail hero image — receives a pre-resolved URL from the server page (no DB).
 */
export function EquipmentDetailImage(props: EquipmentDetailImageProps) {
  if (!props.src) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 text-sm text-neutral-400">
        Imagem em breve
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100">
      <EquipmentCatalogImage
        alt={props.name}
        className="object-contain object-center p-2"
        fill
        key={props.src}
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        slug={props.slug}
        src={props.src}
      />
    </div>
  );
}
