import type { FaqItem } from '@/data/faq';

type FaqAccordionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-neutral-200 rounded-[var(--radius-card)] border border-neutral-200 bg-surface">
      {items.map((item) => (
        <details className="group px-5 py-1" key={item.id}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading font-semibold text-neutral-900 marker:content-none [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-neutral-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
