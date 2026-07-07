import { NextResponse } from 'next/server';
import { clearDashboardSessionCookie } from '@/lib/dashboard-session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearDashboardSessionCookie(response);
  return response;
}
