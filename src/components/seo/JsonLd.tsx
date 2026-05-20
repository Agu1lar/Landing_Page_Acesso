type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders schema.org JSON-LD for crawlers (single object or @graph).
 */
export function JsonLd(props: JsonLdProps) {
  const payload = Array.isArray(props.data)
    ? { '@context': 'https://schema.org', '@graph': props.data }
    : props.data;

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires inline script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
      type="application/ld+json"
    />
  );
}
