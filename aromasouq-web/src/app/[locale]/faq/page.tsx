'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-amber-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[#550000] flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#550000] flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
    { question: t('q5'), answer: t('a5') },
    { question: t('q6'), answer: t('a6') },
    { question: t('q7'), answer: t('a7') },
    { question: t('q8'), answer: t('a8') },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-[#550000] mb-6">
        {t('title')}
      </h1>

      <p className="text-gray-700 mb-8">
        {t('description')}
      </p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-[#550000] mb-2">
          {t('stillHaveQuestions')}
        </h2>
        <p className="text-gray-700 mb-4">
          {t('contactUs')}
        </p>
        <a
          href="/contact"
          className="inline-block px-6 py-2 bg-gradient-to-r from-[#550000] to-[#6B0000] text-white font-semibold rounded-full hover:shadow-lg transition-all"
        >
          {t('contactButton')}
        </a>
      </div>
    </div>
  );
}
