'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

const WhatsAppButtonComponent = () => {
  const t = useTranslations('whatsapp');

  // WhatsApp business number - update this with actual number
  const whatsappNumber = '+971501234567';
  const whatsappMessage = encodeURIComponent(t('defaultMessage'));
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
      aria-label={t('chatWithUs')}
      style={{
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
        {t('chatWithUs')}
      </span>
    </a>
  );
};

export const WhatsAppButton = memo(WhatsAppButtonComponent);
