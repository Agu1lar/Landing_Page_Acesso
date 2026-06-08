import { buildWhatsAppUrl } from '@/lib/brand';
import type { QuoteCartItemWithSpecs } from '@/lib/quote-equipment-specs';
import { rentalPeriodOptions } from '@/validations/quote';
import type { QuoteCartItemInput } from '@/validations/quote';

const periodLabels: Record<(typeof rentalPeriodOptions)[number], string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
  ainda_nao_sei: 'Ainda não sei',
};

export type QuoteWhatsAppPayload = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  city: string;
  rentalPeriod?: string;
  message?: string;
  cartItems?: QuoteCartItemInput[] | QuoteCartItemWithSpecs[];
  equipmentName?: string;
  equipmentSpecsSummary?: string;
  origin?: string;
};

/**
 * Mensagem em primeira pessoa para o cliente enviar ao WhatsApp comercial.
 */
export function buildQuoteWhatsAppMessage(payload: QuoteWhatsAppPayload) {
  const lines: string[] = [
    `Olá! Meu nome é ${payload.name.trim()}.`,
    'Gostaria de solicitar um *orçamento de locação* com a Acesso Equipamentos:',
    '',
  ];

  if (payload.cartItems?.length) {
    lines.push('*Equipamentos / itens:*');
    for (const item of payload.cartItems) {
      const qty = item.quantity > 1 ? ` — quantidade: ${item.quantity}` : '';
      lines.push(`• ${item.name}${qty}`);
      const specsSummary =
        'specsSummary' in item && item.specsSummary?.trim()
          ? item.specsSummary.trim()
          : undefined;
      if (specsSummary) {
        lines.push(`  _Especificações:_ ${specsSummary}`);
      }
    }
  } else if (payload.equipmentName?.trim()) {
    lines.push(`*Equipamento:* ${payload.equipmentName.trim()}`);
    if (payload.equipmentSpecsSummary?.trim()) {
      lines.push(`_Especificações:_ ${payload.equipmentSpecsSummary.trim()}`);
    }
  }

  lines.push('', `*Cidade da obra:* ${payload.city.trim()}`);

  if (payload.rentalPeriod) {
    const label = rentalPeriodOptions.includes(
      payload.rentalPeriod as (typeof rentalPeriodOptions)[number],
    )
      ? periodLabels[payload.rentalPeriod as keyof typeof periodLabels]
      : payload.rentalPeriod;
    lines.push(`*Período de locação:* ${label}`);
  }

  if (payload.company?.trim()) {
    lines.push(`*Empresa:* ${payload.company.trim()}`);
  }

  lines.push('', '*Meu contato:*');
  lines.push(`Telefone / WhatsApp: ${payload.phone.trim()}`);
  lines.push(`E-mail: ${payload.email.trim()}`);

  if (payload.message?.trim()) {
    lines.push('', `*Observações:* ${payload.message.trim()}`);
  }

  lines.push('', 'Aguardo retorno com valores, disponibilidade e prazo. Obrigado(a)!');

  return lines.join('\n');
}

/**
 * URL do WhatsApp comercial com mensagem de orçamento pré-preenchida.
 */
export function buildQuoteWhatsAppUrl(payload: QuoteWhatsAppPayload) {
  return buildWhatsAppUrl(buildQuoteWhatsAppMessage(payload));
}
