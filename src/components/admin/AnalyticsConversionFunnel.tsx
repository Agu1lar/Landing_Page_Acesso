import { AnalyticsMetricSection } from '@/components/admin/AnalyticsMetricSection';
import type { ConversionFunnelStep } from '@/lib/analytics-funnel';
import type { AnalyticsDataType } from '@/lib/analytics-sections';

type AnalyticsConversionFunnelProps = {
  title: string;
  meaning: string;
  dataType: AnalyticsDataType;
  dataTypeLabel: string;
  meaningToggleLabel: string;
  meaningHideLabel: string;
  steps: ConversionFunnelStep[];
  stepLabels: Record<ConversionFunnelStep['id'], string>;
  emptyLabel: string;
  rateFromTopLabel: string;
  rateFromPreviousLabel: string;
};

/**
 * Horizontal funnel for visit → equipment → cart → lead → WhatsApp.
 */
export function AnalyticsConversionFunnel(props: AnalyticsConversionFunnelProps) {
  const max = Math.max(1, ...props.steps.map((step) => step.count));
  const hasData = props.steps.some((step) => step.count > 0);

  return (
    <AnalyticsMetricSection
      dataType={props.dataType}
      dataTypeLabel={props.dataTypeLabel}
      meaning={props.meaning}
      meaningHideLabel={props.meaningHideLabel}
      meaningToggleLabel={props.meaningToggleLabel}
      title={props.title}
    >
      {!hasData ? (
        <p className="text-sm text-neutral-500">{props.emptyLabel}</p>
      ) : (
        <ul className="space-y-4">
          {props.steps.map((step) => (
            <li key={step.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-neutral-900">{props.stepLabels[step.id]}</span>
                <span className="tabular-nums font-semibold text-neutral-700">{step.count}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((step.count / max) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                {props.rateFromTopLabel.replace('{rate}', String(step.rateFromTop))}
                {step.rateFromPrevious !== null
                  ? ` · ${props.rateFromPreviousLabel.replace('{rate}', String(step.rateFromPrevious))}`
                  : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AnalyticsMetricSection>
  );
}
