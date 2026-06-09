'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getDriveImageUrl, formatPrice, CATEGORIES } from '@/lib/utils';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [imgSrc, setImgSrc] = useState(getDriveImageUrl(product.imageUrl));
  const [isAdding, setIsAdding] = useState(false);

  const categoryInfo = CATEGORIES.find(c => c.id === product.category);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent link navigation if button is inside a link wrapper
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    setIsAdding(true);
    await addToCart(product, 1);
    setIsAdding(false);
  };

  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col h-full relative group">
      {isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
          Out of Stock
        </div>
      )}
      
      {product.featured && !isOutOfStock && (
        <div className="absolute top-2 right-2 z-10 bg-[var(--color-secondary)] text-white text-xs font-bold px-2 py-1 rounded-md">
          Featured
        </div>
      )}

      <Link href={`/product/${product.id}`} className="relative h-48 sm:h-56 overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        <img
          src={imgSrc}
          alt={product.name}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgSrc('/placeholder.png')}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
           <span className="bg-white text-gray-900 p-2 rounded-full hover:bg-[var(--color-secondary)] hover:text-white transition-colors">
              <FiEye size={20} />
           </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
           {categoryInfo && (
             <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600`}>
                {categoryInfo.icon} {categoryInfo.name}
             </span>
           )}
        </div>
        
        <Link href={`/product/${product.id}`} className="group-hover:text-[var(--color-primary)] transition-colors">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1" title={product.name}>
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="text-lg font-bold text-[var(--color-secondary)]">
            {formatPrice(product.price)}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`btn-press p-2 rounded-full transition-colors ${
              isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] shadow-md hover:shadow-lg'
            }`}
            aria-label="Add to Cart"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
