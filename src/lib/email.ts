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
    logger.info('Notificação de lead por e-mail ignorada (RESEND_API_KEY ou LEADS_NOTIFY_EMAIL ausente)');
    return;
  }

  const period = lead.rentalPeriod
    ? (rentalPeriodLabels[lead.rentalPeriod] ?? lead.rentalPeriod)
    : '—';

  const subject = `Novo orçamento no site — ${lead.name}`;
  const text = [
    `Novo lead #${lead.id} em ${brand.name}`,
    '',
    `Nome: ${lead.name}`,
    `E-mail: ${lead.email}`,
    `Telefone: ${lead.phone}`,
    `Empresa: ${lead.company ?? '—'}`,
    `Cidade: ${lead.city}`,
    `Equipamento: ${lead.equipmentName ?? '—'}`,
    `Slug: ${lead.equipmentSlug ?? '—'}`,
    `Período: ${period}`,
    `Origem: ${lead.origin}`,
    '',
    lead.message ? `Mensagem:\n${lead.message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Env.RESEND_FROM_EMAIL ?? `${brand.name} <onboarding@resend.dev>`,
      to: [to],
      reply_to: lead.email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error('Falha ao enviar e-mail de lead', { status: response.status, body });
    throw new Error('Resend API error');
  }

  logger.info(`E-mail de lead #${lead.id} enviado para ${to}`);
}
