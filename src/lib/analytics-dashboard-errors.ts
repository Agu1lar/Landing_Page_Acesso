import { formatDbErrorDetails } from '@/lib/analytics-schema';
import { logger } from '@/libs/Logger';

/**
 * Thrown when a single analytics dashboard query fails.
 */
export class AnalyticsDashboardStepError extends Error {
  readonly stepId: string;
  readonly stepLabel: string;
  readonly details: string;
  readonly causeMessage?: string;

  constructor(stepId: string, stepLabel: string, cause: unknown) {
    const formatted = formatDbErrorDetails(cause);
    super(`Analytics dashboard step "${stepId}" failed: ${formatted.summary}`);
    this.name = 'AnalyticsDashboardStepError';
    this.stepId = stepId;
    this.stepLabel = stepLabel;
    this.details = formatted.summary;
    this.causeMessage = formatted.cause;
    if (cause instanceof Error) {
      this.cause = cause;
    }
  }
}

export type AnalyticsDashboardFailure = {
  stepId?: string;
  stepLabel?: string;
  message: string;
  cause?: string;
};

/**
 * Parses dashboard load failures for UI and logs.
 */
export function parseAnalyticsDashboardFailure(error: unknown): AnalyticsDashboardFailure {
  if (error instanceof AnalyticsDashboardStepError) {
    return {
      stepId: error.stepId,
      stepLabel: error.stepLabel,
      message: error.details,
      cause: error.causeMessage,
    };
  }

  const formatted = formatDbErrorDetails(error);
  return {
    message: formatted.summary,
    cause: formatted.cause,
  };
}

/**
 * Wraps a dashboard query so failures include the step id.
 */
export async function runAnalyticsDashboardStep<T>(
  stepId: string,
  stepLabel: string,
  run: () => Promise<T>,
) {
  try {
    return await run();
  } catch (error) {
    const stepError = new AnalyticsDashboardStepError(stepId, stepLabel, error);
    logger.error('Analytics dashboard step failed', {
      stepId,
      stepLabel,
      message: stepError.details,
      cause: stepError.causeMessage,
    });
    throw stepError;
  }
}
