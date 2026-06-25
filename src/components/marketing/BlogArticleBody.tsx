import type { JSONContent } from '@tiptap/core';
import { renderBlogContentHtml } from '@/lib/blog-tiptap';

type BlogArticleBodyProps = {
  content: JSONContent;
};

/**
 * Renders TipTap article body on public dicas pages.
 */
export function BlogArticleBody(props: BlogArticleBodyProps) {
  const html = renderBlogContentHtml(props.content);

  return (
    <div
      className="prose prose-neutral max-w-none prose-headings:font-heading prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-primary prose-blockquote:border-primary/30 prose-blockquote:text-neutral-600 prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
