'use client';

import { useState } from 'react';
import { resolveAdminGalleryImageSrc } from '@/lib/admin-gallery-image';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';

type AdminGalleryImageProps = {
  alt: string;
  slug: string;
  url: string;
};

/**
 * Renders admin gallery previews with manifest/blob URL resolution and fallback.
 */
export function AdminGalleryImage(props: AdminGalleryImageProps) {
  const resolved = resolveAdminGalleryImageSrc({ url: props.url, slug: props.slug });
  const [src, setSrc] = useState(resolved);
  const manifestFallback = getManifestImageSrc(props.slug);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin preview must load blob/local URLs without optimizer constraints
    <img
      alt={props.alt}
      className="h-full w-full object-cover"
      onError={() => {
        if (manifestFallback && src !== manifestFallback) {
          setSrc(manifestFallback);
          return;
        }
        if (props.url.trim() && src !== props.url.trim()) {
          setSrc(props.url.trim());
        }
      }}
      src={src}
    />
  );
}
