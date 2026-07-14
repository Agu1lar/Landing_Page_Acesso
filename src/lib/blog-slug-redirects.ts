import 'server-only';

import { eq, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { blogSlugRedirectsSchema } from '@/models/Schema';

const MAX_REDIRECT_HOPS = 5;

/**
 * Returns the final slug after following published slug redirects.
 */
export async function getBlogSlugRedirectTarget(fromSlug: string) {
  let current = fromSlug;

  try {
    for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
      const [row] = await db
        .select({ toSlug: blogSlugRedirectsSchema.toSlug })
        .from(blogSlugRedirectsSchema)
        .where(eq(blogSlugRedirectsSchema.fromSlug, current))
        .limit(1);

      if (!row || row.toSlug === current) {
        break;
      }

      current = row.toSlug;
    }
  } catch {
    // Table may not exist until blog SEO migration is applied.
    return null;
  }

  return current === fromSlug ? null : current;
}

/**
 * Registers a permanent redirect from a previous published slug.
 */
export async function registerBlogSlugRedirect(input: {
  fromSlug: string;
  toSlug: string;
  articleId?: number;
}) {
  if (!input.fromSlug || input.fromSlug === input.toSlug) {
    return;
  }

  await db
    .update(blogSlugRedirectsSchema)
    .set({ toSlug: input.toSlug })
    .where(eq(blogSlugRedirectsSchema.toSlug, input.fromSlug));

  await db
    .insert(blogSlugRedirectsSchema)
    .values({
      fromSlug: input.fromSlug,
      toSlug: input.toSlug,
      articleId: input.articleId,
    })
    .onConflictDoUpdate({
      target: blogSlugRedirectsSchema.fromSlug,
      set: {
        toSlug: input.toSlug,
        articleId: input.articleId,
        createdAt: sql`NOW()`,
      },
    });
}
