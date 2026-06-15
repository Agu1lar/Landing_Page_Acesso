import { brand } from '@/lib/brand';
import { resolveEquipmentLongDescription } from '@/lib/equipment-long-description';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

const META_MAX_LENGTH = 160;

const CATEGORY_META: Record<EquipmentCategory, (name: string) => string> = {
  'equipamentos-aereos': (name) =>
    `Alugue ${name} em BH e região. Frota revisada, entrega na obra e orçamento rápido pelo site ou WhatsApp.`,
  concretagem: (name) =>
    `Locação de ${name} para concretagem em BH e RMBH. Entrega programada e condições claras. Solicite orçamento.`,
  compactacao: (name) =>
    `Alugue ${name} para compactação de solo em BH e região. Peça orçamento online com entrega na obra.`,
  'demolicao-perfuracao': (name) =>
    `Locação de ${name} em BH e região metropolitana. Equipamento revisado — orçamento pelo site ou WhatsApp.`,
  'andaimes-acesso': (name) =>
    `Alugue ${name} para sua obra em BH e RMBH. Atendimento comercial ágil e entrega conforme disponibilidade.`,
  'guindastes-remocoes': (name) =>
    `Locação de ${name} em BH e região. Operação planejada para içamento e remoção. Peça orçamento agora.`,
  energia: (name) =>
    `Alugue ${name} para sua obra em BH e região. Frota revisada e orçamento sob consulta pelo site.`,
  'ferramentas-eletricas': (name) =>
    `Locação de ${name} em BH e RMBH. Retire na loja ou combine entrega — solicite orçamento online.`,
  acessorios: (name) =>
    `Alugue ${name} para sua obra em BH e região. Catálogo completo e orçamento rápido com a Acesso.`,
  outros: (name) =>
    `Locação de ${name} em ${brand.seoRegion}. Peça orçamento pelo site ou WhatsApp com resposta ágil.`,
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
