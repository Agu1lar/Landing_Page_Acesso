import { and, eq, sql } from 'drizzle-orm';
import { recordAnalyticsEvent } from '@/lib/analytics-events';
import type { AttributionInput } from '@/lib/attribution';
import type { GoogleIdTokenPayload } from '@/lib/google-id-token';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { leadsSchema } from '@/models/Schema';
import type { normalizeQuotePayload } from '@/validations/quote';

export type CreateLeadInput = ReturnType<typeof normalizeQuotePayload>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Removes a lightweight cookie-consent lead when the same visitor submits a quote.
 */
export async function removeCookieConsentLeadForEmail(email: string) {
  const normalized = normalizeEmail(email);
  await db
    .delete(leadsSchema)
    .where(and(eq(leadsSchema.email, normalized), eq(leadsSchema.leadKind, 'cookie_consent')));
}

export async function createLead(input: CreateLeadInput) {
  const email = normalizeEmail(input.email);
  await removeCookieConsentLeadForEmail(email);

  const [lead] = await db
    .insert(leadsSchema)
    .values({
      name: input.name,
      email,
      phone: input.phone,
      company: input.company ?? null,
      equipmentSlug: input.equipmentSlug ?? null,
      equipmentName: input.equipmentName ?? null,
      rentalPeriod: input.rentalPeriod ?? null,
      city: input.city,
      message: input.message ?? null,
      itemsJson: input.itemsJson ?? null,
      origin: input.origin || 'site-orcamento',
      leadKind: 'quote',
      status: 'new',
      utmSource: input.utmSource ?? null,
      utmMedium: input.utmMedium ?? null,
      utmCampaign: input.utmCampaign ?? null,
      utmContent: input.utmContent ?? null,
      utmTerm: input.utmTerm ?? null,
      gclid: input.gclid ?? null,
      gbraid: input.gbraid ?? null,
      wbraid: input.wbraid ?? null,
      referrer: input.referrer ?? null,
      landingPage: input.landingPage ?? null,
    })
    .returning();

  logger.info(
    `Novo lead #${lead?.id ?? '?'} origin=${lead?.origin ?? 'site'} equipamento=${lead?.equipmentSlug ?? '—'}`,
  );

  if (lead) {
    await recordAnalyticsEvent({
      eventType: 'quote_submit',
      origin: lead.origin,
      equipmentSlug: lead.equipmentSlug ?? undefined,
      equipmentName: lead.equipmentName ?? undefined,
      attribution: {
        utmSource: lead.utmSource ?? undefined,
        utmMedium: lead.utmMedium ?? undefined,
        utmCampaign: lead.utmCampaign ?? undefined,
        utmContent: lead.utmContent ?? undefined,
        utmTerm: lead.utmTerm ?? undefined,
        gclid: lead.gclid ?? undefined,
        gbraid: lead.gbraid ?? undefined,
        wbraid: lead.wbraid ?? undefined,
        referrer: lead.referrer ?? undefined,
        landingPage: lead.landingPage ?? undefined,
      },
    });
  }

  return lead;
}

export type CreateCookieConsentLeadInput = {
  profile: GoogleIdTokenPayload;
  attribution?: AttributionInput;
};

/**
 * Creates or returns an existing cookie-consent lead for a signed-in Google visitor.
 */
export async function createCookieConsentLead(input: CreateCookieConsentLeadInput) {
  const email = normalizeEmail(input.profile.email);
  const name =
    input.profile.name?.trim() ||
    [input.profile.givenName, input.profile.familyName].filter(Boolean).join(' ').trim() ||
    email;

  const [existingQuote] = await db
    .select({ id: leadsSchema.id })
    .from(leadsSchema)
    .where(and(eq(leadsSchema.email, email), eq(leadsSchema.leadKind, 'quote')))
    .limit(1);

  if (existingQuote) {
    return { lead: null, reason: 'quote_exists' as const };
  }

  const [existingCookieLead] = await db
    .select()
    .from(leadsSchema)
    .where(
      and(
        eq(leadsSchema.leadKind, 'cookie_consent'),
        sql`(${leadsSchema.email} = ${email} OR ${leadsSchema.googleSub} = ${input.profile.sub})`,
      ),
    )
    .limit(1);

  if (existingCookieLead) {
    return { lead: existingCookieLead, reason: 'existing' as const };
  }

  const attribution = input.attribution;

  const [lead] = await db
    .insert(leadsSchema)
    .values({
      name: name.slice(0, 200),
      email,
      phone: null,
      company: null,
      city: null,
      origin: 'site-cookie-consent',
      leadKind: 'cookie_consent',
      googleSub: input.profile.sub,
      status: 'new',
      utmSource: attribution?.utmSource ?? null,
      utmMedium: attribution?.utmMedium ?? null,
      utmCampaign: attribution?.utmCampaign ?? null,
      utmContent: attribution?.utmContent ?? null,
      utmTerm: attribution?.utmTerm ?? null,
      referrer: attribution?.referrer ?? null,
      landingPage: attribution?.landingPage ?? null,
    })
    .returning();

  if (lead) {
    logger.info(`Lead cookie-consent #${lead.id} email=${lead.email}`);
  }

  return { lead: lead ?? null, reason: 'created' as const };
}
