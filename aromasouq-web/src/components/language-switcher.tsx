'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
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
  const { isRTL } = useDirection();

  const switchLocale = (newLocale: string) => {
    // The i18n router automatically handles locale switching
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#B3967D]/50 rounded-full transition-colors"
          aria-label="Change language"
        >
          <Globe className="h-5 w-5 text-gray-700" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => switchLocale('en')}
          className={locale === 'en' ? 'bg-[#B3967D]/50 font-bold text-[var(--color-oud-gold)]' : 'cursor-pointer'}
        >
          <span className="flex items-center gap-2">
            {locale === 'en' && <span className="text-[var(--color-oud-gold)]">✓</span>}
            <span>English</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale('ar')}
          className={locale === 'ar' ? 'bg-[#B3967D]/50 font-bold text-[var(--color-oud-gold)]' : 'cursor-pointer'}
        >
          <span className="flex items-center gap-2">
            {locale === 'ar' && <span className="text-[var(--color-oud-gold)]">✓</span>}
            <span>العربية</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
