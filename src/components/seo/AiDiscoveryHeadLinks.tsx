import { getBaseUrl } from '@/utils/Helpers';

/** Explicit head links for AI crawlers (metadata alternates.types is not always emitted in HTML). */
export function AiDiscoveryHeadLinks() {
  const baseUrl = getBaseUrl();

  return (
    <>
      <link
        href={`${baseUrl}/llms.txt`}
        rel="alternate"
        title="LLM site guide"
        type="text/plain"
      />
      <link
        href={`${baseUrl}/catalog.json`}
        rel="alternate"
        title="Public equipment catalog"
        type="application/json"
      />
    </>
  );
}
