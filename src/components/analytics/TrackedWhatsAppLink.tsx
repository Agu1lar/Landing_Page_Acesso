'use client';

import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { trackWhatsAppClick } from '@/lib/track-whatsapp-click';

type TrackedWhatsAppLinkProps = ComponentPropsWithoutRef<'a'> & {
  origin: string;
  equipmentSlug?: string;
  equipmentName?: string;
};

/**
 * Inline WhatsApp anchor with click tracking. Opens in a new tab by default so
 * Ads conversion beacons are not cancelled by same-tab navigation to wa.me.
 */
export function TrackedWhatsAppLink(props: TrackedWhatsAppLinkProps) {
  const { origin, equipmentSlug, equipmentName, onClick, children, target, rel, ...rest } = props;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackWhatsAppClick({ origin, equipmentSlug, equipmentName });
    onClick?.(event);
  };

  return (
    <a
      {...rest}
      target={target ?? '_blank'}
      rel={rel ?? 'noopener noreferrer'}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
