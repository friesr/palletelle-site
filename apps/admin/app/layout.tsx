import './globals.css';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { LogoutButton } from '@/components/logout-button';

export const metadata: Metadata = {
  title: 'Palletelle Admin',
  description: 'Fixture-backed admin review surface for sourcing and staging.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const showAdminChrome = session?.user?.role === 'admin';

  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
          {showAdminChrome ? (
            <header style={{ marginBottom: 24, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>Palletelle Admin</p>
                <h1 style={{ margin: '8px 0 0', fontSize: 30 }}>Staging and review workspace</h1>
              </div>
              <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>
                  Signed in as {session.user?.email ?? session.user?.name ?? 'admin'}
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
