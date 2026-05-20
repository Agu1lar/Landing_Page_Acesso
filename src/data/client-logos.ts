/**
 * Client logos for the home trust section.
 * Add approved logo files under public/clientes/{slug}.webp (or .png) and set logoSrc.
 */
export type ClientLogoSegment =
  | 'construcao'
  | 'industria'
  | 'mineracao'
  | 'varejo'
  | 'logistica'
  | 'infraestrutura';

export type ClientLogo = {
  slug: string;
  name: string;
  segment: ClientLogoSegment;
  /** Public path, e.g. /clientes/vale.webp — omit until asset is approved */
  logoSrc?: string;
};

export const CLIENT_LOGO_SEGMENT_LABELS: Record<ClientLogoSegment, string> = {
  construcao: 'Construção civil',
  industria: 'Indústria',
  mineracao: 'Mineração',
  varejo: 'Varejo e corporativo',
  logistica: 'Logística',
  infraestrutura: 'Infraestrutura',
};

/**
 * Replace wordmarks with real logos (logoSrc) when the client sends approved files.
 * Names reflect segments served in MG — not individual trademarks until assets exist.
 */
export const CLIENT_LOGOS: ClientLogo[] = [
  {
    slug: 'construtoras-empreiteiras',
    name: 'Construtoras e empreiteiras',
    segment: 'construcao',
  },
  {
    slug: 'industria-manufatura',
    name: 'Indústria e manufatura',
    segment: 'industria',
  },
  {
    slug: 'mineracao-siderurgia',
    name: 'Mineração e siderurgia',
    segment: 'mineracao',
  },
  {
    slug: 'shoppings-centros-comerciais',
    name: 'Shoppings e centros comerciais',
    segment: 'varejo',
  },
  {
    slug: 'galpoes-logisticos',
    name: 'Galpões logísticos',
    segment: 'logistica',
  },
  {
    slug: 'infraestrutura-energia',
    name: 'Infraestrutura e energia',
    segment: 'infraestrutura',
  },
];
