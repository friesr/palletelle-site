import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getOperationalControlSurface } from '@/lib/services/system-status-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireAdmin();
  const data = await getOperationalControlSurface();
  return NextResponse.json(data);
}
