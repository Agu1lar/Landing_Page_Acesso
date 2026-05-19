'use client';

import { useState } from 'react';
import { QuoteForm } from '@/components/forms/QuoteForm';
import { QuoteCartPanel } from '@/components/quote-cart/QuoteCartPanel';
import { brand, buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';

type OrcamentoFormSectionProps = {
  initialEquipment?: {
    slug: string;
    name: string;
  };
};

/**
 * Quote form with contact aside hidden after submit to avoid duplicate WhatsApp CTAs.
 */
export function OrcamentoFormSection(props: OrcamentoFormSectionProps) {
  const [submitted, setSubmitted] = useState(false);

  const whatsappHref = props.initialEquipment
    ? buildWhatsAppUrl(
        buildWhatsAppMessage({
          equipmentName: props.initialEquipment.name,
          equipmentSlug: props.initialEquipment.slug,
          origin: 'site-orcamento',
        }),
      )
    : buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-orcamento' }));

  return (
    <>
      <div className="mt-8 space-y-8">
        <QuoteCartPanel showCheckoutHint />
        <QuoteForm
          initialEquipment={props.initialEquipment}
          onSuccess={() => setSubmitted(true)}
          origin="site-orcamento"
        />
      </div>

      {!submitted ? (
        <aside className="mt-10 rounded-[var(--radius-card)] border border-neutral-200 bg-background-muted p-6">
          <h2 className="font-heading text-lg font-semibold text-neutral-900">Prefere falar agora?</h2>
          <p className="mt-2 text-sm text-neutral-600">
            <a className="font-medium text-primary hover:underline" href={whatsappHref}>
              WhatsApp
            </a>{' '}
            ·{' '}
            <a className="font-medium text-primary hover:underline" href={`tel:+${brand.phone}`}>
              {brand.phoneDisplay}
            </a>{' '}
            · {brand.hours}
          </p>
        </aside>
      ) : null}
    </>
  );
}
