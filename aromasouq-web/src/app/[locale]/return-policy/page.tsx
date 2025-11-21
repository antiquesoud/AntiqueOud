import { useTranslations } from 'next-intl';

export default function ReturnPolicyPage() {
  const t = useTranslations('returnPolicy');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#550000] mb-6">
        {t('title')}
      </h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 mb-6">
          {t('description')}
        </p>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('returnWindow')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('returnWindowContent')}
        </p>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('conditions')}
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>{t('condition1')}</li>
          <li>{t('condition2')}</li>
          <li>{t('condition3')}</li>
          <li>{t('condition4')}</li>
        </ul>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('process')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('processContent')}
        </p>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('refunds')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('refundsContent')}
        </p>

        <div className="bg-amber-50 border-l-4 border-[#550000] p-4 mt-8">
          <p className="text-sm text-gray-700">
            <strong>{t('note')}:</strong> {t('noteContent')}
          </p>
        </div>
      </div>
    </div>
  );
}
