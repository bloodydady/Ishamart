'use client';

import { useState, useEffect } from 'react';
import { getAllRounderEnquiries, updateAllRounderEnquiryStatus } from '@/lib/firestore';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiMessageSquare, FiPhone, FiCheck, FiRefreshCcw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminAllRounder() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { enquiries: data } = await getAllRounderEnquiries();
    setEnquiries(data || []);
    setLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    const { error } = await updateAllRounderEnquiryStatus(id, status);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Enquiry marked as ${status}`);
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">All Rounder Enquiries</h1>
        <button onClick={fetchEnquiries} className="flex items-center gap-2 text-[var(--color-secondary)] bg-orange-50 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-bold">
          <FiRefreshCcw /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-full max-w-md">
        {['new', 'contacted', 'resolved', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-colors ${
              filter === status 
                ? 'bg-[var(--color-secondary)] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20"><LoadingSpinner /></div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm">
            No enquiries found for the selected filter.
          </div>
        ) : (
          filteredEnquiries.map(enquiry => (
            <div key={enquiry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              {/* Left Color Bar */}
              <div className={`w-2 hidden md:block ${
                enquiry.status === 'new' ? 'bg-orange-500' :
                enquiry.status === 'contacted' ? 'bg-blue-500' :
                'bg-green-500'
              }`}></div>
              
              <div className="p-6 flex-grow flex flex-col md:flex-row gap-6 items-start">
                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl">{enquiry.name}</h3>
                      <div className="text-gray-500 flex items-center gap-2 mt-1">
                        <FiPhone size={14} /> <a href={`tel:${enquiry.phone}`} className="hover:text-orange-500 font-medium">{enquiry.phone}</a>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                      enquiry.status === 'new' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      enquiry.status === 'contacted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      {enquiry.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Service Interested In</div>
                      <div className="font-bold text-[var(--color-primary)] bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                        {enquiry.service}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Submitted On</div>
                      <div className="text-sm text-gray-700 font-medium mt-1">
                        {formatDate(enquiry.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {enquiry.message && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2 relative">
                      <FiMessageSquare className="absolute top-4 right-4 text-gray-300" size={24} />
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Message</div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap pr-8">{enquiry.message}</p>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="md:w-48 w-full flex flex-col gap-3 md:pl-6 md:border-l border-gray-100 justify-center h-full">
                  {enquiry.status === 'new' && (
                    <button 
                      onClick={() => handleStatusUpdate(enquiry.id, 'contacted')}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Mark as Contacted
                    </button>
                  )}
                  {enquiry.status !== 'resolved' && (
                    <button 
                      onClick={() => handleStatusUpdate(enquiry.id, 'resolved')}
                      className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm flex justify-center items-center gap-2"
                    >
                      <FiCheck /> Mark Resolved
                    </button>
                  )}
                  <a 
                    href={`tel:${enquiry.phone}`}
                    className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 mt-auto"
                  >
                    <FiPhone size={16} /> Call Customer
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
