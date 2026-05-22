import type { MetadataRoute } from 'next';
import { getAllDicaSlugs } from '@/data/dicas-articles';
import { ALL_EQUIPMENT_CATEGORIES } from '@/lib/categories-seo';
import { getAllSlugs } from '@/lib/equipment';
import { getBaseUrl } from '@/utils/Helpers';

function priorityForRoute(route: string) {
  if (route === '') {
    return 1;
  }
  if (route.startsWith('/categorias/')) {
    return 0.9;
  }
  if (
    route === '/equipamentos' ||
    route === '/orcamento' ||
    route === '/treinamento-plataformas-aereas'
  ) {
    return 0.85;
  }
  if (route.startsWith('/equipamentos/')) {
    return 0.7;
  }
  return 0.75;
}

function changeFrequencyForRoute(route: string): MetadataRoute.Sitemap[number]['changeFrequency'] {
  if (route === '') {
    return 'weekly';
  }
  if (route.startsWith('/equipamentos/')) {
    return 'monthly';
  }
  return 'weekly';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    '/dicas',
    '/privacidade',
  ];

  const categoryRoutes = ALL_EQUIPMENT_CATEGORIES.map((slug) => `/categorias/${slug}`);
  const equipmentRoutes = (await getAllSlugs()).map((slug) => `/equipamentos/${slug}`);
  const dicaRoutes = getAllDicaSlugs().map((slug) => `/dicas/${slug}`);
  const allRoutes = [...staticRoutes, ...categoryRoutes, ...equipmentRoutes, ...dicaRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: changeFrequencyForRoute(route),
    priority: priorityForRoute(route),
  }));
}
