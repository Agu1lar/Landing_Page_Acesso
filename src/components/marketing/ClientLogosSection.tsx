import { ClientLogoImage } from '@/components/marketing/ClientLogoImage';
import { getAllClientLogos } from '@/lib/client-logos-fs';

type ClientLogosSectionProps = {
  title: string;
  subtitle: string;
  footnote?: string;
};

/**
 * Trust strip with all client logos; files are read from public/clientes/{segment}/.
 */
export async function ClientLogosSection(props: ClientLogosSectionProps) {
  const logos = getAllClientLogos();

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

        {logos.length === 0 ? (
          <p className="mx-auto mt-10 max-w-xl text-center text-sm text-neutral-500">
            Adicione logos com fundo transparente em{' '}
            <code className="text-neutral-700">public/clientes/&lt;setor&gt;/</code>.
          </p>
        ) : (
          <ul className="mt-10 flex min-h-[3.5rem] flex-wrap items-center justify-center gap-4 sm:gap-6">
            {logos.map((logo) => (
              <li
                className="group flex items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-surface px-4 py-3 shadow-sm transition-colors hover:border-primary/40"
                key={logo.src}
              >
                <ClientLogoImage alt={logo.alt} src={logo.src} />
              </li>
            ))}
          </ul>
        )}

        {props.footnote ? (
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-neutral-500">
            {props.footnote}
          </p>
        ) : null}
      </div>
    </section>
  );
}
