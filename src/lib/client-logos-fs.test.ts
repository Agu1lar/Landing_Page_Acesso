import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllClientLogos, listSegmentLogoFiles } from '@/lib/client-logos-fs';

describe('list segment logo files', () => {
  let tempRoot = '';
  let previousCwd = '';

  beforeEach(() => {
    previousCwd = process.cwd();
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'client-logos-'));
    vi.spyOn(process, 'cwd').mockReturnValue(tempRoot);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(previousCwd);
    fs.rmSync(tempRoot, { force: true, recursive: true });
  });

  it('returns public paths for supported image extensions', () => {
    const segmentDir = path.join(tempRoot, 'public', 'clientes', 'mineracao');
    fs.mkdirSync(segmentDir, { recursive: true });
    fs.writeFileSync(path.join(segmentDir, 'vale.webp'), '');
    fs.writeFileSync(path.join(segmentDir, 'notas.txt'), 'skip');

    const logos = listSegmentLogoFiles('mineracao');

    expect(logos).toHaveLength(1);
    expect(logos[0]?.src).toBe('/clientes/mineracao/vale.webp');
    expect(logos[0]?.alt).toBe('vale');
  });

  it('sorts files alphabetically', () => {
    const segmentDir = path.join(tempRoot, 'public', 'clientes', 'construcao');
    fs.mkdirSync(segmentDir, { recursive: true });
    fs.writeFileSync(path.join(segmentDir, 'zebra.png'), '');
    fs.writeFileSync(path.join(segmentDir, 'alpha.png'), '');

    const logos = listSegmentLogoFiles('construcao');

    expect(logos.map((logo) => logo.fileName)).toEqual(['alpha.png', 'zebra.png']);
  });

  it('merges logos from all sector folders into one list', () => {
    const mineracaoDir = path.join(tempRoot, 'public', 'clientes', 'mineracao');
    const varejoDir = path.join(tempRoot, 'public', 'clientes', 'varejo');
    fs.mkdirSync(mineracaoDir, { recursive: true });
    fs.mkdirSync(varejoDir, { recursive: true });
    fs.writeFileSync(path.join(mineracaoDir, 'vale.webp'), '');
    fs.writeFileSync(path.join(varejoDir, 'mart.webp'), '');

    const logos = getAllClientLogos();

    expect(logos).toHaveLength(2);
    expect(logos.map((logo) => logo.src).sort()).toEqual([
      '/clientes/mineracao/vale.webp',
      '/clientes/varejo/mart.webp',
    ]);
  });
});
