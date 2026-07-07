import { brand } from '@/lib/brand';
import { Env } from '@/libs/Env';
import { logger } from '@/libs/Logger';

/**
 * Sends a 6-digit password reset code to a registered dashboard user.
 */
export async function sendDashboardPasswordResetEmail(email: string, code: string) {
  const apiKey = Env.RESEND_API_KEY;
  if (!apiKey?.startsWith('re_')) {
    logger.error('Password reset e-mail skipped: RESEND_API_KEY not configured');
    return { ok: false as const, reason: 'email_not_configured' as const };
  }

  const from = Env.RESEND_FROM_EMAIL ?? `${brand.name} <onboarding@resend.dev>`;
  const subject = `${brand.name} — código para redefinir senha do painel`;
  const text = [
    `Olá,`,
    '',
    `Recebemos um pedido para redefinir a senha do painel administrativo (${brand.name}).`,
    '',
    `Seu código de verificação: ${code}`,
    '',
    'Este código expira em 15 minutos e só pode ser usado uma vez.',
    'Se você não solicitou esta alteração, ignore este e-mail.',
    '',
    `— Equipe ${brand.name}`,
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      text,
      html: text.replaceAll('\n', '<br>'),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error('Failed to send dashboard password reset e-mail', {
      status: response.status,
      body,
      to: email,
    });
    return { ok: false as const, reason: 'send_failed' as const };
  }

  return { ok: true as const };
}
