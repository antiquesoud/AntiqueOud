"use client"

import { useEffect } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ui/product-card"
import { useWishlist } from "@/hooks/useWishlist"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import { useTranslations } from "next-intl"

export default function WishlistPage() {
  const router = useRouter()
  const { isAuthenticated, hasHydrated } = useAuth()
  const t = useTranslations('account')
  const tProducts = useTranslations('products')
  const tCommon = useTranslations('common')
  const { wishlist, isLoading, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [hasHydrated, isAuthenticated, router])

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-oud-gold"></div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('emptyWishlist')}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t('emptyWishlistDescription')}
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/products">{tProducts('viewDetails')}</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('myWishlist')}</h1>
          <p className="text-muted-foreground">{wishlist.length} {t('items')}</p>
        </div>
        <Button variant="outline">{t('shareWishlist')}</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {wishlist.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ProductCard
                product={product}
                isWishlisted={true}
                onToggleWishlist={() => toggleWishlist(product.id)}
                onAddToCart={() => addToCart({ productId: product.id, quantity: 1 })}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
