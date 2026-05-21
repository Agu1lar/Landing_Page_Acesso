/**
 * Setores da seção Casos de Sucesso na Home.
 * Logos: coloque arquivos PNG/WebP/SVG com fundo transparente em
 * public/clientes/{segment}/ (ex.: public/clientes/mineracao/vale.webp).
 */
export type ClientLogoSegment =
  | 'construcao'
  | 'industria'
  | 'mineracao'
  | 'varejo'
  | 'logistica'
  | 'infraestrutura';

export type ClientLogoSegmentConfig = {
  id: ClientLogoSegment;
  label: string;
};

export const CLIENT_LOGO_SEGMENTS: ClientLogoSegmentConfig[] = [
  { id: 'construcao', label: 'Construção civil' },
  { id: 'industria', label: 'Indústria' },
  { id: 'mineracao', label: 'Mineração' },
  { id: 'varejo', label: 'Varejo e corporativo' },
  { id: 'logistica', label: 'Logística' },
  { id: 'infraestrutura', label: 'Infraestrutura' },
];
