'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { EquipmentCatalogImage } from '@/components/marketing/EquipmentCatalogImage';
import type { EquipmentGalleryImage } from '@/lib/equipment-gallery';
import { nextGalleryIndex } from '@/lib/equipment-gallery';

const AUTO_ADVANCE_MS = 6000;

type EquipmentImageCarouselProps = {
  images: EquipmentGalleryImage[];
  name: string;
  slug: string;
};

type CarouselArrowProps = {
  direction: 'prev' | 'next';
  label: string;
  onClick: () => void;
};

function CarouselArrow(props: CarouselArrowProps) {
  return (
    <button
      aria-label={props.label}
      className={`absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${props.direction === 'prev' ? 'left-3' : 'right-3'}`}
      onClick={props.onClick}
      type="button"
    >
      <svg aria-hidden className="size-5" fill="none" viewBox="0 0 24 24">
        {props.direction === 'prev' ? (
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        )}
      </svg>
    </button>
  );
}

/**
 * Equipment photo carousel with manual arrows, dots and optional auto-advance.
 */
export function EquipmentImageCarousel(props: EquipmentImageCarouselProps) {
  const t = useTranslations('EquipamentoDetail');
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);
  const images = props.images;
  const hasMultiple = images.length > 1;
  const current = images[index];

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (index >= images.length) {
      setIndex(0);
    }
  }, [images.length, index]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    if (!hasMultiple || reduceMotion || paused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIndex(nextGalleryIndex(indexRef.current, images.length, 'next'));
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(intervalId);
  }, [hasMultiple, images.length, paused, reduceMotion]);

  const goTo = (direction: 'next' | 'prev') => {
    setIndex(nextGalleryIndex(index, images.length, direction));
  };

  if (!current) {
    return null;
  }

  return (
    <div
      aria-label={t('gallery_label', { name: props.name })}
      aria-roledescription="carousel"
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100">
        <EquipmentCatalogImage
          alt={current.alt}
          className="object-contain object-center p-2"
          fill
          key={current.src}
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          slug={props.slug}
          src={current.src}
        />

        {hasMultiple ? (
          <>
            <CarouselArrow
              direction="prev"
              label={t('gallery_prev')}
              onClick={() => goTo('prev')}
            />
            <CarouselArrow
              direction="next"
              label={t('gallery_next')}
              onClick={() => goTo('next')}
            />
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {images.map((image, imageIndex) => (
            <button
              aria-current={imageIndex === index ? 'true' : undefined}
              aria-label={t('gallery_go_to', {
                current: imageIndex + 1,
                total: images.length,
              })}
              className={`size-2.5 rounded-full transition-colors ${imageIndex === index ? 'bg-primary' : 'bg-neutral-300 hover:bg-neutral-400'}`}
              key={`${image.src}-${imageIndex}`}
              onClick={() => setIndex(imageIndex)}
              type="button"
            />
          ))}
          <p aria-live="polite" className="sr-only">
            {t('gallery_status', { current: index + 1, total: images.length })}
          </p>
        </div>
      ) : null}
    </div>
  );
}
