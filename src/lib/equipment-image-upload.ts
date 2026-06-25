import { storeAdminImage } from '@/lib/admin-image-upload';

export { validateAdminImageFile as validateEquipmentImageFile } from '@/lib/admin-image-upload';

/**
 * Stores an equipment image and returns its public URL.
 */
export async function storeEquipmentImage(file: File, slug?: string) {
  return storeAdminImage(file, { folder: 'equipment', slug });
}
