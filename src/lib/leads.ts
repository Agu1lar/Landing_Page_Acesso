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

function mergeAttribution(existing: AttributionInput | undefined, incoming?: AttributionInput) {
  if (!incoming) {
    return existing;
  }

  return {
    utmSource: incoming.utmSource ?? existing?.utmSource,
    utmMedium: incoming.utmMedium ?? existing?.utmMedium,
    utmCampaign: incoming.utmCampaign ?? existing?.utmCampaign,
    utmContent: incoming.utmContent ?? existing?.utmContent,
    utmTerm: incoming.utmTerm ?? existing?.utmTerm,
    gclid: incoming.gclid ?? existing?.gclid,
    gbraid: incoming.gbraid ?? existing?.gbraid,
    wbraid: incoming.wbraid ?? existing?.wbraid,
    referrer: incoming.referrer ?? existing?.referrer,
    landingPage: incoming.landingPage ?? existing?.landingPage,
  };
}

function attributionFromLead(lead: {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  referrer: string | null;
  landingPage: string | null;
}): AttributionInput {
  return {
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
  };
}

async function touchCookieConsentLead(
  leadId: number,
  attribution?: AttributionInput,
  existing?: {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    gclid?: string | null;
    gbraid?: string | null;
    wbraid?: string | null;
    referrer: string | null;
    landingPage: string | null;
  },
) {
  const merged = mergeAttribution(existing ? attributionFromLead(existing) : undefined, attribution);
  const now = new Date();

  const [updated] = await db
    .update(leadsSchema)
    .set({
      lastActivityAt: now,
      utmSource: merged?.utmSource ?? null,
      utmMedium: merged?.utmMedium ?? null,
      utmCampaign: merged?.utmCampaign ?? null,
      utmContent: merged?.utmContent ?? null,
      utmTerm: merged?.utmTerm ?? null,
      gclid: merged?.gclid ?? null,
      gbraid: merged?.gbraid ?? null,
      wbraid: merged?.wbraid ?? null,
      referrer: merged?.referrer ?? null,
      landingPage: merged?.landingPage ?? null,
    })
    .where(eq(leadsSchema.id, leadId))
    .returning();

  return updated ?? null;
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
      lastActivityAt: new Date(),
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
    const updated = await touchCookieConsentLead(
      existingCookieLead.id,
      input.attribution,
      existingCookieLead,
    );
    logger.info(`Lead cookie-consent #${existingCookieLead.id} revisit email=${email}`);
    return { lead: updated ?? existingCookieLead, reason: 'updated' as const };
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
      lastActivityAt: new Date(),
    })
    .returning();

  if (lead) {
    logger.info(`Lead cookie-consent #${lead.id} email=${lead.email}`);
  }

  return { lead: lead ?? null, reason: 'created' as const };
}
