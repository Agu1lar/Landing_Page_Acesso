import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { leadsSchema } from '@/models/Schema';
import type { normalizeQuotePayload } from '@/validations/quote';

export type CreateLeadInput = ReturnType<typeof normalizeQuotePayload>;

export async function createLead(input: CreateLeadInput) {
  const [lead] = await db
    .insert(leadsSchema)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company ?? null,
      equipmentSlug: input.equipmentSlug ?? null,
      equipmentName: input.equipmentName ?? null,
      rentalPeriod: input.rentalPeriod ?? null,
      city: input.city,
      message: input.message ?? null,
      itemsJson: input.itemsJson ?? null,
      origin: input.origin || 'site-orcamento',
      status: 'new',
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmContent: input.utmContent ?? null,
      utmTerm: input.utmTerm ?? null,
      referrer: input.referrer ?? null,
      landingPage: input.landingPage ?? null,
    })
    .returning();

  logger.info(
    `Novo lead #${lead?.id ?? '?'} origin=${lead?.origin ?? 'site'} equipamento=${lead?.equipmentSlug ?? '—'}`,
  );

  return lead;
}
