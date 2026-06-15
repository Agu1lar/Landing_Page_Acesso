type ExpandableParagraphsProps = {
  paragraphs: string[];
  readMoreLabel: string;
  className?: string;
};

/**
 * First paragraph visible; remaining paragraphs behind native details (SEO-friendly).
 */
export function ExpandableParagraphs({
  paragraphs,
  readMoreLabel,
  className = '',
}: ExpandableParagraphsProps) {
  if (paragraphs.length === 0) {
    return null;
  }

  const [first, ...rest] = paragraphs;

  return (
    <div className={className}>
      <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">{first}</p>

      {rest.length > 0 ? (
        <details className="group mt-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-primary marker:content-none hover:underline [&::-webkit-details-marker]:hidden">
            {readMoreLabel}
          </summary>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {rest.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
