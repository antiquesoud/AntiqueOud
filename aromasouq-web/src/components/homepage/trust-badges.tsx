'use client';

import { Shield, Package, TruckIcon, Award, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TrustBadges() {
  const t = useTranslations('trustBadges');

  const badges = [
    {
      icon: Shield,
      title: t('securePayment'),
      description: t('securePaymentDesc'),
    },
    {
      icon: Award,
      title: t('authentic'),
      description: t('authenticDesc'),
    },
    {
      icon: Package,
      title: t('freeReturns'),
      description: t('freeReturnsDesc'),
    },
    {
      icon: TruckIcon,
      title: t('fastShipping'),
      description: t('fastShippingDesc'),
    },
    {
      icon: CheckCircle,
      title: t('genuine'),
      description: t('genuineDesc'),
    },
  ];

  // Duplicate badges for seamless infinite scroll
  const duplicatedBadges = [...badges, ...badges];

  return (
    <section className="bg-gradient-to-r from-[#ECDBC7] via-[#f5e6d3] to-[#ECDBC7] py-3 overflow-hidden border-b border-[#B3967D]/30">
      <div className="relative">
        {/* Marquee container */}
        <div className="flex animate-marquee hover:pause-animation">
          {duplicatedBadges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-6 md:px-8 whitespace-nowrap"
              >
                <div className="bg-white/80 p-1.5 rounded-full shadow-sm">
                  <Icon className="h-4 w-4 text-[#550000]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#550000] text-xs md:text-sm">
                    {badge.title}
                  </span>
                  <span className="text-[#550000]/60 text-[10px] md:text-xs hidden sm:inline">
                    - {badge.description}
                  </span>
                </div>
                {/* Separator dot */}
                <span className="ml-4 w-1.5 h-1.5 rounded-full bg-[#550000]/30"></span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
