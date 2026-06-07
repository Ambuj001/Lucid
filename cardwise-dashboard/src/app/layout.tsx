import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CARDWISE — Smart Card Intelligence',
  description: 'AI-powered credit card recommendation engine. Maximize rewards on every checkout.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
