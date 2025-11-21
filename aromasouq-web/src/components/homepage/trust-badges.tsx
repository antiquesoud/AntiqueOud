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

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-full mb-3">
                  <Icon className="h-6 w-6 text-[#550000]" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
