import path from 'node:path';
import type { SegmentLogoFile } from '@/lib/client-logos-fs';

const EXTENSION_PRIORITY: Record<string, number> = {
  '.webp': 0,
  '.png': 1,
  '.svg': 2,
  '.jpeg': 3,
  '.jpg': 4,
};

/**
 * Normalizes a logo file name to detect duplicates across sector folders.
 *
 * @param fileName - File name with extension.
 * @returns Stable deduplication key.
 */
export function dedupeKeyFromFileName(fileName: string) {
  const base = path.basename(fileName, path.extname(fileName));

  return base
    .replace(/\s*\(\d+\)\s*/gu, ' ')
    .replace(/\blogo\b/giu, ' ')
    .replaceAll(/[-_]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function extensionRank(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return EXTENSION_PRIORITY[extension] ?? 99;
}

/**
 * Keeps one logo per company name, preferring webp/png over jpg.
 *
 * @param logos - Raw logos from all sector folders.
 * @returns Deduplicated list preserving first-seen sort order by key.
 */
export function dedupeClientLogos(logos: SegmentLogoFile[]) {
  const byKey = new Map<string, SegmentLogoFile>();

  for (const logo of logos) {
    const key = dedupeKeyFromFileName(logo.fileName);
    const existing = byKey.get(key);

    if (!existing || extensionRank(logo.fileName) < extensionRank(existing.fileName)) {
      byKey.set(key, logo);
    }
  }

  const seen = new Set<string>();
  const result: SegmentLogoFile[] = [];

  for (const logo of logos) {
    const key = dedupeKeyFromFileName(logo.fileName);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(byKey.get(key)!);
  }

  return result;
}
