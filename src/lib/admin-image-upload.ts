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
 * Returns true when Vercel Blob is configured (token or store on Vercel deploy).
 */
export function canUseVercelBlobStorage() {
  if (Env.BLOB_READ_WRITE_TOKEN) {
    return true;
  }

  return Boolean(Env.BLOB_STORE_ID && Env.VERCEL_ENV);
}

function blobAccessMismatchMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (!/private store|public access on a private store/iu.test(message)) {
    return null;
  }

  return (
    'O projeto ainda usa o Blob Private. Na Vercel: desconecte o store Private do projeto, ' +
    'conecte o store Public, apague BLOB_READ_WRITE_TOKEN (se existir — ela aponta para o store antigo), ' +
    'confira BLOB_STORE_ID do store Public e faça redeploy.'
  );
}

function shouldUseExplicitBlobToken() {
  if (!Env.BLOB_READ_WRITE_TOKEN) {
    return false;
  }

  // On Vercel deploy, prefer OIDC + BLOB_STORE_ID over a stale read-write token.
  if (Env.VERCEL_ENV && Env.BLOB_STORE_ID) {
    return false;
  }

  return true;
}

async function uploadToVercelBlob(pathname: string, buffer: Buffer, contentType: string) {
  const access = Env.BLOB_ACCESS;

  if (access === 'private') {
    throw new Error(
      'BLOB_ACCESS=private não serve fotos públicas do site. Crie um Blob Public na Vercel e deixe BLOB_ACCESS=public.',
    );
  }

  const options: {
    access: 'public' | 'private';
    contentType: string;
    storeId?: string;
    token?: string;
  } = {
    access,
    contentType,
  };

  if (Env.BLOB_STORE_ID) {
    options.storeId = Env.BLOB_STORE_ID;
  }

  if (shouldUseExplicitBlobToken()) {
    options.token = Env.BLOB_READ_WRITE_TOKEN;
  }

  try {
    const blob = await put(pathname, buffer, options);
    return blob.url;
  } catch (error) {
    const friendly = blobAccessMismatchMessage(error);
    if (friendly) {
      throw new Error(friendly);
    }
    throw error;
  }
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
  const pathname = `${options.folder}/${filename}`;

  if (canUseVercelBlobStorage()) {
    return uploadToVercelBlob(pathname, buffer, validation.mime);
  }

  if (!canPersistAdminImagesLocally()) {
    throw new Error(
      'Armazenamento de imagens não configurado. Conecte um Blob store ao projeto na Vercel ou adicione BLOB_READ_WRITE_TOKEN.',
    );
  }

  const localFolder = options.folder === 'blog' ? 'blog' : 'equipamentos';
  const uploadsDir = path.join(process.cwd(), 'public', localFolder, 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/${localFolder}/uploads/${filename}`;
}
