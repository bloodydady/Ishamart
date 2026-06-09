'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getDriveImageUrl, formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading: cartLoading } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, mounted, router]);

  if (!mounted || authLoading || cartLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) return null; // Will redirect

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <FiShoppingBag className="text-[var(--color-primary)]" /> My Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto flex flex-col items-center">
            <img src="/placeholder.png" alt="Empty Cart" className="w-48 h-48 opacity-20 mb-6 grayscale" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty!</h2>
            <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added anything to your cart yet. Explore our products and find something you like.</p>
            <Link 
              href="/shop" 
              className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white px-8 py-4 rounded-full font-bold text-lg shadow-md transition-transform hover:-translate-y-1"
            >
              Start Shopping Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="lg:w-2/3 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Product Details</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-center">Action</div>
                </div>

                {cartItems.map((item) => (
                  <div key={item.productId} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 border-b border-gray-100 last:border-b-0 items-center">
                    
                    {/* Product Info */}
                    <div className="col-span-1 md:col-span-6 flex gap-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 border border-gray-100 p-2 overflow-hidden flex items-center justify-center">
                        <img 
                          src={getDriveImageUrl(item.imageUrl)} 
                          alt={item.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply"
                          onError={(e) => { e.target.src = '/placeholder.png' }}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <Link href={`/product/${item.productId}`} className="font-bold text-gray-900 hover:text-[var(--color-primary)] text-lg line-clamp-2 transition-colors mb-1">
                          {item.name}
                        </Link>
                        <div className="text-[var(--color-secondary)] font-bold md:hidden mt-2">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center mt-4 md:mt-0">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-2.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="hidden md:block col-span-2 text-right font-bold text-gray-900 text-lg">
                      {formatPrice(item.price * item.quantity)}
                    </div>

                    {/* Action */}
                    <div className="col-span-1 md:col-span-2 flex justify-end md:justify-center absolute md:static top-6 right-6">
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-full transition-colors"
                        title="Remove Item"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/shop" className="text-[var(--color-primary)] font-medium hover:underline inline-flex items-center gap-2 self-start py-2">
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-28">
                <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-3xl font-bold text-[var(--color-secondary)]">{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">Inclusive of all taxes</p>
                </div>
                
                <Link 
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white py-4 rounded-xl font-bold text-lg shadow-md transition-all hover:shadow-lg"
                >
                  Proceed to Checkout <FiArrowRight />
                </Link>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span className="inline-block px-2 py-1 bg-gray-100 rounded">Secure</span> Payment & Delivery
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
