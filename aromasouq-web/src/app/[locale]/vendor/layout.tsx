"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { Home, Package, ShoppingBag, Star, BarChart3, Settings, LogOut, Flame, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

const navigationKeys = [
  { key: 'dashboard', href: '/vendor', icon: Home },
  { key: 'products', href: '/vendor/products', icon: Package },
  { key: 'flashSales', href: '/vendor/flash-sales', icon: Flame },
  { key: 'coupons', href: '/vendor/coupons', icon: Ticket },
  { key: 'orders', href: '/vendor/orders', icon: ShoppingBag },
  { key: 'reviews', href: '/vendor/reviews', icon: Star },
  { key: 'analytics', href: '/vendor/analytics', icon: BarChart3 },
  { key: 'settings', href: '/vendor/settings', icon: Settings },
]

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('vendor.layout')
  const tCommon = useTranslations('common')
  const { user, isAuthenticated, isVendor, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !isVendor) {
      router.push('/login')
    }
  }, [isAuthenticated, isVendor, router])

  if (!isAuthenticated || !isVendor) {
    return null
  }

  const vendor = user?.vendor || {
    businessName: user?.firstName + "'s Store" || "Vendor Store",
    logo: null,
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-deep-navy text-white flex flex-col fixed h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-6">
          <Link href="/vendor" className="block">
            <h2 className="text-2xl font-heading text-oud-gold">{tCommon('brandName')}</h2>
            <p className="text-sm text-gray-300 mt-1">{t('vendorPortal')}</p>
          </Link>
        </div>

        <Separator className="bg-white/10" />

        {/* Vendor Info */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={vendor.logo || undefined} />
              <AvatarFallback className="bg-oud-gold text-deep-navy">
                {vendor.businessName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{vendor.businessName}</p>
              <p className="text-xs text-gray-400">{t('vendorAccount')}</p>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationKeys.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{t(item.key)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10"
            onClick={() => logout()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
