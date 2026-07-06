import Image from 'next/image';

/** Logo oficial exportado do Corel — raster 470×158 (fundo claro, tipografia original). */
const BRAND_LOGO_SRC = '/assets/brand/logo-acesso-header.jpg';
const BRAND_LOGO_WIDTH = 470;
const BRAND_LOGO_HEIGHT = 158;

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  return (
    <Image
      alt="Acesso Equipamentos — plataformas aéreas, andaimes e máquinas"
      className={
        compact
          ? `h-11 w-[148px] object-cover object-left-top sm:h-12 sm:w-[168px] ${className}`
          : `h-[4.5rem] w-auto max-w-[min(90vw,300px)] object-contain object-left sm:h-20 sm:max-w-[320px] md:max-w-[340px] ${className}`
      }
      height={BRAND_LOGO_HEIGHT}
      priority
      sizes={compact ? '168px' : '(max-width: 768px) 300px, 340px'}
      src={BRAND_LOGO_SRC}
      width={BRAND_LOGO_WIDTH}
    />
  );
}
