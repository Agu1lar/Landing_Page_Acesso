/**
 * Machine-readable hints in the HTML body for AI crawlers — not shown in the public UI.
 * Complements `/llms.txt`, sitemap and `<link rel="alternate">` in the document head.
 */
export function AiDiscoveryCrawlerHints() {
  return (
    <div hidden>
      <a href="/llms.txt">llms.txt</a>
      <a href="/catalog.json">catalog.json</a>
    </div>
  );
}
