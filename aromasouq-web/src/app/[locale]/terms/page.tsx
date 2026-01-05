import { useTranslations } from 'next-intl';

export default function TermsOfServicePage() {
  const t = useTranslations('terms');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#550000] mb-8">
        {t('title')}
      </h1>

      <div className="prose prose-lg max-w-none space-y-8">
        {/* Introduction */}
        <section>
          <p className="text-gray-700">
            {t('introduction')}
          </p>
        </section>

        {/* 1. Acceptance of Terms */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('acceptance.title')}
          </h2>
          <p className="text-gray-700">
            {t('acceptance.description')}
          </p>
        </section>

        {/* 2. Use of Website */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('useOfWebsite.title')}
          </h2>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('useOfWebsite.eligibilityTitle')}
          </h3>
          <p className="text-gray-700 mb-4">{t('useOfWebsite.eligibility')}</p>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('useOfWebsite.registrationTitle')}
          </h3>
          <p className="text-gray-700 mb-4">{t('useOfWebsite.registration')}</p>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('useOfWebsite.securityTitle')}
          </h3>
          <p className="text-gray-700">{t('useOfWebsite.security')}</p>
        </section>

        {/* 3. Orders and Payments */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('orders.title')}
          </h2>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('orders.acceptanceTitle')}
          </h3>
          <p className="text-gray-700 mb-4">{t('orders.acceptance')}</p>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('orders.pricingTitle')}
          </h3>
          <p className="text-gray-700 mb-4">{t('orders.pricing')}</p>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('orders.paymentsTitle')}
          </h3>
          <p className="text-gray-700">{t('orders.payments')}</p>
        </section>

        {/* 4. Intellectual Property */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('intellectualProperty.title')}
          </h2>
          <p className="text-gray-700">
            {t('intellectualProperty.description')}
          </p>
        </section>

        {/* 5. User Content */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('userContent.title')}
          </h2>
          <p className="text-gray-700">
            {t('userContent.description')}
          </p>
        </section>

        {/* 6. Limitation of Liability */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('liability.title')}
          </h2>
          <p className="text-gray-700">
            {t('liability.description')}
          </p>
        </section>

        {/* 7. Indemnification */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('indemnification.title')}
          </h2>
          <p className="text-gray-700">
            {t('indemnification.description')}
          </p>
        </section>

        {/* 8. Governing Law */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('governingLaw.title')}
          </h2>
          <p className="text-gray-700">
            {t('governingLaw.description')}
          </p>
        </section>

        {/* 9. Changes to Terms */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('changes.title')}
          </h2>
          <p className="text-gray-700">
            {t('changes.description')}
          </p>
        </section>

        {/* 10. Contact Us */}
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
