import { NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';

export async function GET() {
  const user = await getAuthenticatedCustomer();
  if (!user) {
    return NextResponse.json({ status: 'error', error: 'unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'ok',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    profile: user.profile,
    colorProfile: user.colorProfile,
  });
}
