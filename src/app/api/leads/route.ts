import { fixedWindow } from '@arcjet/next';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import arcjet from '@/libs/Arcjet';
import { notifyLeadByEmail } from '@/lib/email';
import { createLead } from '@/lib/leads';
import { logger } from '@/libs/Logger';
import { normalizeQuotePayload, QuoteFormSchema } from '@/validations/quote';

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '15m',
    max: 8,
  }),
);

export const POST = async (request: Request) => {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns minutos ou fale pelo WhatsApp.' },
        { status: 429 },
      );
    }

    const json = await request.json();
    const parsed = QuoteFormSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true, id: 0 });
    }

    const { website: _honeypot } = parsed.data;
    const lead = await createLead(normalizeQuotePayload(parsed.data));

    if (lead) {
      try {
        await notifyLeadByEmail(lead);
      } catch (emailError) {
        logger.error('Lead salvo, mas e-mail não enviado', {
          leadId: lead.id,
          message: emailError instanceof Error ? emailError.message : String(emailError),
        });
      }
    }

    return NextResponse.json({ ok: true, id: lead?.id });
  } catch (error) {
    logger.error('Falha ao salvar lead', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Não foi possível enviar agora. Tente o WhatsApp ou telefone.' },
      { status: 500 },
    );
  }
};
