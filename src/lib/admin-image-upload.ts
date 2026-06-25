import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';
import { Env } from '@/libs/Env';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 5 * 1024 * 1024;

function extensionForMime(mime: string) {
  if (mime === 'image/png') {
    return 'png';
  }
  if (mime === 'image/webp') {
    return 'webp';
  }
  return 'jpg';
}

function slugifySafe(value: string) {
  return value.replaceAll(/[^a-z0-9-]/giu, '-').replaceAll(/-+/gu, '-').slice(0, 80);
}

/**
 * Validates an uploaded admin image file.
 */
export function validateAdminImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false as const, error: 'Formato inválido. Use JPG, PNG ou WebP.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: 'Arquivo muito grande. Máximo 5 MB.' };
  }
  return { ok: true as const };
}

type StoreAdminImageOptions = {
  folder: 'equipment' | 'blog';
  slug?: string;
};

/**
 * Stores an admin upload and returns its public URL.
 */
export async function storeAdminImage(file: File, options: StoreAdminImageOptions) {
  const validation = validateAdminImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionForMime(file.type);
  const prefix = options.slug?.trim() ? slugifySafe(options.slug.trim()) : 'rascunho';
  const filename = `${prefix}-${Date.now()}.${ext}`;

  if (Env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${options.folder}/${filename}`, buffer, {
      access: 'public',
      token: Env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });
    return blob.url;
  }

  const localFolder = options.folder === 'blog' ? 'blog' : 'equipamentos';
  const uploadsDir = path.join(process.cwd(), 'public', localFolder, 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/${localFolder}/uploads/${filename}`;
}
