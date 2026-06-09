'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/lib/firestore';
import { formatPrice, formatDate, getDriveImageUrl } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { FiPackage, FiBox, FiClock, FiMapPin, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchOrders();
      }
    }
  }, [user, authLoading, mounted, router]);

  const fetchOrders = async () => {
    setLoading(true);
    const { orders: userOrders } = await getUserOrders(user.uid);
    setOrders(userOrders || []);
    setLoading(false);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (!mounted || authLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiPackage className="text-[var(--color-primary)]" /> My Orders
          </h1>
          <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            Total Orders: <span className="text-[var(--color-primary)] font-bold">{orders.length}</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-[var(--color-primary)] mb-6">
              <FiBox size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-8 max-w-md">You haven't placed any orders yet. Start exploring our amazing products!</p>
            <Link 
              href="/shop" 
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-8 py-3 rounded-full font-bold shadow-md transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                  {/* Order Header */}
                  <div 
                    className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-gray-50/50 hover:bg-gray-50"
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-[var(--color-primary)]">{order.id.substring(0, 10).toUpperCase()}</span>
                        <OrderStatusBadge status={order.status} deliveryType={order.deliveryType} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <FiClock size={14} /> {formatDate(order.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Amount</div>
                        <div className="font-bold text-xl text-[var(--color-secondary)]">{formatPrice(order.totalAmount)}</div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors bg-white rounded-full border border-gray-200">
                        {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Order Details (Expanded) */}
                  {isExpanded && (
                    <div className="p-6 bg-white animate-fade-in border-t border-gray-100">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Delivery Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                            <FiMapPin className="text-[var(--color-primary)]" /> Delivery Information
                          </h4>
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm space-y-1">
                            <p className="font-bold text-gray-900">{order.deliveryAddress.name}</p>
                            <p className="text-gray-600">{order.deliveryAddress.phone}</p>
                            <p className="text-gray-600 mt-2">{order.deliveryAddress.address}</p>
                            <p className="text-gray-600">{order.deliveryAddress.city} - {order.deliveryAddress.pincode}</p>
                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium capitalize text-gray-900">{order.deliveryType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Payment:</span>
                              <span className="font-medium text-gray-900">Cash on Delivery</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div>
                           <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                            Order Status
                           </h4>
                           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-full flex flex-col justify-center">
                             <div className="relative pl-6 space-y-6">
                               {/* Timeline line */}
                               <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                               
                               {['pending', 'confirmed', 'shipped', 'delivered'].map((step, idx) => {
                                 const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
                                 const currentIndex = statuses.indexOf(order.status);
                                 const stepIndex = statuses.indexOf(step);
                                 
                                 // Handle cancelled specially
                                 if (order.status === 'cancelled' && idx > 0) return null;
                                 if (order.status === 'cancelled' && idx === 0) {
                                   return (
                                     <div key="cancelled" className="relative z-10 flex items-center gap-3">
                                       <div className="w-6 h-6 rounded-full bg-red-500 border-4 border-white flex-shrink-0"></div>
                                       <span className="font-bold text-red-600">Order Cancelled</span>
                                     </div>
                                   );
                                 }

                                 const isCompleted = stepIndex <= currentIndex && order.status !== 'cancelled';
                                 const isCurrent = stepIndex === currentIndex && order.status !== 'cancelled';

                                 let label = step.charAt(0).toUpperCase() + step.slice(1);
                                 if (step === 'shipped' && order.deliveryType === 'pickup') label = 'Ready for Pickup';
                                 if (step === 'delivered' && order.deliveryType === 'pickup') label = 'Collected';

                                 return (
                                   <div key={step} className="relative z-10 flex items-center gap-3">
                                     <div className={`w-6 h-6 rounded-full border-4 border-white flex-shrink-0 ${
                                       isCompleted ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                                     } ${isCurrent ? 'ring-2 ring-[var(--color-primary)] ring-offset-2 animate-pulse' : ''}`}></div>
                                     <span className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                       {label}
                                     </span>
                                   </div>
                                 );
                               })}
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                          <FiBox className="text-[var(--color-primary)]" /> Order Items ({order.items.length})
                        </h4>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex gap-4 p-4 border-b border-gray-100 last:border-0 bg-white items-center">
                              <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                                <img 
                                  src={getDriveImageUrl(item.imageUrl)} 
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => { e.target.src = '/placeholder.png' }}
                                />
                              </div>
                              <div className="flex-1">
                                <Link href={`/product/${item.productId}`} className="font-semibold text-gray-900 hover:text-[var(--color-primary)] text-sm line-clamp-1 mb-1">
                                  {item.name}
                                </Link>
                                <div className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                                <div className="text-xs text-gray-500">{formatPrice(item.price)} each</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
