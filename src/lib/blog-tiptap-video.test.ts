import { describe, expect, it } from 'vitest';
import { blogLinkAttributes } from '@/lib/blog-tiptap-extensions';
import { parseVideoEmbedUrl } from '@/lib/blog-tiptap-video';

describe('parse video embed url', () => {
  it('parses youtube watch URLs', () => {
    expect(parseVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      provider: 'youtube',
      embedSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    });
  });

  it('parses vimeo URLs', () => {
    expect(parseVideoEmbedUrl('https://vimeo.com/123456789')).toEqual({
      provider: 'vimeo',
      embedSrc: 'https://player.vimeo.com/video/123456789',
    });
  });

  it('parses direct mp4 file URLs', () => {
    const url = 'https://example.public.blob.vercel-storage.com/demo.mp4';
    expect(parseVideoEmbedUrl(url)).toEqual({
      provider: 'file',
      embedSrc: url,
    });
  });
});

describe('blog link attributes', () => {
  it('marks download links with download attribute', () => {
    expect(blogLinkAttributes({ href: '/files/catalogo.pdf', kind: 'download' })).toEqual({
      href: '/files/catalogo.pdf',
      download: 'catalogo.pdf',
      target: null,
      rel: null,
    });
  });

  it('opens external links in a new tab when requested', () => {
    expect(blogLinkAttributes({ href: 'https://example.com', kind: 'new_tab' })).toEqual({
      href: 'https://example.com',
      download: null,
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });
});
