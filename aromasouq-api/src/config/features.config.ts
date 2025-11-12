// ==========================================
// FEATURE CONFIGURATION
// Central feature flag management for single/multi-vendor mode
// ==========================================

export interface FeatureFlags {
  // Multi-Vendor System
  ENABLE_MULTI_VENDOR: boolean;
  ENABLE_VENDOR_REGISTRATION: boolean;
  ENABLE_VENDOR_DASHBOARD: boolean;

  // UI Features (for frontend)
  SHOW_VENDOR_INFO_ON_PRODUCTS: boolean;
  SHOW_VENDOR_FILTER_IN_SEARCH: boolean;

  // Default Vendor Configuration
  DEFAULT_VENDOR_ID: string;
  AUTO_ASSIGN_DEFAULT_VENDOR: boolean;
}

export const FEATURES: FeatureFlags = {
  // ==========================================
  // MULTI-VENDOR FEATURES: DISABLED BY DEFAULT
  // Set ENABLE_MULTI_VENDOR=true in .env to enable marketplace mode
  // ==========================================
  ENABLE_MULTI_VENDOR: process.env.ENABLE_MULTI_VENDOR === 'true',

  // Vendor registration is disabled in single-vendor mode
  ENABLE_VENDOR_REGISTRATION: process.env.ENABLE_MULTI_VENDOR === 'true',

  // Vendor dashboard is ALWAYS enabled (default vendor needs it)
  ENABLE_VENDOR_DASHBOARD: true,

  // Hide vendor info from customers in single-vendor mode
  SHOW_VENDOR_INFO_ON_PRODUCTS: process.env.ENABLE_MULTI_VENDOR === 'true',
  SHOW_VENDOR_FILTER_IN_SEARCH: process.env.ENABLE_MULTI_VENDOR === 'true',

  // Default vendor configuration
  DEFAULT_VENDOR_ID: process.env.DEFAULT_VENDOR_ID || '',
  AUTO_ASSIGN_DEFAULT_VENDOR: process.env.ENABLE_MULTI_VENDOR !== 'true',
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if multi-vendor mode is enabled
 */
export function isMultiVendorEnabled(): boolean {
  return FEATURES.ENABLE_MULTI_VENDOR;
}

/**
 * Check if vendor registration is allowed
 */
export function isVendorRegistrationEnabled(): boolean {
  return FEATURES.ENABLE_VENDOR_REGISTRATION;
}

/**
 * Get default vendor ID (for single-vendor mode)
 */
export function getDefaultVendorId(): string {
  if (!FEATURES.DEFAULT_VENDOR_ID && !FEATURES.ENABLE_MULTI_VENDOR) {
    throw new Error(
      'DEFAULT_VENDOR_ID must be set in .env when ENABLE_MULTI_VENDOR is false'
    );
  }
  return FEATURES.DEFAULT_VENDOR_ID;
}

/**
 * Validate feature configuration on startup
 * This ensures proper setup before the app runs
 */
export function validateFeatureConfig(): void {
  // In single-vendor mode, DEFAULT_VENDOR_ID is required
  if (!FEATURES.ENABLE_MULTI_VENDOR && !FEATURES.DEFAULT_VENDOR_ID) {
    console.warn(
      '⚠️  WARNING: DEFAULT_VENDOR_ID not set. Please run `pnpm db:seed` to create default vendor.'
    );
  }

  // Log current mode
  const mode = FEATURES.ENABLE_MULTI_VENDOR ? 'MULTI-VENDOR' : 'SINGLE-VENDOR';
  console.log(`🎯 Running in ${mode} mode`);

  if (!FEATURES.ENABLE_MULTI_VENDOR) {
    console.log('   - Vendor registration: BLOCKED');
    console.log('   - Vendor dashboard: ENABLED (for default vendor)');
    console.log(`   - Default vendor ID: ${FEATURES.DEFAULT_VENDOR_ID || 'NOT SET'}`);
  }
}

// ==========================================
// FEATURE FLAG GUARDS (for use in controllers)
// ==========================================

export function requireMultiVendor(): void {
  if (!FEATURES.ENABLE_MULTI_VENDOR) {
    throw new Error('This feature is only available in multi-vendor mode');
  }
}

export function requireSingleVendor(): void {
  if (FEATURES.ENABLE_MULTI_VENDOR) {
    throw new Error('This feature is only available in single-vendor mode');
  }
}
