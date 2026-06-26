import { describe, expect, it } from 'vitest';
import { DICAS_ARTICLES } from '@/data/dicas-articles';
import { estimateReadingMinutes, renderBlogContentHtml, sectionsToTiptapDoc } from '@/lib/blog-tiptap';

describe('sections to tiptap doc', () => {
  it('converts legacy sections into a TipTap document', () => {
    const doc = sectionsToTiptapDoc(DICAS_ARTICLES[0]!.sections);

    expect(doc.type).toBe('doc');
    expect(doc.content?.length).toBeGreaterThan(2);
    expect(doc.content?.some((node) => node.type === 'heading')).toBeTruthy();
  });
});

describe('estimate reading minutes', () => {
  it('returns at least one minute for non-empty content', () => {
    const doc = sectionsToTiptapDoc(DICAS_ARTICLES[0]!.sections);
    expect(estimateReadingMinutes(doc)).toBeGreaterThan(0);
  });
});

describe('render blog content html', () => {
  it('renders paragraphs and headings to HTML', () => {
    const doc = sectionsToTiptapDoc([
      { heading: 'Título', paragraphs: ['Parágrafo de teste.'] },
    ]);
    const html = renderBlogContentHtml(doc);

    expect(html).toContain('<h2');
    expect(html).toContain('Parágrafo de teste');
  });

  it('renders embedded youtube video blocks', () => {
    const html = renderBlogContentHtml({
      type: 'doc',
      content: [
        {
          type: 'videoEmbed',
          attrs: {
            provider: 'youtube',
            embedSrc: 'https://www.youtube.com/embed/abc12345678',
          },
        },
      ],
    });

    expect(html).toContain('data-video-embed');
    expect(html).toContain('youtube.com/embed/abc12345678');
  });

  it('renders cta button blocks', () => {
    const html = renderBlogContentHtml({
      type: 'doc',
      content: [
        {
          type: 'ctaButton',
          attrs: { href: '/orcamento', label: 'Pedir orçamento' },
        },
      ],
    });

    expect(html).toContain('data-cta-button');
    expect(html).toContain('Pedir orçamento');
    expect(html).toContain('href="/orcamento"');
  });
});
