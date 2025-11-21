import type { Metadata } from "next";
import { Changa, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeDirections } from '@/i18n/config';
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "react-hot-toast";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import "../globals.css";

// Antique Oud Brand Fonts
const changa = Changa({
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-changa",
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

// Fallback for English
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Keep for compatibility
const notoArabic = ibmPlexArabic; // Alias for backward compatibility
const arabic = ibmPlexArabic; // Alias

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar'
      ? "أنتيك العود - أرقى أنواع العود العربي الأصيل"
      : "Antique Oud - Finest Traditional Arabic Oud",
    description: locale === 'ar'
      ? "اكتشف أرقى أنواع العود العربي الأصيل في الإمارات. تسوق من أنتيك العود - عطور تراثية فاخرة مستوحاة من التراث العربي الأصيل."
      : "Discover the finest traditional Arabic oud in the UAE. Shop at Antique Oud - luxury heritage fragrances inspired by authentic Arab heritage.",
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params first
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  // Get text direction for the current locale
  const direction = localeDirections[locale as keyof typeof localeDirections];

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${changa.variable} ${ibmPlexArabic.variable} antialiased min-h-screen`}
        style={{ fontFamily: locale === 'ar' ? 'var(--font-ibm-plex-arabic)' : 'var(--font-inter)' }}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <WhatsAppButton />
            <Toaster
              position={direction === 'rtl' ? 'top-left' : 'top-right'}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1A1F2E',
                  color: '#fff',
                },
              }}
            />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
