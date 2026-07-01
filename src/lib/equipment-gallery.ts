export type EquipmentGalleryImage = {
  src: string;
  alt: string;
};

type SortableGalleryRow = {
  id: number;
  isPrimary: boolean;
  sortOrder: number;
};

/**
 * Orders gallery rows with primary first, then sort order and id.
 */
export function sortEquipmentGalleryRows<T extends SortableGalleryRow>(rows: T[]) {
  return [...rows].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.id - right.id;
  });
}

/**
 * Returns the next gallery index, wrapping at the ends.
 */
export function nextGalleryIndex(current: number, total: number, direction: 'next' | 'prev') {
  if (total <= 1) {
    return 0;
  }

  if (direction === 'next') {
    return (current + 1) % total;
  }

  return (current - 1 + total) % total;
}
