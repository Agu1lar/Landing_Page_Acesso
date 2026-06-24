const url = process.argv[2] ?? 'https://landing-page-acesso.vercel.app/';
const maxAttempts = Number(process.argv[3] ?? 14);
const waitMs = Number(process.argv[4] ?? 30_000);

async function check() {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AcessoEquipamentos-AI-Discovery-Check/1.0' },
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  const html = await res.text();
  const headEnd = html.indexOf('</head>');
  const head = headEnd > 0 ? html.slice(0, headEnd) : '';
  const alternateLinks = [...html.matchAll(/<link[^>]*rel="alternate"[^>]*>/g)].map((m) => m[0]);
  const footerGuia = html.includes('Guia para IAs');
  const hiddenHint = /hidden[^>]*>[\s\S]*?href="\/llms\.txt"/.test(html);
  const headLlms = head.includes('llms.txt');
  const headCatalog = head.includes('catalog.json');
  const deployed = !footerGuia && hiddenHint && headLlms && alternateLinks.length >= 2;

  return {
    ok: deployed,
    footerGuiaVisible: footerGuia,
    hiddenLlmsHint: hiddenHint,
    headLlmsLink: headLlms,
    headCatalogLink: headCatalog,
    alternateLinks,
  };
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  console.log(`--- attempt ${attempt}/${maxAttempts} ---`);
  const result = await check();
  console.log(JSON.stringify(result, null, 2));
  if (result.ok) {
    console.log('DEPLOY_READY');
    process.exit(0);
  }
  if (attempt < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

console.log('TIMEOUT_WAITING_DEPLOY');
process.exit(2);
