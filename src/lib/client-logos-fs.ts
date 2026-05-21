import fs from 'node:fs';
import path from 'node:path';
import { CLIENT_LOGO_SEGMENTS, type ClientLogoSegment } from '@/data/client-logos';

const LOGO_EXTENSIONS = new Set(['.webp', '.png', '.svg', '.jpg', '.jpeg']);

export type SegmentLogoFile = {
  fileName: string;
  src: string;
  alt: string;
};

/**
 * Builds a readable alt text from a logo file name.
 *
 * @param fileName - File name with extension under public/clientes/{segment}/.
 * @returns Alt text for the image element.
 */
function altFromFileName(fileName: string) {
  const base = path.basename(fileName, path.extname(fileName));
  return base.replaceAll(/[-_]+/gu, ' ').trim();
}

/**
 * Lists logo files for one sector folder under public/clientes.
 *
 * @param segment - Sector directory name.
 * @returns Sorted logo entries with public URLs.
 */
export function listSegmentLogoFiles(segment: ClientLogoSegment): SegmentLogoFile[] {
  const directory = path.join(process.cwd(), 'public', 'clientes', segment);

  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => LOGO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((fileName) => ({
      fileName,
      src: `/clientes/${segment}/${fileName}`,
      alt: altFromFileName(fileName),
    }));
}

/**
 * Loads all client logos from every sector folder into one sorted list.
 *
 * @returns Logos discovered on disk at build/request time (no sector grouping).
 */
export function getAllClientLogos() {
  return CLIENT_LOGO_SEGMENTS.flatMap((segment) => listSegmentLogoFiles(segment)).sort((a, b) =>
    a.alt.localeCompare(b.alt, 'pt-BR'),
  );
}
