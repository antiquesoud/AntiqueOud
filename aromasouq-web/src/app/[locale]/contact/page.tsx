import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#550000] mb-6">
        {t('title')}
      </h1>

      <p className="text-gray-700 mb-8">
        {t('description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Contact Information */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[#550000] mb-4">
            {t('contactInfo')}
          </h2>

          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 text-[#550000] mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('email')}</h3>
              <p className="text-gray-700">info@antiqueoud.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="h-6 w-6 text-[#550000] mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('phone')}</h3>
              <p className="text-gray-700">+971 50 123 4567</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-[#550000] mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('address')}</h3>
              <p className="text-gray-700">Dubai, United Arab Emirates</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-[#550000] mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('hours')}</h3>
              <p className="text-gray-700">{t('hoursContent')}</p>
            </div>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-[#550000] mb-4">
            {t('sendMessage')}
          </h2>
          <p className="text-gray-700 mb-4">
            {t('formComingSoon')}
          </p>
          <p className="text-sm text-gray-600">
            {t('formNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
