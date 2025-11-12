import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsArray,
  IsInt,
  Min,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockAlert?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  video?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsString()
  customBrandName?: string; // Vendor can provide custom brand name instead of selecting from dropdown

  @IsOptional()
  @IsUUID()
  vendorId?: string; // Optional - auto-injected for vendors, required for admins

  // Basic specs
  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  concentration?: string;

  // TIER 1 MANDATORY
  @IsNotEmpty({ message: 'Gender is required' })
  @IsString()
  @IsIn(['men', 'women', 'unisex'], { message: 'Gender must be men, women, or unisex' })
  gender: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // NEW: Enhanced Scent Profile
  @IsOptional()
  @IsString()
  topNotes?: string;

  @IsOptional()
  @IsString()
  heartNotes?: string;

  @IsOptional()
  @IsString()
  baseNotes?: string;

  // TIER 1 MANDATORY
  @IsNotEmpty({ message: 'Scent family is required' })
  @IsString()
  @IsIn(['floral', 'oriental', 'woody', 'fresh', 'citrus', 'fruity', 'spicy', 'aquatic', 'green', 'gourmand', 'musky', 'leather'], { message: 'Invalid scent family' })
  scentFamily: string;

  @IsOptional()
  @IsString()
  longevity?: string;

  @IsOptional()
  @IsString()
  sillage?: string;

  @IsOptional()
  @IsString()
  season?: string;

  // NEW: WhatsApp Integration
  @IsOptional()
  @IsBoolean()
  enableWhatsapp?: boolean;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  // NEW: Coins System
  @IsOptional()
  @IsInt()
  @Min(0)
  coinsToAward?: number;

  // NEW: Enhanced Product Classification (Phase 2) - NOW MANDATORY
  @IsNotEmpty({ message: 'Product type is required' })
  @IsString()
  @IsIn(['ORIGINAL', 'CLONE', 'SIMILAR_DNA', 'NICHE', 'ATTAR', 'BODY_SPRAY', 'BAKHOOR', 'HOME_FRAGRANCE', 'GIFT_SET', 'OUR_BRAND'], { message: 'Invalid product type' })
  productType: string;

  @IsOptional()
  @IsString()
  @IsIn(['UAE', 'SAUDI', 'KUWAIT', 'QATAR', 'OMAN', 'BAHRAIN', 'FRANCE', 'ITALY', 'UK', 'USA', 'INDIA', 'THAILAND'])
  region?: string;

  @IsOptional()
  @IsString()
  occasion?: string; // Comma-separated: "OFFICE,DAILY,PARTY,WEDDING,RAMADAN,EID"

  @IsOptional()
  @IsString()
  @IsIn(['CAMBODIAN', 'INDIAN', 'THAI', 'MALAYSIAN', 'LAOTIAN', 'MUKHALLAT', 'DEHN_AL_OUD'])
  oudType?: string;

  @IsOptional()
  @IsString()
  @IsIn(['RAMADAN', 'SIGNATURE', 'CELEBRITY', 'MOST_LOVED', 'TRENDING', 'EXCLUSIVE', 'OUD_ROYALE', 'DISCOVERY_BOX', 'INSPIRED_BY'])
  collection?: string;

  // NEW FIELDS
  @IsOptional()
  @IsString()
  @IsIn(['SPRAY', 'OIL', 'ROLLON', 'SAMPLE', 'GIFT_SET'])
  format?: string;

  @IsOptional()
  @IsString()
  @IsIn(['BUDGET', 'MID', 'PREMIUM', 'LUXURY', 'ULTRA_LUXURY'])
  priceSegment?: string;

  // SEO
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Flash Sale Fields
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  saleEndDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Min(0)
  discountPercent?: number;
}
