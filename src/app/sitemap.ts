import type { MetadataRoute } from 'next';
import { ALL_EQUIPMENT_CATEGORIES } from '@/lib/categories-seo';
import { getAllSlugs } from '@/lib/equipment';
import { getBaseUrl } from '@/utils/Helpers';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticRoutes = [
    '',
    '/equipamentos',
    '/treinamento-plataformas-aereas',
    '/sobre',
    '/contato',
    '/orcamento',
    '/faq',
    '/privacidade',
  ];

  const categoryRoutes = ALL_EQUIPMENT_CATEGORIES.map((slug) => `/categorias/${slug}`);
  const equipmentRoutes = getAllSlugs().map((slug) => `/equipamentos/${slug}`);
  const allRoutes = [...staticRoutes, ...categoryRoutes, ...equipmentRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : (route.startsWith('/equipamentos/') ? 0.7 : 0.8),
  }));
}
