'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signInUser, resetPassword, isAdminUser, signInWithGoogle } from '@/lib/auth';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (isAdminUser(user)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    const { user: loggedInUser, error } = await signInUser(email, password);
    setIsSubmitting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Logged in successfully!');
      if (isAdminUser(loggedInUser)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    const { user: loggedInUser, error } = await signInWithGoogle();
    setIsGoogleSubmitting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Logged in with Google successfully!');
      if (isAdminUser(loggedInUser)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    setIsResetting(true);
    const { error } = await resetPassword(email);
    setIsResetting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Password reset email sent! Check your inbox.');
    }
  };

  if (loading || user) return null; // Wait for redirect or loading

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <img
            className="mx-auto h-20 sm:h-24 w-auto"
            src="/logo.png"
            alt="ISHAMART"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-scale-in">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow bg-gray-50 focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
                >
                  {isResetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-70 transition-colors"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-70 transition-colors"
                >
                  <FcGoogle size={20} />
                  {isGoogleSubmitting ? 'Connecting...' : 'Google'}
                </button>
              </div>
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            For demo: Login as admin@ishamart.com / 12345678 to access Admin Panel
          </div>
        </div>
      </div>
    </div>
  );
}
