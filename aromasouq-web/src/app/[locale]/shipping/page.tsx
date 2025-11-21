import { useTranslations } from 'next-intl';
import { Package, Truck, MapPin, Clock } from 'lucide-react';

export default function ShippingPage() {
  const t = useTranslations('shipping');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#550000] mb-6">
        {t('title')}
      </h1>

      <p className="text-gray-700 mb-8">
        {t('description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-8 w-8 text-[#550000]" />
            <h2 className="text-xl font-semibold text-[#550000]">
              {t('uaeShipping')}
            </h2>
          </div>
          <p className="text-gray-700 mb-2">{t('uaeShippingContent')}</p>
          <p className="text-sm text-gray-600">{t('uaeFreeShipping')}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-[#550000]" />
            <h2 className="text-xl font-semibold text-[#550000]">
              {t('internationalShipping')}
            </h2>
          </div>
          <p className="text-gray-700 mb-2">{t('internationalContent')}</p>
          <p className="text-sm text-gray-600">{t('internationalNote')}</p>
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold text-[#550000] mb-4">
          {t('deliveryTimes')}
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>{t('deliveryTime1')}</li>
          <li>{t('deliveryTime2')}</li>
          <li>{t('deliveryTime3')}</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('tracking')}
        </h2>
        <p className="text-gray-700 mb-6">
          {t('trackingContent')}
        </p>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('packaging')}
        </h2>
        <p className="text-gray-700 mb-6">
          {t('packagingContent')}
        </p>

        <div className="bg-amber-50 border-l-4 border-[#550000] p-4 mt-8">
          <div className="flex items-start gap-3">
            <Package className="h-6 w-6 text-[#550000] mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>{t('note')}:</strong> {t('noteContent')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
