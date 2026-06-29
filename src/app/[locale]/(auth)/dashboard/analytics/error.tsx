'use client';

import { useTranslations } from 'next-intl';

type AnalyticsErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Client error boundary for the analytics dashboard.
 */
export default function AnalyticsErrorPage(props: AnalyticsErrorPageProps) {
  const t = useTranslations('AnalyticsAdminPage');

  return (
    <div className="space-y-4 rounded-xl border border-red-200 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-neutral-900">{t('title')}</h2>
      <p className="text-sm text-neutral-600">{t('load_error')}</p>
      <p className="text-sm text-neutral-600">{t('load_error_probe_ok_hint')}</p>
      {props.error.message ? (
        <details className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-sm text-neutral-700">
          <summary className="cursor-pointer font-medium text-neutral-900">
            {t('load_error_debug_toggle')}
          </summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs">
            {props.error.message}
          </pre>
        </details>
      ) : null}
      <button
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        onClick={() => props.reset()}
        type="button"
      >
        {t('retry_button')}
      </button>
    </div>
  );
}
