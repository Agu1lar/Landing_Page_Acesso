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
      {props.client.logoSrc ? (
        <Image
          alt={`Logo ${props.client.name}`}
          className="h-10 w-full max-w-[9rem] object-contain grayscale transition-[filter] duration-300 group-hover:grayscale-0"
          height={40}
          src={props.client.logoSrc}
          width={160}
        />
      ) : (
        <span className="text-center font-heading text-sm font-semibold tracking-tight text-neutral-800">
          {props.client.name}
        </span>
      )}
      <span className="mt-2 text-center text-[0.65rem] font-medium tracking-wide text-neutral-500 uppercase">
        {segmentLabel}
      </span>
    </li>
  );
}
