"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Package, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"

interface ProductVariant {
  id: string
  name: string
  nameAr: string
  sku: string
  price: number
  salePrice?: number
  compareAtPrice?: number
  stock: number
  size: string
  isActive: boolean
  sortOrder: number
}

interface VariantSelectorProps {
  productId: string
  selectedVariantId: string | null
  onVariantChange: (variantId: string | null, variant: ProductVariant | null) => void
}

export function VariantSelector({
  productId,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  const t = useTranslations("products")
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.get(`/products/${productId}/variants`) as ProductVariant[]
        const activeVariants = response.filter((v: ProductVariant) => v.isActive)
        setVariants(activeVariants)
      } catch (error) {
        console.error("Failed to fetch variants:", error)
        setVariants([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchVariants()
  }, [productId])

  // Auto-select first variant (separate effect to avoid race conditions)
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId && !isLoading) {
      onVariantChange(variants[0].id, variants[0])
    }
  }, [variants, selectedVariantId, isLoading, onVariantChange])

  // Don't render if no variants or still loading
  if (isLoading || variants.length === 0) {
    return null
  }

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  return (
    <div className="mb-4 sm:mb-6">
      <span className="text-xs sm:text-sm font-black text-gray-700 block mb-2 sm:mb-3 flex items-center gap-2">
        <Package className="h-4 w-4" />
        {t("selectSize")}
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId
          const isOutOfStock = variant.stock === 0

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onVariantChange(variant.id, variant)}
              disabled={isOutOfStock}
              className={`
                relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left
                ${
                  isSelected
                    ? "border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg scale-105"
                    : isOutOfStock
                    ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-amber-200 bg-white hover:border-amber-400 hover:shadow-md hover:scale-102"
                }
              `}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}

              {/* Size */}
              <div className="font-black text-sm sm:text-base text-gray-800 mb-1">
                {variant.size}
              </div>

              {/* Name */}
              <div className="text-xs text-gray-600 mb-2">{variant.name}</div>

              {/* Price */}
              <div className="space-y-1">
                {variant.salePrice ? (
                  <>
                    <div className="text-xs text-gray-500 line-through">
                      {formatCurrency(variant.price)}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                      {formatCurrency(variant.salePrice)}
                    </div>
                  </>
                ) : (
                  <div className="text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                    {formatCurrency(variant.price)}
                  </div>
                )}
              </div>

              {/* Stock badge */}
              {isOutOfStock ? (
                <Badge variant="destructive" className="mt-2 text-xs">
                  {t("outOfStock")}
                </Badge>
              ) : variant.stock < 10 ? (
                <Badge variant="secondary" className="mt-2 text-xs bg-yellow-100 text-yellow-800">
                  {t("lowStock")}: {variant.stock}
                </Badge>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Selected variant info */}
      {selectedVariant && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-700">
            <span className="font-bold">{t("selected")}:</span>{" "}
            <span className="text-gray-800 font-semibold">
              {selectedVariant.name} ({selectedVariant.size})
            </span>
            {" • "}
            {selectedVariant.salePrice ? (
              <>
                <span className="text-gray-500 line-through text-xs">
                  {formatCurrency(selectedVariant.price)}
                </span>
                {" "}
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  {formatCurrency(selectedVariant.salePrice)}
                </span>
              </>
            ) : (
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                {formatCurrency(selectedVariant.price)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
