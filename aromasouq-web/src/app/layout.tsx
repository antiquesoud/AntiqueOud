import type { ReactNode } from 'react';

// This is a minimal root layout
// The actual layout with i18n is in app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
