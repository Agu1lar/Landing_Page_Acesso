import { ClientLogoCard } from '@/components/marketing/ClientLogoCard';
import { CLIENT_LOGOS } from '@/data/client-logos';

type ClientLogosSectionProps = {
  title: string;
  subtitle: string;
  footnote?: string;
};

/**
 * Trust strip with client logos or segment wordmarks (B2B proof on the home page).
 */
export function ClientLogosSection(props: ClientLogosSectionProps) {
  return (
    <section
      aria-labelledby="client-logos-title"
      className="border-y border-neutral-200 bg-neutral-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl"
            id="client-logos-title"
          >
            {props.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-neutral-600">{props.subtitle}</p>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
          {CLIENT_LOGOS.map((client) => (
            <ClientLogoCard client={client} key={client.slug} />
          ))}
        </ul>

        {props.footnote ? (
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-neutral-500">
            {props.footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
