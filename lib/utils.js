// lib/utils.js

/**
 * Convert Google Drive share link to direct image URL
 * @param {string} url - Google Drive share link
 * @returns {string} Direct image URL or placeholder
 */
export function getDriveImageUrl(urlStr) {
  if (!urlStr) return '/placeholder.png';
  const firstUrl = urlStr.split(/[\s,]+/)[0];
  const match = firstUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return firstUrl;
}

/**
 * Format price in INR
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (!price && price !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Generate unique order ID
 * @returns {string} Order ID like ISH-XXXXXX
 */
export function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ISH-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format date to readable string
 * @param {*} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted date
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format date to short form
 * @param {*} timestamp - Firestore timestamp or Date
 * @returns {string} Short formatted date
 */
export function formatDateShort(timestamp) {
  if (!timestamp) return '';
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number (Indian)
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid phone
 */
export function isValidPhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone?.replace(/\s/g, ''));
}

/**
 * Get status color class
 * @param {string} status - Order status
 * @returns {object} Color classes
 */
export function getStatusColor(status) {
  const colors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    shipped: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  };
  return colors[status] || colors.pending;
}

/**
 * Get status display text
 * @param {string} status - Order status
 * @param {string} deliveryType - home or pickup
 * @returns {object} Status emoji and text
 */
export function getStatusDisplay(status, deliveryType = 'home') {
  const displays = {
    pending: { emoji: '🟡', label: 'Pending', desc: 'Waiting for confirmation call' },
    confirmed: { emoji: '🔵', label: 'Confirmed', desc: 'Order confirmed by our team' },
    shipped: {
      emoji: '🟠',
      label: deliveryType === 'pickup' ? 'Ready for Pickup' : 'Shipped',
      desc: deliveryType === 'pickup' ? 'Ready for collection' : 'Order on the way'
    },
    delivered: {
      emoji: '🟢',
      label: deliveryType === 'pickup' ? 'Collected' : 'Delivered',
      desc: deliveryType === 'pickup' ? 'Order collected' : 'Order delivered'
    },
    cancelled: { emoji: '🔴', label: 'Cancelled', desc: 'Order cancelled' },
  };
  return displays[status] || displays.pending;
}

/**
 * Categories list
 */
export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '📱', color: 'from-blue-500 to-blue-700' },
  { id: 'clothes', name: 'Clothes', icon: '👕', color: 'from-purple-500 to-purple-700' },
  { id: 'shoes', name: 'Shoes & Slippers', icon: '👟', color: 'from-green-500 to-green-700' },
  { id: 'solar', name: 'Solar Panels', icon: '☀️', color: 'from-yellow-500 to-orange-600' },
  { id: 'medicine', name: 'Medicine', icon: '💊', color: 'from-red-500 to-pink-600' },
  { id: 'house', name: 'Houses & Properties', icon: '🏠', color: 'from-orange-500 to-orange-700' },
  { id: 'plots', name: 'Plots & Land', icon: '🌍', color: 'from-teal-500 to-teal-700' },
];

/**
 * Order statuses
 */
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/**
 * All Rounder services
 */
export const ALLROUNDER_SERVICES = [
  { id: 'medical', name: 'Medical', icon: '🏥', desc: 'Medicine, Health Checkup, Consultation & More', color: '#e53935' },
  { id: 'electronic', name: 'Electronic', icon: '💻', desc: 'Mobiles, Accessories, Gadgets, Repairing & More', color: '#1e88e5' },
  { id: 'clothes', name: 'Clothes', icon: '👕', desc: 'Men, Women & Kids Wear, Trendy Collection & More', color: '#8e24aa' },
  { id: 'shoes', name: 'Shoes', icon: '👟', desc: 'Sports, Casual, Formal, Branded Collection & More', color: '#43a047' },
  { id: 'house', name: 'House', icon: '🏠', desc: 'Buy, Sell, Rent, Construction & Interior Solutions', color: '#fb8c00' },
  { id: 'plots', name: 'Plots', icon: '🌍', desc: 'Residential, Commercial, Investment Plots Available', color: '#00897b' },
  { id: 'cyberCafe', name: 'Cyber Cafe', icon: '💻', desc: 'Internet, Printing, Typing, Scanning, Online Forms & More', color: '#5e35b1' },
];
