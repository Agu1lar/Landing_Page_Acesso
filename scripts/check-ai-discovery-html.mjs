const url = process.argv[2] ?? 'https://landing-page-acesso.vercel.app/';

const res = await fetch(url, {
  headers: { 'User-Agent': 'AcessoEquipamentos-AI-Discovery-Check/1.0' },
});
const html = await res.text();
const headEnd = html.indexOf('</head>');
const head = headEnd > 0 ? html.slice(0, headEnd) : '';
const footStart = html.indexOf('<footer');
const footer = footStart >= 0 ? html.slice(footStart, footStart + 12_000) : '';

const footerLinkVisible = footer.includes('/llms.txt');
const headAlternate =
  head.includes('rel="alternate"') && head.includes('llms.txt') && head.includes('catalog.json');
const hiddenHint = /hidden[^>]*>[\s\S]*?href="\/llms\.txt"/.test(html);
const i18nOnly = html.includes('Guia para IAs') && !footerLinkVisible;

console.log(JSON.stringify({
  url,
  status: res.status,
  footerLinkVisible,
  headAlternate,
  hiddenHint,
  i18nBundleOnly: i18nOnly,
  alternateLinks: [...html.matchAll(/<link[^>]*rel="alternate"[^>]*>/g)].map((m) => m[0]),
}, null, 2));

const llms = await fetch(new URL('/llms.txt', url));
const llmsText = await llms.text();
console.log('\nllms.txt:', llms.status, llmsText.slice(0, 100).replace(/\n/g, ' '));
