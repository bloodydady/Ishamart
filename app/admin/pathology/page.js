'use client';

import { useState, useEffect } from 'react';
import { getPathologyAppointments, updatePathologyAppointmentStatus } from '@/lib/firestore';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiCalendar, FiClock, FiCheck, FiX, FiRefreshCcw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminPathology() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { appointments: data } = await getPathologyAppointments();
    setAppointments(data || []);
    setLoading(false);
  };

  const handleStatusUpdate = async (id, status) => {
    const { error } = await updatePathologyAppointmentStatus(id, status);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Appointment marked as ${status}`);
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Pathology Appointments</h1>
        <button onClick={fetchAppointments} className="flex items-center gap-2 text-[var(--color-primary)] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold">
          <FiRefreshCcw /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-full max-w-2xl">
        {['pending', 'confirmed', 'completed', 'cancelled', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-colors ${
              filter === status 
                ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20"><LoadingSpinner /></div>
        ) : filteredAppointments.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-sm">
            No appointments found for the selected filter.
          </div>
        ) : (
          filteredAppointments.map(appointment => (
            <div key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize mb-2 border ${
                    appointment.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    appointment.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    appointment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {appointment.status}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg">{appointment.name}</h3>
                  <div className="text-gray-500 text-sm mt-1">{appointment.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Requested For</div>
                  <div className="font-bold text-[var(--color-primary)] flex items-center gap-1.5 justify-end">
                    <FiCalendar size={14} /> {appointment.preferredDate}
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex-grow">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Test / Package Required</div>
                    <div className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {appointment.testRequired}
                    </div>
                  </div>
                  <div className="flex gap-4 border-t border-gray-100 pt-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Collection Type</div>
                      <div className="font-medium capitalize text-gray-900 flex items-center gap-2">
                        {appointment.collectionType === 'home' ? '🏠 Home Collection' : '🏥 Lab Visit'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Submitted On</div>
                      <div className="text-sm text-gray-700 flex items-center gap-1.5">
                        <FiClock size={14} className="text-gray-400" /> {formatDate(appointment.createdAt).split(' at ')[0]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
                {appointment.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      className="px-4 py-2 text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Confirm Booking
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <button 
                    onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm w-full flex justify-center items-center gap-2"
                  >
                    <FiCheck /> Mark as Completed
                  </button>
                )}
                {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                  <div className="text-sm text-gray-500 font-medium italic w-full text-center py-2">
                    Action completed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
