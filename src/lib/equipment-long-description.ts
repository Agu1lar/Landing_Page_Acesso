import { formatBrandServiceArea } from '@/lib/brand';
import { CATEGORY_LABELS, type Equipment, type EquipmentCategory } from '@/types/equipment';

const MIN_RICH_LONG_LENGTH = 180;

/** Boilerplate phrases from legacy catalog import — trigger enrichment. */
const THIN_MARKERS = [
  'Tensão e acessórios conforme modelo; uso com EPI',
  'Entrega e retirada combinadas com a locação.',
  'Disponibilidade e condições comerciais conforme período',
  'Montagem conforme projeto e normas de segurança; consulte nossa equipe',
  'Dimensionamento conforme demanda do serviço; valores e autonomia sob consulta',
  'Indicado para serviços pontuais com operador treinado e proteção adequada',
  'Ferramenta elétrica para locação em obra e reforma',
  'Equipamento para concretagem e misturas em obra civil',
  'Equipamento para locação em obra civil na região metropolitana',
  'Solução de acesso e estrutura temporária para obra',
];

const CATEGORY_INTRO: Record<EquipmentCategory, (equipment: Equipment) => string> = {
  'plataformas-elevatorias': (equipment) => {
    const tipo = specValue(equipment, 'Tipo');
    const altura = specValue(equipment, 'Altura de trabalho');
    const tipoPhrase = tipo ? `plataforma ${tipo.toLowerCase()}` : 'plataforma elevatória';
    const alturaPhrase = altura ? ` com altura de trabalho em torno de ${altura}` : '';
    return `A ${equipment.name} é uma ${tipoPhrase}${alturaPhrase}, indicada para serviços em altura com segurança em obras e manutenções em ${formatBrandServiceArea()}.`;
  },
  'guindaste-industrial': (equipment) =>
    `${equipment.name}: solução para içamento, carga, descarga e remoção técnica de cargas pesadas, com planejamento de operação e equipe especializada.`,
  'manipuladores-telescopicos': (equipment) =>
    `O ${equipment.name} é manipulador telescópico para movimentação de cargas em obra e indústria, com alcance e capacidade conforme especificação do fabricante.`,
  andaimes: (equipment) =>
    `O ${equipment.name} compõe sistemas de andaime e acesso temporário em fachadas, shafts e frentes de serviço, conforme projeto e NR-18 no canteiro.`,
  'ferramentas-eletricas': (equipment) =>
    `A ${equipment.name} é ferramenta elétrica para corte, furação, acabamento, concretagem ou montagem em obra, com uso de EPI e instalação compatível com o modelo locado.`,
  'ferramentas-combustao': (equipment) =>
    `O ${equipment.name} é ferramenta ou máquina à combustão para uso em obra, com operação conforme manual do fabricante e EPIs adequados.`,
};

function specValue(equipment: Equipment, label: string) {
  return equipment.specs.find((item) => item.label === label)?.value;
}

function formatSpecsSentence(equipment: Equipment) {
  if (equipment.specs.length === 0) {
    return '';
  }

  const details = equipment.specs.map((item) => `${item.label}: ${item.value}`).join('; ');
  return `Características técnicas: ${details}.`;
}

function logisticsSentence() {
  return `Locação com entrega e retirada em ${formatBrandServiceArea()}. Período mínimo, disponibilidade e valores sob consulta com a Acesso Equipamentos.`;
}

/**
 * Returns true when stored longDescription is generic or too short for SEO body copy.
 */
export function isThinLongDescription(equipment: Equipment) {
  const long = equipment.longDescription.trim();
  const short = equipment.shortDescription.trim();

  if (!long) {
    return true;
  }
  if (long === short) {
    return true;
  }
  if (THIN_MARKERS.some((marker) => long.includes(marker))) {
    return true;
  }
  if (/^[\p{L}\d\s./-]+: Equipamento para/u.test(long)) {
    return true;
  }
  return long.length < MIN_RICH_LONG_LENGTH;
}

/**
 * Builds a technical long-form description from category, specs and service area.
 */
export function buildEquipmentLongDescription(equipment: Equipment) {
  const intro = CATEGORY_INTRO[equipment.category](equipment);
  const specs = formatSpecsSentence(equipment);
  const logistics = logisticsSentence();
  const categoryLabel = CATEGORY_LABELS[equipment.category].toLowerCase();

  const existing = equipment.longDescription.trim();
  const existingIsUseful =
    existing.length >= 80 && !THIN_MARKERS.some((marker) => existing.includes(marker));

  const opening = existingIsUseful ? existing : intro;
  const context = existingIsUseful
    ? `Equipamento da linha de ${categoryLabel} para locação em ${formatBrandServiceArea()}.`
    : '';

  return [opening, context, specs, logistics].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Returns the best available technical body copy for page and Product schema.
 */
export function resolveEquipmentLongDescription(equipment: Equipment) {
  if (isThinLongDescription(equipment)) {
    return buildEquipmentLongDescription(equipment);
  }
  return equipment.longDescription.trim();
}

/**
 * Whether the detail page should render the technical description section.
 */
export function hasEquipmentLongDescription(equipment: Equipment) {
  const body = resolveEquipmentLongDescription(equipment);
  return body.length > 0 && body !== equipment.shortDescription.trim();
}
