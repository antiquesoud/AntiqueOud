'use client'

import { useState, useEffect } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  MessageSquare,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Tag,
  FolderTree
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const t = useTranslations('admin.layout')
  const tCommon = useTranslations('common')

  const navigation = [
    { name: t('dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('users'), href: '/admin/users', icon: Users },
    { name: t('vendors'), href: '/admin/vendors', icon: Store },
    { name: t('products'), href: '/admin/products', icon: Package },
    { name: t('brands'), href: '/admin/brands', icon: Tag },
    { name: t('categories'), href: '/admin/categories', icon: FolderTree },
    { name: t('reviews'), href: '/admin/reviews', icon: MessageSquare },
    { name: t('orders'), href: '/admin/orders', icon: ShoppingCart },
    { name: t('settings'), href: '/admin/settings', icon: Settings },
  ]

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login')
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || t('aromasouq')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 w-64 h-full bg-deep-navy text-white transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-oud-gold to-amber flex items-center justify-center font-heading font-bold text-deep-navy">
                A
              </div>
              <div>
                <h2 className="font-heading font-bold text-oud-gold">{t('aromasouq')}</h2>
                <p className="text-xs text-gray-400">{t('adminPanel')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Admin info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-oud-gold text-deep-navy">
                  {userName?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-oud-gold text-deep-navy font-medium"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link href="/" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <Home className="h-5 w-5 mr-3" />
                {t('backToHomepage')}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white border-b lg:hidden">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-heading font-bold text-oud-gold">{tCommon('brandName')}</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
