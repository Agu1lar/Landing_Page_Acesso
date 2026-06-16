import type { HomeCategoryCardConfig } from '@/data/home-category-cards';
import { CategoryHomeCard } from '@/components/marketing/CategoryHomeCard';
import type { EquipmentCategory } from '@/types/equipment';

type CategoryHomeGridProps = {
  cards: HomeCategoryCardConfig[];
  imagePools: Record<EquipmentCategory, string[]>;
  ctaLabel: string;
};

export function CategoryHomeGrid({ cards, imagePools, ctaLabel }: CategoryHomeGridProps) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card, cardIndex) => (
        <CategoryHomeCard
          card={card}
          catalogImages={imagePools[card.slug]}
          ctaLabel={ctaLabel}
          key={card.slug}
          rotationOffsetMs={cardIndex * 600}
        />
      ))}
    </div>
  );
}
