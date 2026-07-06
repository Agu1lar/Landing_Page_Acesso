#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const databaseUrl = process.env.DATABASE_URL?.trim();
const onVercel = process.env.VERCEL === '1';
const vercelEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!databaseUrl) {
  const help = [
    'DATABASE_URL não está configurada (string vazia).',
    '',
    'O comando `npm run build` executa migrações antes do Next.js e precisa de Postgres.',
    '',
    'Vercel (Production):',
    '  1. Vercel → Project → Settings → Environment Variables',
    '  2. Adicione DATABASE_URL com a connection string do Neon (pooler recomendado)',
    '  3. Marque Production e também "Build" (não só Runtime)',
    '  4. Exemplo: postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require',
    '',
    'Local:',
    '  Copie .env.example para .env.local e preencha DATABASE_URL',
    '  Ou use `npm run dev` (PGlite na porta 5433) e `npm run build:next` sem migrate',
    '',
    'Documentação: docs/GO-LIVE-GATE.md e docs/PASSOS-MANUAIS.md',
  ].join('\n');

  if (onVercel && vercelEnv === 'production') {
    fail(`ERROR: ${help}`);
  }

  if (onVercel) {
    console.warn('Aviso: pulando db:migrate no deploy Preview (DATABASE_URL ausente).');
    console.warn('Use `npm run build:next` em Preview ou configure DATABASE_URL na Vercel.');
    process.exit(0);
  }

  fail(`ERROR: ${help}`);
}

const result = spawnSync('npx', ['drizzle-kit', 'migrate'], {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
