'use client';

import { Link } from "@/i18n/navigation"
import { Instagram, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations, useLocale } from 'next-intl'

// WhatsApp icon component (not available in lucide-react)
function WhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-gradient-to-br from-[#550000] to-[#6B0000] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="mb-4">
              <h3
                className="text-2xl md:text-3xl font-black text-[#ECDBC7] leading-none"
                style={{
                  fontFamily: 'Cairo, Amiri, serif',
                  letterSpacing: '0.02em',
                  textShadow: '0 0 1px rgba(236, 219, 199, 0.8), 0 0 2px rgba(236, 219, 199, 0.4)',
                  fontWeight: 900,
                  WebkitTextStroke: '0.3px #ECDBC7'
                }}
              >
                أنتيك العود
              </h3>
              <p
                className="text-[10px] md:text-xs text-[#ECDBC7] font-bold leading-tight mt-1"
                style={{
                  fontFamily: 'Cairo, Amiri, serif',
                  letterSpacing: '0.01em',
                  fontWeight: 700
                }}
              >
                ارث من الماضي وطيب للحاضر
              </p>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              {t('description')}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="text-white hover:text-[#ECDBC7]">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-[#ECDBC7]">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:text-[#ECDBC7]">
                <WhatsApp className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">{t('customerService')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-[#ECDBC7] transition-colors">{t('about')}</Link></li>
              <li><Link href="/contact" className="hover:text-[#ECDBC7] transition-colors">{t('contact')}</Link></li>
              <li><Link href="/shipping" className="hover:text-[#ECDBC7] transition-colors">{t('shippingInfo')}</Link></li>
              <li><Link href="/returns" className="hover:text-[#ECDBC7] transition-colors">{t('returns')}</Link></li>
              <li><Link href="/faq" className="hover:text-[#ECDBC7] transition-colors">{t('faq')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">{t('newsletter')}</h4>
            <p className="text-sm text-gray-300 mb-4">
              {t('newsletterDescription')}
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t('yourEmail')}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button variant="primary">{t('subscribe')}</Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>{t('copyright')}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[#ECDBC7] transition-colors">{t('privacy')}</Link>
            <Link href="/terms" className="hover:text-[#ECDBC7] transition-colors">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
