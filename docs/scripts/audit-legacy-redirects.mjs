#!/usr/bin/env node
/**
 * Audits legacy redirect coverage against WP sitemaps and optional gsc-top-urls.json.
 *
 * Usage:
 *   node docs/scripts/audit-legacy-redirects.mjs
 *   node docs/scripts/audit-legacy-redirects.mjs --gsc
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const redirectsPath = path.join(root, 'src/data/legacy-redirects.json');
const gscPath = path.join(root, 'src/data/gsc-top-urls.json');

const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
const exact = new Set(redirects.redirects.map((entry) => normalize(entry.source)));
const prefixes = redirects.prefixRedirects.map((entry) => normalize(entry.sourcePrefix));

function normalize(pathname) {
  const lower = pathname.toLowerCase();
  if (lower.length > 1 && lower.endsWith('/')) {
    return lower.slice(0, -1);
  }
  return lower;
}

function extractPath(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http')) {
    return normalize(new URL(trimmed).pathname);
  }
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return normalize(withSlash.split('?')[0]?.split('#')[0] ?? withSlash);
}

function hasRedirect(pathname) {
  if (pathname === '/') return true;
  if (exact.has(pathname)) return true;
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function fetchSitemapPaths() {
  const index = await fetch('https://acessoequipamentos.com.br/wp-sitemap.xml', {
    signal: AbortSignal.timeout(20000),
  }).then((res) => res.text());
  const childSitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.includes('-sitemap'));

  const paths = new Set();
  for (const sitemapUrl of childSitemaps) {
    const xml = await fetch(sitemapUrl, { signal: AbortSignal.timeout(20000) }).then((res) =>
      res.text(),
    );
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      paths.add(extractPath(match[1]));
    }
  }
  return [...paths].sort();
}

function loadGscPaths() {
  if (!fs.existsSync(gscPath)) {
    return [];
  }
  const data = JSON.parse(fs.readFileSync(gscPath, 'utf8'));
  return (data.urls ?? []).map((row) => extractPath(row.path ?? row.url ?? '')).filter(Boolean);
}

function audit(label, paths) {
  const unique = [...new Set(paths)];
  const missing = unique.filter((pathname) => !hasRedirect(pathname));
  const coverage = unique.length
    ? Math.round(((unique.length - missing.length) / unique.length) * 100)
    : 100;

  console.log(`\n=== ${label} ===`);
  console.log(`Total: ${unique.length} | Cobertura: ${coverage}% | Faltando: ${missing.length}`);
  if (missing.length) {
    missing.forEach((pathname) => console.log(`  - ${pathname}`));
  }
}

const useGsc = process.argv.includes('--gsc');

const sitemapPaths = await fetchSitemapPaths();
audit('WordPress sitemap (Yoast)', sitemapPaths);

if (useGsc || fs.existsSync(gscPath)) {
  audit('gsc-top-urls.json', loadGscPaths());
}

if (!useGsc) {
  console.log('\nDica: exporte o GSC, cole URLs em src/data/gsc-top-urls.json e rode com --gsc');
}

process.exit(0);
