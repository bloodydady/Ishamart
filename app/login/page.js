'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdminUser, signInWithGoogle } from '@/lib/auth';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, router]);

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    const { user: loggedInUser, error } = await signInWithGoogle();
    setIsGoogleSubmitting(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Logged in successfully!');
      // Redirection is now handled by the useEffect watching the `user` and `isAdmin` context
    }
  };

  if (loading || user) return null;

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
          Welcome to ISHAMART
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in or create an account to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-scale-in">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-70 transition-colors"
            >
              <FcGoogle size={24} />
              {isGoogleSubmitting ? 'Connecting securely...' : 'Continue with Google'}
            </button>
          </div>
          <div className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to Ishamart's Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
