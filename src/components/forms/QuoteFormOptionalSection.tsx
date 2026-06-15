'use client';

import { useEffect, useState } from 'react';

type QuoteFormOptionalSectionProps = {
  summary: string;
  children: React.ReactNode;
};

/**
 * Collapsible optional fields on mobile; always expanded on desktop.
 */
export function QuoteFormOptionalSection(props: QuoteFormOptionalSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (!isMobile) {
    return <div className="space-y-4">{props.children}</div>;
  }

  return (
    <details className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-neutral-800 marker:content-none [&::-webkit-details-marker]:hidden">
        {props.summary}
      </summary>
      <div className="mt-4 space-y-4">{props.children}</div>
    </details>
  );
}
