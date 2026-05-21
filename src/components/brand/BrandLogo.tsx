import Image from 'next/image';

/** Logo 3D oficial — arquivo em public/assets/brand/logo-acesso-3d.jpg */
const BRAND_LOGO_SRC = '/assets/brand/logo-acesso-3d.jpg';

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

export function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  return (
    <span
      className={`inline-block origin-top-left transition-transform duration-300 ${
        compact
          ? 'scale-x-[1.08] sm:scale-x-[1.12]'
          : 'scale-x-[1.14] sm:scale-x-[1.22] lg:scale-x-[1.3]'
      } ${className}`}
    >
      <Image
        alt="Acesso Equipamentos — locação de plataformas, andaimes e máquinas"
        className={
          compact
            ? 'h-auto max-h-9 w-[min(72vw,200px)] object-contain object-left sm:max-h-10 sm:w-[240px] md:max-h-11 md:w-[280px]'
            : 'h-auto max-h-[6.33rem] w-[min(98vw,420px)] object-contain object-left sm:max-h-[8.25rem] sm:w-[500px] md:max-h-[9.9rem] md:w-[600px] lg:max-h-[11rem] lg:w-[680px]'
        }
        height={180}
        priority
        sizes={
          compact
            ? '(max-width: 640px) 200px, 280px'
            : '(max-width: 640px) 420px, (max-width: 1024px) 600px, 680px'
        }
        src={BRAND_LOGO_SRC}
        width={720}
      />
    </span>
  );
}
