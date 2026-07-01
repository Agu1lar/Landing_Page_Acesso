type LogoAcessoProps = {
  /** `header` — compacto para navegação; `full` — inclui linha de serviços */
  variant?: 'header' | 'full';
  className?: string;
};

const BRAND_RED = '#C41E24';

/**
 * Logo vetorial — sem margem extra (o PNG 200×200 deixava o desenho minúsculo no header).
 */
export function LogoAcesso({ variant = 'header', className = '' }: LogoAcessoProps) {
  const viewBox = variant === 'full' ? '0 0 340 96' : '0 0 340 72';

  return (
    <svg
      aria-hidden={false}
      className={className}
      fill="none"
      role="img"
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Acesso Equipamentos</title>
      {/* Ícone: círculo + triângulo */}
      <circle cx="36" cy="36" fill={BRAND_RED} r="34" />
      <path
        d="M36 14 L56 54 H16 Z"
        fill="white"
        stroke="white"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M28 54 H44" stroke={BRAND_RED} strokeLinecap="round" strokeWidth="3" />

      {/* ACESSO */}
      <text
        fill="#0F172A"
        fontFamily="var(--font-heading), 'Plus Jakarta Sans', Arial Black, sans-serif"
        fontSize="32"
        fontWeight="700"
        letterSpacing="-0.02em"
        x="82"
        y="42"
      >
        ACESSO
      </text>

      {/* Faixa equipamentos */}
      <rect fill={BRAND_RED} height="26" rx="2" width="168" x="82" y="48" />
      <text
        fill="white"
        fontFamily="var(--font-body), Inter, Arial, sans-serif"
        fontSize="15"
        fontWeight="500"
        letterSpacing="0.02em"
        x="92"
        y="66"
      >
        equipamentos
      </text>

      {variant === 'full' && (
        <text
          fill="#475569"
          fontFamily="var(--font-body), Inter, Arial, sans-serif"
          fontSize="9.5"
          fontWeight="600"
          letterSpacing="0.12em"
          x="82"
          y="88"
        >
          PLATAFORMAS ELEVATÓRIAS • ANDAIMES • MÁQUINAS
        </text>
      )}
    </svg>
  );
}
