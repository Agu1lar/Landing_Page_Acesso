'use client';

import { useEffect, useRef, useState } from 'react';
import { ClientLogoImage } from '@/components/marketing/ClientLogoImage';
import type { SegmentLogoFile } from '@/lib/client-logos-fs';

const VISIBLE_COUNT = 4;
const ROTATE_MS = 6000;
const FADE_MS = 900;

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

type LogoGridProps = {
  batch: SegmentLogoFile[];
  layerKey: string;
  visible: boolean;
};

/**
 * One logo batch layer used for crossfade transitions.
 */
function LogoGrid(props: LogoGridProps) {
  return (
    <ul
      aria-hidden={!props.visible}
      className={`absolute inset-0 grid grid-cols-2 items-center justify-items-center gap-6 transition-[opacity,transform] ease-in-out motion-reduce:transition-none sm:grid-cols-4 sm:gap-10 ${
        props.visible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-1 opacity-0'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {props.batch.map((logo) => (
        <li
          className="flex h-24 w-full max-w-[14rem] items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-surface px-5 py-4 shadow-sm sm:h-28"
          key={`${props.layerKey}-${logo.src}`}
        >
          <ClientLogoImage alt={logo.alt} src={logo.src} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Rotates four client logos at a time with a crossfade transition.
 */
export function ClientLogosCarousel(props: ClientLogosCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [crossfading, setCrossfading] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const fadeTimeoutRef = useRef<number | null>(null);
  const startIndexRef = useRef(0);
  const logos = props.logos;
  const shouldRotate = logos.length > VISIBLE_COUNT && !reduceMotion;
  const outgoingBatch = visibleLogos(logos, startIndex, VISIBLE_COUNT);
  const incomingBatch =
    incomingIndex === null ? [] : visibleLogos(logos, incomingIndex, VISIBLE_COUNT);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    startIndexRef.current = startIndex;
  }, [startIndex]);

  useEffect(() => {
    if (!shouldRotate) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (fadeTimeoutRef.current !== null) {
        return;
      }

      const nextIndex = (startIndexRef.current + VISIBLE_COUNT) % logos.length;
      setIncomingIndex(nextIndex);
      requestAnimationFrame(() => setCrossfading(true));

      fadeTimeoutRef.current = window.setTimeout(() => {
        startIndexRef.current = nextIndex;
        setStartIndex(nextIndex);
        setIncomingIndex(null);
        setCrossfading(false);
        fadeTimeoutRef.current = null;
      }, FADE_MS);
    }, ROTATE_MS);

    return () => {
      window.clearInterval(intervalId);
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [logos.length, shouldRotate]);

  if (!shouldRotate) {
    return (
      <div
        aria-label="Logotipos de clientes e parceiros"
        className="mt-10"
        role="region"
      >
        <ul className="grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-4 sm:gap-10">
          {outgoingBatch.map((logo) => (
            <li
              className="flex h-24 w-full max-w-[14rem] items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-surface px-5 py-4 shadow-sm sm:h-28"
              key={logo.src}
            >
              <ClientLogoImage alt={logo.alt} src={logo.src} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      aria-label="Logotipos de clientes e parceiros"
      aria-live="polite"
      className="relative mt-10 min-h-28 sm:min-h-32"
      role="region"
    >
      <LogoGrid batch={outgoingBatch} layerKey={`out-${startIndex}`} visible={!crossfading} />
      {incomingIndex !== null ? (
        <LogoGrid
          batch={incomingBatch}
          layerKey={`in-${incomingIndex}`}
          visible={crossfading}
        />
      ) : null}
    </div>
  );
}
