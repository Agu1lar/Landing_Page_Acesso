/**
 * Placeholder grid while the equipment catalog route loads.
 */
export function EquipmentCatalogSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando catálogo"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-surface shadow-sm"
          key={index}
        >
          <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-9 w-full animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
