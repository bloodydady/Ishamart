'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/firestore';
import { getDriveImageUrl, formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiMapPin, FiPhone, FiUser, FiTruck, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { cartItems, cartTotal, clearCart, loading: cartLoading } = useCart();
  
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    deliveryType: 'home' // 'home' or 'pickup'
  });

  useEffect(() => {
    setMounted(true);
    // Pre-fill user data
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || '',
        phone: userProfile.phone || '',
      }));
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user?.displayName || '',
      }));
    }
  }, [user, userProfile]);

  // Auth & Cart empty checks
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/login');
    } else if (mounted && !cartLoading && cartItems.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [user, authLoading, mounted, cartItems, cartLoading, orderPlaced, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Validation
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast.error('Please fill in all delivery details');
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare order data
    const orderData = {
      userId: user.uid,
      userName: formData.name,
      userPhone: formData.phone,
      userEmail: user.email,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      })),
      totalAmount: cartTotal,
      deliveryType: formData.deliveryType,
      deliveryAddress: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode
      },
      paymentMethod: 'COD',
      // status 'pending' and 'createdAt' added by createOrder
    };

    const { id, error } = await createOrder(orderData);
    
    setIsSubmitting(false);
    
    if (error) {
      toast.error('Failed to place order. Please try again.');
    } else {
      setPlacedOrderId(id);
      setOrderPlaced(true);
      clearCart();
      // Scroll to top for success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!mounted || authLoading || cartLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user || (cartItems.length === 0 && !orderPlaced)) return null;

  if (orderPlaced) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border border-gray-100 animate-scale-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <FiCheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 Order Placed Successfully!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for shopping with ISHAMART. Our team will call you shortly on <span className="font-bold text-gray-800">{formData.phone}</span> to confirm your order.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-600 border border-gray-200">
            Order Reference: <strong className="text-[var(--color-primary)] block text-lg">{placedOrderId}</strong>
          </div>
          <Link 
            href="/orders" 
            className="block w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg"
          >
            Track My Order
          </Link>
          <Link 
            href="/shop" 
            className="block w-full text-[var(--color-primary)] py-4 mt-2 font-medium hover:bg-blue-50 rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                <FiMapPin className="text-[var(--color-primary)]" /> Delivery Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Delivery Type Selection */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">How would you like to get your order?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-center gap-3 transition-all ${
                      formData.deliveryType === 'home' 
                        ? 'border-[var(--color-primary)] bg-blue-50/50 text-[var(--color-primary)]' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}>
                      <input 
                        type="radio" 
                        name="deliveryType" 
                        value="home" 
                        checked={formData.deliveryType === 'home'} 
                        onChange={handleChange} 
                        className="hidden" 
                      />
                      <FiTruck size={20} /> <span className="font-bold">Home Delivery</span>
                    </label>
                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-center gap-3 transition-all ${
                      formData.deliveryType === 'pickup' 
                        ? 'border-[var(--color-primary)] bg-blue-50/50 text-[var(--color-primary)]' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}>
                      <input 
                        type="radio" 
                        name="deliveryType" 
                        value="pickup" 
                        checked={formData.deliveryType === 'pickup'} 
                        onChange={handleChange} 
                        className="hidden" 
                      />
                      <FiShoppingBag size={20} /> <span className="font-bold">Self Pickup</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow bg-gray-50 focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="[0-9]{10}"
                      title="10 digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow bg-gray-50 focus:bg-white"
                      placeholder="10 digit mobile number"
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full Address</label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow bg-gray-50 focus:bg-white resize-none"
                    placeholder="House No., Building Name, Street Name, Area"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">City / District</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow bg-gray-50 focus:bg-white"
                    placeholder="e.g. Lucknow"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    pattern="[0-9]{6}"
                    title="6 digit pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow bg-gray-50 focus:bg-white"
                    placeholder="6 digit pincode"
                  />
                </div>
              </div>

              {/* Payment Info inside Form area for layout flow */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
                <div className="flex items-center gap-4 p-4 bg-white border-2 border-green-500 rounded-xl">
                  <input type="radio" checked readOnly className="w-5 h-5 text-green-600 focus:ring-green-500" />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block text-lg">Cash on Delivery (COD)</span>
                    <span className="text-sm text-gray-500">Pay when you receive your order</span>
                  </div>
                  <span className="text-3xl">💵</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[var(--color-secondary)] to-orange-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition-all hover:shadow-xl hover:to-orange-600 disabled:opacity-70 flex justify-center"
              >
                {isSubmitting ? <LoadingSpinner message="" /> : 'Place Order Now'}
              </button>
            </form>
          </div>

          {/* Right: Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-28">
              <div className="p-6 bg-[var(--color-primary-dark)] text-white">
                <h3 className="text-xl font-bold">Order Summary</h3>
                <p className="text-blue-200 text-sm mt-1">{cartItems.length} items in cart</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 flex items-center justify-center p-1">
                         <img 
                            src={getDriveImageUrl(item.imageUrl)} 
                            alt={item.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => { e.target.src = '/placeholder.png' }}
                          />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{item.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</span>
                          <span className="font-bold text-[var(--color-secondary)]">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Delivery Option</span>
                    <span className="capitalize">{formData.deliveryType}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Delivery Charges</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-[var(--color-primary)]">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
