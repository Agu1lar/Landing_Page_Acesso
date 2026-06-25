import { describe, expect, it } from 'vitest';
import { renderBlogContentHtml } from '@/lib/blog-tiptap';

describe('render blog article html', () => {
  it('escapes script tags in paragraph text', () => {
    const html = renderBlogContentHtml({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '<script>alert(1)</script>' }],
        },
      ],
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders external links with href attribute', () => {
    const html = renderBlogContentHtml({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Saiba mais',
              marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }],
            },
          ],
        },
      ],
    });

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('Saiba mais');
  });
});
