import type { EquipmentSpec } from '@/types/equipment';

type SpecTableProps = {
  specs: EquipmentSpec[];
  title: string;
  /** Destaque visual para plataformas elevatórias (referência Santos) */
  variant?: 'default' | 'aerial';
  emptyMessage?: string;
};

export function SpecTable({
  specs,
  title,
  variant = 'default',
  emptyMessage = 'Especificações sob consulta. Fale com nossa equipe comercial.',
}: SpecTableProps) {
  const isAerial = variant === 'aerial';

  return (
    <section
      aria-labelledby="spec-table-title"
      className={
        isAerial
          ? 'rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 p-5'
          : undefined
      }
    >
      <h2 className="font-heading text-lg font-semibold text-neutral-900" id="spec-table-title">
        {title}
      </h2>
      {isAerial && (
        <p className="mt-1 text-sm text-neutral-600">
          Dados de referência para apoio à escolha do equipamento. Valores finais conforme
          disponibilidade.
        </p>
      )}

      {specs.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600">{emptyMessage}</p>
      ) : (
        <dl className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-surface">
          {specs.map((spec) => (
            <div className="flex justify-between gap-4 px-4 py-3 text-sm" key={spec.label}>
              <dt className="font-medium text-neutral-600">{spec.label}</dt>
              <dd className="text-right font-medium text-neutral-900">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
