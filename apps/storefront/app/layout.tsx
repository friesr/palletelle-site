import './globals.css';
import type { Metadata } from 'next';
import { EnvironmentBadge } from '@/components/environment-badge';
import { LogoMark } from '@/components/logo-mark';

export const metadata: Metadata = {
  title: 'Palletelle',
  description: 'A color-led storefront that invites you to build a palette profile first, then discover pieces with more flattering, intentional guidance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-[96rem] px-5 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <header className="mb-8 flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center sm:justify-between xl:mb-12 xl:pb-6">
            <LogoMark />
            <EnvironmentBadge />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
