import { NextResponse } from 'next/server';
import { checkRateLimit, createCustomerUser, issueCustomerSession } from '@/lib/customer-auth';

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') ?? '';
  let body: Record<string, unknown> = {};
  if (contentType.includes('application/json')) {
    body = await request.json().catch(() => ({}));
  } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData().catch(() => null);
    if (formData) {
      body = Object.fromEntries(formData.entries());
    }
  }
  const email = typeof body.email === 'string' ? body.email : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const displayName = typeof body.displayName === 'string' ? body.displayName : '';

  const rateLimit = checkRateLimit(`register:${email || 'anonymous'}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ status: 'error', error: 'rate_limited' }, { status: 429 });
  }

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ status: 'error', error: 'invalid_input', expected: { email: 'string', password: 'string>=8', displayName: 'string(optional)' } }, { status: 400 });
  }

  try {
    const user = await createCustomerUser({ email, password, displayName });
    await issueCustomerSession(user.id);
    return NextResponse.json({
      status: 'ok',
      userId: user.id,
      email: user.email,
      profileId: user.profile?.id ?? null,
      colorProfileId: user.colorProfile?.id ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ status: 'error', error: 'email_exists' }, { status: 409 });
    }
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
