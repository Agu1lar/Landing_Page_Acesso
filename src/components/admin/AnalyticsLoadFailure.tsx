import { AdminCallout } from '@/components/admin/AdminCallout';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type { AnalyticsDashboardProbeResult } from '@/lib/analytics-admin';
import type { AnalyticsDashboardFailure } from '@/lib/analytics-dashboard-errors';

type AnalyticsLoadFailureProps = {
  title: string;
  description: string;
  loadError: string;
  loadErrorStep?: string;
  debugToggle: string;
  probeOkHint: string;
  smokeTestHint: string;
  failure: AnalyticsDashboardFailure;
  probe?: AnalyticsDashboardProbeResult;
};

/**
 * Renders analytics dashboard load errors with optional smoke probe comparison.
 */
export function AnalyticsLoadFailure(props: AnalyticsLoadFailureProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader description={props.description} title={props.title} />
      <AdminCallout variant="warning">{props.loadError}</AdminCallout>
      {props.loadErrorStep ? (
        <AdminCallout variant="warning">{props.loadErrorStep}</AdminCallout>
      ) : null}
      {props.probe?.ok ? (
        <AdminCallout variant="tip">{props.probeOkHint}</AdminCallout>
      ) : null}
      <details className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <summary className="cursor-pointer font-medium text-neutral-900">
          {props.debugToggle}
        </summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs">
          {props.failure.message}
        </pre>
        {props.failure.cause ? (
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-neutral-600">
            {props.failure.cause}
          </pre>
        ) : null}
        {props.probe ? (
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-neutral-600">
            {JSON.stringify(props.probe, null, 2)}
          </pre>
        ) : null}
      </details>
      <p className="text-sm text-neutral-600">{props.smokeTestHint}</p>
    </div>
  );
}
