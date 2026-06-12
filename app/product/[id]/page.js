'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getProductById, getProductReviews, addReview, deleteReview } from '@/lib/firestore';
import { getDriveImageUrl, formatPrice, CATEGORIES, formatDateShort } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiShoppingCart, FiMinus, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetail({ params }) {
  // use() unwraps the Promise params in Next.js 15+ App Router
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [imgSrc, setImgSrc] = useState('/placeholder.png');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { product: pData, error: pError } = await getProductById(productId);
      
      if (pError || !pData) {
        toast.error('Product not found');
        router.push('/shop');
        return;
      }
      
      setProduct(pData);
      
      const rawUrls = pData.imageUrl || '';
      const parsedUrls = rawUrls.split(/[\s,]+/).filter(url => url.trim().length > 0);
      const urlsToUse = parsedUrls.length > 0 ? parsedUrls : ['/placeholder.png'];
      setImages(urlsToUse);
      setImgSrc(getDriveImageUrl(urlsToUse[0]));
      
      const { reviews: rData } = await getProductReviews(productId);
      setReviews(rData || []);
      
      setLoading(false);
    }
    loadData();
  }, [productId, router]);

  const isOutOfStock = product?.stock <= 0;
  const categoryInfo = product ? CATEGORIES.find(c => c.id === product.category) : null;

  const handleAddToCart = async (redirect = false) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsAddingToCart(true);
    const success = await addToCart(product, quantity);
    setIsAddingToCart(false);
    
    if (success && redirect) {
      router.push('/checkout');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }
    
    setSubmittingReview(true);
    const { id, error } = await addReview({
      productId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      rating: reviewRating,
      text: reviewText
    });
    
    setSubmittingReview(false);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Review submitted successfully!');
      setReviewText('');
      setReviewRating(5);
      // Reload reviews
      const { reviews: rData } = await getProductReviews(productId);
      setReviews(rData || []);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    
    const { error } = await deleteReview(reviewId);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return null;

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container mx-auto px-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-[var(--color-primary)]">Shop</Link>
          <span className="mx-2">/</span>
          {categoryInfo && (
            <>
              <Link href={`/shop?category=${categoryInfo.id}`} className="hover:text-[var(--color-primary)]">
                {categoryInfo.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-3xl p-6 md:p-12 border border-gray-100 flex items-center justify-center sticky top-24 aspect-square relative">
              <img 
                src={imgSrc} 
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300"
                onError={() => setImgSrc('/placeholder.png')}
              />
              {product.featured && (
                <div className="absolute top-6 left-6 bg-[var(--color-secondary)] text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                  Featured Product
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2 custom-scrollbar">
                {images.map((url, idx) => {
                  const driveUrl = getDriveImageUrl(url);
                  return (
                    <button 
                      key={idx}
                      onClick={() => setImgSrc(driveUrl)}
                      className={`w-20 h-20 rounded-xl border-2 flex-shrink-0 overflow-hidden bg-white transition-colors ${imgSrc === driveUrl ? 'border-[var(--color-primary)]' : 'border-gray-200 hover:border-[var(--color-primary)]'}`}
                    >
                      <img src={driveUrl} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover mix-blend-multiply p-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            {categoryInfo && (
              <div className="flex items-center gap-2 mb-4">
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200`}>
                    {categoryInfo.icon} {categoryInfo.name}
                 </span>
              </div>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar key={star} fill={star <= avgRating ? 'currentColor' : 'none'} className={star <= avgRating ? '' : 'text-gray-300'} />
                ))}
                <span className="text-gray-600 font-medium ml-2 text-sm">
                  {avgRating} ({reviews.length} reviews)
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className={isOutOfStock ? 'text-red-600 font-bold' : 'text-green-600 font-bold flex items-center gap-1.5'}>
                {isOutOfStock ? '❌ Out of Stock' : '✅ In Stock'}
              </div>
            </div>

            <div className="text-4xl lg:text-5xl font-bold text-[var(--color-secondary)] mb-8 tracking-tight">
              {formatPrice(product.price)}
            </div>

            <div className="prose prose-sm text-gray-600 mb-8 max-w-none leading-relaxed whitespace-pre-wrap">
              {product.description || 'No description available for this product.'}
            </div>

            {/* Actions */}
            <div className="mt-auto bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-3 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <FiMinus />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-3 text-gray-500 hover:text-[var(--color-primary)] hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <FiPlus />
                  </button>
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="text-red-500 text-sm font-medium animate-pulse">
                    Only {product.stock} left!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock || isAddingToCart}
                  className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-blue-50"
                >
                  <FiShoppingCart size={20} />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock || isAddingToCart}
                  className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--color-secondary)] to-orange-500 text-white hover:to-orange-600"
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-8 text-sm font-medium text-gray-500 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-2"><span className="text-xl">🚚</span> Free Delivery</div>
              <div className="flex items-center gap-2"><span className="text-xl">🛡️</span> Secure Payment</div>
              <div className="flex items-center gap-2"><span className="text-xl">✅</span> Quality Check</div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t border-gray-200 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            Customer Reviews
            <span className="bg-[var(--color-primary)] text-white text-sm px-3 py-1 rounded-full">{reviews.length}</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Review List */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.length === 0 ? (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
                  <p className="text-gray-500 font-medium">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-white flex items-center justify-center font-bold">
                          {review.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{review.userName}</div>
                          <div className="text-xs text-gray-500">{formatDateShort(review.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FiStar key={star} fill={star <= review.rating ? 'currentColor' : 'none'} size={14} className={star <= review.rating ? '' : 'text-gray-300'} />
                          ))}
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleDeleteReview(review.id)} className="text-red-400 hover:text-red-600 transition-colors p-1" title="Delete Review">
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write Review Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-fit sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Write a Review</h3>
              
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-600 mb-4">You must be logged in to write a review.</p>
                  <Link href="/login" className="inline-block bg-white border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-gray-800">
                    Login
                  </Link>
                </div>
              ) : (
                <form onSubmit={submitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1 text-yellow-400 text-2xl">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <FiStar fill={star <= reviewRating ? 'currentColor' : 'none'} className={star <= reviewRating ? '' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                      rows="4"
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you like or dislike about this product?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none text-sm"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
              <FiUser size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Please Login</h3>
            <p className="text-gray-500 mb-6">You need to be logged in to add items to your cart or purchase.</p>
            <div className="space-y-3">
              <Link href="/login" className="block w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold hover:bg-[var(--color-primary-light)] transition-colors">
                Login Now
              </Link>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="block w-full py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
