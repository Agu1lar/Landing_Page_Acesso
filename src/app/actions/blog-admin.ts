'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logAdminActivity } from '@/lib/admin-activity';
import { adminListFiltersSuffix, blogAdminListPath, returnPathFromFormData } from '@/lib/admin-return-path';
import { requireDashboardAccess } from '@/lib/auth-roles';
import {
  getBlogArticleAdminById,
  isBlogSlugAvailable,
  publishBlogArticleBySlug,
  saveBlogArticle,
  unpublishBlogArticleBySlug,
} from '@/lib/blog-articles-db';
import {
  BlogAdminFormSchema,
  parseBlogContentJson,
  parseRelatedLinksJson,
} from '@/validations/blog-admin';

function revalidateBlogPaths(slug: string) {
  revalidatePath('/dicas');
  revalidatePath(`/dicas/${slug}`);
  revalidatePath('/sitemap.xml');
  revalidatePath('/dashboard/dicas');
}

/**
 * Saves or publishes a blog article from admin form.
 */
export async function saveBlogArticleAction(formData: FormData) {
  const access = await requireDashboardAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = BlogAdminFormSchema.safeParse(raw);
  if (!parsed.success) {
    redirect('/dashboard/dicas?error=validation');
  }

  const articleId = parsed.data.articleId;
  const available = await isBlogSlugAvailable(parsed.data.slug, articleId);
  if (!available) {
    redirect('/dashboard/dicas?error=slug');
  }

  let status: 'draft' | 'published' = 'draft';
  if (parsed.data.intent === 'publish') {
    status = 'published';
  } else if (parsed.data.intent === 'unpublish') {
    status = 'draft';
  } else if (articleId) {
    const existing = await getBlogArticleAdminById(articleId);
    status = existing?.status === 'published' ? 'published' : 'draft';
  }

  const content = parseBlogContentJson(parsed.data.contentJson);
  const relatedLinks = parseRelatedLinksJson(parsed.data.relatedLinksJson);

  const saved = await saveBlogArticle(
    {
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      coverImageUrl: parsed.data.coverImageUrl?.trim() || null,
      content,
      relatedLinks,
      status,
    },
    access.userId,
    articleId,
  );

  await logAdminActivity({
    userId: access.userId,
    action: parsed.data.intent === 'publish' ? 'publish_blog_article' : 'save_blog_article',
    entityType: 'blog_article',
    entitySlug: saved.slug,
    details: `status=${saved.status}`,
  });

  revalidateBlogPaths(saved.slug);
  const filters = adminListFiltersSuffix(formData);
  redirect(`/dashboard/dicas/${saved.slug}/edit${filters}`);
}

/**
 * Unpublishes a blog article (tirar do ar).
 */
export async function unpublishBlogArticleAction(formData: FormData) {
  const access = await requireDashboardAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) {
    redirect('/dashboard/dicas');
  }

  const article = await unpublishBlogArticleBySlug(slug, access.userId);
  if (!article) {
    redirect('/dashboard/dicas');
  }

  await logAdminActivity({
    userId: access.userId,
    action: 'unpublish_blog_article',
    entityType: 'blog_article',
    entitySlug: slug,
  });

  revalidateBlogPaths(slug);
  const filters = adminListFiltersSuffix(formData);
  redirect(returnPathFromFormData(formData, `/dashboard/dicas/${slug}/edit${filters}`));
}

/**
 * Publishes a draft from the list page.
 */
export async function publishBlogArticleAction(formData: FormData) {
  const access = await requireDashboardAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) {
    redirect('/dashboard/dicas');
  }

  const article = await publishBlogArticleBySlug(slug, access.userId);
  if (!article) {
    redirect('/dashboard/dicas');
  }

  await logAdminActivity({
    userId: access.userId,
    action: 'publish_blog_article',
    entityType: 'blog_article',
    entitySlug: slug,
  });

  revalidateBlogPaths(slug);
  redirect(returnPathFromFormData(formData, '/dashboard/dicas'));
}
