import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * UpdateProductDto extends PartialType(CreateProductDto) which makes all fields optional.
 * This ensures all fields from CreateProductDto can be updated, including:
 * - Basic info: name, nameAr, slug, description, descriptionAr
 * - Pricing: price, compareAtPrice, cost
 * - Inventory: sku, barcode, stock, lowStockAlert
 * - Media: images, video
 * - Category/Brand: categoryId, brandId, customBrandName
 * - Specs: size, concentration, gender
 * - Scent: notes, topNotes, heartNotes, baseNotes, scentFamily, longevity, sillage, season
 * - Classification: productType, region, occasion, oudType, collection, format, priceSegment
 * - Features: enableWhatsapp, whatsappNumber, coinsToAward
 * - SEO: metaTitle, metaDescription
 * - Status: isActive, isFeatured
 * - Flash Sale: isOnSale, salePrice, saleEndDate, discountPercent
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  // All fields are inherited from CreateProductDto as optional via PartialType
  // No need to re-declare - this was causing enum mismatches before
}
