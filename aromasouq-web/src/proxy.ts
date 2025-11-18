import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always show locale prefix in URL
})

// Routes that require authentication
// Note: /cart and /checkout removed to support guest users with guest-checkout flow
const protectedRoutes = ['/account', '/orders', '/wishlist']
const vendorRoutes = ['/vendor']
const adminRoutes = ['/admin']

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/register']

// Public routes that don't require authentication
const publicRoutes = ['/become-vendor']

function getLocale(request: NextRequest): string {
  // Check if there's a locale in the pathname
  const pathname = request.nextUrl.pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameLocale) return pathnameLocale

  // Check for Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0]
    if (locales.includes(preferredLocale as any)) {
      return preferredLocale
    }
  }

  return defaultLocale
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // === LOCALE HANDLING via next-intl ===
  // Let next-intl handle all locale detection, URL rewriting, and redirection
  const intlResponse = intlMiddleware(request)

  // If intlMiddleware returns a redirect, return it immediately
  if (intlResponse.headers.get('x-middleware-redirect')) {
    return intlResponse
  }

  // === AUTHENTICATION HANDLING ===
  // Get the auth cookie (match backend cookie name)
  const authCookie = request.cookies.get('access_token')
  const isAuthenticated = !!authCookie

  // Extract the actual path without locale prefix for auth checks
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/'

  // Check if route is public (always accessible)
  const isPublicRoute = publicRoutes.some(route => pathWithoutLocale.startsWith(route))

  // Skip auth checks for public routes
  if (isPublicRoute) {
    return intlResponse
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some(route => pathWithoutLocale.startsWith(route))
  const isVendorRoute = vendorRoutes.some(route => pathWithoutLocale.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathWithoutLocale.startsWith(route))

  // Redirect to login if trying to access protected routes without auth
  if ((requiresAuth || isVendorRoute || isAdminRoute) && !isAuthenticated) {
    const locale = getLocale(request)
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathWithoutLocale)
    return NextResponse.redirect(loginUrl)
  }

  // NOTE: Removed redirect from login/register when authenticated
  // Let the login/register pages handle their own redirect logic client-side
  // This prevents issues with stale cookies blocking access to login page

  // Note: Role-based authorization (vendor/admin) should be handled
  // client-side or with proper JWT validation for production

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
