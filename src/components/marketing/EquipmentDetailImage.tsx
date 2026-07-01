import { EquipmentImageCarousel } from '@/components/marketing/EquipmentImageCarousel';
import type { EquipmentGalleryImage } from '@/lib/equipment-gallery';

type EquipmentDetailImageProps = {
  images: EquipmentGalleryImage[];
  name: string;
  slug: string;
};

/**
 * Detail hero gallery — receives pre-resolved images from the server page.
 */
export function EquipmentDetailImage(props: EquipmentDetailImageProps) {
  if (props.images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 text-sm text-neutral-400">
        Imagem em breve
      </div>
    );
  }

  return (
    <EquipmentImageCarousel images={props.images} name={props.name} slug={props.slug} />
  );
}
