const checks = [
  ['Webflow', /webflow/i],
  ['WordPress', /wp-content|wordpress/i],
  ['Next.js', /_next\/static|__NEXT_DATA__/i],
  ['GTM', /googletagmanager\.com/i],
  ['GA4 gtag', /googletagmanager\.com\/gtag|gtag\(/i],
  ['PostHog', /posthog/i],
  ['Hotjar', /hotjar/i],
  ['HubSpot', /hubspot/i],
  ['RD Station', /rdstation/i],
  ['Cookie consent', /cookie|onetrust|cookiebot/i],
  ['Portal do cliente', /portal do cliente|portal-cliente|já é cliente/i],
  ['Newsletter', /newsletter/i],
  ['Telemetria (page)', /telemetria/i],
  ['Product finder wizard', /encontre a plataforma ideal|qual altura do trabalho/i],
  ['State/city quote form', /selecione o estado|carregando estados/i],
  ['CNPJ field', /cnpj/i],
  ['Blog/revista', /blog mills|revista digital|uP/i],
  ['FAQ accordion', /dúvidas frequentes/i],
  ['Local SEO branches', /ver todas as filiais|aluguel de plataformas elevatórias em/i],
  ['Schema.org JSON-LD', /application\/ld\+json/i],
  ['llms.txt hint', /llms\.txt/i],
  ['catalog.json hint', /catalog\.json/i],
  ['Google One Tap', /google.*one.?tap|gsi\/client/i],
  ['WhatsApp CTA', /whatsapp/i],
  ['Quote cart', /adicionar ao orçamento|quote/i],
  ['Equipment search', /busca|search/i],
];

async function inspect(url, label) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechCompare/1.0)' },
  });
  const html = await res.text();
  const head = html.slice(0, Math.max(0, html.indexOf('</head>')));

  console.log(`\n=== ${label} (${url}) ===`);
  console.log(`status: ${res.status} | html size: ${html.length}`);

  for (const [name, re] of checks) {
    console.log(`  ${name}: ${re.test(html) ? 'yes' : 'no'}`);
  }

  const scriptSrc = [...head.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  console.log('  head scripts:', scriptSrc.slice(0, 8).join('\n    ') || '(none)');
}

await inspect('https://landing-page-acesso.vercel.app/', 'Acesso');
await inspect('https://www.mills.com.br/', 'Mills');
