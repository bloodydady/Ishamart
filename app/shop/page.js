'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts } from '@/lib/firestore';
import { CATEGORIES } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiFilter, FiX } from 'react-icons/fi';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products when params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { products } = await getProducts({
        category: categoryParam,
        search: searchParam,
        sortBy,
        pageSize: 50 // Fetch enough for general browsing
      });
      setProducts(products || []);
      setLoading(false);
    }
    fetchProducts();
  }, [categoryParam, searchParam, sortBy]);

  const handleCategoryChange = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    router.push(`/shop?${params.toString()}`);
    setShowMobileFilters(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {searchParam ? `Search Results for "${searchParam}"` : 'All Products'}
          </h1>
          <p className="text-gray-500 mt-1">Showing {products.length} products</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
            onClick={() => setShowMobileFilters(true)}
          >
            <FiFilter /> Filters
          </button>
          
          <div className="flex-1 md:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-[var(--color-primary)] outline-none cursor-pointer"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`
          ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} 
          md:block md:w-64 md:flex-shrink-0 md:sticky md:top-24 md:h-[calc(100vh-8rem)]
        `}>
          {showMobileFilters && (
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                <FiX size={20} />
              </button>
            </div>
          )}

          <div className="bg-white md:border md:border-gray-200 md:rounded-xl md:p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-100 text-[var(--color-primary)]">Categories</h3>
            <ul className="space-y-3">
              <li>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="radio" 
                      name="category" 
                      className="w-5 h-5 border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      checked={categoryParam === 'all'}
                      onChange={() => handleCategoryChange('all')}
                    />
                  </div>
                  <span className={`text-sm font-medium transition-colors ${categoryParam === 'all' ? 'text-[var(--color-primary)] font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    All Categories
                  </span>
                </label>
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="radio" 
                        name="category" 
                        className="w-5 h-5 border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        checked={categoryParam === cat.id}
                        onChange={() => handleCategoryChange(cat.id)}
                      />
                    </div>
                    <span className={`text-sm font-medium flex items-center gap-2 transition-colors ${categoryParam === cat.id ? 'text-[var(--color-primary)] font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            {searchParam && (
              <div className="mt-8">
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('search');
                    router.push(`/shop?${params.toString()}`);
                  }}
                  className="w-full py-2 text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 h-[60vh]">
              <LoadingSpinner message="Fetching products..." />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center px-4 shadow-sm">
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                We couldn't find any products matching your current filters or search query.
              </p>
              <button 
                onClick={() => router.push('/shop')}
                className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[var(--color-primary-light)] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ShopContent />
    </Suspense>
  );
}
