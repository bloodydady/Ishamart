'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/auth';
import toast from 'react-hot-toast';
import { 
  FiGrid, FiBox, FiShoppingBag, FiUsers, 
  FiActivity, FiLayers, FiBarChart2, FiLogOut, 
  FiMenu, FiX 
} from 'react-icons/fi';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <FiGrid size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <FiBox size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <FiShoppingBag size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <FiUsers size={20} /> },
    { name: 'Pathology', path: '/admin/pathology', icon: <FiActivity size={20} /> },
    { name: 'All Rounder', path: '/admin/allrounder', icon: <FiLayers size={20} /> },
    { name: 'Reports', path: '/admin/reports', icon: <FiBarChart2 size={20} /> },
  ];

  const handleLogout = async () => {
    await signOutUser();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-[var(--color-primary-dark)] text-white w-64 shadow-xl">
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <Link href="/">
          <div className="bg-white p-2 rounded-xl inline-block w-40">
            <img src="/logo.png" alt="ISHAMART Admin" className="h-16 object-contain w-full" />
          </div>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="md:hidden absolute right-4 text-gray-300">
           <FiX size={24} />
        </button>
      </div>

      <div className="p-4 flex-grow overflow-y-auto">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-2">
          Admin Panel
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`admin-sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${
                  isActive 
                    ? 'bg-white/10 text-white border-l-4 border-[var(--color-secondary)]' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[var(--color-secondary)]' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors border-l-4 border-transparent"
        >
          <FiLogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header & Toggle */}
      <div className="md:hidden bg-[var(--color-primary-dark)] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link href="/admin" className="font-bold text-lg">Admin Panel</Link>
        <button onClick={() => setMobileOpen(true)} className="p-2">
          <FiMenu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen z-40">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          <div className="relative animate-slide-in-right h-full">
             <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
