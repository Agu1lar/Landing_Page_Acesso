/**
 * Normalizes equipment display names to uppercase (pt-BR), collapsing extra spaces.
 */
export function formatEquipmentName(name: string) {
  const collapsed = name.trim().replace(/\s+/gu, ' ');
  if (!collapsed) {
    return '';
  }

  return collapsed.toLocaleUpperCase('pt-BR');
}

/**
 * Applies catalog display name formatting to an equipment record.
 */
export function withFormattedEquipmentName<T extends { name: string }>(item: T) {
  return { ...item, name: formatEquipmentName(item.name) };
}
