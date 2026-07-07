import { NextResponse } from 'next/server';
import * as z from 'zod';
import { authenticateDashboardUser } from '@/lib/dashboard-allowlist';
import { normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { setDashboardSessionCookie } from '@/lib/dashboard-session';

const BodySchema = z.object({
  email: z.string().trim().min(3).max(320).transform(normalizeAllowlistEmail),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 422 });
  }

  const user = await authenticateDashboardUser(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setDashboardSessionCookie(response, {
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return response;
}
