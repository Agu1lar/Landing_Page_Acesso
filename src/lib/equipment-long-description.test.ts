import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import equipmentData from '@/data/equipamentos.json';
import {
  buildEquipmentLongDescription,
  isThinLongDescription,
  resolveEquipmentLongDescription,
} from '@/lib/equipment-long-description';
import type { Equipment } from '@/types/equipment';

const betoneira: Equipment = {
  slug: 'betoneira',
  name: 'Betoneira',
  category: 'ferramentas-eletricas',
  shortDescription: 'Locação de betoneira.',
  longDescription:
    'Betoneira: Equipamento para concretagem e misturas em obra civil. Aplicação em fundações, lajes e serviços de alvenaria. Entrega e retirada combinadas com a locação.',
  specs: [
    { label: 'Aplicação', value: 'Concretagem, argamassa e misturas' },
    { label: 'Alimentação', value: '220 V monofásica (conforme modelo)' },
  ],
  tags: [],
  featured: true,
  available: true,
};

const hb1430: Equipment = {
  slug: 'plataforma-elevatoria-hb-1430',
  name: 'Plataforma elevatória HB 1430',
  category: 'plataformas-elevatorias',
  shortDescription: 'Locação de Plataforma elevatória HB 1430.',
  longDescription:
    'Tesoura elétrica Hy-Brid HB 1430 para trabalho em altura em ambientes internos e lajes. Altura de trabalho em torno de 6 m, ideal para manutenção predial e montagens leves na região metropolitana de BH.',
  specs: [{ label: 'Altura de trabalho', value: '~6,1 m (20 ft)' }],
  tags: [],
  featured: true,
  available: true,
};

describe('is thin long description', () => {
  it('flags generic template copy as thin', () => {
    expect(isThinLongDescription(betoneira)).toBe(true);
  });

  it('keeps rich aerial platform copy', () => {
    expect(isThinLongDescription(hb1430)).toBe(false);
  });
});

describe('resolve equipment long description', () => {
  it('enriches thin catalog copy with specs and service area', () => {
    const body = resolveEquipmentLongDescription(betoneira);

    expect(body.length).toBeGreaterThan(220);
    expect(body).toContain('Características técnicas');
    expect(body).toContain('Contagem');
    expect(body).not.toBe(betoneira.shortDescription);
  });

  it('preserves already rich longDescription', () => {
    expect(resolveEquipmentLongDescription(hb1430)).toBe(hb1430.longDescription);
  });

  it('builds distinct copy from meta-oriented shortDescription', () => {
    const enriched = buildEquipmentLongDescription(betoneira);

    expect(enriched).not.toContain('Entrega e retirada combinadas com a locação');
    expect(enriched).toContain('Betoneira');
  });
});

describe('catalog enrichment script', () => {
  it('writes equipamentos.json when ENRICH_CATALOG=1', () => {
    if (process.env.ENRICH_CATALOG !== '1') {
      return;
    }

    const catalog = equipmentData as Equipment[];
    let changed = 0;
    const next = catalog.map((item) => {
      if (!isThinLongDescription(item)) {
        return item;
      }
      changed += 1;
      return {
        ...item,
        longDescription: resolveEquipmentLongDescription(item),
      };
    });

    writeFileSync(resolve('src/data/equipamentos.json'), `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    expect(changed).toBe(catalog.filter(isThinLongDescription).length);
  });
});
