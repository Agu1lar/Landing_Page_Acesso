'use client';

import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { trackPhoneClick } from '@/lib/track-phone-click';

type TrackedPhoneLinkProps = ComponentPropsWithoutRef<'a'> & {
  origin: string;
};

/**
 * tel: anchor with phone_click tracking for the operational dashboard.
 */
export function TrackedPhoneLink(props: TrackedPhoneLinkProps) {
  const { origin, onClick, children, ...rest } = props;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackPhoneClick({ origin });
    onClick?.(event);
  };

  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
