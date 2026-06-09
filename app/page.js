'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/utils';
import { getFeaturedProducts } from '@/lib/firestore';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Slides
  const slides = [
    {
      bg: 'bg-gradient-to-r from-[var(--color-primary)] to-blue-600',
      title: 'Welcome to ISHAMART',
      subtitle: 'Shop Everything Online - Electronics, Clothes, Shoes, Solar Panels & More',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      buttonColor: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white'
    },
    {
      bg: 'bg-gradient-to-r from-teal-700 to-teal-500',
      title: '🏥 Isha Care Pathology',
      subtitle: 'Complete Diagnostic Solution - Home Sample Collection Available 24*7 in Lucknow',
      buttonText: 'Book Now',
      buttonLink: '/pathology',
      buttonColor: 'bg-white text-teal-800 hover:bg-gray-100'
    },
    {
      bg: 'bg-gradient-to-r from-orange-600 to-red-500',
      title: '🏪 All Rounder Services',
      subtitle: 'One Stop - All Your Needs, One Place - Medical, Electronic, Clothes, Shoes, House, Plots & More',
      buttonText: 'Explore',
      buttonLink: '/allrounder',
      buttonColor: 'bg-white text-orange-600 hover:bg-gray-100'
    }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Fetch products
  useEffect(() => {
    async function loadFeatured() {
      const { products } = await getFeaturedProducts(8);
      setFeaturedProducts(products);
      setLoading(false);
    }
    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Banner Slider */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 hero-slide flex flex-col items-center justify-center text-center p-6 ${slide.bg} ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-slide-up drop-shadow-lg">
              {slide.title}
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {slide.subtitle}
            </p>
            <Link
              href={slide.buttonLink}
              className={`px-8 py-3 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105 animate-slide-up ${slide.buttonColor}`}
              style={{ animationDelay: '0.2s' }}
            >
              {slide.buttonText}
            </Link>
          </div>
        ))}
        
        {/* Dots Navigation */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Category Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-[var(--color-primary)]">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/shop" className="text-[var(--color-secondary)] font-semibold hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              No featured products available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* 4. Special Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-[var(--color-primary)]">Our Other Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pathology Card */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-8 border border-teal-100 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 opacity-10 text-9xl transform group-hover:rotate-12 transition-transform duration-500">🏥</div>
              <h3 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">🏥 ISHA CARE PATHOLOGY</h3>
              <p className="text-teal-600 font-medium text-lg mb-6">Complete Diagnostic Solution • Home Sample Collection 24*7</p>
              <ul className="grid grid-cols-2 gap-3 mb-8">
                {['CBC', 'LFT', 'KFT', 'CT Scan', 'Ultrasound', 'X-Ray', 'ECG', 'Blood Sugar'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-teal-900 font-medium">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span> {item}
                  </li>
                ))}
              </ul>
              <Link href="/pathology" className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                Know More
              </Link>
            </div>

            {/* All Rounder Card */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-8 border border-orange-100 shadow-lg relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 opacity-10 text-9xl transform group-hover:rotate-12 transition-transform duration-500">🏪</div>
              <h3 className="text-2xl md:text-3xl font-bold text-orange-800 mb-2">🏪 ALL ROUNDER</h3>
              <p className="text-orange-600 font-medium text-lg mb-6">One Stop - All Your Needs One Place</p>
              <ul className="grid grid-cols-2 gap-3 mb-8">
                {['Medical', 'Electronic', 'Clothes', 'Shoes', 'House', 'Plots', 'Cyber Cafe', 'More'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-orange-900 font-medium">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> {item}
                  </li>
                ))}
              </ul>
              <Link href="/allrounder" className="inline-block bg-[var(--color-secondary)] hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                Know More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose Ishamart */}
      <section className="py-12 bg-[var(--color-primary-dark)] text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-4xl mb-3 flex justify-center">🚚</div>
              <h4 className="font-bold text-lg mb-1">Fast Delivery</h4>
              <p className="text-gray-400 text-sm">Quick and safe delivery</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-3 flex justify-center">💰</div>
              <h4 className="font-bold text-lg mb-1">Best Prices</h4>
              <p className="text-gray-400 text-sm">Affordable & competitive</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-3 flex justify-center">✅</div>
              <h4 className="font-bold text-lg mb-1">Quality Products</h4>
              <p className="text-gray-400 text-sm">Verified & original</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-3 flex justify-center">📞</div>
              <h4 className="font-bold text-lg mb-1">24/7 Support</h4>
              <p className="text-gray-400 text-sm">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
