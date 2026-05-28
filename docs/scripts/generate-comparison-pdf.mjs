import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = import.meta.dirname;
const htmlPath = path.resolve(__dirname, '../APRESENTACAO-LANDING-vs-SITE-ATUAL.html');
const pdfPath = path.resolve(__dirname, '../APRESENTACAO-LANDING-vs-SITE-ATUAL.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`file:///${htmlPath.replaceAll(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' },
});
await browser.close();

console.log(`PDF gerado: ${pdfPath}`);
