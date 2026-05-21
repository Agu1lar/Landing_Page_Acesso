/**
 * Pastas em public/clientes/ para organizar logos (exibição única na Home).
 * Logos: PNG/WebP/SVG com fundo transparente em public/clientes/{segment}/.
 */
export type ClientLogoSegment =
  | 'construcao'
  | 'industria'
  | 'mineracao'
  | 'varejo'
  | 'logistica'
  | 'infraestrutura';

/** Sector folder names scanned under public/clientes/. */
export const CLIENT_LOGO_SEGMENTS: readonly ClientLogoSegment[] = [
  'construcao',
  'industria',
  'mineracao',
  'varejo',
  'logistica',
  'infraestrutura',
];
