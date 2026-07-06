import { LogoAcesso } from '@/components/brand/LogoAcesso';

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
};

/** Logo no header — SVG vetorial, fundo transparente. */
export function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  return (
    <LogoAcesso
      className={
        compact
          ? `h-9 w-auto max-w-[min(46vw,148px)] sm:h-10 sm:max-w-[168px] ${className}`
          : `h-12 w-auto max-w-[min(78vw,220px)] sm:h-14 sm:max-w-[248px] md:max-w-[272px] ${className}`
      }
      variant={compact ? 'header' : 'full'}
    />
  );
}
