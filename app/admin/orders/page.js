'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/firestore';
import { formatPrice, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // View Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { orders: data } = await getAllOrders(100);
    setOrders(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    const { error } = await updateOrderStatus(orderId, newStatus);
    setUpdatingStatus(false);
    
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated successfully');
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userPhone.includes(searchTerm);
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Order ID, Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FiFilter className="text-gray-400 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)] outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped/Ready</option>
            <option value="delivered">Delivered/Collected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-[var(--color-primary)]">{order.id.substring(0, 10).toUpperCase()}</td>
                      <td className="p-4 text-gray-600">{formatDate(order.createdAt).split(' at ')[0]}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{order.userName}</div>
                        <div className="text-xs text-gray-500">{order.userPhone}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {order.deliveryType}
                        </span>
                      </td>
                      <td className="p-4">
                        <OrderStatusBadge status={order.status} deliveryType={order.deliveryType} />
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openOrderDetails(order)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                        >
                          <FiEye /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  Order Details
                  <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                    {selectedOrder.id}
                  </span>
                </h2>
                <div className="text-sm text-gray-500 mt-1">{formatDate(selectedOrder.createdAt)}</div>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={selectedOrder.status} deliveryType={selectedOrder.deliveryType} />
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Col: Customer & Status */}
                <div className="space-y-6">
                  {/* Status Update Card */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-3 text-sm uppercase tracking-wider">Update Status</h3>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus}
                      className="w-full px-4 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none font-medium cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">{selectedOrder.deliveryType === 'pickup' ? 'Ready for Pickup' : 'Shipped'}</option>
                      <option value="delivered">{selectedOrder.deliveryType === 'pickup' ? 'Collected' : 'Delivered'}</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Customer Info</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs">Name</span>
                        <span className="font-medium text-gray-900">{selectedOrder.userName}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">Phone</span>
                        <span className="font-medium text-gray-900">{selectedOrder.userPhone}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs">Email</span>
                        <span className="font-medium text-gray-900 break-all">{selectedOrder.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex justify-between">
                      Delivery Details
                      <span className="text-[var(--color-primary)] bg-white px-2 py-0.5 rounded text-xs border border-gray-200 capitalize">
                        {selectedOrder.deliveryType}
                      </span>
                    </h3>
                    <div className="space-y-3 text-sm">
                      <p className="font-medium text-gray-900">{selectedOrder.deliveryAddress.name}</p>
                      <p className="text-gray-600">{selectedOrder.deliveryAddress.phone}</p>
                      <p className="text-gray-600 mt-2">{selectedOrder.deliveryAddress.address}</p>
                      <p className="text-gray-600 font-medium">{selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Right Col: Items & Payment */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Order Items ({selectedOrder.items.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 items-center bg-white">
                          <div className="w-16 h-16 bg-gray-50 rounded border border-gray-100 flex items-center justify-center p-1">
                            {/* Simplistic placeholder for admin view */}
                            <div className="text-xs text-gray-400">IMG</div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-1">Product ID: {item.productId}</div>
                          </div>
                          <div className="text-center px-4">
                            <div className="text-xs text-gray-500">Qty</div>
                            <div className="font-bold text-gray-900">{item.quantity}</div>
                          </div>
                          <div className="text-right pl-4">
                            <div className="font-bold text-[var(--color-secondary)]">{formatPrice(item.price * item.quantity)}</div>
                            <div className="text-xs text-gray-500">{formatPrice(item.price)} each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Totals Footer */}
                    <div className="bg-gray-50 p-5 border-t border-gray-200 space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Delivery Charges</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="font-bold text-gray-900 uppercase">Total Amount</span>
                        <span className="text-2xl font-bold text-[var(--color-primary)]">{formatPrice(selectedOrder.totalAmount)}</span>
                      </div>
                      <div className="text-right text-xs text-gray-500 uppercase font-bold tracking-wider mt-2">
                        Payment Method: COD
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
