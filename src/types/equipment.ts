export type EquipmentSpec = {
  label: string;
  value: string;
};

export type EquipmentCategory =
  | 'plataformas-elevatorias'
  | 'guindaste-industrial'
  | 'ferramentas-eletricas'
  | 'ferramentas-combustao'
  | 'ferramentas-bateria'
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
  'plataformas-elevatorias': 'Plataformas Elevatórias',
  'guindaste-industrial': 'Guindaste Industrial',
  'ferramentas-eletricas': 'Ferramentas Elétricas',
  'ferramentas-combustao': 'Ferramentas à Combustão',
  'ferramentas-bateria': 'Ferramentas à Bateria',
  andaimes: 'Andaimes',
  'manipuladores-telescopicos': 'Manipuladores Telescópicos',
};

/** Display order for home, sitemap and admin category pickers. */
export const EQUIPMENT_CATEGORY_ORDER: EquipmentCategory[] = [
  'plataformas-elevatorias',
  'guindaste-industrial',
  'manipuladores-telescopicos',
  'andaimes',
  'ferramentas-eletricas',
  'ferramentas-combustao',
  'ferramentas-bateria',
];
