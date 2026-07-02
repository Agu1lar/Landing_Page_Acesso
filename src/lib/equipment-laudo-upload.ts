import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  canUseVercelBlobStorage,
  uploadAdminBlobBuffer,
} from '@/lib/admin-image-upload';
import { Env, isVercelRuntime } from '@/libs/Env';

const PDF_MIME = 'application/pdf';
const MAX_PDF_BYTES = 15 * 1024 * 1024;

function slugifySafe(value: string) {
  return value.replaceAll(/[^a-z0-9-]/giu, '-').replaceAll(/-+/gu, '-').slice(0, 80);
}

/**
 * Resolves PDF MIME from file metadata or extension.
 */
export function resolveEquipmentLaudoMime(file: Pick<File, 'name' | 'type'>) {
  if (file.type === PDF_MIME) {
    return PDF_MIME;
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return PDF_MIME;
  }

  return null;
}

/**
 * Validates an uploaded equipment laudo (PDF) file.
 */
export function validateEquipmentLaudoFile(file: File) {
  const mime = resolveEquipmentLaudoMime(file);
  if (!mime) {
    return { ok: false as const, error: 'Formato inválido. Envie um arquivo PDF.' };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false as const, error: 'PDF muito grande. Máximo 15 MB.' };
  }
  return { ok: true as const, mime };
}

/**
 * Returns true when the laudo URL is hosted on this site (local path or Vercel Blob).
 */
export function isAllowedEquipmentLaudoUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) {
    return true;
  }

  if (trimmed.startsWith('/equipamentos/laudos/')) {
    return true;
  }

  if (trimmed.includes('blob.vercel-storage.com') && /\.pdf(?:\?|$)/iu.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Stores an equipment laudo PDF and returns its public URL.
 */
export async function storeEquipmentLaudo(file: File, slug?: string) {
  const validation = validateEquipmentLaudoFile(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const prefix = slug?.trim() ? slugifySafe(slug.trim()) : 'rascunho';
  const filename = `${prefix}-laudo-${Date.now()}.pdf`;
  const pathname = `equipment/laudos/${filename}`;

  if (canUseVercelBlobStorage() || isVercelRuntime()) {
    return uploadAdminBlobBuffer(pathname, buffer, validation.mime);
  }

  if (Env.NODE_ENV === 'development' || Env.NODE_ENV === 'test') {
    const uploadsDir = path.join(process.cwd(), 'public', 'equipamentos', 'laudos');
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);
    return `/equipamentos/laudos/${filename}`;
  }

  throw new Error(
    'Armazenamento de laudo não configurado. Conecte o Blob Public ao projeto na Vercel.',
  );
}
