import { phoneMatchKey } from '@/lib/lead-contact';

export type ChatProInboundEvent = {
  event: string;
  phoneKey: string | null;
  fromMe: boolean;
  messagePreview: string | null;
  eventAt: Date | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseEventDate(value: unknown) {
  const raw = readString(value);
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Extracts digits from ChatPro JID (`5511999...@s.whatsapp.net`) or raw phone. */
export function extractChatProPhone(raw: string | null | undefined) {
  if (!raw?.trim()) {
    return null;
  }
  const beforeAt = raw.trim().split('@')[0] ?? raw;
  return phoneMatchKey(beforeAt);
}

/**
 * Parses ChatPro webhook JSON. Only inbound client messages mark a lead as replied.
 * Unknown shapes return null (endpoint responds 200 ignore).
 */
export function parseChatProWebhookPayload(payload: unknown): ChatProInboundEvent | null {
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const event = readString(root.event) ?? readString(root.type) ?? 'unknown';
  const messageData = asRecord(root.message_data) ?? asRecord(root.messageData);
  const sessionData = asRecord(root.session_data) ?? asRecord(root.sessionData);

  if (event === 'received_message' || messageData) {
    const fromMe = messageData?.from_me === true || messageData?.fromMe === true;
    const number =
      readString(messageData?.number)
      ?? readString(messageData?.participant)
      ?? readString(root.number);
    return {
      event: event === 'unknown' ? 'received_message' : event,
      phoneKey: extractChatProPhone(number),
      fromMe,
      messagePreview: readString(messageData?.message)?.slice(0, 280) ?? null,
      eventAt:
        parseEventDate(messageData?.ts_receive)
        ?? parseEventDate(root.event_ts)
        ?? parseEventDate(root.eventTs),
    };
  }

  if (event === 'opened_session' || sessionData) {
    // Opening a session alone is not a client reply — ignore for replied_at.
    return {
      event: event === 'unknown' ? 'opened_session' : event,
      phoneKey: extractChatProPhone(
        readString(sessionData?.number)
          ?? readString(root.number)
          ?? readString(sessionData?.lead_id),
      ),
      fromMe: true,
      messagePreview: readString(sessionData?.last_message),
      eventAt: parseEventDate(root.event_ts) ?? parseEventDate(sessionData?.open_ts),
    };
  }

  return {
    event,
    phoneKey: extractChatProPhone(readString(root.number)),
    fromMe: true,
    messagePreview: null,
    eventAt: parseEventDate(root.event_ts),
  };
}

/** True when this event should mark a site lead as “WhatsApp replied”. */
export function isChatProClientReply(event: ChatProInboundEvent) {
  if (event.fromMe || !event.phoneKey) {
    return false;
  }
  return event.event === 'received_message' || event.event.toLowerCase().includes('received');
}
