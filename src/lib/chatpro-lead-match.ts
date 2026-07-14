import 'server-only';

import { and, desc, eq, gte, ne, or, sql } from 'drizzle-orm';
import { isChatProClientReply, type ChatProInboundEvent } from '@/lib/chatpro-webhook';
import { db } from '@/libs/DB';
import { logger } from '@/libs/Logger';
import { leadsSchema } from '@/models/Schema';

/** Only match leads created/active in this window (avoids stale phone reuse). */
const MATCH_WINDOW_DAYS = 45;

export type ChatProLeadMatchResult =
  | { ok: true; ignored: true; reason: string }
  | { ok: true; ignored: false; leadId: number; updatedStatus: string }
  | { ok: true; ignored: true; reason: 'no_match'; phoneKey: string };

/**
 * Finds the newest eligible lead for a ChatPro inbound reply and marks it replied.
 */
export async function applyChatProReplyToLead(event: ChatProInboundEvent): Promise<ChatProLeadMatchResult> {
  if (!isChatProClientReply(event) || !event.phoneKey) {
    return { ok: true, ignored: true, reason: 'not_client_reply' };
  }

  const since = new Date();
  since.setDate(since.getDate() - MATCH_WINDOW_DAYS);

  const key = event.phoneKey;
  const keyLen = key.length;

  const matches = await db
    .select({
      id: leadsSchema.id,
      status: leadsSchema.status,
      whatsappRepliedAt: leadsSchema.whatsappRepliedAt,
      internalNotes: leadsSchema.internalNotes,
    })
    .from(leadsSchema)
    .where(
      and(
        ne(leadsSchema.leadKind, 'cookie_consent'),
        or(gte(leadsSchema.createdAt, since), gte(leadsSchema.lastActivityAt, since)),
        sql`right(regexp_replace(coalesce(${leadsSchema.phone}, ''), '\\D', '', 'g'), ${keyLen}) = ${key}`,
      ),
    )
    .orderBy(desc(sql`coalesce(${leadsSchema.lastActivityAt}, ${leadsSchema.createdAt})`))
    .limit(1);

  const lead = matches[0];
  if (!lead) {
    logger.info('ChatPro webhook: sem lead para o telefone', { phoneKey: key });
    return { ok: true, ignored: true, reason: 'no_match', phoneKey: key };
  }

  const now = event.eventAt && !Number.isNaN(event.eventAt.getTime()) ? event.eventAt : new Date();
  const nextStatus = lead.status === 'new' ? 'contacted' : lead.status;
  const firstReply = !lead.whatsappRepliedAt;
  const stamp = now.toISOString().slice(0, 16).replace('T', ' ');
  const noteLine = `[ChatPro] Cliente respondeu no WhatsApp (${stamp} UTC)`;
  const nextNotes = firstReply
    ? [lead.internalNotes?.trim(), noteLine].filter(Boolean).join('\n')
    : lead.internalNotes;

  await db
    .update(leadsSchema)
    .set({
      whatsappRepliedAt: lead.whatsappRepliedAt ?? now,
      lastActivityAt: now,
      status: nextStatus,
      ...(firstReply ? { internalNotes: nextNotes } : {}),
    })
    .where(eq(leadsSchema.id, lead.id));

  logger.info('ChatPro webhook: lead marcado como respondeu', {
    leadId: lead.id,
    phoneKey: key,
    status: nextStatus,
  });

  return {
    ok: true,
    ignored: false,
    leadId: lead.id,
    updatedStatus: nextStatus,
  };
}
