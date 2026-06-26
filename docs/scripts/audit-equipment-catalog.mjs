#!/usr/bin/env node
/**
 * Varredura do catálogo: JSON vs Postgres, filtros de plataforma, slugs legados.
 *
 * Usage:
 *   node docs/scripts/audit-equipment-catalog.mjs
 *   dotenv -c -- node docs/scripts/audit-equipment-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function loadAuditModule() {
  const candidates = [
    path.join(root, 'src/lib/equipment-catalog-audit.ts'),
    path.join(root, '.next/server/chunks/equipment-catalog-audit.js'),
  ];

  if (fs.existsSync(candidates[0])) {
    const { register } = await import('node:module');
    register('tsx/esm', pathToFileURL('./'));
    return import(pathToFileURL(candidates[0]).href);
  }

  throw new Error('Não foi possível carregar equipment-catalog-audit.ts (instale tsx ou rode via vitest).');
}

async function loadDbSlugs() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    return null;
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const result = await client.query('select slug from equipment');
    return new Set(result.rows.map((row) => String(row.slug)));
  } finally {
    await client.end();
  }
}

async function main() {
  let auditModule;
  try {
    auditModule = await loadAuditModule();
  } catch {
    const json = JSON.parse(
      fs.readFileSync(path.join(root, 'src/data/equipamentos.json'), 'utf8'),
    );
    console.log('DATABASE_URL ausente ou tsx indisponível — auditoria só JSON.\n');
    console.log(`Total JSON: ${json.length}`);
    console.log('\nRode: npm run test -- src/lib/equipment-catalog-audit.test.ts');
    console.log('Ou: dotenv -c -- node docs/scripts/audit-equipment-catalog.mjs');
    process.exit(0);
  }

  const dbSlugs = await loadDbSlugs();
  const report = auditModule.auditEquipmentCatalog({ dbSlugs: dbSlugs ?? undefined });
  console.log(auditModule.formatCatalogAuditReport(report));

  const blocking =
    report.byCode.json_only.length +
    report.byCode.platform_missing_kind.length +
    report.byCode.platform_missing_height.length +
    report.byCode.featured_missing.length;

  process.exit(blocking > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
