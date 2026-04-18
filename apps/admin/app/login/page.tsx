import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginForm } from '@/app/login/login-form';
import { getSeededAdminValidation } from '@/lib/auth/seeded-admin';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.role === 'admin') {
    redirect('/');
  }

  const validation = getSeededAdminValidation();

  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <section style={{ width: '100%', maxWidth: 460, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 24, padding: 28 }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.55 }}>Palletelle Admin</p>
        <h1 style={{ margin: '10px 0 0', fontSize: 30 }}>Secure sign in</h1>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(0,0,0,0.72)' }}>
          This admin surface is restricted to seeded admin users with hashed credentials and server-enforced session checks.
        </p>
        {!validation.valid ? (
          <div style={{ marginTop: 16, borderRadius: 16, background: '#FFF4F3', border: '1px solid rgba(138,59,52,0.15)', padding: 14 }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#8A3B34' }}>Auth setup incomplete</p>
            <p style={{ margin: '8px 0 0', color: '#8A3B34', fontSize: 14 }}>
              {validation.reasons.join(' ')}
            </p>
          </div>
        ) : null}
        <div style={{ marginTop: 20 }}>
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
