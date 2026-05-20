'use client';

import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { captureWhatsAppClick } from '@/lib/posthog-events';

type TrackedWhatsAppLinkProps = ComponentPropsWithoutRef<'a'> & {
  origin: string;
  equipmentSlug?: string;
  equipmentName?: string;
};

/**
 * Inline WhatsApp anchor with PostHog whatsapp_click tracking.
 */
export function TrackedWhatsAppLink(props: TrackedWhatsAppLinkProps) {
  const { origin, equipmentSlug, equipmentName, onClick, children, ...rest } = props;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    captureWhatsAppClick({ origin, equipmentSlug, equipmentName });
    onClick?.(event);
  };

  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
