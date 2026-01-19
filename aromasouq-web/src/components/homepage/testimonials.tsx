/**
 * Testimonials Component
 * Auto-sliding carousel of customer reviews
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  rating: number;
  review: string;
  reviewAr: string;
  product: string;
  productAr: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Al-Mansouri',
    nameAr: 'سارة المنصوري',
    location: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    rating: 5,
    review: 'The most exquisite oud I have ever experienced. The scent is rich, long-lasting, and truly authentic. Every time I wear it, I receive compliments. Antique Oud has become my signature fragrance!',
    reviewAr: 'أروع عود جربته على الإطلاق. الرائحة غنية وثابتة وأصيلة حقًا. في كل مرة أرتديه، أتلقى الإطراءات. أصبح أنتيك العود عطري المميز!',
    product: 'Royal Oud Collection',
    productAr: 'مجموعة العود الملكي',
    image: '👩'
  },
  {
    id: 2,
    name: 'Mohammed Al-Rashid',
    nameAr: 'محمد الراشد',
    location: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    rating: 5,
    review: 'Outstanding quality and exceptional customer service. The fragrances are luxurious and remind me of traditional Arabian heritage. I highly recommend Antique Oud to anyone seeking authentic perfumes.',
    reviewAr: 'جودة ممتازة وخدمة عملاء استثنائية. العطور فاخرة وتذكرني بالتراث العربي الأصيل. أوصي بشدة بأنتيك العود لكل من يبحث عن عطور أصيلة.',
    product: 'Dehnal Oud Premium',
    productAr: 'دهن العود الفاخر',
    image: '👨'
  },
  {
    id: 3,
    name: 'Fatima Al-Hashimi',
    nameAr: 'فاطمة الهاشمي',
    location: 'Muscat, Oman',
    locationAr: 'مسقط، عمان',
    rating: 5,
    review: 'I am absolutely in love with their attar collection! The packaging is beautiful, the scents are divine, and the prices are reasonable. This is my go-to store for all special occasions.',
    reviewAr: 'أنا معجبة تمامًا بمجموعة العطور لديهم! التغليف جميل والروائح إلهية والأسعار معقولة. هذا متجري المفضل لجميع المناسبات الخاصة.',
    product: 'Attar Al Amber',
    productAr: 'عطر العنبر',
    image: '👩'
  },
  {
    id: 4,
    name: 'Ahmed Al-Balushi',
    nameAr: 'أحمد البلوشي',
    location: 'Doha, Qatar',
    locationAr: 'الدوحة، قطر',
    rating: 5,
    review: 'The bakhoor selection is phenomenal! It fills my home with the most beautiful, traditional Arabian scent. The quality is premium and the delivery was surprisingly fast. Will definitely order again!',
    reviewAr: 'مجموعة البخور رائعة! تملأ منزلي بأجمل رائحة عربية تقليدية. الجودة ممتازة والتوصيل كان سريعًا بشكل مفاجئ. سأطلب بالتأكيد مرة أخرى!',
    product: 'Premium Bakhoor Set',
    productAr: 'مجموعة البخور الفاخرة',
    image: '👨'
  },
  {
    id: 5,
    name: 'Noura Al-Kuwari',
    nameAr: 'نورة الكواري',
    location: 'Abu Dhabi, UAE',
    locationAr: 'أبوظبي، الإمارات',
    rating: 5,
    review: 'Pure luxury in every bottle! The perfumes last all day and the scent evolution is remarkable. My husband gifted me the signature collection and I could not be happier. Worth every dirham!',
    reviewAr: 'رفاهية خالصة في كل زجاجة! العطور تدوم طوال اليوم وتطور الرائحة ملحوظ. أهداني زوجي المجموعة المميزة ولا يمكنني أن أكون أسعد. تستحق كل درهم!',
    product: 'Signature Perfume Collection',
    productAr: 'مجموعة العطور المميزة',
    image: '👩'
  },
  {
    id: 6,
    name: 'Khalid Al-Shamsi',
    nameAr: 'خالد الشامسي',
    location: 'Sharjah, UAE',
    locationAr: 'الشارقة، الإمارات',
    rating: 5,
    review: 'Fantastic experience from start to finish. The website is easy to navigate, the product descriptions are detailed, and the actual products exceeded my expectations. True artisans of Arabian fragrances!',
    reviewAr: 'تجربة رائعة من البداية للنهاية. الموقع سهل التصفح ووصف المنتجات مفصل والمنتجات الفعلية فاقت توقعاتي. حرفيون حقيقيون للعطور العربية!',
    product: 'Oud Wood Essence',
    productAr: 'عطر خشب العود',
    image: '👨'
  }
];

export function Testimonials() {
  const t = useTranslations('homepage.testimonials');
  const locale = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div
      className="relative overflow-hidden py-16 mt-12 bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      

      <div className="container mx-auto px-[5%] relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#B3967D] text-[#550000] px-4 py-1.5 rounded-full mb-3 shadow-lg text-xs font-bold tracking-wide">
            <Star className="w-4 h-4 fill-current" />
            <span>
              {locale === 'ar' ? 'آراء العملاء' : 'CUSTOMER REVIEWS'}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl text-[#550000] font-bold mb-2">
            {locale === 'ar' ? 'آراء عملائنا' : 'What Our Customers Say'}
          </h2>

          <p className="text-base text-gray-600">
            {locale === 'ar'
              ? 'من تجربة عملائنا… ما يثبت جودة ما نصنعه.'
              : 'Real experiences from our valued customers'
            }
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto relative">
          {/* Testimonial Card */}
          <div
            key={currentIndex}
            className="bg-gradient-to-br from-[#ECDBC7] to-[#D4C4B0] rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden animate-fade-in"
          >
            {/* Quote Icon */}
            <Quote className="absolute top-6 right-6 w-16 h-16 text-[#550000]/10" />

            {/* Rating Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < currentTestimonial.rating
                      ? 'text-[#550000] fill-current'
                      : 'text-[#550000]/30'
                  }`}
                />
              ))}
            </div>

            {/* Review Text */}
            <p className={`text-lg md:text-xl text-[#2C1810] leading-relaxed mb-8 text-center font-medium ${
              locale === 'ar' ? 'font-arabic' : ''
            }`}>
              "{locale === 'ar' ? currentTestimonial.reviewAr : currentTestimonial.review}"
            </p>

            {/* Customer Info */}
            <div className="text-center">
              <div className="mb-2">
                <p className="text-lg font-bold text-[#550000]">
                  {locale === 'ar' ? currentTestimonial.nameAr : currentTestimonial.name}
                </p>
                <p className="text-sm text-[#2C1810]/70">
                  {locale === 'ar' ? currentTestimonial.locationAr : currentTestimonial.location}
                </p>
              </div>
              <p className="text-xs text-[#550000]/60 font-semibold">
                {locale === 'ar' ? 'اشترى: ' : 'Purchased: '}
                {locale === 'ar' ? currentTestimonial.productAr : currentTestimonial.product}
              </p>
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#B3967D] ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-[#B3967D]'
                    : 'w-3 h-3 bg-[#B3967D]/40 hover:bg-[#B3967D]/60'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
