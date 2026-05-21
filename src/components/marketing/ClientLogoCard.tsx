import Image from 'next/image';
import type { ClientLogo } from '@/data/client-logos';
import { CLIENT_LOGO_SEGMENT_LABELS } from '@/data/client-logos';

type ClientLogoCardProps = {
  client: ClientLogo;
};

/**
 * Single client or segment badge in the trust strip.
 */
export function ClientLogoCard(props: ClientLogoCardProps) {
  const segmentLabel = CLIENT_LOGO_SEGMENT_LABELS[props.client.segment];

  return (
    <li className="group flex min-h-[5.5rem] flex-col items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-surface px-4 py-5 shadow-sm transition-colors hover:border-primary/40">
      <Image
        alt={`${props.client.name} — ${segmentLabel}`}
        className="h-10 w-full max-w-[9.5rem] object-contain grayscale transition-[filter] duration-300 group-hover:grayscale-0 motion-reduce:transition-none"
        height={40}
        sizes="(max-width: 640px) 45vw, 9.5rem"
        src={props.client.logoSrc}
        width={152}
      />
      <span className="mt-2 text-center text-[0.65rem] font-medium tracking-wide text-neutral-500 uppercase">
        {segmentLabel}
      </span>
    </li>
  );
}
