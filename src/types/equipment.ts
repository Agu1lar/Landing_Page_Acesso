export type EquipmentSpec = {
  label: string;
  value: string;
};

export type EquipmentCategory =
  | 'plataformas-elevatorias'
  | 'guindaste-industrial'
  | 'ferramentas-eletricas'
  | 'ferramentas-combustao'
  | 'andaimes'
  | 'manipuladores-telescopicos';

export type Equipment = {
  slug: string;
  name: string;
  category: EquipmentCategory;
  shortDescription: string;
  longDescription: string;
  specs: EquipmentSpec[];
  tags: string[];
  featured: boolean;
  available: boolean;
};

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  'plataformas-elevatorias': 'Plataformas elevatórias',
  'guindaste-industrial': 'Guindaste industrial',
  'ferramentas-eletricas': 'Ferramentas elétricas',
  'ferramentas-combustao': 'Ferramentas à combustão',
  andaimes: 'Andaimes',
  'manipuladores-telescopicos': 'Manipuladores telescópicos',
};

/** Display order for home, sitemap and admin category pickers. */
export const EQUIPMENT_CATEGORY_ORDER: EquipmentCategory[] = [
  'plataformas-elevatorias',
  'guindaste-industrial',
  'manipuladores-telescopicos',
  'andaimes',
  'ferramentas-eletricas',
  'ferramentas-combustao',
];

export function isEquipmentCategory(category: string): category is EquipmentCategory {
  return (EQUIPMENT_CATEGORY_ORDER as readonly string[]).includes(category);
}
