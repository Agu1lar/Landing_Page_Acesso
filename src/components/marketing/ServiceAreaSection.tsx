import { brand } from '@/lib/brand';

type ServiceAreaSectionProps = {
  title: string;
  eyebrow: string;
  primaryLabel: string;
  /** Defaults to brand.serviceAreaCities (same list as LocalBusiness schema). */
  cities?: readonly string[];
  /** Highlighted municipality — usually Belo Horizonte (sede). */
  primaryCity?: string;
  className?: string;
};

function MapPinIcon() {
  return (
    <svg aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
      />
      <circle cx="12" cy="10" r="2.25" strokeWidth={1.75} />
    </svg>
  );
}

/**
 * Visual block for local SEO — municipalities served around Belo Horizonte.
 */
export function ServiceAreaSection(props: ServiceAreaSectionProps) {
  const cities = props.cities ?? brand.serviceAreaCities;
  const primaryCity = props.primaryCity ?? brand.address.city;

  return (
    <section
      aria-labelledby="service-area-title"
      className={`border-y border-primary/15 bg-gradient-to-b from-primary-light/50 via-primary-light/20 to-surface ${props.className ?? ''}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,26rem)_1fr]">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold tracking-wider text-primary uppercase">
              <MapPinIcon />
              {props.eyebrow}
            </p>
            <h2
              className="mt-3 font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl"
              id="service-area-title"
            >
              {props.title}
            </h2>
          </div>

          <ul className="flex flex-wrap gap-2 lg:justify-end">
            {cities.map((city) => {
              const isPrimary = city === primaryCity;

              return (
                <li key={city}>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium shadow-sm ${
                      isPrimary
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-neutral-200/90 bg-white text-neutral-800'
                    }`}
                  >
                    {isPrimary ? <MapPinIcon /> : null}
                    <span>{city}</span>
                    {isPrimary ? (
                      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                        {props.primaryLabel}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
