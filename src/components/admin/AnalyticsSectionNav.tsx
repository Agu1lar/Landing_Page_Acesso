'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import type { AnalyticsSectionId } from '@/lib/analytics-sections';
import { ANALYTICS_SECTIONS } from '@/lib/analytics-sections';
import { Link } from '@/libs/I18nNavigation';

type AnalyticsSectionNavProps = {
  activeSection: AnalyticsSectionId;
  labels: Record<AnalyticsSectionId, string>;
};

/**
 * Subcategory navigation for the analytics dashboard (preserves date filters).
 */
export function AnalyticsSectionNav(props: AnalyticsSectionNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = pathname ?? '/dashboard/analytics';

  function hrefFor(section: AnalyticsSectionId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('section', section);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <nav aria-label="Subcategorias de métricas" className="overflow-x-auto">
      <ul className="flex min-w-max gap-2 pb-1">
        {ANALYTICS_SECTIONS.map((section) => {
          const active = section === props.activeSection;

          return (
            <li key={section}>
              <Link
                aria-current={active ? 'page' : undefined}
                className={`inline-flex rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50'
                }`}
                href={hrefFor(section)}
                scroll={false}
              >
                {props.labels[section]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
