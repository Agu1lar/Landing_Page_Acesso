import { describe, expect, it } from 'vitest';
import {
  BlogAdminFormSchema,
  BlogArticleSeoSchema,
  BLOG_SEO_LIMITS,
  isBlogArticleSeoReady,
  suggestBlogMetaDescription,
  suggestBlogMetaTitle,
  validateBlogSeoField,
} from '@/validations/blog-admin';

const validSeo = {
  metaTitle: 'Como escolher plataforma elevatória em BH | Dicas Acesso',
  metaDescription:
    'Tesoura, lança articulada ou empurrar: critérios para locar plataforma elevatória em Belo Horizonte.',
};

describe('BlogArticleSeoSchema', () => {
  it('accepts valid SEO fields', () => {
    expect(BlogArticleSeoSchema.safeParse(validSeo).success).toBe(true);
    expect(isBlogArticleSeoReady(validSeo)).toBe(true);
  });

  it('rejects short meta title', () => {
    const result = BlogArticleSeoSchema.safeParse({
      ...validSeo,
      metaTitle: 'Curto',
    });
    expect(result.success).toBe(false);
    expect(isBlogArticleSeoReady({ ...validSeo, metaTitle: 'Curto' })).toBe(false);
  });

  it('rejects short meta description', () => {
    const result = BlogArticleSeoSchema.safeParse({
      ...validSeo,
      metaDescription: 'Descrição curta',
    });
    expect(result.success).toBe(false);
  });

  it('rejects meta description above max length', () => {
    const result = BlogArticleSeoSchema.safeParse({
      ...validSeo,
      metaDescription: 'a'.repeat(BLOG_SEO_LIMITS.metaDescriptionMax + 1),
    });
    expect(result.success).toBe(false);
  });
});

describe('validateBlogSeoField', () => {
  it('flags too-short values', () => {
    expect(validateBlogSeoField('metaTitle', 'abc')).toBe('too_short');
    expect(validateBlogSeoField('metaDescription', 'curta')).toBe('too_short');
  });

  it('flags too-long values', () => {
    expect(validateBlogSeoField('metaTitle', 'a'.repeat(BLOG_SEO_LIMITS.metaTitleMax + 1))).toBe(
      'too_long',
    );
  });

  it('returns null for valid values', () => {
    expect(validateBlogSeoField('metaTitle', validSeo.metaTitle)).toBeNull();
    expect(validateBlogSeoField('metaDescription', validSeo.metaDescription)).toBeNull();
  });
});

describe('suggestBlogMetaTitle', () => {
  it('appends brand suffix', () => {
    expect(suggestBlogMetaTitle('Guia de andaimes')).toBe('Guia de andaimes | Dicas Acesso');
  });
});

describe('suggestBlogMetaDescription', () => {
  it('trims excerpt to max length', () => {
    const excerpt = 'a'.repeat(BLOG_SEO_LIMITS.metaDescriptionMax + 40);
    expect(suggestBlogMetaDescription(excerpt)).toHaveLength(BLOG_SEO_LIMITS.metaDescriptionMax);
  });
});

describe('BlogAdminFormSchema', () => {
  it('requires SEO fields in full form payload', () => {
    const result = BlogAdminFormSchema.safeParse({
      slug: 'guia-de-andaimes',
      title: 'Guia de andaimes',
      excerpt: 'Resumo com mais de dez caracteres para listagem.',
      metaTitle: validSeo.metaTitle,
      metaDescription: validSeo.metaDescription,
      contentJson: '{"type":"doc","content":[]}',
      relatedLinksJson: '[]',
      intent: 'publish',
    });

    expect(result.success).toBe(true);
  });
});
