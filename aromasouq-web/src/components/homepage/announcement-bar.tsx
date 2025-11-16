/**
 * Announcement Bar Component
 * Displays promotional messages at the top of the page
 */

'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function AnnouncementBar() {
  const t = useTranslations('homepage.trust');

  return (
    <div className="bg-gradient-to-r from-[#550000] to-[#6B0000] text-white py-2.5 text-center text-sm">
      <span className="inline-flex items-center gap-2 flex-wrap justify-center px-4">
        <Link
          href="/payment-options"
          className="text-[#ECDBC7] font-semibold hover:underline"
        >
          Buy Now Pay Later Available
        </Link>
        <span className="hidden sm:inline">|</span>
        <Link
          href="/click-collect"
          className="text-[#ECDBC7] font-semibold hover:underline"
        >
          Click & Collect in 2 Hours
        </Link>
      </span>
    </div>
  );
}
