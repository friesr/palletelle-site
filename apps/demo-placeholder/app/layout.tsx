import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Palletelle',
  description: 'Quiet premium style guidance, launching soon.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', background: '#f7f3ee', color: '#171412' }}>{children}</body>
    </html>
  );
}
