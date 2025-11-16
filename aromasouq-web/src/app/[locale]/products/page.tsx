'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ui/product-card';
import { Filter, X, ChevronDown, ChevronUp, Home, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useDirection } from '@/lib/rtl-utils';

// Context data for dynamic page rendering
const scentFamilyIcons: Record<string, string> = {
  floral: "🌸",
  fruity: "🍎",
  fresh: "🌊",
  aquatic: "🌊",
  oriental: "🌟",
  woody: "🌳",
  citrus: "🍊",
  spicy: "🌶️",
  green: "🌿",
  gourmand: "🍬"
};

const regionFlags: Record<string, string> = {
  UAE: "🇦🇪",
  SAUDI: "🇸🇦",
  KUWAIT: "🇰🇼",
  QATAR: "🇶🇦",
  OMAN: "🇴🇲",
  BAHRAIN: "🇧🇭",
  FRANCE: "🇫🇷",
  ITALY: "🇮🇹",
  UK: "🇬🇧",
  USA: "🇺🇸",
  INDIA: "🇮🇳",
  THAILAND: "🇹🇭",
  HINDI: "🇮🇳",
  SILANI: "🇱🇰",
  CAMBODI: "🇰🇭",
  PHILIPINI: "🇵🇭",
  MERUKE: "🇮🇩"
};

const occasionIcons: Record<string, string> = {
  OFFICE: "💼",
  DAILY: "🌞",
  PARTY: "🎉",
  WEDDING: "💍",
  RAMADAN: "🌙",
  EID: "✨",
  DATE: "💝"
};

const collectionIcons: Record<string, string> = {
  RAMADAN: "🌙",
  SIGNATURE: "⭐",
  CELEBRITY: "👑",
  MOST_LOVED: "❤️",
  TRENDING: "🔥",
  EXCLUSIVE: "💎"
};

const oudTypeIcons: Record<string, string> = {
  CAMBODIAN: "🪔",
  INDIAN: "💎",
  THAI: "✨",
  MALAYSIAN: "🌴",
  LAOTIAN: "🏔️",
  MUKHALLAT: "🌙"
};

interface PageContext {
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
}

