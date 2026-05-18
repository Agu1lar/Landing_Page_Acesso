import { GOOGLE_REVIEWS_URL, TESTIMONIALS } from '@/data/testimonials';

type TestimonialsSectionProps = {
  title: string;
  subtitle?: string;
  viewAllLabel: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating} de 5 estrelas`} className="flex gap-0.5" role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          aria-hidden
          className={`h-4 w-4 ${i < rating ? 'text-amber-400' : 'text-neutral-300'}`}
          fill="currentColor"
          key={i}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection({ title, subtitle, viewAllLabel }: TestimonialsSectionProps) {
  return (
    <section aria-labelledby="testimonials-title" className="bg-neutral-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl"
            id="testimonials-title"
          >
            {title}
          </h2>
          {subtitle && <p className="mt-3 text-neutral-600">{subtitle}</p>}
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <li
              className="flex flex-col rounded-[var(--radius-card)] border border-neutral-200 bg-surface p-6 shadow-sm"
              key={item.id}
            >
              <StarRating rating={item.rating} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-neutral-700">
                &ldquo;{item.text}&rdquo;
              </blockquote>
              <footer className="mt-4 border-t border-neutral-100 pt-4">
                <cite className="not-italic">
                  <span className="font-semibold text-neutral-900">{item.author}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">Avaliação no Google</span>
                </cite>
              </footer>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center">
          <a
            className="text-sm font-semibold text-primary hover:underline"
            href={GOOGLE_REVIEWS_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            {viewAllLabel} →
          </a>
        </p>
      </div>
    </section>
  );
}
