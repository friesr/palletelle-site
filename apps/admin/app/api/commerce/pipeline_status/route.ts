import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { getLaunchControlData } from '@/lib/services/launch-control-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  await requireAdmin();
  const data = await getLaunchControlData();
  return NextResponse.json({
    generatedAt: data.generatedAt,
    kpis: data.kpis,
    pipeline: data.pipeline,
    hankBrief: data.hankBrief,
    quickAddState: data.quickAddState,
    lastPublishedAt: data.lastPublishedAt,
  });
}
