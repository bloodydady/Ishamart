'use client';

import { useState, useEffect } from 'react';
import { createAllRounderEnquiry, getSettings, getAllProducts } from '@/lib/firestore';
import { ALLROUNDER_SERVICES, getDriveImageUrl, formatPrice } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AllRounderPage() {
  const [settings, setSettings] = useState(null);
  const [servicesDesc, setServicesDesc] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Medical', // default
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [listings, setListings] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [settingsRes, descRes, productsRes] = await Promise.all([
        getSettings('allrounder'),
        getSettings('allrounderServices'),
        getAllProducts()
      ]);
      
      setSettings(settingsRes.settings || {
        phone: 'Not provided',
        address: 'Not provided',
        timing: 'Not provided',
        about: ''
      });
      setServicesDesc(descRes.settings || {});

      // Filter houses and plots
      if (productsRes.products) {
        setListings(productsRes.products.filter(p => p.category === 'house' || p.category === 'plots'));
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.service) {
      toast.error('Please fill required fields');
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await createAllRounderEnquiry(formData);
    setIsSubmitting(false);
    
    if (error) {
      toast.error('Failed to submit enquiry. Try calling us directly.');
    } else {
      toast.success('Enquiry submitted successfully!');
      setSubmitted(true);
      setFormData(prev => ({ ...prev, name: '', phone: '', message: '' }));
    }
  };

  const handleSelectService = (serviceName) => {
    setFormData(prev => ({ ...prev, service: serviceName }));
    document.getElementById('enquiry-form').scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-50 py-20 lg:py-32">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-100 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-100 blur-3xl opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-['Brush_Script_MT',cursive,serif] text-orange-500 mb-2 transform -rotate-2">
              One Stop,
            </h2>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-[var(--color-primary)]">ALL </span>
              <span className="text-[var(--color-secondary)]">ROUNDER</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-medium tracking-wide mb-10">
              ALL YOUR NEEDS, ONE PLACE
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-700">🏆 Quality</span>
              <span className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-700">🤝 Trust</span>
              <span className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-bold text-gray-700">😊 Satisfaction</span>
              <span className="bg-[var(--color-primary-light)] text-white px-4 py-2 rounded-full shadow-sm text-sm font-bold">Multiple Services • Unlimited Solutions</span>
            </div>
            
            <button onClick={() => document.getElementById('services-grid').scrollIntoView({ behavior: 'smooth' })} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--color-primary)] transition-colors inline-flex items-center gap-2">
              Explore Our Services ↓
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services-grid" className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <div className="w-24 h-1 bg-[var(--color-secondary)] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {ALLROUNDER_SERVICES.map((service, index) => {
              // Custom spanning for the last row to center it if needed
              const isLast = index === ALLROUNDER_SERVICES.length - 1;
              const colSpanClass = isLast && ALLROUNDER_SERVICES.length % 4 !== 0 
                ? 'xl:col-start-2 xl:col-span-2' // Just an example, making it span wider
                : '';

              return (
                <div 
                  key={service.id} 
                  onClick={() => handleSelectService(service.name)}
                  className={`bg-white rounded-3xl p-8 border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2 flex flex-col items-center text-center ${colSpanClass}`}
                  style={{ borderColor: `${service.color}30`, borderBottomWidth: '4px', borderBottomColor: service.color }}
                >
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${service.color}15` }}
                  >
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ color: service.color }}>{service.name}</h3>
                  <p className="text-gray-600 font-medium text-sm">
                    {servicesDesc[service.id] || service.desc}
                  </p>
                  
                  <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: `${service.color}20`, color: service.color }}>
                      Enquire Now
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Houses and Plots Listings */}
      {listings.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Properties & Plots</h2>
              <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full mb-4"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">Explore our exclusive real estate listings available right now in your area.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map(product => (
                <Link href={`/product/${product.id}`} key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col transform hover:-translate-y-2">
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img 
                      src={getDriveImageUrl(product.imageUrl)} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = '/placeholder.png' }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-[var(--color-primary)] shadow-sm">
                      {product.category === 'house' ? '🏠 House' : '🌍 Plot'}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{product.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-2xl font-black text-[var(--color-primary)]">
                        {formatPrice(product.price)}
                      </div>
                      <span className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                        <FiShoppingCart />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 bg-[var(--color-primary-dark)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-10 text-blue-200">Why People Trust All Rounder Services</h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 max-w-4xl mx-auto">
            {[
              { text: 'Best Quality', emoji: '✅' },
              { text: 'Expert Support', emoji: '👥' },
              { text: 'Affordable Price', emoji: '💰' },
              { text: 'Time Saving', emoji: '⏰' },
              { text: '100% Satisfaction', emoji: '💯' }
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/5">
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-bold tracking-wide">{item.text}</span>
              </div>
            ))}
          </div>
          <p className="mt-12 text-2xl font-[Brush_Script_MT,cursive] text-orange-400">
            "All Services... All Solutions... At One Place!"
          </p>
        </div>
      </section>

      {/* Contact & Form Section */}
      <section id="enquiry-form" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
            
            {/* Contact Info */}
            <div className="lg:w-2/5 bg-[var(--color-primary)] text-white p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">📞</div>
              
              <h3 className="text-3xl font-bold mb-2 relative z-10">Get in Touch</h3>
              <p className="text-blue-200 mb-10 relative z-10">Fill the form or contact us directly for immediate assistance.</p>
              
              <div className="space-y-6 relative z-10 flex-grow">
                <div className="flex gap-4 items-start">
                  <div className="bg-white/20 p-3 rounded-full"><FiPhone size={24} /></div>
                  <div>
                    <h4 className="text-sm text-blue-300 font-bold uppercase tracking-wider mb-1">Call Us</h4>
                    <p className="text-xl font-bold">{settings?.phone}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-white/20 p-3 rounded-full"><FiMapPin size={24} /></div>
                  <div>
                    <h4 className="text-sm text-blue-300 font-bold uppercase tracking-wider mb-1">Visit Us</h4>
                    <p className="font-medium leading-relaxed">{settings?.address}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-white/20 p-3 rounded-full"><FiClock size={24} /></div>
                  <div>
                    <h4 className="text-sm text-blue-300 font-bold uppercase tracking-wider mb-1">Working Hours</h4>
                    <p className="font-medium">{settings?.timing}</p>
                  </div>
                </div>
              </div>
              
              {settings?.about && (
                <div className="mt-8 pt-8 border-t border-white/20 relative z-10">
                  <p className="text-sm text-blue-100 italic">"{settings.about}"</p>
                </div>
              )}
            </div>
            
            {/* Form */}
            <div className="lg:w-3/5 p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send an Enquiry</h3>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in h-full flex flex-col items-center justify-center min-h-[300px]">
                  <FiCheckCircle className="text-green-500 text-6xl mb-4" />
                  <h4 className="text-xl font-bold text-green-900 mb-2">Enquiry Received!</h4>
                  <p className="text-green-700 mb-6">Thank you for reaching out. Our team will contact you shortly regarding your requirements.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 transition-colors"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white transition-colors"
                        placeholder="10 digit number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Interested In *</label>
                    <select 
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white transition-colors appearance-none cursor-pointer"
                    >
                      {ALLROUNDER_SERVICES.map(srv => (
                        <option key={srv.id} value={srv.name}>{srv.name} Service</option>
                      ))}
                      <option value="Other">Other / Multiple</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Message (Optional)</label>
                    <textarea 
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                      placeholder="Tell us what exactly you are looking for..."
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white font-bold py-4 rounded-xl shadow-md transition-all hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0 mt-4 flex items-center justify-center gap-2 text-lg"
                  >
                    {isSubmitting ? 'Sending...' : <><FiSend /> Submit Enquiry</>}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
