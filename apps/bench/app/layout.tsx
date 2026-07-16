import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

const isDraft = (process.env.LLM_BENCH_CHANNEL ?? 'DRAFT') !== 'PUBLISHED';

export const metadata: Metadata = {
  title: 'LLM Bench — Frontier model intelligence',
  description:
    'Compare frontier language models across capability, price, and source evidence.',
  robots: isDraft
    ? {
        index: false,
        follow: false,
        nocache: true,
      }
    : {
        index: true,
        follow: true,
      },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
