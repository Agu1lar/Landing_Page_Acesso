import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';

type PrimaryLineCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  imageSrc?: string;
  imageAlt?: string;
  badge?: string;
};

type PrimaryLinesSectionProps = {
  title: string;
  subtitle: string;
  cards: PrimaryLineCard[];
};

/**
 * Highlights main rental lines (aerial platforms, cranes) on the home page.
 */
export function PrimaryLinesSection(props: PrimaryLinesSectionProps) {
  return (
    <section aria-labelledby="primary-lines-title" className="border-b border-neutral-200 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl font-bold text-neutral-900" id="primary-lines-title">
            {props.title}
          </h2>
          <p className="mt-3 text-neutral-600">{props.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {props.cards.map((card) => (
            <article
              className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-surface shadow-sm transition-shadow hover:shadow-md lg:flex-row"
              key={card.href}
            >
              {card.imageSrc && card.imageAlt ? (
                <div className="relative h-48 w-full shrink-0 overflow-hidden bg-neutral-100 lg:h-auto lg:w-72">
                  <Image
                    alt={card.imageAlt}
                    className="object-contain object-center p-2"
                    fill
                    sizes="(max-width: 1024px) 100vw, 18rem"
                    src={card.imageSrc}
                  />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col p-6">
                {card.badge ? (
                  <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                    {card.badge}
                  </p>
                ) : null}
                <h3 className="mt-1 font-heading text-xl font-semibold text-neutral-900 group-hover:text-primary">
                  <Link href={card.href}>{card.title}</Link>
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
                  {card.description}
                </p>
                <Link
                  className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                  href={card.href}
                >
                  {card.cta} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
