type Step = {
  number: string;
  title: string;
  description: string;
};

type StepsSectionProps = {
  title: string;
  subtitle?: string;
  steps: Step[];
};

function StepIcon({ index }: { index: number }) {
  const icons = [
    <svg
      aria-hidden
      className="h-6 w-6"
      fill="none"
      key="search"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </svg>,
    <svg
      aria-hidden
      className="h-6 w-6"
      fill="none"
      key="quote"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>,
    <svg
      aria-hidden
      className="h-6 w-6"
      fill="none"
      key="truck"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M8 17h8M5 17H4a1 1 0 01-1-1v-5l2.5-5H15l3 5v5a1 1 0 01-1 1h-1M7 17a2 2 0 104 0M15 17a2 2 0 104 0M5 7h10l2 4H5V7z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>,
  ];
  return icons[index] ?? icons[0];
}

export function StepsSection({ title, subtitle, steps }: StepsSectionProps) {
  return (
    <section
      aria-labelledby="steps-section-title"
      className="border-y border-neutral-200 bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl"
            id="steps-section-title"
          >
            {title}
          </h2>
          {subtitle && <p className="mt-3 text-neutral-600">{subtitle}</p>}
        </div>

        <ol className="relative mt-12 grid gap-8 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, stepIndex) => (
            <li className="flex flex-col items-center text-center" key={step.number}>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <StepIcon index={stepIndex} />
              </span>
              <span className="mt-4 text-xs font-bold tracking-wider text-primary uppercase">
                {step.number}
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
