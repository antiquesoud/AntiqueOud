// ==========================================
// FRONTEND FEATURE FLAGS
// Synced with backend feature configuration
// ==========================================

export const FEATURES = {
  // Multi-vendor mode (controlled by environment variable)
  ENABLE_MULTI_VENDOR: process.env.NEXT_PUBLIC_ENABLE_MULTI_VENDOR === 'true',

  // Public vendor registration
  SHOW_VENDOR_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_MULTI_VENDOR === 'true',

  // Vendor dashboard (always available for default vendor)
  SHOW_VENDOR_DASHBOARD: true,

  // Show vendor information to customers
  SHOW_VENDOR_INFO: process.env.NEXT_PUBLIC_ENABLE_MULTI_VENDOR === 'true',

  // Show vendor filter in search/products
  SHOW_VENDOR_FILTER: process.env.NEXT_PUBLIC_ENABLE_MULTI_VENDOR === 'true',

  // Show vendor management in admin
  SHOW_VENDOR_ADMIN: true, // Admin can always manage vendors
} as const;

/**
 * Check if multi-vendor features should be displayed
 */
export function shouldShowVendorFeatures(): boolean {
  return FEATURES.ENABLE_MULTI_VENDOR;
}

/**
 * Check if vendor registration should be shown
 */
export function shouldShowVendorRegistration(): boolean {
  return FEATURES.SHOW_VENDOR_REGISTRATION;
}

/**
 * Check if vendor info should be shown to customers
 */
export function shouldShowVendorInfo(): boolean {
  return FEATURES.SHOW_VENDOR_INFO;
}

/**
 * Get mode label for UI
 */
export function getVendorModeLabel(): string {
  return FEATURES.ENABLE_MULTI_VENDOR ? 'Multi-Vendor Marketplace' : 'Single Vendor Store';
}
