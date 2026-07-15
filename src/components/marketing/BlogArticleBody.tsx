import type { JSONContent } from '@tiptap/core';
import { renderBlogContentHtml } from '@/lib/blog-tiptap';

type BlogArticleBodyProps = {
  content: JSONContent;
};

/**
 * Renders TipTap article body on public blog pages.
 */
export function BlogArticleBody(props: BlogArticleBodyProps) {
  const html = renderBlogContentHtml(props.content);

  return (
    <div
      className={[
        'prose prose-neutral max-w-none',
        'prose-headings:font-heading prose-headings:scroll-mt-28 prose-headings:text-neutral-900',
        'prose-h2:mt-14 prose-h2:mb-4 prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-3 prose-h2:text-2xl',
        'prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-xl',
        'prose-p:text-neutral-700 prose-p:leading-relaxed prose-p:text-[1.05rem]',
        'prose-li:text-neutral-700 prose-li:leading-relaxed',
        'prose-ul:my-6 prose-ol:my-6',
        'prose-a:text-primary prose-a:font-medium',
        'prose-blockquote:my-8 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-neutral-50',
        'prose-blockquote:py-3 prose-blockquote:pr-4 prose-blockquote:pl-5 prose-blockquote:not-italic',
        'prose-blockquote:text-neutral-700',
        'prose-figure:my-10 prose-figcaption:mt-0',
        '[&_a[data-cta-button]]:my-8 [&_a[data-cta-button]]:no-underline',
        '[&_div[data-video-embed]]:my-10',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
