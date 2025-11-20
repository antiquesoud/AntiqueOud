'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Check if pathname includes /admin or /vendor (accounting for locale prefix like /en/admin or /ar/admin)
  const isAdminOrVendor = pathname?.includes('/admin') || pathname?.includes('/vendor')

  return (
    <>
      {!isAdminOrVendor && <Header />}
      <main className="min-h-screen">{children}</main>
      {!isAdminOrVendor && <Footer />}
    </>
  )
}
