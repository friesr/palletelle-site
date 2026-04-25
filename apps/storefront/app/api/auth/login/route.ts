import { NextResponse } from 'next/server';
import { checkRateLimit, findCustomerByEmail, issueCustomerSession, verifyPassword } from '@/lib/customer-auth';
import { prisma } from '@/lib/db';

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

  const rateLimit = checkRateLimit(`login:${email || 'anonymous'}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ status: 'error', error: 'rate_limited' }, { status: 429 });
  }

  if (!email || !password) {
    return NextResponse.json({ status: 'error', error: 'invalid_input', expected: { email: 'string', password: 'string' } }, { status: 400 });
  }

  const user = await findCustomerByEmail(email);
  const authMethod = user?.authMethods.find((method) => method.type === 'password' && method.passwordHash);
  if (!user || !authMethod?.passwordHash) {
    return NextResponse.json({ status: 'error', error: 'invalid_credentials' }, { status: 401 });
  }

  const valid = await verifyPassword(password, authMethod.passwordHash);
  if (!valid) {
    return NextResponse.json({ status: 'error', error: 'invalid_credentials' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastSignedInAt: new Date() },
  });
  await issueCustomerSession(user.id);

  return NextResponse.json({
    status: 'ok',
    userId: user.id,
    email: user.email,
    profileId: user.profile?.id ?? null,
  });
}
