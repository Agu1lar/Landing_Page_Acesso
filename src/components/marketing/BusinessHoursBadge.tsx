'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { COMMERCIAL_HOURS, isCommercialHoursOpen } from '@/lib/business-hours';

type BusinessHoursBadgeProps = {
  className?: string;
};

/**
 * Live open/closed indicator for commercial desk hours (BH timezone).
 */
export function BusinessHoursBadge({ className = '' }: BusinessHoursBadgeProps) {
  const t = useTranslations('BusinessHours');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setOpen(isCommercialHoursOpen());
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <p
      className={`flex items-center justify-center gap-2 text-center text-xs text-neutral-600 ${className}`}
    >
      <span
        aria-hidden
        className={`inline-block h-2 w-2 shrink-0 rounded-full ${
          open ? 'bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.25)]' : 'bg-neutral-400'
        }`}
      />
      <span>
        {open ? t('open_now') : t('closed')}{' '}
        <span className="text-neutral-500">· {COMMERCIAL_HOURS.scheduleLabel}</span>
      </span>
    </p>
  );
}
