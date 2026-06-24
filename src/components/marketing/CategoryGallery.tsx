import Image from 'next/image';
import type { CategoryGalleryImage } from '@/lib/category-gallery';

type CategoryGalleryProps = {
  images: CategoryGalleryImage[];
  title: string;
  className?: string;
};

/**
 * Responsive image showcase for category landing pages.
 * Mobile: horizontal scroll (compact). Desktop: 2-column grid, or full-width hero when single image.
 */
export function CategoryGallery(props: CategoryGalleryProps) {
  if (props.images.length === 0) {
    return null;
  }

  const isSingleHero = props.images.length === 1;

  return (
    <section aria-label={props.title} className={props.className ?? 'mt-10'}>
      <div
        className={[
          isSingleHero
            ? 'mx-0'
            : [
                '-mx-4 flex gap-3 overflow-x-auto px-4 pb-1',
                'snap-x snap-mandatory scroll-px-4',
                '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
                'sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0',
              ].join(' '),
        ].join(' ')}
      >
        {props.images.map((image, index) => (
          <figure
            className={[
              'group overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 shadow-sm',
              isSingleHero
                ? 'w-full'
                : 'shrink-0 snap-center w-[min(82vw,18rem)] sm:w-auto',
            ].join(' ')}
            key={image.src}
          >
            <div
              className={[
                'relative w-full overflow-hidden',
                isSingleHero ? 'aspect-[16/9] sm:aspect-[21/9]' : 'aspect-[4/3] sm:aspect-[16/10]',
              ].join(' ')}
            >
              <Image
                alt={image.alt}
                className="object-cover object-center motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
                fetchPriority={index === 0 ? 'high' : 'low'}
                fill
                loading={index === 0 ? undefined : 'lazy'}
                priority={index === 0}
                sizes={isSingleHero ? '100vw' : '(max-width: 640px) 82vw, 50vw'}
                src={image.src}
              />
            </div>
            <figcaption className="border-t border-neutral-200 bg-surface px-3 py-2 text-xs text-neutral-600 sm:px-4 sm:py-3 sm:text-sm">
              {image.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
