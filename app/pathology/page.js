'use client';

import { useState, useEffect } from 'react';
import { getPathologyPackages, createPathologyAppointment, getSettings } from '@/lib/firestore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatPrice } from '@/lib/utils';
import { FiPhone, FiMapPin, FiClock, FiCheck, FiCalendar, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PathologyPage() {
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Appointment Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    testRequired: '',
    preferredDate: '',
    collectionType: 'home'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [packagesRes, settingsRes] = await Promise.all([
        getPathologyPackages(),
        getSettings('pathology')
      ]);
      
      setPackages(packagesRes.packages || []);
      setSettings(settingsRes.settings || {
        phone: 'Not provided',
        address: 'Not provided',
        timing: 'Not provided',
        about: ''
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.testRequired || !formData.preferredDate) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await createPathologyAppointment(formData);
    setIsSubmitting(false);
    
    if (error) {
      toast.error('Failed to book appointment. Try calling us directly.');
    } else {
      toast.success('Appointment request sent!');
      setSubmitted(true);
      setFormData({ name: '', phone: '', testRequired: '', preferredDate: '', collectionType: 'home' });
    }
  };

  const handleBookPackage = (pkgName) => {
    setFormData(prev => ({ ...prev, testRequired: pkgName }));
    document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-900 to-teal-700 text-white py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-10">
           <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M16 2v2h4v16H4V4h4V2H2v20h20V2z"/><path d="M11 16h2v-4h4v-2h-4V6h-2v4H7v2h4z"/></svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center md:text-left md:flex items-center justify-between">
          <div className="md:w-2/3 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">🏥 ISHA CARE PATHOLOGY</h1>
            <p className="text-xl md:text-2xl text-teal-100 mb-8 font-light">Lucknow's Complete Diagnostic Solution</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href={`tel:${settings?.phone}`} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                <FiPhone /> Call Now
              </a>
              <button onClick={() => document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' })} className="bg-transparent border-2 border-white hover:bg-white hover:text-teal-900 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center justify-center gap-2 text-lg">
                <FiCalendar /> Book Appointment
              </button>
            </div>
          </div>
          
          <div className="md:w-1/3 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-left">
            <h3 className="font-bold text-xl mb-4 text-teal-100 border-b border-teal-500/50 pb-2">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <FiPhone className="mt-1 text-teal-300 flex-shrink-0" />
                <span>{settings?.phone}</span>
              </div>
              <div className="flex gap-3">
                <FiMapPin className="mt-1 text-teal-300 flex-shrink-0" />
                <span>{settings?.address}</span>
              </div>
              <div className="flex gap-3">
                <FiClock className="mt-1 text-teal-300 flex-shrink-0" />
                <span>{settings?.timing}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="bg-teal-50 border-b border-teal-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center p-4">
              <span className="text-3xl mb-2">🏠</span>
              <span className="font-bold text-teal-800">Home Sample Collection 24*7</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-3xl mb-2">💰</span>
              <span className="font-bold text-teal-800">Best Discount Available</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-3xl mb-2">✅</span>
              <span className="font-bold text-teal-800">100% Accurate Results</span>
            </div>
            <div className="flex flex-col items-center p-4">
              <span className="text-3xl mb-2">🚀</span>
              <span className="font-bold text-teal-800">Fast Report Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-teal-900 mb-12">Our Diagnostic Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="bg-teal-50 rounded-3xl p-8 border border-teal-100 shadow-sm">
              <h3 className="text-2xl font-bold text-teal-800 mb-6 flex items-center gap-3 border-b border-teal-200 pb-4">
                <span className="text-3xl">🩸</span> Complete Blood Tests
              </h3>
              <ul className="grid grid-cols-2 gap-y-4 gap-x-2">
                {['CBC', 'LFT (Liver Function)', 'KFT (Kidney Function)', 'Lipid Profile', 'Thyroid (TSH)', 'Blood Sugar', 'HbA1c', 'Vitamin D & B12', 'ESR', 'PT/aPTT'].map(test => (
                  <li key={test} className="flex items-center gap-2 text-teal-900 font-medium">
                    <FiCheck className="text-teal-500" /> {test}
                  </li>
                ))}
              </ul>
              <div className="mt-6 text-center text-teal-700 font-bold bg-white p-3 rounded-xl border border-teal-100">
                + ALL OTHER BLOOD TESTS
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3 border-b border-blue-200 pb-4">
                <span className="text-3xl">🩻</span> Imaging & Scans
              </h3>
              <ul className="grid grid-cols-1 gap-4">
                {['CT Scan', 'Ultrasound / Sonography', 'X-Ray (Digital)', 'ECG', 'MRI Scan (Partnered)'].map(test => (
                  <li key={test} className="flex items-center gap-3 text-blue-900 font-medium p-2 hover:bg-white rounded-lg transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> {test}
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-sm text-blue-600 bg-white p-4 rounded-xl border border-blue-100 text-center">
                State-of-the-art imaging technology for precise diagnostics. Visit our partner lab for imaging services.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      {packages.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-teal-900 mb-12">Health Checkup Packages</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow relative">
                  <div className="h-2 bg-gradient-to-r from-teal-400 to-teal-600"></div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-orange-500 mb-4">{formatPrice(pkg.price)}</div>
                    
                    {pkg.description && (
                      <p className="text-sm text-gray-500 mb-4 italic">{pkg.description}</p>
                    )}
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 flex-grow border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Tests Included:</h4>
                      <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">{pkg.testsIncluded}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleBookPackage(pkg.name)}
                      className="w-full py-3 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold rounded-xl transition-colors border border-teal-200 hover:border-teal-600"
                    >
                      Select Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Form */}
      <section id="booking-form" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-teal-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Form Side */}
            <div className="md:w-3/5 bg-white p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Book an Appointment</h2>
              <p className="text-gray-500 mb-8 text-sm">Fill details below and our team will contact you to confirm the time slot.</p>
              
              {submitted ? (
                <div className="text-center py-10 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent Successfully!</h3>
                  <p className="text-gray-600 mb-6">We have received your appointment request. We will call you shortly to confirm the details.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    Book another test
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        pattern="[0-9]{10}"
                        title="10 digit mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Test Required (or Package Name) *</label>
                    <input 
                      type="text" 
                      name="testRequired" 
                      required 
                      value={formData.testRequired}
                      onChange={handleChange}
                      placeholder="e.g. Complete Blood Count, Sugar test..."
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                    <input 
                      type="date" 
                      name="preferredDate" 
                      required 
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Collection Option</label>
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className={`border rounded-lg p-3 text-center transition-colors ${formData.collectionType === 'home' ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          <input type="radio" name="collectionType" value="home" checked={formData.collectionType === 'home'} onChange={handleChange} className="hidden" />
                          🏠 Home Collection
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <div className={`border rounded-lg p-3 text-center transition-colors ${formData.collectionType === 'lab' ? 'border-teal-500 bg-teal-50 text-teal-800 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          <input type="radio" name="collectionType" value="lab" checked={formData.collectionType === 'lab'} onChange={handleChange} className="hidden" />
                          🏥 Visit Lab
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors disabled:opacity-70 mt-4"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Confirm Appointment Request'}
                  </button>
                </form>
              )}
            </div>
            
            {/* Info Side */}
            <div className="md:w-2/5 p-8 md:p-10 text-teal-50 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-white mb-6">Why Choose Isha Care?</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 text-orange-400"><FiCheck /></div>
                  <p>Certified pathologists and experienced technicians</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 text-orange-400"><FiCheck /></div>
                  <p>Strict hygiene protocols for home collection</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 text-orange-400"><FiCheck /></div>
                  <p>Automated equipment for zero-error results</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 text-orange-400"><FiCheck /></div>
                  <p>Digital reports delivered via WhatsApp / Email</p>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 flex-shrink-0 text-orange-400"><FiCheck /></div>
                  <p>Affordable pricing with genuine discounts</p>
                </li>
              </ul>
              
              <div className="mt-auto pt-8">
                <p className="text-teal-200 text-sm mb-2">Need immediate assistance?</p>
                <p className="text-2xl font-bold text-white">{settings?.phone}</p>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
