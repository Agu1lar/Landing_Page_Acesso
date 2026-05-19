import { brand } from '@/lib/brand';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';
import type { leadsSchema } from '@/models/Schema';
import type { InferSelectModel } from 'drizzle-orm';

export type LeadRecord = InferSelectModel<typeof leadsSchema>;

const rentalPeriodLabels: Record<string, string> = {
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
  ainda_nao_sei: 'Ainda não sei',
};

/**
 * Sends a new-lead notification e-mail via Resend when configured.
 */
export async function notifyLeadByEmail(lead: LeadRecord) {
  const apiKey = Env.RESEND_API_KEY;
  const to = Env.LEADS_NOTIFY_EMAIL;

  if (!apiKey || !to) {
    logger.warn(
      'Notificação de lead por e-mail ignorada: configure RESEND_API_KEY e LEADS_NOTIFY_EMAIL no Vercel (Production e Preview).',
    );
    return;
  }

  const period = lead.rentalPeriod
    ? (rentalPeriodLabels[lead.rentalPeriod] ?? lead.rentalPeriod)
    : '—';

  const cartLines = formatCartItemsForEmail(lead.itemsJson);

  const subject = `[Registro interno] Orçamento site — ${lead.name}`;
  const text = [
    `Registro interno de orçamento #${lead.id} — ${brand.name}`,
    '(Cliente envia a proposta pelo WhatsApp comercial; este e-mail é para controle da equipe.)',
    '',
    `Nome: ${lead.name}`,
    `E-mail: ${lead.email}`,
    `Telefone: ${lead.phone}`,
    `Empresa: ${lead.company ?? '—'}`,
    `Cidade: ${lead.city}`,
    cartLines ? `Itens solicitados:\n${cartLines}` : '',
    cartLines ? '' : `Equipamento: ${lead.equipmentName ?? '—'}`,
    cartLines ? '' : `Slug: ${lead.equipmentSlug ?? '—'}`,
    `Período: ${period}`,
    `Origem: ${lead.origin}`,
    '',
    lead.message ? `Mensagem:\n${lead.message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const from = Env.RESEND_FROM_EMAIL ?? `${brand.name} <onboarding@resend.dev>`;
  const html = text.replace(/\n/g, '<br>');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: [lead.email],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    let detail = body;
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) {
        detail = parsed.message;
      }
    } catch {
      // keep raw body
    }
    logger.error('Falha ao enviar e-mail de lead', {
      status: response.status,
      detail,
      to,
      from,
    });
    throw new Error(`Resend: ${detail}`);
  }

  logger.info(`E-mail de lead #${lead.id} enviado para ${to}`);
}

function formatCartItemsForEmail(itemsJson: string | null) {
  if (!itemsJson) {
    return '';
  }
  try {
    const items = JSON.parse(itemsJson) as {
      name?: string;
      slug?: string;
      kind?: string;
      quantity?: number;
    }[];
    if (!Array.isArray(items) || items.length === 0) {
      return '';
    }
    return items
      .map((item, index) => {
        const kind = item.kind === 'accessory' ? 'Acessório' : 'Equipamento';
        const qty =
          item.quantity && item.quantity > 1 ? ` · qtd. ${item.quantity}` : ' · qtd. 1';
        return `${index + 1}. ${item.name ?? '—'} (${kind})${qty} — ${item.slug ?? ''}`;
      })
      .join('\n');
  } catch {
    return '';
  }
}
