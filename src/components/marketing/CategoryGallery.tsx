import Image from 'next/image';
import type { CategoryGalleryImage } from '@/lib/category-gallery';

type CategoryGalleryProps = {
  images: CategoryGalleryImage[];
  title: string;
};

/**
 * Responsive image showcase for category landing pages.
 */
export function CategoryGallery(props: CategoryGalleryProps) {
  if (props.images.length === 0) {
    return null;
  }

  return (
    <section aria-label={props.title} className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2">
        {props.images.map((image) => (
          <figure
            className="group overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 shadow-sm"
            key={image.src}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                alt={image.alt}
                className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                src={image.src}
              />
            </div>
            <figcaption className="border-t border-neutral-200 bg-surface px-4 py-3 text-sm text-neutral-600">
              {image.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
