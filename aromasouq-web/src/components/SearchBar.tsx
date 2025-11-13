'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useRouter, Link } from '@/i18n/navigation';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch autocomplete results
  const { data: results } = useQuery<{ data: any[]; pagination?: { total: number } } | null>({
    queryKey: ['search-autocomplete', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return null;

      const res = await apiClient.get(
        `/products?search=${encodeURIComponent(debouncedQuery)}&limit=5`
      );
      return res as { data: any[]; pagination?: { total: number } };
    },
    enabled: debouncedQuery.length >= 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 2 * 60 * 1000, // Consider search results fresh for 2 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery('');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => query && setShowResults(true)}
          placeholder="Search for fragrances, brands, categories..."
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {showResults && results && results.data && results.data.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Products ({results.pagination?.total || 0})
            </p>

            {results.data.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={() => {
                  setShowResults(false);
                  setQuery('');
                }}
                className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition"
              >
                {product.images && product.images[0] ? (
                  <img
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                    alt={product.nameEn || product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {product.nameEn || product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-semibold text-purple-600">
                      AED {(product.salePrice || product.regularPrice || product.price)?.toFixed(2)}
                    </p>
                    {product.brand && (
                      <span className="text-xs text-gray-500">
                        • {product.brand.nameEn || product.brand.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => {
              router.push(`/products?search=${encodeURIComponent(query)}`);
              setShowResults(false);
              setQuery('');
            }}
            className="w-full px-4 py-3 border-t border-gray-200 text-center text-purple-600 hover:bg-purple-50 transition font-medium"
          >
            View all results for "{query}"
          </button>
        </div>
      )}

      {/* No Results */}
      {showResults && debouncedQuery && results && results.data && results.data.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-center">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600">No results found for "{debouncedQuery}"</p>
          <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
}
