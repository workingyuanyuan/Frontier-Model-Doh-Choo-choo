import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { LLMS_TXT_PATH, METHODOLOGY_PATH, sitePath } from '../lib/site-paths';
import './globals.css';
import './leaderboard.css';

export const metadata: Metadata = {
  title: 'FM-DCC — Frontier Model Doh Choo-choo',
  description:
    'Compare frontier language models across capability, price, and source evidence.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="text/plain"
          href={sitePath(LLMS_TXT_PATH)}
          title="llms.txt: machine-readable index of this site's data"
        />
        <link
          rel="alternate"
          type="text/markdown"
          href={sitePath(METHODOLOGY_PATH)}
          title="Methodology"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("fm-dcc-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
