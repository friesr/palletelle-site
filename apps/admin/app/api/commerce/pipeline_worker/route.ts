import { NextResponse } from 'next/server';
import { getProductPipelineMetrics, runProductPipelineBatch } from '@/lib/services/product-pipeline-worker';

export async function GET() {
  const metrics = await getProductPipelineMetrics();
  return NextResponse.json({ status: 'ok', metrics });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const limit = typeof body.limit === 'number' ? body.limit : 5;
  const results = await runProductPipelineBatch(limit);
  const metrics = await getProductPipelineMetrics();
  return NextResponse.json({ status: 'ok', results, metrics });
}
