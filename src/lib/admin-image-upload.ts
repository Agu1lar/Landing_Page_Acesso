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
 * Resolves MIME type from file metadata or extension (Windows often omits file.type).
 */
export function resolveAdminImageMime(file: Pick<File, 'name' | 'type'>) {
  if (file.type && ALLOWED_TYPES.has(file.type)) {
    return file.type;
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') {
    return 'image/jpeg';
  }
  if (ext === 'png') {
    return 'image/png';
  }
  if (ext === 'webp') {
    return 'image/webp';
  }

  return null;
}

/**
 * Validates an uploaded admin image file.
 */
export function validateAdminImageFile(file: File) {
  const mime = resolveAdminImageMime(file);
  if (!mime) {
    return { ok: false as const, error: 'Formato inválido. Use JPG, PNG ou WebP.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: 'Arquivo muito grande. Máximo 5 MB.' };
  }
  return { ok: true as const, mime };
}

type StoreAdminImageOptions = {
  folder: 'equipment' | 'blog';
  slug?: string;
};

function canPersistAdminImagesLocally() {
  return Env.NODE_ENV === 'development' || Env.NODE_ENV === 'test';
}

/**
 * Stores an admin upload and returns its public URL.
 */
export async function storeAdminImage(file: File, options: StoreAdminImageOptions) {
  const validation = validateAdminImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionForMime(validation.mime);
  const prefix = options.slug?.trim() ? slugifySafe(options.slug.trim()) : 'rascunho';
  const filename = `${prefix}-${Date.now()}.${ext}`;

  if (Env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${options.folder}/${filename}`, buffer, {
      access: 'public',
      token: Env.BLOB_READ_WRITE_TOKEN,
      contentType: validation.mime,
    });
    return blob.url;
  }

  if (!canPersistAdminImagesLocally()) {
    throw new Error(
      'Armazenamento de imagens não configurado. Adicione BLOB_READ_WRITE_TOKEN no ambiente.',
    );
  }

  const localFolder = options.folder === 'blog' ? 'blog' : 'equipamentos';
  const uploadsDir = path.join(process.cwd(), 'public', localFolder, 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/${localFolder}/uploads/${filename}`;
}
