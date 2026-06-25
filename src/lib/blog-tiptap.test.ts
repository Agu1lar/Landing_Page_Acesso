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
});
