'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Toast from '@/components/Toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminRoute && <Navbar />}
        <main className="flex-grow flex flex-col">{children}</main>
        {!isAdminRoute && <Footer />}
        <Toast />
      </CartProvider>
    </AuthProvider>
  );
}