function getPageContext(filters: any, t: any): PageContext {
  // Priority order: Collection > Gender > Scent Family > Region > Occasion > Oud Type > Product Type

  // Collection-specific contexts
  if (filters.collection) {
    const collectionKey = filters.collection;
    const collectionName = t(`collections.${collectionKey}.name`);
    const collectionDesc = t(`collections.${collectionKey}.desc`);
    const collectionSubtitle = t(`collections.${collectionKey}.subtitle`);

    return {
      title: collectionName,
      subtitle: collectionSubtitle,
      icon: collectionIcons[collectionKey] || "✨",
      gradient: "from-[#8B3A3A] via-[#1A1F2E] to-[#C9A86A]",
      description: collectionDesc,
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.collections'), href: "/products" },
        { label: collectionName }
      ]
    };
  }

  // Gender-specific contexts
  if (filters.gender) {
    const gender = filters.gender.toLowerCase();
    const genderData: Record<string, any> = {
      men: {
        title: t('gender.men.title'),
        subtitle: t('gender.men.subtitle'),
        icon: "👔",
        gradient: "from-[#1A1F2E] via-[#2D2D2D] to-[#4A5568]",
        description: t('gender.men.description'),
        breadcrumbs: [
          { label: t('breadcrumbs.home'), href: "/" },
          { label: t('breadcrumbs.shopByGender'), href: "/products" },
          { label: t('gender.men.title') }
        ]
      },
      women: {
        title: t('gender.women.title'),
        subtitle: t('gender.women.subtitle'),
        icon: "👗",
        gradient: "from-[#8B3A3A] via-[#C9A86A] to-[#E8C4A0]",
        description: t('gender.women.description'),
        breadcrumbs: [
          { label: t('breadcrumbs.home'), href: "/" },
          { label: t('breadcrumbs.shopByGender'), href: "/products" },
          { label: t('gender.women.title') }
        ]
      },
      unisex: {
        title: t('gender.unisex.title'),
        subtitle: t('gender.unisex.subtitle'),
        icon: "✨",
        gradient: "from-[#C9A86A] via-[#D4A574] to-[#E8C4A0]",
        description: t('gender.unisex.description'),
        breadcrumbs: [
          { label: t('breadcrumbs.home'), href: "/" },
          { label: t('breadcrumbs.shopByGender'), href: "/products" },
          { label: t('gender.unisex.title') }
        ]
      }
    };

    return genderData[gender] || genderData.unisex;
  }

  // Scent Family contexts
  if (filters.scentFamily) {
    const scentKey = filters.scentFamily.toLowerCase();

    return {
      title: t(`scentFamilies.${scentKey}.title`),
      subtitle: t(`scentFamilies.${scentKey}.subtitle`),
      icon: scentFamilyIcons[scentKey] || "🌺",
      gradient: "from-[#f9f9f9] via-[#e8e8e8] to-[#C9A86A]",
      description: t(`scentFamilies.${scentKey}.description`),
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.shopByScent'), href: "/products" },
        { label: t(`scentFamilies.${scentKey}.name`) + ' ' + t('contexts.scents') }
      ]
    };
  }

  // Region contexts
  if (filters.region) {
    const regionKey = filters.region;
    const regionName = t(`regions.${regionKey}.name`);

    return {
      title: t('contexts.fragrancesFrom', { region: regionName }),
      subtitle: t('contexts.authenticRegionalScents'),
      icon: regionFlags[regionKey] || "🌍",
      gradient: "from-[#D4A574] via-[#C9A86A] to-[#8B3A3A]",
      description: t(`regions.${regionKey}.description`),
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.shopByRegion'), href: "/products" },
        { label: regionName }
      ]
    };
  }

  // Occasion contexts
  if (filters.occasion) {
    const occasionKey = filters.occasion;

    return {
      title: t(`occasions.${occasionKey}.title`),
      subtitle: t(`occasions.${occasionKey}.subtitle`),
      description: t(`occasions.${occasionKey}.description`),
      icon: occasionIcons[occasionKey] || "✨",
      gradient: "from-[#1A1F2E] via-[#8B3A3A] to-[#C9A86A]",
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.shopByOccasion'), href: "/products" },
        { label: t(`occasions.${occasionKey}.title`) }
      ]
    };
  }

  // Oud Type contexts
  if (filters.oudType) {
    const oudKey = filters.oudType;

    return {
      title: t(`oudTypes.${oudKey}.title`),
      subtitle: t(`oudTypes.${oudKey}.subtitle`),
      description: t(`oudTypes.${oudKey}.description`),
      icon: oudTypeIcons[oudKey] || "🪵",
      gradient: "from-[#D4A574] via-[#C9A86A] to-[#8B3A3A]",
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.oudCollection'), href: "/products" },
        { label: t(`oudTypes.${oudKey}.title`) }
      ]
    };
  }

  // Product Type contexts
  if (filters.productType) {
    const typeName = t(`productTypes.${filters.productType}`);

    return {
      title: typeName,
      subtitle: t('contexts.qualityGuaranteed'),
      icon: "✨",
      gradient: "from-[#C9A86A] to-[#D4A574]",
      description: t('contexts.authenticFragrances'),
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.shopByType'), href: "/products" },
        { label: typeName }
      ]
    };
  }

  // Category context
  if (filters.categorySlug) {
    const categoryTitle = filters.categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
      title: categoryTitle,
      subtitle: t('contexts.premiumCollection'),
      icon: "🌹",
      gradient: "from-[#C9A86A] to-[#D4A574]",
      description: t('contexts.authenticFragrances'),
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.categories'), href: "/products" },
        { label: categoryTitle }
      ]
    };
  }

  // Search results context
  if (filters.search) {
    return {
      title: t('contexts.searchResults', { query: filters.search }),
      subtitle: t('contexts.findYourScent'),
      icon: "🔍",
      gradient: "from-[#1A1F2E] to-[#2D2D2D]",
      description: t('contexts.searchDescription', { query: filters.search }),
      breadcrumbs: [
        { label: t('breadcrumbs.home'), href: "/" },
        { label: t('breadcrumbs.search'), href: "/products" },
        { label: `"${filters.search}"` }
      ]
    };
  }

  // Default context
  return {
    title: t('contexts.allFragrances'),
    subtitle: t('contexts.discoverYourScent'),
    icon: "🌹",
    gradient: "from-[#C9A86A] via-[#D4A574] to-[#E8C4A0]",
    description: t('contexts.completeCollection'),
    breadcrumbs: [
      { label: t('breadcrumbs.home'), href: "/" },
      { label: t('breadcrumbs.allProducts') }
    ]
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('productsPage');
  const { isRTL } = useDirection();

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categorySlug: searchParams.get('categorySlug') || searchParams.get('category') || '',
    brandId: searchParams.get('brandId') || searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    gender: searchParams.get('gender') || '',
    concentration: searchParams.get('concentration') || '',
    scentFamily: searchParams.get('scentFamily') || '',
    season: searchParams.get('season') || '',
    productType: searchParams.get('productType') || '',
    region: searchParams.get('region') || '',
    occasion: searchParams.get('occasion') || '',
    oudType: searchParams.get('oudType') || '',
    collection: searchParams.get('collection') || '',
    sort: searchParams.get('sort') || 'createdAt_desc',
  });

  const [page, setPage] = useState(1);

  // Sync filters with URL params whenever they change
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      categorySlug: searchParams.get('categorySlug') || searchParams.get('category') || '',
      brandId: searchParams.get('brandId') || searchParams.get('brand') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      gender: searchParams.get('gender') || '',
      concentration: searchParams.get('concentration') || '',
      scentFamily: searchParams.get('scentFamily') || '',
      season: searchParams.get('season') || '',
      productType: searchParams.get('productType') || '',
      region: searchParams.get('region') || '',
      occasion: searchParams.get('occasion') || '',
      oudType: searchParams.get('oudType') || '',
      collection: searchParams.get('collection') || '',
      sort: searchParams.get('sort') || 'createdAt_desc',
    });
    setPage(1); // Reset to page 1 when filters change
  }, [searchParams]);
  const [showFilters, setShowFilters] = useState(true); // For desktop sidebar toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false); // For mobile sheet
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    gender: true,
    concentration: true,
    scent: true,
    season: true,
    productType: true,
    region: true,
    occasion: true,
    oudType: true,
    collection: true,
  });

  // Get dynamic page context
  const pageContext = useMemo(() => getPageContext(filters, t), [filters, t]);

  const limit = 20;

  // Fetch products with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Add all non-empty filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await apiClient.get(`/products?${params.toString()}`);
      return res;
    },
  });

  // Fetch categories for filter options
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return await apiClient.get('/categories');
    },
  });

  // Fetch brands for filter options
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      return await apiClient.get('/brands');
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      categorySlug: '',
      brandId: '',
      minPrice: '',
      maxPrice: '',
      gender: '',
      concentration: '',
      scentFamily: '',
      season: '',
      productType: '',
      region: '',
      occasion: '',
      oudType: '',
      collection: '',
      sort: 'createdAt_desc',
    };
    setFilters(clearedFilters);
    setPage(1);
    router.push('/products');
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'sort' && value !== ''
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Dynamic Hero Section - Vibrant & Artistic */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${pageContext.gradient} text-white py-8 sm:py-12 md:py-16 lg:py-20 mb-0`}>
        {/* Artistic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Sparkles */}
          <div className="absolute top-20 left-[15%] w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_25px_10px_rgba(253,224,71,0.6)] animate-pulse"></div>
          <div className="absolute top-40 right-[20%] w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_20px_8px_rgba(251,191,36,0.5)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-32 left-[25%] w-2 h-2 bg-orange-300 rounded-full shadow-[0_0_20px_8px_rgba(251,146,60,0.5)] animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Glowing orbs */}
          <div className="absolute top-10 right-[10%] w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-[15%] w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Decorative patterns */}
          <svg className="absolute top-0 right-0 w-64 h-64 opacity-10" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" />
            <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="1.5" opacity="0.7" />
            <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumbs - Hidden on mobile */}
          <nav className="hidden sm:flex items-center gap-2 text-sm mb-6 md:mb-8 text-white/90">
            {pageContext.breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index === 0 && <Home className="w-4 h-4" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-yellow-300 transition-colors font-semibold">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white font-bold">{crumb.label}</span>
                )}
                {index < pageContext.breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-white/60" />
                )}
              </div>
            ))}
          </nav>

          {/* Hero Content */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-6 border border-white/30">
              <span className="text-2xl sm:text-3xl md:text-4xl drop-shadow-lg">{pageContext.icon}</span>
              <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-wider uppercase">{pageContext.subtitle}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black mb-2 sm:mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] leading-tight">
              {pageContext.title}
            </h1>

            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl font-semibold drop-shadow-md">
              {pageContext.description}
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white/20"></div>
      </div>

      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Filters Sidebar - Hidden on mobile, Sheet modal used instead */}
          <aside
            className={`hidden ${showFilters ? 'lg:block' : 'lg:hidden'} lg:w-80 transition-all duration-300 overflow-hidden`}
          >
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl p-6 sticky top-24 border-2 border-amber-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  <Filter className="w-6 h-6 text-amber-600" />
                  {t('ui.filters')}
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1 hover:shadow-lg transition-all hover:scale-105"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t('ui.clearAll')}
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Search */}
                <div>
                  <label className="block text-sm font-black mb-2 text-gray-700">🔍 {t('ui.search')}</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder={t('ui.searchPlaceholder')}
                    className="w-full px-4 py-2.5 text-sm border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold transition-all"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('ui.category')}</label>
                  <select
                    value={filters.categorySlug}
                    onChange={(e) => handleFilterChange('categorySlug', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                  >
                    <option value="">{t('ui.allCategories')}</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('ui.brand')}</label>
                  <select
                    value={filters.brandId}
                    onChange={(e) => handleFilterChange('brandId', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                  >
                    <option value="">{t('ui.allBrands')}</option>
                    {brands?.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.priceRange')}</span>
                    {expandedSections.price ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.price && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        placeholder={t('ui.min')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        placeholder={t('ui.max')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <button
                    onClick={() => toggleSection('gender')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.gender')}</span>
                    {expandedSections.gender ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.gender && (
                    <select
                      value={filters.gender}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.all')}</option>
                      <option value="men">{t('ui.men')}</option>
                      <option value="women">{t('ui.women')}</option>
                      <option value="unisex">{t('ui.unisex')}</option>
                    </select>
                  )}
                </div>

                {/* Concentration */}
                <div>
                  <button
                    onClick={() => toggleSection('concentration')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.concentration')}</span>
                    {expandedSections.concentration ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.concentration && (
                    <select
                      value={filters.concentration}
                      onChange={(e) => handleFilterChange('concentration', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.all')}</option>
                      <option value="EDP">{t('ui.edp')}</option>
                      <option value="EDT">{t('ui.edt')}</option>
                      <option value="EDC">{t('ui.edc')}</option>
                      <option value="Perfume Oil">{t('ui.perfumeOil')}</option>
                      <option value="Parfum">{t('ui.parfum')}</option>
                    </select>
                  )}
                </div>

                {/* Scent Family */}
                <div>
                  <button
                    onClick={() => toggleSection('scent')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.scentFamily')}</span>
                    {expandedSections.scent ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.scent && (
                    <select
                      value={filters.scentFamily}
                      onChange={(e) => handleFilterChange('scentFamily', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.all')}</option>
                      <option value="floral">{t('ui.floral')}</option>
                      <option value="oriental">{t('ui.oriental')}</option>
                      <option value="woody">{t('ui.woody')}</option>
                      <option value="fresh">{t('ui.fresh')}</option>
                      <option value="citrus">{t('ui.citrus')}</option>
                      <option value="fruity">{t('ui.fruity')}</option>
                      <option value="spicy">{t('ui.spicy')}</option>
                      <option value="aquatic">{t('ui.aquatic')}</option>
                      <option value="green">{t('ui.green')}</option>
                      <option value="gourmand">{t('ui.gourmand')}</option>
                    </select>
                  )}
                </div>

                {/* Product Type */}
                <div>
                  <button
                    onClick={() => toggleSection('productType')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.productType')}</span>
                    {expandedSections.productType ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.productType && (
                    <select
                      value={filters.productType}
                      onChange={(e) => handleFilterChange('productType', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.allTypes')}</option>
                      <option value="ORIGINAL">{t('ui.original')}</option>
                      <option value="CLONE">{t('ui.clone')}</option>
                      <option value="SIMILAR_DNA">{t('ui.similarDNA')}</option>
                      <option value="NICHE">{t('ui.niche')}</option>
                      <option value="ATTAR">{t('ui.attar')}</option>
                      <option value="BODY_SPRAY">{t('ui.bodySpray')}</option>
                    </select>
                  )}
                </div>

                {/* Region */}
                <div>
                  <button
                    onClick={() => toggleSection('region')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.regionOrigin')}</span>
                    {expandedSections.region ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.region && (
                    <select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.allRegions')}</option>
                      <option value="UAE">{t('ui.uae')}</option>
                      <option value="SAUDI">{t('ui.saudi')}</option>
                      <option value="KUWAIT">{t('ui.kuwait')}</option>
                      <option value="QATAR">{t('ui.qatar')}</option>
                      <option value="OMAN">{t('ui.oman')}</option>
                      <option value="BAHRAIN">{t('ui.bahrain')}</option>
                      <option value="FRANCE">{t('ui.france')}</option>
                      <option value="ITALY">{t('ui.italy')}</option>
                      <option value="UK">{t('ui.uk')}</option>
                      <option value="USA">{t('ui.usa')}</option>
                      <option value="INDIA">{t('ui.india')}</option>
                      <option value="THAILAND">{t('ui.thailand')}</option>
                      <option value="HINDI">{t('ui.hindi')}</option>
                      <option value="SILANI">{t('ui.silani')}</option>
                      <option value="CAMBODI">{t('ui.cambodi')}</option>
                      <option value="PHILIPINI">{t('ui.philipini')}</option>
                      <option value="MERUKE">{t('ui.meruke')}</option>
                    </select>
                  )}
                </div>

                {/* Occasion */}
                <div>
                  <button
                    onClick={() => toggleSection('occasion')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.occasion')}</span>
                    {expandedSections.occasion ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.occasion && (
                    <select
                      value={filters.occasion}
                      onChange={(e) => handleFilterChange('occasion', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.allOccasions')}</option>
                      <option value="OFFICE">{t('ui.office')}</option>
                      <option value="DAILY">{t('ui.daily')}</option>
                      <option value="PARTY">{t('ui.party')}</option>
                      <option value="WEDDING">{t('ui.wedding')}</option>
                      <option value="RAMADAN">{t('ui.ramadan')}</option>
                      <option value="EID">{t('ui.eid')}</option>
                    </select>
                  )}
                </div>

                {/* Oud Type */}
                <div>
                  <button
                    onClick={() => toggleSection('oudType')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.oudType')}</span>
                    {expandedSections.oudType ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.oudType && (
                    <select
                      value={filters.oudType}
                      onChange={(e) => handleFilterChange('oudType', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.allOudTypes')}</option>
                      <option value="CAMBODIAN">{t('ui.cambodianOud')}</option>
                      <option value="INDIAN">{t('ui.indianOud')}</option>
                      <option value="THAI">{t('ui.thaiOud')}</option>
                      <option value="MALAYSIAN">{t('ui.malaysianOud')}</option>
                      <option value="LAOTIAN">{t('ui.laotianOud')}</option>
                      <option value="MUKHALLAT">{t('ui.mukhallat')}</option>
                    </select>
                  )}
                </div>

                {/* Collection */}
                <div>
                  <button
                    onClick={() => toggleSection('collection')}
                    className="w-full flex items-center justify-between text-sm font-medium mb-2"
                  >
                    <span>{t('ui.collection')}</span>
                    {expandedSections.collection ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections.collection && (
                    <select
                      value={filters.collection}
                      onChange={(e) => handleFilterChange('collection', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                    >
                      <option value="">{t('ui.allCollections')}</option>
                      <option value="RAMADAN">{t('ui.ramadanCollection')}</option>
                      <option value="SIGNATURE">{t('ui.signatureCollection')}</option>
                      <option value="CELEBRITY">{t('ui.celebrityCollection')}</option>
                      <option value="MOST_LOVED">{t('ui.mostLoved')}</option>
                      <option value="TRENDING">{t('ui.trendingNow')}</option>
                      <option value="EXCLUSIVE">{t('ui.exclusive')}</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-white via-amber-50 to-orange-50 rounded-2xl shadow-xl p-3 sm:p-5 mb-6 sm:mb-8 border-2 border-amber-200">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  {/* Mobile Filters Sheet */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <button className="lg:hidden px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#550000] to-[#6B0000] text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap">
                        <Filter className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                        {t('ui.show')} {t('ui.filters')}
                      </button>
                    </SheetTrigger>
                    <SheetContent side={isRTL ? "right" : "left"} className="w-[85vw] sm:w-[400px] overflow-y-auto">
                      <SheetTitle className="text-xl font-black flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-6">
                        <Filter className="w-5 h-5 text-amber-600" />
                        {t('ui.filters')}
                      </SheetTitle>

                      {/* Clear All Button */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all mb-4"
                        >
                          <X className="w-4 h-4" />
                          {t('ui.clearAll')}
                        </button>
                      )}

                      {/* Mobile Filters Content */}
                      <div className="space-y-4">
                        {/* Search */}
                        <div>
                          <label className="block text-sm font-black mb-2 text-gray-700">🔍 {t('ui.search')}</label>
                          <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder={t('ui.searchPlaceholder')}
                            className="w-full px-3 py-2 text-sm border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold transition-all"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium mb-2">{t('ui.category')}</label>
                          <select
                            value={filters.categorySlug}
                            onChange={(e) => handleFilterChange('categorySlug', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                          >
                            <option value="">{t('ui.allCategories')}</option>
                            {categories?.map((cat: any) => (
                              <option key={cat.id} value={cat.slug}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Brand */}
                        <div>
                          <label className="block text-sm font-medium mb-2">{t('ui.brand')}</label>
                          <select
                            value={filters.brandId}
                            onChange={(e) => handleFilterChange('brandId', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent"
                          >
                            <option value="">{t('ui.allBrands')}</option>
                            {brands?.map((brand: any) => (
                              <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Price Range */}
                        <div>
                          <button
                            onClick={() => toggleSection('price')}
                            className="w-full flex items-center justify-between text-sm font-medium mb-2"
                          >
                            <span>{t('ui.priceRange')}</span>
                            {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.price && (
                            <div className="flex gap-2">
                              <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} placeholder={t('ui.min')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent" />
                              <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} placeholder={t('ui.max')} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent" />
                            </div>
                          )}
                        </div>

                        {/* Gender */}
                        <div>
                          <button onClick={() => toggleSection('gender')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.gender')}</span>
                            {expandedSections.gender ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.gender && (
                            <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.all')}</option>
                              <option value="men">{t('ui.men')}</option>
                              <option value="women">{t('ui.women')}</option>
                              <option value="unisex">{t('ui.unisex')}</option>
                            </select>
                          )}
                        </div>

                        {/* Concentration */}
                        <div>
                          <button onClick={() => toggleSection('concentration')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.concentration')}</span>
                            {expandedSections.concentration ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.concentration && (
                            <select value={filters.concentration} onChange={(e) => handleFilterChange('concentration', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.all')}</option>
                              <option value="EDP">{t('ui.edp')}</option>
                              <option value="EDT">{t('ui.edt')}</option>
                              <option value="EDC">{t('ui.edc')}</option>
                              <option value="Perfume Oil">{t('ui.perfumeOil')}</option>
                              <option value="Parfum">{t('ui.parfum')}</option>
                            </select>
                          )}
                        </div>

                        {/* Scent Family */}
                        <div>
                          <button onClick={() => toggleSection('scent')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.scentFamily')}</span>
                            {expandedSections.scent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.scent && (
                            <select value={filters.scentFamily} onChange={(e) => handleFilterChange('scentFamily', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.all')}</option>
                              <option value="floral">{t('ui.floral')}</option>
                              <option value="oriental">{t('ui.oriental')}</option>
                              <option value="woody">{t('ui.woody')}</option>
                              <option value="fresh">{t('ui.fresh')}</option>
                              <option value="citrus">{t('ui.citrus')}</option>
                              <option value="fruity">{t('ui.fruity')}</option>
                              <option value="spicy">{t('ui.spicy')}</option>
                              <option value="aquatic">{t('ui.aquatic')}</option>
                              <option value="green">{t('ui.green')}</option>
                              <option value="gourmand">{t('ui.gourmand')}</option>
                            </select>
                          )}
                        </div>

                        {/* Product Type */}
                        <div>
                          <button onClick={() => toggleSection('productType')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.productType')}</span>
                            {expandedSections.productType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.productType && (
                            <select value={filters.productType} onChange={(e) => handleFilterChange('productType', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.allTypes')}</option>
                              <option value="ORIGINAL">{t('ui.original')}</option>
                              <option value="CLONE">{t('ui.clone')}</option>
                              <option value="SIMILAR_DNA">{t('ui.similarDNA')}</option>
                              <option value="NICHE">{t('ui.niche')}</option>
                              <option value="ATTAR">{t('ui.attar')}</option>
                              <option value="BODY_SPRAY">{t('ui.bodySpray')}</option>
                            </select>
                          )}
                        </div>

                        {/* Region */}
                        <div>
                          <button onClick={() => toggleSection('region')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.regionOrigin')}</span>
                            {expandedSections.region ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.region && (
                            <select value={filters.region} onChange={(e) => handleFilterChange('region', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.allRegions')}</option>
                              <option value="UAE">{t('ui.uae')}</option>
                              <option value="SAUDI">{t('ui.saudi')}</option>
                              <option value="KUWAIT">{t('ui.kuwait')}</option>
                              <option value="QATAR">{t('ui.qatar')}</option>
                              <option value="OMAN">{t('ui.oman')}</option>
                              <option value="BAHRAIN">{t('ui.bahrain')}</option>
                              <option value="FRANCE">{t('ui.france')}</option>
                              <option value="ITALY">{t('ui.italy')}</option>
                              <option value="UK">{t('ui.uk')}</option>
                              <option value="USA">{t('ui.usa')}</option>
                              <option value="INDIA">{t('ui.india')}</option>
                              <option value="THAILAND">{t('ui.thailand')}</option>
                              <option value="HINDI">{t('ui.hindi')}</option>
                              <option value="SILANI">{t('ui.silani')}</option>
                              <option value="CAMBODI">{t('ui.cambodi')}</option>
                              <option value="PHILIPINI">{t('ui.philipini')}</option>
                              <option value="MERUKE">{t('ui.meruke')}</option>
                            </select>
                          )}
                        </div>

                        {/* Occasion */}
                        <div>
                          <button onClick={() => toggleSection('occasion')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.occasion')}</span>
                            {expandedSections.occasion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.occasion && (
                            <select value={filters.occasion} onChange={(e) => handleFilterChange('occasion', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.allOccasions')}</option>
                              <option value="OFFICE">{t('ui.office')}</option>
                              <option value="DAILY">{t('ui.daily')}</option>
                              <option value="PARTY">{t('ui.party')}</option>
                              <option value="WEDDING">{t('ui.wedding')}</option>
                              <option value="RAMADAN">{t('ui.ramadan')}</option>
                              <option value="EID">{t('ui.eid')}</option>
                            </select>
                          )}
                        </div>

                        {/* Oud Type */}
                        <div>
                          <button onClick={() => toggleSection('oudType')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.oudType')}</span>
                            {expandedSections.oudType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.oudType && (
                            <select value={filters.oudType} onChange={(e) => handleFilterChange('oudType', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.allOudTypes')}</option>
                              <option value="CAMBODIAN">{t('ui.cambodianOud')}</option>
                              <option value="INDIAN">{t('ui.indianOud')}</option>
                              <option value="THAI">{t('ui.thaiOud')}</option>
                              <option value="MALAYSIAN">{t('ui.malaysianOud')}</option>
                              <option value="LAOTIAN">{t('ui.laotianOud')}</option>
                              <option value="MUKHALLAT">{t('ui.mukhallat')}</option>
                            </select>
                          )}
                        </div>

                        {/* Collection */}
                        <div>
                          <button onClick={() => toggleSection('collection')} className="w-full flex items-center justify-between text-sm font-medium mb-2">
                            <span>{t('ui.collection')}</span>
                            {expandedSections.collection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {expandedSections.collection && (
                            <select value={filters.collection} onChange={(e) => handleFilterChange('collection', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A86A] focus:border-transparent">
                              <option value="">{t('ui.allCollections')}</option>
                              <option value="RAMADAN">{t('ui.ramadanCollection')}</option>
                              <option value="SIGNATURE">{t('ui.signatureCollection')}</option>
                              <option value="CELEBRITY">{t('ui.celebrityCollection')}</option>
                              <option value="MOST_LOVED">{t('ui.mostLoved')}</option>
                              <option value="TRENDING">{t('ui.trendingNow')}</option>
                              <option value="EXCLUSIVE">{t('ui.exclusive')}</option>
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Apply Button */}
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl hover:shadow-lg transition-all text-base"
                      >
                        {t('ui.apply') || 'Apply Filters'}
                      </button>
                    </SheetContent>
                  </Sheet>

                  <p className="text-gray-700 font-semibold text-xs sm:text-sm">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 font-black text-sm sm:text-lg">
                      {data?.pagination?.total || 0}
                    </span>
                    {' '}{t('ui.productsFound', { count: data?.pagination?.total || 0, plural: data?.pagination?.total !== 1 ? 's' : '' })}
                    {hasActiveFilters && (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 ml-2 font-black">
                        {t('ui.filtered')}
                      </span>
                    )}
                  </p>

                  {/* Desktop Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#550000] to-[#6B0000] text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105 text-sm"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? t('ui.hide') : t('ui.show')} {t('ui.filters')}
                  </button>
                </div>

                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-amber-300 rounded-xl bg-gradient-to-r from-white to-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-bold text-gray-700 hover:shadow-md transition-all cursor-pointer text-xs sm:text-sm"
                >
                  <option value="createdAt_desc">✨ {t('sort.newestFirst')}</option>
                  <option value="createdAt_asc">{t('sort.oldestFirst')}</option>
                  <option value="price_asc">{t('sort.priceLowToHigh')}</option>
                  <option value="price_desc">{t('sort.priceHighToLow')}</option>
                  <option value="name_asc">{t('sort.nameAZ')}</option>
                  <option value="name_desc">{t('sort.nameZA')}</option>
                  <option value="rating_desc">{t('sort.highestRated')}</option>
                  <option value="salesCount_desc">{t('sort.mostPopular')}</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-2 sm:p-3 md:p-4 shadow-lg border-2 border-amber-100">
                    <div className="bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl aspect-square mb-2 sm:mb-3 md:mb-4"></div>
                    <div className="h-2.5 sm:h-3 md:h-4 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full w-3/4 mb-1.5 sm:mb-2"></div>
                    <div className="h-2.5 sm:h-3 md:h-4 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full w-1/2"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-8 text-center shadow-xl">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-red-700 font-bold text-lg">{t('ui.failedToLoad')}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && data?.data.length === 0 && (
              <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl p-8 sm:p-12 md:p-16 text-center border-2 border-amber-200">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-lg">
                  <Filter className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-amber-600" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">{t('ui.noProducts')}</h3>
                <p className="text-gray-700 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg font-semibold">
                  {t('ui.tryDifferentFilters')}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-black text-sm sm:text-base hover:shadow-2xl transition-all hover:scale-105 border-2 border-amber-300/30"
                  >
                    {t('ui.clearFilters')}
                  </button>
                )}
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && !error && data?.data.length > 0 && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {data.data.map((product: any) => (
                    <ProductCard key={product.id} product={product} compact={true} />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.pagination && data.pagination.totalPages > 1 && (
                  <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center items-center gap-1.5 sm:gap-2 md:gap-3">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 border-amber-300 rounded-xl bg-gradient-to-r from-white to-amber-50 hover:from-amber-50 hover:to-orange-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700 hover:shadow-lg transition-all disabled:hover:shadow-none text-xs sm:text-sm md:text-base"
                    >
                      {t('pagination.previous')}
                    </button>

                    <div className="flex gap-1 sm:gap-1.5 md:gap-2">
                      {[...Array(data.pagination.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === data.pagination.totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 border-2 rounded-xl font-black transition-all text-xs sm:text-sm md:text-base ${
                                page === pageNum
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-lg scale-110'
                                  : 'border-amber-300 bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 text-gray-700 hover:shadow-md'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === page - 2 ||
                          pageNum === page + 2
                        ) {
                          return <span key={pageNum} className="px-1.5 sm:px-2 md:px-3 text-amber-600 font-black text-base sm:text-lg md:text-xl">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                      className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-2 border-amber-300 rounded-xl bg-gradient-to-r from-white to-amber-50 hover:from-amber-50 hover:to-orange-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700 hover:shadow-lg transition-all disabled:hover:shadow-none text-xs sm:text-sm md:text-base"
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
