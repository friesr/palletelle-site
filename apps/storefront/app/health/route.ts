import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Lightweight health probe for the tunneled API service.
 * Confirms the web service is up and the database is reachable.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', service: 'storefront-api', database: 'reachable' });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'storefront-api',
        database: 'unreachable',
        detail: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 },
    );
  }
}
