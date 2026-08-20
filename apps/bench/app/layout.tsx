import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import './leaderboard.css';

export const metadata: Metadata = {
  title: 'LLM Bench — Frontier model intelligence',
  description:
    'Compare frontier language models across capability, price, and source evidence.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
