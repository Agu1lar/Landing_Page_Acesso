'use client';

import { useEffect, useState } from 'react';
import { ClientLogoImage } from '@/components/marketing/ClientLogoImage';
import type { SegmentLogoFile } from '@/lib/client-logos-fs';

const VISIBLE_COUNT = 4;
const ROTATE_MS = 5000;
const FADE_MS = 400;

type ClientLogosCarouselProps = {
  logos: SegmentLogoFile[];
};

/**
 * Returns the next batch of logos to display, wrapping when needed.
 *
 * @param logos - Full deduplicated logo list.
 * @param startIndex - Index of the first visible logo.
 * @param count - Number of logos to show.
 * @returns Visible logo slice.
 */
function visibleLogos(logos: SegmentLogoFile[], startIndex: number, count: number) {
  if (logos.length <= count) {
    return logos;
  }

  return Array.from({ length: count }, (_, index) => logos[(startIndex + index) % logos.length]!);
}

/**
 * Rotates four client logos at a time with a fade transition.
 */
export function ClientLogosCarousel(props: ClientLogosCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [opaque, setOpaque] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const logos = props.logos;
  const batch = visibleLogos(logos, startIndex, VISIBLE_COUNT);
  const shouldRotate = logos.length > VISIBLE_COUNT && !reduceMotion;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    if (!shouldRotate) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setOpaque(false);
      window.setTimeout(() => {
        setStartIndex((current) => (current + VISIBLE_COUNT) % logos.length);
        setOpaque(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [logos.length, shouldRotate]);

  return (
    <div
      aria-label="Logotipos de clientes e parceiros"
      aria-live="polite"
      className="mt-10"
      role="region"
    >
      <ul
        className={`grid grid-cols-2 items-center justify-items-center gap-6 transition-opacity duration-300 motion-reduce:transition-none sm:grid-cols-4 sm:gap-10 ${
          opaque ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {batch.map((logo) => (
          <li
            className="flex h-24 w-full max-w-[14rem] items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-surface px-5 py-4 shadow-sm sm:h-28"
            key={`${startIndex}-${logo.src}`}
          >
            <ClientLogoImage alt={logo.alt} src={logo.src} />
          </li>
        ))}
      </ul>
    </div>
  );
}
