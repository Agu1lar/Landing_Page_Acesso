import type { Equipment } from '@/types/equipment';

function findWorkHeightSpec(equipment: Equipment) {
  return equipment.specs.find((spec) =>
    spec.label.toLocaleLowerCase('pt-BR').startsWith('altura de trabalho'),
  );
}

/**
 * Visible catalog card copy — includes work height for aerial platforms (no image badge).
 */
export function getEquipmentCardDescription(equipment: Equipment) {
  const base = equipment.shortDescription.trim();

  if (equipment.category !== 'plataformas-elevatorias') {
    return base;
  }

  const workHeight = findWorkHeightSpec(equipment);
  if (!workHeight?.value.trim()) {
    return base;
  }

  if (/altura de trabalho/i.test(base)) {
    return base;
  }

  const heightPhrase = `Altura de trabalho: ${workHeight.value.trim().replace(/\.\s*$/, '')}.`;

  if (!base) {
    return heightPhrase;
  }

  const separator = base.endsWith('.') ? ' ' : '. ';
  return `${base}${separator}${heightPhrase}`;
}
