import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { text } from '@/assets/locales';
import '@/assets/styles/tokens.css';

export const metadata: Metadata = { title: text.app.title };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
