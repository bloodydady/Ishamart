'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { CATEGORIES } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="bg-[var(--color-primary-dark)] text-white pt-16 pb-6 border-t-[8px] border-[var(--color-secondary)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-2 rounded-xl inline-block w-48 mb-2">
              <img src="/logo.png" alt="ISHAMART" className="h-16 object-contain w-full" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Your local Indian marketplace for everything you need. From electronics to pathology services, we are your one-stop shop with best prices and fast delivery.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E4405F] transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[var(--color-secondary)] uppercase tracking-wider">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-transform">Home</Link></li>
              <li><Link href="/shop" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-transform">Shop All</Link></li>
              <li><Link href="/cart" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-transform">My Cart</Link></li>
              <li><Link href="/orders" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-transform">My Orders</Link></li>
              <li><Link href="/login" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-transform">Login / Register</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Products */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[var(--color-secondary)] uppercase tracking-wider">Our Products</h3>
            <ul className="flex flex-col gap-3">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.id}`} className="text-gray-300 hover:text-white hover:translate-x-1 inline-flex items-center gap-2 transition-transform">
                    <span>{cat.icon}</span> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Our Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-[var(--color-secondary)] uppercase tracking-wider">Our Services</h3>
            <div className="flex flex-col gap-4">
              <Link href="/pathology" className="group">
                <div className="bg-teal-900/40 border border-teal-800 p-3 rounded-lg group-hover:bg-teal-800/50 transition-colors">
                  <div className="text-teal-300 font-semibold flex items-center gap-2 mb-1">
                    <span>🏥</span> Isha Care Pathology
                  </div>
                  <div className="text-xs text-gray-400">Complete Diagnostic Solution, Home Collection 24*7</div>
                </div>
              </Link>
              <Link href="/allrounder" className="group">
                <div className="bg-orange-900/30 border border-orange-800 p-3 rounded-lg group-hover:bg-orange-800/40 transition-colors">
                  <div className="text-orange-300 font-semibold flex items-center gap-2 mb-1">
                    <span>🏪</span> All Rounder
                  </div>
                  <div className="text-xs text-gray-400">One Stop - All Your Needs, One Place</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} ISHAMART. All Rights Reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
