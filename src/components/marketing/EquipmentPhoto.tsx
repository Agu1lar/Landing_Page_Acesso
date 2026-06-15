import Image from 'next/image';
import { getEquipmentImageSrc } from '@/lib/equipment-images-server';

type EquipmentPhotoProps = {
  slug: string;
  name: string;
  variant: 'card' | 'detail';
  className?: string;
  imagePriority?: boolean;
};

function Placeholder(props: { variant: 'card' | 'detail' }) {
  if (props.variant === 'card') {
    return (
      <div
        aria-hidden
        className="flex h-36 items-center justify-center bg-neutral-100 text-neutral-400"
      >
        <svg className="h-12 w-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 text-sm text-neutral-400">
      Imagem em breve
    </div>
  );
}

/**
 * Equipment image from public/equipamentos/{slug}.* or placeholder.
 */
export async function EquipmentPhoto(props: EquipmentPhotoProps) {
  const src = await getEquipmentImageSrc(props.slug);

  if (!src) {
    return <Placeholder variant={props.variant} />;
  }

  if (props.variant === 'card') {
    return (
      <div
        className={`relative h-36 w-full overflow-hidden bg-neutral-100 ${props.className ?? ''}`}
      >
        <Image
          alt={props.name}
          className="object-contain object-center p-1"
          fetchPriority={props.imagePriority ? 'high' : 'low'}
          fill
          loading={props.imagePriority ? undefined : 'lazy'}
          priority={props.imagePriority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          src={src}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 ${props.className ?? ''}`}
    >
      <Image
        alt={props.name}
        className="object-contain object-center p-2"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        src={src}
      />
    </div>
  );
}
