'use client';

import { useState } from 'react';
import type { AnalyticsDataType } from '@/lib/analytics-sections';

const DATA_TYPE_STYLES: Record<AnalyticsDataType, string> = {
  count: 'bg-sky-50 text-sky-800 ring-sky-200',
  rate: 'bg-violet-50 text-violet-800 ring-violet-200',
  ranking: 'bg-amber-50 text-amber-900 ring-amber-200',
  funnel: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  timeseries: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  breakdown: 'bg-orange-50 text-orange-900 ring-orange-200',
  table: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
};

type AnalyticsMetricSectionProps = {
  title: string;
  dataType: AnalyticsDataType;
  dataTypeLabel: string;
  meaning: string;
  meaningToggleLabel: string;
  meaningHideLabel: string;
  children: React.ReactNode;
};

/**
 * Groups a metric block: data type badge, optional meaning panel, then pure data.
 */
export function AnalyticsMetricSection(props: AnalyticsMetricSectionProps) {
  const [meaningOpen, setMeaningOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 bg-neutral-50/60 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ring-1 ring-inset ${DATA_TYPE_STYLES[props.dataType]}`}
              >
                {props.dataTypeLabel}
              </span>
              <h3 className="font-heading text-base font-semibold text-neutral-900">{props.title}</h3>
            </div>
          </div>
          <button
            aria-expanded={meaningOpen}
            className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-primary/30 hover:text-primary"
            onClick={() => setMeaningOpen((current) => !current)}
            type="button"
          >
            {meaningOpen ? props.meaningHideLabel : props.meaningToggleLabel}
          </button>
        </div>
        {meaningOpen ? (
          <p className="mt-3 rounded-lg border border-primary/15 bg-primary-light/20 px-3 py-2.5 text-sm leading-relaxed text-neutral-700">
            {props.meaning}
          </p>
        ) : null}
      </div>
      <div className="p-5">{props.children}</div>
    </section>
  );
}
