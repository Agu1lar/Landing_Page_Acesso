type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders schema.org JSON-LD for crawlers and social previews.
 */
export function JsonLd(props: JsonLdProps) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires inline script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(props.data) }}
      type="application/ld+json"
    />
  );
}
