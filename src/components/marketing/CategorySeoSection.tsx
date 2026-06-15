import { ExpandableParagraphs } from '@/components/marketing/ExpandableParagraphs';

type CategorySeoSectionProps = {
  paragraphs: string[];
  readMoreLabel: string;
};

/**
 * SEO copy for category landings: first paragraph visible, rest behind native details.
 * Full text stays in the DOM for crawlers.
 */
export function CategorySeoSection({ paragraphs, readMoreLabel }: CategorySeoSectionProps) {
  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={readMoreLabel}
      className="mt-10 border-t border-neutral-200 pt-8 sm:mt-12 sm:pt-10"
    >
      <ExpandableParagraphs paragraphs={paragraphs} readMoreLabel={readMoreLabel} />
    </section>
  );
}
