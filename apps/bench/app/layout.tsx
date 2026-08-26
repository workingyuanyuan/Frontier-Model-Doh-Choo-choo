import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import './leaderboard.css';

export const metadata: Metadata = {
  title: 'FM-DCC — Frontier Model Doh Choo-choo',
  description:
    'Compare frontier language models across capability, price, and source evidence.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="blue" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("fm-dcc-theme");if(t==="light"||t==="dark"||t==="blue")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
