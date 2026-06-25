import { CATEGORY_LABELS, type EquipmentCategory } from '@/types/equipment';

const WHATSAPP_ORIGIN_LABELS: Record<string, string> = {
  'site-flutuante': 'Botão flutuante (canto da tela)',
  'site-header': 'Topo do site (menu principal)',
  'site-home': 'Página inicial',
  'site-home-sticky': 'Barra fixa na página inicial (celular)',
  'site-catalogo-sticky': 'Barra fixa no catálogo (celular)',
  'site-detalhe': 'Ficha do equipamento',
  'site-detalhe-cta': 'Chamada na ficha do equipamento',
  'site-detalhe-sticky': 'Barra fixa na ficha (celular)',
  'site-categoria': 'Página da categoria',
  'site-categoria-catalogo': 'Lista de equipamentos da categoria',
  'site-categoria-sticky': 'Barra fixa na categoria (celular)',
  'site-treinamento': 'Página de treinamento',
  'site-sobre': 'Página Sobre',
  'site-contato': 'Página de contato',
  'site-faq': 'Perguntas frequentes',
  'site-dica': 'Artigo de dicas',
  'site-orcamento': 'Formulário de orçamento',
  'site-carrinho-mobile': 'Carrinho de orçamento (celular)',
  'site-mobile-ligar': 'Botão ligar (celular)',
};

const SITE_PATH_LABELS: Record<string, string> = {
  '/': 'Página inicial',
  '/equipamentos': 'Catálogo de equipamentos',
  '/orcamento': 'Pedido de orçamento',
  '/contato': 'Página de contato',
  '/sobre': 'Sobre a empresa',
  '/faq': 'Perguntas frequentes',
  '/dicas': 'Dicas e artigos',
  '/privacidade': 'Política de privacidade',
  '/treinamento-plataformas-aereas': 'Treinamento de plataformas',
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Computador',
  mobile: 'Celular',
  tablet: 'Tablet',
  desconhecido: 'Não identificado',
};

function humanizeSlug(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatUnknownWhatsAppOrigin(origin: string) {
  if (origin.startsWith('site-')) {
    return humanizeSlug(origin.slice(5));
  }

  return origin;
}

/** Turns internal tracking ids (e.g. site-header) into plain-language labels. */
export function formatWhatsAppOrigin(origin: string): string {
  if (!origin || origin === '—') {
    return 'Não informado';
  }

  return WHATSAPP_ORIGIN_LABELS[origin] ?? formatUnknownWhatsAppOrigin(origin);
}

/** Humanizes landing paths and top pages for the dashboard. */
export function formatSitePath(path: string): string {
  if (!path || path === '—') {
    return 'Não informado';
  }

  const withoutLocale = path.replace(/^\/pt-BR/i, '').split('?')[0] || '/';
  const normalized = withoutLocale === '' ? '/' : withoutLocale;

  const siteLabel = SITE_PATH_LABELS[normalized];
  if (siteLabel) {
    return siteLabel;
  }

  const equipmentMatch = normalized.match(/^\/equipamentos\/([^/]+)/);
  if (equipmentMatch?.[1]) {
    return `Ficha: ${humanizeSlug(equipmentMatch[1])}`;
  }

  const categoryMatch = normalized.match(/^\/categorias\/([^/]+)/);
  if (categoryMatch?.[1]) {
    const category = categoryMatch[1] as EquipmentCategory;
    return `Categoria: ${CATEGORY_LABELS[category] ?? humanizeSlug(categoryMatch[1])}`;
  }

  const articleMatch = normalized.match(/^\/dicas\/([^/]+)/);
  if (articleMatch?.[1]) {
    return `Artigo: ${humanizeSlug(articleMatch[1])}`;
  }

  return normalized;
}

/** Labels UTM / direct traffic for non-technical readers. */
export function formatTrafficSource(source: string) {
  if (source === 'direto') {
    return 'Acesso direto (sem link de campanha)';
  }

  if (source === '(none)' || source === '—') {
    return 'Não informado';
  }

  return source;
}

/** Labels device buckets from WhatsApp clicks. */
export function formatDevice(device: string): string {
  const key = device.trim().toLowerCase();
  if (!key || key === '—') {
    return 'Não identificado';
  }

  return DEVICE_LABELS[key] ?? device;
}

/** Shortens multi-item lead lines and replaces empty equipment markers. */
export function formatEquipmentAnalyticsLabel(
  label: string,
  context: 'whatsapp' | 'lead',
) {
  if (!label || label === '—') {
    return context === 'whatsapp'
      ? 'Clique sem equipamento específico'
      : 'Pedido sem equipamento no título';
  }

  if (!label.includes(' · ')) {
    return label;
  }

  const parts = label.split(' · ').map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return label;
  }

  if (parts.length === 2) {
    return `${parts[0]} e mais 1 item`;
  }

  return `${parts[0]} e mais ${parts.length - 1} itens`;
}

/** Makes UTM campaign rows easier to scan. */
export function formatCampaignName(campaign: string) {
  if (campaign === '(sem campanha)') {
    return 'Sem campanha vinculada';
  }

  return campaign;
}
