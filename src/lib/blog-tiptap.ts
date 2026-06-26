import type { JSONContent } from '@tiptap/core';
import { generateHTML } from '@tiptap/html';
import { createBlogTiptapExtensions } from '@/lib/blog-tiptap-extensions';

const renderExtensions = createBlogTiptapExtensions();

/**
 * Converts legacy section paragraphs into a TipTap document.
 */
export function sectionsToTiptapDoc(sections: { heading?: string; paragraphs: string[] }[]): JSONContent {
  const content: JSONContent[] = [];

  for (const section of sections) {
    if (section.heading) {
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: section.heading }],
      });
    }

    for (const paragraph of section.paragraphs) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: paragraph }],
      });
    }
  }

  return { type: 'doc', content };
}

/**
 * Estimates reading time from TipTap JSON (words ÷ 200).
 */
export function estimateReadingMinutes(doc: JSONContent) {
  const text = extractPlainText(doc);
  const words = text.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function extractPlainText(node: JSONContent): string {
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }

  if (!node.content?.length) {
    return '';
  }

  return node.content.map(extractPlainText).join(' ');
}

/**
 * Renders TipTap JSON to sanitized HTML for public pages.
 */
export function renderBlogContentHtml(doc: JSONContent) {
  return generateHTML(doc, renderExtensions);
}

/**
 * Empty TipTap document for new articles.
 */
export function emptyTiptapDoc(): JSONContent {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };
}
