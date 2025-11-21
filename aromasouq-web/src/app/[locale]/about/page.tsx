import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#550000] mb-6">
        {t('title')}
      </h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 mb-4">
          {t('description')}
        </p>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('ourStory')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('storyContent')}
        </p>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('ourMission')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('missionContent')}
        </p>

        <h2 className="text-2xl font-semibold text-[#550000] mt-8 mb-4">
          {t('whyChooseUs')}
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>{t('reason1')}</li>
          <li>{t('reason2')}</li>
          <li>{t('reason3')}</li>
          <li>{t('reason4')}</li>
        </ul>
      </div>
    </div>
  );
}
