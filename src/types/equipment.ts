export type EquipmentSpec = {
  label: string;
  value: string;
};

export type EquipmentCategory =
  | 'equipamentos-aereos'
  | 'concretagem'
  | 'compactacao'
  | 'demolicao-perfuracao'
  | 'andaimes-acesso'
  | 'energia'
  | 'ferramentas-eletricas'
  | 'acessorios'
  | 'outros';

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
  'equipamentos-aereos': 'Equipamentos aéreos',
  concretagem: 'Concretagem',
  compactacao: 'Compactação',
  'demolicao-perfuracao': 'Demolição e perfuração',
  'andaimes-acesso': 'Andaimes e acesso',
  energia: 'Energia',
  'ferramentas-eletricas': 'Ferramentas elétricas',
  acessorios: 'Acessórios',
  outros: 'Outros',
};
