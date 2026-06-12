'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdminUser } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user || !isAdmin) {
        router.push('/login');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, isAdmin, mounted, router]);

  if (!mounted || loading || !isAuthorized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
