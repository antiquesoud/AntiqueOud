import type { ReactNode } from 'react';

// This is a minimal root layout - just a passthrough
// The actual layout with i18n, html/body tags is in app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
