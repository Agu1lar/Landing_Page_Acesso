import { EquipmentCatalogSkeleton } from '@/components/marketing/EquipmentCatalogSkeleton';

export default function EquipamentosLoadingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-9 w-64 max-w-full animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-neutral-200" />
      <div className="mt-10">
        <EquipmentCatalogSkeleton />
      </div>
    </div>
  );
}
