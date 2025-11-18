"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Trash2, Edit, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { VariantFormDialog } from "./VariantFormDialog"

export interface ProductVariant {
  id?: string
  name: string
  nameAr: string
  sku: string
  price: number
  salePrice?: number
  compareAtPrice?: number
  stock: number
  size: string
  isActive?: boolean
  sortOrder?: number
}

interface ProductVariantManagerProps {
  productId?: string
  productType: string
  baseSku: string
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  mode: "create" | "edit"
}

export function ProductVariantManager({
  productId,
  productType,
  baseSku,
  variants,
  onVariantsChange,
  mode,
}: ProductVariantManagerProps) {
  const t = useTranslations("vendor.products.variants")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [isLoadingPresets, setIsLoadingPresets] = useState(false)

  const handleAddVariant = (variant: ProductVariant) => {
    if (editingVariant && editingVariant.id) {
      // Update existing variant
      onVariantsChange(
        variants.map((v) => (v.id === editingVariant.id ? { ...variant, id: editingVariant.id } : v))
      )
    } else {
      // Add new variant with temporary ID
      const tempId = `temp-${Date.now()}`
      onVariantsChange([...variants, { ...variant, id: tempId }])
    }
    setIsDialogOpen(false)
    setEditingVariant(null)
  }

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant)
    setIsDialogOpen(true)
  }

  const handleDeleteVariant = (variantId: string) => {
    onVariantsChange(variants.filter((v) => v.id !== variantId))
  }

  const handleLoadPresets = async () => {
    setIsLoadingPresets(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/variant-presets/${productType}`
      )
      const presets = await response.json()

      // Convert presets to variants with SKUs
      const newVariants: ProductVariant[] = presets.map((preset: any, index: number) => ({
        id: `temp-${Date.now()}-${index}`,
        name: preset.name,
        nameAr: preset.nameAr,
        size: preset.size,
        sku: `${baseSku}-${preset.size.toUpperCase()}`,
        price: preset.defaultPrice || 0,
        stock: preset.stock || 0,
        isActive: true,
        sortOrder: index,
      }))

      onVariantsChange(newVariants)
    } catch (error) {
      console.error("Failed to load presets:", error)
    } finally {
      setIsLoadingPresets(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <div className="flex gap-2">
            {variants.length === 0 && productType && (
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadPresets}
                disabled={isLoadingPresets}
              >
                {isLoadingPresets ? t("loadingPresets") : t("loadPresets")}
              </Button>
            )}
            <Button
              type="button"
              onClick={() => {
                setEditingVariant(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addVariant")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("noVariants")}</p>
            <p className="text-sm mt-2">{t("noVariantsHint")}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("size")}</TableHead>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("stock")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.size}</TableCell>
                  <TableCell>
                    <div>
                      <div>{variant.name}</div>
                      <div className="text-sm text-muted-foreground">{variant.nameAr}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{variant.sku}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className={variant.salePrice ? "text-sm line-through text-muted-foreground" : ""}>
                        AED {variant.price.toFixed(2)}
                      </div>
                      {variant.salePrice && (
                        <div className="font-medium text-green-600">
                          AED {variant.salePrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant.stock > 0 ? "default" : "destructive"}>
                      {variant.stock} {t("units")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant.isActive !== false ? "default" : "secondary"}>
                      {variant.isActive !== false ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVariant(variant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <VariantFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleAddVariant}
          variant={editingVariant}
          baseSku={baseSku}
          existingSkus={variants.map((v) => v.sku)}
          existingVariants={variants}
        />
      </CardContent>
    </Card>
  )
}
