import type { ReactNode } from 'react';

import '../globals.css';

export default function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
