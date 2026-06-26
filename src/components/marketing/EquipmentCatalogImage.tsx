'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { shouldUnoptimizeEquipmentImage } from '@/lib/equipment-image-resolve';

type EquipmentCatalogImageProps = {
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  slug: string;
  src: string;
};

/**
 * Catalog/detail image with manifest fallback when the primary URL fails to load.
 */
export function EquipmentCatalogImage(props: EquipmentCatalogImageProps) {
  const manifestFallback = getManifestImageSrc(props.slug);
  const [src, setSrc] = useState(props.src);

  if (!src) {
    return null;
  }

  return (
    <Image
      alt={props.alt}
      className={props.className}
      fetchPriority={props.priority ? 'high' : 'low'}
      fill={props.fill}
      loading={props.priority ? undefined : 'lazy'}
      onError={() => {
        if (manifestFallback && src !== manifestFallback) {
          setSrc(manifestFallback);
        }
      }}
      priority={props.priority}
      sizes={props.sizes}
      src={src}
      unoptimized={shouldUnoptimizeEquipmentImage(src)}
    />
  );
}
