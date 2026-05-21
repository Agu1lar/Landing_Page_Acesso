/**
 * Client logos for the home trust section (Casos de Sucesso).
 * Assets: public/clientes/{slug}.webp — recut from site legado com autorização do cliente.
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
  logoSrc: string;
};

export const CLIENT_LOGO_SEGMENT_LABELS: Record<ClientLogoSegment, string> = {
  construcao: 'Construção civil',
  industria: 'Indústria',
  mineracao: 'Mineração',
  varejo: 'Varejo e corporativo',
  logistica: 'Logística',
  infraestrutura: 'Infraestrutura',
};

/** Six segments from the legacy client strip (Design-sem-nome-31), mapped to slugs. */
export const CLIENT_LOGOS: ClientLogo[] = [
  {
    slug: 'mineracao-siderurgia',
    name: 'Mineração e siderurgia',
    segment: 'mineracao',
    logoSrc: '/clientes/mineracao-siderurgia.webp',
  },
  {
    slug: 'construtoras-empreiteiras',
    name: 'Construtoras e empreiteiras',
    segment: 'construcao',
    logoSrc: '/clientes/construtoras-empreiteiras.webp',
  },
  {
    slug: 'industria-manufatura',
    name: 'Indústria e manufatura',
    segment: 'industria',
    logoSrc: '/clientes/industria-manufatura.webp',
  },
  {
    slug: 'shoppings-centros-comerciais',
    name: 'Shoppings e centros comerciais',
    segment: 'varejo',
    logoSrc: '/clientes/shoppings-centros-comerciais.webp',
  },
  {
    slug: 'galpoes-logisticos',
    name: 'Galpões logísticos',
    segment: 'logistica',
    logoSrc: '/clientes/galpoes-logisticos.webp',
  },
  {
    slug: 'infraestrutura-energia',
    name: 'Infraestrutura e energia',
    segment: 'infraestrutura',
    logoSrc: '/clientes/infraestrutura-energia.webp',
  },
];
