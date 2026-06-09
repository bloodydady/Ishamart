'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { CATEGORIES } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="bg-[var(--color-primary-dark)] text-white pt-16 pb-6 border-t-[8px] border-[var(--color-secondary)]">
      <div className="container mx-auto px-4">

        {/* Founder Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[var(--color-secondary)] shadow-xl flex-shrink-0">
              <img src="/founder.png" alt="Isha Gupta - Founder of ISHAMART" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-[var(--color-secondary)] text-sm font-bold uppercase tracking-widest mb-1">Founder</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Isha Gupta</h3>
              <p className="text-gray-300 leading-relaxed max-w-2xl">
                ISHAMART was founded with a vision to bring quality products and essential services to every doorstep. 
                From healthcare to electronics, our mission is to be your one-stop solution — trusted, affordable, and always available.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
                <a href="tel:+917905611541" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  <FaPhoneAlt size={14} /> +91 79056 11541
                </a>
                <a href="https://www.instagram.com/p/DYhqZfpyCvP/?igsh=MWM0dnJmcGg4dGEzcw==" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 hover:bg-[#E4405F] px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  <FaInstagram size={14} /> Follow on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-2 rounded-xl inline-block w-48 mb-2">
              <img src="/logo.png" alt="ISHAMART" className="h-16 object-contain w-full" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-2">
              Your local Indian marketplace for everything you need. From electronics to pathology services, we are your one-stop shop with best prices and fast delivery.
            </p>
            <a href="tel:+917905611541" className="text-[var(--color-secondary)] font-bold text-lg hover:text-orange-300 transition-colors flex items-center gap-2">
              <FaPhoneAlt size={16} /> +91 79056 11541
            </a>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="https://www.instagram.com/p/DYhqZfpyCvP/?igsh=MWM0dnJmcGg4dGEzcw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E4405F] transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="https://wa.me/917905611541" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors">
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
              <li><Link href="/login" className="text-gray-300 hover:text-white hover:translate-x-1 inline-block transition-transform">Login / Signup</Link></li>
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
          <p>Founded by Isha Gupta | Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
