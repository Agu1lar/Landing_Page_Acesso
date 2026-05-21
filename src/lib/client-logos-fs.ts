import fs from 'node:fs';
import path from 'node:path';
import {
  CLIENT_LOGO_SEGMENTS,
  type ClientLogoSegment,
  type ClientLogoSegmentConfig,
} from '@/data/client-logos';

const LOGO_EXTENSIONS = new Set(['.webp', '.png', '.svg', '.jpg', '.jpeg']);

export type SegmentLogoFile = {
  fileName: string;
  src: string;
  alt: string;
};

export type ClientLogoSegmentGroup = ClientLogoSegmentConfig & {
  logos: SegmentLogoFile[];
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
 * Loads all sector groups that contain at least one logo file.
 *
 * @returns Sector metadata with logos discovered on disk at build/request time.
 */
export function getClientLogoSegmentGroups() {
  return CLIENT_LOGO_SEGMENTS.map((segment) => ({
    ...segment,
    logos: listSegmentLogoFiles(segment.id),
  })).filter((group) => group.logos.length > 0);
}
