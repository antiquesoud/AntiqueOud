import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale
});

// Export Next.js hooks directly (not from next-intl)
export { useParams, useSearchParams } from 'next/navigation';
