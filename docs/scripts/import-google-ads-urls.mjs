#!/usr/bin/env node
/**
 * Audits Google Ads "Relatório de anúncios" CSV (URL final column).
 *
 * Usage:
 *   node docs/scripts/import-google-ads-urls.mjs "c:/path/Relatório de anúncios.csv"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const redirectsPath = path.join(root, 'src/data/legacy-redirects.json');
const outputPath = path.join(root, 'src/data/google-ads-landing-urls.json');

const csvFile = process.argv[2];
if (!csvFile) {
  console.error('Informe o CSV do Google Ads.');
  process.exit(1);
}

const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
const exact = new Set(redirects.redirects.map((entry) => normalize(entry.source)));
const prefixes = redirects.prefixRedirects.map((entry) => normalize(entry.sourcePrefix));
const officialHost = 'acessoequipamentos.com.br';

function normalize(pathname) {
  const lower = pathname.toLowerCase();
  if (lower.length > 1 && lower.endsWith('/')) {
    return lower.slice(0, -1);
  }
  return lower;
}

function auditPath(host, pathname) {
  if (host !== officialHost) {
    return 'external_domain';
  }
  if (pathname === '/') {
    return 'live_home';
  }
  if (exact.has(pathname)) {
    return 'redirect_mapped';
  }
  if (prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return 'redirect_prefix';
  }
  return 'missing_redirect';
}

function suggestDestination(pathname) {
  if (pathname.includes('guindaste') || pathname.includes('munck') || pathname.includes('manipulador')) {
    return '/equipamentos/guindaste-industrial-munck-remocao-bh';
  }
  if (pathname.includes('plataforma') || pathname.includes('elevatoria')) {
    return '/categorias/equipamentos-aereos';
  }
  if (pathname.includes('martelete')) {
    return '/categorias/demolicao-perfuracao';
  }
  return '/equipamentos';
}

function readExportFile(filePath) {
  const buffer = fs.readFileSync(path.resolve(filePath));
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return buffer.toString('utf16le').replace(/^\uFEFF/u, '');
  }
  if (buffer.includes(0)) {
    return buffer.toString('utf16le').replace(/^\uFEFF/u, '');
  }
  return buffer.toString('utf8').replace(/^\uFEFF/u, '');
}

function parseRow(line) {
  return line.split('\t').map((cell) => cell.replace(/\u0000/g, '').trim());
}

const raw = readExportFile(csvFile);
const lines = raw.split(/\r?\n/u).filter(Boolean);

let headerIndex = -1;
let headers = [];
let urlColumn = -1;
let imprColumn = -1;
let interColumn = -1;

for (let i = 0; i < lines.length; i += 1) {
  const cells = parseRow(lines[i]);
  const urlIdx = cells.findIndex((cell) => cell.trim() === 'URL final');
  if (urlIdx >= 0) {
    headerIndex = i;
    headers = cells;
    urlColumn = urlIdx;
    imprColumn = cells.findIndex((cell) => cell.trim() === 'Impr.');
    interColumn = cells.findIndex((cell) => cell.trim() === 'Interações');
    break;
  }
}

if (headerIndex === -1) {
  console.error('Coluna "URL final" não encontrada no CSV.');
  process.exit(1);
}

const byUrl = new Map();

for (const line of lines.slice(headerIndex + 1)) {
  if (line.startsWith('Total:')) {
    break;
  }
  const cells = parseRow(line);
  const urlRaw = (cells[urlColumn] ?? '').trim();
  if (!urlRaw.startsWith('http')) {
    continue;
  }

  const url = new URL(urlRaw);
  const pathname = normalize(url.pathname);
  const impressions = Number.parseInt((cells[imprColumn] ?? '0').replace(/\D/g, ''), 10) || 0;
  const interactions = Number.parseInt((cells[interColumn] ?? '0').replace(/\D/g, ''), 10) || 0;
  const status = auditPath(url.hostname, pathname);

  const key = urlRaw;
  const prev = byUrl.get(key) ?? {
    url: urlRaw,
    host: url.hostname,
    path: pathname,
    status,
    suggestedDestination: status === 'missing_redirect' ? suggestDestination(pathname) : null,
    impressions: 0,
    interactions: 0,
  };
  prev.impressions += impressions;
  prev.interactions += interactions;
  byUrl.set(key, prev);
}

const rows = [...byUrl.values()].sort((a, b) => b.impressions - a.impressions);
const missing = rows.filter((row) => row.status === 'missing_redirect');
const external = rows.filter((row) => row.status === 'external_domain');
const official = rows.filter((row) => row.host === officialHost);
const officialOk = official.filter((row) => row.status !== 'missing_redirect');

const report = {
  updatedAt: new Date().toISOString().slice(0, 10),
  source: path.basename(csvFile),
  periodNote: lines[1] ?? '',
  summary: {
    uniqueLandingUrls: rows.length,
    officialDomainUrls: official.length,
    officialCovered: officialOk.length,
    missingRedirects: missing.length,
    externalDomainAds: external.length,
  },
  actionRequired: external.map((row) => ({
    url: row.url,
    impressions: row.impressions,
    fix: 'Atualizar URL final no Google Ads para https://acessoequipamentos.com.br/categorias/equipamentos-aereos (ou página equivalente no site novo)',
  })),
  urls: rows,
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`URLs únicas: ${rows.length}`);
console.log(`Domínio oficial cobertas: ${officialOk.length}/${official.length}`);
console.log(`Redirects faltando: ${missing.length}`);
console.log(`Anúncios em outro domínio: ${external.length}`);

if (external.length) {
  console.log('\n⚠ Ação manual no Google Ads:');
  for (const row of external) {
    console.log(`  - ${row.url} (${row.impressions} impr.)`);
  }
}

if (missing.length) {
  console.log('\nAdicionar em legacy-redirects.json:');
  for (const row of missing) {
    console.log(JSON.stringify({ source: row.path, destination: row.suggestedDestination }, null, 2));
  }
}

console.log(`\nRelatório salvo em ${outputPath}`);
