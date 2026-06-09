'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { signOutUser } from '@/lib/auth';
import { CATEGORIES } from '@/lib/utils';
import { 
  FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, 
  FiChevronDown, FiLogOut, FiShield, FiPackage, FiHeart
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setUserDropdownOpen(false);
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'}`}>
        {/* Top Bar */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img src="/logo.png" alt="ISHAMART" className="h-16 sm:h-20 object-contain" />
            </Link>

            {/* Search Bar (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
              <input
                type="text"
                placeholder="Search for products, electronics, clothes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 rounded-l-full border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm transition-all"
              />
              <button 
                type="submit"
                className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white px-6 rounded-r-full transition-colors flex items-center justify-center"
              >
                <FiSearch size={20} />
              </button>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-3 sm:gap-6">
              
              {/* Desktop Auth/User */}
              <div className="hidden sm:block relative">
                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 hover:text-[var(--color-primary)] font-medium transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <span className="max-w-[100px] truncate">{user.displayName || 'User'}</span>
                      <FiChevronDown />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-primary)] hover:bg-gray-50 font-semibold border-b border-gray-100">
                            <FiShield size={16} /> Admin Panel
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                          <FiUser size={16} /> My Profile
                        </Link>
                        <Link href="/orders" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]">
                          <FiPackage size={16} /> My Orders
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                          <FiLogOut size={16} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/login" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-sm">
                      Login / Signup
                    </Link>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-[var(--color-secondary)] transition-colors">
                <FiShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-700"
              >
                <FiMenu size={24} />
              </button>
            </div>
          </div>

          {/* Search Bar (Mobile) */}
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearch} className="flex relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 rounded-full border border-gray-300 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-sm"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 text-gray-500 hover:text-[var(--color-secondary)]">
                <FiSearch size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Nav Bar (Desktop) */}
        <div className="hidden md:block bg-[var(--color-primary)] text-white">
          <div className="container mx-auto px-4">
            <ul className="flex items-center space-x-1 overflow-x-auto whitespace-nowrap py-2 text-sm font-medium hide-scrollbar">
              <li><Link href="/" className="px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">Home</Link></li>
              <li><Link href="/shop" className="px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors">All Products</Link></li>
              <li className="text-white/30 px-1">|</li>
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.id}`} className="px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1">
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
              <li className="text-white/30 px-1">|</li>
              <li><Link href="/pathology" className="px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-teal-300 hover:text-teal-200">🏥 Isha Care Pathology</Link></li>
              <li><Link href="/allrounder" className="px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-[var(--color-secondary)] hover:text-orange-300">🏪 All Rounder</Link></li>
            </ul>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex animate-fade-in">
          {/* Overlay */}
          <div className="absolute inset-0 mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>
          
          {/* Drawer */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right ml-auto overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <img src="/logo.png" alt="ISHAMART" className="h-12 object-contain" />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-6">
              {/* User Section */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.displayName || 'User'}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="h-px bg-gray-200 my-1"></div>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-sm text-[var(--color-primary)] font-semibold py-1">
                        <FiShield size={18} /> Admin Panel
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-sm text-gray-700 py-1">
                      <FiUser size={18} /> My Profile
                    </Link>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-sm text-gray-700 py-1">
                      <FiPackage size={18} /> My Orders
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-red-600 py-1 text-left">
                      <FiLogOut size={18} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-600 text-center mb-2">Welcome to ISHAMART</p>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white text-center py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                      Login / Signup
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Navigation</h3>
                <ul className="flex flex-col gap-1">
                  <li><Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Home</Link></li>
                  <li><Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">All Products</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Categories</h3>
                <ul className="flex flex-col gap-1">
                  {CATEGORIES.map(cat => (
                    <li key={cat.id}>
                      <Link href={`/shop?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50">
                        <span>{cat.icon}</span> <span className="font-medium">{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Our Services</h3>
                <ul className="flex flex-col gap-1">
                  <li>
                    <Link href="/pathology" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 font-semibold">
                      <span className="text-xl">🏥</span> Isha Care Pathology
                    </Link>
                  </li>
                  <li>
                    <Link href="/allrounder" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-50 text-orange-800 hover:bg-orange-100 font-semibold">
                      <span className="text-xl">🏪</span> All Rounder Services
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
