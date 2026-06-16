import Image from 'next/image';

/** Logo oficial 2025 — PNG em public/assets/brand/ */
const BRAND_LOGO_SRC = '/assets/brand/logo-acesso-header.png';
const BRAND_LOGO_SIZE = 1024;

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  return (
    <Image
      alt="Acesso Equipamentos — locação de plataformas, andaimes e máquinas"
      className={`object-contain object-left mix-blend-screen ${
        compact
          ? 'h-10 w-auto max-w-[min(58vw,220px)] sm:h-11 sm:max-w-[260px]'
          : 'h-[4.25rem] w-auto max-w-[min(88vw,300px)] sm:h-20 sm:max-w-[360px] md:h-[5.5rem] md:max-w-[420px]'
      } ${className}`}
      height={BRAND_LOGO_SIZE}
      priority
      sizes={compact ? '(max-width: 640px) 220px, 260px' : '(max-width: 640px) 300px, 420px'}
      src={BRAND_LOGO_SRC}
      width={BRAND_LOGO_SIZE}
    />
  );
}
