import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { createManualSubmission, createManualSubmissions } from '@/lib/services/manual-submission-service';

export const dynamic = 'force-dynamic';

function parseLines(value?: string) {
  return (value ?? '')
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  const body = (await request.json()) as {
    sourceUrl?: string;
    sourceUrls?: string[];
    sourceUrlsText?: string;
    sourceIdentifier?: string;
    title?: string;
    notes?: string;
  };

  const submittedBy = session.user?.email ?? session.user?.name ?? 'admin';
  const sourceUrls = [
    ...(Array.isArray(body.sourceUrls) ? body.sourceUrls : []),
    ...parseLines(body.sourceUrlsText),
    ...(body.sourceUrl?.trim() ? [body.sourceUrl.trim()] : []),
  ].map((value) => value.trim()).filter(Boolean);

  const created = sourceUrls.length > 1
    ? await createManualSubmissions({
        sourceUrls,
        title: body.title?.trim() || undefined,
        notes: body.notes?.trim() || undefined,
        submittedBy,
      })
    : await createManualSubmission({
        sourceUrl: sourceUrls[0] ?? '',
        sourceIdentifier: body.sourceIdentifier?.trim() || undefined,
        title: body.title?.trim() || undefined,
        notes: body.notes?.trim() || undefined,
        submittedBy,
      });

  ['/', '/products', '/products/manual-submission', '/data-sources'].forEach((path) => revalidatePath(path));

  return NextResponse.json({ ok: true, created, createdCount: Array.isArray(created) ? created.length : 1 });
}
