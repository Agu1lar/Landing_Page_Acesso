import { eq, isNull, or, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import {
  hasClientIdentityKey,
  normalizeClientIdentity,
  pickClientDisplayName,
  type ClientIdentityInput,
} from '@/lib/client-identity';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { clientsSchema, leadsSchema } from '@/models/Schema';

export type ClientRecord = InferSelectModel<typeof clientsSchema>;

const BACKFILL_BATCH = 250;

function buildMatchConditions(identity: ReturnType<typeof normalizeClientIdentity>) {
  const conditions = [];

  if (identity.googleSub) {
    conditions.push(eq(clientsSchema.googleSub, identity.googleSub));
  }
  if (identity.email) {
    conditions.push(eq(clientsSchema.email, identity.email));
  }
  if (identity.phoneNormalized) {
    conditions.push(eq(clientsSchema.phoneNormalized, identity.phoneNormalized));
  }

  return conditions;
}

async function mergeDuplicateClients(matches: ClientRecord[]) {
  if (matches.length <= 1) {
    return matches[0] ?? null;
  }

  const sorted = [...matches].sort((a, b) => a.id - b.id);
  const primary = sorted[0];
  if (!primary) {
    return null;
  }
  const duplicates = sorted.slice(1);

  for (const duplicate of duplicates) {
    await db
      .update(leadsSchema)
      .set({ clientId: primary.id })
      .where(eq(leadsSchema.clientId, duplicate.id));

    await db.delete(clientsSchema).where(eq(clientsSchema.id, duplicate.id));
  }

  const merged = duplicates.reduce<ClientRecord>(
    (acc, row) => ({
      ...acc,
      displayName: pickClientDisplayName(acc.displayName, row.displayName),
      email: acc.email ?? row.email,
      phone: acc.phone ?? row.phone,
      phoneNormalized: acc.phoneNormalized ?? row.phoneNormalized,
      googleSub: acc.googleSub ?? row.googleSub,
      company: acc.company ?? row.company,
      firstSeenAt:
        row.firstSeenAt.getTime() < acc.firstSeenAt.getTime() ? row.firstSeenAt : acc.firstSeenAt,
    }),
    primary,
  );

  logger.info(
    `Merged ${duplicates.length} duplicate client(s) into #${primary.id} (${merged.email ?? merged.phoneNormalized ?? merged.googleSub ?? 'unknown'})`,
  );

  return merged;
}

/**
 * Finds or creates a deduplicated client row for a lead / Google sign-in.
 */
export async function resolveOrCreateClient(
  input: ClientIdentityInput,
  activityAt = new Date(),
): Promise<ClientRecord | null> {
  const identity = normalizeClientIdentity(input);
  if (!hasClientIdentityKey(identity)) {
    return null;
  }

  const conditions = buildMatchConditions(identity);
  const matches = await db
    .select()
    .from(clientsSchema)
    .where(or(...conditions));

  const primary = await mergeDuplicateClients(matches);
  const now = activityAt;

  if (!primary) {
    const [created] = await db
      .insert(clientsSchema)
      .values({
        displayName: identity.displayName,
        email: identity.email,
        phone: identity.phone,
        phoneNormalized: identity.phoneNormalized,
        googleSub: identity.googleSub,
        company: identity.company,
        firstSeenAt: now,
        lastActivityAt: now,
      })
      .returning();

    return created ?? null;
  }

  const [updated] = await db
    .update(clientsSchema)
    .set({
      displayName: pickClientDisplayName(primary.displayName, identity.displayName),
      email: primary.email ?? identity.email,
      phone: primary.phone ?? identity.phone,
      phoneNormalized: primary.phoneNormalized ?? identity.phoneNormalized,
      googleSub: primary.googleSub ?? identity.googleSub,
      company: primary.company ?? identity.company,
      lastActivityAt: now,
    })
    .where(eq(clientsSchema.id, primary.id))
    .returning();

  return updated ?? primary;
}

/** Associates a lead row with its deduplicated client record. */
export async function linkLeadToClient(
  leadId: number,
  input: ClientIdentityInput,
  activityAt?: Date,
) {
  const client = await resolveOrCreateClient(input, activityAt);
  if (!client) {
    return null;
  }

  await db.update(leadsSchema).set({ clientId: client.id }).where(eq(leadsSchema.id, leadId));
  await relinkLeadsForClient(client.id);
  return client;
}

/** Links legacy leads that predate the clients table (runs in small batches). */
export async function backfillUnlinkedLeads(limit = BACKFILL_BATCH) {
  const unlinked = await db
    .select()
    .from(leadsSchema)
    .where(isNull(leadsSchema.clientId))
    .orderBy(leadsSchema.createdAt)
    .limit(limit);

  for (const lead of unlinked) {
    await linkLeadToClient(
      lead.id,
      {
        displayName: lead.name,
        email: lead.email,
        phone: lead.phone,
        googleSub: lead.googleSub,
        company: lead.company,
      },
      lead.lastActivityAt ?? lead.createdAt,
    );
  }

  return unlinked.length;
}

/** Ensures all leads are linked before admin client queries. */
export async function ensureClientsBackfilled() {
  for (let pass = 0; pass < 20; pass += 1) {
    const processed = await backfillUnlinkedLeads();
    if (processed === 0) {
      return;
    }
  }
}

/** Re-links leads that share contact data but were attached to different clients. */
export async function relinkLeadsForClient(clientId: number) {
  const [client] = await db.select().from(clientsSchema).where(eq(clientsSchema.id, clientId)).limit(1);
  if (!client) {
    return;
  }

  const conditions = [];
  if (client.email) {
    conditions.push(eq(leadsSchema.email, client.email));
  }
  if (client.phoneNormalized) {
    conditions.push(
      sql`regexp_replace(${leadsSchema.phone}, '\\D', '', 'g') = ${client.phoneNormalized}`,
    );
  }
  if (client.googleSub) {
    conditions.push(eq(leadsSchema.googleSub, client.googleSub));
  }

  if (conditions.length === 0) {
    return;
  }

  await db.update(leadsSchema).set({ clientId }).where(or(...conditions));
}
