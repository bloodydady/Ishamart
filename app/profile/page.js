'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/lib/firestore';
import { signOutUser } from '@/lib/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiPackage, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading, refreshProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', altPhone: '', address: '', city: '', state: '', pincode: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, mounted, router]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        altPhone: userProfile.altPhone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        pincode: userProfile.pincode || ''
      });
    } else if (user) {
      setFormData({
        name: user.displayName || '',
        phone: '',
        altPhone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
    }
  }, [userProfile, user]);

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsSaving(true);
    const { error } = await updateUserProfile(user.uid, formData);
    setIsSaving(false);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      refreshProfile(); // Refresh context
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    toast.success('Logged out');
    router.push('/');
  };

  if (!mounted || loading) return <LoadingSpinner fullScreen />;
  if (!user) return null;

  const userInitials = (userProfile?.name || user.displayName || 'U').charAt(0).toUpperCase();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left: Quick Actions / Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[var(--color-primary)] text-white text-4xl font-bold flex items-center justify-center mb-4 shadow-md">
                {userInitials}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{userProfile?.name || user.displayName || 'User'}</h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>
              
              <div className="w-full h-px bg-gray-100 mb-6"></div>
              
              <div className="w-full flex flex-col gap-3">
                <Link 
                  href="/orders" 
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium text-gray-700 transition-colors"
                >
                  <FiPackage className="text-[var(--color-primary)]" /> My Orders
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl font-medium text-red-600 transition-colors text-left"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right: Profile Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FiUser className="text-[var(--color-primary)]" /> Personal Information
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={16} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <FiX size={20} />
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : <><FiSave size={16} /> Save</>}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-10 w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-blue-50/30"
                      />
                    </div>
                  ) : (
                    <div className="text-lg font-medium text-gray-900 px-3 py-2 flex items-center gap-3">
                      <FiUser className="text-gray-400" /> {userProfile?.name || user.displayName || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  <div className="text-lg font-medium text-gray-900 px-3 py-2 flex items-center gap-3 opacity-70">
                    <FiMail className="text-gray-400" /> {user.email} 
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2">Read Only</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="pl-10 w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-blue-50/30"
                        placeholder="10 digit mobile number"
                      />
                    </div>
                  ) : (
                    <div className="text-lg font-medium text-gray-900 px-3 py-2 flex items-center gap-3">
                      <FiPhone className="text-gray-400" /> {userProfile?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Alternative Phone</label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.altPhone}
                        onChange={(e) => setFormData({...formData, altPhone: e.target.value})}
                        className="pl-10 w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-blue-50/30"
                        placeholder="Optional"
                      />
                    </div>
                  ) : (
                    <div className="text-lg font-medium text-gray-900 px-3 py-2 flex items-center gap-3">
                      <FiPhone className="text-gray-400" /> {userProfile?.altPhone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-100 mt-2">
                  <h4 className="font-bold text-gray-900 mb-4">Delivery Address Details</h4>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Address (House No, Building, Street)</label>
                  {isEditing ? (
                    <textarea
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-blue-50/30 resize-none"
                      placeholder="Enter full address"
                    ></textarea>
                  ) : (
                    <div className="text-lg font-medium text-gray-900 px-3 py-2">
                      {userProfile?.address || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">City / District</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-blue-50/30"
                      placeholder="e.g. Lucknow"
                    />
                  ) : (
                    <div className="text-lg font-medium text-gray-900 px-3 py-2">
                      {userProfile?.city || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-blue-50/30"
                      placeholder="e.g. Uttar Pradesh"
                    />
                  ) : (
                    <div className="text-lg font-medium text-gray-900 px-3 py-2">
                      {userProfile?.state || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Pincode</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-blue-50/30"
                      placeholder="6-digit pincode"
                    />
                  ) : (
                    <div className="text-lg font-medium text-gray-900 px-3 py-2">
                      {userProfile?.pincode || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
