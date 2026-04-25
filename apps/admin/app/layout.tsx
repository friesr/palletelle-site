import './globals.css';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { AdminNav } from '@/components/admin-nav';
import { LogoutButton } from '@/components/logout-button';

export const metadata: Metadata = {
  title: 'Palletelle Admin Command Center',
  description: 'Operational admin dashboard for Palletelle.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const showAdminChrome = session?.user?.role === 'admin';

  return (
    <html lang="en" data-theme="dark">
      <body>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: 20 }}>
          {showAdminChrome ? (
            <header style={{ marginBottom: 16, border: '1px solid var(--border)', background: 'var(--panel-strong)', borderRadius: 24, padding: 18, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Palletelle Admin</p>
                <h1 style={{ margin: '6px 0 0', fontSize: 30 }}>Command center</h1>
                <AdminNav />
              </div>
              <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                  Signed in as {session.user?.email ?? session.user?.name ?? 'admin'}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                  Security state: {session.user?.securityState === 'active' ? 'active' : 'bootstrap lock'}
                </p>
                <LogoutButton />
              </div>
            </header>
          ) : null}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
