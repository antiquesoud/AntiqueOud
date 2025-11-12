/**
 * Oud Collection Showcase Component
 * Displays different types of Oud with descriptions
 */

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const oudTypes = [
  {
    icon: '🪔',
    translationKey: 'cambodian',
    slug: 'CAMBODIAN',
  },
  {
    icon: '💎',
    translationKey: 'indian',
    slug: 'INDIAN',
  },
  {
    icon: '✨',
    translationKey: 'thai',
    slug: 'THAI',
  },
  {
    icon: '🌙',
    translationKey: 'dehnAlOud',
    slug: 'MUKHALLAT',
  },
];

export function OudCollection() {
  const t = useTranslations('homepage.oudCollection');
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0f0a] via-[#3d2817] to-[#5c3a1f] py-20 mb-0">
      {/* Artistic decorative elements - Arabian patterns and premium accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Arabian geometric patterns */}
        <svg className="absolute top-16 left-[8%] w-32 h-32 opacity-15" viewBox="0 0 100 100" fill="none">
          <path d="M50 10 L65 35 L90 35 L70 52 L78 77 L50 60 L22 77 L30 52 L10 35 L35 35 Z" fill="url(#oud-star-gradient)" stroke="#B3967D" strokeWidth="1" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="#B3967D" strokeWidth="1" opacity="0.6" />
          <defs>
            <linearGradient id="oud-star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B3967D" opacity="0.3" />
              <stop offset="100%" stopColor="#B3967D" opacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="absolute bottom-24 right-[10%] w-28 h-28 opacity-15 animate-pulse" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="30" fill="none" stroke="#B3967D" strokeWidth="2" opacity="0.6" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#B3967D" strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="50" r="10" fill="url(#oud-circle-gradient)" opacity="0.7" />
          <defs>
            <radialGradient id="oud-circle-gradient">
              <stop offset="0%" stopColor="#B3967D" opacity="0.5" />
              <stop offset="100%" stopColor="#B3967D" opacity="0.1" />
            </radialGradient>
          </defs>
        </svg>

        {/* Oud incense smoke effect - wavy lines */}
        <svg className="absolute top-1/4 right-[15%] w-20 h-40 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} viewBox="0 0 50 100" fill="none">
          <path d="M 25,100 Q 15,75 25,50 Q 35,25 25,0" stroke="#B3967D" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
          <path d="M 30,100 Q 20,75 30,50 Q 40,25 30,0" stroke="#B3967D" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round"/>
        </svg>

        <svg className="absolute bottom-1/3 left-[12%] w-16 h-32 opacity-20 animate-pulse" style={{ animationDelay: '1s' }} viewBox="0 0 50 100" fill="none">
          <path d="M 25,100 Q 35,75 25,50 Q 15,25 25,0" stroke="#ECDBC7" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round"/>
          <path d="M 20,100 Q 30,75 20,50 Q 10,25 20,0" stroke="#B3967D" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round"/>
        </svg>

        {/* Premium glowing orbs */}
        <div className="absolute top-28 right-[25%] w-96 h-96 bg-[#B3967D]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-[20%] w-80 h-80 bg-[#B3967D]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8b0000]/15 rounded-full blur-3xl"></div>

        {/* Golden sparkles */}
        <div className="absolute top-32 left-[28%] w-3 h-3 bg-[#B3967D] rounded-full shadow-[0_0_25px_10px_rgba(250,204,21,0.7)] animate-pulse"></div>
        <div className="absolute top-52 right-[32%] w-2 h-2 bg-[#B3967D] rounded-full shadow-[0_0_20px_8px_rgba(251,191,36,0.6)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-44 left-[22%] w-2 h-2 bg-[#B3967D] rounded-full shadow-[0_0_20px_8px_rgba(234,179,8,0.6)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-2/3 right-[18%] w-3 h-3 bg-[#B3967D] rounded-full shadow-[0_0_25px_10px_rgba(245,158,11,0.7)] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        {/* Arabian arch patterns */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-5" viewBox="0 0 1000 1000" fill="none">
          <path d="M 200,400 Q 200,300 250,250 Q 300,200 350,250 Q 400,300 400,400" stroke="#B3967D" strokeWidth="3" fill="none" opacity="0.3" />
          <path d="M 600,600 Q 600,500 650,450 Q 700,400 750,450 Q 800,500 800,600" stroke="#B3967D" strokeWidth="3" fill="none" opacity="0.25" />
        </svg>
      </div>

      <div className="container mx-auto px-[5%] relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B3967D] via-[#B3967D] to-[#B3967D] text-[#2D2D2D] font-bold px-6 py-2.5 rounded-full mb-5 shadow-2xl text-sm font-black tracking-wider border-2 border-[#B3967D]/40 animate-pulse">
            <span className="text-xl">🪔</span>
            <span>{t('badge').toUpperCase()}</span>
            <span className="text-xl">💎</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-black mb-4 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B3967D] via-[#B3967D] to-[#ECDBC7]">
              {t('title')}
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-[#ECDBC7] font-semibold max-w-3xl mx-auto drop-shadow-lg">
            ✨ {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {oudTypes.map((oud) => (
            <Link
              key={oud.slug}
              href={`/products?oudType=${oud.slug}`}
              className="rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_30px_80px_rgba(255,215,0,0.4)] cursor-pointer border-2 border-[#B3967D]/30 group bg-gradient-to-br from-[#ECDBC7] to-[#ECDBC7]"
            >
              <div className="h-[280px] bg-gradient-to-br from-[#B3967D] via-[#B3967D] to-[#B3967D] flex items-center justify-center text-9xl relative overflow-hidden">
                {/* Animated glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,215,0,0.3),transparent_50%)]"></div>
                {/* Icon with animation */}
                <span className="relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 filter brightness-110">{oud.icon}</span>
              </div>
              <div className="p-6 text-center bg-gradient-to-br from-white to-[#ECDBC7]">
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8b0000] to-[#550000] mb-2">
                  {t(`oudTypes.${oud.translationKey}.name`)}
                </div>
                <div className="text-sm text-gray-700 font-medium mb-5">
                  {t(`oudTypes.${oud.translationKey}.description`)}
                </div>
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B3967D] via-[#B3967D] to-[#B3967D] text-[#2D2D2D] font-bold px-6 py-3 rounded-full font-black text-sm transition-all duration-300 hover:shadow-[0_8px_24px_rgba(245,158,11,0.5)] hover:scale-105 border-2 border-[#B3967D]/30">
                  <span>{t('exploreCollection')}</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white"></div>
    </div>
  );
}
