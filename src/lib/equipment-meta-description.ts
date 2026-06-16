import { brand } from '@/lib/brand';
import { resolveEquipmentLongDescription } from '@/lib/equipment-long-description';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

const META_MAX_LENGTH = 160;

const CATEGORY_META: Record<EquipmentCategory, (name: string) => string> = {
  'plataformas-elevatorias': (name) =>
    `Alugue ${name} em BH e região. Frota revisada, entrega na obra e orçamento rápido pelo site ou WhatsApp.`,
  'guindaste-industrial': (name) =>
    `Locação de ${name} em BH e região. Operação planejada para içamento e remoção. Peça orçamento agora.`,
  'manipuladores-telescopicos': (name) =>
    `Alugue ${name} para movimentação de cargas em obra. Orçamento sob consulta em ${brand.seoRegion}.`,
  andaimes: (name) =>
    `Alugue ${name} para sua obra em BH e RMBH. Atendimento comercial ágil e entrega conforme disponibilidade.`,
  'ferramentas-eletricas': (name) =>
    `Locação de ${name} em BH e RMBH. Retire na loja ou combine entrega — solicite orçamento online.`,
  'ferramentas-combustao': (name) =>
    `Alugue ${name} à combustão para sua obra em BH e região. Frota revisada e orçamento sob consulta.`,
  'ferramentas-bateria': (name) =>
    `Locação de ${name} à bateria em ${brand.seoRegion}. Peça orçamento pelo site ou WhatsApp.`,
};

function trimMetaDescription(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= META_MAX_LENGTH) {
    return normalized;
  }

  const cut = normalized.slice(0, META_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const end = lastSpace > META_MAX_LENGTH * 0.6 ? lastSpace : META_MAX_LENGTH - 1;
  return `${cut.slice(0, end).trim()}…`;
}

function specHighlight(equipment: Equipment) {
  const priorityLabels = ['Altura de trabalho', 'Capacidade de carga', 'Capacidade', 'Aplicação'];
  for (const label of priorityLabels) {
    const spec = equipment.specs.find((item) => item.label === label);
    if (spec?.value) {
      return `${label.toLowerCase()}: ${spec.value}`;
    }
  }
  return null;
}

/**
 * Builds a click-oriented meta description distinct from shortDescription and longDescription.
 */
export function buildEquipmentMetaDescription(equipment: Equipment) {
  const base = CATEGORY_META[equipment.category](equipment.name);
  const highlight = specHighlight(equipment);

  if (!highlight) {
    return trimMetaDescription(base);
  }

  const withSpec = `${base} ${highlight.charAt(0).toUpperCase()}${highlight.slice(1)}.`;
  return trimMetaDescription(withSpec);
}

/**
 * Returns on-page body copy: enriched longDescription or shortDescription fallback.
 */
export function getEquipmentPageBodyDescription(equipment: Equipment) {
  const resolved = resolveEquipmentLongDescription(equipment);
  if (resolved) {
    return resolved;
  }
  return equipment.shortDescription.trim();
}

/**
 * Product/schema summary — prefer technical long copy over catalog blurb.
 */
export function getEquipmentSchemaDescription(equipment: Equipment) {
  return getEquipmentPageBodyDescription(equipment);
}
