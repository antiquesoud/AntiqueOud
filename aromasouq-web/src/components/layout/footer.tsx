'use client';

import { Link } from "@/i18n/navigation"
import { Instagram, Facebook, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations, useLocale } from 'next-intl'
import { ArabicBorder } from "@/components/ui/arabic-border"

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-gradient-to-br from-[#550000] to-[#6B0000] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-heading text-2xl text-[#ECDBC7] mb-4" style={{ fontFamily: 'serif' }}>
              {locale === 'ar' ? 'أنتيك العود' : 'Antique Oud'}
            </h3>
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
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">{t('shop')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/products" className="hover:text-[#ECDBC7] transition-colors">{t('allProducts')}</Link></li>
              <li><Link href="/products?categorySlug=perfumes" className="hover:text-[#ECDBC7] transition-colors">{t('perfumes')}</Link></li>
              <li><Link href="/products?categorySlug=oud" className="hover:text-[#ECDBC7] transition-colors">{t('oud')}</Link></li>
              <li><Link href="/products?categorySlug=attars" className="hover:text-[#ECDBC7] transition-colors">{t('attars')}</Link></li>
              <li><Link href="/products?categorySlug=bakhoor" className="hover:text-[#ECDBC7] transition-colors">{t('bakhoor')}</Link></li>
            </ul>
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

      {/* Arabic Geometric Border at Bottom */}
      <ArabicBorder />
    </footer>
  )
}
