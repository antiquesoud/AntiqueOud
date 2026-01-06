import { useTranslations } from 'next-intl';

export default function RefundPolicyPage() {
  const t = useTranslations('refundPolicy');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#550000] mb-8">
        {t('title')}
      </h1>

      <div className="prose prose-lg max-w-none space-y-8">
        {/* Overview */}
        <section>
          <p className="text-gray-700 text-lg">
            {t('overview')}
          </p>
        </section>

        {/* Return Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('returnPolicy.title')}
          </h2>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('returnPolicy.eligibilityTitle')}
          </h3>
          <p className="text-gray-700 mb-4">{t('returnPolicy.eligibility')}</p>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('returnPolicy.nonReturnableTitle')}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t('returnPolicy.nonReturnable1')}</li>
            <li>{t('returnPolicy.nonReturnable2')}</li>
            <li>{t('returnPolicy.nonReturnable3')}</li>
          </ul>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('returnPolicy.processTitle')}
          </h3>
          <p className="text-gray-700 mb-4">{t('returnPolicy.process')}</p>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('returnPolicy.shippingTitle')}
          </h3>
          <p className="text-gray-700">{t('returnPolicy.shipping')}</p>
        </section>

        {/* Refund Policy */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('refunds.title')}
          </h2>
          <p className="text-gray-700 mb-4">{t('refunds.processing')}</p>
          <p className="text-gray-700 mb-4">{t('refunds.partial')}</p>
          <p className="text-gray-700">{t('refunds.missing')}</p>
        </section>

        {/* Exchanges */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('exchanges.title')}
          </h2>
          <p className="text-gray-700">
            {t('exchanges.description')}
          </p>
        </section>

        {/* Contact Information */}
        <section className="bg-gray-50 p-6 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold text-[#550000] mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-gray-700 mb-4">{t('contact.description')}</p>
          <div className="text-gray-700 space-y-2">
            <p><strong>{t('contact.emailLabel')}:</strong> {t('contact.email')}</p>
            <p><strong>{t('contact.addressLabel')}:</strong> {t('contact.address')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
