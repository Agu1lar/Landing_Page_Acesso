import { Button } from '@/components/ui/Button';

type ConversionCtasProps = {
  whatsappHref: string;
  whatsappLabel: string;
  /** PostHog origin id (ex.: site-home, site-detalhe) */
  whatsappOrigin: string;
  equipmentSlug?: string;
  equipmentName?: string;
  quoteHref?: string;
  quoteLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Banner escuro (home — CTA final) */
  onDark?: boolean;
};

/**
 * Hierarquia de conversão: WhatsApp (primário) → Orçamento (secundário).
 * Alinhado aos requisitos e anti-padrão de múltiplos CTAs competindo (concorrentes).
 */
export function ConversionCtas({
  whatsappHref,
  whatsappLabel,
  whatsappOrigin,
  equipmentSlug,
  equipmentName,
  quoteHref = '/orcamento',
  quoteLabel = 'Solicitar orçamento',
  size = 'md',
  className = '',
  onDark = false,
}: ConversionCtasProps) {
  const quoteVariant = 'outline' as const;
  const quoteExtra = onDark
    ? '!border-white/40 !bg-transparent !text-white hover:!border-white hover:!bg-white/10'
    : '';

  return (
    <div className={`flex flex-col items-stretch gap-3 sm:flex-row sm:items-center ${className}`}>
      <Button
        className="sm:order-1"
        equipmentName={equipmentName}
        equipmentSlug={equipmentSlug}
        href={whatsappHref}
        size={size}
        variant="whatsapp"
        whatsappOrigin={whatsappOrigin}
      >
        {whatsappLabel}
      </Button>
      {quoteHref && (
        <Button
          className={`sm:order-2 ${quoteExtra}`}
          href={quoteHref}
          size={size}
          variant={quoteVariant}
        >
          {quoteLabel}
        </Button>
      )}
    </div>
  );
}
