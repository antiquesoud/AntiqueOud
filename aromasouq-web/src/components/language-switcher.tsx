'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from '@/i18n/navigation';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { localeNames } from '@/i18n/config';
import { useDirection } from '@/lib/rtl-utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isRTL } = useDirection();

  const switchLocale = (newLocale: string) => {
    // Preserve query parameters when switching locale
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(fullPath, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:h-10 md:w-10 hover:bg-[#B3967D]/30 rounded-full transition-colors"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => switchLocale('en')}
          className={locale === 'en' ? 'bg-[#B3967D]/50 font-bold text-[var(--color-oud-gold)]' : 'cursor-pointer'}
        >
          <span className="flex items-center gap-2">
            <span>English</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale('ar')}
          className={locale === 'ar' ? 'bg-[#B3967D]/50 font-bold text-[var(--color-oud-gold)]' : 'cursor-pointer'}
        >
          <span className="flex items-center gap-2">
            <span>العربية</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
