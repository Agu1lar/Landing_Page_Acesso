import type { EquipmentCategory } from '@/types/equipment';

export type CategoryGalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

const CATEGORY_GALLERY: Partial<Record<EquipmentCategory, CategoryGalleryImage[]>> = {
  'guindaste-industrial': [
    {
      src: '/categorias/guindastes-remocoes/guindaste-industrial-operacao.webp',
      alt: 'Guindaste industrial em operação de içamento em obra',
      caption: 'Guindaste industrial para remoção técnica e montagem de equipamentos pesados.',
    },
    {
      src: '/categorias/guindastes-remocoes/munck-icamento-carga.webp',
      alt: 'Caminhão Munck realizando içamento de carga pesada',
      caption: 'Caminhão Munck para carga, descarga e transporte de materiais de grande porte.',
    },
  ],
};

/**
 * Returns showcase images for a category landing page, when configured.
 */
export function getCategoryGallery(category: EquipmentCategory) {
  return CATEGORY_GALLERY[category] ?? [];
}
