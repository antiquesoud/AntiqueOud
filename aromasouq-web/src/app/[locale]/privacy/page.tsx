import { useTranslations } from 'next-intl';

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacy');

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

        {/* Information Collection */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('infoCollection.title')}
          </h2>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('infoCollection.personalTitle')}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t('infoCollection.personal1')}</li>
            <li>{t('infoCollection.personal2')}</li>
            <li>{t('infoCollection.personal3')}</li>
          </ul>

          <h3 className="text-xl font-medium text-[#6B0000] mt-6 mb-3">
            {t('infoCollection.nonPersonalTitle')}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t('infoCollection.nonPersonal1')}</li>
            <li>{t('infoCollection.nonPersonal2')}</li>
          </ul>
        </section>

        {/* Information Usage */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('infoUsage.title')}
          </h2>
          <p className="text-gray-700 mb-4">{t('infoUsage.description')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t('infoUsage.use1')}</li>
            <li>{t('infoUsage.use2')}</li>
            <li>{t('infoUsage.use3')}</li>
            <li>{t('infoUsage.use4')}</li>
            <li>{t('infoUsage.use5')}</li>
            <li>{t('infoUsage.use6')}</li>
            <li>{t('infoUsage.use7')}</li>
            <li>{t('infoUsage.use8')}</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('infoSharing.title')}
          </h2>
          <p className="text-gray-700">
            {t('infoSharing.description')}
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('dataSecurity.title')}
          </h2>
          <p className="text-gray-700">
            {t('dataSecurity.description')}
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
            {t('yourRights.title')}
          </h2>
          <p className="text-gray-700 mb-4">{t('yourRights.description')}</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>{t('yourRights.right1')}</li>
            <li>{t('yourRights.right2')}</li>
            <li>{t('yourRights.right3')}</li>
            <li>{t('yourRights.right4')}</li>
          </ul>
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
