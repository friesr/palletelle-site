import './globals.css';
import type { Metadata } from 'next';
import { EnvironmentBadge } from '@/components/environment-badge';

export const metadata: Metadata = {
  title: 'Atelier',
  description: 'A trustworthy color-matching clothing ensemble website.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-6 py-6">
          <header className="mb-10 flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-black/50">Atelier</p>
              <h1 className="text-2xl font-semibold">Trustworthy ensemble guidance</h1>
            </div>
            <EnvironmentBadge />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
