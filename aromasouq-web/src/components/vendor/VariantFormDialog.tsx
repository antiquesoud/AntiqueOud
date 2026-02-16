"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { ProductVariant } from "./ProductVariantManager"

const variantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  size: z.string().min(1, "Size is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.string().min(1, "Price is required").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Price must be 0 or greater"),
  salePrice: z.string().optional(),
  compareAtPrice: z.string().optional(),
  stock: z.string().min(1, "Stock is required").refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number.isInteger(Number(val)), "Stock must be a whole number 0 or greater"),
})

type VariantFormValues = z.infer<typeof variantSchema>

// Transform function to convert form values to ProductVariant
const transformFormValues = (values: VariantFormValues) => {
  return {
    ...values,
    price: Number(values.price),
    stock: Number(values.stock),
    salePrice: values.salePrice && values.salePrice !== '' ? Number(values.salePrice) : undefined,
    compareAtPrice: values.compareAtPrice && values.compareAtPrice !== '' ? Number(values.compareAtPrice) : undefined,
  }
}

interface VariantFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (variant: ProductVariant) => void
  variant: ProductVariant | null
  baseSku: string
  existingSkus: string[]
  existingVariants?: ProductVariant[] // Add this to check for duplicate sizes
}

export function VariantFormDialog({
  open,
  onOpenChange,
  onSubmit,
  variant,
  baseSku,
  existingSkus,
  existingVariants = [],
}: VariantFormDialogProps) {
  const t = useTranslations("vendor.products.variants")

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      size: "",
      sku: "",
      price: "0",
      salePrice: "",
      compareAtPrice: "",
      stock: "0",
    },
  })

  // Watch name field for auto-generation of size and SKU
  const nameValue = form.watch("name")

  // Auto-generate size (slug) and SKU from name (only for new variants)
  useEffect(() => {
    if (open && !variant && nameValue && baseSku) {
      // Create size slug from name (e.g., "1 Tola" -> "1-tola", "100 ML" -> "100-ml")
      const sizeSlug = nameValue.trim().toLowerCase().replace(/\s+/g, "-")

      // Create SKU suffix from name (e.g., "1 Tola" -> "1-TOLA")
      const skuSuffix = nameValue.trim().toUpperCase().replace(/\s+/g, "-").substring(0, 20)
      const generatedSku = `${baseSku}-${skuSuffix}`

      // Only update if different to avoid infinite loops
      if (form.getValues("size") !== sizeSlug) {
        form.setValue("size", sizeSlug)
      }
      if (form.getValues("sku") !== generatedSku) {
        form.setValue("sku", generatedSku)
      }
    }
  }, [nameValue, baseSku, open, variant, form])

  // Reset form when dialog opens/closes or variant changes
  useEffect(() => {
    if (open) {
      if (variant) {
        form.reset({
          name: variant.name,
          nameAr: variant.nameAr,
          size: variant.size,
          sku: variant.sku,
          price: variant.price.toString(),
          salePrice: variant.salePrice?.toString() ?? "",
          compareAtPrice: variant.compareAtPrice?.toString() ?? "",
          stock: variant.stock.toString(),
        })
      } else {
        form.reset({
          name: "",
          nameAr: "",
          size: "",
          sku: "", // Let auto-generation handle SKU, don't pre-populate
          price: "0",
          salePrice: "",
          compareAtPrice: "",
          stock: "0",
        })
      }
    }
  }, [open, variant, baseSku, form])

  const handleSubmit = (values: VariantFormValues) => {
    // Check for duplicate name (excluding current variant if editing)
    const isDuplicateName = existingVariants.some(
      (existingVariant) =>
        existingVariant.name.toLowerCase().trim() === values.name.toLowerCase().trim() &&
        (!variant || existingVariant.name !== variant.name)
    )

    if (isDuplicateName) {
      form.setError("name", {
        type: "manual",
        message: "A variant with this name already exists",
      })
      return
    }

    // Check for duplicate SKU (excluding current variant if editing)
    const isDuplicateSku = existingSkus.some(
      (existingSku) => existingSku === values.sku && (!variant || variant.sku !== values.sku)
    )

    if (isDuplicateSku) {
      form.setError("sku", {
        type: "manual",
        message: t("duplicateSku"),
      })
      return
    }

    const transformedValues = transformFormValues(values)
    onSubmit({
      ...transformedValues,
      isActive: true,
      sortOrder: variant?.sortOrder ?? 0,
    })
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{variant ? t("editVariant") : t("addVariant")}</DialogTitle>
          <DialogDescription>{t("variantFormDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nameLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3 Grams" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nameArLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 3 غرام" dir="rtl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("sizeLabel")} (Auto)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Auto-generated from name"
                        {...field}
                        readOnly
                        className="bg-gray-50 text-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                    {!variant && nameValue && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Auto-generated from name
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("skuLabel")} (Auto)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={baseSku ? `${baseSku}-...` : "Auto-generated"}
                        {...field}
                        readOnly
                        className="bg-gray-50 text-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                    {!variant && baseSku && nameValue && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Auto-generated from name. Base: {baseSku}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("priceLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("salePriceLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="compareAtPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("compareAtPriceLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("stockLabel")}</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit">{variant ? t("updateVariant") : t("addVariant")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
