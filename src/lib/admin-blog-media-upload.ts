import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  canUseVercelBlobStorage,
  storeAdminImage,
  uploadAdminBlobBuffer,
  validateAdminImageFile,
} from '@/lib/admin-image-upload';
import { Env, isVercelRuntime } from '@/libs/Env';

const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function extensionForVideoMime(mime: string) {
  if (mime === 'video/webm') {
    return 'webm';
  }
  return 'mp4';
}

function slugifySafe(value: string) {
  return value.replaceAll(/[^a-z0-9-]/giu, '-').replaceAll(/-+/gu, '-').slice(0, 80);
}

/**
 * Resolves video MIME from file metadata or extension.
 */
export function resolveAdminVideoMime(file: Pick<File, 'name' | 'type'>) {
  if (file.type && VIDEO_TYPES.has(file.type)) {
    return file.type;
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'mp4') {
    return 'video/mp4';
  }
  if (ext === 'webm') {
    return 'video/webm';
  }

  return null;
}

/**
 * Validates an uploaded blog video file.
 */
export function validateAdminBlogVideoFile(file: File) {
  const mime = resolveAdminVideoMime(file);
  if (!mime) {
    return { ok: false as const, error: 'Formato inválido. Use MP4 ou WebM.' };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { ok: false as const, error: 'Vídeo muito grande. Máximo 50 MB.' };
  }
  return { ok: true as const, mime };
}

type StoreBlogMediaOptions = {
  slug?: string;
};

/**
 * Stores a blog image or video upload and returns its public URL.
 */
export async function storeAdminBlogMedia(file: File, options: StoreBlogMediaOptions) {
  const imageValidation = validateAdminImageFile(file);
  if (imageValidation.ok) {
    return storeAdminImage(file, { folder: 'blog', slug: options.slug });
  }

  const videoValidation = validateAdminBlogVideoFile(file);
  if (!videoValidation.ok) {
    throw new Error(videoValidation.error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const prefix = options.slug?.trim() ? slugifySafe(options.slug.trim()) : 'rascunho';
  const ext = extensionForVideoMime(videoValidation.mime);
  const filename = `${prefix}-video-${Date.now()}.${ext}`;
  const pathname = `blog/${filename}`;

  if (canUseVercelBlobStorage() || isVercelRuntime()) {
    return uploadAdminBlobBuffer(pathname, buffer, videoValidation.mime);
  }

  if (Env.NODE_ENV === 'development' || Env.NODE_ENV === 'test') {
    const uploadsDir = path.join(process.cwd(), 'public', 'blog', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);
    return `/blog/uploads/${filename}`;
  }

  throw new Error(
    'Armazenamento de vídeo não configurado. Conecte o Blob Public ao projeto na Vercel.',
  );
}

/**
 * Validates blog media (image or video) before upload.
 */
export function validateAdminBlogMediaFile(file: File) {
  const image = validateAdminImageFile(file);
  if (image.ok) {
    return image;
  }
  return validateAdminBlogVideoFile(file);
}
